"use client";

// LikeButton — interactive like with optimistic UI.
// Auth required di backend; kalau user tidak login, redirect ke dashboard /login.

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";
const DASHBOARD = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";

interface Props {
  idPost: string;
  initialCount: number;
}

export function LikeButton({ idPost, initialCount }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Read auth token dari localStorage (di-share dengan dashboard)
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_access_token");
  };

  // Fetch like-status saat mount
  useEffect(() => {
    const token = getToken();
    if (!token) return; // anonymous, skip
    fetch(`${API_BASE}/api/v1/posts/${idPost}/like-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setLiked(d?.data?.liked === true))
      .catch(() => {});
  }, [idPost]);

  const toggle = async () => {
    const token = getToken();
    if (!token) {
      window.alert("Login dulu di dashboard untuk bisa like post 🙏");
      window.location.href = `${DASHBOARD}/login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    if (loading) return;
    setLoading(true);

    // Optimistic update
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`${API_BASE}/api/v1/posts/${idPost}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      // Server-confirmed values
      if (typeof json?.data?.liked === "boolean") setLiked(json.data.liked);
      if (typeof json?.data?.total_likes === "number") setCount(json.data.total_likes);
    } catch {
      // Revert optimistic update
      setLiked(prevLiked);
      setCount(prevCount);
      window.alert("Gagal toggle like. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        liked
          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
      } disabled:opacity-60`}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      <span className="tabular-nums">{count.toLocaleString()}</span>
    </button>
  );
}
