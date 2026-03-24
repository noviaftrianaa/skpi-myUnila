"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiBarChart2, FiActivity, FiCheckCircle,
  FiMessageCircle, FiFile, FiZap, FiGrid,
} from "react-icons/fi";
import Link from "next/link";
import {
  projectService,
  type Project,
  type ContributionData,
  type Sprint,
} from "@/lib/services/project/projectService";
import { ContributionHeatmap } from "@/shared/components/project/ContributionHeatmap";
import { ProjectCharts } from "@/shared/components/project/ProjectCharts";

// ─── Nav tabs ─────────────────────────────────────────────────────────────────

// Tab navigation is in layout.tsx

// ─── Gradient stat card ───────────────────────────────────────────────────────

interface StatCard {
  label:    string;
  value:    number | string;
  icon:     React.ReactNode;
  gradient: string;
  sub?:     string;
}

function GradientStatCard({ card, index }: { card: StatCard; index: number }) {
  return (
      <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${card.gradient}`}
      >
        {/* Background glow */}
        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              {card.icon}
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight">{card.value}</p>
          <p className="text-sm font-medium text-white/90 mt-1">{card.label}</p>
          {card.sub && <p className="text-xs text-white/70 mt-0.5">{card.sub}</p>}
        </div>
      </motion.div>
      </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const params    = useParams();
  const projectId = params.projectId as string;

  const [project,       setProject]       = useState<Project | null>(null);
  const [contributions, setContributions] = useState<ContributionData | null>(null);
  const [sprints,       setSprints]       = useState<Sprint[]>([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [year, setYear]                   = useState(new Date().getFullYear());
  const [isLoading, setIsLoading]         = useState(true);

  useEffect(() => {
    if (!projectId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, year]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [proj, contrib, sprintsData] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getProjectContributions(projectId, year),
        projectService.getSprints(projectId).catch(() => [] as Sprint[]),
      ]);
      setProject(proj);
      setContributions(contrib);
      setSprints(sprintsData);
      if (sprintsData.length && !selectedSprintId) {
        const active = sprintsData.find((s) => s.status === "active") ?? sprintsData[0];
        if (active) setSelectedSprintId(active.id_sprint);
      }
    } catch (err) {
      console.error("Analytics load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Stat cards ─────────────────────────────────────────────────────────────

  const statCards: StatCard[] = contributions
    ? [
        {
          label:    "Total Aktivitas",
          value:    contributions.total,
          icon:     <FiActivity className="w-5 h-5" />,
          gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
          sub:      `${contributions.year}`,
        },
        {
          label:    "Tugas Selesai",
          value:    contributions.by_type["task_completed"] ?? 0,
          icon:     <FiCheckCircle className="w-5 h-5" />,
          gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
          sub:      "task_completed",
        },
        {
          label:    "Komentar",
          value:    Object.entries(contributions.by_type)
            .filter(([k]) => k.includes("comment"))
            .reduce((s, [, v]) => s + v, 0),
          icon:     <FiMessageCircle className="w-5 h-5" />,
          gradient: "bg-gradient-to-br from-cyan-500 to-blue-500",
        },
        {
          label:    "Dokumen",
          value:    Object.entries(contributions.by_type)
            .filter(([k]) => k.includes("document"))
            .reduce((s, [, v]) => s + v, 0),
          icon:     <FiFile className="w-5 h-5" />,
          gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
        },
        {
          label:    "Streak Terpanjang",
          value:    `${contributions.longest_streak}d`,
          icon:     <FiZap className="w-5 h-5" />,
          gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
          sub:      "hari berturut-turut",
        },
        {
          label:    "Streak Saat Ini",
          value:    `${contributions.current_streak}d`,
          icon:     <FiBarChart2 className="w-5 h-5" />,
          gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
          sub:      "hari terakhir aktif",
        },
      ]
    : [];

  const currentYear = new Date().getFullYear();
  const projectName = project?.nama ?? "";

  return (
      <>
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                  <FiBarChart2 className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Analytics{projectName ? ` — ${projectName}` : ""}
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
                Visualisasi aktivitas &amp; performa tim secara real-time
              </p>
            </div>

            {/* Year picker */}
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 self-start sm:self-auto"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </motion.div>

          {isLoading ? (
            // Skeleton
            <div className="space-y-6">
              <div className="h-40 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                ))}
              </div>
              <div className="h-96 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            </div>
          ) : (
            <>
              {/* ── Heatmap card ── */}
              {contributions && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500" />
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Heatmap Aktivitas Project
                    </h2>
                  </div>
                  <ContributionHeatmap
                    data={contributions.data}
                    year={contributions.year}
                    total={contributions.total}
                    streak={contributions.current_streak}
                    longestStreak={contributions.longest_streak}
                  />
                </motion.div>
              )}

              {/* ── Stat Cards ── */}
              {statCards.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {statCards.map((card, i) => (
                    <GradientStatCard key={i} card={card} index={i} />
                  ))}
                </div>
              )}

              {/* ── Activity Type Breakdown ── */}
              {contributions && Object.keys(contributions.by_type).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                    <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Rincian Tipe Aktivitas
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(contributions.by_type)
                      .sort(([, a], [, b]) => b - a)
                      .map(([aksi, count], i) => (
                        <motion.div
                          key={aksi}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        >
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {aksi.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-full px-1.5 py-0.5">
                            {count}
                          </span>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* ── Charts ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-5 rounded-full bg-gradient-to-b from-green-500 to-teal-500" />
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Charts Interaktif
                  </h2>
                </div>
                <ProjectCharts
                  projectId={projectId}
                  sprintId={selectedSprintId}
                  sprints={sprints}
                />
              </motion.div>
            </>
          )}
        </div>
      </>
);
}
