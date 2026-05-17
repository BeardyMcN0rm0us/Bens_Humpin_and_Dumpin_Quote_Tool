-- ═══════════════════════════════════════════════════════════════
--  Ben's Humpin' & Dumpin' — Supabase database setup
--  Run this once in the Supabase SQL Editor (paste → Run)
-- ═══════════════════════════════════════════════════════════════

-- 1. Main records table (quotes + bookings)
create table if not exists public.records (
  id           text        primary key,
  user_id      uuid        not null references auth.users(id) on delete cascade,
  record_type  text        not null default 'quote',
  job_type     text,
  job_label    text,
  total        text,
  breakdown    jsonb,
  status       text        not null default 'saved',
  address      text,
  addr_pickup  text,
  addr_drop    text,
  notes        text,
  quote_id     text,
  name         text,
  phone        text,
  email        text,
  when_iso     timestamptz,
  suggested_iso  timestamptz,
  suggested_note text,
  decided_at   timestamptz,
  received_at  timestamptz,
  ben_notes    text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2. Admins table (just Ben)
create table if not exists public.admins (
  user_id    uuid        primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3. Enable Row Level Security
alter table public.records enable row level security;
alter table public.admins  enable row level security;

-- 4. RLS policies

-- Customers: full access to their own records only
create policy "customers_own_records" on public.records
  for all
  using      (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins: read ALL records (across all customers)
create policy "admins_read_all" on public.records
  for select
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Admins: update any record (confirm / decline / suggest)
create policy "admins_update_all" on public.records
  for update
  using (exists (select 1 from public.admins where user_id = auth.uid()));

-- Admins: can read their own row (so the app can verify admin status)
create policy "admins_self_read" on public.admins
  for select
  using (auth.uid() = user_id);

-- First-time setup: the very first account to sign in can claim admin.
-- Once one admin exists this policy never fires again.
create policy "first_admin_claim" on public.admins
  for insert
  with check (
    auth.uid() = user_id
    and not exists (select 1 from public.admins)
  );

-- 5. Auto-update updated_at on every row change
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger records_touch_updated_at
  before update on public.records
  for each row execute function public.touch_updated_at();
