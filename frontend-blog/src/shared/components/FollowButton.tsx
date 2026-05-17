"use client";

// FollowButton — interactive follow/unfollow blog dengan optimistic UI.
// Auth required; kalau anonymous, redirect ke dashboard /login.

import { useEffect, useState } from "react";
import { UserPlus, UserCheck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://127.0.0.1:8091";
const DASHBOARD = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3000";

interface Props {
  subdomain: string;
  initialCount: number;
  /** Apakah ini blog kamu sendiri (button disabled, can't follow self) */
  isOwnBlog?: boolean;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_access_token");
}

export function FollowButton({ subdomain, initialCount, isOwnBlog }: Props) {
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_BASE}/api/v1/blogs/by-subdomain/${subdomain}/follow-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setFollowing(d?.data?.following === true))
      .catch(() => {});
  }, [subdomain]);

  if (isOwnBlog) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
        <UserCheck className="w-3.5 h-3.5" />
        {count.toLocaleString()} follower
      </span>
    );
  }

  const toggle = async () => {
    const token = getToken();
    if (!token) {
      window.alert("Login dulu di dashboard untuk bisa follow blog ini 🙏");
      window.location.href = `${DASHBOARD}/login?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }
    if (loading) return;
    setLoading(true);

    const prev = { following, count };
    setFollowing(!prev.following);
    setCount(prev.following ? prev.count - 1 : prev.count + 1);

    try {
      const res = await fetch(`${API_BASE}/api/v1/blogs/by-subdomain/${subdomain}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      if (typeof json?.data?.following === "boolean") setFollowing(json.data.following);
      if (typeof json?.data?.total_followers === "number") setCount(json.data.total_followers);
    } catch {
      setFollowing(prev.following);
      setCount(prev.count);
      window.alert("Gagal toggle follow. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
        following
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
          : "bg-myunila text-white hover:bg-myunila-700"
      } disabled:opacity-60`}
    >
      {following ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
      <span>{following ? "Mengikuti" : "Ikuti"}</span>
      <span className="opacity-70 tabular-nums">·</span>
      <span className="tabular-nums">{count.toLocaleString()}</span>
    </button>
  );
}
