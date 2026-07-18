"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/anti-spam";

const TURNSTILE_SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

/**
 * Hidden anti-spam inputs for public forms: honeypot, fill-time timestamp and
 * (when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set) the Cloudflare Turnstile widget.
 */
export function AntiSpamFields() {
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    setTimestamp(String(Date.now()));
  }, []);

  return (
    <>
      {/* Honeypot: gizli alan; gerçek ziyaretçiler görmez ve doldurmaz. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden"
      >
        <label>
          Web siteniz
          <input
            type="text"
            name={HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <input type="hidden" name={TIMESTAMP_FIELD} value={timestamp} />

      {TURNSTILE_SITE_KEY && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div
            className="cf-turnstile"
            data-sitekey={TURNSTILE_SITE_KEY}
            data-theme="light"
          />
        </>
      )}
    </>
  );
}
