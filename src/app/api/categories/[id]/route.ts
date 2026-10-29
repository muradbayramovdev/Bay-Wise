import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invalidateCategories } from "@/lib/invalidate";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category || category.isDefault || category.userId !== session.user.id) {
    return NextResponse.json({ error: "Silinemez." }, { status: 403 });
  }

  await prisma.category.delete({ where: { id } });
  invalidateCategories(session.user.id);
  return NextResponse.json({ success: true });
}
