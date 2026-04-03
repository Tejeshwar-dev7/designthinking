create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid null,
  avatar_url text null,
  created_at timestamptz null default now(),
  department text null,
  email text not null unique,
  full_name text not null,
  phone text null,
  role text null default 'student',
  student_id text null
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz null default now(),
  department text null,
  instructor_id uuid null references public.profiles(id) on delete set null,
  name text not null,
  schedule text null
);

create table if not exists public.face_embeddings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz null default now(),
  descriptor float8[] not null,
  model_version text null,
  profile_id uuid null references public.profiles(id) on delete cascade,
  snapshot_count int null default 1,
  updated_at timestamptz null default now()
);

create table if not exists public.attendance_logs (
  id uuid primary key default gen_random_uuid(),
  class_id uuid null references public.classes(id) on delete set null,
  confidence_score float8 null,
  marked_at timestamptz null default now(),
  profile_id uuid null references public.profiles(id) on delete cascade,
  session_id text null,
  status text null default 'present'
);

create table if not exists public.notification_queue (
  id uuid primary key default gen_random_uuid(),
  channel text null,
  payload jsonb null,
  profile_id uuid null references public.profiles(id) on delete cascade,
  scheduled_at timestamptz null,
  sent_at timestamptz null,
  status text null,
  type text null
);

create index if not exists attendance_logs_session_id_idx on public.attendance_logs(session_id);
create index if not exists attendance_logs_profile_id_idx on public.attendance_logs(profile_id);
create index if not exists face_embeddings_profile_id_idx on public.face_embeddings(profile_id);

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.face_embeddings enable row level security;
alter table public.attendance_logs enable row level security;
alter table public.notification_queue enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_authenticated'
  ) then
    create policy profiles_select_authenticated on public.profiles
      for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'classes' and policyname = 'classes_select_authenticated'
  ) then
    create policy classes_select_authenticated on public.classes
      for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'attendance_logs' and policyname = 'attendance_logs_select_authenticated'
  ) then
    create policy attendance_logs_select_authenticated on public.attendance_logs
      for select to authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'face_embeddings' and policyname = 'face_embeddings_select_authenticated'
  ) then
    create policy face_embeddings_select_authenticated on public.face_embeddings
      for select to authenticated using (true);
  end if;
end $$;
