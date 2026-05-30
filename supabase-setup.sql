-- Timebox 앱 Supabase 설정 (Google 로그인 / Supabase Auth 기반)
-- Supabase 대시보드 > SQL Editor에서 실행하세요.
-- 데이터는 로그인한 사용자(auth.users)의 UUID로 묶이고, RLS로 본인 것만 접근 가능합니다.

-- 1. 프로필 (사용자별 제목/부제)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  title text default '',
  subtitle text default '',
  created_at timestamptz not null default now()
);

-- 2. 타임박스 일별 데이터
create table if not exists public.timebox_days (
  user_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  day_data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

create index if not exists idx_timebox_days_user on public.timebox_days (user_id);

-- 3. RLS 활성화
alter table public.profiles enable row level security;
alter table public.timebox_days enable row level security;

-- 4. 정책 — 본인 데이터만 (select/insert/update/delete)
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own days" on public.timebox_days;
create policy "own days" on public.timebox_days
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. 신규 가입 시 profiles 행 자동 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
