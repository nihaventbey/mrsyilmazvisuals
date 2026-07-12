-- Mrs Yılmaz Visuals — initial schema
-- Content tables are publicly readable; writes require an authenticated admin.
-- Form tables (bookings, contact_messages) accept anonymous inserts only.

-- ============================= categories ==============================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories are viewable by everyone"
  on public.categories for select using (true);

create policy "admins manage categories"
  on public.categories for all
  to authenticated using (true) with check (true);

-- ========================== portfolio_images ===========================
create table public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  caption text not null default '',
  image_path text, -- storage path inside the 'portfolio' bucket; null = placeholder
  orientation text not null default 'portrait' check (orientation in ('portrait', 'landscape')),
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index portfolio_images_category_idx on public.portfolio_images (category_id, sort_order);

alter table public.portfolio_images enable row level security;

create policy "portfolio images are viewable by everyone"
  on public.portfolio_images for select using (true);

create policy "admins manage portfolio images"
  on public.portfolio_images for all
  to authenticated using (true) with check (true);

-- ============================= blog_posts ==============================
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'Genel',
  cover_path text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_published_idx on public.blog_posts (published, published_at desc);

alter table public.blog_posts enable row level security;

create policy "published posts are viewable by everyone"
  on public.blog_posts for select
  using (published or (select auth.role()) = 'authenticated');

create policy "admins manage blog posts"
  on public.blog_posts for all
  to authenticated using (true) with check (true);

-- ============================== packages ===============================
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text not null,
  summary text not null default '',
  features text[] not null default '{}',
  highlight boolean not null default false,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.packages enable row level security;

create policy "packages are viewable by everyone"
  on public.packages for select using (true);

create policy "admins manage packages"
  on public.packages for all
  to authenticated using (true) with check (true);

-- ============================== faq_items ==============================
create table public.faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.faq_items enable row level security;

create policy "faq items are viewable by everyone"
  on public.faq_items for select using (true);

create policy "admins manage faq items"
  on public.faq_items for all
  to authenticated using (true) with check (true);

-- ============================== bookings ===============================
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  shoot_type text not null check (shoot_type in ('bebek', 'dogum', 'hamile', 'dugun')),
  preferred_date date not null,
  location text not null default '',
  notes text not null default '',
  status text not null default 'new' check (status in ('new', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index bookings_status_idx on public.bookings (status, created_at desc);

alter table public.bookings enable row level security;

create policy "anyone can create a booking"
  on public.bookings for insert
  to anon, authenticated with check (true);

create policy "admins read bookings"
  on public.bookings for select
  to authenticated using (true);

create policy "admins update bookings"
  on public.bookings for update
  to authenticated using (true) with check (true);

create policy "admins delete bookings"
  on public.bookings for delete
  to authenticated using (true);

-- ========================== contact_messages ===========================
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "anyone can send a message"
  on public.contact_messages for insert
  to anon, authenticated with check (true);

create policy "admins read messages"
  on public.contact_messages for select
  to authenticated using (true);

create policy "admins update messages"
  on public.contact_messages for update
  to authenticated using (true) with check (true);

create policy "admins delete messages"
  on public.contact_messages for delete
  to authenticated using (true);

-- ============================ site_settings ============================
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

create policy "settings are viewable by everyone"
  on public.site_settings for select using (true);

create policy "admins manage settings"
  on public.site_settings for all
  to authenticated using (true) with check (true);

-- ============================== storage ================================
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "portfolio bucket is publicly readable"
  on storage.objects for select
  using (bucket_id = 'portfolio');

create policy "admins upload to portfolio bucket"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'portfolio');

create policy "admins update portfolio objects"
  on storage.objects for update
  to authenticated using (bucket_id = 'portfolio') with check (bucket_id = 'portfolio');

create policy "admins delete portfolio objects"
  on storage.objects for delete
  to authenticated using (bucket_id = 'portfolio');
