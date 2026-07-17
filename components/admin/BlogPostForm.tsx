"use client";

import { useState, useTransition } from "react";
import { ActionForm } from "@/components/admin/ActionForm";
import { upsertBlogPost } from "@/app/admin/actions";
import {
  expandBlogContent,
  generateBlogInlineImages,
} from "@/app/admin/blog-ai-actions";
import { InputField, TextareaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { CameraMemoriesLoader } from "@/components/ui/CameraMemoriesLoader";
import { countRemainingMarkers } from "@/lib/blog-ai";

type Post = {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  published?: boolean;
};

type Props = {
  post?: Post;
  geminiConfigured?: boolean;
};

export function BlogPostForm({ post, geminiConfigured = false }: Props) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [published, setPublished] = useState(Boolean(post?.published));
  const [aiMessage, setAiMessage] = useState<{
    status: "idle" | "success" | "error";
    text: string;
  }>({ status: "idle", text: "" });
  const [pending, startTransition] = useTransition();
  const [loaderMessage, setLoaderMessage] = useState("AI çalışıyor…");

  const remainingMarkers = countRemainingMarkers(content);

  function runExpand() {
    setLoaderMessage("İçerik genişletiliyor…");
    setAiMessage({ status: "idle", text: "" });
    startTransition(async () => {
      const result = await expandBlogContent({
        title,
        category,
        excerpt,
        content,
      });
      if (result.status === "success") {
        if (typeof result.content === "string") setContent(result.content);
        if (typeof result.excerpt === "string") setExcerpt(result.excerpt);
      }
      setAiMessage({
        status: result.status === "success" ? "success" : "error",
        text: result.message ?? "",
      });
    });
  }

  function runImages() {
    setLoaderMessage("Görseller üretiliyor…");
    setAiMessage({ status: "idle", text: "" });
    startTransition(async () => {
      const result = await generateBlogInlineImages({ content, slug });
      if (typeof result.content === "string") setContent(result.content);
      setAiMessage({
        status: result.status === "success" ? "success" : "error",
        text: result.message ?? "",
      });
    });
  }

  return (
    <div className="relative space-y-6">
      {pending && (
        <CameraMemoriesLoader overlay message={loaderMessage} />
      )}

      <section className="space-y-3 rounded-2xl border border-espresso/15 bg-white/50 p-4">
        <div>
          <h2 className="font-display text-lg text-espresso">Gemini AI</h2>
          <p className="mt-1 text-sm text-mocha">
            Önce içeriği genişletin, sonra yazı içi görselleri üretin.
          </p>
        </div>

        {!geminiConfigured ? (
          <p className="rounded-xl border border-amber-700/20 bg-amber-50/80 px-3 py-2 text-sm text-amber-950">
            GEMINI_API_KEY tanımlı değil. Vercel → Settings → Environment
            Variables (Production + Preview) veya .env.local dosyasına ekleyin.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || !title.trim()}
              onClick={runExpand}
            >
              İçeriği genişlet
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={pending || !content.trim()}
              onClick={runImages}
            >
              Yazıya görsel ekle
              {remainingMarkers > 0 ? ` (${remainingMarkers})` : ""}
            </Button>
          </div>
        )}

        {aiMessage.text && (
          <p
            className={
              aiMessage.status === "error"
                ? "text-sm text-red-700"
                : "text-sm text-mocha"
            }
            role="status"
          >
            {aiMessage.text}
          </p>
        )}
      </section>

      <ActionForm
        action={upsertBlogPost}
        submitLabel={post?.id ? "Yazıyı Güncelle" : "Yazıyı Oluştur"}
      >
        {post?.id && <input type="hidden" name="id" value={post.id} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Başlık"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <InputField
            label="Slug"
            name="slug"
            required
            placeholder="ornek-yazi-basligi"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField
            label="Kategori"
            name="category"
            placeholder="Bebek, Hamile, Düğün..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <label className="flex items-end gap-2 pb-3 text-sm text-mocha">
            <input
              type="checkbox"
              name="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Yayınla
          </label>
        </div>
        <TextareaField
          label="Özet"
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="min-h-20"
        />
        <TextareaField
          label="İçerik (Markdown)"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-96 font-mono text-xs"
        />
      </ActionForm>
    </div>
  );
}
