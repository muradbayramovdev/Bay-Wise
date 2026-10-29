import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateSummary } from "@/lib/invalidate";
import { validateAmount, validateMonth, validateYear } from "@/lib/validate";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = Number(searchParams.get("month") ?? now.getMonth() + 1);
  const year = Number(searchParams.get("year") ?? now.getFullYear());

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  try {
    const [budgets, transactions] = await Promise.all([
      prisma.budget.findMany({
        where: { userId: session.user.id, month, year },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId: session.user.id, type: "EXPENSE", date: { gte: start, lte: end } },
        select: { categoryId: true, amount: true },
      }),
    ]);

    const spendingMap: Record<string, number> = {};
    for (const t of transactions) {
      spendingMap[t.categoryId] = (spendingMap[t.categoryId] ?? 0) + t.amount;
    }

    const result = budgets.map((b) => ({
      id: b.id,
      amount: b.amount,
      month: b.month,
      year: b.year,
      category: b.category,
      spent: spendingMap[b.categoryId] ?? 0,
      exceeded: (spendingMap[b.categoryId] ?? 0) > b.amount,
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("[budgets GET]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  try {
    const body = await req.json();
    const amount = validateAmount(body.amount);
    const month = validateMonth(body.month);
    const year = validateYear(body.year);

    if (!amount) return NextResponse.json({ error: "Geçersiz tutar." }, { status: 400 });
    if (!month) return NextResponse.json({ error: "Geçersiz ay." }, { status: 400 });
    if (!year) return NextResponse.json({ error: "Geçersiz yıl." }, { status: 400 });
    if (!body.categoryId) return NextResponse.json({ error: "Kategori zorunludur." }, { status: 400 });

    const budget = await prisma.budget.upsert({
      where: { userId_categoryId_month_year: { userId: session.user.id, categoryId: body.categoryId, month, year } },
      update: { amount },
      create: { userId: session.user.id, categoryId: body.categoryId, amount, month, year },
      include: { category: true },
    });

    invalidateSummary(session.user.id, month, year);
    return NextResponse.json(budget, { status: 201 });
  } catch (err) {
    console.error("[budgets POST]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
