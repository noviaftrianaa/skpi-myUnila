"use client";

// ViewTracker — sends POST to /posts/:id/view sekali per mount.
// Dedup happens server-side via ip_hash (30 min window).
// Used inside post detail page (server component) as <ViewTracker idPost={...} />.

import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";

interface Props {
  idPost: string;
}

export function ViewTracker({ idPost }: Props) {
  useEffect(() => {
    if (!idPost) return;

    // Use Beacon API kalau available — non-blocking, fire-and-forget,
    // survives navigation. Fallback ke fetch keepalive.
    const url = `${API_BASE}/api/v1/posts/${idPost}/view`;
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([JSON.stringify({})], { type: "application/json" }));
      } else {
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
          keepalive: true,
        }).catch(() => {
          /* silent — view tracking is best-effort */
        });
      }
    } catch {
      /* never block reader experience */
    }
  }, [idPost]);

  return null;
}
