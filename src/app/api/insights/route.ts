import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chat } from "@/lib/openai";

const MONTHS_TR = [
  "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
  "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",
];

const memCache = new Map<string, { data: unknown; expiresAt: number }>();

async function buildSummary(userId: string, month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevStart = new Date(prevYear, prevMonth - 1, 1);
  const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59);

  const [transactions, prevTransactions, budgets] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { category: true },
    }),
    prisma.transaction.findMany({
      where: { userId, type: "EXPENSE", date: { gte: prevStart, lte: prevEnd } },
      select: { amount: true },
    }),
    prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    }),
  ]);

  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const lastMonthExpense = prevTransactions.reduce((s, t) => s + t.amount, 0);

  const catMap: Record<string, { name: string; amount: number }> = {};
  transactions.filter(t => t.type === "EXPENSE").forEach(t => {
    const k = t.category.id;
    if (!catMap[k]) catMap[k] = { name: t.category.name, amount: 0 };
    catMap[k].amount += t.amount;
  });
  const topCategory = Object.values(catMap).sort((a, b) => b.amount - a.amount)[0] ?? null;

  const budgetStatus = budgets.map(b => {
    const spent = catMap[b.categoryId]?.amount ?? 0;
    return { category: b.category.name, limit: b.amount, spent, pct: Math.round((spent / b.amount) * 100) };
  });

  return {
    monthLabel: `${MONTHS_TR[month - 1]} ${year}`,
    totalIncome: Math.round(totalIncome),
    totalExpense: Math.round(totalExpense),
    net: Math.round(totalIncome - totalExpense),
    lastMonthExpense: Math.round(lastMonthExpense),
    topCategory,
    budgetStatus,
    hasData: transactions.length > 0,
  };
}

async function generateInsights(summary: Awaited<ReturnType<typeof buildSummary>>) {
  const prompt = `Sen bir kişisel finans asistanısın. Aşağıdaki aylık finansal özeti analiz et ve kullanıcıya 1-3 kısa, pratik ve spesifik içgörü sun. Türkçe yaz. Her içgörü tek cümle olsun. Genel tavsiye verme, sadece bu veriye özgü gözlem yap.

Veri:
- Ay: ${summary.monthLabel}
- Toplam gelir: ${summary.totalIncome} TL
- Toplam gider: ${summary.totalExpense} TL
- Net bakiye: ${summary.net} TL
- Geçen ay gider: ${summary.lastMonthExpense} TL
${summary.topCategory ? `- En yüksek harcama: ${summary.topCategory.name} (${summary.topCategory.amount} TL)` : ""}
${summary.budgetStatus.length > 0 ? `- Bütçeler: ${summary.budgetStatus.map(b => `${b.category} %${b.pct}`).join(", ")}` : ""}

Sadece JSON array döndür, başka hiçbir şey yazma. Örnek: ["içgörü 1", "içgörü 2"]`;

  const text = await chat(prompt, 200);
  console.log("[insights] OpenAI response:", text);

  const match = text.match(/\[[\s\S]*?\]/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = Number(searchParams.get("month") ?? now.getMonth() + 1);
  const year = Number(searchParams.get("year") ?? now.getFullYear());
  const force = searchParams.get("force") === "1";

  const cacheKey = `${session.user.id}-${month}-${year}`;
  const cached = memCache.get(cacheKey);

  if (!force && cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {
    const summary = await buildSummary(session.user.id, month, year);

    if (!summary.hasData) {
      return NextResponse.json({ insights: [], hasData: false, generatedAt: new Date().toISOString() });
    }

    const insights = await generateInsights(summary);
    const data = { insights, hasData: true, generatedAt: new Date().toISOString() };
    memCache.set(cacheKey, { data, expiresAt: Date.now() + 6 * 60 * 60 * 1000 });

    return NextResponse.json(data);
  } catch (err) {
    console.error("[insights] HATA:", err);
    return NextResponse.json({ error: "Analiz oluşturulamadı.", detail: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  if (month && year) memCache.delete(`${session.user.id}-${month}-${year}`);

  return NextResponse.json({ success: true });
}
