// lib/checkout-server.ts  (server-only)
import "server-only";
import crypto from "crypto";
import Razorpay from "razorpay";
import { serverClient } from "@/lib/sanity-server"; // write-enabled client
import {
  BASE_PRICE,
  SHOE_CLEANER_PRICE,
  ONLINE_DELIVERY_MIN_DAYS,
  ONLINE_DELIVERY_MAX_DAYS,
  COD_DELIVERY_MIN_DAYS,
  COD_DELIVERY_MAX_DAYS,
  OFFER_CONFIG,
  toPairCount,
  getOfferShipping,
  getCodCharge,
  isInOffer,
  type PairCount,
} from "@/lib/checkout-constants";
import { getExpectedDelivery } from "@/lib/checkout-utils";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export class CheckoutError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

/* ---------- signatures ---------- */

const safeEqual = (a: string, b: string) => {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && crypto.timingSafeEqual(A, B);
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string,
) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
};

export const verifyWebhookSignature = (rawBody: string, signature: string) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  return safeEqual(expected, signature);
};

/* ---------- input validation ---------- */

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export const validateCustomer = (raw: any) => {
  const c = {
    name: str(raw?.name, 100),
    contact1: str(raw?.contact1, 10),
    contact2: str(raw?.contact2, 10),
    address: str(raw?.address, 500),
    district: str(raw?.district, 100),
    state: str(raw?.state, 100),
    pincode: str(raw?.pincode, 6),
    landmark: str(raw?.landmark, 200),
    instagramId: str(raw?.instagramId, 100),
  };
  if (c.name.length < 2) throw new CheckoutError("Invalid name");
  if (!/^\d{10}$/.test(c.contact1)) throw new CheckoutError("Invalid phone");
  if (c.contact2 && !/^\d{10}$/.test(c.contact2))
    throw new CheckoutError("Invalid alternate phone");
  if (c.address.length < 5) throw new CheckoutError("Invalid address");
  if (!c.district || !c.state)
    throw new CheckoutError("Missing district/state");
  if (!/^\d{6}$/.test(c.pincode)) throw new CheckoutError("Invalid pincode");
  return c;
};

/* ---------- pricing (single source of truth) ---------- */

export const buildOrder = async (body: any) => {
  const customer = validateCustomer(body?.customerDetails);

  const shippingMethod = body?.shippingMethod;
  if (shippingMethod !== "online" && shippingMethod !== "cod")
    throw new CheckoutError("Invalid shipping method");
  const isCod = shippingMethod === "cod";

  const items = body?.items;
  if (!Array.isArray(items) || items.length < 1 || items.length > 3)
    throw new CheckoutError("Invalid cart");

  const pairCount: PairCount = toPairCount(body?.pairCount ?? items.length);
  if (items.length !== pairCount) {
    throw new CheckoutError(
      `Cart has ${items.length} item(s) but offer is for ${pairCount} pair(s)`,
    );
  }

  for (const i of items) {
    if (typeof i?.productId !== "string" || !i.productId)
      throw new CheckoutError("Invalid product");
  }

  const ids = [...new Set(items.map((i: any) => i.productId as string))];
  const [products, settings] = await Promise.all([
    serverClient.fetch(
      `*[_type == "product" && _id in $ids]{
        _id, price, name, "imageUrl": image.asset->url,
        buyOneGetOne, offer1Pair, offer2Pair, offer3Pair, isDisabled
      }`,
      { ids },
    ),
    serverClient.fetch(
      `*[_type == "settings"][0]{ freeSocksOffer, shoeCleanerAddon }`,
    ),
  ]);
  const map = new Map<string, any>(products.map((p: any) => [p._id, p]));

  // Resolve every line; ensure products exist, are enabled, and qualify for
  // this pair-count offer (matches the client-side isInOffer filter).
  const resolved: any[] = [];
  for (let i = 0; i < items.length; i++) {
    const p = map.get(items[i].productId);
    if (!p) throw new CheckoutError(`Product not found: ${items[i].productId}`);
    if (p.isDisabled) throw new CheckoutError("A product is unavailable");
    if (!isInOffer(p, pairCount)) {
      throw new CheckoutError(
        `Product ${p.name ?? p._id} is not eligible for the ${pairCount}-pair offer`,
      );
    }
    resolved.push(p);
  }

  const offer = OFFER_CONFIG[pairCount];

  // Premiums — only 1st & 2nd pair can add extra. 3rd is a free surprise.
  const pair1Price = resolved[0].price || BASE_PRICE;
  const pair2Price = resolved[1]?.price || BASE_PRICE;
  const pair1Extra = Math.max(0, pair1Price - BASE_PRICE);
  const pair2Extra =
    pairCount >= 2 ? Math.max(0, pair2Price - BASE_PRICE) : 0;
  const pair3Extra = 0;

  const subtotal = offer.basePrice + pair1Extra + pair2Extra + pair3Extra;

  // Region-aware shipping (prepaid) vs per-pair COD charge.
  const offerShipping = isCod
    ? 0
    : getOfferShipping(pairCount, customer.state);
  const codCharge = isCod ? getCodCharge(pairCount, customer.state) : 0;
  const shippingCharge = offerShipping + codCharge;

  const shoeCleanerAddon =
    !!settings?.shoeCleanerAddon && !!body?.addShoeCleaner;
  const cleanerCharge = shoeCleanerAddon ? SHOE_CLEANER_PRICE : 0;

  const totalAmount = subtotal + shippingCharge + cleanerCharge;

  // No COD advance — full amount is paid on delivery.
  // Prepaid → paid in full now, nothing remaining.
  const advancePaid = isCod ? 0 : totalAmount;
  const remainingAmount = isCod ? totalAmount : 0;

  // For prepaid Razorpay flow, the amount must be > 0.
  if (!isCod && advancePaid < 1) throw new CheckoutError("Invalid amount");

  const delivery = isCod
    ? getExpectedDelivery(
        COD_DELIVERY_MIN_DAYS,
        COD_DELIVERY_MAX_DAYS,
        new Date(),
      )
    : getExpectedDelivery(
        ONLINE_DELIVERY_MIN_DAYS,
        ONLINE_DELIVERY_MAX_DAYS,
        new Date(),
      );

  const line = (
    p: any,
    size: unknown,
    isFreeItem: boolean,
    index: number,
  ) => ({
    _key: `${p._id}-${index}`,
    _type: "orderItem",
    productId: p._id,
    productName: p.name,
    imageUrl: p.imageUrl,
    size: str(size, 10),
    price: p.price || BASE_PRICE,
    isFreeItem,
  });

  const lineItems = resolved.map((p, i) =>
    // Only the 2nd pair in a 2-pair offer is a "free" line item.
    line(p, items[i].size, pairCount === 2 && i === 1, i),
  );

  return {
    customer,
    shippingMethod,
    isCod,
    pairCount,
    shoeCleanerAddon,
    freeSocksOffer: !!settings?.freeSocksOffer,
    lineItems,
    subtotal,
    offerShipping,
    codCharge,
    shippingCharge,
    cleanerCharge,
    totalAmount,
    advancePaid,
    remainingAmount,
    expectedDeliveryLabel: delivery.label,
  };
};

