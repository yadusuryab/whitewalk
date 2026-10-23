"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomerDetailsForm } from "@/components/checkout/checkout-form";
import { ManualPayment } from "@/components/checkout/manual-payment";
import { site } from "@/lib/site-config";
import { client } from "@/sanityClient";
import { fbTrackCustom } from "@/lib/fbq";
import { display, H2, LivePill, PillCTA } from "@/components/checkout/ui";

import { OrderSummary } from "@/components/checkout/order-summary";
import {
  BASE_PRICE,
  COD_CHARGE_BY_PAIR,
  SHOE_CLEANER_PRICE,
  ONLINE_DELIVERY_MIN_DAYS,
  ONLINE_DELIVERY_MAX_DAYS,
  COD_DELIVERY_MIN_DAYS,
  COD_DELIVERY_MAX_DAYS,
  OFFER_CONFIG,
  UPI_ID,
  buildUpiLink,
  toPairCount,
  getOfferShipping,
  type PairCount,
} from "@/lib/checkout-constants";
import { StepProgress } from "@/components/checkout/step-progress";
import { CartItem } from "@/lib/types/checkout";
import { CheckoutStep, CustomerDetails } from "@/lib/types/checkout";
import { getExpectedDelivery } from "@/lib/checkout-utils";
import { EmptyCart } from "@/components/checkout/empty-cart";
import { PaymentStep } from "@/components/checkout/payment-step";

