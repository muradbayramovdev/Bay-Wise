import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateTransactionCaches } from "@/lib/invalidate";
import { validateAmount, validateTransactionType, validateOptionalString } from "@/lib/validate";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const transaction = await prisma.transaction.findUnique({ where: { id } });

  if (!transaction || transaction.userId !== session.user.id) {
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id } });
  invalidateTransactionCaches(session.user.id, transaction.date);
  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const transaction = await prisma.transaction.findUnique({ where: { id } });

  if (!transaction || transaction.userId !== session.user.id) {
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const amount = validateAmount(body.amount);
    const type = validateTransactionType(body.type);
    const note = validateOptionalString(body.note, 500);

    if (!amount) return NextResponse.json({ error: "Geçersiz tutar." }, { status: 400 });
    if (!type) return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });
    if (!body.categoryId) return NextResponse.json({ error: "Kategori zorunludur." }, { status: 400 });

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        type,
        categoryId: body.categoryId,
        note,
        date: body.date ? new Date(body.date) : transaction.date,
      },
      include: { category: true },
    });

    invalidateTransactionCaches(session.user.id, transaction.date);
    if (body.date) invalidateTransactionCaches(session.user.id, new Date(body.date));

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[transactions PATCH]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
