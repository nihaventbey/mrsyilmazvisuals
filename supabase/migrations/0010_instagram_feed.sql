-- Instagram feed settings for homepage footer section

insert into public.site_settings (key, value)
values (
  'instagram',
  jsonb_build_object(
    'enabled', false,
    'source', 'graph',
    'postLimit', 6,
    'eyebrow', 'Instagram',
    'title', 'Son paylaşımlar',
    'posts', '[]'::jsonb
  )
)
on conflict (key) do nothing;
