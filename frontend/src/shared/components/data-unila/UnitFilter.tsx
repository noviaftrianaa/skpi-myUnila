"use client";

/**
 * UnitFilter — single hierarchical multi-select (Fakultas → Jurusan → Prodi)
 *
 * Konsolidasi 3 dropdown (Fakultas/Jurusan/Prodi) menjadi 1 select hierarkis dgn multi-select.
 *
 * Output: array of "lvl:id" entries (mis. ["fak:UUID", "jur:UUID2"]) yang di-serialize
 * jadi param `unit_filter=fak:UUID,jur:UUID2` ke backend. Backend OR-combine antar-level,
 * AND-combine dgn forced role layer.
 *
 * Role-based:
 * - forcedFakultas: hanya tampilkan jurusan+prodi dalam fakultas tsb (fakultas root disembunyikan)
 * - forcedJurusan: hanya tampilkan prodi anaknya (jurusan+fakultas disembunyikan)
 * - forcedProdi: dropdown disabled
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiChevronDown, FiSearch, FiX } from "react-icons/fi";

export interface UnitFilterFakultas { id_fakultas: string; nm_fakultas: string }
export interface UnitFilterJurusan  { id_jurusan: string; id_fakultas?: string; nm_jurusan: string }
export interface UnitFilterProdi    { id_sms: string; id_fakultas?: string; id_jurusan?: string; nm_prodi: string; jenjang?: string }

export interface UnitFilterProps {
  data: {
    fakultas?: UnitFilterFakultas[];
    jurusan?: UnitFilterJurusan[];
    prodi?: UnitFilterProdi[];
  } | null | undefined;
  /** Array of "lvl:id" entries — yg dipilih user (multi-select) */
  value: string[];
  onChange: (next: string[]) => void;
  forcedFakultas?: string;
  forcedJurusan?: string;
  forcedProdi?: string;
  label?: string;
  width?: string;
}

interface TreeNode {
  key: string;        // "fak:UUID" | "jur:UUID" | "prd:UUID"
  level: 0 | 1 | 2;   // 0=Fakultas, 1=Jurusan, 2=Prodi
  display: string;    // Nama tanpa indent
  searchText: string; // Concat of all ancestors + this for search match
  type: "fak" | "jur" | "prd";
}

const cleanJurusan = (s?: string | null) =>
  (s || "").replace(/^Jurusan\s+Jurusan\s+/i, "Jurusan ").replace(/^Jurusan\s+/i, "");

