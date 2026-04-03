"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";
import {
  projectService,
  type ActivityPoint,
  type TaskDistribution,
  type TeamContribution,
  type BurndownPoint,
  type Sprint,
} from "@/lib/services/project/projectService";

interface ProjectChartsProps {
  projectId: string;
  sprintId?: string;
  sprints?: Sprint[];
}

// ─── Palette ────────────────────────────────────────────────────────────────

const PALETTE = {
  blue:   "#2563eb",
  indigo: "#4f46e5",
  cyan:   "#06b6d4",
  teal:   "#14b8a6",
  green:  "#10b981",
  amber:  "#f59e0b",
  orange: "#f97316",
  red:    "#ef4444",
  purple: "#8b5cf6",
  pink:   "#ec4899",
  gray:   "#6b7280",
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  backlog:     { label: "Backlog",       color: PALETTE.gray   },
  todo:        { label: "Menunggu",      color: PALETTE.blue   },
  in_progress: { label: "Dalam Proses",  color: PALETTE.amber  },
  review:      { label: "Review",        color: PALETTE.purple },
  done:        { label: "Selesai",       color: PALETTE.green  },
  cancelled:   { label: "Dibatalkan",    color: PALETTE.red    },
};

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-3 text-sm min-w-[140px]"
    >
      {label && (
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700 text-xs">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
              <span className="text-gray-600 dark:text-gray-400 text-xs">{entry.name}</span>
            </div>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-xs">{entry.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Active Pie Shape ────────────────────────────────────────────────────────

function ActivePieShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.95}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 14}
        outerRadius={outerRadius + 18}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
      <text x={cx} y={cy - 10} textAnchor="middle" fill={fill} className="text-sm font-bold" fontSize={15} fontWeight={700}>
        {value}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#6b7280" fontSize={11}>
        {(percent * 100).toFixed(1)}%
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#6b7280" fontSize={10}>
        {STATUS_META[payload.status]?.label ?? payload.status}
      </text>
    </g>
  );
}

// ─── Custom Legend ────────────────────────────────────────────────────────────

