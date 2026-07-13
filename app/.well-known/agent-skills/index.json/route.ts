import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getSiteConfig } from "@/lib/settings";

const SKILLS = [
  {
    id: "site-info",
    name: "Site bilgisi",
    description:
      "Mrs. Yılmaz Visuals markası, hizmet bölgeleri ve genel site özeti.",
    file: "site-info.md",
  },
  {
    id: "contact",
    name: "İletişim",
    description: "Form, Instagram, WhatsApp ve rezervasyon kanalları.",
    file: "contact.md",
  },
  {
    id: "services",
    name: "Hizmetler",
    description:
      "Doğum, hamile, bebek, çocuk ve düğün fotoğrafçılığı hizmet listesi.",
    file: "services.md",
  },
] as const;

function sha256Of(relativePublicPath: string): string {
  const absolute = path.join(process.cwd(), "public", relativePublicPath);
  const buf = readFileSync(absolute);
  return createHash("sha256").update(buf).digest("hex");
}

export async function GET() {
  const config = await getSiteConfig();
  const base = config.url.replace(/\/$/, "");

  const skills = SKILLS.map((skill) => {
    const href = `/.well-known/agent-skills/${skill.file}`;
    return {
      id: skill.id,
      name: skill.name,
      description: skill.description,
      href: `${base}${href}`,
      path: href,
      contentType: "text/markdown",
      sha256: sha256Of(href.replace(/^\//, "")),
    };
  });

  return Response.json(
    {
      version: 1,
      name: config.name,
      description:
        "Fotoğrafçı sitesi için keşif skill'leri (bilgi, iletişim, hizmetler).",
      skills,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
