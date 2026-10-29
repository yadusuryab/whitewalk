export const BASE_PRICE = 1499;
export const SHOE_CLEANER_PRICE = 80;

export const ONLINE_DELIVERY_MIN_DAYS = 1;
export const ONLINE_DELIVERY_MAX_DAYS = 3;
export const COD_DELIVERY_MIN_DAYS = 5;
export const COD_DELIVERY_MAX_DAYS = 7;

export type PairCount = 1 | 2 | 3;

// 1 pair:  999
// 2 pairs: 1299
// 3 pairs: 1500
export const OFFER_CONFIG: Record<
  PairCount,
  { basePrice: number; shippingPerPair: number }
> = {
  1: { basePrice: 800, shippingPerPair: 100 },
  2: { basePrice: 1299, shippingPerPair: 100 },
  3: { basePrice: 1500, shippingPerPair: 100 },
};

// Accepts 1, 2 or 3 (number or string, e.g. from ?pairs=1).
// Anything else falls back to 2, which keeps old carts and bad URLs working.
export const toPairCount = (v: unknown): PairCount => {
  const n = Number(v);
  return n === 1 || n === 3 ? n : 2;
};

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

// Fallback UPI ID. The ID set in Sanity settings takes priority.
// Optional .env.local: NEXT_PUBLIC_UPI_ID=yourname@bank
export const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "";

export const buildUpiLink = ({
  amount,
  payeeName,
  note,
  upiId = UPI_ID,
}: {
  amount: number;
  payeeName: string;
  note: string;
  upiId?: string;
}) =>
  `upi://pay?pa=${encodeURIComponent(upiId)}` +
  `&pn=${encodeURIComponent(payeeName)}` +
  `&am=${amount.toFixed(2)}` +
  `&cu=INR` +
  `&tn=${encodeURIComponent(note)}`;

// ------------------------------------------------------------------
// Shipping — charged PER PAIR, by region. Only applies on PREPAID.
// ------------------------------------------------------------------
export const SHIPPING_PER_PAIR = {
  kerala: { 1: 100, 2: 100, 3: 100 },
  outside: { 1: 150, 2: 150, 3: 150 },
} as const;

// Blank state (before the customer fills the form in) → treated as Kerala.
// Result: the page loads showing the LOWEST possible price (Kerala = free
// shipping on 1–2 pairs). Once a non-Kerala state is typed, pricing flips
// to outside-Kerala rates. Typing "kerala"/"KERALA"/" Kerala " stays Kerala.
export const isKerala = (state?: string) => {
  const s = (state ?? "").trim().toLowerCase();
  return s === "" || s === "kerala";
};
export const getOfferShipping = (pairCount: PairCount, state?: string) => {
  const table = isKerala(state)
    ? SHIPPING_PER_PAIR.kerala
    : SHIPPING_PER_PAIR.outside;
  return table[pairCount] * pairCount;
};

// ------------------------------------------------------------------
// COD charge — charged PER PAIR, by region. Only applies on COD.
// Kerala: ₹200 / pair. Outside Kerala: ₹250 / pair.
// ------------------------------------------------------------------
export const COD_CHARGE_PER_PAIR = {
  kerala: { 1: 200, 2: 200, 3: 200 },
  outside: { 1: 250, 2: 250, 3: 250 },
} as const;

export const getCodCharge = (pairCount: PairCount, state?: string) => {
  const table = isKerala(state)
    ? COD_CHARGE_PER_PAIR.kerala
    : COD_CHARGE_PER_PAIR.outside;
  return table[pairCount] * pairCount;
};

// ------------------------------------------------------------------
// Outside-Kerala surcharge — the EXTRA vs Kerala rates, for display only.
// Prepaid: outside shipping − Kerala shipping.
// COD:     outside COD charge − Kerala COD charge.
// Does not change the total (server sum is identical).
// ------------------------------------------------------------------
export const getOutsideSurcharge = (
  pairCount: PairCount,
  state: string | undefined,
  isCod: boolean,
) => {
  if (isKerala(state)) return 0;
  const k = isCod ? COD_CHARGE_PER_PAIR.kerala : SHIPPING_PER_PAIR.kerala;
  const o = isCod ? COD_CHARGE_PER_PAIR.outside : SHIPPING_PER_PAIR.outside;
  return (o[pairCount] - k[pairCount]) * pairCount;
};

// ------------------------------------------------------------------
// SERVER ROUTE: /api/checkout/manual-order
// It must use:
//   const isCod = payload.shippingMethod === "cod";
//   const pairCount = toPairCount(payload.pairCount);
//   const offerShipping = isCod ? 0 : getOfferShipping(pairCount, state);
//   const codCharge     = isCod ? getCodCharge(pairCount, state) : 0;
//   total = base + pairExtras + offerShipping + codCharge + cleanerCharge;
// ------------------------------------------------------------------