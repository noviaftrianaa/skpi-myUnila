"use client";

import { useEffect, useRef, useState } from "react";
import { FiSearch, FiUser } from "react-icons/fi";
import { lookupService } from "@/lib/services/si-prestasi/prestasiService";
import type { MahasiswaLookup } from "@/lib/services/si-prestasi/types";

export function MahasiswaAutocomplete({
  onSelect,
  placeholder = "Cari NIM atau nama mahasiswa...",
}: {
  onSelect: (m: MahasiswaLookup) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MahasiswaLookup[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q || q.length < 2) { setResults([]); return; }
    const h = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await lookupService.searchMahasiswa(q, 10);
        setResults(r);
        setOpen(true);
      } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(h);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
      {open && (results.length > 0 || loading) && (
        <div className="absolute z-30 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {loading && <div className="p-3 text-center text-xs text-slate-400">Mencari...</div>}
          {!loading && results.map((m, i) => (
            <button
              key={`${m.nim}-${i}`}
              type="button"
              onClick={() => { onSelect(m); setQ(""); setResults([]); setOpen(false); }}
              className="flex w-full items-start gap-3 px-3 py-2 text-left text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20"
            >
              <div className="mt-0.5 rounded-full bg-amber-100 p-1.5 text-amber-600 dark:bg-amber-900/30">
                <FiUser className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium text-slate-800 dark:text-slate-100">{m.nama}</div>
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="font-mono">{m.nim}</span>
                  <span>·</span>
                  <span className="truncate">{m.prodi}</span>
                </div>
              </div>
            </button>
          ))}
          {!loading && results.length === 0 && q.length >= 2 && (
            <div className="p-3 text-center text-xs text-slate-400">Tidak ada hasil untuk &quot;{q}&quot;</div>
          )}
        </div>
      )}
    </div>
  );
}
