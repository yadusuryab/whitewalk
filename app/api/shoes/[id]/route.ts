// app/api/shoes/[id]/route.ts
import { NextResponse } from "next/server";
import { fetchShoeById } from "@/lib/vehicleQueries.server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await fetchShoeById(id);
  if (!data) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}