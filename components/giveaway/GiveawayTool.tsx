"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  normalizeInstagramUsername,
  generateDrawHash,
  instagramProfileUrl,
} from "@/lib/giveaways";
import { parseRawInstagramComments } from "@/lib/instagram-comments";

export function GiveawayTool() {
  const [title, setTitle] = useState("Instagram Özel Çekilişi");
  const [rawParticipants, setRawParticipants] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [backupCount, setBackupCount] = useState(1);
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const [minMentions, setMinMentions] = useState(0);

  // Import Modes: "url" | "file" | "text" | "extractor"
  const [importMode, setImportMode] = useState<"url" | "file" | "text">("url");
  const [postUrl, setPostUrl] = useState("https://www.instagram.com/p/Dau7FF8laPn/");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShuffleName, setCurrentShuffleName] = useState("");
  const [winners, setWinners] = useState<string[]>([]);
  const [backups, setBackups] = useState<string[]>([]);
  const [drawCode, setDrawCode] = useState<string | null>(null);
  const [drawHash, setDrawHash] = useState<string | null>(null);
  const [copiedResults, setCopiedResults] = useState(false);

  const shuffleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1-Click Real Instagram Auto-Scroll & 500+ Comment Extractor Script
  const INSTAGRAM_SCRAPER_SCRIPT = `
(async function(){
  console.log("🚀 500+ İNSTAGRAM YORUM SÜZÜCÜ BAŞLATILDI...");
  
  let countNotice = document.createElement("div");
  countNotice.style.cssText = "position:fixed;top:20px;right:20px;z-index:999999;background:#3b2e26;color:#fff;padding:18px 24px;border-radius:20px;font-family:sans-serif;font-size:14px;box-shadow:0 15px 40px rgba(0,0,0,0.6);border:2px solid #bf9d68;max-width:400px;";
  countNotice.innerHTML = "⏳ <b>500+ Yorum Yükleniyor...</b><br><span id='ig-count-text' style='font-size:12px;opacity:0.9;'>Yorum butonları tıklanıyor...</span>";
  document.body.appendChild(countNotice);

  for (let i = 0; i < 150; i++) {
    let loadBtns = Array.from(document.querySelectorAll("button, div[role='button'], svg, span")).filter(el => {
      let t = (el.innerText || el.getAttribute("aria-label") || "").toLowerCase();
      return (t.includes("daha fazla") || t.includes("load more") || t.includes("yanıt") || t.includes("view replies") || t.includes("daha fazla yorum")) && !t.includes("gönderi");
    });

    loadBtns.forEach(b => {
      try { b.click(); } catch(e){}
    });

    let scrollContainers = document.querySelectorAll("div.x5yr21d, div._a9z6, div.x78zum, section");
    scrollContainers.forEach(c => { c.scrollTop = c.scrollHeight; });

    let commentNodes = document.querySelectorAll("ul._a9ym, div.x168nmei, div._a9zs, span._ap3a");
    let updateText = document.getElementById("ig-count-text");
    if(updateText) updateText.innerText = "Bulunan Yorum Satırları: " + commentNodes.length + " (Adım: " + (i+1) + "/150)";

    await new Promise(r => setTimeout(r, 450));
  }

  let commentUsers = new Set();
  const systemIgnore = new Set(["directinbox", "legalprivacy", "legalterms", "popular", "weblite", "accountsmeta_verified", "instagram", "explore", "reels", "stories", "accounts", "about", "blog", "jobs", "help", "api", "privacy", "terms", "top", "locations"]);

  document.querySelectorAll("ul._a9ym, div.x168nmei, div._a9zs, article, div.x78zum.xdt5ytf").forEach(container => {
    container.querySelectorAll("h3 a, span._aap6 a, a._a68s, a[href*='/']").forEach(a => {
      let href = a.getAttribute("href") || "";
      let txt = (a.innerText || "").trim();
      let username = href.replace(/\\//g, "").split("?")[0].trim();

      if (!username && txt.startsWith("@")) username = txt.slice(1);

      if (username && username.length >= 3 && !systemIgnore.has(username.toLowerCase()) && !href.includes("/p/") && !href.includes("/explore/")) {
        commentUsers.add(username);
      }
    });

    let fullText = container.innerText || "";
    let matches = fullText.match(/@[a-zA-Z0-9._]{3,30}/g) || [];
    matches.forEach(m => {
      let clean = m.slice(1).trim();
      if (clean && !systemIgnore.has(clean.toLowerCase())) {
        commentUsers.add(clean);
      }
    });
  });

  let finalList = Array.from(commentUsers);
  let resultText = finalList.map(u => "@" + u).join("\\n");

  countNotice.style.background = "#10b981";
  countNotice.style.border = "2px solid #059669";
  countNotice.innerHTML = \`
    <div style="font-weight:bold;font-size:15px;">🎉 TAMAMLANDI! (\${finalList.length} Kullanıcı)</div>
    <div style="font-size:11px;margin-top:4px;margin-bottom:8px;">Aşağıdaki listeyi kopyalayıp çekiliş sitesine yapıştırabilirsiniz:</div>
    <textarea id="ig-result-box" style="width:100%;height:150px;background:#fff;color:#000;border-radius:10px;padding:8px;font-family:monospace;font-size:11px;border:none;" readonly>\${resultText}</textarea>
    <button id="ig-copy-btn" style="margin-top:8px;width:100%;background:#047857;color:#fff;border:none;padding:10px;border-radius:10px;font-weight:bold;cursor:pointer;font-size:13px;">📋 Listeyi Kopyala (\${finalList.length} İsim)</button>
  \`;

  let copyBtn = document.getElementById("ig-copy-btn");
  let resultBox = document.getElementById("ig-result-box");
  if(copyBtn && resultBox) {
    copyBtn.onclick = function() {
      resultBox.select();
      document.execCommand("copy");
      try { navigator.clipboard.writeText(resultText); } catch(e){}
      copyBtn.innerText = "✅ Kopyalandı!";
      setTimeout(() => { copyBtn.innerText = "📋 Listeyi Kopyala (" + finalList.length + " İsim)"; }, 2000);
    };
  }

  try { if(typeof copy === 'function') copy(resultText); } catch(e){}
})();
  `.trim();

  const handleCopyExtractorScript = () => {
    navigator.clipboard.writeText(INSTAGRAM_SCRAPER_SCRIPT);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  // Fetch comments via URL API
  const handleFetchCommentsFromUrl = async () => {
    if (!postUrl.trim()) return;

    setIsFetchingUrl(true);
    setFetchMessage(null);

    try {
      const res = await fetch(
        `/api/cekilis/instagram-yorumlar?url=${encodeURIComponent(postUrl.trim())}`,
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.comments) && data.comments.length > 0) {
        const formatted = data.comments
          .map((c: { username: string; commentText: string }) => `@${c.username} ${c.commentText}`)
          .join("\n");

        setRawParticipants(formatted);
        setFetchMessage(`✅ ${data.comments.length} adet GERÇEK yorum başarıyla çekildi!`);
      } else {
        setFetchMessage(
          `ℹ️ ${data.message || "Instagram oturum açma kısıtlaması."} "1-Tıkla Gerçek Yorum Çekici" veya dosya yükleme aracını kullanabilirsiniz.`,
        );
        setShowHelperModal(true);
      }
    } catch {
      setFetchMessage("⚠️ İletişim hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Handle File Upload (CSV, TXT, JSON)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || "");
      if (!content) return;

      if (file.name.endsWith(".json")) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            const lines = parsed
              .map((item) => {
                if (typeof item === "string") return item;
                if (item.username || item.user) return `@${item.username || item.user} ${item.text || item.comment || ""}`;
                return "";
              })
              .filter(Boolean);
            setRawParticipants(lines.join("\n"));
            setFetchMessage(`📁 JSON dosyasından ${lines.length} yorum yüklendi.`);
            return;
          }
        } catch {
          // ignore
        }
      }

      setRawParticipants(content);
      setFetchMessage(`📁 ${file.name} dosyasından yorumlar yüklendi.`);
    };

    reader.readAsText(file);
  };

  // Parse cleaned list with mention filters
  const getCleanedParticipants = () => {
    const parsedComments = parseRawInstagramComments(rawParticipants);

    let filtered = parsedComments;

    if (minMentions > 0) {
      filtered = filtered.filter((c) => c.mentionsCount >= minMentions);
    }

    let usernames = filtered.map((c) => c.username);

    if (removeDuplicates) {
      usernames = Array.from(new Set(usernames));
    }

    return usernames;
  };

  const parsedList = getCleanedParticipants();

  // Handle Draw
  const startDraw = () => {
    if (parsedList.length === 0) return;
    if (parsedList.length < winnerCount + backupCount) {
      alert(
        `Katılımcı sayısı (${parsedList.length}), kazanan + yedek sayısından (${winnerCount + backupCount}) fazla olmalıdır.`,
      );
      return;
    }

    setIsDrawing(true);
    setWinners([]);
    setBackups([]);
    setDrawCode(null);
    setDrawHash(null);

    let step = 0;
    const maxSteps = 40;
    const intervalTime = 75;

    shuffleIntervalRef.current = setInterval(() => {
      step++;
      const randomIdx = Math.floor(Math.random() * parsedList.length);
      setCurrentShuffleName(parsedList[randomIdx]);

      if (step >= maxSteps) {
        if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
        finalizeDraw();
      }
    }, intervalTime);
  };

  const finalizeDraw = () => {
    const pool = [...parsedList];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const pickedWinners = pool.slice(0, winnerCount);
    const pickedBackups = pool.slice(winnerCount, winnerCount + backupCount);

    setWinners(pickedWinners);
    setBackups(pickedBackups);
    setIsDrawing(false);

    const timestamp = Date.now();
    const hex = Math.floor(1000 + Math.random() * 9000).toString(36).toUpperCase();
    const code = `MRS-${new Date().getFullYear()}-${hex.padStart(4, "X")}`;
    const hash = generateDrawHash(title, pickedWinners, pickedBackups, timestamp);

    setDrawCode(code);
    setDrawHash(hash);
  };

  useEffect(() => {
    return () => {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
    };
  }, []);

  const copyDrawSummary = () => {
    if (!winners.length) return;
    const text = `🎉 ${title} ÇEKİLİŞ SONUÇLARI 🎉\n\n🏆 Kazananlar:\n${winners.map((w, i) => `${i + 1}. @${w}`).join("\n")}\n\n🎗️ Yedekler:\n${backups.map((b, i) => `${i + 1}. @${b}`).join("\n")}\n\n🔒 Doğrulama Kodu: ${drawCode}\n🔑 Güvenlik Hash: ${drawHash}\n\nSitede Doğrula: ${window.location.origin}/cekilis`;
    navigator.clipboard.writeText(text);
    setCopiedResults(true);
    setTimeout(() => setCopiedResults(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Info */}
      <div className="rounded-3xl border border-gold/30 bg-gradient-to-r from-gold/10 via-cream/80 to-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold-dark font-bold text-lg">
            ⚡
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-espresso sm:text-2xl">
              Hızlı Instagram Çekiliş Yapma Aracı
            </h2>
            <p className="text-xs text-mocha mt-0.5">
              Instagram Gönderi Linki ile yorum çekin, CSV/TXT dosyası yükleyin veya kopyalanan yorumları yapıştırın.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Input Methods & Form Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Giveaway Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-espresso mb-2">
              Çekiliş Başlığı
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2026 Sezonu Fotoğraf Çekimi Çekilişi"
              className="w-full rounded-2xl border border-espresso/20 bg-white px-4 py-3 text-sm text-espresso placeholder:text-mist focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>

          {/* Import Method Tabs */}
          <div className="rounded-2xl border border-gold/30 bg-cream/40 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                Yorum Çekme / İçeri Aktarma Yöntemi
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setImportMode("url")}
                className={`cursor-pointer rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
                  importMode === "url"
                    ? "bg-gold-dark text-white shadow-sm"
                    : "bg-white text-espresso border border-espresso/10 hover:border-gold"
                }`}
              >
                🔗 Instagram Linki
              </button>
              <button
                type="button"
                onClick={() => setImportMode("file")}
                className={`cursor-pointer rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
                  importMode === "file"
                    ? "bg-gold-dark text-white shadow-sm"
                    : "bg-white text-espresso border border-espresso/10 hover:border-gold"
                }`}
              >
                📁 Dosya Yükle
              </button>
              <button
                type="button"
                onClick={() => setImportMode("text")}
                className={`cursor-pointer rounded-xl py-2 px-3 text-xs font-semibold transition-all ${
                  importMode === "text"
                    ? "bg-gold-dark text-white shadow-sm"
                    : "bg-white text-espresso border border-espresso/10 hover:border-gold"
                }`}
              >
                📋 Kopyala / Yapıştır
              </button>
            </div>

            {/* Mode 1: Instagram URL Fetcher */}
            {importMode === "url" && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-mocha">
                  Instagram gönderi linkinizi yazıp <strong>"Yorumları Çek"</strong> butonuna basın.
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/Dau7FF8laPn/"
                    className="w-full rounded-xl border border-espresso/20 bg-white px-3.5 py-2.5 text-xs text-espresso placeholder:text-mist focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFetchCommentsFromUrl}
                    disabled={isFetchingUrl || !postUrl.trim()}
                    className="cursor-pointer shrink-0 rounded-xl bg-espresso px-4 py-2.5 text-xs font-semibold text-white hover:bg-gold-dark transition-all disabled:opacity-50"
                  >
                    {isFetchingUrl ? "Çekiliyor..." : "Yorumları Çek ⬇"}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHelperModal(true)}
                    className="text-[11px] font-semibold text-gold-dark hover:underline flex items-center gap-1"
                  >
                    <span>⚡ 1-Tıkla Gerçek Yorum Çekici Rehberi & Kodu</span>
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: File Upload (CSV/TXT/JSON) */}
            {importMode === "file" && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-mocha">
                  Bilgisayarınızdaki <strong>.csv</strong>, <strong>.txt</strong> veya <strong>.json</strong> yorum dosyanızı seçin.
                </p>
                <input
                  type="file"
                  accept=".csv,.txt,.json"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-mocha file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gold/20 file:text-gold-dark hover:file:bg-gold hover:file:text-white transition-all"
                />
              </div>
            )}

            {/* Mode 3: Raw Text */}
            {importMode === "text" && (
              <div className="pt-2 space-y-2">
                <p className="text-xs text-mocha">
                  Instagram'dan kopyaladığınız yorum metinlerini aşağıdaki kutuya yapıştırın veya <strong>"Panodan Yapıştır"</strong> butonuna basın.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text) {
                        setRawParticipants(text);
                        setFetchMessage(`📋 Panodan yapıştırıldı! ${parseRawInstagramComments(text).length} katılımcı bulundu.`);
                      }
                    } catch {
                      setFetchMessage("⚠️ Tarayıcı pano izni verilmedi. Aşağıdaki kutuya Ctrl+V ile yapıştırabilirsiniz.");
                    }
                  }}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-gold/20 px-3.5 py-2 text-xs font-semibold text-gold-dark hover:bg-gold hover:text-white transition-all"
                >
                  <span>📋 Panodan Yapıştır</span>
                </button>
              </div>
            )}

            {fetchMessage && (
              <p className="text-xs font-medium text-espresso bg-white/90 p-3 rounded-xl border border-gold/20 leading-relaxed">
                {fetchMessage}
              </p>
            )}
          </div>

          {/* Counts & Filters */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1.5">
                🏆 Kazanan
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={winnerCount}
                onChange={(e) => setWinnerCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-espresso/20 bg-white px-3 py-2 text-xs text-espresso focus:border-gold focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1.5">
                🎗️ Yedek
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={backupCount}
                onChange={(e) => setBackupCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-espresso/20 bg-white px-3 py-2 text-xs text-espresso focus:border-gold focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-espresso mb-1.5">
                🏷️ Min. Etiket
              </label>
              <select
                value={minMentions}
                onChange={(e) => setMinMentions(parseInt(e.target.value) || 0)}
                className="w-full rounded-xl border border-espresso/20 bg-white px-2 py-2 text-xs text-espresso focus:border-gold focus:outline-none"
              >
                <option value={0}>Filtresiz</option>
                <option value={1}>En az 1 @etiket</option>
                <option value={2}>En az 2 @etiket</option>
                <option value={3}>En az 3 @etiket</option>
              </select>
            </div>
          </div>

          {/* Duplicate Switch */}
          <div className="flex items-center justify-between rounded-2xl border border-espresso/10 bg-cream/30 p-3.5">
            <div>
              <p className="text-xs font-semibold text-espresso">Mükerrer Kullanıcıları Temizle</p>
              <p className="text-[11px] text-mocha">Birden fazla yorum yapan kullanıcılara 1 çekiliş hakkı tanınır.</p>
            </div>
            <input
              type="checkbox"
              checked={removeDuplicates}
              onChange={(e) => setRemoveDuplicates(e.target.checked)}
              className="h-5 w-5 rounded border-espresso/30 text-gold focus:ring-gold"
            />
          </div>

          {/* Participants Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-espresso">
                Katılımcı Yorum Listesi
              </label>
              <span className="text-xs font-mono text-gold-dark font-semibold">
                {parsedList.length} Geçerli Katılımcı
              </span>
            </div>
            <textarea
              rows={7}
              value={rawParticipants}
              onChange={(e) => setRawParticipants(e.target.value)}
              placeholder="Her satıra bir @kullaniciadi veya yorum metni yazın/yapıştırın..."
              className="w-full rounded-2xl border border-espresso/20 bg-white p-4 font-mono text-xs text-espresso placeholder:text-mist focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </div>

          {/* Start Draw Button */}
          <button
            type="button"
            onClick={startDraw}
            disabled={isDrawing || parsedList.length === 0}
            className="cursor-pointer w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-espresso via-mocha to-espresso py-4 px-6 text-base font-medium text-white shadow-xl hover:opacity-95 transition-all disabled:opacity-50"
          >
            {isDrawing ? (
              <>
                <svg className="h-5 w-5 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Çekiliş Yapılıyor...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🎰</span>
                <span>Çekilişi Başlat ({parsedList.length} İsim)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Interactive Reel & Live Results */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-gold/30 bg-white/80 p-6 sm:p-8 shadow-lg backdrop-blur-sm">
          {/* Active Shuffle Reel */}
          {isDrawing ? (
            <div className="my-auto flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gold/15 text-gold-dark animate-bounce">
                <span className="text-4xl">🎲</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">
                Talihliler Belirleniyor
              </p>
              <div className="rounded-2xl border-2 border-gold bg-cream px-6 py-4 shadow-inner">
                <span className="font-mono text-2xl font-bold text-espresso animate-pulse">
                  @{currentShuffleName || "..."}
                </span>
              </div>
            </div>
          ) : winners.length > 0 ? (
            <div className="space-y-6">
              {/* Winner Header */}
              <div className="flex items-center justify-between border-b border-espresso/10 pb-4">
                <div>
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
                    🎉 Çekiliş Tamamlandı!
                  </span>
                  <h3 className="mt-1 font-serif text-xl font-medium text-espresso">
                    {title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={copyDrawSummary}
                  className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-gold/15 px-3 py-2 text-xs font-semibold text-gold-dark hover:bg-gold hover:text-white transition-all"
                >
                  {copiedResults ? "Kopyalandı! ✅" : "📋 Sonuçları Kopyala"}
                </button>
              </div>

              {/* Winners Cards */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2">
                  <span>🏆 KAZANAN ASİL TALİHLİLER</span>
                </h4>
                <div className="space-y-2">
                  {winners.map((username, index) => (
                    <div
                      key={`winner-result-${username}`}
                      className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 transition-all hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white text-xs font-mono">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="font-mono font-bold text-espresso text-base">
                            @{username}
                          </p>
                          <p className="text-[11px] text-mocha">Asil Kazanan</p>
                        </div>
                      </div>

                      <a
                        href={instagramProfileUrl(username)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-gold-dark hover:underline"
                      >
                        Profili Aç ↗
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Backup Cards */}
              {backups.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-3 flex items-center gap-2">
                    <span>🎗️ YEDEK TALİHLİLER</span>
                  </h4>
                  <div className="space-y-2">
                    {backups.map((username, index) => (
                      <div
                        key={`backup-result-${username}`}
                        className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-600 font-bold text-white text-xs font-mono">
                            Y{index + 1}
                          </span>
                          <span className="font-mono font-semibold text-espresso text-sm">
                            @{username}
                          </span>
                        </div>

                        <a
                          href={instagramProfileUrl(username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-mocha hover:text-gold-dark"
                        >
                          Profili Aç ↗
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Verification Code Badge */}
              <div className="rounded-2xl border border-gold/40 bg-cream/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-dark">
                    🔒 Üretilen Doğrulama Kodu
                  </span>
                  <span className="font-mono text-xs font-bold text-espresso bg-white px-2 py-0.5 rounded border border-gold/30">
                    {drawCode}
                  </span>
                </div>
                <p className="text-[11px] text-mocha">
                  Bu kodu katılımcılarınıza vererek "Kod Doğrulama" sekmesinden çekiliş sonucunun tarafsızlığını doğrulamalarını sağlayabilirsiniz.
                </p>
                {drawHash && (
                  <p className="font-mono text-[10px] text-mist truncate">
                    HASH: {drawHash}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="my-auto flex flex-col items-center justify-center py-20 text-center text-mist space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cream text-2xl text-gold-dark">
                🎟️
              </div>
              <p className="text-sm text-mocha font-medium">
                Henüz çekiliş başlatılmadı.
              </p>
              <p className="text-xs max-w-xs text-mist">
                Instagram Linki, dosya veya kopyala-yapıştır ile yorumları çekip "Çekilişi Başlat" butonuna tıklayın.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Helper Modal for Direct 1-Click Instagram Real Comment Extraction */}
      {showHelperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-espresso/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-gold/30 bg-white p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-espresso/10 pb-4">
              <div>
                <span className="inline-block rounded-full bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold-dark">
                  ⚡ 1-Tıkla Gerçek Yorum Çekici
                </span>
                <h3 className="mt-1 font-serif text-xl font-medium text-espresso">
                  İnstagram'dan %100 Gerçek Yorum Alma Rehberi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelperModal(false)}
                className="text-mist hover:text-espresso font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-mocha leading-relaxed">
              Instagram sunucusu doğrudan oturumsuz bot çekimlerine oturum engeli koymaktadır. 
              Herhangi bir Instagram gönderisindeki <strong>TÜM GERÇEK YORUMLARI</strong> tek tıkla kopyalamak için aşağıdaki kodu kullanabilirsiniz:
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl bg-cream p-4 border border-gold/20 font-mono text-[11px] text-espresso select-all break-all overflow-x-auto">
                {INSTAGRAM_SCRAPER_SCRIPT}
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCopyExtractorScript}
                  className="cursor-pointer rounded-xl bg-gold-dark px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition-all"
                >
                  {copiedScript ? "Kopyalandı! ✅" : "📋 1-Tık Kodunu Kopyala"}
                </button>

                <a
                  href={postUrl || "https://www.instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-espresso underline hover:text-gold-dark"
                >
                  Gönderiyi Instagram'da Aç ↗
                </a>
              </div>
            </div>

            <div className="rounded-xl bg-white/80 border border-espresso/10 p-3.5 text-[11px] text-mocha space-y-1">
              <p className="font-semibold text-espresso">Adımlar:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Instagram gönderisini açın.</li>
                <li>F12 (Konsol) açıp yukarıdaki kodu yapıştırın veya Bookmarklet olarak çalıştırın.</li>
                <li>Kopyalanan kullanıcı listesini sol kutuya yapıştırın!</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={() => setShowHelperModal(false)}
              className="w-full rounded-xl bg-espresso py-3 text-xs font-semibold text-white hover:bg-gold-dark transition-all"
            >
              Anladım, Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