const REQUIRED_FIELDS = [
  "name",
  "contact1",
  "address",
  "district",
  "state",
  "pincode",
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState<"online" | "cod">(
    "online",
  );
  const [addShoeCleaner, setAddShoeCleaner] = useState(false);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("payment");
  const [showPay, setShowPay] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    contact1: "",
    contact2: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    landmark: "",
    instagramId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [orderDate] = useState<Date>(() => new Date());

  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [utr, setUtr] = useState("");

  const [freeSocksOffer, setFreeSocksOffer] = useState(false);
  const [shoeCleanerAddon, setShoeCleanerAddon] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(Array.isArray(cart) ? cart : []);
    } catch {
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    client
      .fetch(`*[_type == "settings"][0]{ freeSocksOffer, shoeCleanerAddon }`)
      .then((data) => {
        setFreeSocksOffer(!!data?.freeSocksOffer);
        setShoeCleanerAddon(!!data?.shoeCleanerAddon);
      })
      .catch(() => {
        setFreeSocksOffer(false);
        setShoeCleanerAddon(false);
      })
      .finally(() => setSettingsLoaded(true));
  }, []);

  useEffect(() => {
    if (settingsLoaded && !shoeCleanerAddon && addShoeCleaner) {
      setAddShoeCleaner(false);
    }
  }, [settingsLoaded, shoeCleanerAddon, addShoeCleaner]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, showPay]);

  // ---------- Pricing (display only; server recomputes) ----------
  const mainProduct = cartItems[0];
  const freeProduct = mainProduct?.freeProduct;
  const thirdProduct = (mainProduct as any)?.thirdProduct;

  // 1, 2 or 3 pairs. Carts saved before pairCount existed fall back to 2.
  const pairCount: PairCount = toPairCount((mainProduct as any)?.pairCount);
  const offer = OFFER_CONFIG[pairCount];

  const pair1Extra = Math.max(
    0,
    (mainProduct?.price || BASE_PRICE) - BASE_PRICE,
  );
  // Only pairs that exist in this offer can add an upgrade price.
  const pair2Extra =
    pairCount >= 2
      ? Math.max(0, (freeProduct?.price || BASE_PRICE) - BASE_PRICE)
      : 0;
  const pair3Extra =
    pairCount === 3
      ? Math.max(0, (thirdProduct?.price || BASE_PRICE) - BASE_PRICE)
      : 0;

  const subtotal = offer.basePrice + pair1Extra + pair2Extra + pair3Extra;

  // Shipping depends on the offer and the customer's state (Kerala vs outside)
  const offerShipping = getOfferShipping(pairCount, customerDetails.state);

  const isCod = shippingMethod === "cod";
  const codCharge:any = isCod ? COD_CHARGE_BY_PAIR[pairCount] : 0;
  const shippingCharge = offerShipping + codCharge;
  const cleanerCharge =
    shoeCleanerAddon && addShoeCleaner ? SHOE_CLEANER_PRICE : 0;
  const totalAmount = subtotal + shippingCharge + cleanerCharge;

  // COD: no advance, full amount paid on delivery
  const paymentAmount = isCod ? 0 : totalAmount;
  const remainingAmount = isCod ? totalAmount : 0;

  const onlineDelivery = getExpectedDelivery(
    ONLINE_DELIVERY_MIN_DAYS,
    ONLINE_DELIVERY_MAX_DAYS,
    orderDate,
  );
  const codDelivery = getExpectedDelivery(
    COD_DELIVERY_MIN_DAYS,
    COD_DELIVERY_MAX_DAYS,
    orderDate,
  );
  const activeDelivery =
    shippingMethod === "online" ? onlineDelivery : codDelivery;

  const upiLink = useMemo(
    () =>
      buildUpiLink({
        amount: paymentAmount,
        payeeName: site.name || "whitewalk",
        note: `${pairCount} ${pairCount === 1 ? "pair" : "pairs"} order`,
      }),
    [paymentAmount, pairCount],
  );

  // ---------- Validation ----------
  const phoneValid = /^\d{10}$/.test(customerDetails.contact1.trim());
  const pincodeValid = /^\d{6}$/.test(customerDetails.pincode.trim());

  const missingFields = REQUIRED_FIELDS.filter(
    (field) => !customerDetails[field]?.trim(),
  );
  const isFormValid = missingFields.length === 0 && phoneValid && pincodeValid;

  const getFieldError = (field: string): string | undefined => {
    if (!touched[field]) return undefined;
    if (
      (REQUIRED_FIELDS as readonly string[]).includes(field) &&
      !customerDetails[field as keyof CustomerDetails]?.trim()
    ) {
      return "This field is required";
    }
    if (
      field === "contact1" &&
      customerDetails.contact1.trim() &&
      !phoneValid
    ) {
      return "Enter a valid 10-digit phone number";
    }
    if (
      field === "pincode" &&
      customerDetails.pincode.trim() &&
      !pincodeValid
    ) {
      return "Enter a valid 6-digit pincode";
    }
    return undefined;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setCustomerDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const goToDetailsStep = () => setCurrentStep("details");

  // ---------- Place order ----------
  const placeOrder = async () => {
    if (!isCod && !screenshot) {
      toast.error("Upload your payment screenshot");
      return;
    }

    setIsLoading(true);
    setFormErrors([]);

    try {
      const lines: {
        productId: string;
        selectedSize: string | undefined;
        isFreeItem: boolean;
      }[] = [
        {
          productId: mainProduct._id,
          selectedSize: mainProduct.selectedSize,
          isFreeItem: false,
        },
      ];
      // 1 pair = main product only
      if (pairCount >= 2 && freeProduct) {
        lines.push({
          productId: freeProduct._id,
          selectedSize: freeProduct.selectedSize,
          isFreeItem: pairCount === 2,
        });
      }
      if (pairCount === 3 && thirdProduct) {
        lines.push({
          productId: thirdProduct._id,
          selectedSize: thirdProduct.selectedSize,
          isFreeItem: false,
        });
      }

      const payload = {
        lines,
        pairCount,
        customerDetails,
        shippingMethod,
        addShoeCleaner: shoeCleanerAddon && addShoeCleaner,
        expectedDeliveryLabel: activeDelivery.label,
        clientAmount: totalAmount, // full total; server recomputes and rejects if it disagrees
        utr: isCod ? null : utr.trim() || null,
      };

      const fd = new FormData();
      fd.append("payload", JSON.stringify(payload));
      if (screenshot && !isCod) fd.append("screenshot", screenshot);

      const res = await fetch("/api/checkout/manual-order", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Could not place order");
      }

      fbTrackCustom(isCod ? "CodOrderPlaced" : "ManualOrderPlaced", {
        value: totalAmount,
        currency: "INR",
      });

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      router.push(
        `/order-confirmed?order_id=${data.orderId}${isCod ? "&cod=1" : "&manual=1"}`,
      );
    } catch (e: any) {
      setFormErrors([e?.message || "Could not place order. Try again."]);
      setIsLoading(false);
    }
  };

  const goToPay = () => {
    setTouched((prev) => {
      const next = { ...prev };
      REQUIRED_FIELDS.forEach((f) => (next[f] = true));
      return next;
    });
    if (!isFormValid) return;
    if (isCod) {
      placeOrder();
      return;
    }
    if (!UPI_ID) {
      setFormErrors(["Payment is not configured. Please contact us."]);
      return;
    }
    setFormErrors([]);
    setShowPay(true);
  };

  if (!cartItems.length || !mainProduct) {
    return <EmptyCart isInvalid={cartItems.length > 0} />;
  }

  const stepKey =
    currentStep === "payment" ? "payment" : showPay ? "pay" : "details";

  return (
    <main
      className={`${display.className} container mx-auto min-h-screen max-w-2xl px-5 pb-40 text-neutral-950 sm:px-8`}
    >
      <div className="py-6">
        <StepProgress currentStep={currentStep} />

        {formErrors.length > 0 && (
          <div
            role="alert"
            className="mb-5 rounded-3xl bg-red-50 p-4 text-sm font-semibold text-red-700 duration-300 animate-in fade-in slide-in-from-top-2"
          >
            <ul className="space-y-1">
              {formErrors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <div
          key={stepKey}
          className="duration-500 animate-in fade-in slide-in-from-bottom-4"
        >
          {currentStep === "payment" ? (
            <>
              <div className="mb-6">
                <LivePill>Almost there</LivePill>
                <div className="mt-4">
                  <H2>Your order.</H2>
                </div>
              </div>
              <PaymentStep
                mainProduct={mainProduct}
                freeProduct={pairCount >= 2 ? freeProduct : undefined}
                thirdProduct={pairCount === 3 ? thirdProduct : undefined}
                pairCount={pairCount}
                freeSocksOffer={freeSocksOffer}
                shoeCleanerAddon={shoeCleanerAddon}
                addShoeCleaner={addShoeCleaner}
                setAddShoeCleaner={setAddShoeCleaner}
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
                onlineDeliveryLabel={onlineDelivery.label}
                codDeliveryLabel={codDelivery.label}
                onContinue={goToDetailsStep}
              />
            </>
          ) : showPay && !isCod ? (
            <div>
              <button
                type="button"
                onClick={() => setShowPay(false)}
                disabled={isLoading}
                className="mb-5 text-sm font-semibold text-neutral-500 underline-offset-4 transition-colors hover:text-neutral-950 hover:underline"
              >
                ← Edit details
              </button>
              <ManualPayment
                amount={paymentAmount}
                upiLink={upiLink}
                upiId={UPI_ID}
                isCod={false}
                remainingAmount={0}
                file={screenshot}
                onFileChange={setScreenshot}
                utr={utr}
                onUtrChange={setUtr}
              />
            </div>
          ) : (
            <div>
              <H2>
                Delivery
                <br />
                details.
              </H2>
              <p className="mb-6 mt-3 text-base font-medium text-neutral-500">
                Where should we send it?
              </p>
              <CustomerDetailsForm
                customerDetails={customerDetails}
                handleInputChange={handleInputChange}
                handleInputBlur={handleInputBlur}
                getFieldError={getFieldError}
              />
            </div>
          )}

          <OrderSummary
            pairCount={pairCount}
            basePrice={offer.basePrice}
            pair1Extra={pair1Extra}
            pair2Extra={pair2Extra}
            pair3Extra={pair3Extra}
            offerShipping={offerShipping}
            freeSocksOffer={freeSocksOffer}
            shoeCleanerAddon={shoeCleanerAddon}
            addShoeCleaner={addShoeCleaner}
            shippingMethod={shippingMethod}
            activeDeliveryEnd={activeDelivery.end}
            totalAmount={totalAmount}
          />

          {isCod && !showPay && (
            <p className="mt-4 text-center text-sm font-medium text-neutral-500">
              Pay ₹{remainingAmount} on delivery
            </p>
          )}
        </div>
      </div>

      {currentStep === "details" && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-neutral-200 bg-white/90 py-3 backdrop-blur-md duration-500 animate-in slide-in-from-bottom-full">
          <div className="container mx-auto max-w-2xl px-5 sm:px-8">
            {showPay && !isCod ? (
              <PillCTA
                onClick={placeOrder}
                loading={isLoading}
                disabled={!screenshot}
              >
                {isLoading ? "Placing order…" : "I've paid — place order"}
              </PillCTA>
            ) : (
              <>
                <PillCTA onClick={goToPay} loading={isLoading}>
                  {isCod
                    ? isLoading
                      ? "Placing order…"
                      : `Place order · Pay ₹${totalAmount} on delivery`
                    : `Pay ₹${totalAmount}`}
                </PillCTA>
                {!isFormValid && (
                  <p className="mt-2 text-center text-xs font-semibold text-red-500">
                    Fill all required fields to continue
                  </p>
                )}
              </>
            )}
            <p className="mt-2 text-center text-xs font-medium text-neutral-500">
              Estimated delivery {activeDelivery.label}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}