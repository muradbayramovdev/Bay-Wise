# 💰 BayWise: Personal Finance Tracker

A simple, fast, mobile-first personal finance app. Track your spending, manage your budget, and understand your financial health with AI-powered insights.

> 🚧 **Status:** In active development. A live version is deployed on Netlify, but features are still being added and refined.

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
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Authentication | NextAuth.js v5 |
| UI | Tailwind CSS 4 + Recharts |
| AI | OpenAI GPT-4o-mini |
| Hosting | Netlify |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (a free [Supabase](https://supabase.com) project works well)

### Local Development

**1. Install dependencies:**

```bash
npm install
```

**2. Create the environment file:**

```bash
cp .env.example .env
```

Edit `.env` and set your own values (see the table below).

**3. Create the database tables and seed default categories:**

```bash
npm run db:push
npm run db:seed
```

**4. Start the development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Creating an Admin Account

Register through the app first. Then set your email in `scripts/make-admin.ts` and run:

```bash
npx tsx scripts/make-admin.ts
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|:--------:|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | JWT signing key | ✅ |
| `AUTH_SECRET` | NextAuth v5 secret | ✅ |
| `NEXTAUTH_URL` | Full URL of the application | ✅ |
| `ADMIN_EMAIL` | Admin email address | Optional |
| `OPENAI_API_KEY` | OpenAI API key | For AI features |

> 💡 To generate a strong secret: `openssl rand -base64 32`

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Run the production build |
| `npm run db:push` | Sync the Prisma schema to the database |
| `npm run db:seed` | Seed default categories |
| `npm run db:studio` | Open Prisma Studio |

## ☁️ Deployment (Netlify)

1. Create a PostgreSQL database (Supabase) and run `npm run db:push` and `npm run db:seed` against it.
2. Push the repository to GitHub and connect it in Netlify.
3. In **Site configuration → Environment variables**, add the variables from the table above with your production values. `NEXTAUTH_URL` must be your site's full URL.

## 🤖 Development Approach

BayWise was conceived, designed, and directed by **Murad Bayramov**, including the product idea, feature set, UI/UX design, architecture decisions, testing, and review. The implementation was developed with AI-assisted tools under the author's direction.

## 📬 Author

**Murad Bayramov**: [LinkedIn](https://www.linkedin.com/in/muradbayramov251/) · [GitHub](https://github.com/muradbayramovdev)

## 📄 License & Ownership

Copyright © 2026 Murad Bayramov. All rights reserved.

This source code is provided for viewing and portfolio purposes only. No permission is granted to copy, modify, distribute, or use it commercially without written permission from the author.

The **BayWise** name and logo are the property of Murad Bayramov.

---

Built with ❤️ by **Murad Bayramov**