// app/api/checkout/manual-order/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";
import {
  BASE_PRICE,
  SHOE_CLEANER_PRICE,
  OFFER_CONFIG,
  isInOffer,
  toPairCount,
  getOfferShipping,
  getCodCharge,
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

    if (typeof rawPayload !== "string") {
      return fail("Invalid request");
    }

    let body: any;
    try {
      body = JSON.parse(rawPayload);
    } catch {
      return fail("Invalid request");
    }

    // ---------- Validate input ----------
    const pairCount = toPairCount(body.pairCount); // 1 | 2 | 3
    const shippingMethod = body.shippingMethod;
    if (shippingMethod !== "online" && shippingMethod !== "cod") {
      return fail("Invalid shipping method");
    }
    const isCod = shippingMethod === "cod";

    // Screenshot only required for prepaid.
    if (!isCod) {
      if (!(file instanceof File)) return fail("Payment screenshot required");
      if (file.size === 0 || file.size > MAX_BYTES) {
        return fail("Screenshot must be under 8 MB");
      }
    }

    // 3-pair offer: only 2 chosen products are sent as lines.
    // The 3rd pair is random and sent separately as randomThird.size.
    const expectedLines = pairCount === 3 ? 2 : pairCount;
    if (!Array.isArray(body.lines) || body.lines.length !== expectedLines) {
      return fail("Invalid items");
    }

    let randomThirdSize: number | null = null;
    if (pairCount === 3) {
      randomThirdSize = Number(body.randomThird?.size);
      if (!Number.isFinite(randomThirdSize)) {
        return fail("Select a size for your 3rd pair");
      }
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

    // Decode/validate the image only when one was sent.
    let buffer: Buffer | null = null;
    let mime: string | null = null;
    if (!isCod && file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer());
      mime = detectImage(buffer);
      if (!mime) return fail("Upload a JPG, PNG or WebP screenshot");
    }

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
        return fail(
          `Size ${line.selectedSize} is unavailable for ${p.productName}`,
        );
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
        // Only the 2nd pair in a 2-pair offer is truly "free".
        isFreeItem: pairCount === 2 && i === 1,
      });
    }

    const offer = OFFER_CONFIG[pairCount];
    const addCleaner =
      !!body.addShoeCleaner && !!settings?.shoeCleanerAddon;

    // ----- Region-aware pricing (matches the client exactly) -----
    // Random 3rd pair value is already inside offer.basePrice.
    const subtotal = offer.basePrice + extras;

    // PREPAID: region shipping applies. COD: no shipping, per-pair COD fee.
    const offerShipping = isCod
      ? 0
      : getOfferShipping(pairCount, customer.state);
    const codCharge = isCod ? getCodCharge(pairCount, customer.state) : 0;
    const shippingCharge = offerShipping + codCharge;

    const cleanerCharge = addCleaner ? SHOE_CLEANER_PRICE : 0;
    const totalAmount = subtotal + shippingCharge + cleanerCharge;

    // COD → nothing paid now, everything on delivery.
    // Prepaid → full amount paid now, nothing on delivery.
    const advancePaid = isCod ? 0 : totalAmount;
    const remainingAmount = isCod ? totalAmount : 0;

    // The client always sends the FULL total, even for COD.
    if (Number(body.clientAmount) !== totalAmount) {
      return fail(
        "Prices changed. Please refresh the page and pay the updated amount.",
        409,
      );
    }

    // Same UTR already used (prepaid only)
    if (utr) {
      const dup = await sanity.fetch(
        `count(*[_type == "order" && utr == $utr])`,
        { utr },
      );
      if (dup > 0) {
        return fail("This UTR was already used on another order", 409);
      }
    }

    // ---------- Upload screenshot (prepaid only) ----------
    let screenshotRef: string | null = null;
    if (!isCod && buffer && mime) {
      const asset = await sanity.assets.upload("image", buffer, {
        filename: `payment-${Date.now()}.${mime.split("/")[1]}`,
        contentType: mime,
      });
      screenshotRef = asset._id;
    }

    // ---------- Create order ----------
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
      randomThirdSize: randomThirdSize ?? undefined, // add number field to order schema
      subtotal,
      shippingCharge,
      codCharge, // stored separately for reporting
      totalAmount,
      advancePaid,
      remainingAmount,
      expectedDeliveryLabel: clean(body.expectedDeliveryLabel, 100),
      paymentMethod: isCod ? "cod" : "manual_upi",
      utr: utr || undefined,
      ...(screenshotRef && {
        paymentScreenshot: {
          _type: "image",
          asset: { _type: "reference", _ref: screenshotRef },
        },
      }),
      paymentStatus: isCod ? "pending" : "verifying",
      fulfillmentStatus: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ orderId: doc._id, orderNumber: orderId });
  } catch (err) {
    console.error("manual-order error:", err);
    return fail("Could not place order. Please try again.", 500);
  }
}