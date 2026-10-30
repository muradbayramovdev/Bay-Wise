# 💰 BayWise: Personal Finance Tracker

A simple, fast, mobile-first personal finance app. Track your spending, manage your budget, and understand your financial health with AI-powered insights.

🔗 **Live Demo:** [bay-wise.netlify.app](https://bay-wise.netlify.app/)

## ✨ Features

- 📊 Income and expense tracking
- 🏷️ Category system
- 🎯 Monthly budget management
- 🔁 Recurring transactions
- 📈 6-month trend analysis
- 🤖 AI-powered insights (OpenAI)
- 💬 AI financial assistant
- 🌗 Dark/light mode
- 🛡️ Admin panel

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Database | MySQL + Prisma ORM |
| Authentication | NextAuth.js v5 |
| UI | Tailwind CSS 4 + Recharts |
| AI | OpenAI GPT-4o-mini |
| Hosting | Netlify |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MySQL 8+

### Local Development

**1. Install dependencies:**

```bash
npm install
```

**2. Set up environment variables:**

```bash
cp .env .env.local
```

Edit the values in `.env.local` with your own credentials.

**3. Create the database tables:**

```bash
npx prisma db push
```

**4. Seed the default categories:**

```bash
npx tsx prisma/seed.ts
```

**5. Start the development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Creating an Admin Account

First, register through the app. Then change the email address inside `scripts/make-admin.ts` to your own and run:

```bash
npx tsx scripts/make-admin.ts
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|:--------:|
| `DATABASE_URL` | MySQL connection URL | ✅ |
| `NEXTAUTH_SECRET` | JWT signing key | ✅ |
| `AUTH_SECRET` | NextAuth v5 secret | ✅ |
| `NEXTAUTH_URL` | Full URL of the application | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | For AI features |

> 💡 To generate a strong secret: `openssl rand -base64 32`

## ☁️ Deploying to Netlify

### 1. Database

Set up a cloud-hosted MySQL database. Options: [Railway](https://railway.app), [Aiven](https://aiven.io), [TiDB Cloud](https://www.pingcap.com/tidb-cloud/).

### 2. Environment Variables

In the Netlify dashboard, go to **Site settings → Environment variables** and add:

```env
DATABASE_URL=mysql://user:pass@host:3306/baywise
NEXTAUTH_SECRET=your-strong-random-string
NEXTAUTH_URL=https://your-site-address.netlify.app
AUTH_SECRET=your-strong-random-string
OPENAI_API_KEY=sk-...
```

### 3. Deploy

**Using the Netlify CLI:**

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

**Or via GitHub:** Push the repo to GitHub and connect it in Netlify. Every push triggers an automatic deploy.

### 4. Create the Production Database Tables

After deploying, run this from your local machine against the production database:

```bash
DATABASE_URL="production-url" npx prisma db push
DATABASE_URL="production-url" npx tsx prisma/seed.ts
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by **Murad Bayramov**
