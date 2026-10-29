import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateTransactionCaches } from "@/lib/invalidate";
import { validateAmount, validateTransactionType, validateOptionalString } from "@/lib/validate";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const type = searchParams.get("type");
  const search = searchParams.get("search")?.trim().slice(0, 100);
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { userId: session.user.id };

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      where.date.lte = end;
    }
  } else if (month && year) {
    const m = Number(month), y = Number(year);
    if (!isNaN(m) && !isNaN(y)) {
      where.date = {
        gte: new Date(y, m - 1, 1),
        lte: new Date(y, m, 0, 23, 59, 59),
      };
    }
  }

  if (type === "INCOME" || type === "EXPENSE") where.type = type;

  if (search) {
    where.OR = [
      { note: { contains: search } },
      { category: { name: { contains: search } } },
    ];
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      take: 200,
    });
    return NextResponse.json(transactions);
  } catch (err) {
    console.error("[transactions GET]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  try {
    const body = await req.json();
    const amount = validateAmount(body.amount);
    const type = validateTransactionType(body.type);
    const note = validateOptionalString(body.note, 500);

    if (!amount) return NextResponse.json({ error: "Geçersiz tutar." }, { status: 400 });
    if (!type) return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });
    if (!body.categoryId) return NextResponse.json({ error: "Kategori zorunludur." }, { status: 400 });

    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        categoryId: body.categoryId,
        note,
        date: body.date ? new Date(body.date) : new Date(),
        userId: session.user.id,
      },
      include: { category: true },
    });

    invalidateTransactionCaches(session.user.id, transaction.date);
    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error("[transactions POST]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
