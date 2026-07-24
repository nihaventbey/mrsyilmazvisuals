-- Track last-modified time on portfolio images so the admin can sort by
-- the most recent action (upload, edit, feature toggle, move, reorder).

alter table public.portfolio_images
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_portfolio_image_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolio_images_set_updated_at on public.portfolio_images;
create trigger portfolio_images_set_updated_at
  before update on public.portfolio_images
  for each row
  execute function public.set_portfolio_image_updated_at();
