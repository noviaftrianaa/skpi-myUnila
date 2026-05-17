"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "id", label: "ID" },
  { code: "en", label: "EN" },
] as const;

type Lang = typeof LANGS[number]["code"];

// Plain segmented control — tanpa motion indicator (per user request).
export function LanguageToggle({ className }: { className?: string }) {
  const [lang, setLang] = useState<Lang>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== "undefined" && localStorage.getItem("blog-lang")) as Lang | null;
    if (stored === "id" || stored === "en") setLang(stored);
  }, []);

  const handleChange = (newLang: Lang) => {
    setLang(newLang);
    if (typeof window !== "undefined") localStorage.setItem("blog-lang", newLang);
  };

  if (!mounted) return <div className={cn("h-8 w-16", className)} aria-hidden />;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-0.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60",
        className
      )}
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => handleChange(l.code)}
            className={cn(
              "px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-150",
              active
                ? "bg-myunila text-white shadow-sm"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
