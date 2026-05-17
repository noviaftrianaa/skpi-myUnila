"use client";

// BookmarkButton — save post ke reading list pribadi.
// Auth required; anonymous → redirect ke dashboard /login.

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";
const DASHBOARD = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";

interface Props {
  idPost: string;
}

export function BookmarkButton({ idPost }: Props) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_access_token");
  };

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/api/v1/posts/${idPost}/bookmark-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setBookmarked(d?.data?.bookmarked === true))
      .catch(() => {});
  }, [idPost]);

  const toggle = async () => {
    const token = getToken();
    if (!token) {
      window.alert("Login dulu di dashboard untuk simpan ke reading list 📑");
      window.location.href = `${DASHBOARD}/login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    if (loading) return;
    setLoading(true);

    const prev = bookmarked;
    setBookmarked(!prev);

    try {
      const res = await fetch(`${API_BASE}/api/v1/posts/${idPost}/bookmark`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      if (typeof json?.data?.bookmarked === "boolean") setBookmarked(json.data.bookmarked);
    } catch {
      setBookmarked(prev);
      window.alert("Gagal toggle bookmark. Coba lagi nanti.");
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
        bookmarked
          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30"
      } disabled:opacity-60`}
      aria-label={bookmarked ? "Hapus dari reading list" : "Simpan ke reading list"}
      title={bookmarked ? "Tersimpan di reading list" : "Simpan untuk dibaca nanti"}
    >
      {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      <span className="hidden sm:inline">{bookmarked ? "Tersimpan" : "Simpan"}</span>
    </button>
  );
}
