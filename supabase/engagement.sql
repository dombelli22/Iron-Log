-- Iron Log engagement layer: likes, comments, notifications, PR badges.
-- Run AFTER schema.sql, social.sql and safety.sql. Safe to re-run.

-- ------------------------------------------------------------------ PR badges
-- The client fills this in when it syncs a workout (top personal records).
alter table public.workouts add column if not exists prs jsonb not null default '[]'::jsonb;
alter table public.reports add column if not exists target_comment_id uuid;

-- A workout that still exists (not soft-deleted). Definer so it works for
-- likers/commenters who can't read the row directly under RLS.
create or replace function public.workout_is_live(o uuid, w text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.workouts where user_id = o and id = w and deleted_at is null)
$$;

-- -------------------------------------------------------------------- likes
create table if not exists public.likes (
  workout_owner uuid not null,
  workout_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (workout_owner, workout_id, user_id),
  foreign key (workout_owner, workout_id) references public.workouts (user_id, id) on delete cascade
);
create index if not exists likes_user on public.likes (user_id);
alter table public.likes enable row level security;
drop policy if exists "see likes on visible workouts" on public.likes;
create policy "see likes on visible workouts" on public.likes for select to authenticated
  using (public.can_view_workouts(workout_owner) and not public.is_blocked_between(user_id, (select auth.uid())));
drop policy if exists "like a visible workout" on public.likes;
create policy "like a visible workout" on public.likes for insert to authenticated
  with check (user_id = (select auth.uid()) and public.can_view_workouts(workout_owner) and public.workout_is_live(workout_owner, workout_id));
drop policy if exists "unlike" on public.likes;
create policy "unlike" on public.likes for delete to authenticated using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------- comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  workout_owner uuid not null,
  workout_id text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 300),
  created_at timestamptz not null default now(),
  foreign key (workout_owner, workout_id) references public.workouts (user_id, id) on delete cascade
);
create index if not exists comments_post on public.comments (workout_owner, workout_id, created_at);
alter table public.comments enable row level security;
drop policy if exists "see comments on visible workouts" on public.comments;
create policy "see comments on visible workouts" on public.comments for select to authenticated
  using (public.can_view_workouts(workout_owner) and not public.is_blocked_between(author_id, (select auth.uid())));
drop policy if exists "comment on a visible workout" on public.comments;
create policy "comment on a visible workout" on public.comments for insert to authenticated
  with check (author_id = (select auth.uid()) and public.can_view_workouts(workout_owner) and public.workout_is_live(workout_owner, workout_id));
-- Delete your own comment, or any comment on your own workout. No editing.
drop policy if exists "delete comment" on public.comments;
create policy "delete comment" on public.comments for delete to authenticated
  using (author_id = (select auth.uid()) or workout_owner = (select auth.uid()));

-- ------------------------------------------------------------ notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,   -- recipient
  actor_id uuid not null references auth.users(id) on delete cascade,  -- who did it
  type text not null check (type in ('follow', 'request', 'request_accepted', 'like', 'comment')),
  workout_id text,
  comment_id uuid,
  body text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_user on public.notifications (user_id, created_at desc);
alter table public.notifications enable row level security;
-- Recipients read, mark read, and clear their own. Rows are created only by
-- the triggers below, never by clients.
drop policy if exists "read my notifications" on public.notifications;
create policy "read my notifications" on public.notifications for select to authenticated
  using (user_id = (select auth.uid()) and not public.is_blocked_between(actor_id, (select auth.uid())));
drop policy if exists "mark my notifications read" on public.notifications;
create policy "mark my notifications read" on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
drop policy if exists "clear my notifications" on public.notifications;
create policy "clear my notifications" on public.notifications for delete to authenticated using (user_id = (select auth.uid()));

-- Follows -> notifications
create or replace function public.notify_follow_insert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.followee_id, new.follower_id, case when new.status = 'pending' then 'request' else 'follow' end);
  return new;
end $$;
drop trigger if exists follows_notify_insert on public.follows;
create trigger follows_notify_insert after insert on public.follows for each row execute function public.notify_follow_insert();

create or replace function public.notify_follow_update() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if old.status = 'pending' and new.status = 'accepted' then
    delete from public.notifications where user_id = new.followee_id and actor_id = new.follower_id and type = 'request';
    insert into public.notifications (user_id, actor_id, type) values (new.followee_id, new.follower_id, 'follow');
    insert into public.notifications (user_id, actor_id, type) values (new.follower_id, new.followee_id, 'request_accepted');
  end if;
  return new;
