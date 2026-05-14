"use client";

import { ReactNode } from "react";
import Link from "next/link";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon: ReactNode;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "cyan" | "pink" | "indigo";
  trend?: { value: number; label: string };
  /** Optional href — kalau diisi, StatCard jadi clickable (navigate ke Data Unila / page lain) */
  href?: string;
  /** Title tooltip hover */
  hint?: string;
}

const colorGradients: Record<NonNullable<StatCardProps["color"]>, string> = {
  blue: "from-blue-500 to-indigo-600",
  green: "from-emerald-500 to-teal-600",
  red: "from-rose-500 to-pink-600",
  yellow: "from-amber-500 to-orange-500",
  purple: "from-violet-500 to-purple-600",
  cyan: "from-cyan-500 to-blue-600",
  pink: "from-pink-500 to-rose-600",
  indigo: "from-indigo-500 to-blue-700",
};

export default function StatCard({
  title,
  value,
  subtitle,
  description,
  icon,
  color = "blue",
  trend,
  href,
  hint,
}: StatCardProps) {
  const display = typeof value === "number" ? value.toLocaleString("id-ID") : value;
  const card = (
    <div
      className={`relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-gradient-to-br ${colorGradients[color]} group ${href ? "cursor-pointer ring-1 ring-white/10 hover:ring-white/40" : ""}`}
      title={hint || (href ? `Klik untuk detail` : undefined)}
    >
      <div className="absolute -top-10 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      <div className="relative z-10 flex items-center gap-3 p-4">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/25 flex items-center justify-center text-white shadow-inner shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-white/80 uppercase tracking-[0.1em] truncate">{title}</p>
          <h3 className="text-2xl font-extrabold text-white tabular-nums leading-tight truncate">{display}</h3>
          {subtitle && <p className="text-[11px] text-white/75 mt-0.5 truncate">{subtitle}</p>}
          {description && <p className="text-[11px] text-white/85 mt-1 leading-snug line-clamp-2">{description}</p>}
          {trend && (
            <p className={`text-[11px] mt-1 font-medium ${trend.value >= 0 ? "text-emerald-100" : "text-rose-100"}`}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value).toFixed(1)}% {trend.label}
            </p>
          )}
        </div>
        {href && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white/70 text-xs">↗</span>
          </div>
        )}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block">{card}</Link> : card;
}
