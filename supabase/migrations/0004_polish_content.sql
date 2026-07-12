-- Polish site copy and category descriptions for Melike Yılmaz

update public.categories set
  title = 'Doğum Fotoğrafçılığı',
  short = 'Hayatın başladığı an',
  description = 'Doğum öncesinde sizinle iletişim kurarak süreci birlikte planlıyorum. Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalı doğum fotoğrafçısı olarak, o ilk buluşmanın duygusunu saygıyla ve sabırla belgeliyorum.',
  sort_order = 1
where slug = 'dogum';

update public.categories set
  title = 'Hamile Çekimleri',
  short = 'Bekleyişin zarafeti',
  description = 'Annelik yolculuğunuzun en özel dönemini stüdyoda veya doğada, doğal ışık ve size özel konseptlerle ölümsüzleştiriyorum. Rahat ve samimi bir ortamda, zamansız kareler oluşturuyoruz.',
  sort_order = 2
where slug = 'hamile';

update public.categories set
  title = 'Bebek & Yenidoğan Çekimleri',
  short = 'İlk günlerin masumiyeti',
  description = 'Yenidoğan ve bebek çekimlerinde güvenlik ve konfor her şeyin önünde. Bebeğinizin ritmine uyarak, huzurlu ve samimi kareler yakalıyorum; aile bireyleri de kadrajda.',
  sort_order = 3
where slug = 'bebek';

update public.categories set
  title = 'Düğün Çekimleri',
  short = 'Sonsuza dair bir söz',
  description = 'Düğün gününüzün coşkusunu, detaylarını ve en içten anlarını hikâye anlatan karelerle ölümsüzleştiriyorum. Doğal ışık ve samimi pozlarla gününüzü zamansız kılıyorum.',
  sort_order = 4
where slug = 'dugun';

insert into public.site_settings (key, value) values
  ('general', jsonb_build_object(
    'name', 'Mrs. Yılmaz Visuals',
    'tagline', 'Anların en zarif hali',
    'description', 'Doğum, hamile, yenidoğan ve bebek çekimlerinde samimi ve güven veren bir deneyim sunuyorum. 2016''dan beri fotoğrafçılık yapıyor; 2019''dan itibaren doğum fotoğrafçılığına odaklanıyorum.',
    'author', 'Melike Yılmaz',
    'profileImage', '/images/melike-yilmaz.jpg',
    'url', 'https://mrsyilmazvisuals.com'
  )),
  ('contact', jsonb_build_object(
    'location', 'Üsküdar, İstanbul',
    'workingHours', 'Randevu ile — Instagram veya form üzerinden ulaşabilirsiniz',
    'instagramHandle', '@mrs.yilmaz.visuals',
    'instagramUrl', 'https://www.instagram.com/mrs.yilmaz.visuals/',
    'pageTitle', 'Hadi tanışalım',
    'pageDescription', 'Çekim planınız, sorularınız veya randevu talebiniz için formu doldurun ya da Instagram üzerinden doğrudan yazın. En kısa sürede dönüş yaparım.',
    'formNote', 'Formu doldurun; mesajınız bana ulaşsın. Daha hızlı iletişim için Instagram''dan da yazabilirsiniz.'
  )),
  ('about', jsonb_build_object(
    'pageDescription', 'Doğum, hamile, yenidoğan ve bebek çekimlerinde ailelerin en değerli anlarını samimi, rahat ve güven veren bir ortamda ölümsüzleştiriyorum.',
    'bioParagraphs', jsonb_build_array(
      'Ben Melike Yılmaz. 2016''dan beri profesyonel fotoğrafçılık yapıyorum; 2019''dan itibaren doğum, hamile, yenidoğan ve bebek çekimlerine odaklandım. Her çekimde önce sizinle tanışıyor, süreci birlikte planlıyor ve rahat hissetmenizi sağlıyorum.',
      'Doğum fotoğrafçılığında Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalıyım. Doğum öncesinde ailelerle iletişim kurmayı, herkesin hazır ve huzurlu olmasını önemsiyorum — çünkü en güzel kareler, güvende hissedildiğiniz anlarda doğar.',
      'Samimi, doğal ve poz vermekten çok gerçek duyguları yakalamayı seviyorum. Yıllar içinde birçok ailemle kalıcı dostluklar kurduk. Birlikte, yıllar sonra bile aynı duyguyu hissettirecek kareler yaratacağız.'
    ),
    'previewParagraphs', jsonb_build_array(
      '2016''dan beri fotoğrafçılık yapıyorum; 2019''dan itibaren doğum, hamile, yenidoğan ve bebek çekimlerine odaklandım. Çekim öncesinde iletişim kurmayı, samimi ve rahat bir ortam oluşturmayı önemsiyorum.',
      'Acıbadem, Medistate ve Hisar Intercontinental hastanelerinde sertifikalı doğum fotoğrafçısıyım. Amacım, yıllar sonra baktığınızda o günün duygusunu yeniden hissettirecek kareler bırakmak.'
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
    'servicesDescription', 'Doğumdan düğüne, bebekten hamileliğe — hikâyenizi anlatan zamansız kareler oluşturuyorum.',
    'ctaTitle', 'Anılarınızı birlikte ölümsüzleştirelim',
    'ctaDescription', 'Size özel bir çekim planlamak veya müsaitlik durumunu öğrenmek için hemen iletişime geçin.'
  ))
on conflict (key) do update
  set value = excluded.value, updated_at = now();

-- Ensure site storage bucket exists for profile photo uploads
insert into storage.buckets (id, name, public)
values ('site', 'site', true)
on conflict (id) do nothing;

do $$ begin
  create policy "site bucket is publicly readable"
    on storage.objects for select
    using (bucket_id = 'site');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "admins upload to site bucket"
    on storage.objects for insert
    to authenticated with check (bucket_id = 'site');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "admins update site objects"
    on storage.objects for update
    to authenticated using (bucket_id = 'site') with check (bucket_id = 'site');
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "admins delete site objects"
    on storage.objects for delete
    to authenticated using (bucket_id = 'site');
exception when duplicate_object then null;
end $$;
