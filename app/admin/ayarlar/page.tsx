import { getSiteSettings, getSiteConfig } from "@/lib/settings";
import { getMaintenanceSettings } from "@/lib/maintenance";
import { SettingsForms } from "@/components/admin/SettingsForms";

export default async function AdminSettingsPage() {
  const [settings, config, maintenance] = await Promise.all([
    getSiteSettings(),
    getSiteConfig(),
    getMaintenanceSettings(),
  ]);

  return (
    <div>
      <h1 className="font-serif text-3xl text-espresso">Site Ayarları</h1>
      <p className="mt-2 text-sm text-mocha">
        Genel bilgiler, iletişim, hakkımda ve ana sayfa içeriklerini buradan
        yönetin.
      </p>
      <div className="mt-8">
        <SettingsForms
          settings={settings}
          maintenance={maintenance}
          profilePreview={config.profileImage}
        />
      </div>
    </div>
  );
}
