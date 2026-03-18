"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ContributionHeatmapProps {
  data: Record<string, number>;
  year: number;
  total: number;
  streak: number;
  longestStreak?: number;
  compact?: boolean;
}

const CELL_SIZE   = 13;
const CELL_GAP    = 3;
const CELL_STEP   = CELL_SIZE + CELL_GAP;
const DAY_LBL_W   = 30;
const MONTH_LBL_H = 18;

// Brand color scale: 0 → light → medium → bold → vivid blue
const LIGHT_SCALE  = ["#ebedf0", "#dbeafe", "#93c5fd", "#3b82f6", "#1d4ed8"];
const DARK_SCALE   = ["#2d333b", "#1e3a5f", "#1e40af", "#2563eb", "#60a5fa"];

function getColor(count: number, dark: boolean): string {
  const s = dark ? DARK_SCALE : LIGHT_SCALE;
  if (count === 0)  return s[0];
  if (count <= 2)   return s[1];
  if (count <= 5)   return s[2];
  if (count <= 9)   return s[3];
  return s[4];
}

interface Cell {
  date:  string;
  count: number; // -1 = out of year
  col:   number;
  row:   number;
}

function buildGrid(
  data: Record<string, number>,
  year: number,
  weeksToShow?: number
): { cells: Cell[]; months: { label: string; col: number }[]; totalWeeks: number } {
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  const cells:  Cell[]                         = [];
  const months: { label: string; col: number }[] = [];

  const yearStart   = new Date(year, 0, 1);
  const yearEnd     = new Date(year, 11, 31);
  const startDow    = yearStart.getDay(); // 0=Sun
  const gridStart   = new Date(yearStart);
  gridStart.setDate(gridStart.getDate() - startDow);

  let col = 0, lastMonth = -1;
  const cur = new Date(gridStart);

  while (cur <= yearEnd || col === 0) {
    for (let row = 0; row < 7; row++) {
      const d       = new Date(cur);
      d.setDate(d.getDate() + row);
      const inYear  = d.getFullYear() === year;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      cells.push({ date: dateStr, count: inYear ? (data[dateStr] ?? 0) : -1, col, row });
      if (inYear && d.getMonth() !== lastMonth && row === 0) {
        months.push({ label: MONTH_NAMES[d.getMonth()], col });
        lastMonth = d.getMonth();
      }
    }
    cur.setDate(cur.getDate() + 7);
    col++;
    if (col > 54) break;
  }

  const totalWeeks = col;
  if (weeksToShow && weeksToShow < totalWeeks) {
    const cut = totalWeeks - weeksToShow;
    return {
      cells:  cells.filter((c) => c.col >= cut).map((c) => ({ ...c, col: c.col - cut })),
      months: months.filter((m) => m.col >= cut).map((m) => ({ ...m, col: m.col - cut })),
      totalWeeks: weeksToShow,
    };
  }
  return { cells, months, totalWeeks };
}

// ─── Tooltip state ────────────────────────────────────────────────────────────

interface TooltipState {
  date:  string;
  count: number;
  x:     number;
  y:     number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContributionHeatmap({
  data, year, total, streak, longestStreak = 0, compact = false,
}: ContributionHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [isDark,  setIsDark]  = useState(false);
  const [mounted, setMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const weeksToShow             = compact ? 13 : undefined;
  const { cells, months, totalWeeks } = buildGrid(data, year, weeksToShow);
  const svgW = DAY_LBL_W + totalWeeks * CELL_STEP + CELL_GAP;
  const svgH = MONTH_LBL_H + 7 * CELL_STEP + CELL_GAP;

  // Format date nicely
  function fmtDate(d: string): string {
    try {
      return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
      });
    } catch { return d; }
  }

  if (!mounted) return <div style={{ height: svgH + (compact ? 28 : 60) }} className="animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />;

