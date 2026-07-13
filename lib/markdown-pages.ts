import { getFaq, getPortfolioCategories } from "@/lib/content";
import { getServices, getSiteConfig, getSiteSettings } from "@/lib/settings";
import { isMarkdownEligiblePath } from "@/lib/markdown-negotiate";
import { toWhatsAppUrl } from "@/lib/whatsapp";

export { isMarkdownEligiblePath } from "@/lib/markdown-negotiate";

export async function renderMarkdownForPath(
  pathname: string,
): Promise<string | null> {
  if (!isMarkdownEligiblePath(pathname)) return null;

  const [config, settings, services, faq, categories] = await Promise.all([
    getSiteConfig(),
    getSiteSettings(),
    getServices(),
    getFaq(),
    getPortfolioCategories(),
  ]);

  const whatsapp = toWhatsAppUrl(config.whatsappPhone);
  const lines: string[] = [];

  if (pathname === "/") {
    lines.push(`# ${config.name}`);
    lines.push("");
    lines.push(`> ${config.tagline}`);
    lines.push("");
    lines.push(config.description);
    lines.push("");
    lines.push("## Hizmetler");
    for (const service of services) {
      lines.push(`- **${service.title}** — ${service.short}`);
    }
    lines.push("");
    lines.push("## Portfolyo kategorileri");
    for (const category of categories) {
      lines.push(`- [${category.title}](/portfolyo/${category.slug})`);
    }
    lines.push("");
    lines.push("## Bağlantılar");
    lines.push("- [Hakkımda](/hakkimda)");
    lines.push("- [İletişim](/iletisim)");
    lines.push("- [SSS](/sss)");
    lines.push("- [Rezervasyon](/rezervasyon)");
    lines.push("- [llms.txt](/llms.txt)");
  }

  if (pathname === "/hakkimda") {
    lines.push(`# ${config.author}`);
    lines.push("");
    lines.push(settings.about.pageDescription);
    lines.push("");
    for (const paragraph of settings.about.bioParagraphs) {
      lines.push(paragraph);
      lines.push("");
    }
    lines.push("## Değerler");
    for (const value of settings.about.values) {
      lines.push(`- **${value.title}** — ${value.text}`);
    }
  }

  if (pathname === "/iletisim") {
    const { contact } = settings;
    lines.push(`# ${contact.pageTitle}`);
    lines.push("");
    lines.push(contact.pageDescription);
    lines.push("");
    lines.push(`- Konum: ${contact.location}`);
    lines.push(`- Instagram: ${contact.instagramUrl}`);
    if (whatsapp) lines.push(`- WhatsApp: ${whatsapp}`);
    lines.push(`- Çalışma: ${contact.workingHours}`);
    lines.push(`- Form notu: ${contact.formNote}`);
    lines.push(`- Form: ${config.url}/iletisim`);
  }

  if (pathname === "/sss") {
    lines.push("# Sık Sorulan Sorular");
    lines.push("");
    for (const item of faq) {
      lines.push(`## ${item.question}`);
      lines.push("");
      lines.push(item.answer);
      lines.push("");
    }
  }

  return `${lines.join("\n").trim()}\n`;
}
