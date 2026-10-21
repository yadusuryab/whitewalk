"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/sections/hero";
import { FreeSocksPromo } from "@/components/sections/free-socks";
import { TwoPairsOffer } from "@/components/sections/2pair";
import { OrderTrackCTA } from "@/components/sections/order-track";
import { ReviewsBento } from "@/components/sections/review-bento";
import { ShopVideo } from "@/components/layout/sv";
import { client } from "@/sanityClient";

// Each card: full column width, never split across columns
const CARD = " break-inside-avoid max-w-[600px] w-full mx-auto grid gap-2";

export default function Home() {
  const [freeSocksOffer, setFreeSocksOffer] = useState(false);

  useEffect(() => {
    client
      .fetch(`*[_type == "settings"][0]{ freeSocksOffer }`)
      .then((data) => setFreeSocksOffer(!!data?.freeSocksOffer))
      .catch(() => setFreeSocksOffer(false));
  }, []);

  return (
    <div className="min-h-screen py-3">
      {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
      <div className="mx-auto w-full columns-1 gap-1 px-4 md:grid md:grid-cols-2">
        <div className={CARD}>
          <Hero />
           <TwoPairsOffer />
          <div className={CARD}>
            <OrderTrackCTA />
            <div className={CARD}>
              <ShopVideo />
            </div>
          </div>
        </div>

        {freeSocksOffer && (
          <div className={CARD}>
            <FreeSocksPromo />
          </div>
        )}

        <div className={CARD}>
         
          <div className={CARD}>
            <ReviewsBento />
          </div>
        </div>
      </div>
    </div>
  );
}
