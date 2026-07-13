import type { Metadata } from "next";
import Link from "next/link";
import { isMaintenanceActive } from "@/lib/maintenance";
import { getSiteConfig } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Gizlilik Politikası",
    description: `${config.name} gizlilik politikası ve kişisel verilerin korunması.`,
    robots: { index: true, follow: true },
  };
}

export default async function PrivacyPolicyPage() {
  const [config, maintenanceActive] = await Promise.all([
    getSiteConfig(),
    isMaintenanceActive(),
  ]);

  return (
    <div className="min-h-full bg-cream">
      <div className="border-b border-espresso/10 bg-sand/30">
        <div className="container-page flex h-16 items-center justify-between">
          <Link
            href={maintenanceActive ? "/bakim" : "/"}
            className="font-serif text-lg text-espresso transition-colors hover:text-gold-dark"
          >
            ← {maintenanceActive ? "Bakım Sayfası" : "Ana Sayfa"}
          </Link>
          <p className="hidden text-xs tracking-[0.15em] text-mist uppercase sm:block">
            {config.name}
          </p>
        </div>
      </div>

      <article className="container-page py-16 sm:py-20">
        <header className="max-w-3xl">
          <p className="text-xs font-medium tracking-[0.25em] text-gold-dark uppercase">
            Yasal
          </p>
          <h1 className="mt-3 font-serif text-4xl text-espresso sm:text-5xl">
            Gizlilik Politikası
          </h1>
          <p className="mt-4 text-mocha">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <div className="prose-content mt-12 max-w-3xl">
          <p>
            Bu gizlilik politikası, <strong>{config.name}</strong> (
            {config.url}) web sitesini ziyaret ettiğinizde ve iletişim veya
            rezervasyon formlarını kullandığınızda kişisel verilerinizin nasıl
            toplandığını, kullanıldığını ve korunduğunu açıklar.
          </p>

          <h2>Veri Sorumlusu</h2>
          <p>
            Veri sorumlusu: <strong>{config.author}</strong>
            <br />
            Konum: {config.location}
          </p>

          <h2>Toplanan Veriler</h2>
          <p>Formlar aracılığıyla aşağıdaki bilgiler toplanabilir:</p>
          <ul>
            <li>Ad ve soyad</li>
            <li>E-posta adresi</li>
            <li>Telefon numarası</li>
            <li>Rezervasyon veya mesaj içeriği</li>
            <li>Tercih edilen çekim türü ve tarih bilgileri</li>
          </ul>
          <p>
            Teknik olarak, site performansını ve güvenliğini sağlamak amacıyla
            sunucu günlükleri (IP adresi, tarayıcı türü, ziyaret zamanı gibi)
            sınırlı şekilde işlenebilir.
          </p>

          <h2>Verilerin Kullanım Amaçları</h2>
          <ul>
            <li>İletişim taleplerinize yanıt vermek</li>
            <li>Rezervasyon süreçlerini yönetmek</li>
            <li>Hizmet kalitesini geliştirmek</li>
            <li>Yasal yükümlülükleri yerine getirmek</li>
          </ul>

          <h2>Verilerin Paylaşımı</h2>
          <p>
            Kişisel verileriniz, hizmetin sunulması için gerekli olan güvenilir
            altyapı sağlayıcıları (barındırma, veritabanı, e-posta bildirimi)
            dışında üçüncü taraflarla paylaşılmaz ve ticari amaçla satılmaz.
          </p>

          <h2>Veri Saklama Süresi</h2>
          <p>
            Verileriniz, iletişim veya rezervasyon amacının gerektirdiği süre
            boyunca ve ilgili mevzuatta öngörülen saklama süreleri kadar
            muhafaza edilir; süre sonunda silinir, anonimleştirilir veya
            arşivlenir.
          </p>

          <h2>Haklarınız</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında verilerinize
            erişme, düzeltme, silinmesini talep etme ve işlenmesine itiraz etme
            haklarına sahipsiniz. Talepleriniz için bizimle iletişime
            geçebilirsiniz.
          </p>

          <h2>Çerezler</h2>
          <p>
            Site, temel işlevsellik ve oturum yönetimi için gerekli çerezleri
            kullanabilir. Üçüncü taraf reklam veya izleme çerezleri
            kullanılmamaktadır.
          </p>

          <h2>İletişim</h2>
          <p>
            Gizlilik ile ilgili sorularınız için{" "}
            {process.env.CONTACT_EMAIL ? (
              <a href={`mailto:${process.env.CONTACT_EMAIL}`}>
                {process.env.CONTACT_EMAIL}
              </a>
            ) : (
              "iletişim formu veya Instagram üzerinden"
            )}{" "}
            bize ulaşabilirsiniz.
          </p>
        </div>
      </article>
    </div>
  );
}
