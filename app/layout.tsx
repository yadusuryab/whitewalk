import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site-config";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import GoogleTagManager from "@/components/analyatics/GoogleTagManager";
import MetaPixel from "@/components/analyatics/MetaPixel";
import { WhatsAppButton } from "@/components/utils/wp";

// ✅ OPTIMIZED: Preload only necessary font weights
const poppins = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // ✅ Added multiple weights
  display: "swap", // ✅ Better performance
  preload: true, // ✅ Keep preload for critical font
  fallback: ["system-ui", "arial"], // ✅ Better fallback
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`, // ✅ Better SEO
  },
  description: "Buy quality products at affordable price.",
  keywords: ["shoes", "footwear", "fashion", "affordable"], // ✅ Added for SEO
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* ✅ OPTIMIZED: Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* ✅ OPTIMIZED: Add favicon links */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-touch-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
      </head>
      <MetaPixel />

      <body className={`${poppins.className} antialiased `}>
        {/* ✅ OPTIMIZED: Consider lazy loading non-critical components */}
        <Header />
        <main className="py-0 min-h-screen">
          {" "}
          {/* ✅ Added main tag for semantics */}
          {children}
          <WhatsAppButton />
        </main>
        <Footer />
        <Toaster />

        {/* ✅ OPTIMIZED: Load GTM only in production */}
        {process.env.NODE_ENV === "production" && <GoogleTagManager />}
      </body>
    </html>
  );
}
