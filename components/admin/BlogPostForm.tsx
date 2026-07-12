"use client";

import { ActionForm } from "@/components/admin/ActionForm";
import { upsertBlogPost } from "@/app/admin/actions";
import { InputField, TextareaField } from "@/components/ui/Field";

type Post = {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  published?: boolean;
};

export function BlogPostForm({ post }: { post?: Post }) {
  return (
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
          defaultValue={post?.title}
        />
        <InputField
          label="Slug"
          name="slug"
          required
          placeholder="ornek-yazi-basligi"
          defaultValue={post?.slug}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Kategori"
          name="category"
          placeholder="Bebek, Hamile, Düğün..."
          defaultValue={post?.category}
        />
        <label className="flex items-end gap-2 pb-3 text-sm text-mocha">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post?.published}
          />
          Yayınla
        </label>
      </div>
      <TextareaField
        label="Özet"
        name="excerpt"
        defaultValue={post?.excerpt}
        className="min-h-20"
      />
      <TextareaField
        label="İçerik (Markdown)"
        name="content"
        defaultValue={post?.content}
        className="min-h-96 font-mono text-xs"
      />
    </ActionForm>
  );
}