end $$;
drop trigger if exists follows_notify_update on public.follows;
create trigger follows_notify_update after update on public.follows for each row execute function public.notify_follow_update();

-- Unfollowing / declining / removing takes the pending notification with it.
create or replace function public.notify_follow_delete() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.notifications where user_id = old.followee_id and actor_id = old.follower_id and type in ('follow', 'request');
  delete from public.notifications where user_id = old.follower_id and actor_id = old.followee_id and type = 'request_accepted';
  return old;
end $$;
drop trigger if exists follows_notify_delete on public.follows;
create trigger follows_notify_delete after delete on public.follows for each row execute function public.notify_follow_delete();

-- Likes -> notification to the workout's owner (never to yourself). Like,
-- unlike, like again doesn't pile up: the old one is replaced.
create or replace function public.notify_like() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.user_id <> new.workout_owner then
    delete from public.notifications where user_id = new.workout_owner and actor_id = new.user_id and type = 'like' and workout_id = new.workout_id;
    insert into public.notifications (user_id, actor_id, type, workout_id) values (new.workout_owner, new.user_id, 'like', new.workout_id);
  end if;
  return new;
end $$;
drop trigger if exists likes_notify on public.likes;
create trigger likes_notify after insert on public.likes for each row execute function public.notify_like();

create or replace function public.unnotify_like() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.notifications where user_id = old.workout_owner and actor_id = old.user_id and type = 'like' and workout_id = old.workout_id;
  return old;
end $$;
drop trigger if exists likes_unnotify on public.likes;
create trigger likes_unnotify after delete on public.likes for each row execute function public.unnotify_like();

-- Comments -> notification to the owner, with a short preview.
create or replace function public.notify_comment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.author_id <> new.workout_owner then
    insert into public.notifications (user_id, actor_id, type, workout_id, comment_id, body)
    values (new.workout_owner, new.author_id, 'comment', new.workout_id, new.id, left(new.body, 80));
  end if;
  return new;
end $$;
drop trigger if exists comments_notify on public.comments;
create trigger comments_notify after insert on public.comments for each row execute function public.notify_comment();

create or replace function public.unnotify_comment() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.notifications where comment_id = old.id;
  return old;
end $$;
drop trigger if exists comments_unnotify on public.comments;
create trigger comments_unnotify after delete on public.comments for each row execute function public.unnotify_comment();

-- ---------------------------------------------------- counts for a page of posts
-- p_keys: [{"owner": "<uuid>", "id": "<workout id>"}, ...]. Runs as the caller,
-- so counts only include likes/comments they're allowed to see.
create or replace function public.post_engagement(p_keys jsonb)
returns table (workout_owner uuid, workout_id text, like_count bigint, comment_count bigint, liked_by_me boolean)
language sql stable security invoker set search_path = '' as $$
  select k.owner, k.id,
    (select count(*) from public.likes l where l.workout_owner = k.owner and l.workout_id = k.id),
    (select count(*) from public.comments c where c.workout_owner = k.owner and c.workout_id = k.id),
    exists (select 1 from public.likes l where l.workout_owner = k.owner and l.workout_id = k.id and l.user_id = (select auth.uid()))
  from jsonb_to_recordset(p_keys) as k(owner uuid, id text)
$$;

-- Home feed again, now carrying each workout's PR badges. (Return type changed,
-- so it has to be dropped first.)
drop function if exists public.home_feed(int, text, text);
create function public.home_feed(p_limit int default 20, p_before_date text default null, p_before_key text default null)
returns table (user_id uuid, id text, date text, day text, blocks jsonb, updated_at timestamptz, prs jsonb)
language sql stable security invoker set search_path = '' as $$
  select w.user_id, w.id, w.date, w.day, w.blocks, w.updated_at, w.prs
  from public.workouts w
  join public.follows f on f.followee_id = w.user_id and f.follower_id = (select auth.uid()) and f.status = 'accepted'
  join public.profiles p on p.id = w.user_id
  where w.deleted_at is null and p.share_workouts and p.username is not null
    and w.date >= coalesce(p.shared_since_date, '9999')
    and (p_before_date is null or (w.date collate "C", (w.user_id::text || '|' || w.id) collate "C") < (p_before_date collate "C", p_before_key collate "C"))
  order by w.date collate "C" desc, (w.user_id::text || '|' || w.id) collate "C" desc
  limit least(greatest(p_limit, 1), 50)
$$;

revoke all on function public.workout_is_live(uuid, text), public.post_engagement(jsonb), public.home_feed(int, text, text) from public, anon;
grant execute on function public.workout_is_live(uuid, text), public.post_engagement(jsonb), public.home_feed(int, text, text) to authenticated;
