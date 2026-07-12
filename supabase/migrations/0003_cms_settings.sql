-- CMS: category short labels, site settings seed, site storage bucket

alter table public.categories
  add column if not exists short text not null default '';

update public.categories set short = case slug
  when 'dogum' then 'Hayatın başladığı an'
  when 'hamile' then 'Bekleyişin zarafeti'
  when 'bebek' then 'İlk günlerin masumiyeti'
  when 'dugun' then 'Sonsuza dair bir söz'
  else short
end
where short = '';

insert into public.site_settings (key, value) values
  ('general', jsonb_build_object(
    'name', 'Mrs. Yılmaz Visuals',
    'tagline', 'Anların en zarif hali',
    'description', '2016''dan beri fotoğrafçılık yapan Melike Yılmaz; 2019''dan itibaren doğum, hamile, yenidoğan ve bebek çekimlerine odaklanıyor. Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalı doğum fotoğrafçısı.',
    'author', 'Melike Yılmaz',
    'profileImage', '/images/melike-yilmaz.jpg',
    'url', 'https://mrsyilmazvisuals.com'
  )),
  ('contact', jsonb_build_object(
    'location', 'Üsküdar, İstanbul',
    'workingHours', 'Randevu ile — Instagram üzerinden ulaşabilirsiniz',
    'instagramHandle', '@mrs.yilmaz.visuals',
    'instagramUrl', 'https://www.instagram.com/mrs.yilmaz.visuals/',
    'pageTitle', 'Hadi tanışalım',
    'pageDescription', 'Aklınızdaki proje, sorularınız veya randevu talebiniz için formu doldurabilir ya da Instagram üzerinden doğrudan bana ulaşabilirsiniz.',
    'formNote', 'Formu doldurun, en kısa sürede size geri dönüş yapayım. Hızlı iletişim için Instagram üzerinden de yazabilirsiniz.'
  )),
  ('about', jsonb_build_object(
    'pageDescription', 'Doğum, hamile, yenidoğan ve bebek çekimlerinde ailelerin en değerli anlarını samimi, rahat ve güven veren bir ortamda ölümsüzleştiriyorum.',
    'bioParagraphs', jsonb_build_array(
      'Ben Melike Yılmaz. 2016''dan beri profesyonel fotoğrafçılık yapıyorum; 2019''dan itibaren doğum, hamile, yenidoğan ve bebek çekimlerine odaklandım. Instagram''da @mrs.yilmaz.visuals hesabımdan çalışmalarımı paylaşıyorum.',
      'Doğum fotoğrafçılığında Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalıyım. Çekim öncesinde ailelerle iletişim kurmayı, süreci birlikte planlamayı ve herkesin kendini güvende hissetmesini önemsiyorum.',
      'Samimi, rahat ve doğal çekimler yapmayı seviyorum. Yıllar içinde birçok ailemle sadece bir çekim değil, kalıcı dostluklar kurduk. Birlikte, yıllar sonra bile aynı duyguyu hissettirecek kareler yaratacağız.'
    ),
    'previewParagraphs', jsonb_build_array(
      '2016''dan beri fotoğrafçılık yapıyorum; 2019''dan itibaren doğum, hamile, yenidoğan ve bebek çekimlerine odaklandım. Çekim öncesinde ailelerle iletişim kurmayı, samimi ve rahat bir ortam oluşturmayı önemsiyorum — birçok ailemle yıllar içinde gerçek dostluklar kurduk.',
      'Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalı doğum fotoğrafçısıyım. Amacım yıllar sonra baktığınızda o günün duygusunu yeniden hissettirecek kareler bırakmak.'
    ),
    'timeline', jsonb_build_array(
      jsonb_build_object('year', '2016', 'title', 'Profesyonel fotoğrafçılık', 'text', 'Fotoğrafçılık tutkusunu profesyonel bir kariyere dönüştürdüm.'),
      jsonb_build_object('year', '2019', 'title', 'Doğum fotoğrafçılığı', 'text', 'Doğum, hamile ve yenidoğan çekimlerine odaklanarak bu alanda uzmanlaştım.'),
      jsonb_build_object('year', '2021', 'title', 'Hastane sertifikasyonları', 'text', 'Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalı doğum fotoğrafçısı oldum.'),
      jsonb_build_object('year', '2024', 'title', 'Mrs. Yılmaz Visuals', 'text', 'Samimi ve güven veren çekim anlayışıyla yüzlerce aileye eşlik ettim; birçok ailemle kalıcı dostluklar kurduk.')
    ),
    'values', jsonb_build_array(
      jsonb_build_object('title', 'Samimiyet', 'text', 'Poz vermekten çok, gerçek duyguları ve doğal anları yakalamayı severim. Çekimlerimizde rahat hissetmeniz benim için en önemli şey.'),
      jsonb_build_object('title', 'İletişim', 'text', 'Özellikle doğum çekimlerinde, çekim öncesinde ailelerle detaylı iletişim kurarak herkesin hazır ve huzurlu olmasını sağlarım.'),
      jsonb_build_object('title', 'Güven', 'text', 'Hastane doğumlarında sertifikalı deneyimimle, bebek ve yenidoğan çekimlerinde ise güvenlik ve konforu her şeyin önünde tutarım.')
    )
  )),
  ('home', jsonb_build_object(
    'servicesEyebrow', 'Hizmetler',
    'servicesTitle', 'Her an için özel bir dokunuş',
    'servicesDescription', 'Uzmanlaştığım dört alanda, hikâyenizi anlatan zamansız kareler oluşturuyorum.',
    'ctaTitle', 'Anılarınızı birlikte ölümsüzleştirelim',
    'ctaDescription', 'Size özel bir çekim planlamak ve müsaitlik durumunu öğrenmek için hemen iletişime geçin.'
  ))
on conflict (key) do update
  set value = excluded.value, updated_at = now();

insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do nothing;

create policy "site bucket is publicly readable"
  on storage.objects for select
  using (bucket_id = 'site');

create policy "admins upload to site bucket"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'site');

create policy "admins update site objects"
  on storage.objects for update
  to authenticated using (bucket_id = 'site') with check (bucket_id = 'site');

create policy "admins delete site objects"
  on storage.objects for delete
  to authenticated using (bucket_id = 'site');
