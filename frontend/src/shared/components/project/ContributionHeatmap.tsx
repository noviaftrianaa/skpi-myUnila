"use client";

import React, { useState, useRef, useEffect } from "react";

interface ContributionHeatmapProps {
  data: Record<string, number>;
  year: number;
  total: number;
  streak: number;
  longestStreak?: number;
  compact?: boolean; // for mini version (last 3 months)
}

const CELL_SIZE = 13;
const CELL_GAP = 3;
const CELL_STEP = CELL_SIZE + CELL_GAP;
const DAY_LABEL_WIDTH = 28;
const MONTH_LABEL_HEIGHT = 18;

function getColor(count: number): string {
  if (count === 0) return "#ebedf0";
  if (count <= 3) return "#c6e0f5";
  if (count <= 7) return "#6ba3d6";
  return "#2563eb";
}

function getDarkColor(count: number): string {
  if (count === 0) return "#2d333b";
  if (count <= 3) return "#1e3a5f";
  if (count <= 7) return "#1d4ed8";
  return "#3b82f6";
}

interface DayCell {
  date: string;
  count: number;
  col: number;
  row: number;
}

function buildGrid(data: Record<string, number>, year: number, weeksToShow?: number): {
  cells: DayCell[];
  months: { label: string; col: number }[];
  totalWeeks: number;
} {
  const cells: DayCell[] = [];
  const months: { label: string; col: number }[] = [];
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  // Adjust start to nearest Sunday
  const startDayOfWeek = startDate.getDay(); // 0=Sun
  const gridStart = new Date(startDate);
  gridStart.setDate(gridStart.getDate() - startDayOfWeek);

  let col = 0;
  let lastMonth = -1;
  let current = new Date(gridStart);

  while (current <= endDate || col === 0) {
    for (let row = 0; row < 7; row++) {
      const d = new Date(current);
      d.setDate(d.getDate() + row);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const inYear = d.getFullYear() === year;
      cells.push({
        date: dateStr,
        count: inYear ? (data[dateStr] ?? 0) : -1,
        col,
        row,
      });
      // Month label
      if (inYear && d.getMonth() !== lastMonth && row === 0) {
        months.push({ label: monthNames[d.getMonth()], col });
        lastMonth = d.getMonth();
      }
    }
    current.setDate(current.getDate() + 7);
    col++;
    if (col > 54) break;
  }

  const totalWeeks = col;

  if (weeksToShow && weeksToShow < totalWeeks) {
    const cutoffCol = totalWeeks - weeksToShow;
    return {
      cells: cells.filter((c) => c.col >= cutoffCol).map((c) => ({ ...c, col: c.col - cutoffCol })),
      months: months.filter((m) => m.col >= cutoffCol).map((m) => ({ ...m, col: m.col - cutoffCol })),
      totalWeeks: weeksToShow,
    };
  }

  return { cells, months, totalWeeks };
}

export function ContributionHeatmap({
  data,
  year,
  total,
  streak,
  longestStreak = 0,
  compact = false,
}: ContributionHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);
  const [isDark, setIsDark] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const weeksToShow = compact ? 13 : undefined;
  const { cells, months, totalWeeks } = buildGrid(data, year, weeksToShow);

  const svgWidth = DAY_LABEL_WIDTH + totalWeeks * CELL_STEP + CELL_GAP;
  const svgHeight = MONTH_LABEL_HEIGHT + 7 * CELL_STEP + CELL_GAP;

  return (
    <div className="w-full">
      {!compact && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{total}</span> kontribusi di tahun {year}
            </span>
            <span>
              Streak terpanjang:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{longestStreak} hari</span>
            </span>
            <span>
              Streak saat ini:{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">{streak} hari</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Less</span>
            {["#ebedf0", "#c6e0f5", "#6ba3d6", "#2563eb"].map((c, i) => (
              <div
                key={i}
                className="rounded-sm"
                style={{ width: 11, height: 11, background: isDark ? getDarkColor(i === 0 ? 0 : i * 3) : c }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="block"
          style={{ minWidth: compact ? undefined : 520 }}
        >
          {/* Month labels */}
          {months.map((m, i) => (
            <text
              key={i}
              x={DAY_LABEL_WIDTH + m.col * CELL_STEP}
              y={12}
              fontSize={10}
              fill={isDark ? "#9ca3af" : "#6b7280"}
            >
              {m.label}
            </text>
          ))}

          {/* Day labels */}
          {[1, 3, 5].map((row, i) => (
            <text
              key={i}
              x={DAY_LABEL_WIDTH - 4}
              y={MONTH_LABEL_HEIGHT + row * CELL_STEP + CELL_SIZE - 2}
              fontSize={9}
              fill={isDark ? "#9ca3af" : "#6b7280"}
              textAnchor="end"
            >
              {["Mon", "Wed", "Fri"][i]}
            </text>
          ))}

          {/* Cells */}
          {cells.map((cell, i) => {
            if (cell.count === -1) return null;
            const x = DAY_LABEL_WIDTH + cell.col * CELL_STEP;
            const y = MONTH_LABEL_HEIGHT + cell.row * CELL_STEP;
            const color = isDark ? getDarkColor(cell.count) : getColor(cell.count);
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                ry={2}
                fill={color}
                onMouseEnter={(e) => {
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (rect) {
                    setTooltip({
                      date: cell.date,
                      count: cell.count,
                      x: x + CELL_SIZE / 2,
                      y: y,
                    });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
                className="cursor-pointer transition-opacity hover:opacity-80"
              />
            );
          })}

          {/* Tooltip */}
          {tooltip && (
            <g>
              <rect
                x={Math.min(tooltip.x - 60, svgWidth - 130)}
                y={Math.max(tooltip.y - 38, 0)}
                width={120}
                height={28}
                rx={4}
                fill={isDark ? "#374151" : "#1f2937"}
                opacity={0.92}
              />
              <text
                x={Math.min(tooltip.x - 60, svgWidth - 130) + 60}
                y={Math.max(tooltip.y - 38, 0) + 11}
                fontSize={10}
                fill="white"
                textAnchor="middle"
              >
                {tooltip.date}
              </text>
              <text
                x={Math.min(tooltip.x - 60, svgWidth - 130) + 60}
                y={Math.max(tooltip.y - 38, 0) + 23}
                fontSize={10}
                fill="white"
                textAnchor="middle"
              >
                {tooltip.count} kontribusi
              </text>
            </g>
          )}
        </svg>
      </div>

      {compact && (
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{total} kontribusi</span>
          <span>Streak: {streak} hari</span>
        </div>
      )}
    </div>
  );
}

export default ContributionHeatmap;
