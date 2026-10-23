import { client } from "@/sanityClient";

const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const offerFilterFor = (pairs?: number | null) => {
  if (pairs === 1) {
    return `&& (offer1Pair == true || (!defined(offer1Pair) && !defined(offer2Pair) && !defined(offer3Pair)))`;
  }
  if (pairs === 2) {
    return `&& (offer2Pair == true || (!defined(offer1Pair) && !defined(offer2Pair) && !defined(offer3Pair) && buyOneGetOne == true))`;
  }
  if (pairs === 3) {
    return `&& offer3Pair == true`;
  }
  return "";
};

export const getAllShoes = async (
  price?: string | null,
  limit: number = 24,
  offset: number = 0,
  includeDisabled: boolean = false,
  pairs?: number | null,
): Promise<any[] | undefined> => {
  const cacheKey = `shoes-${price}-${limit}-${offset}-${includeDisabled}-${pairs ?? "all"}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  let priceFilter = "";
  if (price === "999" || price === "499") {
    priceFilter = `&& price == ${price}`;
  }

  const disabledFilter = includeDisabled ? "" : `&& isDisabled != true`;
  const offerFilter = offerFilterFor(pairs);

  const query = `*[_type == "shoe" ${priceFilter} ${disabledFilter} ${offerFilter}] | order(orderNumber asc) [${offset}...${offset + limit}] {
    _id,
    productName,
    sizes,
    disabledSizes,
    price,
    isOffer,
    offerPrice,
    buyOneGetOne,
    offer1Pair,
    offer2Pair,
    offer3Pair,
    isDisabled,
    disableReason,
    stock,
    productLabel,
    "hasVideo": defined(video.asset),
    "videoUrl": video.asset->url,
    "videoPoster": select(
      defined(videoPoster.asset) => videoPoster.asset->url + "?w=800&h=800&auto=format&q=80&fit=crop",
      null
    ),
    "imageUrl": images[0].asset->url + "?w=400&h=400&auto=format&q=85&fit=crop"
  }`;

  try {
    const shoes = await client.fetch(query);

    cache.set(cacheKey, {
      data: shoes,
      timestamp: Date.now(),
    });

    return shoes;
  } catch (error) {
    console.error("Error fetching shoes:", error);
    return undefined;
  }
};

export async function getReviewImages(): Promise<string[]> {
  const query = `*[_type == "review" && isApproved == true && count(reviewImages) > 0].reviewImages[].asset->url`;
  return client.fetch(query);
}

export const getShoeById = async (id: string): Promise<any | undefined> => {
  const cacheKey = `shoe-${id}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const query = `*[_type == "shoe" && _id == $id][0] {
    _id,
    productName,
    shoeBrand,
    category,
    sizes,
    disabledSizes,
    colorVariants,
    description,
    madeIn,
    price,
    isOffer,
    offerPrice,
    buyOneGetOne,
    "videoUrl": video.asset->url,
    "videoPoster": select(
      defined(videoPoster.asset) => videoPoster.asset->url + "?w=800&h=800&auto=format&q=80&fit=crop",
      null
    ),
    "images": images[0...4] {
      "url": asset->url + "?w=800&h=800&auto=format&q=90&fit=fillmax",
      "thumbnail": asset->url + "?w=200&h=200&auto=format&q=80&fit=crop"
    }
  }`;

  try {
    const shoe = await client.fetch(query, { id });

    if (shoe) {
      cache.set(cacheKey, {
        data: shoe,
        timestamp: Date.now(),
      });
    }

    return shoe || undefined;
  } catch (error) {
    console.error("Error fetching shoe:", error);
    return undefined;
  }
};