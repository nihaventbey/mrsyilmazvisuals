-- Explicit cover image per portfolio folder (category).
-- Separates "homepage featured" (portfolio_images.is_featured) from category card covers.

alter table public.categories
  add column if not exists cover_image_id uuid
    references public.portfolio_images (id)
    on delete set null;

create index if not exists categories_cover_image_idx
  on public.categories (cover_image_id);

-- Seed: prefer an already-featured image in that folder as the initial cover.
update public.categories c
set cover_image_id = sub.id
from (
  select distinct on (pi.category_id)
    pi.category_id,
    pi.id
  from public.portfolio_images pi
  where pi.image_path is not null
  order by
    pi.category_id,
    pi.is_featured desc,
    pi.sort_order asc,
    pi.created_at desc
) as sub
where c.id = sub.category_id
  and c.cover_image_id is null;
