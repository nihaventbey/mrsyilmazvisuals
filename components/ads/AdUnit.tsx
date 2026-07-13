"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdUnitProps = {
  publisherId: string;
  slotId: string;
  testMode?: boolean;
  className?: string;
  /** Optional fixed min-height so layout doesn't jump as hard. */
  minHeightClassName?: string;
};

export function AdUnit({
  publisherId,
  slotId,
  testMode = false,
  className,
  minHeightClassName = "min-h-[100px]",
}: AdUnitProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blocker / script not ready — ignore
    }
  }, []);

  return (
    <div
      className={cn(
        "my-8 overflow-hidden rounded-2xl border border-espresso/10 bg-sand/30",
        minHeightClassName,
        className,
      )}
    >
      <p className="sr-only">Reklam</p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={publisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
        {...(testMode ? { "data-adtest": "on" } : {})}
      />
    </div>
  );
}
