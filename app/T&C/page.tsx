import React from "react";
import { Inter_Tight } from "next/font/google";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  // Paragraph placement: before or after the bullet list (default: after)
  paragraphsFirst?: boolean;
};

const SECTIONS: Section[] = [
  {
    title: "Return & replacement policy",
    bullets: [
      "You can return the product for a replacement if the product is the wrong size, incorrect, or damaged.",
      "We do not offer exchanges, returns, or refunds for reasons related to personal preferences or dislikes. We strive to provide the best, but individual tastes and preferences may vary.",
    ],
    paragraphs: [
      "Refunds are not available, only replacements. However, if the product is lost by the courier service, a refund is applicable under specific conditions.",
    ],
  },
  {
    title: "Unboxing video requirements",
    bullets: [
      "A 360-degree video of unboxing the parcel is mandatory for any claims related to damage, size incorrect, missing items, etc. The issue must be clearly shown in the video without any pauses or cuts. This must be reported within 24 hours of receiving the parcel.",
      "The video should begin by showing the address label as sent by us, including the outer packaging.",
    ],
    paragraphs: [
      "Some customers forget to take an unboxing video and later create fake videos. We do not accept such videos as proof. All customers must follow our guidelines.",
    ],
  },
  {
    title: "AI-generated images & product representation",
    paragraphs: [
      "Some of our product visuals are created using AI for display purposes. We make sincere efforts to deliver products that closely match the images shown.",
      "Minor variations in color tone, texture, shine, or finishing may occur due to lighting conditions, AI rendering, screen differences, or stock variations. These are normal aspects of digital product representation.",
    ],
  },
  {
    title: "Buy 1 Get 1 / Two pair ₹1499 offer",
    paragraphs: [
      "Our Buy 1 Get 1 offer is structured to provide maximum value within this price range. The products offered under this promotion are 6A quality replicas, and their quality is aligned with the offer pricing.",
      "Please note that this is a commercial market grading term used for replica products. It does not mean the product is original, officially branded, or authorized by the brand owner.",
    ],
  },
  {
    title: "Returns & replacements",
    paragraphs: [
      "Variations arising from visual representation, lighting effects, or digital creation methods are not considered manufacturing defects and are not eligible for return or replacement.",
    ],
  },
  {
    title: "Important notes",
    bullets: [
      "Slight color variation or light/dark differences due to digital photography or device screen settings may occur. Therefore, images shown may differ slightly from the actual product.",
      "For combo or offer items, model selection will be as per your order, but minor color variations may occur depending on stock availability. We always ensure the closest match possible to your chosen color.",
      "Minor issues like loose threads, removable stains, or slight stitching imperfections are not considered damages.",
    ],
  },
  {
    title: "Keep in mind",
    bullets: [
      "Cancellation is not allowed after placing the order.",
      "If you want to replace a product, you must bear the courier charges. If the issue is from our side, we will cover the courier cost only after you provide the dispatch slip.",
      "The quality of the product is based on the price you pay.",
    ],
  },
  {
    title: "Shipping & delivery",
    bullets: [
      "We are not the owners of any courier services.",
      "We send parcels through third-party courier services. If there is any delay in delivery, we are not responsible as it is beyond our control. However, 24x7 support is available from our side with 100% effort to resolve the issue. If the issue remains unresolved, it will be handled through mutual discussion.",
      "Do not request refunds or order cancellations due to courier delays. Please be patient and cooperate.",
    ],
  },
  {
    title: "Size replacement conditions",
    paragraphs: [
      "If you wish to replace the delivered product with the same shoes in a different size, it will be processed based on stock availability.",
      "However, if you ordered size 10 and received the correct size as per your order but later wish to exchange for a larger size, this is not possible, as we clearly specify the maximum available size (size 10) before purchase. Similarly, if you order size 6 and wish to replace it with size 5 (which is smaller), this is also not possible. Please keep this in mind while placing your order.",
    ],
  },
];

const TermsAndConditions = () => {
  return (
    <section
      aria-labelledby="terms-heading"
      className={`${display.className} mt-6 px-4 w-full text-neutral-950`}
    >
      {/* Header */}
      <header>
        <div className="inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-xs font-semibold text-blue-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          By placing an order, you agree
        </div>

        <h2
          id="terms-heading"
          className="mt-4 text-balance text-4xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-5xl"
        >
          Terms &amp; conditions.
        </h2>
      </header>

      {/* Sections */}
      <div className="mt-8">
        {SECTIONS.map((section, i) => (
          <article
            key={section.title}
            className="border-t-2 border-neutral-950 py-5"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-semibold tracking-[0.14em] text-blue-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-xl">
                {section.title}
              </h3>
            </div>

            <div className="mt-3 space-y-3 text-sm font-medium leading-relaxed text-neutral-600">
              {section.bullets && (
                <ul className="space-y-2.5">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[0.5rem] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950"
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.paragraphs?.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* Closing note */}
      <div className="border-t-2 border-neutral-950 pt-6">
        <p className="rounded-2xl bg-blue-600/10 p-4 text-sm font-semibold leading-relaxed text-blue-700">
          Read carefully; do not scroll without understanding. Later, do not blame us. For more
          terms and conditions, check our website. If you have any doubts, clarify them with us
          before placing an order.
        </p>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
          Best regards
        </p>
        <p className="text-2xl font-extrabold tracking-[-0.045em]">WHITEWALK.IN</p>
      </div>
    </section>
  );
};

export default TermsAndConditions;