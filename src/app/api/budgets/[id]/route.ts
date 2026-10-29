import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const budget = await prisma.budget.findUnique({ where: { id } });

  if (!budget || budget.userId !== session.user.id) {
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  }

  await prisma.budget.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
