"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ActionForm } from "@/components/admin/ActionForm";
import {
  saveAboutSettings,
  saveContactSettings,
  saveGeneralSettings,
  saveHomeSettings,
  saveMaintenanceSettings,
} from "@/app/admin/actions";
import { InputField, TextareaField } from "@/components/ui/Field";
import type { SiteSettings } from "@/lib/settings";
import type { MaintenanceSettings } from "@/lib/maintenance";
import {
  formatParagraphs,
  formatTimeline,
  formatValues,
} from "@/lib/settings";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-espresso/10 bg-white/50 p-6">
      <h2 className="font-serif text-xl text-espresso">{title}</h2>
      <p className="mt-1 text-sm text-mocha">{description}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function SettingsForms({
  settings,
  maintenance,
  profilePreview,
}: {
  settings: SiteSettings;
  maintenance: MaintenanceSettings;
  profilePreview: string;
}) {
  const { general, contact, about, home } = settings;

  return (
    <div className="max-w-3xl space-y-8">
      <Section
        title="Bakım Modu"
        description="Siteyi ziyaretçilere kapatın. Yönetim paneli ve giriş yapmış adminler siteyi görmeye devam eder."
      >
        <ActionForm action={saveMaintenanceSettings} submitLabel="Bakım Ayarlarını Kaydet">
          <label className="flex items-start gap-3 rounded-xl border border-espresso/10 bg-cream/60 p-4">
            <input
              type="checkbox"
              name="enabled"
              defaultChecked={maintenance.enabled}
              className="mt-1 h-4 w-4 rounded border-espresso/20 text-gold focus:ring-gold"
            />
            <span>
              <span className="block text-sm font-medium text-espresso">
                Bakım modunu etkinleştir
              </span>
              <span className="mt-1 block text-xs text-mocha">
                Aktifken ziyaretçiler yalnızca bakım sayfasını görür.
              </span>
            </span>
          </label>
          <InputField
            label="Başlık"
            name="title"
            defaultValue={maintenance.title}
            required
          />
          <TextareaField
            label="Mesaj"
            name="message"
            defaultValue={maintenance.message}
            className="min-h-28"
            required
          />
        </ActionForm>
      </Section>

      <Section
        title="Genel"
        description="Site adı, slogan, açıklama ve profil bilgileri."
      >
        <ActionForm action={saveGeneralSettings} submitLabel="Genel Ayarları Kaydet">
          <input type="hidden" name="profile_image" value={general.profileImage} />
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Site Adı" name="name" defaultValue={general.name} required />
            <InputField label="İsim" name="author" defaultValue={general.author} required />
          </div>
          <InputField label="Slogan" name="tagline" defaultValue={general.tagline} required />
          <TextareaField
            label="Kısa Açıklama"
            name="description"
            defaultValue={general.description}
            className="min-h-24"
          />
          <InputField label="Site URL" name="url" defaultValue={general.url} />
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-champagne">
              <Image
                src={profilePreview}
                alt={general.author}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <InputField
              label="Profil Fotoğrafı Değiştir"
              name="profile_file"
              type="file"
              accept="image/*"
            />
          </div>
        </ActionForm>
      </Section>

      <Section
        title="İletişim"
        description="İletişim sayfası ve footer bilgileri."
      >
        <ActionForm action={saveContactSettings} submitLabel="İletişim Ayarlarını Kaydet">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField label="Konum" name="location" defaultValue={contact.location} />
            <InputField
              label="Çalışma Saatleri"
              name="working_hours"
              defaultValue={contact.workingHours}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Instagram Kullanıcı Adı"
              name="instagram_handle"
              defaultValue={contact.instagramHandle}
            />
            <InputField
              label="Instagram URL"
              name="instagram_url"
              defaultValue={contact.instagramUrl}
            />
          </div>
          <InputField
            label="İletişim Sayfası Başlığı"
            name="page_title"
            defaultValue={contact.pageTitle}
          />
          <TextareaField
            label="İletişim Sayfası Açıklaması"
            name="page_description"
            defaultValue={contact.pageDescription}
            className="min-h-20"
          />
          <TextareaField
            label="Form Alt Notu"
            name="form_note"
            defaultValue={contact.formNote}
            className="min-h-20"
          />
        </ActionForm>
      </Section>

      <Section
        title="Hakkımda"
        description="Hakkımda sayfası ve ana sayfa önizleme metinleri."
      >
        <ActionForm action={saveAboutSettings} submitLabel="Hakkımda İçeriğini Kaydet">
          <TextareaField
            label="Sayfa Açıklaması"
            name="page_description"
            defaultValue={about.pageDescription}
            className="min-h-20"
          />
          <TextareaField
            label="Biyografi Paragrafları"
            name="bio_paragraphs"
            defaultValue={formatParagraphs(about.bioParagraphs)}
            className="min-h-40"
          />
          <p className="text-xs text-mist">Paragrafları boş satırla ayırın.</p>
          <TextareaField
            label="Ana Sayfa Önizleme Paragrafları"
            name="preview_paragraphs"
            defaultValue={formatParagraphs(about.previewParagraphs)}
            className="min-h-32"
          />
          <TextareaField
            label="Zaman Çizelgesi"
            name="timeline"
            defaultValue={formatTimeline(about.timeline)}
            className="min-h-32 font-mono text-xs"
          />
          <p className="text-xs text-mist">
            Her satır: Yıl | Başlık | Açıklama
          </p>
          <TextareaField
            label="Değerler"
            name="values"
            defaultValue={formatValues(about.values)}
            className="min-h-32 font-mono text-xs"
          />
          <p className="text-xs text-mist">Her satır: Başlık | Açıklama</p>
        </ActionForm>
      </Section>

      <Section
        title="Ana Sayfa"
        description="Hizmetler bölümü ve alt CTA bandı."
      >
        <ActionForm action={saveHomeSettings} submitLabel="Ana Sayfa Ayarlarını Kaydet">
          <InputField
            label="Hizmetler Üst Başlık"
            name="services_eyebrow"
            defaultValue={home.servicesEyebrow}
          />
          <InputField
            label="Hizmetler Başlığı"
            name="services_title"
            defaultValue={home.servicesTitle}
          />
          <TextareaField
            label="Hizmetler Açıklaması"
            name="services_description"
            defaultValue={home.servicesDescription}
            className="min-h-20"
          />
          <InputField label="CTA Başlığı" name="cta_title" defaultValue={home.ctaTitle} />
          <TextareaField
            label="CTA Açıklaması"
            name="cta_description"
            defaultValue={home.ctaDescription}
            className="min-h-20"
          />
        </ActionForm>
      </Section>
    </div>
  );
}
