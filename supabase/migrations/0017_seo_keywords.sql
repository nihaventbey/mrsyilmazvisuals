-- SEO target keywords + homepage "çekim türleri" section copy

insert into public.site_settings (key, value)
values (
  'seo',
  jsonb_build_object(
    'sectionEyebrow', 'Çekim türleri',
    'sectionTitle', 'Aradığınız anlar',
    'sectionDescription', 'Konseptli bebek, 1 yaş doğum günü, smash cake ve hastane odası doğum çekimleri dahil; aradığınız her özel anı samimi ve zarif karelerle ölümsüzleştiriyorum.',
    'keywords', jsonb_build_array(
      'Konseptli Bebek Çekimi',
      '1 Yaş Doğum Günü Fotoğrafçısı',
      'Smash Cake (Pasta Patlatma) Çekimi',
      'Hastane Odası Doğum Fotoğrafçısı',
      'doğum fotoğrafçısı',
      'bebek fotoğrafçısı',
      'çocuk fotoğrafçısı',
      'hamile çekimi',
      'yenidoğan çekimi',
      'düğün fotoğrafçısı',
      'Ankara Gölbaşı fotoğraf çekimi',
      'Gölbaşı bebek fotoğrafçısı',
      'Gölbaşı düğün fotoğrafçısı',
      'Ankara doğum fotoğrafçısı',
      'İstanbul doğum fotoğrafçısı',
      'İstanbul bebek fotoğrafçısı',
      'Üsküdar fotoğrafçı',
      'Mrs Yılmaz Visuals'
    )
  )
)
on conflict (key) do update
set value = coalesce(public.site_settings.value, '{}'::jsonb)
  || jsonb_build_object(
    'sectionEyebrow', coalesce(
      public.site_settings.value->>'sectionEyebrow',
      excluded.value->>'sectionEyebrow'
    ),
    'sectionTitle', coalesce(
      public.site_settings.value->>'sectionTitle',
      excluded.value->>'sectionTitle'
    ),
    'sectionDescription', coalesce(
      public.site_settings.value->>'sectionDescription',
      excluded.value->>'sectionDescription'
    ),
    'keywords', coalesce(
      public.site_settings.value->'keywords',
      excluded.value->'keywords'
    )
  ),
  updated_at = now();
