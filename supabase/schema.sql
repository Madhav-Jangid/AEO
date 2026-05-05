create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free' check (plan in ('free','premium')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('amazon','flipkart','meesho')),
  store_url text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_stores_user_id on public.stores(user_id);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  image text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_products_store_id on public.products(store_id);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  query text not null,
  results_json jsonb not null,
  score numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_analyses_product_id on public.analyses(product_id);
create index if not exists idx_analyses_created_at on public.analyses(created_at desc);

create table if not exists public.usage_tracking (
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null,
  daily_analysis_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.users enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.analyses enable row level security;
alter table public.usage_tracking enable row level security;

create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);

create policy "stores_all_own" on public.stores
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "products_all_own" on public.products
for all
using (
  exists (select 1 from public.stores s where s.id = store_id and s.user_id = auth.uid())
)
with check (
  exists (select 1 from public.stores s where s.id = store_id and s.user_id = auth.uid())
);

create policy "analyses_all_own" on public.analyses
for all
using (
  exists (
    select 1 from public.products p
    join public.stores s on s.id = p.store_id
    where p.id = product_id and s.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.products p
    join public.stores s on s.id = p.store_id
    where p.id = product_id and s.user_id = auth.uid()
  )
);

create policy "usage_all_own" on public.usage_tracking
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── AEO Diagnostic: scans table ─────────────────────────────────────────────
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  query text not null,
  brand_name text not null,
  gpt_response text,
  claude_response text,
  gemini_response text,
  score_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_scans_user_id on public.scans(user_id);
create index if not exists idx_scans_created_at on public.scans(created_at desc);

alter table public.scans enable row level security;
create policy "scans_all_own" on public.scans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
