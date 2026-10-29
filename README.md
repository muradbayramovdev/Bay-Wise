# BayWise — Kişisel Finans Takibi

Basit, hızlı ve mobil öncelikli kişisel finans uygulaması.

## Özellikler

- Gelir/gider takibi
- Kategori sistemi
- Aylık bütçe yönetimi
- Tekrarlayan işlemler
- 6 aylık trend analizi
- AI destekli içgörüler (OpenAI)
- AI finans asistanı
- Dark/light mode
- Admin paneli

## Kurulum

### Gereksinimler

- Node.js 20+
- MySQL 8+

### Yerel Geliştirme

```bash
# Bağımlılıkları kur
npm install

# .env.local dosyasını oluştur
cp .env .env.local
# .env.local içindeki değerleri düzenle

# Veritabanı tablolarını oluştur
npx prisma db push

# Varsayılan kategorileri ekle
npx tsx prisma/seed.ts

# Geliştirme sunucusunu başlat
npm run dev
```

### Admin Hesabı Oluşturma

Kayıt olduktan sonra:

```bash
npx tsx scripts/make-admin.ts
# scripts/make-admin.ts içindeki email'i kendi email'inle değiştir
```

## Netlify Deploy

### 1. Veritabanı

Ücretsiz MySQL için: [PlanetScale](https://planetscale.com) veya [Railway](https://railway.app)

### 2. Netlify Environment Variables

Netlify dashboard → Site settings → Environment variables:

```
DATABASE_URL=mysql://user:pass@host:3306/baywise
NEXTAUTH_SECRET=güçlü-rastgele-bir-string
NEXTAUTH_URL=https://senin-site-adresi.netlify.app
AUTH_SECRET=güçlü-rastgele-bir-string
OPENAI_API_KEY=sk-...
```

### 3. Deploy

```bash
# Netlify CLI ile
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

Veya GitHub'a push et, Netlify'da repo'yu bağla.

### 4. Veritabanı Tablolarını Oluştur

Deploy sonrası Netlify Functions üzerinden veya local'den:

```bash
DATABASE_URL="production-url" npx prisma db push
DATABASE_URL="production-url" npx tsx prisma/seed.ts
```

## Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `DATABASE_URL` | MySQL bağlantı URL'i | ✓ |
| `NEXTAUTH_SECRET` | JWT imzalama anahtarı | ✓ |
| `AUTH_SECRET` | NextAuth v5 secret | ✓ |
| `NEXTAUTH_URL` | Uygulamanın tam URL'i | ✓ |
| `OPENAI_API_KEY` | OpenAI API anahtarı | AI için |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: MySQL + Prisma ORM
- **Auth**: NextAuth.js v5
- **UI**: Tailwind CSS 4 + Recharts
- **AI**: OpenAI GPT-4o-mini
