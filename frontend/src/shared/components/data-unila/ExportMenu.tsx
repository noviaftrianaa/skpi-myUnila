"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiDownload, FiFileText, FiFile, FiCloud, FiCode, FiChevronDown,
} from "react-icons/fi";

export type ExportFormat = "excel" | "csv-client" | "csv-server" | "pdf" | "json";

export interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
  /** Disable items based on availability (e.g., no server endpoint) */
  disabled?: Partial<Record<ExportFormat, boolean>>;
  /** Compact button (icon only on small screens) */
  compact?: boolean;
  /** Server export label (defaults to "CSV (semua data)") */
  serverCsvLabel?: string;
  className?: string;
}

const ITEMS: Array<{
  key: ExportFormat;
  label: string;
  hint: string;
  icon: React.ReactNode;
  iconBg: string;
}> = [
  {
    key: "excel",
    label: "Excel (.xlsx)",
    hint: "Halaman saat ini",
    icon: <FiFileText className="w-4 h-4" />,
    iconBg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    key: "csv-client",
    label: "CSV (.csv)",
    hint: "Halaman saat ini",
    icon: <FiFile className="w-4 h-4" />,
    iconBg: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  },
  {
    key: "csv-server",
    label: "CSV Lengkap",
    hint: "Semua hasil filter dari server",
    icon: <FiCloud className="w-4 h-4" />,
    iconBg: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  {
    key: "pdf",
    label: "PDF (.pdf)",
    hint: "Halaman saat ini",
    icon: <FiFile className="w-4 h-4" />,
    iconBg: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
  {
    key: "json",
    label: "JSON (.json)",
    hint: "Halaman saat ini",
    icon: <FiCode className="w-4 h-4" />,
    iconBg: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
];

export default function ExportMenu({
  onExport,
  disabled,
  compact,
  serverCsvLabel,
  className = "",
}: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open]);

  const handleSelect = (key: ExportFormat) => {
    setOpen(false);
    onExport(key);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <FiDownload className="w-3.5 h-3.5" />
        <span className={compact ? "hidden sm:inline" : ""}>Export</span>
        <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-30 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pilih Format Export
              </p>
            </div>
            <div className="py-1">
              {ITEMS.map((it) => {
                const isDisabled = disabled?.[it.key];
                const label = it.key === "csv-server" && serverCsvLabel ? serverCsvLabel : it.label;
                return (
                  <button
                    key={it.key}
                    type="button"
                    role="menuitem"
                    disabled={isDisabled}
                    onClick={() => handleSelect(it.key)}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 transition-colors text-left
                      ${isDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"}`}
                  >
                    <span className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${it.iconBg}`}>
                      {it.icon}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {label}
                      </span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400">
                        {it.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
