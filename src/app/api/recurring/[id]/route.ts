import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const item = await prisma.recurringTransaction.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) {
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  }

  const { isActive } = await req.json();
  const updated = await prisma.recurringTransaction.update({
    where: { id },
    data: { isActive },
    include: { category: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const item = await prisma.recurringTransaction.findUnique({ where: { id } });
  if (!item || item.userId !== session.user.id) {
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  }

  await prisma.recurringTransaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
