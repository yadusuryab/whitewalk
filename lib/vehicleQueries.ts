// lib/vehicleQueries.ts  (client safe, calls your cached API)
const mem = new Map<string, { data: any; t: number }>();
const TTL = 10 * 60 * 1000;

async function cached<T>(key: string, url: string): Promise<T | undefined> {
  const hit = mem.get(key);
  if (hit && Date.now() - hit.t < TTL) return hit.data;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    mem.set(key, { data, t: Date.now() });
    return data;
  } catch (e) {
    console.error("Fetch error:", url, e);
    return undefined;
  }
}

export const getAllShoes = (
  price?: string | null,
  limit = 12,
  offset = 0,
  includeDisabled = false,
  pairs?: number | null,
): Promise<any[] | undefined> => {
  const qs = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(price ? { price } : {}),
    ...(includeDisabled ? { all: "1" } : {}),
    ...(pairs ? { pairs: String(pairs) } : {}),
  }).toString();
  return cached(`shoes-${qs}`, `/api/shoes?${qs}`);
};

export const getShoeById = (id: string) =>
  cached<any>(`shoe-${id}`, `/api/shoes/${encodeURIComponent(id)}`);

export const getReviewImages = async (): Promise<string[]> =>
  (await cached<string[]>("reviews", "/api/reviews2")) ?? [];