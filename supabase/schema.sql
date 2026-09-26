-- Iron Log cloud schema. Paste into Supabase -> SQL Editor -> Run. Safe to re-run.

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- One row per user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  bio text not null default '',
  goal text not null default '',
  photo text not null default '',
  created_on text not null default '',
  updated_at timestamptz not null default now()
);

-- One row per logged workout (soft-deleted so deletes sync between devices)
create table if not exists public.workouts (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  date text not null,
  day text not null default '',
  blocks jsonb not null default '[]'::jsonb,
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists workouts_user_date on public.workouts (user_id, date desc);

-- Plans, schedules and settings, one JSON string per key
create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

drop trigger if exists touch_profiles on public.profiles;
create trigger touch_profiles before insert or update on public.profiles for each row execute function public.touch_updated_at();
drop trigger if exists touch_workouts on public.workouts;
create trigger touch_workouts before insert or update on public.workouts for each row execute function public.touch_updated_at();
drop trigger if exists touch_user_data on public.user_data;
create trigger touch_user_data before insert or update on public.user_data for each row execute function public.touch_updated_at();

-- Row-level security: each person can only see and change their own rows.
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.user_data enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "own workouts" on public.workouts;
create policy "own workouts" on public.workouts for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "own data" on public.user_data;
create policy "own data" on public.user_data for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
