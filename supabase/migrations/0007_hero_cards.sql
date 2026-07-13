-- Hero polaroid cards for homepage scroll animation

insert into public.site_settings (key, value)
select
  'hero',
  jsonb_build_object(
    'cards',
    jsonb_agg(
      jsonb_build_object(
        'id', 'default-' || ordinality::text,
        'caption', caption,
        'image', '',
        'palette', to_jsonb(palette),
        'enabled', true
      )
      order by ordinality
    )
  )
from (
  values
    (1, 'İlk uyku', array['#f0e2cc', '#c9a468', '#8f6f42']::text[]),
    (2, 'Bekleyiş', array['#f3e9d8', '#d4b98c', '#a08050']::text[]),
    (3, 'Söz', array['#ecdcc4', '#bf9d68', '#7d5f38']::text[]),
    (4, 'İlk dans', array['#f5ecdc', '#dcc49a', '#ab8b5a']::text[]),
    (5, 'Minik eller', array['#eee0c8', '#c4a06a', '#856640']::text[]),
    (6, 'Zarafet', array['#f2e6d0', '#d0b184', '#96774a']::text[]),
    (7, 'Altın saat', array['#ead9c0', '#ba9660', '#755a36']::text[]),
    (8, 'Gelin hazırlığı', array['#f0e2cc', '#c9a468', '#8f6f42']::text[]),
    (9, 'İlk nefes', array['#f3e9d8', '#d4b98c', '#a08050']::text[]),
    (10, 'Anne olmak', array['#ecdcc4', '#bf9d68', '#7d5f38']::text[]),
    (11, 'Mutluluk', array['#f5ecdc', '#dcc49a', '#ab8b5a']::text[]),
    (12, 'Sonsuz sevgi', array['#eee0c8', '#c4a06a', '#856640']::text[]),
    (13, 'Huzur', array['#f2e6d0', '#d0b184', '#96774a']::text[]),
    (14, 'El ele', array['#ead9c0', '#ba9660', '#755a36']::text[])
) as seed(ordinality, caption, palette)
on conflict (key) do nothing;
