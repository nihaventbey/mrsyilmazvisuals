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
  logoPreview,
  logoIconPreview,
  aboutPreview,
}: {
  settings: SiteSettings;
  maintenance: MaintenanceSettings;
  logoPreview: string;
  logoIconPreview: string;
  aboutPreview: string;
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
        description="Site adı, slogan, logo ve temel bilgiler."
      >
        <ActionForm action={saveGeneralSettings} submitLabel="Genel Ayarları Kaydet">
          <input type="hidden" name="logo_image" value={general.logoImage} />
          <input type="hidden" name="logo_icon" value={general.logoIcon} />
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
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-espresso/10 bg-cream/40 p-4">
              <p className="text-sm font-medium text-espresso">Üst menü logosu (yatay)</p>
              <p className="text-xs text-mocha">
                Sol üst köşede görünür. Şeffaf arka planlı PNG veya SVG önerilir.
              </p>
              <div className="relative flex h-16 w-full items-center justify-start overflow-hidden rounded-lg border border-gold/20 bg-cream px-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview}
                  alt="Üst menü logosu önizleme"
                  className="max-h-12 w-auto max-w-full object-contain"
                />
              </div>
              <InputField
                label="Yatay logo yükle"
                name="logo_file"
                type="file"
                accept="image/*"
              />
            </div>

            <div className="space-y-3 rounded-xl border border-espresso/10 bg-cream/40 p-4">
              <p className="text-sm font-medium text-espresso">İkon logosu (yuvarlak)</p>
              <p className="text-xs text-mocha">
                Favicon, bakım sayfası ve küçük alanlar için. Kare veya yuvarlak ikon.
              </p>
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gold/25 bg-cream">
                <Image
                  src={logoIconPreview}
                  alt="İkon logosu önizleme"
                  fill
                  sizes="80px"
                  className="object-contain p-2"
                />
              </div>
              <InputField
                label="İkon logo yükle"
                name="logo_icon_file"
                type="file"
                accept="image/*"
              />
            </div>
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
          <input type="hidden" name="about_image" value={about.aboutImage} />
          <div className="flex items-center gap-4">
            <div className="relative h-28 w-24 overflow-hidden rounded-xl bg-champagne">
              <Image
                src={aboutPreview}
                alt="Hakkımda görseli"
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <InputField
              label="Hakkımda Görseli Değiştir"
              name="about_image_file"
              type="file"
              accept="image/*"
            />
          </div>
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