export default function UnitFilter({
  data,
  value,
  onChange,
  forcedFakultas,
  forcedJurusan,
  forcedProdi,
  label = "Filter Unit",
  width = "w-full",
}: UnitFilterProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const fakultasArr = data?.fakultas || [];
  const jurusanArr = data?.jurusan || [];
  const prodiArr = data?.prodi || [];

  // Build flat tree list with level metadata
  const tree: TreeNode[] = useMemo(() => {
    const nodes: TreeNode[] = [];
    const jurusanByFak = new Map<string, UnitFilterJurusan[]>();
    const prodiByJur = new Map<string, UnitFilterProdi[]>();
    jurusanArr.forEach((j) => {
      const k = j.id_fakultas || "_";
      if (!jurusanByFak.has(k)) jurusanByFak.set(k, []);
      jurusanByFak.get(k)!.push(j);
    });
    prodiArr.forEach((p) => {
      if (p.id_jurusan) {
        if (!prodiByJur.has(p.id_jurusan)) prodiByJur.set(p.id_jurusan, []);
        prodiByJur.get(p.id_jurusan)!.push(p);
      }
    });

    const renderFak = (fakId: string, fakName: string, includeRoot: boolean) => {
      if (includeRoot) {
        nodes.push({
          key: `fak:${fakId}`, level: 0, type: "fak",
          display: fakName, searchText: fakName,
        });
      }
      const fakSearch = fakName;
      const jurusans = jurusanByFak.get(fakId) || [];
      for (const j of jurusans) {
        const jName = `Jurusan ${cleanJurusan(j.nm_jurusan)}`;
        nodes.push({
          key: `jur:${j.id_jurusan}`,
          level: includeRoot ? 1 : 0,
          type: "jur",
          display: jName,
          searchText: `${fakSearch} ${jName}`,
        });
        const prodis = prodiByJur.get(j.id_jurusan) || [];
        for (const p of prodis) {
          nodes.push({
            key: `prd:${p.id_sms}`,
            level: includeRoot ? 2 : 1,
            type: "prd",
            display: p.nm_prodi,
            searchText: `${fakSearch} ${jName} ${p.nm_prodi}`,
          });
        }
      }
      const directProdis = prodiArr.filter((p) => p.id_fakultas === fakId && !p.id_jurusan);
      for (const p of directProdis) {
        nodes.push({
          key: `prd:${p.id_sms}`,
          level: includeRoot ? 1 : 0,
          type: "prd",
          display: p.nm_prodi,
          searchText: `${fakSearch} ${p.nm_prodi}`,
        });
      }
    };

    if (forcedJurusan) {
      const prodis = prodiByJur.get(forcedJurusan) || [];
      for (const p of prodis) {
        nodes.push({
          key: `prd:${p.id_sms}`, level: 0, type: "prd",
          display: p.nm_prodi, searchText: p.nm_prodi,
        });
      }
    } else if (forcedFakultas) {
      const f = fakultasArr.find((x) => x.id_fakultas === forcedFakultas);
      if (f) renderFak(forcedFakultas, f.nm_fakultas, false);
    } else {
      for (const f of fakultasArr) renderFak(f.id_fakultas, f.nm_fakultas, true);
    }
    return nodes;
  }, [fakultasArr, jurusanArr, prodiArr, forcedFakultas, forcedJurusan]);

  const filtered = useMemo(() => {
    if (!q.trim()) return tree;
    const needle = q.toLowerCase().trim();
    return tree.filter((n) => n.searchText.toLowerCase().includes(needle));
  }, [tree, q]);

  const selectedSet = useMemo(() => new Set(value || []), [value]);

  const toggle = (key: string) => {
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange(Array.from(next));
  };

  const clearAll = () => onChange([]);

  // Build button display text
  const selectedNodes = tree.filter((n) => selectedSet.has(n.key));
  const buttonText = (() => {
    if (forcedProdi) {
      const p = prodiArr.find((x) => x.id_sms === forcedProdi);
      return p ? p.nm_prodi : "Terkunci di prodi peran aktif";
    }
    if (selectedNodes.length === 0) {
      if (forcedJurusan) return "Semua Prodi dalam Jurusan";
      if (forcedFakultas) return "Semua Jurusan & Prodi";
      return "Semua Unit (Fakultas › Jurusan › Prodi)";
    }
    if (selectedNodes.length === 1) return selectedNodes[0].display;
    return `${selectedNodes.length} unit dipilih`;
  })();

  const disabled = !!forcedProdi;

  return (
    <div className={`relative ${width}`} ref={ref}>
      {label && (
        <label className="block text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full h-10 px-3 pr-9 flex items-center justify-between text-left rounded-lg border text-sm transition-all
          ${disabled
            ? "bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700"
            : "bg-white border-gray-300 text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:border-blue-500"}`}
      >
        <span className={`truncate ${selectedNodes.length === 0 ? "text-gray-400 dark:text-gray-500" : ""}`}>
          {buttonText}
        </span>
        <FiChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Chips below button — terlihat saat ada lebih dari 1 selected */}
      {selectedNodes.length > 1 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {selectedNodes.map((n) => (
            <span
              key={n.key}
              className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200 rounded-full dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/30"
            >
              <span className="truncate max-w-[140px]">{n.display}</span>
              <button
                type="button"
                onClick={() => toggle(n.key)}
                className="w-3.5 h-3.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-400/20 flex items-center justify-center"
              >
                <FiX className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari fakultas, jurusan, atau prodi..."
                  className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white"
                />
              </div>
              {selectedNodes.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="px-2 h-9 text-[11px] font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white whitespace-nowrap"
                >
                  Hapus semua
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-6 text-sm text-gray-400 text-center">Tidak ada hasil</div>
              ) : (
                filtered.map((n) => {
                  const checked = selectedSet.has(n.key);
                  const indent = n.level * 16;
                  const levelChip =
                    n.type === "fak" ? "Fakultas" :
                    n.type === "jur" ? "Jurusan" :
                    "Prodi";
                  const levelClass =
                    n.type === "fak" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" :
                    n.type === "jur" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300" :
                    "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300";
                  return (
                    <button
                      key={n.key}
                      type="button"
                      onClick={() => toggle(n.key)}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                        checked
                          ? "bg-blue-50 dark:bg-blue-500/10"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                      style={{ paddingLeft: `${12 + indent}px` }}
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                          checked
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        }`}
                      >
                        {checked && <FiCheck className="w-3 h-3" />}
                      </span>
                      <span
                        className={`flex-1 truncate ${
                          n.type === "fak"
                            ? "font-semibold text-gray-900 dark:text-white"
                            : n.type === "jur"
                              ? "font-medium text-gray-800 dark:text-gray-100"
                              : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {n.display}
                      </span>
                      <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ring-1 ring-inset ring-current/20 ${levelClass}`}>
                        {levelChip}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {selectedNodes.length > 0 && (
              <div className="px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                {selectedNodes.length} unit dipilih · klik lagi untuk lepas
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
