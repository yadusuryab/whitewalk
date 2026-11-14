// app/api/revalidate/route.ts  (Sanity webhook → instant refresh on edits)
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== process.env.REVALIDATE_SECRET)
    return NextResponse.json({ ok: false }, { status: 401 });
  ["shoes", "reviews"].forEach((t) => revalidateTag(t, "max"));
  return NextResponse.json({ ok: true });
}