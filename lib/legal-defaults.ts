export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalSettings = {
  privacyUpdatedAt: string;
  privacyIntro: string;
  sections: LegalSection[];
};

export const defaultLegalSettings: LegalSettings = {
  privacyUpdatedAt: "2026-07-13",
  privacyIntro:
    "Bu gizlilik politikası; web sitesi ziyaretleri, iletişim ve rezervasyon formları, çekim süreçleri ve teslim edilen fotoğraflar kapsamında kişisel verilerinizin nasıl işlendiğini açıklar.",
  sections: [
    {
      id: "controller",
      title: "Veri Sorumlusu",
      paragraphs: [
        "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri sorumlusu, hizmeti sunan fotoğrafçıdır.",
        "İletişim talepleriniz için sitedeki form, e-posta veya Instagram kanalları kullanılabilir.",
      ],
    },
    {
      id: "collected",
      title: "Toplanan Kişisel Veriler",
      list: [
        "Kimlik ve iletişim bilgileri: ad, soyad, e-posta, telefon",
        "Rezervasyon bilgileri: çekim türü, tercih edilen tarih, konum, notlar",
        "Çekim sürecine ilişkin bilgiler: özel istekler, alerji veya konfor notları (paylaşılması halinde)",
        "Teknik veriler: IP adresi, tarayıcı türü, cihaz bilgisi, ziyaret zamanı (sunucu günlükleri)",
        "Görsel ve ses verileri: çekim sırasında oluşturulan fotoğraflar ve videolar",
      ],
    },
    {
      id: "purposes",
      title: "Verilerin İşlenme Amaçları",
      list: [
        "İletişim ve rezervasyon taleplerini değerlendirmek",
        "Çekim planlaması, sözleşme ve randevu süreçlerini yürütmek",
        "Doğum, hamile, yenidoğan ve bebek çekimlerinde güvenli ve konforlu bir deneyim sunmak",
        "Teslimat, arşivleme ve müşteri desteği sağlamak",
        "Yasal yükümlülükleri yerine getirmek ve olası uyuşmazlıklarda delil oluşturmak",
        "Açık rızanız olması halinde portfolyo, web sitesi veya sosyal medyada örnek çalışma paylaşımı yapmak",
      ],
    },
    {
      id: "photos",
      title: "Fotoğraf ve Görsel Hakları",
      paragraphs: [
        "Çekim sonucunda üretilen fotoğrafların telif hakları fotoğrafçıya aittir; müşteriye kişisel kullanım için teslim edilen dijital veya baskı dosyaları, sözleşmede belirtilen kapsamda kullanılabilir.",
        "Ticari kullanım, üçüncü kişilerle paylaşım veya yeniden satış, yalnızca yazılı izin veya sözleşme hükmü varsa mümkündür.",
        "Yenidoğan, bebek ve doğum çekimlerinde çocuğa ait görseller; aile onayı olmadan portfolyo veya tanıtım amaçlı kullanılmaz.",
        "Hastane doğum çekimlerinde kurum kuralları, hasta mahremiyeti ve sağlık personeli koordinasyonu önceliklidir.",
      ],
    },
    {
      id: "legal-basis",
      title: "İşlemenin Hukuki Sebepleri",
      list: [
        "Bir sözleşmenin kurulması veya ifası (rezervasyon ve çekim hizmeti)",
        "Veri sorumlusunun meşru menfaati (güvenlik, hizmet kalitesi, arşivleme)",
        "Hukuki yükümlülüklerin yerine getirilmesi",
        "Açık rıza (portfolyo paylaşımı, pazarlama iletişimi gibi isteğe bağlı işlemler)",
      ],
    },
    {
      id: "sharing",
      title: "Verilerin Aktarımı",
      paragraphs: [
        "Kişisel verileriniz ticari amaçla satılmaz veya kiralanmaz.",
        "Hizmetin sunulması için gerekli olan güvenilir hizmet sağlayıcılarıyla sınırlı paylaşım yapılabilir:",
      ],
      list: [
        "Barındırma ve dağıtım altyapısı (Vercel)",
        "Veritabanı ve dosya depolama (Supabase)",
        "E-posta bildirim servisi (Resend)",
      ],
    },
    {
      id: "retention",
      title: "Saklama Süreleri",
      list: [
        "İletişim ve rezervasyon kayıtları: talebin sonuçlanmasından sonra en fazla 2 yıl",
        "Sözleşme ve fatura kayıtları: ilgili mevzuattaki zamanaşımı süreleri boyunca",
        "Çekim arşivi: teslimat sonrası yedekleme ve müşteri desteği için makul süre",
        "Sunucu günlükleri: güvenlik amacıyla sınırlı süre",
      ],
    },
    {
      id: "security",
      title: "Güvenlik Önlemleri",
      paragraphs: [
        "Veriler; erişim kontrolü, şifreli bağlantı (HTTPS) ve rol bazlı yönetim paneli erişimi ile korunur.",
        "Yönetim paneline yalnızca yetkili kişiler erişebilir.",
      ],
    },
    {
      id: "rights",
      title: "KVKK Kapsamındaki Haklarınız",
      list: [
        "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
        "İşlenmişse buna ilişkin bilgi talep etme",
        "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
        "KVKK'da öngörülen şartlar altında silinmesini veya yok edilmesini talep etme",
        "İşlemenin sınırlandırılmasını isteme",
        "Açık rızaya dayalı işlemlerde rızayı geri çekme",
      ],
      paragraphs: [
        "Haklarınızı kullanmak için iletişim kanallarımız üzerinden başvurabilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanır.",
      ],
    },
    {
      id: "cookies",
      title: "Çerezler ve Reklamlar",
      paragraphs: [
        "Site; oturum yönetimi, güvenlik ve temel işlevsellik için zorunlu çerezler kullanabilir.",
        "Google AdSense etkinleştirildiğinde, Google reklam ve ölçüm çerezleri kullanabilir. Bu çerezler reklamların gösterilmesi, frekans sınırlama ve temel analiz için işlenebilir. AdSense ayarları yönetici panelinden kapatıldığında ilgili üçüncü taraf reklam kodu yüklenmez.",
        "Tarayıcı ayarlarınızdan çerezleri sınırlayabilir veya engelleyebilirsiniz; bazı site işlevleri etkilenebilir.",
      ],
    },
    {
      id: "children",
      title: "Çocuklara ve Yenidoğanlara İlişkin Özel Hususlar",
      paragraphs: [
        "Bebek ve yenidoğan çekimlerinde veriler, yasal veli veya vasinin bilgisi ve onayı dahilinde işlenir.",
        "Çocuklara ait görseller yalnızca aile onayıyla paylaşılır; mahremiyet ve güvenlik her zaman önceliklidir.",
      ],
    },
    {
      id: "updates",
      title: "Politika Güncellemeleri",
      paragraphs: [
        "Bu politika, hizmet kapsamı veya mevzuat değişikliklerinde güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır.",
      ],
    },
  ],
};
