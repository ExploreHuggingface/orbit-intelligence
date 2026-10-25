-- ============================================================================
-- ORBIT Intelligence — Supabase schema (plan §7).
-- Mirrors the local SQLite schema in lib/db/index.ts. Tables, enums, RLS and
-- the profile-creation trigger. Apply with: supabase db push
-- ============================================================================

-- ── Enums ────────────────────────────────────────────────────────────────────

create type category as enum ('real_estate', 'watches', 'cars_parts', 'electronics', 'home_living');
create type opportunity_status as enum ('new', 'shortlisted', 'under_review', 'dismissed', 'purchased', 'completed');
create type monitor_sensitivity as enum ('broad', 'balanced', 'strict');
create type monitor_status as enum ('active', 'paused');
create type notification_type as enum ('price_drop', 'new_match', 'availability', 'monitor_update');
create type plan_code as enum ('free', 'pro', 'scale');

-- ── Core identity ───────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  timezone text not null default 'Europe/Berlin',
  onboarded_at timestamptz,
  onboarding_step int not null default 0,
  interests text not null default '[]',
  created_at timestamptz not null default now()
);

create table plans (
  code plan_code primary key,
  name text not null,
  monitor_limit int not null,
  collection_limit int not null,
  comparison_limit int not null,
  price_monthly_eur numeric not null default 0,
  refresh_label text not null,
  features jsonb not null default '[]'
);

create table subscriptions (
  user_id uuid primary key references profiles (id) on delete cascade,
  plan_code plan_code not null references plans (code),
  status text not null default 'active',
  current_period_end date not null
);

-- ── Opportunity data ─────────────────────────────────────────────────────────

create table opportunities (
  id text primary key,
  user_id uuid references profiles (id) on delete cascade, -- NULL = global seed row
  title text not null,
  description text not null default '',
  category category not null,
  image_url text,
  source_marketplace text not null,
  source_url text not null,
  current_price numeric not null,
  currency text not null default 'EUR',
  previous_price numeric,
  estimated_market_value numeric,
  price_change_pct numeric,
  deal_score int not null default 0,
  match_score int not null default 0,
  status opportunity_status not null default 'new',
  discovered_at timestamptz not null,
  last_checked_at timestamptz not null,
  is_sample boolean not null default false,
  is_interesting boolean not null default false,
  attributes jsonb not null default '{}',
  real_estate jsonb,
  evidence_links text[] not null default '{}'
);
create index idx_opp_user_status on opportunities (user_id, status);
create index idx_opp_category on opportunities (category);

create table price_history (
  id bigserial primary key,
  opportunity_id text not null references opportunities (id) on delete cascade,
  date date not null,
  price numeric not null
);
create index idx_history_opp on price_history (opportunity_id);

-- ── Monitoring ───────────────────────────────────────────────────────────────

create table monitors (
  id text primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  description text not null,
  category category not null,
  criteria jsonb not null default '{}',
  sensitivity monitor_sensitivity not null default 'balanced',
  frequency_minutes int not null default 30,
  notify_in_app boolean not null default true,
  notify_email boolean not null default false,
  digest_mode boolean not null default false,
  price_drop_only boolean not null default false,
  status monitor_status not null default 'active',
  match_count int not null default 0,
  last_checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table collections (
  id text primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table collection_items (
  collection_id text not null references collections (id) on delete cascade,
  opportunity_id text not null references opportunities (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, opportunity_id)
);

create table comparisons (
  id text primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  opportunity_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ── System ───────────────────────────────────────────────────────────────────

create table notifications (
  id text primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null default '',
  opportunity_id text references opportunities (id) on delete set null,
  monitor_id text references monitors (id) on delete set null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notif_user on notifications (user_id, is_read);

create table activity_events (
  id text primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table searches (
  id bigserial primary key,
  user_id uuid not null references profiles (id) on delete cascade,
  query text not null,
  category category,
  created_at timestamptz not null default now()
);

create table contact_messages (
  id text primary key,
  name text not null,
  email text not null,
  company text,
  topic text not null default 'support',
  kind text not null default 'contact',
  message text not null,
  created_at timestamptz not null default now()
);

create table video_reviews (
  id text primary key,
  user_id uuid references profiles (id) on delete cascade,
  title text not null,
  source text not null,
  source_url text not null,
  duration text not null,
  opportunity_id text,
  category category not null,
  is_sample boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Row-level security (plan §7) ─────────────────────────────────────────────

alter table profiles enable row level security;
alter table plans enable row level security;
alter table subscriptions enable row level security;
alter table opportunities enable row level security;
alter table price_history enable row level security;
alter table monitors enable row level security;
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table comparisons enable row level security;
alter table notifications enable row level security;
alter table activity_events enable row level security;
alter table searches enable row level security;
alter table contact_messages enable row level security;
alter table video_reviews enable row level security;

create policy "profiles are self-owned" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "plans are readable by everyone" on plans for select using (true);

create policy "subscriptions are owner-readable" on subscriptions for select using (auth.uid() = user_id);
-- writes reserved for the service role (future Stripe webhook)

create policy "opportunities readable" on opportunities for select
  using (user_id is null or user_id = auth.uid());
create policy "opportunities owner-writable" on opportunities for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "price_history readable with its opportunity" on price_history for select
  using (exists (select 1 from opportunities o where o.id = opportunity_id and (o.user_id is null or o.user_id = auth.uid())));

create policy "monitors are owner-only" on monitors for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "collections are owner-only" on collections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "collection_items owner via collection" on collection_items for all
  using (exists (select 1 from collections c where c.id = collection_id and c.user_id = auth.uid()))
  with check (exists (select 1 from collections c where c.id = collection_id and c.user_id = auth.uid()));

create policy "comparisons are owner-only" on comparisons for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notifications are owner-only" on notifications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "activity is owner-only" on activity_events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "searches are owner-only" on searches for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- contact_messages: public insert only, no anon reads
create policy "anyone can contact us" on contact_messages for insert to anon, authenticated with check (true);

create policy "video reviews readable" on video_reviews for select using (user_id is null or user_id = auth.uid());

-- ── Triggers ─────────────────────────────────────────────────────────────────

-- Profile row on signup (plan §9)
create or replace function on_auth_user_created() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan_code, current_period_end)
  values (new.id, 'free', current_date + 30)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure on_auth_user_created();
