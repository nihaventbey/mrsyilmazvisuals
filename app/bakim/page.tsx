import type { Metadata } from "next";
import { MaintenanceView } from "@/components/maintenance/MaintenanceView";
import { getMaintenanceSettings } from "@/lib/maintenance";
import {
  getContactChannels,
  getSiteConfig,
} from "@/lib/settings";

export const metadata: Metadata = {
  title: "Bakım Modu",
  robots: { index: false, follow: false },
};

export default async function MaintenancePage() {
  const [maintenance, config, contactChannels] = await Promise.all([
    getMaintenanceSettings(),
    getSiteConfig(),
    getContactChannels(),
  ]);

  return (
    <MaintenanceView
      maintenance={maintenance}
      config={config}
      contactChannels={contactChannels}
      contactEmail={process.env.CONTACT_EMAIL}
    />
  );
}
