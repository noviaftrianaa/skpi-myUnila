"use client";

import type { WorkflowStatus } from "@/lib/services/sim-prestasi/types";

const styleMap: Record<WorkflowStatus, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600",
  review: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-800",
  ready: "bg-blue-100 text-blue-800 ring-blue-200 dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-800",
  sending: "bg-indigo-100 text-indigo-800 ring-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-800",
  sent: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-800",
  error: "bg-rose-100 text-rose-800 ring-rose-200 dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-800",
  archived: "bg-slate-200 text-slate-600 ring-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700",
};

const labelMap: Record<WorkflowStatus, string> = {
  draft: "Draft",
  review: "Review",
  ready: "Ready",
  sending: "Sending",
  sent: "Terkirim",
  error: "Error",
  archived: "Arsip",
};

export function WorkflowBadge({ status }: { status: WorkflowStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styleMap[status]}`}>
      {labelMap[status]}
    </span>
  );
}
