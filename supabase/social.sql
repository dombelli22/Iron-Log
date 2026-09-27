-- Iron Log social layer: usernames, public/private accounts, follows, feed.
-- Run AFTER schema.sql (Supabase -> SQL Editor). Safe to re-run.

-- ---------------------------------------------------------------- profiles
alter table public.profiles
  add column if not exists username text,
  add column if not exists is_private boolean not null default true,
  add column if not exists share_workouts boolean not null default false,
  add column if not exists shared_since_date text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_username_format') then
    alter table public.profiles add constraint profiles_username_format
      check (username is null or username ~ '^[a-z0-9_]{3,20}$');
  end if;
end $$;
create unique index if not exists profiles_username_key on public.profiles (username);

-- Someone else's profile is readable only once its owner has picked a
-- username (i.e. joined the social side). Your own row is always readable.
drop policy if exists "social profiles readable" on public.profiles;
create policy "social profiles readable" on public.profiles for select to authenticated
  using (username is not null);

-- ------------------------------------------------------------------ follows
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followee_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);
create index if not exists follows_followee on public.follows (followee_id, status);

-- The server decides the status: following a private account is a request,
-- following a public one is instant. The client can't pick.
create or replace function public.follows_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare target record;
begin
  select username, is_private into target from public.profiles where id = new.followee_id;
  if not found or target.username is null then
    raise exception 'That account is not available to follow';
  end if;
  if not exists (select 1 from public.profiles where id = new.follower_id and username is not null) then
    raise exception 'Pick a username before following people';
  end if;
  new.status := case when target.is_private then 'pending' else 'accepted' end;
  return new;
end $$;
drop trigger if exists follows_insert on public.follows;
create trigger follows_insert before insert on public.follows for each row execute function public.follows_before_insert();

-- The only allowed edit: the followed person approving a pending request.
create or replace function public.follows_before_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.follower_id <> old.follower_id or new.followee_id <> old.followee_id or new.created_at <> old.created_at then
    raise exception 'Follows can only be approved, not edited';
  end if;
  if not (old.status = 'pending' and new.status = 'accepted' and (select auth.uid()) = old.followee_id) then
    raise exception 'Only the followed account can approve a request';
  end if;
  return new;
end $$;
drop trigger if exists follows_update on public.follows;
create trigger follows_update before update on public.follows for each row execute function public.follows_before_update();

-- Switching an account from private to public approves everyone waiting.
create or replace function public.profiles_after_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.is_private and not new.is_private then
    update public.follows set status = 'accepted' where followee_id = new.id and status = 'pending';
  end if;
  return new;
end $$;
drop trigger if exists profiles_after_update on public.profiles;
create trigger profiles_after_update after update of is_private on public.profiles for each row execute function public.profiles_after_update();

alter table public.follows enable row level security;
drop policy if exists "see my follows" on public.follows;
create policy "see my follows" on public.follows for select to authenticated
  using (follower_id = (select auth.uid()) or followee_id = (select auth.uid()));
drop policy if exists "follow as myself" on public.follows;
create policy "follow as myself" on public.follows for insert to authenticated
  with check (follower_id = (select auth.uid()));
drop policy if exists "approve my requests" on public.follows;
create policy "approve my requests" on public.follows for update to authenticated
  using (followee_id = (select auth.uid())) with check (followee_id = (select auth.uid()));
drop policy if exists "unfollow or remove follower" on public.follows;
create policy "unfollow or remove follower" on public.follows for delete to authenticated
  using (follower_id = (select auth.uid()) or followee_id = (select auth.uid()));

-- ---------------------------------------------------------- who sees workouts
-- You see a person's workouts if it's you, or they have a username and are
-- sharing, and the account is public or you're an approved follower.
create or replace function public.can_view_workouts(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select target = (select auth.uid()) or exists (
    select 1 from public.profiles p
    where p.id = target and p.username is not null and p.share_workouts
      and (not p.is_private or exists (
        select 1 from public.follows f
        where f.follower_id = (select auth.uid()) and f.followee_id = target and f.status = 'accepted'))
  )
$$;

drop policy if exists "view shared workouts" on public.workouts;
create policy "view shared workouts" on public.workouts for select to authenticated
  using (deleted_at is null and public.can_view_workouts(user_id));

-- Followers / following counts for a profile page (accepted follows only).
create or replace function public.follow_counts(target uuid) returns table (followers bigint, following bigint)
language sql stable security definer set search_path = '' as $$
  select (select count(*) from public.follows where followee_id = target and status = 'accepted'),
         (select count(*) from public.follows where follower_id = target and status = 'accepted')
  where exists (select 1 from public.profiles where id = target and (username is not null or id = (select auth.uid())))
$$;

-- Home feed: workouts from people I follow (approved), only ones dated on or
-- after the day they turned sharing on ("as they are posted"). Older workouts
-- are reachable only from that person's profile page. Newest first; page with
-- the last row's date and user_id||'|'||id.
-- (engagement.sql later redefines this to also return PR badges; re-run that one last.)
drop function if exists public.home_feed(int, text, text);
create function public.home_feed(p_limit int default 20, p_before_date text default null, p_before_key text default null)
returns table (user_id uuid, id text, date text, day text, blocks jsonb, updated_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select w.user_id, w.id, w.date, w.day, w.blocks, w.updated_at
  from public.workouts w
  join public.follows f on f.followee_id = w.user_id and f.follower_id = (select auth.uid()) and f.status = 'accepted'
  join public.profiles p on p.id = w.user_id
  where w.deleted_at is null and p.share_workouts and p.username is not null
    and w.date >= coalesce(p.shared_since_date, '9999')
    and (p_before_date is null or (w.date collate "C", (w.user_id::text || '|' || w.id) collate "C") < (p_before_date collate "C", p_before_key collate "C"))
  order by w.date collate "C" desc, (w.user_id::text || '|' || w.id) collate "C" desc
  limit least(greatest(p_limit, 1), 50)
$$;

revoke all on function public.can_view_workouts(uuid), public.follow_counts(uuid), public.home_feed(int, text, text) from public, anon;
grant execute on function public.can_view_workouts(uuid), public.follow_counts(uuid), public.home_feed(int, text, text) to authenticated;
