"use client";

import React from "react";
import dynamic from "next/dynamic";
import { LiveMapProps } from "./LiveMapInner";

// Dynamic import with SSR disabled so Leaflet never touches Node.js runtime
export const LiveMap = dynamic(
  () => import("./LiveMapInner").then((mod) => mod.LiveMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[380px] rounded-lg border border-eco-outline-variant bg-eco-surface-container flex flex-col items-center justify-center p-6 shadow-subtle select-none">
        <div className="flex items-center space-x-2 text-eco-primary font-label text-xs">
          <div className="w-4 h-4 border-2 border-eco-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading GVMC Ward 14 Real GIS Tile Canvas...</span>
        </div>
      </div>
    ),
  }
);
