import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCachedTrend } from "@/lib/cache";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });

  const data = await getCachedTrend(session.user.id);
  return NextResponse.json(data);
}
