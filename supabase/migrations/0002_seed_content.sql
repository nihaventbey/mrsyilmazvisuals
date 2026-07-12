-- Seed initial content matching the previous file-based site content.

insert into public.categories (slug, title, description, sort_order) values
  ('bebek', 'Bebek Çekimleri', 'Yenidoğan ve bebeklerin masum, huzurlu anlarını sıcacık karelerle ölümsüzleştiriyorum.', 1),
  ('dogum', 'Doğum Fotoğrafçılığı', 'Hayatın başladığı o eşsiz anı, ilk buluşmanın yoğun duygusunu saygıyla belgeliyorum.', 2),
  ('hamile', 'Hamile Çekimleri', 'Bekleyişin zarafetini; zarif ışık, doğal pozlar ve size özel konseptlerle yansıtıyorum.', 3),
  ('dugun', 'Düğün Çekimleri', 'Düğün gününüzün coşkusunu ve zarafetini hikâye anlatan zamansız karelerle yakalıyorum.', 4);

with cat as (select id, slug from public.categories)
insert into public.portfolio_images (category_id, caption, orientation, is_featured, sort_order)
select cat.id, v.caption, v.orientation, v.is_featured, v.sort_order
from cat
join (values
  ('bebek', 'İlk uyku', 'portrait', true, 1),
  ('bebek', 'Minik eller', 'landscape', true, 2),
  ('bebek', 'Huzur', 'portrait', false, 3),
  ('bebek', 'Anne kucağı', 'landscape', false, 4),
  ('bebek', 'İlk gülümseme', 'portrait', false, 5),
  ('bebek', 'Yumuşacık', 'portrait', false, 6),
  ('bebek', 'Meraklı bakışlar', 'landscape', false, 7),
  ('bebek', 'Tatlı rüyalar', 'portrait', false, 8),
  ('dogum', 'İlk nefes', 'landscape', true, 1),
  ('dogum', 'İlk buluşma', 'portrait', true, 2),
  ('dogum', 'Gözyaşları', 'landscape', false, 3),
  ('dogum', 'Ten teması', 'portrait', false, 4),
  ('dogum', 'Yeni bir aile', 'landscape', false, 5),
  ('dogum', 'İlk dokunuş', 'portrait', false, 6),
  ('dogum', 'Sonsuz sevgi', 'landscape', false, 7),
  ('dogum', 'Hoş geldin', 'portrait', false, 8),
  ('hamile', 'Bekleyiş', 'portrait', true, 1),
  ('hamile', 'Zarafet', 'portrait', true, 2),
  ('hamile', 'Doğa içinde', 'landscape', false, 3),
  ('hamile', 'İki kalp', 'portrait', false, 4),
  ('hamile', 'Altın saat', 'landscape', false, 5),
  ('hamile', 'Sükunet', 'portrait', false, 6),
  ('hamile', 'Anne olmak', 'portrait', false, 7),
  ('hamile', 'Işık ve gölge', 'landscape', false, 8),
  ('dugun', 'İlk dans', 'landscape', true, 1),
  ('dugun', 'Söz', 'portrait', true, 2),
  ('dugun', 'Gelin hazırlığı', 'portrait', false, 3),
  ('dugun', 'Mutluluk', 'landscape', false, 4),
  ('dugun', 'El ele', 'portrait', false, 5),
  ('dugun', 'Kutlama', 'landscape', false, 6),
  ('dugun', 'Zarafet', 'portrait', false, 7),
  ('dugun', 'Sonsuza dek', 'landscape', false, 8)
) as v(slug, caption, orientation, is_featured, sort_order)
  on v.slug = cat.slug;

