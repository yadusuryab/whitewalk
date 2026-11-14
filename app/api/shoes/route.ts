// app/api/shoes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { fetchShoes } from "@/lib/vehicleQueries.server";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const data = await fetchShoes({
    price: p.get("price"),
    limit: Number(p.get("limit") ?? 12),
    offset: Number(p.get("offset") ?? 0),
    includeDisabled: p.get("all") === "1",
    pairs: p.get("pairs") ? Number(p.get("pairs")) : null,
  });
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}