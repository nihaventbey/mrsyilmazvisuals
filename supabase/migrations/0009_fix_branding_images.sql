-- Undo accidental logo paths stored as profile/about images

update public.site_settings
set value = jsonb_set(
  value,
  '{profileImage}',
  to_jsonb('/images/melike-yilmaz.jpg'::text),
  true
),
updated_at = now()
where key = 'general'
  and coalesce(value->>'profileImage', '') like 'logo/%';

update public.site_settings
set value = jsonb_set(
  value,
  '{aboutImage}',
  to_jsonb('/images/melike-yilmaz.jpg'::text),
  true
),
updated_at = now()
where key = 'about'
  and (
    coalesce(value->>'aboutImage', '') like 'logo/%'
    or coalesce(value->>'aboutImage', '') = ''
  );
