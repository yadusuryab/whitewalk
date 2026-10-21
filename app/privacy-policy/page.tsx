import Head from "next/head";
import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { ArrowUpRight } from "lucide-react";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "800"],
  display: "swap",
});

type Section = {
  title: string;
  intro?: string;
  items?: { term: string; text: string }[];
};

const SECTIONS: Section[] = [
  {
    title: "Information we collect",
    items: [
      { term: "Name", text: "Your full name, used for processing and fulfilling your orders." },
      { term: "Phone number", text: "Used to communicate with you about your order status, provide updates, and offer customer support." },
      { term: "Address", text: "Your shipping address, including City, State, and Pin Code, to ensure accurate delivery." },
      { term: "Additional information", text: "Any other details you voluntarily choose to share with us to improve your shopping experience." },
    ],
  },
  {
    title: "How we use your information",
    items: [
      { term: "Order processing", text: "To process and fulfill your orders accurately and efficiently." },
      { term: "Customer communication", text: "To send you order confirmations, status updates, and respond to your inquiries." },
      { term: "Service improvement", text: "To analyze user behavior, helping us enhance our website, products, and overall shopping experience." },
      { term: "Marketing", text: "To send promotional materials and special offers, if you have opted to receive such communications." },
      { term: "Legal compliance", text: "To comply with applicable laws, regulations, and legal obligations." },
    ],
  },
  {
    title: "Sharing your information",
    intro: "Your privacy is important to us. We may share your personal information with trusted third parties only in the following situations:",
    items: [
      { term: "Suppliers", text: "Necessary information shared with our suppliers to fulfill your orders." },
      { term: "Service providers", text: "Third-party providers for payment processing, shipping, and other essential functions." },
      { term: "Legal requirements", text: "Disclosures made when required by law or in response to valid requests from public authorities." },
    ],
  },
  {
    title: "Data security",
    intro: "We use a range of security measures to protect your personal information from unauthorized access, use, or disclosure. These include encryption, firewalls, and secure server hosting.",
  },
  {
    title: "Your rights",
    items: [
      { term: "Access", text: "Request access to the personal information we hold about you." },
      { term: "Correction", text: "Request corrections to inaccuracies in your personal data." },
      { term: "Deletion", text: "Request deletion of your personal information, subject to legal exceptions." },
      { term: "Opt-out", text: "Opt out of receiving marketing communications." },
    ],
  },
  {
    title: "Changes to this policy",
    intro: "We may update this Privacy Policy periodically. Updates will be posted on this page.",
  },
  {
    title: "Third-party links",
    intro: "Our website may contain links to third-party websites. We are not responsible for the content or privacy practices of these sites.",
  },
  {
    title: "Children’s privacy",
    intro: "Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children.",
  },
];

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy - footex Store</title>
        <meta
          name="description"
          content="Read the privacy policy of footex Store to understand how we handle your data."
        />
      </Head>

      <main className={`${display.className} mx-auto w-full max-w-3xl px-5 py-12 text-neutral-950 sm:px-8 sm:py-20`}>
        {/* Header */}
        <header>
          <div className="inline-flex items-center gap-2 rounded-md bg-blue-600/10 px-3.5 py-1.5 text-sm font-semibold text-blue-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
            </span>
            Legal
          </div>

          <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[0.92] tracking-[-0.045em] sm:text-7xl">
            Privacy policy.
          </h1>

          <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-neutral-600 sm:text-lg">
            At footex Store, we are dedicated to protecting your privacy and securing the personal
            information you provide. This policy outlines how we collect, use, and share your data when
            you visit our website or make purchases.
          </p>
        </header>

        {/* Sections */}
        <div className="mt-14 sm:mt-20">
          {SECTIONS.map((section, i) => (
            <section
              key={section.title}
              className="grid gap-4 border-t-2 border-neutral-950 py-8 md:grid-cols-[9rem_1fr] md:gap-8 md:py-10"
            >
              <div>
                <span className="text-sm font-semibold tracking-[0.14em] text-blue-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="mt-1 text-2xl font-extrabold leading-[1] tracking-[-0.04em] sm:text-3xl">
                  {section.title}
                </h2>
              </div>

              <div>
                {section.intro && (
                  <p className="text-base font-medium leading-relaxed text-neutral-600">
                    {section.intro}
                  </p>
                )}

                {section.items && (
                  <dl className={section.intro ? "mt-5" : ""}>
                    {section.items.map((item) => (
                      <div
                        key={item.term}
                        className="border-b border-neutral-200 py-4 first:pt-0 last:border-b-0 last:pb-0"
                      >
                        <dt className="text-lg font-extrabold tracking-[-0.03em]">{item.term}</dt>
                        <dd className="mt-1 text-base font-medium leading-relaxed text-neutral-600">
                          {item.text}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <footer className="border-t-2 border-neutral-950 pt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-neutral-400">
            Website made by
          </p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-[-0.045em]">yadulabs.</h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="https://instagram.com/yadulabs"
              className="group inline-flex items-center gap-2 rounded-full bg-neutral-950 py-2 pl-5 pr-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-blue-600"
            >
              Instagram
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
            
          </div>
        </footer>
      </main>
    </>
  );
}