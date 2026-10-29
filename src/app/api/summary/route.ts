import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCachedSummary } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = Number(searchParams.get("month") ?? now.getMonth() + 1);
  const year = Number(searchParams.get("year") ?? now.getFullYear());

  const data = await getCachedSummary(session.user.id, month, year);
  return NextResponse.json(data);
}
