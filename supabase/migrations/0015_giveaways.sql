-- Giveaway results (manual winners / backups by Instagram username)

create table public.giveaways (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  draw_date date not null,
  description text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index giveaways_published_draw_date_idx
  on public.giveaways (published, draw_date desc);

alter table public.giveaways enable row level security;

create policy "published giveaways are viewable by everyone"
  on public.giveaways for select
  using (published or (select auth.role()) = 'authenticated');

create policy "admins manage giveaways"
  on public.giveaways for all
  to authenticated using (true) with check (true);

create table public.giveaway_entrants (
  id uuid primary key default gen_random_uuid(),
  giveaway_id uuid not null references public.giveaways (id) on delete cascade,
  role text not null check (role in ('winner', 'backup')),
  username text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index giveaway_entrants_giveaway_idx
  on public.giveaway_entrants (giveaway_id, role, sort_order);

alter table public.giveaway_entrants enable row level security;

create policy "giveaway entrants viewable with parent"
  on public.giveaway_entrants for select
  using (
    exists (
      select 1 from public.giveaways g
      where g.id = giveaway_id
        and (g.published or (select auth.role()) = 'authenticated')
    )
  );

create policy "admins manage giveaway entrants"
  on public.giveaway_entrants for all
  to authenticated using (true) with check (true);
