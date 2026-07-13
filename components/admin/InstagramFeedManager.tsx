"use client";

import { useCallback, useState, useTransition } from "react";
import Image from "next/image";
import {
  saveInstagramSettings,
  testInstagramGraphConnection,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/Field";
import { FormMessage } from "@/components/forms/FormMessage";
import { initialFormState, type FormState } from "@/lib/validations";
import type {
  InstagramPost,
  InstagramSettings,
  InstagramSource,
} from "@/lib/instagram";
import type { InstagramGraphStatus } from "@/lib/instagram-graph";

type EditablePost = InstagramPost & {
  previewUrl?: string;
};

function newPost(): EditablePost {
  return {
    id: crypto.randomUUID(),
    image: "",
    url: "",
    enabled: true,
  };
}

export function InstagramFeedManager({
  initialSettings,
  initialPosts,
  graphStatus,
}: {
  initialSettings: InstagramSettings;
  initialPosts: EditablePost[];
  graphStatus: InstagramGraphStatus;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [posts, setPosts] = useState<EditablePost[]>(initialPosts);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [state, setState] = useState<FormState>(initialFormState);
  const [testState, setTestState] = useState<FormState>(initialFormState);
  const [isPending, startTransition] = useTransition();
  const [isTesting, startTestTransition] = useTransition();

  const updatePost = useCallback((id: string, patch: Partial<EditablePost>) => {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, ...patch } : post)),
    );
  }, []);

  const removePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
    setFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const onFileChange = useCallback((id: string, file: File | null) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFiles((prev) => ({ ...prev, [id]: file }));
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, previewUrl } : post)),
    );
  }, []);

  const onSubmit = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("enabled", settings.enabled ? "true" : "false");
      formData.set("source", settings.source);
      formData.set("post_limit", String(settings.postLimit));
      formData.set("eyebrow", settings.eyebrow);
      formData.set("title", settings.title);
      formData.set(
        "posts_json",
        JSON.stringify(
          posts.map(({ id, image, url, enabled }) => ({ id, image, url, enabled })),
        ),
      );

      for (const [id, file] of Object.entries(files)) {
        formData.set(`image_${id}`, file);
      }

      const result = await saveInstagramSettings(initialFormState, formData);
      setState(result);
      if (result.status === "success") setFiles({});
    });
  };

  const onTestConnection = () => {
    startTestTransition(async () => {
      const result = await testInstagramGraphConnection();
      setTestState(result);
    });
  };

  const isGraph = settings.source === "graph";

  return (
    <div className="space-y-6">
      <FormMessage state={state} />
      <FormMessage state={testState} />

      <div
        className={`rounded-xl border px-4 py-3 text-sm ${
          graphStatus.connected
            ? "border-green-200 bg-green-50 text-green-900"
            : graphStatus.configured
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-espresso/10 bg-cream/60 text-mocha"
        }`}
      >
        {graphStatus.connected ? (
          <p>
            API bağlı: <strong>@{graphStatus.username}</strong>
            {graphStatus.userId ? ` (${graphStatus.userId})` : ""}
            {graphStatus.host ? (
              <span className="mt-1 block text-xs opacity-80">
                Host: {graphStatus.host}
              </span>
            ) : null}
          </p>
        ) : graphStatus.configured ? (
          <p>Token tanımlı ama bağlantı kurulamadı: {graphStatus.error}</p>
        ) : (
          <p>{graphStatus.error}</p>
        )}
        {!graphStatus.configured ? (
          <p className="mt-2 text-xs opacity-90">
            Vercel → Project → Settings → Environment Variables içine{" "}
            <code className="rounded bg-white/70 px-1">INSTAGRAM_ACCESS_TOKEN</code>
            {" "}ekleyin; isteğe bağlı{" "}
            <code className="rounded bg-white/70 px-1">INSTAGRAM_USER_ID</code>.
            Kaydettikten sonra redeploy gerekir.
          </p>
        ) : null}
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-espresso/10 bg-cream/60 p-4">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, enabled: e.target.checked }))
          }
          className="mt-1 h-4 w-4 rounded border-espresso/20 text-gold focus:ring-gold"
        />
        <span>
          <span className="block text-sm font-medium text-espresso">
            Instagram bölümünü ana sayfada göster
          </span>
          <span className="mt-1 block text-xs text-mocha">
            Footer&apos;ın hemen üstünde görünür.
          </span>
        </span>
      </label>

      <div className="space-y-3">
        <p className="text-sm font-medium text-espresso">Veri kaynağı</p>
        <div className="flex flex-wrap gap-4">
          {(
            [
              ["graph", "Graph API (otomatik)"],
              ["manual", "Manuel yükleme"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm text-mocha">
              <input
                type="radio"
                name="source"
                checked={settings.source === value}
                onChange={() =>
                  setSettings((prev) => ({ ...prev, source: value as InstagramSource }))
                }
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Üst başlık"
          name="eyebrow"
          value={settings.eyebrow}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, eyebrow: e.target.value }))
          }
        />
        <InputField
          label="Başlık"
          name="title"
          value={settings.title}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        {isGraph && (
          <InputField
            label="Gösterilecek gönderi sayısı"
            name="post_limit"
            type="number"
            min={3}
            max={12}
            value={String(settings.postLimit)}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                postLimit: Number(e.target.value) || 6,
              }))
            }
          />
        )}
      </div>

      {isGraph ? (
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={onTestConnection} disabled={isTesting}>
            {isTesting ? "Test ediliyor..." : "Bağlantıyı Test Et"}
          </Button>
          <Button type="button" onClick={onSubmit} disabled={isPending}>
            {isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="rounded-2xl border border-espresso/10 bg-white/50 p-5"
              >
                <div className="flex flex-wrap items-start gap-5">
                  <div className="relative h-28 w-28 overflow-hidden rounded-xl bg-champagne">
                    {post.previewUrl ? (
                      <Image
                        src={post.previewUrl}
                        alt=""
                        fill
                        sizes="112px"
                        className="object-cover"
                        unoptimized={post.previewUrl.startsWith("blob:")}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-mist">
                        Görsel yok
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-[0.15em] text-gold-dark">
                        Gönderi {index + 1}
                      </p>
                      <label className="flex items-center gap-2 text-xs text-mocha">
                        <input
                          type="checkbox"
                          checked={post.enabled}
                          onChange={(e) =>
                            updatePost(post.id, { enabled: e.target.checked })
                          }
                        />
                        Aktif
                      </label>
                    </div>

                    <InputField
                      label="Instagram gönderi linki"
                      name={`url_${post.id}`}
                      value={post.url}
                      onChange={(e) => updatePost(post.id, { url: e.target.value })}
                      placeholder="https://www.instagram.com/p/..."
                      required
                    />

                    <InputField
                      label="Görsel"
                      name={`file_${post.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        onFileChange(post.id, e.target.files?.[0] ?? null)
                      }
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removePost(post.id)}
                    className="text-sm text-red-700 transition-colors hover:text-red-900"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPosts((prev) => [...prev, newPost()])}
              disabled={posts.length >= 12}
            >
              Gönderi Ekle
            </Button>
            <Button type="button" onClick={onSubmit} disabled={isPending}>
              {isPending ? "Kaydediliyor..." : "Instagram Akışını Kaydet"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
