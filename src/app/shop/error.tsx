"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-zed flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="glass-card rounded-zed p-10 md:p-16">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-red-50">
          <AlertTriangle className="size-8 text-red-500" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-black md:text-3xl">Couldn&apos;t load products</h1>
        <p className="mx-auto mt-3 max-w-md text-black/60">
          Something went wrong while loading the shop. Please try again.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-zed-950 px-6 py-3 text-sm font-bold text-white shadow-raised transition-all hover:-translate-y-0.5 hover:shadow-glass-lg"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-edge bg-white/60 px-6 py-3 text-sm font-bold text-black backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