function CustomLegend({ items }: { items: { label: string; color: string; value?: number }[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: item.color }} />
          <span>{item.label}</span>
          {item.value !== undefined && (
            <span className="font-semibold text-gray-800 dark:text-gray-200">({item.value})</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { key: "activity",     label: "Timeline",     emoji: "📈" },
  { key: "distribution", label: "Distribusi",   emoji: "🥧" },
  { key: "team",         label: "Kontribusi Tim", emoji: "👥" },
  { key: "burndown",     label: "Burndown",     emoji: "🔥" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-60 gap-3 text-gray-400 dark:text-gray-500">
      <div className="text-4xl opacity-40">📊</div>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── LoadingSpinner ───────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-60">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-blue-100 dark:border-blue-900" />
        <div className="absolute inset-0 rounded-full border-2 border-t-blue-600 animate-spin" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProjectCharts({ projectId, sprintId, sprints }: ProjectChartsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("activity");
  const [period, setPeriod]       = useState<"weekly" | "monthly">("weekly");
  const [months, setMonths]       = useState(3);
  const [selectedSprintId, setSelectedSprintId] = useState(sprintId ?? "");
  const [activePieIdx, setActivePieIdx]         = useState(0);

  const [activityData,     setActivityData]     = useState<ActivityPoint[]>([]);
  const [distributionData, setDistributionData] = useState<TaskDistribution[]>([]);
  const [teamData,         setTeamData]         = useState<TeamContribution[]>([]);
  const [burndownData,     setBurndownData]     = useState<BurndownPoint[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync sprint prop
  useEffect(() => { if (sprintId) setSelectedSprintId(sprintId); }, [sprintId]);

  const fetchTab = useCallback(async (tab: TabKey) => {
    setLoading(true);
    try {
      if (tab === "activity") {
        setActivityData(await projectService.getActivityTimeline(projectId, period, months));
      } else if (tab === "distribution") {
        setDistributionData(await projectService.getTaskDistribution(projectId));
      } else if (tab === "team") {
        setTeamData(await projectService.getTeamContribution(projectId, months));
      } else if (tab === "burndown" && selectedSprintId) {
        setBurndownData(await projectService.getBurndown(projectId, selectedSprintId));
      }
    } catch (err) {
      console.error("Chart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, period, months, selectedSprintId]);

  useEffect(() => { fetchTab(activeTab); }, [fetchTab, activeTab]);

  // ─── Renders ────────────────────────────────────────────────────────────────

  function renderActivity() {
    if (!activityData.length) return <EmptyState message="Belum ada data aktivitas" />;
    const legendItems = [
      { label: "Tugas Dibuat",  color: PALETTE.blue  },
      { label: "Tugas Selesai", color: PALETTE.green },
      { label: "Komentar",      color: PALETTE.cyan  },
    ];
    return (
      <>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gBlue"  x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={PALETTE.blue}  stopOpacity={0.25} />
                <stop offset="100%" stopColor={PALETTE.blue}  stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={PALETTE.green} stopOpacity={0.2}  />
                <stop offset="100%" stopColor={PALETTE.green} stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="gCyan"  x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={PALETTE.cyan}  stopOpacity={0.2}  />
                <stop offset="100%" stopColor={PALETTE.cyan}  stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700/50" vertical={false} />
            <XAxis
              dataKey="period"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone" dataKey="task_created" name="Tugas Dibuat"
              stroke={PALETTE.blue}  strokeWidth={2.5}
              fill="url(#gBlue)"
              dot={false} activeDot={{ r: 5, fill: PALETTE.blue, stroke: "#fff", strokeWidth: 2 }}
              animationDuration={800} animationBegin={0}
            />
            <Area
              type="monotone" dataKey="task_done" name="Tugas Selesai"
              stroke={PALETTE.green} strokeWidth={2.5}
              fill="url(#gGreen)"
              dot={false} activeDot={{ r: 5, fill: PALETTE.green, stroke: "#fff", strokeWidth: 2 }}
              animationDuration={800} animationBegin={150}
            />
            <Area
              type="monotone" dataKey="comments" name="Komentar"
              stroke={PALETTE.cyan}  strokeWidth={2}
              fill="url(#gCyan)"
              dot={false} activeDot={{ r: 4, fill: PALETTE.cyan, stroke: "#fff", strokeWidth: 2 }}
              animationDuration={800} animationBegin={300}
            />
          </AreaChart>
        </ResponsiveContainer>
        <CustomLegend items={legendItems} />
      </>
    );
  }

  function renderDistribution() {
    if (!distributionData.length) return <EmptyState message="Belum ada data tugas" />;
    const total = distributionData.reduce((s, d) => s + d.count, 0);
    const legendItems = distributionData.map((d) => ({
      label: STATUS_META[d.status]?.label ?? d.status,
      color: STATUS_META[d.status]?.color ?? PALETTE.gray,
      value: d.count,
    }));
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <ResponsiveContainer width={300} height={280}>
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                activeIndex={activePieIdx}
                activeShape={<ActivePieShape />}
                onMouseEnter={(_, idx) => setActivePieIdx(idx)}
                animationDuration={700}
                animationBegin={0}
              >
                {distributionData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={STATUS_META[entry.status]?.color ?? PALETTE.gray}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{total}</span>
            <span className="text-xs text-gray-400">Total Tugas</span>
          </div>
        </div>
        <CustomLegend items={legendItems} />
      </div>
    );
  }

  function renderTeam() {
    const topTeam = teamData.slice(0, 10);
    if (!topTeam.length) return <EmptyState message="Belum ada data kontribusi" />;
    const legendItems = [
      { label: "Tugas Selesai", color: PALETTE.green  },
      { label: "Komentar",      color: PALETTE.cyan   },
      { label: "Dokumen",       color: PALETTE.amber  },
    ];
    return (
      <>
        <ResponsiveContainer width="100%" height={Math.max(200, topTeam.length * 44 + 40)}>
          <BarChart
            layout="vertical"
            data={topTeam}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            barCategoryGap="30%"
          >
            <defs>
              <linearGradient id="gBarGreen" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={PALETTE.green} stopOpacity={0.8} />
                <stop offset="100%" stopColor={PALETTE.teal} stopOpacity={1} />
              </linearGradient>
              <linearGradient id="gBarCyan" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={PALETTE.cyan} stopOpacity={0.8} />
                <stop offset="100%" stopColor={PALETTE.blue} stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700/50" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="nm_pengguna"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="task_done" name="Tugas Selesai"
              stackId="a" fill="url(#gBarGreen)"
              radius={[0, 0, 0, 0]}
              animationDuration={700} animationBegin={0}
            />
            <Bar
              dataKey="comments" name="Komentar"
              stackId="a" fill="url(#gBarCyan)"
              animationDuration={700} animationBegin={100}
            />
            <Bar
              dataKey="documents" name="Dokumen"
              stackId="a" fill={PALETTE.amber}
              radius={[0, 4, 4, 0]}
              animationDuration={700} animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
        <CustomLegend items={legendItems} />
      </>
    );
  }

  function renderBurndown() {
    if (!selectedSprintId)
      return <EmptyState message="Pilih sprint untuk melihat burndown chart" />;
    if (!burndownData.length)
      return <EmptyState message="Tidak ada data burndown untuk sprint ini" />;

    const legendItems = [
      { label: "Ideal",  color: PALETTE.gray  },
      { label: "Aktual", color: PALETTE.blue  },
    ];
    return (
      <>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={burndownData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gBurnBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={PALETTE.blue} stopOpacity={0.15} />
                <stop offset="100%" stopColor={PALETTE.blue} stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700/50" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone" dataKey="ideal" name="Ideal"
              stroke={PALETTE.gray} strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              animationDuration={600} animationBegin={0}
            />
            <Line
              type="monotone" dataKey="remaining" name="Aktual"
              stroke={PALETTE.blue} strokeWidth={2.5}
              dot={{ r: 3.5, fill: PALETTE.blue, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: PALETTE.blue, stroke: "#fff", strokeWidth: 2 }}
              animationDuration={800} animationBegin={200}
            />
          </LineChart>
        </ResponsiveContainer>
        <CustomLegend items={legendItems} />
      </>
    );
  }

  // ─── Control row ─────────────────────────────────────────────────────────────

  const selectClass =
    "text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 " +
    "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-100 dark:border-gray-700/60 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <span className="text-base">{tab.emoji}</span>
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-5 pt-4 pb-1 flex-wrap">
        {(activeTab === "activity" || activeTab === "team") && (
          <>
            {activeTab === "activity" && (
              <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className={selectClass}>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            )}
            <select value={months} onChange={(e) => setMonths(Number(e.target.value))} className={selectClass}>
              <option value={1}>1 Bulan</option>
              <option value={3}>3 Bulan</option>
              <option value={6}>6 Bulan</option>
              <option value={12}>12 Bulan</option>
            </select>
          </>
        )}
        {activeTab === "burndown" && sprints && sprints.length > 0 && (
          <select
            value={selectedSprintId}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className={selectClass}
          >
            <option value="">-- Pilih Sprint --</option>
            {sprints.map((s) => (
              <option key={s.id_sprint} value={s.id_sprint}>
                {s.nm_sprint}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Chart area */}
      <div className="px-4 pb-5 pt-2 min-h-[320px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSpinner />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "activity"     && renderActivity()}
              {activeTab === "distribution" && renderDistribution()}
              {activeTab === "team"         && renderTeam()}
              {activeTab === "burndown"     && renderBurndown()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProjectCharts;
