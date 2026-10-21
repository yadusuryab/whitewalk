import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Check, Gift } from "lucide-react";
import { ProductImage } from "./product-image";
import { CartItem } from "@/lib/types/checkout";
import { COD_CHARGE, type PairCount } from "@/lib/checkout-constants";
import { ShoeCleanerAddon } from "./shoe-cleaner";
import { PillCTA } from "./ui";

function PairCard({
  product,
  label,
  free,
  fallbackName,
  index,
}: {
  product: CartItem;
  label: string;
  free?: boolean;
  fallbackName: string;
  index: number;
}) {
  return (
    <div
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
      className="relative rounded-[1.75rem] bg-neutral-100 p-2.5 duration-500 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="overflow-hidden rounded-[1.25rem]">
        <ProductImage
          product={product}
          alt={product.productName || fallbackName}
          borderClass="border-transparent"
        />
      </div>
      <div className="mt-3 px-1.5 pb-1">
        <p className="truncate text-sm font-extrabold leading-tight tracking-tight">
          {product.productName || fallbackName}
        </p>
        <p className="mt-0.5 text-xs font-medium text-neutral-500">
          Size {product.selectedSize || "N/A"}
        </p>
      </div>
      <span
        className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
          free ? "bg-blue-600 text-white" : "bg-white/90 text-neutral-950 backdrop-blur"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function Option({
  id,
  active,
  title,
  note,
  tag,
  tagClass,
}: {
  id: "online" | "cod";
  active: boolean;
  title: string;
  note: React.ReactNode;
  tag: string;
  tagClass: string;
}) {
  return (
    <label
      htmlFor={id}
      className={`relative flex cursor-pointer items-center gap-4 rounded-3xl border-2 p-4 transition-all duration-300 active:scale-[0.99] ${
        active
          ? "border-neutral-950 bg-white"
          : "border-transparent bg-neutral-100 hover:bg-neutral-200/70"
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
          active ? "scale-100 bg-blue-600" : "scale-90 border-2 border-neutral-300"
        }`}
      >
        {active && (
          <Check
            className="h-3.5 w-3.5 text-white duration-300 animate-in zoom-in-50"
            strokeWidth={3}
          />
        )}
      </div>
      <RadioGroupItem value={id} id={id} className="sr-only" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-extrabold tracking-tight">
            {title}
          </span>
          <span className={`text-xs font-semibold ${tagClass}`}>{tag}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
          {note}
        </div>
      </div>
    </label>
  );
}

export function PaymentStep({
  mainProduct,
  freeProduct,
  thirdProduct,
  pairCount = 2,
  freeSocksOffer,
  shoeCleanerAddon,
  addShoeCleaner,
  setAddShoeCleaner,
  shippingMethod,
  setShippingMethod,
  onlineDeliveryLabel,
  codDeliveryLabel,
  onContinue,
}: {
  mainProduct: CartItem;
  freeProduct?: CartItem | null;
  thirdProduct?: CartItem | null;
  pairCount?: PairCount;
  freeSocksOffer: boolean;
  shoeCleanerAddon: boolean;
  addShoeCleaner: boolean;
  setAddShoeCleaner: (v: boolean) => void;
  shippingMethod: "online" | "cod";
  setShippingMethod: (v: "online" | "cod") => void;
  onlineDeliveryLabel: string;
  codDeliveryLabel: string;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Pairs */}
      <div>
        <div
          className={`grid ${
            pairCount === 3 ? "grid-cols-3 gap-2" : "grid-cols-2 gap-3"
          }`}
        >
          <PairCard
            index={0}
            product={mainProduct}
            label="Pair 1"
            fallbackName="Main Product"
          />

          {freeProduct && (
            <PairCard
              index={1}
              product={freeProduct}
              label={pairCount === 2 ? "Free" : "Pair 2"}
              free={pairCount === 2}
              fallbackName={pairCount === 2 ? "Free Product" : "Pair 2"}
            />
          )}

          {pairCount === 3 && thirdProduct && (
            <PairCard
              index={2}
              product={thirdProduct}
              label="Pair 3"
              fallbackName="Pair 3"
            />
          )}
        </div>

        {freeSocksOffer && (
          <div className="mt-3 flex items-center gap-3 rounded-3xl bg-blue-600/10 p-3.5 duration-500 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <Gift className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold tracking-tight text-blue-700">
                Free Flame Socks with this order
              </p>
              <p className="mt-0.5 text-xs font-medium text-blue-700/70">
                A pair of Flame Socks is added to your order for free.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment method */}
      <div>
        <p className="mb-3 text-sm font-semibold text-neutral-500">
          Payment method
        </p>
        <RadioGroup
          value={shippingMethod}
          onValueChange={(v: "online" | "cod") => setShippingMethod(v)}
          className="space-y-2"
        >
          <Option
            id="online"
            active={shippingMethod === "online"}
            title="Prepaid"
            tag={`Save ₹${COD_CHARGE}`}
            tagClass="text-blue-700"
            note={
              <>
                <Truck className="h-3.5 w-3.5" />
                Arrives {onlineDeliveryLabel}
              </>
            }
          />
          <Option
            id="cod"
            active={shippingMethod === "cod"}
            title="Cash on delivery"
            tag={`+₹${COD_CHARGE}`}
            tagClass="text-neutral-500"
            note={<>Arrives {codDeliveryLabel}</>}
          />
        </RadioGroup>
      </div>

      {shoeCleanerAddon && (
        <ShoeCleanerAddon
          addShoeCleaner={addShoeCleaner}
          setAddShoeCleaner={setAddShoeCleaner}
        />
      )}

      <PillCTA onClick={onContinue}>Continue</PillCTA>
    </div>
  );
}