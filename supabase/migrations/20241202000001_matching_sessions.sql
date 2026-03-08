-- ============================================================
-- Migration: AI Client Matching Agent table
-- ============================================================

create table public.matching_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  session_token text unique default gen_random_uuid()::text,
  conversation jsonb default '[]',
  guided_answers jsonb default '{}',
  recommended_advisor_ids integer[],
  match_reasoning text,
  converted boolean default false,
  created_at timestamptz default now()
);

alter table public.matching_sessions enable row level security;

create policy "Anyone can create matching session"
  on public.matching_sessions for insert with check (true);

create policy "Users can view own matching sessions"
  on public.matching_sessions for select
  using (user_id = auth.uid() or user_id is null);

create policy "Anyone can update own session by token"
  on public.matching_sessions for update
  using (true);
