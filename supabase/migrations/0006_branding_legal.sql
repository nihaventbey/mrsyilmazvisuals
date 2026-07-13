-- Branding split (logo vs about image) and photographer privacy policy seed

update public.site_settings
set value = value
  || jsonb_build_object(
    'logoImage', coalesce(value->>'logoImage', '/images/logo.svg'),
    'profileImage', coalesce(value->>'profileImage', '/images/melike-yilmaz.jpg')
  ),
  updated_at = now()
where key = 'general';

update public.site_settings
set value = value
  || jsonb_build_object(
    'aboutImage', coalesce(
      value->>'aboutImage',
      (select coalesce(g.value->>'profileImage', '/images/melike-yilmaz.jpg')
       from public.site_settings g where g.key = 'general' limit 1)
    )
  ),
  updated_at = now()
where key = 'about';

insert into public.site_settings (key, value) values
  ('legal', jsonb_build_object(
    'privacyUpdatedAt', '2026-07-13',
    'privacyIntro', 'Bu gizlilik politikası; web sitesi ziyaretleri, iletişim ve rezervasyon formları, çekim süreçleri ve teslim edilen fotoğraflar kapsamında kişisel verilerinizin nasıl işlendiğini açıklar.',
    'sections', jsonb_build_array(
      jsonb_build_object(
        'id', 'controller',
        'title', 'Veri Sorumlusu',
        'paragraphs', jsonb_build_array(
          '6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu, hizmeti sunan fotoğrafçıdır.',
          'İletişim talepleriniz için sitedeki form, e-posta veya Instagram kanalları kullanılabilir.'
        )
      ),
      jsonb_build_object(
        'id', 'photos',
        'title', 'Fotoğraf ve Görsel Hakları',
        'paragraphs', jsonb_build_array(
          'Çekim sonucunda üretilen fotoğrafların telif hakları fotoğrafçıya aittir; müşteriye kişisel kullanım için teslim edilen dosyalar sözleşmede belirtilen kapsamda kullanılabilir.',
          'Yenidoğan, bebek ve doğum çekimlerinde çocuğa ait görseller; aile onayı olmadan portfolyo veya tanıtım amaçlı kullanılmaz.',
          'Hastane doğum çekimlerinde kurum kuralları, hasta mahremiyeti ve sağlık personeli koordinasyonu önceliklidir.'
        )
      ),
      jsonb_build_object(
        'id', 'rights',
        'title', 'KVKK Kapsamındaki Haklarınız',
        'list', jsonb_build_array(
          'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
          'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
          'KVKK''da öngörülen şartlar altında silinmesini talep etme',
          'Açık rızaya dayalı işlemlerde rızayı geri çekme'
        ),
        'paragraphs', jsonb_build_array(
          'Haklarınızı kullanmak için iletişim kanallarımız üzerinden başvurabilirsiniz.'
        )
      )
    )
  ))
on conflict (key) do update
  set value = excluded.value, updated_at = now();
