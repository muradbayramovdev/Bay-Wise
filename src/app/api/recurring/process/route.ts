import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextRunAt } from "@/lib/recurring";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const now = new Date();

  // Find all due recurring transactions for this user
  const due = await prisma.recurringTransaction.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
      nextRunAt: { lte: now },
    },
  });

  if (due.length === 0) return NextResponse.json({ created: 0 });

  let created = 0;

  for (const r of due) {
    // Create the actual transaction
    await prisma.transaction.create({
      data: {
        amount: r.amount,
        type: r.type,
        categoryId: r.categoryId,
        note: r.note,
        date: r.nextRunAt,
        userId: r.userId,
      },
    });

    // Advance nextRunAt
    await prisma.recurringTransaction.update({
      where: { id: r.id },
      data: {
        lastRunAt: r.nextRunAt,
        nextRunAt: getNextRunAt(r.nextRunAt, r.frequency),
      },
    });

    created++;
  }

  return NextResponse.json({ created });
}
