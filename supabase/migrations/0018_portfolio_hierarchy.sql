-- Portfolio hierarchy + remove maternity (hamile) + free shoot_type slugs

-- 1) parent_id for nested categories
alter table public.categories
  add column if not exists parent_id uuid references public.categories (id) on delete cascade;

create index if not exists categories_parent_sort_idx
  on public.categories (parent_id, sort_order);

-- Prevent a category from being its own parent
alter table public.categories
  drop constraint if exists categories_parent_not_self;

alter table public.categories
  add constraint categories_parent_not_self
  check (parent_id is null or parent_id <> id);

-- 2) Retarget hamile bookings before deleting the category
update public.bookings
set shoot_type = 'bebek'
where shoot_type = 'hamile';

-- 3) Drop fixed shoot_type check (allow any portfolio category slug)
alter table public.bookings
  drop constraint if exists bookings_shoot_type_check;

-- 4) Remove maternity portfolio + blog (cascade images with category)
delete from public.blog_posts where slug = 'hamile-cekimi-hazirlik';
delete from public.categories where slug = 'hamile';

-- 5) Ensure etkinlik top-level category exists
insert into public.categories (slug, title, short, description, sort_order, parent_id)
values (
  'etkinlik',
  'Etkinlik',
  'Anların sahnesi',
  'Konser, organizasyon ve özel etkinlik çekimlerinden seçilmiş kareler.',
  40,
  null
)
on conflict (slug) do nothing;

-- 6) Strip hamile from SEO keywords if present
update public.site_settings
set
  value = jsonb_set(
    value,
    '{keywords}',
    coalesce(
      (
        select jsonb_agg(elem)
        from jsonb_array_elements_text(coalesce(value->'keywords', '[]'::jsonb)) as elem
        where lower(elem) <> 'hamile çekimi'
      ),
      '[]'::jsonb
    ),
    true
  ),
  updated_at = now()
where key = 'seo'
  and value ? 'keywords';
