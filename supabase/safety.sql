-- Iron Log safety layer: blocking, reports, delete-my-account.
-- Run AFTER schema.sql and social.sql (Supabase -> SQL Editor). Safe to re-run.

-- ------------------------------------------------------------------- blocks
create table if not exists public.blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.blocks enable row level security;
-- You can only see and manage your own blocks; the other person can't tell.
drop policy if exists "see my blocks" on public.blocks;
create policy "see my blocks" on public.blocks for select to authenticated using (blocker_id = (select auth.uid()));
drop policy if exists "block someone" on public.blocks;
create policy "block someone" on public.blocks for insert to authenticated with check (blocker_id = (select auth.uid()));
drop policy if exists "unblock someone" on public.blocks;
create policy "unblock someone" on public.blocks for delete to authenticated using (blocker_id = (select auth.uid()));

-- Either direction of a block cuts them off from each other.
create or replace function public.is_blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.blocks where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a))
$$;
-- True if the profile's owner has blocked me (used to hide them from me).
create or replace function public.blocked_by(owner uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.blocks where blocker_id = owner and blocked_id = (select auth.uid()))
$$;

-- Blocking removes any follow between the two, in both directions.
create or replace function public.blocks_after_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.follows
   where (follower_id = new.blocker_id and followee_id = new.blocked_id)
      or (follower_id = new.blocked_id and followee_id = new.blocker_id);
  return new;
end $$;
drop trigger if exists blocks_insert on public.blocks;
create trigger blocks_insert after insert on public.blocks for each row execute function public.blocks_after_insert();

-- A person who blocked you disappears from your view.
drop policy if exists "social profiles readable" on public.profiles;
create policy "social profiles readable" on public.profiles for select to authenticated
  using (username is not null and not public.blocked_by(id));

-- No following across a block.
create or replace function public.follows_before_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
declare target record;
begin
  select username, is_private into target from public.profiles where id = new.followee_id;
  if not found or target.username is null or public.is_blocked_between(new.follower_id, new.followee_id) then
    raise exception 'That account is not available to follow';
  end if;
  if not exists (select 1 from public.profiles where id = new.follower_id and username is not null) then
    raise exception 'Pick a username before following people';
  end if;
  new.status := case when target.is_private then 'pending' else 'accepted' end;
  return new;
end $$;

-- No seeing workouts across a block (feed and profile pages both go through this).
create or replace function public.can_view_workouts(target uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select target = (select auth.uid()) or (
    not public.is_blocked_between(target, (select auth.uid())) and exists (
      select 1 from public.profiles p
      where p.id = target and p.username is not null and p.share_workouts
        and (not p.is_private or exists (
          select 1 from public.follows f
          where f.follower_id = (select auth.uid()) and f.followee_id = target and f.status = 'accepted'))
    )
  )
$$;

-- ------------------------------------------------------------------ reports
-- Write-only for users. You (the project owner) read them in the Table Editor.
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  target_workout_id text,
  reason text not null check (reason in ('spam', 'harassment', 'inappropriate', 'impersonation', 'other')),
  details text not null default '' check (char_length(details) <= 500),
  created_at timestamptz not null default now(),
  check (reporter_id <> target_user_id)
);
create index if not exists reports_created on public.reports (created_at desc);
alter table public.reports enable row level security;
drop policy if exists "file a report" on public.reports;
create policy "file a report" on public.reports for insert to authenticated with check (reporter_id = (select auth.uid()));
drop policy if exists "see my reports" on public.reports;
create policy "see my reports" on public.reports for select to authenticated using (reporter_id = (select auth.uid()));

-- ----------------------------------------------------------- delete account
-- Removes the signed-in user's auth account; every table above references
-- auth.users with ON DELETE CASCADE, so their profile, workouts, settings,
-- follows, blocks and reports go with it.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Not signed in'; end if;
  delete from auth.users where id = (select auth.uid());
end $$;

revoke all on function public.is_blocked_between(uuid, uuid), public.blocked_by(uuid), public.delete_my_account() from public, anon;
grant execute on function public.is_blocked_between(uuid, uuid), public.blocked_by(uuid), public.delete_my_account() to authenticated;
