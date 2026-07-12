-- Maintenance mode settings seed

insert into public.site_settings (key, value) values
  ('maintenance', jsonb_build_object(
    'enabled', false,
    'title', 'Kısa süreliğine bakımdayız',
    'message', 'Sitemizi sizin için yeniliyoruz. Çok yakında tekrar buradayız. Acil sorularınız için Instagram üzerinden bize ulaşabilirsiniz.'
  ))
on conflict (key) do nothing;
