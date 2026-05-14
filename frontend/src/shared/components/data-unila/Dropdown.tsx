"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiCheck, FiX } from "react-icons/fi";

export type DropdownOption = { value: string; label: string; sublabel?: string };

export default function Dropdown({
  value,
  onChange,
  options,
  placeholder,
  label,
  searchable = false,
  width = "w-full",
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  placeholder: string;
  label?: string;
  searchable?: boolean;
  width?: string;
  disabled?: boolean;
}) {
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

  const selected = options.find((o) => o.value === value);
  const filtered =
    searchable && q
      ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
      : options;

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
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700"
            : "bg-white border-gray-300 text-gray-900 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:hover:border-blue-500"}`}
      >
        <span className={`truncate ${!selected ? "text-gray-400 dark:text-gray-500" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-30 mt-1.5 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
          >
            {searchable && (
              <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                <input
                  autoFocus
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ketik untuk cari..."
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:text-white"
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto py-1">
              {value && (
                <button
                  type="button"
                  onClick={() => { onChange(""); setOpen(false); setQ(""); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400 flex items-center gap-2"
                >
                  <FiX className="w-3.5 h-3.5" />
                  Hapus pilihan
                </button>
              )}
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">Tidak ada hasil</div>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => { onChange(o.value); setOpen(false); setQ(""); }}
                    className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors
                      ${o.value === value
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                  >
                    <span className="truncate">
                      {o.label}
                      {o.sublabel && (
                        <span className="ml-1 text-[11px] text-gray-400">— {o.sublabel}</span>
                      )}
                    </span>
                    {o.value === value && <FiCheck className="w-4 h-4 shrink-0" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
