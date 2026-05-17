"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  idPost: string;
  /** Selector for the article container — progress is measured against
   *  its scroll position, not the whole window. Defaults to <article>. */
  articleSelector?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://localhost:8091";
const STORAGE_KEY = (idPost: string) => `reading_progress:${idPost}`;
const SYNC_INTERVAL_MS = 5000; // backend upsert cadence
const COMPLETE_THRESHOLD = 90; // % at which we mark completed

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_access_token");
}

/**
 * ReadingProgress — fixed progress bar at the top of the viewport showing
 * how far the user has scrolled through the article. Sticky restore: on
 * mount, fetches the user's last position (cross-device sync for authed
 * users, localStorage fallback for anonymous) and scrolls there.
 *
 * The visible bar is rendered server-side at 0% by default, then activates
 * via useEffect. The sync side-effects only run on the client.
 */
export function ReadingProgress({ idPost, articleSelector = "article" }: Props) {
  const [pct, setPct] = useState(0);
  const lastSyncedPctRef = useRef(0);
  const restoredRef = useRef(false);

  // Restore on mount — prefer backend (cross-device), fall back to localStorage.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let restore: { pct: number; posPx?: number } | null = null;
      const token = getToken();
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/api/v1/posts/${idPost}/my-progress`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.status === 200) {
            const json = await res.json();
            const data = json?.data;
            if (data && typeof data.progress_pct === "number") {
              restore = { pct: data.progress_pct, posPx: data.last_position_px ?? undefined };
            }
          }
        } catch {
          // ignore — fall through to localStorage
        }
      }
      if (!restore) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY(idPost));
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed?.pct === "number") restore = parsed;
          }
        } catch {
          // ignore
        }
      }
      if (cancelled || !restore || restore.pct < 5) return;
      // Don't auto-scroll on completed reads — readers re-opening probably
      // want the top.
      if (restore.pct >= COMPLETE_THRESHOLD) {
        setPct(restore.pct);
        restoredRef.current = true;
        return;
      }
      // Wait for layout, then scroll. requestAnimationFrame keeps it from
      // fighting the browser's own scroll restoration.
      requestAnimationFrame(() => {
        if (cancelled) return;
        const article = document.querySelector(articleSelector) as HTMLElement | null;
        if (article && restore?.posPx) {
          window.scrollTo({ top: restore.posPx, behavior: "auto" });
        } else if (article) {
          const target = article.offsetTop + (article.offsetHeight * restore.pct) / 100;
          window.scrollTo({ top: target, behavior: "auto" });
        }
        setPct(restore.pct);
        restoredRef.current = true;
      });
    })();
    return () => { cancelled = true; };
  }, [idPost, articleSelector]);

  // Scroll listener — computes pct against the article element's bounds.
  useEffect(() => {
    const compute = () => {
      const article = document.querySelector(articleSelector) as HTMLElement | null;
      if (!article) return;
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const viewportH = window.innerHeight;
      // Once the bottom of the viewport reaches the bottom of the article we
      // call it 100%.
      const scrolled = window.scrollY + viewportH - articleTop;
      const totalReadable = articleHeight; // length the user can scroll over
      let p = totalReadable > 0 ? (scrolled / totalReadable) * 100 : 0;
      if (p < 0) p = 0;
      if (p > 100) p = 100;
      setPct(p);
    };
    compute();
    const onScroll = () => requestAnimationFrame(compute);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [articleSelector]);

  // Persist — every SYNC_INTERVAL_MS, only when changed by ≥3% to avoid
  // burning writes on every pixel. Forward-only is enforced server-side too.
  useEffect(() => {
    const handle = setInterval(() => {
      const rounded = Math.round(pct);
      const delta = Math.abs(rounded - lastSyncedPctRef.current);
      if (delta < 3 && rounded !== 100) return; // skip noise
      lastSyncedPctRef.current = rounded;

      // Always write to localStorage first — instant restore for anon + offline.
      try {
        localStorage.setItem(STORAGE_KEY(idPost), JSON.stringify({
          pct: rounded,
          posPx: Math.round(window.scrollY),
          at: Date.now(),
        }));
      } catch {
        // ignore (private mode, quota)
      }

      const token = getToken();
      if (!token) return;
      fetch(`${API_BASE}/api/v1/me/reading-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_post: idPost,
          progress_pct: rounded,
          last_position_px: Math.round(window.scrollY),
        }),
        keepalive: true, // survives tab close
      }).catch(() => {});
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(handle);
  }, [idPost, pct]);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1 pointer-events-none"
      aria-hidden
    >
      <div
        className="h-full bg-gradient-to-r from-myunila to-blue-500 transition-[width] duration-150"
        style={{ width: `${pct.toFixed(1)}%` }}
      />
    </div>
  );
}
