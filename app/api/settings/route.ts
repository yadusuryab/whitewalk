// app/api/settings/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanityClient";

export async function GET() {
  const data = await client.fetch(
    `*[_type == "settings"][0]{ freeSocksOffer, shoeCleanerAddon, upiId }`,
    {},
    { next: { revalidate: 300, tags: ["settings"] } },
  );
  return NextResponse.json(data ?? {}, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}