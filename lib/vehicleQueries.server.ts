// lib/vehicleQueries.server.ts  (server only, never import in client components)
import "server-only";
import { client } from "@/sanityClient";

const offerFilterFor = (pairs?: number | null) => {
  if (pairs === 1)
    return `&& (offer1Pair == true || (!defined(offer1Pair) && !defined(offer2Pair) && !defined(offer3Pair)))`;
  if (pairs === 2)
    return `&& (offer2Pair == true || (!defined(offer1Pair) && !defined(offer2Pair) && !defined(offer3Pair) && buyOneGetOne == true))`;
  if (pairs === 3) return `&& offer3Pair == true`;
  return "";
};

export const buildShoesQuery = ({
  price,
  limit = 12,
  offset = 0,
  includeDisabled = false,
  pairs,
}: {
  price?: string | null;
  limit?: number;
  offset?: number;
  includeDisabled?: boolean;
  pairs?: number | null;
}) => {
  const safeLimit = Math.min(Math.max(limit, 1), 24);
  const safeOffset = Math.max(offset, 0);
  const priceFilter = price === "999" || price === "499" ? `&& price == ${price}` : "";
  const disabledFilter = includeDisabled ? "" : `&& isDisabled != true`;

  return `*[_type == "shoe" ${priceFilter} ${disabledFilter} ${offerFilterFor(pairs)}]
  | order(orderNumber asc) [${safeOffset}...${safeOffset + safeLimit}] {
    _id, productName, sizes, disabledSizes, price, isOffer, offerPrice,
    buyOneGetOne, offer1Pair, offer2Pair, offer3Pair, isDisabled,
    disableReason, stock, productLabel,
    "hasVideo": defined(video.asset),
    "videoUrl": video.asset->url,
    "imageUrl": images[0].asset->url + "?w=360&h=360&auto=format&q=70&fit=crop"
  }`;
};

const SHOE_BY_ID = `*[_type == "shoe" && _id == $id][0] {
  _id, productName, shoeBrand, category, sizes, disabledSizes, colorVariants,
  description, madeIn, price, isOffer, offerPrice, buyOneGetOne,
  "videoUrl": video.asset->url,
  "videoPoster": select(defined(videoPoster.asset) => videoPoster.asset->url + "?w=640&auto=format&q=50", null),
  "images": images[0...4] {
    "url": asset->url + "?w=640&auto=format&q=72&fit=max",
    "thumbnail": asset->url + "?w=96&h=96&auto=format&q=60&fit=crop"
  }
}`;

const REVIEWS = `*[_type == "review" && isApproved == true && count(reviewImages) > 0][0...20].reviewImages[].asset->url`;

const REVALIDATE = 3600;

export const fetchShoes = (args: Parameters<typeof buildShoesQuery>[0]) =>
  client.fetch(buildShoesQuery(args), {}, { next: { revalidate: REVALIDATE, tags: ["shoes"] } });

export const fetchShoeById = (id: string) =>
  client.fetch(SHOE_BY_ID, { id }, { next: { revalidate: REVALIDATE, tags: ["shoes", `shoe-${id}`] } });

export const fetchReviewImages = async (): Promise<string[]> => {
  const urls: string[] = await client.fetch(REVIEWS, {}, { next: { revalidate: REVALIDATE, tags: ["reviews"] } });
  return urls.map((u) => `${u}?w=400&auto=format&q=65`);
};