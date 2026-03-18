"use client";

import { useState } from "react";
import { Button, Chip } from "@heroui/react";
import {
  FiActivity,
  FiClock,
  FiGitCommit,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
} from "react-icons/fi";
import type { Activity } from "@/lib/services/project/projectService";

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  backlog: "bg-slate-100 text-slate-600",
  todo: "bg-blue-100 text-blue-600",
  in_progress: "bg-amber-100 text-amber-700",
  review: "bg-purple-100 text-purple-600",
  done: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
  cancelled: "Dibatalkan",
};

function getActivityConfig(aksi: string): {
  icon: React.ReactNode;
  label: string;
  bgColor: string;
} {
  switch (aksi) {
    case "project_created":
      return { icon: <span className="text-base">🆕</span>, label: "membuat project", bgColor: "bg-blue-100" };
    case "project_updated":
      return { icon: <FiEdit2 className="w-3.5 h-3.5 text-blue-600" />, label: "mengupdate project", bgColor: "bg-blue-50" };
    case "module_created":
      return { icon: <span className="text-base">📦</span>, label: "membuat modul", bgColor: "bg-amber-50" };
    case "module_updated":
      return { icon: <span className="text-base">📦</span>, label: "mengupdate modul", bgColor: "bg-amber-50" };
    case "task_created":
      return { icon: <FiPlus className="w-3.5 h-3.5 text-emerald-600" />, label: "membuat task", bgColor: "bg-emerald-50" };
    case "task_updated":
      return { icon: <FiEdit2 className="w-3.5 h-3.5 text-blue-600" />, label: "mengupdate task", bgColor: "bg-blue-50" };
    case "task_status_changed":
      return { icon: <FiRefreshCw className="w-3.5 h-3.5 text-purple-600" />, label: "mengubah status", bgColor: "bg-purple-50" };
    case "task_deleted":
      return { icon: <FiTrash2 className="w-3.5 h-3.5 text-red-500" />, label: "menghapus task", bgColor: "bg-red-50" };
    case "task_auto_closed":
      return { icon: <span className="text-base">🤖</span>, label: "auto-closed via commit", bgColor: "bg-slate-50" };
    case "committed":
      return { icon: <FiGitCommit className="w-3.5 h-3.5 text-gray-600" />, label: "commit", bgColor: "bg-gray-50" };
    case "commented":
      return { icon: <span className="text-base">💬</span>, label: "berkomentar di", bgColor: "bg-sky-50" };
    default:
      return { icon: <FiActivity className="w-3.5 h-3.5 text-gray-500" />, label: aksi, bgColor: "bg-gray-50" };
  }
}

function parseDetail(detailStr?: string): Record<string, any> | null {
  if (!detailStr) return null;
  try {
    return JSON.parse(detailStr);
  } catch {
    return null;
  }
}

function formatTimeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  } catch {
    return "";
  }
}

function formatDateLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (date.getTime() === today.getTime()) return "Hari ini";
    if (date.getTime() === yesterday.getTime()) return "Kemarin";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getDateKey(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  } catch {
    return dateStr;
  }
}

interface GroupedActivities {
  dateLabel: string;
  dateKey: string;
  activities: Activity[];
}

function groupByDate(activities: Activity[]): GroupedActivities[] {
  const groups: Record<string, GroupedActivities> = {};
  for (const act of activities) {
    const key = getDateKey(act.created_at);
    if (!groups[key]) {
      groups[key] = {
        dateKey: key,
        dateLabel: formatDateLabel(act.created_at),
        activities: [],
      };
    }
    groups[key].activities.push(act);
  }
  return Object.values(groups);
}

function StatusChip({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";
  const label = STATUS_LABELS[status] ?? status;
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${colorClass}`}>
      {label}
    </span>
  );
}

function ActivityItem({ act }: { act: Activity }) {
  const config = getActivityConfig(act.aksi);
  const detail = parseDetail(act.detail);

  const renderContent = () => {
    if (act.aksi === "task_status_changed" && detail?.old_status && detail?.new_status) {
      return (
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight flex flex-wrap items-center gap-1">
          <span className="font-medium">{act.user_name}</span>
          <span className="text-gray-500">mengubah status</span>
          {act.task_kode && (
            <span className="font-mono text-xs text-[#0B5EA8]">{act.task_kode}</span>
          )}
          <span className="text-gray-400">dari</span>
          <StatusChip status={detail.old_status} />
          <span className="text-gray-400">→</span>
          <StatusChip status={detail.new_status} />
        </p>
      );
    }

    if (act.aksi === "committed") {
      const hash = detail?.hash ?? detail?.commit_hash ?? "";
      const message = detail?.message ?? detail?.commit_message ?? act.detail ?? "";
      return (
        <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight">
          <span className="font-medium">{act.user_name}</span>{" "}
          <span className="text-gray-500">push commit</span>{" "}
          {hash && (
            <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 text-[#0B5EA8] px-1.5 py-0.5 rounded">
              {hash.slice(0, 7)}
            </span>
          )}
          {act.task_kode && (
            <span className="ml-1 font-mono text-xs text-[#0B5EA8]">{act.task_kode}</span>
          )}
          {message && (
            <span className="block text-xs text-gray-500 mt-0.5 italic line-clamp-1">
              {typeof message === "string" ? message : ""}
            </span>
          )}
        </p>
      );
    }

    return (
      <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight">
        <span className="font-medium">{act.user_name}</span>{" "}
        <span className="text-gray-500">{config.label}</span>
        {act.task_kode && (
          <span className="ml-1 font-mono text-xs text-[#0B5EA8]">{act.task_kode}</span>
        )}
      </p>
    );
  };

  return (
    <div className="flex gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Icon bubble */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${config.bgColor}`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {renderContent()}
        <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
          <FiClock className="w-2.5 h-2.5" />
          {formatTimeAgo(act.created_at)}
        </p>
      </div>
    </div>
  );
}

export default function ActivityFeed({ activities, loading, onLoadMore, hasMore }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <FiActivity className="w-8 h-8 mb-2" />
        <p className="text-sm">Belum ada aktivitas</p>
      </div>
    );
  }

  const groups = groupByDate(activities);

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.dateKey}>
          {/* Date separator */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {group.dateLabel}
            </span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          </div>

          {/* Activities in group */}
          <div className="space-y-0.5">
            {group.activities.map((act) => (
              <ActivityItem key={act.id} act={act} />
            ))}
          </div>
        </div>
      ))}

      {/* Load more */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-2">
          <Button
            size="sm"
            variant="flat"
            className="text-xs text-gray-500"
            onPress={onLoadMore}
          >
            Muat lebih banyak
          </Button>
        </div>
      )}
    </div>
  );
}
