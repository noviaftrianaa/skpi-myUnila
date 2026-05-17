"use client";

import { Search, FileText, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Suggestion {
  id_post: string;
  judul: string;
  slug: string;
  subdomain: string;
  nm_tampilan?: string;
  cover_url?: string;
  kategori_nama?: string;
}

interface SearchBarProps {
  size?: "lg" | "md" | "sm";
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_BLOG_API || "http://localhost:8091";
const APEX_HOST = process.env.NEXT_PUBLIC_APEX_HOST || "blog.unila.ac.id";

export function SearchBar({ size = "lg", defaultValue = "", placeholder, className }: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchTokenRef = useRef(0); // race-guard so out-of-order responses don't clobber state

  // Debounced fetch. 200ms feels instant while still batching keystrokes.
  useEffect(() => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setActiveIdx(-1);
      return;
    }
    const token = ++fetchTokenRef.current;
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/search/suggest?q=${encodeURIComponent(trimmed)}&limit=6`,
          { cache: "force-cache" }
        );
        if (!res.ok) return;
        const json = await res.json();
        if (token !== fetchTokenRef.current) return; // stale response — drop
        setSuggestions(json?.data?.hits ?? []);
        setActiveIdx(-1);
      } catch {
        // network error — silently empty rather than tearing down the UI
        if (token === fetchTokenRef.current) setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(handle);
  }, [q]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAndSearch = (query: string) => {
    setOpen(false);
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Enter on a focused suggestion = navigate to that post directly
    if (activeIdx >= 0 && activeIdx < suggestions.length) {
      const s = suggestions[activeIdx];
      setOpen(false);
      router.push(`https://${s.subdomain}.${APEX_HOST}/posts/${s.slug}`);
      return;
    }
    closeAndSearch(q);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} role="search" className="relative">
        <Search
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none",
            size === "lg" && "w-5 h-5",
            size === "md" && "w-4 h-4",
            size === "sm" && "w-4 h-4"
          )}
        />
        <input
          ref={inputRef}
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder || "Cari artikel, penulis, atau topik…"}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="searchbar-suggestions"
          aria-expanded={open && suggestions.length > 0}
          className={cn(
            "w-full pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-myunila focus:border-transparent transition-all shadow-sm hover:shadow-md",
            size === "lg" && "h-14 text-base",
            size === "md" && "h-11 text-sm",
            size === "sm" && "h-9 text-sm"
          )}
        />
        <kbd
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-0.5 text-xs text-slate-500 font-mono pointer-events-none",
            size !== "lg" && "hidden"
          )}
        >
          ⌘K
        </kbd>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id="searchbar-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-96 overflow-y-auto"
        >
          {suggestions.map((s, idx) => (
            <li
              key={s.id_post}
              role="option"
              aria-selected={idx === activeIdx}
            >
              <a
                href={`https://${s.subdomain}.${APEX_HOST}/posts/${s.slug}`}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0 transition-colors",
                  idx === activeIdx ? "bg-myunila/5 text-myunila" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {s.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-400">
                    <FileText className="w-4 h-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{s.judul}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {s.nm_tampilan ? `${s.nm_tampilan} · ` : ""}@{s.subdomain}
                    {s.kategori_nama && ` · ${s.kategori_nama}`}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </a>
            </li>
          ))}
          <li className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => closeAndSearch(q)}
              className="w-full px-4 py-2.5 text-xs font-medium text-myunila hover:bg-myunila/5 inline-flex items-center justify-center gap-1.5"
            >
              Lihat semua hasil untuk &ldquo;<strong>{q}</strong>&rdquo;
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
