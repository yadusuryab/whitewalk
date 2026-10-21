"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Inter_Tight } from "next/font/google";
import {
  ArrowUpRight,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Loader2,
  Link as LinkIcon,
  Check,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

interface OrderItem {
  productName: string;
  size?: string;
  price: number;
  isFreeItem?: boolean;
  imageUrl?: string;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  customerName: string;
  contact1: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  landmark?: string;
  shippingMethod?: string;
  shoeCleanerAddon?: boolean;
  freeSocksOffer?: boolean;
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  expectedDeliveryLabel?: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
}

const STEPS = [
  { key: "pending", label: "Placed", icon: Clock },
  { key: "processing", label: "Preparing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function stepIndex(status: string) {
  const idx = STEPS.findIndex((s) => s.key === status?.toLowerCase());
  return idx === -1 ? 0 : idx;
}

function statusPill(status: string) {
  const s = status?.toLowerCase();
  if (s === "delivered") return "bg-neutral-950 text-white";
  if (s === "cancelled" || s === "failed") return "bg-red-600/10 text-red-700";
  if (s === "shipped" || s === "processing") return "bg-blue-600/10 text-blue-700";
  return "bg-neutral-100 text-neutral-600";
}

// Only paid orders are shown (hides pending / failed payments)
function isPaid(order: Order) {
  return order.paymentStatus?.toLowerCase() === "paid";
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
      {children}
    </p>
  );
}

function TrackOrderContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [contact1, setContact1] = useState(searchParams.get("phone") ?? "");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  const digitsOnly = contact1.replace(/\D/g, "");
  const isValid = digitsOnly.length === 10;

  async function runSearch(phone: string) {
    setLoading(true);
    setError(null);
    setSearched(true);
    setOrders(null);

    try {
      const params = new URLSearchParams({ contact1: phone });
      const res = await fetch(`/api/orders/track?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "We couldn't find any orders for that number.");
        return;
      }

      setOrders((data.orders as Order[]).filter(isPaid));
    } catch {
      setError("Something went wrong on our end. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run a search if opened with ?phone=... (shared tracking link)
  useEffect(() => {
    const initial = searchParams.get("phone");
    if (initial && /^\d{10}$/.test(initial)) {
      runSearch(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    router.replace(`${pathname}?phone=${digitsOnly}`, { scroll: false });
    runSearch(digitsOnly);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className={`${display.className} min-h-screen bg-white text-neutral-950`}>
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 md:py-20">
        {/* Header */}
        <header>
          <div className="inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            Order tracking
          </div>

          <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-7xl">
            Where&rsquo;s my order?
          </h1>

          <p className="mt-6 max-w-md text-base font-medium leading-relaxed text-neutral-600 sm:text-lg">
            Enter the phone number you used at checkout. We&rsquo;ll pull up every order tied to it.
          </p>
        </header>

        {/* Search */}
        <div className="mt-10">
          <label htmlFor="contact1">
            <Eyebrow>Phone number</Eyebrow>
          </label>

          <form
            onSubmit={handleSearch}
            className="mt-3 flex h-16 items-center rounded-full border-2 border-neutral-950 pl-6 pr-1.5 transition-shadow focus-within:ring-4 focus-within:ring-blue-600/20 sm:h-[4.5rem]"
          >
            <input
              id="contact1"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              value={contact1}
              onChange={(e) => setContact1(e.target.value)}
              placeholder="98765 43210"
              aria-invalid={contact1.length > 0 && !isValid}
              className="min-w-0 flex-1 bg-transparent text-2xl font-extrabold tabular-nums tracking-[-0.03em] outline-none placeholder:text-neutral-300 sm:text-3xl"
            />
            <button
              type="submit"
              disabled={!isValid || loading}
              className="group flex h-12 shrink-0 items-center gap-2 rounded-full bg-neutral-950 pl-5 pr-1.5 text-lg font-extrabold tracking-[-0.03em] text-white transition-colors duration-300 hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 sm:h-14 sm:text-xl"
            >
              {loading ? "Searching" : "Track"}
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-enabled:group-hover:rotate-45 sm:h-11 sm:w-11"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUpRight className="h-5 w-5" />
                )}
              </span>
            </button>
          </form>

          {contact1.length > 0 && !isValid && (
            <p className="mt-3 text-sm font-medium text-neutral-500">
              Enter a valid 10-digit phone number.
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-12 space-y-3">
            <div className="h-20 w-full animate-pulse rounded-2xl bg-neutral-200" />
            <div className="h-20 w-full animate-pulse rounded-2xl bg-neutral-200" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <p
            role="alert"
            className="mt-12 rounded-2xl bg-red-600/10 p-4 text-sm font-semibold leading-relaxed text-red-700"
          >
            {error}
          </p>
        )}

        {/* Empty */}
        {!loading && !error && searched && orders?.length === 0 && (
          <div className="mt-12 border-t-2 border-neutral-950 pt-10 text-center">
            <Package className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
            <p className="text-2xl font-extrabold tracking-[-0.04em]">No orders found.</p>
            <p className="mt-1 text-base font-medium text-neutral-600">
              Check the number and try again.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && orders && orders.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-center justify-between">
              <Eyebrow>
                {orders.length === 1 ? "1 order found" : `${orders.length} orders found`}
              </Eyebrow>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-blue-600"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
                {copied ? "Link copied" : "Copy link"}
              </button>
            </div>

            <Accordion
              type="single"
              collapsible
              defaultValue={orders[0].orderId}
              className="w-full"
            >
              {orders.map((order, n) => {
                const status = order.fulfillmentStatus?.toLowerCase();
                const cancelled = status === "cancelled";
                const delivered = status === "delivered";
                const idx = stepIndex(order.fulfillmentStatus);

                return (
                  <AccordionItem
                    key={order.orderId}
                    value={order.orderId}
                    className="border-b-0 border-t-2 border-neutral-950"
                  >
                    <AccordionTrigger className="py-5 hover:no-underline [&>svg]:shrink-0">
                      <div className="flex w-full items-center justify-between gap-3 pr-2">
                        <div className="text-left">
                          <span className="text-xs font-semibold tracking-[0.14em] text-blue-600">
                            {String(n + 1).padStart(2, "0")}
                          </span>
                          <p className="text-xl font-extrabold leading-none tracking-[-0.04em] sm:text-2xl">
                            Order {order.orderId}
                          </p>
                          <p className="mt-1.5 text-sm font-medium text-neutral-500">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {" · "}
                            <span className="font-semibold text-neutral-950">
                              ₹{order.totalAmount}
                            </span>
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusPill(
                            order.fulfillmentStatus,
                          )}`}
                        >
                          {order.fulfillmentStatus}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pb-6">
                      {/* Progress */}
                      {cancelled ? (
                        <p className="rounded-2xl bg-red-600/10 p-4 text-sm font-semibold text-red-700">
                          This order was cancelled.
                        </p>
                      ) : (
                        <ol className="grid grid-cols-4 gap-2" aria-label="Order progress">
                          {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const done = i < idx || (delivered && i === idx);
                            const current = i === idx && !delivered;
                            return (
                              <li
                                key={step.key}
                                aria-current={current ? "step" : undefined}
                              >
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
                                  <div
                                    className={`h-full w-full rounded-full transition-all duration-500 ${
                                      done
                                        ? "bg-neutral-950"
                                        : current
                                        ? "bg-blue-600"
                                        : "w-0"
                                    }`}
                                  />
                                </div>
                                <div
                                  className={`mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] ${
                                    current
                                      ? "text-blue-700"
                                      : done
                                      ? "text-neutral-950"
                                      : "text-neutral-400"
                                  }`}
                                >
                                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                  <span className="truncate">{step.label}</span>
                                </div>
                              </li>
                            );
                          })}
                        </ol>
                      )}

                      {order.expectedDeliveryLabel && !cancelled && (
                        <p className="mt-5 text-sm font-medium text-neutral-500">
                          Expected delivery:{" "}
                          <span className="font-extrabold tracking-[-0.02em] text-neutral-950">
                            {order.expectedDeliveryLabel}
                          </span>
                        </p>
                      )}

                      {/* Items */}
                      <div className="mt-6 border-t border-neutral-200 pt-5">
                        <Eyebrow>Items</Eyebrow>
                        <ul className="mt-3 space-y-4">
                          {order.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-4">
                              {item.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="h-14 w-14 rounded-xl bg-neutral-100 object-cover"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-base font-extrabold tracking-[-0.03em]">
                                  {item.productName}
                                  {item.isFreeItem && (
                                    <span className="ml-2 rounded-full bg-blue-600/10 px-2 py-0.5 align-middle text-[10px] font-semibold uppercase tracking-[0.1em] text-blue-700">
                                      Free
                                    </span>
                                  )}
                                </p>
                                {item.size && (
                                  <p className="text-sm font-medium text-neutral-500">
                                    Size {item.size}
                                  </p>
                                )}
                              </div>
                              <p className="shrink-0 text-base font-extrabold tracking-[-0.03em]">
                                ₹{item.price}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Address */}
                      <div className="mt-6 border-t border-neutral-200 pt-5">
                        <Eyebrow>Delivering to</Eyebrow>
                        <div className="mt-3 flex items-start gap-2 text-sm font-medium leading-relaxed text-neutral-600">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-950" />
                          <p>
                            {order.address}, {order.landmark ? `${order.landmark}, ` : ""}
                            {order.district}, {order.state} – {order.pincode}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </section>
        )}
      </div>
    </main>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white">
          <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 md:py-20">
            <div className="h-8 w-36 animate-pulse rounded-md bg-neutral-200" />
            <div className="mt-5 h-20 w-4/5 animate-pulse rounded-xl bg-neutral-200" />
            <div className="mt-6 h-5 w-72 animate-pulse rounded bg-neutral-200" />
          </div>
        </main>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}