export const newOrderRef = () =>
  `FX-${Date.now().toString(36).toUpperCase()}${crypto
    .randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;

/* ---------- settlement (used by verify AND webhook; idempotent) ---------- */

export type SettleResult =
  | { state: "paid"; orderId: string }
  | { state: "pending"; orderId: string }
  | { state: "failed" };

export const settlePayment = async (
  razorpayOrderId: string,
  razorpayPaymentId: string,
): Promise<SettleResult> => {
  const order = await serverClient.fetch(
    `*[_type == "order" && razorpayOrderId == $id][0]{ _id, orderId, paymentStatus, totalAmount, advancePaid, shippingMethod }`,
    { id: razorpayOrderId },
  );
  if (!order) throw new CheckoutError("Order not found", 404);
  if (order.paymentStatus === "paid")
    return { state: "paid", orderId: order.orderId };

  // Razorpay flow only handles prepaid orders (COD never reaches here).
  if (order.shippingMethod === "cod") {
    throw new CheckoutError("COD orders cannot be settled via Razorpay", 400);
  }

  // Ask Razorpay directly - never trust client/webhook payload amounts
  const payment: any = await razorpay.payments.fetch(razorpayPaymentId);
  if (
    payment.order_id !== razorpayOrderId ||
    payment.currency !== "INR" ||
    payment.amount !== order.totalAmount * 100
  ) {
    throw new CheckoutError("Payment mismatch", 400);
  }

  if (payment.status === "captured") {
    await serverClient
      .patch(order._id)
      .set({
        paymentStatus: "paid",
        razorpayPaymentId,
        paidAt: new Date().toISOString(),
      })
      .commit();
    return { state: "paid", orderId: order.orderId };
  }
  if (payment.status === "authorized")
    return { state: "pending", orderId: order.orderId };
  return { state: "failed" };
};

export const markPaymentFailed = async (razorpayOrderId: string) => {
  const order = await serverClient.fetch(
    `*[_type == "order" && razorpayOrderId == $id][0]{ _id, paymentStatus }`,
    { id: razorpayOrderId },
  );
  if (!order || order.paymentStatus === "paid") return;
  await serverClient.patch(order._id).set({ paymentStatus: "failed" }).commit();
};