// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { fetchReviewImages } from "@/lib/vehicleQueries.server";

export async function GET() {
  return NextResponse.json(await fetchReviewImages(), {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}