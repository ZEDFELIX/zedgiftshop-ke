"use client";

import { useState } from "react";

export function SkeletonProductCard() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="group rounded-zed overflow-hidden bg-white/55 transition-colors hover:bg-white/70"
      style={{ opacity: loaded ? 1 : 0.6 }}
    >
      <div
        className="h-[200px] w-full bg-white/10 group-hover:bg-white/20 transition-colors"
      />
      <div className="p-4">
        <div className="h-6 w-full rounded bg-white/20 mb-3" />
        <div className="h-4 w-full rounded bg-white/20 mb-1" />
        <div className="h-4 w-2/3 rounded bg-white/20" />
      </div>
    </div>
  );
}