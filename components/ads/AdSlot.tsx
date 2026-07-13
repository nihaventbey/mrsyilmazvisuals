import { AdUnit } from "@/components/ads/AdUnit";
import { getActiveAdSlot } from "@/lib/adsense";
import type { AdSenseSlotId } from "@/lib/adsense-defaults";
import { cn } from "@/lib/utils";

type Props = {
  slot: AdSenseSlotId;
  className?: string;
  /** Skip outer container-page (use when already inside a constrained column). */
  bare?: boolean;
};

/** Server wrapper: only renders an ad when CMS enables this placement. */
export async function AdSlot({ slot, className, bare = false }: Props) {
  const active = await getActiveAdSlot(slot);
  if (!active) return null;

  const unit = (
    <AdUnit
      publisherId={active.publisherId}
      slotId={active.slotId}
      testMode={active.testMode}
    />
  );

  if (bare) {
    return <div className={className}>{unit}</div>;
  }

  return (
    <div className={cn(className)}>
      <div className="container-page">{unit}</div>
    </div>
  );
}
