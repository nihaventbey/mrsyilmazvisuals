import { GoogleGenAI } from "@google/genai";

export type ExpandBlogInput = {
  title: string;
  category: string;
  excerpt: string;
  content: string;
};

export type ExpandBlogResult = {
  content: string;
  excerpt: string;
};

export type GeneratedImage = {
  bytes: Buffer;
  mimeType: string;
};

const DEFAULT_TEXT_MODEL = "gemini-3-flash-preview";
const DEFAULT_IMAGE_MODEL = "gemini-3.1-flash-image";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY tanımlı değil. Vercel Environment Variables veya .env.local dosyasına ekleyin.",
    );
  }
  return new GoogleGenAI({ apiKey });
}

function textModel(): string {
  return process.env.GEMINI_TEXT_MODEL?.trim() || DEFAULT_TEXT_MODEL;
}

function imageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_IMAGE_MODEL;
}

function extractText(response: {
  text?: string;
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}): string {
  if (typeof response.text === "string" && response.text.trim()) {
    return response.text.trim();
  }
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts
    .map((p) => p.text ?? "")
    .join("")
    .trim();
}

const EXPAND_SYSTEM = `Sen Mrs. Yılmaz Visuals (Melike Yılmaz) için yazan bir blog editörüsün.
Ton: samimi, zarif, abartısız; Türkçe.
Konu: doğum, hamile, yenidoğan, bebek, 1 yaş, smash cake, hastane odası doğum, düğün fotoğrafçılığı.
Kurallar:
- Yalnızca Markdown üret (başlık, alt başlık, liste, kısa paragraflar).
- Uydurma telefon, adres, fiyat veya iletişim bilgisi yazma.
- SEO için doğal anahtar kelimeler kullan; keyword stuffing yapma.
- Mevcut taslağı genişlet; varsa koru ve geliştir.
- Yazı boyunca en fazla 3 adet görsel yer tutucu bırak. Format tam olarak:
<!-- gemini-image: soft warm photography style English visual prompt | alt: Türkçe kısa alt metin -->
- Görsel promptları gerçekçi fotoğraf stili olsun (stock AI illustration / cartoon değil).
- Sonunda JSON veya code fence kullanma; yalnızca Markdown gövdesi döndür.`;

export async function expandBlogMarkdown(
  input: ExpandBlogInput,
): Promise<ExpandBlogResult> {
  const ai = getClient();
  const userPrompt = [
    `Başlık: ${input.title || "(yok)"}`,
    `Kategori: ${input.category || "Genel"}`,
    `Mevcut özet: ${input.excerpt || "(yok)"}`,
    `Mevcut içerik / taslak:`,
    input.content?.trim() || "(boş — sıfırdan yaz)",
    "",
    "Görevin: bu yazıyı blog için hazır, okunabilir ve SEO dostu Markdown içeriğe genişlet.",
    "Ayrıca yazının başına HTML yorumu olarak tek satırlık iyileştirilmiş özet ekle:",
    "<!-- excerpt: ... -->",
  ].join("\n");

  const response = await ai.models.generateContent({
    model: textModel(),
    contents: userPrompt,
    config: {
      systemInstruction: EXPAND_SYSTEM,
      temperature: 0.7,
    },
  });

  let content = extractText(response);
  if (!content) {
    throw new Error("Gemini boş yanıt döndürdü. Lütfen tekrar deneyin.");
  }

  let excerpt = input.excerpt;
  const excerptMatch = content.match(/<!--\s*excerpt:\s*([\s\S]*?)-->/i);
  if (excerptMatch) {
    excerpt = excerptMatch[1].trim().replace(/\s+/g, " ");
    content = content.replace(excerptMatch[0], "").trim();
  }

  // Strip accidental fences
  content = content
    .replace(/^```(?:markdown|md)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (!excerpt) {
    excerpt = content
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/[#>*_`\[\]]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 180);
  }

  return { content, excerpt };
}

export async function generateImageFromPrompt(
  prompt: string,
): Promise<GeneratedImage> {
  const ai = getClient();
  const fullPrompt = [
    "Generate a single photorealistic editorial photograph suitable for a photography studio blog.",
    "No text overlays, no logos, no watermarks. Soft natural light, warm tones.",
    `Subject: ${prompt}`,
  ].join(" ");

  const response = await ai.models.generateContent({
    model: imageModel(),
    contents: fullPrompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    const inline = (part as { inlineData?: { data?: string; mimeType?: string } })
      .inlineData;
    if (inline?.data) {
      return {
        bytes: Buffer.from(inline.data, "base64"),
        mimeType: inline.mimeType || "image/png",
      };
    }
  }

  throw new Error(
    "Görsel üretilemedi. Model yanıtında görsel bulunamadı; promptu sadeleştirip tekrar deneyin.",
  );
}
