import Script from "next/script";
import { getAdSenseSettings } from "@/lib/adsense";

/** Loads AdSense script once when ads are enabled site-wide. */
export async function AdSenseScript() {
  const settings = await getAdSenseSettings();
  if (!settings.enabled || !settings.publisherId) return null;

  return (
    <Script
      id="adsense-loader"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(settings.publisherId)}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
