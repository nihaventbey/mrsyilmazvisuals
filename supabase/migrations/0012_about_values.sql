-- Update about.values with Melike's current brand principles

update public.site_settings
set value = jsonb_set(
  value,
  '{values}',
  '[
    {
      "title": "Doğallık",
      "text": "Her karede yapaylıktan uzak, gerçek duyguları yakalamayı önemsiyorum."
    },
    {
      "title": "Samimiyet",
      "text": "Çekim boyunca kendinizi rahat hissetmeniz benim için en önemli öncelik."
    },
    {
      "title": "Zamansızlık",
      "text": "Modası geçmeyen, yıllar sonra da aynı değeri taşıyan fotoğraflar üretiyorum."
    },
    {
      "title": "Güven",
      "text": "En özel anlarınızı büyük bir özen ve profesyonellikle kayıt altına alıyorum."
    },
    {
      "title": "Kalite",
      "text": "Çekimden teslimata kadar her aşamada yüksek kalite standartlarıyla çalışıyorum."
    },
    {
      "title": "Hatıra",
      "text": "Fotoğrafların yalnızca bugünü değil, gelecek nesillere aktarılacak anıları da koruduğuna inanıyorum."
    }
  ]'::jsonb,
  true
),
updated_at = now()
where key = 'about';
