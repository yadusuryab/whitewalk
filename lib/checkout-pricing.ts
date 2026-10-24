// lib/checkout-pricing.ts
import {
  BASE_PRICE,
  SHOE_CLEANER_PRICE,
  OFFER_CONFIG,
  toPairCount,
  getOfferShipping,
  getCodCharge,
  type PairCount,
} from "@/lib/checkout-constants";

export type CartLineInput = {
  productId: string;
  selectedSize: string;
  isFreeItem?: boolean;
};

export type PricedCart = {
  pairCount: PairCount;
  subtotal: number;
  /** Prepaid per-pair shipping (0 for COD). */
  offerShipping: number;
  /** Per-pair COD charge (0 for prepaid). */
  codCharge: number;
  /** Combined: offerShipping + codCharge. Kept for backward compat. */
  shippingCharge: number;
  cleanerCharge: number;
  totalAmount: number;
  isCod: boolean;
  /** What the customer pays right now. 0 for COD. */
  paymentAmount: number;
  /** What the customer pays on delivery. Full total for COD, 0 for prepaid. */
  remainingAmount: number;
  items: Array<{
    productId: string;
    productName: string;
    imageUrl: string;
    size: string;
    price: number;
    isFreeItem: boolean;
  }>;
};

export async function priceCart(
  sanity: any,
  lines: CartLineInput[],
  opts: {
    shippingMethod: "online" | "cod";
    addShoeCleaner: boolean;
    /** Customer's state — decides Kerala vs outside-Kerala pricing. */
    state?: string;
    /** Optional override; otherwise inferred from lines.length. */
    pairCount?: PairCount;
  },
): Promise<PricedCart> {
  if (!lines.length) throw new Error("Cart is empty");

  const pairCount: PairCount = toPairCount(opts.pairCount ?? lines.length);
  if (lines.length !== pairCount) {
    throw new Error("Cart does not match the selected pair offer");
  }

  const ids = lines.map((l) => l.productId);

  const products = await sanity.fetch(
    `*[_type == "shoe" && _id in $ids]{
      _id,
      productName,
      price,
      "rawImage": coalesce(images[0].asset->url, "")
    }`,
    { ids },
  );

  const byId = new Map(products.map((p: any) => [p._id, p]));

  const missing: string[] = [];
  const built = lines.map((l) => {
    const p: any = byId.get(l.productId);
    if (!p) {
      missing.push(l.productId);
      return null;
    }
    return {
      productId: p._id,
      productName: p.productName ?? "Unknown product",
      imageUrl: p.rawImage
        ? `${p.rawImage}?w=400&h=400&auto=format&q=85&fit=crop`
        : "",
      size: l.selectedSize,
      price: typeof p.price === "number" ? p.price : BASE_PRICE,
      isFreeItem: !!l.isFreeItem,
    };
  });

  if (missing.length) {
    const err: any = new Error(
      `Some products are no longer available: ${missing.join(", ")}`,
    );
    err.code = "PRODUCT_NOT_FOUND";
    err.missingProductIds = missing;
    throw err;
  }

  const items = built as NonNullable<(typeof built)[number]>[];

  // Premiums — never charged on the surprise 3rd pair.
  const pair1Extra = Math.max(0, items[0].price - BASE_PRICE);
  const pair2Extra =
    pairCount >= 2 && items[1]
      ? Math.max(0, items[1].price - BASE_PRICE)
      : 0;
  const pair3Extra = 0; // 3rd pair is a free surprise within the base offer

  const offer = OFFER_CONFIG[pairCount];
  const subtotal = offer.basePrice + pair1Extra + pair2Extra + pair3Extra;

  const isCod = opts.shippingMethod === "cod";

  // PREPAID: region shipping. COD: no shipping, per-pair COD charge instead.
  const offerShipping = isCod
    ? 0
    : getOfferShipping(pairCount, opts.state);
  const codCharge = isCod ? getCodCharge(pairCount, opts.state) : 0;
  const shippingCharge = offerShipping + codCharge;

  const cleanerCharge = opts.addShoeCleaner ? SHOE_CLEANER_PRICE : 0;
  const totalAmount = subtotal + shippingCharge + cleanerCharge;

  // No COD advance — full amount is paid on delivery.
  const paymentAmount = isCod ? 0 : totalAmount;
  const remainingAmount = isCod ? totalAmount : 0;

  return {
    pairCount,
    subtotal,
    offerShipping,
    codCharge,
    shippingCharge,
    cleanerCharge,
    totalAmount,
    isCod,
    paymentAmount,
    remainingAmount,
    items,
  };
}

export function generateOrderId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `FTX-${ymd}-${rand}`;
}