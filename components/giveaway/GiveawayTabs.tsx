"use client";

import { useState } from "react";
import { GiveawayVerifier } from "./GiveawayVerifier";
import { GiveawayTool } from "./GiveawayTool";
import type { Giveaway } from "@/lib/giveaways";
import { instagramProfileUrl } from "@/lib/giveaways";

function formatDate(date: string): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function GiveawayTabs({ giveaways }: { giveaways: Giveaway[] }) {
  const [activeTab, setActiveTab] = useState<"verify" | "tool" | "list">("verify");

  return (
    <div className="w-full space-y-10">
      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-espresso/10 bg-white/70 p-1.5 backdrop-blur-md shadow-sm max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab("verify")}
          className={`cursor-pointer flex-1 rounded-xl px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "verify"
              ? "bg-espresso text-white shadow-md"
              : "text-mocha hover:text-espresso hover:bg-cream/50"
          }`}
        >
          🔍 Kod Doğrulama
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tool")}
          className={`cursor-pointer flex-1 rounded-xl px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "tool"
              ? "bg-espresso text-white shadow-md"
              : "text-mocha hover:text-espresso hover:bg-cream/50"
          }`}
        >
          ⚡ Çekiliş Yap
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`cursor-pointer flex-1 rounded-xl px-5 py-3 text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "list"
              ? "bg-espresso text-white shadow-md"
              : "text-mocha hover:text-espresso hover:bg-cream/50"
          }`}
        >
          📜 Sonuçlar ({giveaways.length})
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="transition-all duration-300">
        {activeTab === "verify" && <GiveawayVerifier />}
        {activeTab === "tool" && <GiveawayTool />}
        {activeTab === "list" && (
          <div className="mx-auto max-w-3xl space-y-10">
            {giveaways.length === 0 ? (
              <div className="rounded-3xl border border-espresso/10 bg-white/60 p-12 text-center text-mocha">
                <p>Henüz yayınlanmış resmi çekiliş sonucu yok.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("tool")}
                  className="mt-4 text-xs font-semibold text-gold-dark underline"
                >
                  Canlı Çekiliş Aracı ile yeni çekiliş yap ↗
                </button>
              </div>
            ) : (
              giveaways.map((giveaway) => (
                <article
                  key={giveaway.id}
                  className="rounded-3xl border border-espresso/10 bg-white/80 p-6 sm:p-8 shadow-sm transition-all hover:border-gold/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-espresso/10 pb-4">
                    <p className="text-xs font-medium uppercase tracking-widest text-gold-dark">
                      {formatDate(giveaway.drawDate)}
                    </p>

                    <button
                      type="button"
                      onClick={() => setActiveTab("verify")}
                      className="text-xs font-mono text-mocha hover:text-gold-dark"
                    >
                      Kodu Doğrula ↗
                    </button>
                  </div>

                  <h2 className="mt-3 font-serif text-2xl text-espresso sm:text-3xl">
                    {giveaway.title}
                  </h2>

                  {giveaway.description ? (
                    <p className="mt-3 text-mocha text-sm">{giveaway.description}</p>
                  ) : null}

                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    {giveaway.winners.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                          🏆 Kazananlar ({giveaway.winners.length})
                        </h3>
                        <ul className="mt-3 space-y-2">
                          {giveaway.winners.map((w) => (
                            <li key={`win-${w.username}`} className="font-mono text-sm">
                              <a
                                href={instagramProfileUrl(w.username)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-espresso hover:text-gold-dark"
                              >
                                @{w.username}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {giveaway.backups.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                          🎗️ Yedekler ({giveaway.backups.length})
                        </h3>
                        <ul className="mt-3 space-y-2">
                          {giveaway.backups.map((b) => (
                            <li key={`back-${b.username}`} className="font-mono text-sm text-mocha">
                              <a
                                href={instagramProfileUrl(b.username)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-gold-dark"
                              >
                                @{b.username}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
