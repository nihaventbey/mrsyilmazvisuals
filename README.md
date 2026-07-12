# Mrs Yılmaz Visuals

Bebek, doğum, hamile ve düğün çekimleri yapan bir fotoğrafçı için Next.js +
Supabase ile geliştirilmiş kişisel biyografi, portfolyo ve yönetim paneli
sitesi.

## Özellikler

- **3D animasyonlu hero** — tam ekran, WebGL (react-three-fiber) altın küre,
  halka ve bokeh efektleri; WebGL yoksa zarif CSS animasyonlu fallback
- **Ana sayfa** — hizmetler, öne çıkan portfolyo, biyografi ve blog önizlemesi
- **Portfolyo** — Supabase'den beslenen kategori galerileri + lightbox
- **Fiyatlandırma** — paket kartları ve SSS (veritabanından)
- **Blog** — Markdown içerikli yazılar (veritabanından)
- **İletişim & Rezervasyon** — formlar Supabase'e kaydedilir + e-posta bildirimi
- **Yönetim paneli** (`/admin`) — Supabase Auth ile korumalı; portfolyo,
  blog, paket, SSS, rezervasyon ve mesaj yönetimi
- **SEO** — metadata, Open Graph, `sitemap.xml`, `robots.txt`

## Teknolojiler

- Next.js 16 (App Router, Turbopack, Server Actions, `proxy.ts`)
- TypeScript, Tailwind CSS v4
- Supabase (Postgres + RLS, Auth, Storage) — `@supabase/ssr`
- Three.js / @react-three/fiber / @react-three/drei
- Zod, marked, gray-matter

## Kurulum

```bash
npm install
cp .env.local.example .env.local   # değerleri doldurun
npm run dev
```

### Supabase kurulumu

1. `supabase/migrations/0001_initial_schema.sql` dosyasını Supabase
   Dashboard > SQL Editor'da çalıştırın (tablolar + RLS + storage bucket).
2. `supabase/migrations/0002_seed_content.sql` ile örnek içeriği yükleyin.
3. Dashboard > Settings > API Keys'den **publishable key**'i kopyalayıp
   `.env.local` içine yazın.
4. Dashboard > Authentication > Users'dan kendinize bir admin kullanıcısı
   oluşturun (e-posta + şifre). Bu hesapla `/admin/giris` üzerinden panele
   girebilirsiniz.

> Supabase anahtarları tanımlanmadıysa site `content/` klasöründeki yerel
> içerikle çalışmaya devam eder; formlar konsola log yazar.

## Veri Modeli

| Tablo | Amaç |
|-------|------|
| `categories` | Portfolyo kategorileri (bebek, doğum, hamile, düğün) |
| `portfolio_images` | Galeri görselleri (storage yolu + öne çıkan işareti) |
| `blog_posts` | Markdown içerikli blog yazıları (taslak/yayın) |
| `packages` | Fiyat paketleri |
| `faq_items` | Sık sorulan sorular |
| `bookings` | Rezervasyon talepleri (durum takibi) |
| `contact_messages` | İletişim formu mesajları |
| `site_settings` | Genişletilebilir site ayarları (jsonb) |

Tüm tablolarda RLS aktiftir: içerik herkese okunur, yazma işlemleri yalnızca
giriş yapmış (admin) kullanıcıya açıktır. Form tabloları anonim `insert`
kabul eder ama yalnızca admin okuyabilir. `portfolio` storage bucket'ı
herkese açık okuma, admin'e yazma izni verir.

## Yönetim Paneli

- `/admin/giris` — giriş
- `/admin` — genel bakış (sayaçlar + son rezervasyonlar)
- `/admin/portfolyo` — görsel yükleme/silme, öne çıkarma
- `/admin/blog` — yazı oluşturma/düzenleme/yayınlama
- `/admin/paketler`, `/admin/sss` — fiyat ve SSS yönetimi
- `/admin/rezervasyonlar` — durum güncelleme (yeni/onaylandı/tamamlandı/iptal)
- `/admin/mesajlar` — okundu işaretleme

## Dağıtım

Vercel önerilir. Ortam değişkenlerini (`.env.local.example` içeriği) Vercel
proje ayarlarına ekleyin.
