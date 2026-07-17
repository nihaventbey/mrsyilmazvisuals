import { getSiteSettings, getSiteConfig } from "@/lib/settings";
import { getMaintenanceSettings } from "@/lib/maintenance";
import { getSeoSettings } from "@/lib/seo-keywords";
import { SettingsForms } from "@/components/admin/SettingsForms";

export default async function AdminSettingsPage() {
  const [settings, config, maintenance, seo] = await Promise.all([
    getSiteSettings(),
    getSiteConfig(),
    getMaintenanceSettings(),
    getSeoSettings(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Site Ayarları</h1>
      <p className="mt-2 text-sm text-mocha">
        Genel bilgiler, iletişim, hakkımda, ana sayfa ve SEO anahtar kelimelerini
        buradan yönetin.
      </p>
      <div className="mt-8">
        <SettingsForms
          settings={settings}
          maintenance={maintenance}
          seo={seo}
          logoPreview={config.logoImage}
          logoIconPreview={config.logoIcon}
          aboutPreview={config.aboutImage}
        />
      </div>
    </div>
  );
}
