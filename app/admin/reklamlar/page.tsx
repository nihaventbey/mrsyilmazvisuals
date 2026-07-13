import { AdSenseSettingsForm } from "@/components/admin/AdSenseSettingsForm";
import { getAdSenseSettings, toAdsTxtPublisherId } from "@/lib/adsense";

export default async function AdminAdsPage() {
  const settings = await getAdSenseSettings();
  const adsTxtPub = toAdsTxtPublisherId(settings.publisherId);

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-espresso">Google AdSense</h1>
      <p className="mt-2 text-sm text-mocha">
        Publisher ID ve sayfa konumlarına göre reklam birimlerini buradan yönetin.
      </p>

      <div className="mt-6 space-y-3 rounded-xl border border-espresso/10 bg-cream/60 px-4 py-3 text-sm text-mocha">
        <p>
          Publisher:{" "}
          <code className="rounded bg-white/70 px-1">ca-pub-3156607388655691</code>
          {" · "}
          ads.txt:{" "}
          <code className="rounded bg-white/70 px-1">
            google.com, pub-3156607388655691, DIRECT, f08c47fec0942fa0
          </code>
        </p>
        <p>
          1. AdSense hesabında siteyi onaylayın.
        </p>
        <p>
          2. Site kökünde{" "}
          <a
            href="/ads.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-espresso underline-offset-4 hover:underline"
          >
            /ads.txt
          </a>{" "}
          otomatik üretilir
          {adsTxtPub ? (
            <>
              {" "}
              <span className="text-espresso">({adsTxtPub})</span>
            </>
          ) : null}
          .
        </p>
        <p>
          3. Her konum için reklam birimi oluşturup Slot ID girin ve konumu
          etkinleştirin (site genelinde adsbygoogle.js yüklenir).
        </p>
        <p>
          4. Yerelde deneme için test modunu açın; canlıda kapalı tutun.
        </p>
      </div>

      <div className="mt-8">
        <AdSenseSettingsForm initial={settings} />
      </div>
    </div>
  );
}
