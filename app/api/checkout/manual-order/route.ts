// app/api/checkout/manual-order/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";
import {
  BASE_PRICE,
  COD_CHARGE,
  COD_ADVANCE_AMOUNT,
  SHOE_CLEANER_PRICE,
  OFFER_CONFIG,
  isInOffer,
} from "@/lib/checkout-constants";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!, // server only
  useCdn: false,
});

const fail = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

// Check real image bytes, not the client-sent mime type
const detectImage = (buf: Buffer): string | null => {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  )
    return "image/png";
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
};

const clean = (v: unknown, max = 300) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("screenshot");
    const rawPayload = form.get("payload");

    if (!(file instanceof File) || typeof rawPayload !== "string") {
      return fail("Invalid request");
    }
    if (file.size === 0 || file.size > MAX_BYTES) {
      return fail("Screenshot must be under 8 MB");
    }

    let body: any;
    try {
      body = JSON.parse(rawPayload);
    } catch {
      return fail("Invalid request");
    }

    // ---------- Validate input ----------
    const pairCount = body.pairCount;
    if (pairCount !== 2 && pairCount !== 3) return fail("Invalid offer");
    if (!Array.isArray(body.lines) || body.lines.length !== pairCount) {
      return fail("Invalid items");
    }
    const shippingMethod = body.shippingMethod;
    if (shippingMethod !== "online" && shippingMethod !== "cod") {
      return fail("Invalid shipping method");
    }

    const cd = body.customerDetails || {};
    const customer = {
      name: clean(cd.name, 100),
      contact1: clean(cd.contact1, 10),
      contact2: clean(cd.contact2, 15),
      address: clean(cd.address, 400),
      district: clean(cd.district, 100),
      state: clean(cd.state, 100),
      pincode: clean(cd.pincode, 6),
      landmark: clean(cd.landmark, 200),
      instagramId: clean(cd.instagramId, 100),
    };
    if (
      !customer.name ||
      !customer.address ||
      !customer.district ||
      !customer.state ||
      !/^\d{10}$/.test(customer.contact1) ||
      !/^\d{6}$/.test(customer.pincode)
    ) {
      return fail("Please check your delivery details");
    }

    const utr = body.utr ? clean(body.utr, 12) : "";
    if (utr && !/^\d{12}$/.test(utr)) return fail("UTR must be 12 digits");

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = detectImage(buffer);
    if (!mime) return fail("Upload a JPG, PNG or WebP screenshot");

    // ---------- Prices come from the database ----------
    const ids: string[] = body.lines.map((l: any) => String(l.productId));
    const [products, settings] = await Promise.all([
      sanity.fetch(
        `*[_type == "shoe" && _id in $ids]{
          _id, productName, price, sizes, disabledSizes,
          buyOneGetOne, offer1Pair, offer2Pair, offer3Pair, isDisabled,
          "imageRef": images[0].asset._ref
        }`,
        { ids },
      ),
      sanity.fetch(
        `*[_type == "settings"][0]{ freeSocksOffer, shoeCleanerAddon }`,
      ),
    ]);
    const byId = new Map<string, any>(products.map((p: any) => [p._id, p]));

    const items: any[] = [];
    let extras = 0;

    for (let i = 0; i < body.lines.length; i++) {
      const line = body.lines[i];
      const p = byId.get(String(line.productId));
      if (!p || p.isDisabled || !isInOffer(p, pairCount)) {
        return fail("A product is unavailable");
      }

      const size = Number(line.selectedSize);
      const sizeOk = (p.sizes || []).some((s: any) => Number(s) === size);
      const disabled = (p.disabledSizes || []).some(
        (s: any) => Number(s) === size,
      );
      if (!Number.isFinite(size) || !sizeOk || disabled) {
        return fail(`Size ${line.selectedSize} is unavailable for ${p.productName}`);
      }

      const price = p.price || BASE_PRICE;
      extras += Math.max(0, price - BASE_PRICE);

      items.push({
        _key: randomUUID(),
        _type: "orderItem",
        product: { _type: "reference", _ref: p._id },
        productName: p.productName,
        ...(p.imageRef
          ? {
              imageUrl: {
                _type: "image",
                asset: { _type: "reference", _ref: p.imageRef },
              },
            }
          : {}),
        size,
        price,
        isFreeItem: pairCount === 2 && i === 1,
      });
    }

    const offer = OFFER_CONFIG[pairCount as 2 | 3];
    const addCleaner = !!body.addShoeCleaner && !!settings?.shoeCleanerAddon;
    const isCod = shippingMethod === "cod";

    const subtotal = offer.basePrice + extras;
    const offerShipping = offer.shippingPerPair * pairCount;
    const shippingCharge = offerShipping + (isCod ? COD_CHARGE : 0);
    const cleanerCharge = addCleaner ? SHOE_CLEANER_PRICE : 0;
    const totalAmount = subtotal + shippingCharge + cleanerCharge;
    const advancePaid = isCod ? COD_ADVANCE_AMOUNT : totalAmount;
    const remainingAmount = isCod ? totalAmount - COD_ADVANCE_AMOUNT : 0;

    // Price changed since the QR was shown
    if (Number(body.clientAmount) !== advancePaid) {
      return fail(
        "Prices changed. Please refresh the page and pay the updated amount.",
        409,
      );
    }

    // Same UTR already used
    if (utr) {
      const dup = await sanity.fetch(
        `count(*[_type == "order" && utr == $utr])`,
        { utr },
      );
      if (dup > 0) {
        return fail("This UTR was already used on another order", 409);
      }
    }

    // ---------- Upload screenshot, then create order ----------
    const asset = await sanity.assets.upload("image", buffer, {
      filename: `payment-${Date.now()}.${mime.split("/")[1]}`,
      contentType: mime,
    });

    const orderId = `FX-${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .slice(2, 5)
      .toUpperCase()}`;

    const doc = await sanity.create({
      _type: "order",
      orderId,
      items,
      customerName: customer.name,
      instagramId: customer.instagramId,
      contact1: customer.contact1,
      contact2: customer.contact2,
      address: customer.address,
      district: customer.district,
      state: customer.state,
      pincode: customer.pincode,
      landmark: customer.landmark,
      shippingMethod,
      shoeCleanerAddon: addCleaner,
      freeSocksOffer: !!settings?.freeSocksOffer,
      pairCount,
      subtotal,
      shippingCharge,
      totalAmount,
      advancePaid,
      remainingAmount,
      expectedDeliveryLabel: clean(body.expectedDeliveryLabel, 100),
      paymentMethod: "manual_upi",
      utr: utr || undefined,
      paymentScreenshot: {
        _type: "image",
        asset: { _type: "reference", _ref: asset._id },
      },
      paymentStatus: "verifying",
      fulfillmentStatus: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ orderId: doc._id, orderNumber: orderId });
  } catch (err) {
    console.error("manual-order error:", err);
    return fail("Could not place order. Please try again.", 500);
  }
}