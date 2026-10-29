import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextRunAt } from "@/lib/recurring";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const items = await prisma.recurringTransaction.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  try {
    const { amount, type, categoryId, note, frequency, startDate } = await req.json();

    if (!amount || !type || !categoryId || !frequency) {
      return NextResponse.json({ error: "Zorunlu alanlar eksik." }, { status: 400 });
    }

    const firstRun = startDate ? new Date(startDate) : new Date();

    const item = await prisma.recurringTransaction.create({
      data: {
        amount: Number(amount),
        type,
        categoryId,
        note: note || null,
        frequency,
        nextRunAt: firstRun,
        userId: session.user.id,
      },
      include: { category: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
