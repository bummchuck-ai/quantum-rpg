-- Profiles table for user subscription and usage tracking
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'standard', 'premium')),
  stripe_subscription_id text,
  daily_requests_used integer not null default 0,
  daily_reset_at timestamptz not null default now(),
  credits integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transactions table for payment history
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('subscription', 'credit_purchase')),
  amount_cents integer not null,
  credits_added integer,
  stripe_session_id text unique,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;

-- Profiles: users can read their own profile
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = user_id);

-- Profiles: users can update their own profile (limited fields via API)
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Transactions: users can read their own transactions
create policy "Users can read own transactions" on public.transactions
  for select using (auth.uid() = user_id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RPC: atomically add credits (used by webhook)
create or replace function public.add_credits(p_user_id uuid, p_amount integer)
returns void as $$
begin
  update public.profiles
  set credits = credits + p_amount, updated_at = now()
  where user_id = p_user_id;
end;
$$ language plpgsql security definer;

-- RPC: use one request (daily or credit), returns true if allowed
create or replace function public.use_request(p_user_id uuid, p_daily_limit integer)
returns boolean as $$
declare
  v_profile public.profiles%rowtype;
begin
  select * into v_profile from public.profiles where user_id = p_user_id for update;
  if not found then return false; end if;

  -- Reset daily counter if past reset time
  if now() > v_profile.daily_reset_at then
    v_profile.daily_requests_used := 0;
    v_profile.daily_reset_at := date_trunc('day', now() + interval '1 day');
  end if;

  -- Try daily quota first
  if v_profile.daily_requests_used < p_daily_limit then
    update public.profiles
    set daily_requests_used = v_profile.daily_requests_used + 1,
        daily_reset_at = v_profile.daily_reset_at,
        updated_at = now()
    where user_id = p_user_id;
    return true;
  end if;

  -- Try credits
  if v_profile.credits > 0 then
    update public.profiles
    set credits = credits - 1, updated_at = now()
    where user_id = p_user_id;
    return true;
  end if;

  return false;
end;
$$ language plpgsql security definer;

-- Index for fast lookups
create index if not exists idx_profiles_stripe_customer on public.profiles(stripe_customer_id);
create index if not exists idx_transactions_user on public.transactions(user_id);
