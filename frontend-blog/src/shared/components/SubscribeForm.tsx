"use client";

// Phase BB — Newsletter subscribe form untuk tenant pages.
// Public, no auth. Double opt-in: submit → check email → confirm link.

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { subscribeToBlog, type SubscribeResult } from "@/lib/api";

interface Props {
  subdomain: string;
  blogName: string;
  /** "card" (full bordered card) atau "inline" (compact form di footer/sidebar) */
  variant?: "card" | "inline";
}

export function SubscribeForm({ subdomain, blogName, variant = "card" }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SubscribeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await subscribeToBlog(subdomain, email.trim());
      setResult(r);
      if (r.status === "pending_confirmation" || r.status === "resent") {
        setEmail("");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal subscribe");
    } finally {
      setLoading(false);
    }
  };

  const inline = variant === "inline";

  return (
    <div className={inline
      ? ""
      : "rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-myunila-50/50 to-blue-50/30 dark:from-slate-900 dark:to-slate-950 p-6"
    }>
      {!inline && (
        <div className="mb-3">
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-slate-100 inline-flex items-center gap-2">
            <Mail className="w-5 h-5 text-myunila" /> Subscribe newsletter
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Dapat email setiap kali <strong>{blogName}</strong> publish post baru. Tanpa spam, unsubscribe kapan saja.
          </p>
        </div>
      )}

      {result ? (
        <div className={`rounded-lg p-3 flex items-start gap-2 ${
          result.status === "already_confirmed"
            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300"
            : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300"
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">
              {result.status === "already_confirmed" ? "Sudah subscribed!" : "Cek email kamu"}
            </p>
            <p className="text-xs mt-0.5 opacity-90">{result.message}</p>
            {result.status !== "already_confirmed" && (
              <button
                onClick={() => { setResult(null); }}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Subscribe email lain
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={inline ? "flex gap-2" : "flex flex-col sm:flex-row gap-2"}>
          <input
            type="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:border-myunila focus:ring-1 focus:ring-myunila outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-myunila text-white hover:bg-myunila/90 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim…
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Subscribe
              </>
            )}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-2 rounded-lg p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!result && !inline && (
        <p className="mt-3 text-[11px] text-slate-400">
          Privacy: email kamu cuma dipakai untuk kirim post baru dari blog ini. Tidak di-share, tidak di-jual.
        </p>
      )}
    </div>
  );
}
