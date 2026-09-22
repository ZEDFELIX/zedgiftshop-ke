import type { Metadata, Viewport } from "next";
import { fraunces, inter } from "@/app/fonts";
import { SITE } from "@/lib/constants";
import { buildMetadata, jsonLdStore } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BackgroundScene } from "@/components/layout/BackgroundScene";
import { ToastHost } from "@/components/ui/ToastHost";
import "@/app/globals.css";

export const metadata: Metadata = buildMetadata({
  title: SITE.name,
  path: "/",
  description: SITE.description,
  type: "website",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#063121",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const storeJsonLd = JSON.stringify(jsonLdStore());
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-zed-50 text-ink font-sans antialiased">
        <BackgroundScene />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: storeJsonLd }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-zed focus:bg-white focus:px-4 focus:py-2 focus:shadow-raised"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CartDrawer />
        <ToastHost />
      </body>
    </html>
  );
}