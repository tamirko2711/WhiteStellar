-- ============================================================
-- Migration: AI Pre-Screen Agent tables
-- ============================================================

-- Store pre-screen conversations and scores
create table public.prescreen_sessions (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.sessions(id) on delete cascade,
  advisor_id integer references public.advisors(id),
  client_id uuid references public.profiles(id),
  conversation jsonb default '[]',
  intent_score text check (intent_score in ('high', 'medium', 'low')) default null,
  score_reasoning text,
  recommended_opening text,
  handoff_triggered boolean default false,
  handoff_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.prescreen_sessions enable row level security;

create policy "Advisors can view own prescreen sessions"
  on public.prescreen_sessions for select
  using (
    advisor_id in (
      select id from public.advisors where user_id = auth.uid()
    )
  );

create policy "System can insert prescreen sessions"
  on public.prescreen_sessions for insert
  with check (auth.uid() = client_id);

create policy "System can update prescreen sessions"
  on public.prescreen_sessions for update
  using (auth.uid() = client_id);

-- Add prescreen settings to advisors table
alter table public.advisors
  add column if not exists prescreen_enabled boolean default false,
  add column if not exists prescreen_session_range integer default 1
    check (prescreen_session_range between 1 and 3);

-- Track session count per advisor-client pair
create table public.advisor_client_sessions (
  advisor_id integer references public.advisors(id),
  client_id uuid references public.profiles(id),
  session_count integer default 0,
  first_session_at timestamptz default now(),
  last_session_at timestamptz default now(),
  primary key (advisor_id, client_id)
);

alter table public.advisor_client_sessions enable row level security;

create policy "Advisors can view own client session counts"
  on public.advisor_client_sessions for select
  using (
    advisor_id in (
      select id from public.advisors where user_id = auth.uid()
    )
  );
