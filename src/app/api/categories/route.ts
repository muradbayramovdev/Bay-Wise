import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCachedCategories } from "@/lib/cache";
import { invalidateCategories } from "@/lib/invalidate";
import { validateString, validateCategoryType } from "@/lib/validate";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  try {
    const categories = await getCachedCategories(session.user.id);
    return NextResponse.json(categories);
  } catch (err) {
    console.error("[categories GET]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  try {
    const body = await req.json();
    const name = validateString(body.name, 50);
    const type = validateCategoryType(body.type);

    if (!name) return NextResponse.json({ error: "Geçersiz kategori adı (max 50 karakter)." }, { status: 400 });
    if (!type) return NextResponse.json({ error: "Geçersiz tür." }, { status: 400 });

    const category = await prisma.category.create({
      data: {
        name,
        icon: typeof body.icon === "string" ? body.icon.slice(0, 10) : "💰",
        color: /^#[0-9a-fA-F]{6}$/.test(body.color) ? body.color : "#6366f1",
        type,
        userId: session.user.id,
      },
    });

    invalidateCategories(session.user.id);
    return NextResponse.json(category, { status: 201 });
  } catch (err) {
    console.error("[categories POST]", err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
