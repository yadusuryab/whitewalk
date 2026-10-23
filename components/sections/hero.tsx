"use client";

import Poster2 from "@/public/offr.avif";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Inter_Tight } from "next/font/google";
import { client } from "@/sanityClient";
import { ArrowUpRight, Truck, RotateCcw, ShieldCheck } from "lucide-react";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "800"],
  display: "swap",
});

type BannerData = {
  imageUrl: string;
  link: string;
  title: string;
};

// Edit these to match your live offer
const OFFER_PRICE = "₹1499";
const OFFER_LABEL = "3 Pair Offer ";
const PERKS = [
  { icon: Truck, text: "Free delivery" },
  { icon: RotateCcw, text: "Easy returns" },
  { icon: ShieldCheck, text: "Secure checkout" },
];

export function Hero() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [bannerFetched, setBannerFetched] = useState(false);

  useEffect(() => {
    client
      .fetch(
        `*[_type == "banner" && isActive == true] | order(orderNumber asc)[0]{
          "imageUrl": image.asset->url,
          link,
          title
        }`,
      )
      .then((data) => setBanner(data))
      .catch(() => setBanner(null))
      .finally(() => setBannerFetched(true));
  }, []);

  const imageSrc = banner?.imageUrl || Poster2.src;
  const href = banner?.link || "/offer?pairs=3";
  const title = banner?.title || "3 pairs for ₹1499.";

  if (!bannerFetched) {
    return (
      <div className="w-full px-5 sm:px-8">
        <div className="h-8 w-32 animate-pulse rounded-full bg-neutral-200" />
        <div className="mt-4 h-24 w-4/5 animate-pulse rounded-xl bg-neutral-200" />
        <div className="mt-6 aspect-[2/1] w-full animate-pulse rounded-3xl bg-neutral-200" />
        <div className="mt-6 h-16 w-full animate-pulse rounded-full bg-neutral-200" />
      </div>
    );
  }

  return (
    <section className="w-full px- sm:px-8">
      <Link
        href={href}
        onClick={() => setIsLoading(true)}
        aria-busy={isLoading}
        className={`${display.className} group block text-neutral-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-neutral-950`}
      >
        {/* Live offer tag */}
        {/* <div className="flex items-center justify-between"> */}
         

        {/* Headline */}
        {/* <h2 className=" text-balance text-3xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-7xl md:text-8xl">
          {title}
        </h2> */}
         {/* <div className="inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          Offer is live
        </div> */}
        {/* </div> */}

        {/* Image with price sticker */}
        <div className="relative mt-7">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-neutral-100">
            <Image
              src={imageSrc}
              alt={title}
              width={800}
              height={400}
              className={`h-auto w-full transition-all duration-700 group-hover:scale-[1.03] ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } ${isLoading ? "opacity-60" : ""}`}
              priority
              quality={60}
              sizes="(max-width: 640px) 95vw, (max-width: 1024px) 80vw, 600px"
              onLoad={() => setImageLoaded(true)}
            />

            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-neutral-200" />
            )}

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent" />
              </div>
            )}
          </div>

          {/* Sticker */}
          <div
            aria-hidden="true"
            className="absolute -top-5 right-3 flex h-24 w-24 -rotate-12 flex-col items-center justify-center rounded-2xl bg-black text-white shadow-xl shadow-blue-600/30 sm:h-28 sm:w-28"
          >
            <span className="text-[11px] font-semibold leading-none">
              {OFFER_LABEL}
            </span>
            <span className="mt-1 text-2xl font-extrabold leading-none tracking-tight sm:text-3xl">
              {OFFER_PRICE}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 flex h-16 items-center justify-between rounded-full bg-neutral-950 pl-7 pr-2 text-white transition-colors duration-300 group-hover:bg-blue-600 sm:h-[4.5rem]">
          <span className="text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
            Claim offer
          </span>
          <span
            aria-hidden="true"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45 sm:h-14 sm:w-14"
          >
            <ArrowUpRight className="h-6 w-6" />
          </span>
        </div>

        {/* Reassurance */}
        {/* <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-neutral-600">
          {PERKS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul> */}
      </Link>
    </section>
  );
}