import "server-only";

import { Metadata, Viewport } from "next";
import { fraunces, inter } from "@/app/fonts";
import { SITE } from "@/lib/constants";
import { buildMetadata, jsonLdStore } from "@/lib/seo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { BackgroundScene } from "@/components/layout/BackgroundScene";
import { ToastHost } from "@/components/ui/ToastHost";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { BottomNav } from "@/components/layout/BottomNav";
import { ServiceWorkerReg } from "@/components/layout/ServiceWorkerReg";
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
  themeColor: "#6E1F2A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const storeJsonLd = JSON.stringify(jsonLdStore());
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      {/* Strip Chrome extension attributes to prevent hydration mismatch */}
      <script dangerouslySetInnerHTML={{ __html: `document.addEventListener('DOMContentLoaded',()=>{const e=document.documentElement;e.removeAttribute('crxlauncher');e.removeAttribute('crxlauncher-bridged')})`}} />
      <body className="min-h-screen bg-pure-white text-black font-sans antialiased" suppressHydrationWarning>
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
        <InstallPrompt />
        <BottomNav />
        <ServiceWorkerReg />
      </body>
    </html>
  );
}