  return (
    <div className="w-full select-none">
      {/* Top info row */}
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              <span className="font-bold text-gray-800 dark:text-gray-100 text-base">{total}</span>
              {" "}kontribusi di {year}
            </span>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span>🏆</span>
              <span>Terpanjang: <span className="font-bold">{longestStreak} hari</span></span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-500 dark:text-orange-400">
              <span>🔥</span>
              <span>Saat ini: <span className="font-bold">{streak} hari</span></span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <span>Sedikit</span>
            {(isDark ? DARK_SCALE : LIGHT_SCALE).map((c, i) => (
              <div
                key={i}
                className="rounded-sm transition-transform hover:scale-110"
                style={{ width: 11, height: 11, background: c, border: "1px solid rgba(0,0,0,0.06)" }}
              />
            ))}
            <span>Banyak</span>
          </div>
        </div>
      )}

      {/* SVG grid */}
      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={svgW}
          height={svgH}
          className="block"
          style={{ minWidth: compact ? undefined : 480 }}
        >
          {/* Month labels */}
          {months.map((m, i) => (
            <text
              key={i}
              x={DAY_LBL_W + m.col * CELL_STEP}
              y={13}
              fontSize={10}
              fill={isDark ? "#6b7280" : "#9ca3af"}
              fontFamily="inherit"
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {([1, 3, 5] as const).map((row, i) => (
            <text
              key={i}
              x={DAY_LBL_W - 5}
              y={MONTH_LBL_H + row * CELL_STEP + CELL_SIZE - 1}
              fontSize={9}
              fill={isDark ? "#6b7280" : "#9ca3af"}
              textAnchor="end"
              fontFamily="inherit"
            >
              {["Sen", "Rab", "Jum"][i]}
            </text>
          ))}

          {/* Cells */}
          {cells.map((cell, i) => {
            if (cell.count === -1) return null;
            const x     = DAY_LBL_W + cell.col * CELL_STEP;
            const y     = MONTH_LBL_H + cell.row * CELL_STEP;
            const color = getColor(cell.count, isDark);
            return (
              <rect
                key={i}
                x={x} y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={3} ry={3}
                fill={color}
                style={{
                  cursor: "pointer",
                  transition: "opacity 0.15s, transform 0.1s",
                  transformOrigin: `${x + CELL_SIZE / 2}px ${y + CELL_SIZE / 2}px`,
                }}
                onMouseEnter={() => {
                  setTooltip({ date: cell.date, count: cell.count, x, y });
                }}
                onMouseLeave={() => setTooltip(null)}
                className="hover:opacity-80"
              />
            );
          })}

          {/* Tooltip */}
          {tooltip && (() => {
            const TW = 160, TH = 40;
            const tx = Math.max(0, Math.min(tooltip.x - TW / 2, svgW - TW));
            const ty = Math.max(0, tooltip.y - TH - 6);
            return (
              <g>
                <rect
                  x={tx} y={ty}
                  width={TW} height={TH}
                  rx={8}
                  fill={isDark ? "#1f2937" : "#111827"}
                  opacity={0.93}
                />
                {/* Arrow */}
                <polygon
                  points={`${tooltip.x - 5},${ty + TH} ${tooltip.x + 5},${ty + TH} ${tooltip.x},${ty + TH + 6}`}
                  fill={isDark ? "#1f2937" : "#111827"}
                  opacity={0.93}
                />
                <text
                  x={tx + TW / 2} y={ty + 15}
                  fontSize={10} fill="#e5e7eb"
                  textAnchor="middle" fontFamily="inherit"
                >
                  {fmtDate(tooltip.date)}
                </text>
                <text
                  x={tx + TW / 2} y={ty + 30}
                  fontSize={11} fill="white"
                  textAnchor="middle" fontFamily="inherit" fontWeight={700}
                >
                  {tooltip.count === 0 ? "Tidak ada aktivitas" : `${tooltip.count} kontribusi`}
                </text>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Compact footer */}
      {compact && (
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-gray-200">{total}</span>
          <span>kontribusi</span>
          <span>·</span>
          <span>🔥 {streak} hari</span>
        </div>
      )}
    </div>
  );
}

export default ContributionHeatmap;
