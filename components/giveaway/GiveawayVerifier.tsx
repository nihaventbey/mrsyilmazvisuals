"use client";

import { useState } from "react";
import type { GiveawayVerificationResult } from "@/lib/giveaways";
import { instagramProfileUrl } from "@/lib/giveaways";

export function GiveawayVerifier() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GiveawayVerificationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleVerify = async (textToVerify?: string) => {
    const codeToSearch = (textToVerify !== undefined ? textToVerify : query).trim();
    if (!codeToSearch) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/cekilis/dogrula?code=${encodeURIComponent(codeToSearch)}`,
      );
      if (res.ok) {
        const data: GiveawayVerificationResult = await res.json();
        setResult(data);
      } else {
        setResult({
          verified: false,
          code: "",
          query: codeToSearch,
          status: "not_found",
          statusText: "Sunucu yanıt vermedi. Lütfen tekrar deneyin.",
          winners: [],
          backups: [],
        });
      }
    } catch {
      setResult({
        verified: false,
        code: "",
        query: codeToSearch,
        status: "not_found",
        statusText: "Bağlantı hatası oluştu.",
        winners: [],
        backups: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Search Input Box */}
      <div className="relative rounded-3xl border border-gold/30 bg-gradient-to-b from-white/90 to-cream/80 p-6 sm:p-8 shadow-xl backdrop-blur-md transition-all hover:border-gold/50">
        <div className="flex flex-col gap-3">
          <label htmlFor="giveaway-code-input" className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
            🔍 Çekiliş Kod Doğrulama & Sorgulama
          </label>
          <p className="text-sm text-mocha">
            Elindeki <strong>Doğrulama Kodunu</strong> (`MRS-...`), <strong>Çekiliş Kodunu</strong> veya kendi <strong>Instagram Kullanıcı Adını</strong> girerek sonuçların orijinalliğini doğrulayabilirsin.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <input
              id="giveaway-code-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Örn: MRS-2026-WIN veya @kullaniciadi"
              className="w-full rounded-2xl border border-espresso/20 bg-white px-5 py-4 text-base text-espresso placeholder:text-mist focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/20 transition-all font-mono"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResult(null);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-mist hover:text-espresso"
              >
                Temizle
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-dark px-8 py-4 font-semibold text-white shadow-md hover:opacity-95 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Sorgulanıyor...</span>
              </>
            ) : (
              <>
                <span>Doğrula</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Quick test suggestion chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-mocha">
          <span className="font-medium text-espresso">Örnek Aramalar:</span>
          {[
            { label: "Örnek Kod: MRS-2026-WIN", value: "MRS-2026-WIN" },
            { label: "Kazanan: @ayse_yildiz", value: "ayse_yildiz" },
            { label: "Yedek: @mehmet_kaya88", value: "mehmet_kaya88" },
          ].map((sample) => (
            <button
              key={sample.value}
              type="button"
              onClick={() => {
                setQuery(sample.value);
                handleVerify(sample.value);
              }}
              className="cursor-pointer rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-gold-dark hover:bg-gold hover:text-white transition-all font-mono"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {result && (
        <div
          className={`rounded-3xl border p-6 sm:p-8 transition-all duration-500 animate-fade-in shadow-xl ${
            result.verified
              ? result.status === "winner"
                ? "border-emerald-500/40 bg-emerald-500/5 text-espresso"
                : result.status === "backup"
                ? "border-amber-500/40 bg-amber-500/5 text-espresso"
                : "border-gold/40 bg-gold/5 text-espresso"
              : "border-red-500/30 bg-red-500/5 text-espresso"
          }`}
        >
          {/* Header Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-espresso/10 pb-5">
            <div className="flex items-center gap-3">
              {result.verified ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 text-red-600">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}

              <div>
                <span
                  className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                    result.verified
                      ? result.status === "winner"
                        ? "bg-emerald-600 text-white"
                        : result.status === "backup"
                        ? "bg-amber-600 text-white"
                        : "bg-gold-dark text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {result.verified ? "✅ Orijinal Çekiliş Doğrulandı" : "❌ Eşleşme Bulunamadı"}
                </span>

                <h3 className="mt-1 font-serif text-xl font-medium text-espresso sm:text-2xl">
                  {result.giveawayTitle || "Sorgu Sonucu"}
                </h3>
              </div>
            </div>

            {result.code && (
              <button
                type="button"
                onClick={() => copyToClipboard(result.code)}
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-espresso/15 bg-white px-3.5 py-2 text-xs font-mono font-medium text-espresso hover:border-gold transition-all"
              >
                <span>{result.code}</span>
                <span className="text-gold-dark">{copied ? "Kopyalandı!" : "📋 Kopyala"}</span>
              </button>
            )}
          </div>

          {/* Status Alert Text */}
          <div className="mt-5 rounded-2xl bg-white/70 p-4 border border-espresso/5">
            <p className="text-sm font-medium leading-relaxed text-espresso">
              {result.statusText}
            </p>
          </div>

          {/* User Matched Banner */}
          {result.matchedUsername && (
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-gold/20 via-gold/10 to-transparent p-4 border border-gold/30">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{result.status === "winner" ? "🏆" : "🎗️"}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                    Sorgulanan Kullanıcı
                  </p>
                  <p className="text-base font-bold text-espresso font-mono">
                    @{result.matchedUsername}
                  </p>
                </div>
              </div>

              <a
                href={instagramProfileUrl(result.matchedUsername)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-espresso px-4 py-2 text-xs font-medium text-white hover:bg-gold-dark transition-all"
              >
                <span>Instagram Profili</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {/* Winner and Backup Lists */}
          {(result.winners.length > 0 || result.backups.length > 0) && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {result.winners.length > 0 && (
                <div className="rounded-2xl border border-emerald-500/20 bg-white/80 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    <span>🏆 Kazanan Asil Talihliler</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">
                      {result.winners.length} kişi
                    </span>
                  </h4>
                  <ul className="mt-3 divide-y divide-espresso/5 text-sm">
                    {result.winners.map((username, idx) => (
                      <li key={`winner-${username}`} className="flex items-center justify-between py-2 font-mono">
                        <span className="text-mocha">{idx + 1}.</span>
                        <a
                          href={instagramProfileUrl(username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-espresso hover:text-gold-dark"
                        >
                          @{username}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.backups.length > 0 && (
                <div className="rounded-2xl border border-amber-500/20 bg-white/80 p-4">
                  <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700">
                    <span>🎗️ Yedek Talihliler</span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-800">
                      {result.backups.length} kişi
                    </span>
                  </h4>
                  <ul className="mt-3 divide-y divide-espresso/5 text-sm">
                    {result.backups.map((username, idx) => (
                      <li key={`backup-${username}`} className="flex items-center justify-between py-2 font-mono">
                        <span className="text-mocha">{idx + 1}.</span>
                        <a
                          href={instagramProfileUrl(username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-espresso hover:text-gold-dark"
                        >
                          @{username}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Verification Hash & Security Metadata */}
          {result.verificationHash && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-espresso/10 bg-cream/40 p-4 text-xs">
              <div>
                <span className="text-mist uppercase tracking-widest font-semibold block text-[10px]">
                  🔒 Güvenlik Imzasi (Draw Hash Signature)
                </span>
                <span className="font-mono text-espresso font-medium select-all break-all">
                  {result.verificationHash}
                </span>
              </div>
              {result.verifiedAt && (
                <span className="text-mocha font-mono text-[11px]">
                  Doğrulanma Zamanı: {new Date(result.verifiedAt).toLocaleTimeString("tr-TR")}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
