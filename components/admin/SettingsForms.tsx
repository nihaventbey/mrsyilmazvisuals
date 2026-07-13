"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { ActionForm } from "@/components/admin/ActionForm";
import {
  saveAboutImageSettings,
  saveAboutSettings,
  saveContactSettings,
  saveGeneralSettings,
  saveHomeSettings,
  saveLogoSettings,
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
    <section className="rounded-2xl border border-espresso/10 bg-white/50 p-4 sm:p-6">
      <h2 className="font-serif text-xl text-espresso">{title}</h2>
      <p className="mt-1 text-sm text-mocha">{description}</p>
      <div className="mt-5 sm:mt-6">{children}</div>
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
    <div className="max-w-5xl space-y-6 sm:space-y-8">
      <Section
        title="Görseller"
        description="Site logosu ve hakkımda sayfası portre fotoğrafı ayrı yüklenir; birbirinin yerine geçmez."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <ActionForm action={saveLogoSettings} submitLabel="Logoları Kaydet">
            <div className="space-y-5">
              <div className="space-y-3 rounded-xl border border-espresso/10 bg-cream/40 p-4">
                <p className="text-sm font-medium text-espresso">Üst menü logosu (yatay)</p>
                <p className="text-xs text-mocha">
                  Sol üst köşede geniş görünür. Şeffaf arka planlı PNG önerilir.
                </p>
                <div className="flex min-h-[88px] w-full items-center justify-start overflow-hidden rounded-lg border border-dashed border-espresso/15 bg-[linear-gradient(45deg,#eee_25%,transparent_25%,transparent_75%,#eee_75%,#eee),linear-gradient(45deg,#eee_25%,transparent_25%,transparent_75%,#eee_75%,#eee)] bg-[length:16px_16px] bg-[position:0_0,8px_8px] px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreview}
                    alt="Üst menü logosu önizleme"
                    className="max-h-16 w-auto max-w-full object-contain"
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
                <p className="text-sm font-medium text-espresso">İkon logosu (yuvarlak/kare)</p>
                <p className="text-xs text-mocha">
                  Favicon ve bakım sayfası için. Yatay logo buraya yüklenmemeli.
                </p>
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-gold/25 bg-cream">
                  <Image
                    src={logoIconPreview}
                    alt="İkon logosu önizleme"
                    fill
                    sizes="96px"
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

          <ActionForm action={saveAboutImageSettings} submitLabel="Hakkımda Görselini Kaydet">
            <div className="space-y-3 rounded-xl border border-espresso/10 bg-cream/40 p-4">
              <p className="text-sm font-medium text-espresso">Hakkımda portre fotoğrafı</p>
              <p className="text-xs text-mocha">
                Ana sayfa ve /hakkimda sayfasındaki büyük dikey fotoğraf. Logo değil,
                portre fotoğrafınızı yükleyin.
              </p>
              <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-gold/20 bg-champagne">
                <Image
                  src={aboutPreview}
                  alt="Hakkımda görseli önizleme"
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
              <InputField
                label="Portre fotoğrafı yükle"
                name="about_image_file"
                type="file"
                accept="image/*"
              />
            </div>
          </ActionForm>
        </div>
      </Section>

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
        description="Site adı, slogan ve temel bilgiler."
      >
        <ActionForm action={saveGeneralSettings} submitLabel="Genel Ayarları Kaydet">
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
        </ActionForm>
      </Section>

      <Section
        title="İletişim"
        description="İletişim sayfası ve footer bilgileri."
      >
        <ActionForm action={saveContactSettings} submitLabel="İletişim Ayarlarını Kaydet">
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Konum"
              name="location"
              defaultValue={contact.location}
              placeholder="Örn. Üsküdar, İstanbul"
            />
            <InputField
              label="Çalışma Saatleri"
              name="working_hours"
              defaultValue={contact.workingHours}
            />
          </div>
          <InputField
            label="Google Maps bağlantısı"
            name="maps_url"
            defaultValue={contact.mapsUrl}
            placeholder="https://maps.app.goo.gl/... veya Google Maps yer linki"
          />
          <p className="text-xs text-mist">
            Link eklenince iletişim sayfasında harita görünür. Boş bırakılırsa harita
            gösterilmez.
          </p>
          <InputField
            label="WhatsApp telefon"
            name="whatsapp_phone"
            defaultValue={contact.whatsappPhone}
            placeholder="+90 544 975 83 38"
          />
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
          <p className="mb-4 rounded-xl border border-gold/20 bg-champagne/30 px-4 py-3 text-sm text-mocha">
            Portre fotoğrafını <strong>Görseller</strong> bölümünden yükleyin.
          </p>
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
          <p className="text-xs text-mist">
            Her satır: Başlık | Açıklama (ör. Samimiyet | Çekimlerimizde rahat hissetmeniz...)
          </p>
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
