export const BASE_PRICE = 1499;
export const COD_CHARGE = 300;
export const SHOE_CLEANER_PRICE = 80;
export const COD_ADVANCE_AMOUNT = 300;

export const ONLINE_DELIVERY_MIN_DAYS = 5;
export const ONLINE_DELIVERY_MAX_DAYS = 8;
export const COD_DELIVERY_MIN_DAYS = 7;
export const COD_DELIVERY_MAX_DAYS = 10;

/// Add to lib/checkout-constants.ts (keep your existing exports)

// Add to lib/checkout-constants.ts (keep your existing exports)

export type PairCount = 2 | 3;

// 2 pairs: 1499, free shipping.
// 3 pairs: 1500 + 100 shipping per pair (300) = 1800 total.
// (If you want 1799 total, set the 3-pair basePrice to 1499.)
export const OFFER_CONFIG: Record<
  PairCount,
  { basePrice: number; shippingPerPair: number }
> = {
  2: { basePrice: 1499, shippingPerPair: 0 },
  3: { basePrice: 1500, shippingPerPair: 100 },
};

export const toPairCount = (v: unknown): PairCount => (Number(v) === 3 ? 3 : 2);

// Is this shoe part of the N-pair offer? (toggles set in Sanity)
// Old shoes with no toggles set: buyOneGetOne = 2-pair, everything else = 1-pair.
type OfferFlags = {
  offer1Pair?: boolean | null;
  offer2Pair?: boolean | null;
  offer3Pair?: boolean | null;
  buyOneGetOne?: boolean | null;
};

export const isInOffer = (
  product: OfferFlags | null | undefined,
  pairs: number,
): boolean => {
  if (!product) return false;
  const flags = [product.offer1Pair, product.offer2Pair, product.offer3Pair];
  const anySet = flags.some((v) => typeof v === "boolean");
  if (anySet) return flags[pairs - 1] === true;
  return pairs === 2 ? !!product.buyOneGetOne : pairs === 1;
};
// Set in .env.local: NEXT_PUBLIC_UPI_ID=yourname@bank
export const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "";

export const buildUpiLink = ({
  amount,
  payeeName,
  note,
}: {
  amount: number;
  payeeName: string;
  note: string;
}) =>
  `upi://pay?pa=${encodeURIComponent(UPI_ID)}` +
  `&pn=${encodeURIComponent(payeeName)}` +
  `&am=${amount.toFixed(2)}` +
  `&cu=INR` +
  `&tn=${encodeURIComponent(note)}`;