insert into public.packages (name, price, summary, features, highlight, sort_order) values
  ('Mini', '4.500 ₺', 'Kısa ve öz bir çekim deneyimi',
   array['30 dakikalık çekim', '1 lokasyon / stüdyo', '15 profesyonel düzenlenmiş fotoğraf', 'Online galeri ile teslim', 'Yüksek çözünürlüklü dijital arşiv'],
   false, 1),
  ('Standart', '7.500 ₺', 'En çok tercih edilen kapsamlı paket',
   array['90 dakikalık çekim', '2 lokasyon veya konsept', '40 profesyonel düzenlenmiş fotoğraf', 'Kıyafet ve aksesuar danışmanlığı', 'Online galeri + dijital arşiv', '10 adet baskı hediyesi'],
   true, 2),
  ('Premium', '12.000 ₺', 'Sınırsız yaratıcılık ve ayrıcalık',
   array['Yarım günlük çekim', 'Sınırsız lokasyon ve konsept', '80+ profesyonel düzenlenmiş fotoğraf', 'Profesyonel makyaj ve saç danışmanlığı', 'Özel tasarım fotoğraf albümü', 'Online galeri + dijital arşiv', 'Aile bireyleri dahil çekim'],
   false, 3);

insert into public.faq_items (question, answer, sort_order) values
  ('Çekim için ne kadar önceden randevu almalıyım?', 'Yenidoğan çekimleri için tahmini doğum tarihinizden birkaç hafta önce, düğün çekimleri içinse en az 2-3 ay önceden iletişime geçmenizi öneririm. Özel günlerde takvim hızla dolabiliyor.', 1),
  ('Fotoğrafları ne zaman teslim alırım?', 'Düzenlenmiş fotoğraflarınızı çekimden sonra ortalama 10-14 iş günü içinde online galeri aracılığıyla teslim ediyorum. Acil teslim seçeneği için lütfen iletişime geçin.', 2),
  ('Çekim stüdyoda mı yoksa dışarıda mı yapılıyor?', 'Her ikisi de mümkün. Stüdyo çekimlerinde ışık ve konsept tamamen kontrol altındayken, açık hava çekimleri doğal ve samimi kareler sunar. Paketinize göre birlikte karar veririz.', 3),
  ('Paketleri özelleştirebilir miyim?', 'Kesinlikle. Her aile ve her an biriciktir. İhtiyaçlarınıza göre çekim süresini, fotoğraf sayısını ve ek hizmetleri birlikte planlayabiliriz.', 4),
  ('Kapora ve ödeme nasıl işliyor?', 'Rezervasyonu kesinleştirmek için toplam ücretin %30''u kapora olarak alınır. Kalan tutar çekim gününde veya öncesinde tamamlanır.', 5);

