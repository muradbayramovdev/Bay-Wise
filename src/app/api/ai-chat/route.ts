import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chat } from "@/lib/openai";
import { rateLimit } from "@/lib/rateLimit";

const FINANCE_TOPICS = [
  "harcama", "gelir", "gider", "bütçe", "tasarruf", "borç", "yatırım",
  "para", "finans", "maaş", "fatura", "kira", "kredi", "faiz", "enflasyon",
  "kategori", "işlem", "bakiye", "net", "aylık", "haftalık", "günlük",
  "spending", "income", "expense", "budget", "saving", "debt", "investment",
];

function isFinanceRelated(q: string) {
  const lower = q.toLowerCase();
  return FINANCE_TOPICS.some(t => lower.includes(t));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { question } = await req.json();
  if (!question?.trim()) return NextResponse.json({ error: "Soru boş olamaz." }, { status: 400 });

  if (!isFinanceRelated(question)) {
    return NextResponse.json({
      answer: "Sadece kişisel finans konularında yardımcı olabilirim. Harcamalar, bütçe, tasarruf veya gelir/gider hakkında soru sorabilirsin.",
    });
  }

  // Build context from current month
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id, date: { gte: start, lte: end } },
    include: { category: true },
    take: 50,
  });

  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  const catMap: Record<string, number> = {};
  transactions.filter(t => t.type === "EXPENSE").forEach(t => {
    catMap[t.category.name] = (catMap[t.category.name] ?? 0) + t.amount;
  });
  const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const context = transactions.length > 0
    ? `Kullanıcının bu ayki verileri: Gelir: ${Math.round(totalIncome)} TL, Gider: ${Math.round(totalExpense)} TL, Net: ${Math.round(totalIncome - totalExpense)} TL.${topCats.length > 0 ? ` En yüksek harcama kategorileri: ${topCats.map(([n, a]) => `${n} (${Math.round(a)} TL)`).join(", ")}.` : ""}`
    : "Kullanıcının bu ay henüz işlem verisi yok.";

  const prompt = `Sen BayWise adlı kişisel finans uygulamasının AI asistanısın. Sadece kişisel finans konularında yardım et. Kısa, net ve pratik cevaplar ver. Türkçe yaz. Maksimum 3 cümle.

${context}

Kullanıcı sorusu: ${question}`;

  try {
    const answer = await chat(prompt, 250);
    return NextResponse.json({ answer });
  } catch (err: unknown) {
    const e = err as { status?: number };
    if (e?.status === 429) {
      return NextResponse.json({ answer: "AI şu an yoğun, biraz sonra tekrar dene." });
    }
    console.error("[ai-chat]", err);
    return NextResponse.json({ error: "Yanıt alınamadı." }, { status: 500 });
  }
}