insert into public.blog_posts (slug, title, excerpt, content, category, published, published_at) values
  ('hamile-cekimi-hazirlik', 'Hamile Çekimi İçin Hazırlık Rehberi',
   'Hamilelik çekiminizden en iyi sonucu almak için zamanlama, kıyafet ve poz seçiminde dikkat etmeniz gereken her şey.',
   E'Hamilelik, hayatın en özel dönemlerinden biri. Bu eşsiz zamanı zarif karelerle ölümsüzleştirmek isterseniz, birkaç küçük hazırlık çekiminizin kalitesini büyük ölçüde artırır.\n\n## Doğru zamanlama\n\nHamile çekimleri için ideal dönem genellikle **28. ve 34. haftalar** arasıdır. Bu dönemde karın belirginleşir ancak henüz çok fazla yorgunluk hissetmezsiniz. İkiz bekleyen anneler için bu aralığı birkaç hafta öne çekmenizi öneririm.\n\n## Kıyafet seçimi\n\n- Vücudu saran, akışkan kumaşlar karnınızı zarifçe ortaya çıkarır.\n- Sade ve pastel tonlar zamansız bir görünüm sağlar.\n- Uzun tüllü elbiseler hareket ve zarafet katar.\n- Eşinizle uyumlu ama birebir aynı olmayan tonları tercih edin.\n\n## Çekim öncesi öneriler\n\nÇekimden bir gün önce iyi dinlenin ve bol su için. Cildinizin dinlenmiş görünmesi karelerinize doğrudan yansır. Makyajı doğal tutmak, yıllar sonra baktığınızda zamansız bir görüntü bırakır.\n\n## Rahatlayın ve keyfini çıkarın\n\nEn güzel kareler, en rahat olduğunuz anlarda ortaya çıkar. Pozları birlikte, adım adım çalışırız; sizin tek yapmanız gereken bu özel dönemin tadını çıkarmak.',
   'Hamile', true, '2026-06-18T09:00:00+03'),
  ('yenidogan-cekimi-ipuclari', 'Yenidoğan Çekiminde Konfor ve Güvenlik',
   'Bebeğinizin ilk günlerini güvenle ve huzurla belgelemek için bilmeniz gereken temel noktalar.',
   E'Yenidoğan çekimleri sabır, deneyim ve her şeyden önce güven ister. Bebeğinizin ilk günlerini ölümsüzleştirirken önceliğim her zaman onun konforu ve güvenliğidir.\n\n## İlk iki hafta ideal\n\nYenidoğanlar **doğumdan sonraki ilk 5-14 gün** içinde en çok uyur ve o meşhur "kıvrılmış" pozları en rahat bu dönemde verir. Bu nedenle çekim planını doğumdan önce yapmak en sağlıklısıdır.\n\n## Sıcak ve sakin bir ortam\n\nÇekim sırasında oda sıcaklığını yüksek tutarız, çünkü bebekler sıcak ortamlarda daha huzurlu uyur. Yumuşak müzik ve loş ışık, sakin bir atmosfer oluşturur.\n\n## Beslenme ve mola\n\n- Çekimden hemen önce bebeğinizi doyurun.\n- Aralarda beslenme ve sakinleşme molaları veririz.\n- Acele yok; bebeğin ritmine göre ilerleriz.\n\n## Aile de kadrajda\n\nYenidoğan çekimleri sadece bebekle sınırlı değildir. Anne, baba ve varsa kardeşlerle birlikte çekilen kareler, bu yeni başlangıcın en değerli hatıraları arasında yer alır.\n\nBebeğinizle tanışmaya ve bu güzel anıları birlikte oluşturmaya şimdiden çok heyecanlıyım.',
   'Bebek', true, '2026-05-30T09:00:00+03'),
  ('dugun-fotografciligi-rehberi', 'Düğün Fotoğrafçılığı: Unutulmaz Bir Gün İçin Rehber',
   'Düğün gününüzün her anını stressiz ve doğal karelerle yaşatmak için planlama önerileri.',
   E'Düğün günü hızlı akıp gider; göz açıp kapayana kadar biter. İşte tam da bu yüzden o anları doğru şekilde belgelemek çok kıymetlidir. İyi bir planlama, hem gününüzün akışını rahatlatır hem de fotoğrafların kalitesini yükseltir.\n\n## Zaman çizelgesi oluşturun\n\nHazırlık, tören, çekim ve kutlama için gerçekçi bir zaman çizelgesi hazırlamak günün en büyük stres kaynağını ortadan kaldırır. Birlikte, her an için yeterli süre ayrıldığından emin oluruz.\n\n## Altın saatin gücü\n\nGün batımından hemen önceki **altın saat**, düğün çekimleri için büyülü bir ışık sunar. Mümkünse çift çekimlerini bu zaman dilimine denk getirmenizi öneririm.\n\n## Doğal anları yakalamak\n\nEn değerli kareler çoğu zaman poz verilmeyen anlardan doğar:\n\n- Gelinin hazırlanırken annesiyle paylaştığı bakış.\n- Damadın gelini ilk gördüğü an.\n- Dans pistindeki içten kahkahalar.\n\n## Detayları unutmayın\n\nYüzükler, davetiyeler, çiçekler ve mekân dekorasyonu; hepsi hikâyenizin bir parçası. Bu detayları da özenle kadrajıma alırım.\n\nHayatınızın bu en özel gününde yanınızda olmaktan ve anılarınızı zamansız karelerle saklamaktan mutluluk duyarım.',
   'Düğün', true, '2026-05-12T09:00:00+03');

insert into public.site_settings (key, value) values
  ('profile', jsonb_build_object(
    'author', 'Melike Yılmaz',
    'name', 'Mrs. Yılmaz Visuals',
    'instagram', 'https://www.instagram.com/mrs.yilmaz.visuals/',
    'instagramHandle', '@mrs.yilmaz.visuals',
    'location', 'Üsküdar, İstanbul',
    'profileImage', '/images/melike-yilmaz.jpg'
  ))
on conflict (key) do update set value = excluded.value, updated_at = now();
