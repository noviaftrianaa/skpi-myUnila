"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import {
  Button,
  Spinner,
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import {
  FiBarChart2,
  FiFolder,
  FiCalendar,
} from "react-icons/fi";
import Link from "next/link";
import { projectManagementMenuConfig } from "../../config/menuConfig";
import TaskDetailModal from "../../components/TaskDetailModal";
import {
  projectService,
  type Project,
  type Task,
  type ProjectModule,
} from "@/lib/services/project/projectService";

// ===================== CONSTANTS =====================

type ZoomLevel = "day" | "week" | "month";

const STATUS_BAR_COLORS: Record<string, string> = {
  backlog: "#94a3b8",
  todo: "#3b82f6",
  in_progress: "#f59e0b",
  review: "#a855f7",
  done: "#10b981",
  cancelled: "#f87171",
};

const STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
  cancelled: "Dibatalkan",
};

const ROW_HEIGHT = 40;
const MODULE_ROW_HEIGHT = 36;
const HEADER_HEIGHT = 48;
const LEFT_COL_WIDTH = 220;

// ===================== DATE HELPERS =====================

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

function formatWeekLabel(d: Date): string {
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function formatDayLabel(d: Date): string {
  return d.toLocaleDateString("id-ID", { day: "numeric" });
}

function getDayOfWeekShort(d: Date): string {
  return d.toLocaleDateString("id-ID", { weekday: "short" });
}

// ===================== ZOOM CONFIG =====================

interface ZoomConfig {
  colWidth: number;
  unitDays: number;
  totalColumns: number;
  headerFn: (d: Date, idx: number) => string;
  subHeaderFn?: (d: Date) => string;
  startOffsetDays: number; // days before today to start timeline
}

function getZoomConfig(zoom: ZoomLevel): ZoomConfig {
  switch (zoom) {
    case "day":
      return {
        colWidth: 40,
        unitDays: 1,
        totalColumns: 60,
        headerFn: (d) => formatDayLabel(d),
        subHeaderFn: (d) => getDayOfWeekShort(d),
        startOffsetDays: 7,
      };
    case "week":
      return {
        colWidth: 120,
        unitDays: 7,
        totalColumns: 26,
        headerFn: (d) => formatWeekLabel(d),
        subHeaderFn: undefined,
        startOffsetDays: 14,
      };
    case "month":
      return {
        colWidth: 160,
        unitDays: 30,
        totalColumns: 12,
        headerFn: (d) => formatMonthYear(d),
        subHeaderFn: undefined,
        startOffsetDays: 60,
      };
  }
}

// ===================== TASK BAR CALC =====================

interface TaskBarInfo {
  task: Task;
  startOffset: number; // in column units from timeline start
  widthCols: number;
  isDot: boolean;
}

function calcTaskBar(task: Task, timelineStart: Date, zoomConfig: ZoomConfig): TaskBarInfo {
  const unitMs = zoomConfig.unitDays * 86400000;

  let start: Date | null = null;
  let end: Date | null = null;

  if (task.tgl_mulai) start = startOfDay(new Date(task.tgl_mulai));
  if (task.status === "done" && task.tgl_selesai) {
    end = startOfDay(new Date(task.tgl_selesai));
  } else if (task.tgl_target) {
    end = startOfDay(new Date(task.tgl_target));
  }

  if (!start && !end) {
    const createdAt = startOfDay(new Date(task.created_at));
    const startOffsetMs = createdAt.getTime() - timelineStart.getTime();
    return { task, startOffset: startOffsetMs / unitMs, widthCols: 0, isDot: true };
  }

  if (!start && end) start = new Date(end.getTime() - unitMs);
  if (start && !end) end = new Date(start.getTime() + unitMs);

  const startOffsetMs = start!.getTime() - timelineStart.getTime();
  const startOffset = startOffsetMs / unitMs;
  const widthMs = end!.getTime() - start!.getTime();
  const widthCols = Math.max(widthMs / unitMs, 0.5);

  return { task, startOffset, widthCols, isDot: false };
}

// ===================== MAIN COMPONENT =====================

export default function TimelinePage() {
  useRequireAuth();
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [modules, setModules] = useState<ProjectModule[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [zoom, setZoom] = useState<ZoomLevel>("week");
  const [moduleFilter, setModuleFilter] = useState("all");

  const gridScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!projectId) return;
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [proj, mods, tasksResp] = await Promise.all([
        projectService.getProject(projectId),
        projectService.getModules(projectId),
        projectService.getTasks(projectId, { per_page: 500 }),
      ]);
      setProject(proj);
      setModules(mods);
      setTasks(tasksResp.data);
    } catch (error) {
      console.error("Error loading timeline:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdated = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask(updated);
  };

  const zoomConfig = useMemo(() => getZoomConfig(zoom), [zoom]);

  const timelineStart = useMemo(() => {
    const today = startOfDay(new Date());
    return addDays(today, -zoomConfig.startOffsetDays);
  }, [zoom, zoomConfig.startOffsetDays]);

  const todayOffset = useMemo(() => {
    const today = startOfDay(new Date());
    const ms = today.getTime() - timelineStart.getTime();
    return ms / (zoomConfig.unitDays * 86400000);
  }, [timelineStart, zoomConfig]);

  const columnHeaders = useMemo(() => {
    return Array.from({ length: zoomConfig.totalColumns }, (_, i) => {
      const d = addDays(timelineStart, i * zoomConfig.unitDays);
      return {
        date: d,
        label: zoomConfig.headerFn(d, i),
        sub: zoomConfig.subHeaderFn?.(d),
        isToday: i === Math.floor(todayOffset),
      };
    });
  }, [timelineStart, zoomConfig, todayOffset]);

  const filteredTasks = useMemo(() => {
    return moduleFilter === "all"
      ? tasks
      : tasks.filter((t) => t.module_id === moduleFilter);
  }, [tasks, moduleFilter]);

  const tasksByModule = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const t of filteredTasks) {
      const key = t.module_id ?? "__no_module__";
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return map;
  }, [filteredTasks]);

  const moduleOrder = useMemo(() => {
    const withModule = modules.filter((m) => tasksByModule[m.id]?.length > 0).map((m) => m.id);
    if (tasksByModule["__no_module__"]?.length > 0) withModule.push("__no_module__");
    return withModule;
  }, [modules, tasksByModule]);

  const getModuleName = (id: string) => {
    if (id === "__no_module__") return "Tanpa Modul";
    return modules.find((m) => m.id === id)?.nama ?? id;
  };

  // Scroll to today on load
  useEffect(() => {
    if (gridScrollRef.current && !isLoading) {
      const todayPx = todayOffset * zoomConfig.colWidth;
      const containerWidth = gridScrollRef.current.clientWidth;
      gridScrollRef.current.scrollLeft = Math.max(0, todayPx - containerWidth / 3);
    }
  }, [isLoading, todayOffset, zoomConfig.colWidth]);

  const totalTimelineWidth = zoomConfig.totalColumns * zoomConfig.colWidth;

  // Build flat row list for synchronized rendering
  type RowType =
    | { kind: "module"; moduleId: string }
    | { kind: "task"; task: Task; moduleId: string };

  const rows = useMemo((): RowType[] => {
    const result: RowType[] = [];
    for (const moduleId of moduleOrder) {
      result.push({ kind: "module", moduleId });
      for (const task of tasksByModule[moduleId] ?? []) {
        result.push({ kind: "task", task, moduleId });
      }
    }
    return result;
  }, [moduleOrder, tasksByModule]);

  if (isLoading) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="Project Management"
        appIcon={<FiFolder className="w-6 h-6 text-white" />}
        appKey="project-management"
        fallbackMenus={projectManagementMenuConfig}
        pageTitle="Timeline"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Project Management"
      appIcon={<FiFolder className="w-6 h-6 text-white" />}
      appKey="project-management"
      fallbackMenus={projectManagementMenuConfig}
      pageTitle={project ? `${project.nama} — Timeline` : "Timeline"}
    >
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Link
                href="/dashboard/project-management"
                className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors"
              >
                Project Management
              </Link>
              <span className="text-gray-300">/</span>
              <Link
                href={`/dashboard/project-management/${projectId}/board`}
                className="text-sm text-gray-500 hover:text-[#0B5EA8] transition-colors"
              >
                {project?.nama ?? "..."}
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">Timeline</span>
            </div>
            <div className="flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-[#0B5EA8]" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Timeline</h1>
              <Chip size="sm" variant="flat" className="text-xs">{filteredTasks.length} task</Chip>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Module filter */}
            <Select
              selectedKeys={new Set([moduleFilter])}
              onSelectionChange={(keys) => setModuleFilter(Array.from(keys)[0] as string ?? "all")}
              variant="bordered"
              size="sm"
              className="w-44"
              placeholder="Semua Modul"
              items={[{ id: "all", nama: "Semua Modul" }, ...modules]}
            >
              {(m) => <SelectItem key={m.id}>{m.nama}</SelectItem>}
            </Select>

            {/* Zoom controls */}
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {(["day", "week", "month"] as ZoomLevel[]).map((z) => (
                <button
                  key={z}
                  onClick={() => setZoom(z)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    zoom === z
                      ? "bg-[#0B5EA8] text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {z === "day" ? "Hari" : z === "week" ? "Minggu" : "Bulan"}
                </button>
              ))}
            </div>

            <Link href={`/dashboard/project-management/${projectId}/board`}>
              <Button size="sm" variant="bordered" className="text-xs">
                Board
              </Button>
            </Link>
            <Link href={`/dashboard/project-management/${projectId}/list`}>
              <Button size="sm" variant="bordered" className="text-xs">
                List
              </Button>
            </Link>
          </div>
        </div>

        {/* Timeline grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex" style={{ overflow: "hidden" }}>
            {/* ===== LEFT COLUMN (fixed) ===== */}
            <div
              className="shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-20"
              style={{ width: LEFT_COL_WIDTH }}
            >
              {/* Header cell */}
              <div
                className="flex items-center px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80"
                style={{ height: HEADER_HEIGHT }}
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Modul / Task
                </span>
              </div>

              {/* Row labels */}
              {rows.map((row, idx) => {
                if (row.kind === "module") {
                  return (
                    <div
                      key={`lbl-module-${row.moduleId}`}
                      className="flex items-center px-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700"
                      style={{ height: MODULE_ROW_HEIGHT }}
                    >
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                        {getModuleName(row.moduleId)}
                      </span>
                    </div>
                  );
                }
                return (
                  <div
                    key={`lbl-task-${row.task.id}`}
                    className="flex items-center px-4 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer group"
                    style={{ height: ROW_HEIGHT }}
                    onClick={() => setSelectedTask(row.task)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: STATUS_BAR_COLORS[row.task.status] ?? "#94a3b8" }}
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 truncate group-hover:text-[#0B5EA8]">
                        {row.task.judul}
                      </span>
                    </div>
                  </div>
                );
              })}

              {rows.length === 0 && (
                <div
                  className="flex items-center justify-center text-gray-400 text-xs"
                  style={{ height: 160 }}
                >
                  Tidak ada task
                </div>
              )}
            </div>

            {/* ===== RIGHT: Scrollable grid ===== */}
            <div
              ref={gridScrollRef}
              className="flex-1 overflow-x-auto"
              style={{ position: "relative" }}
            >
              <div style={{ width: totalTimelineWidth, minWidth: totalTimelineWidth }}>
                {/* Header row */}
                <div
                  className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-10"
                  style={{ height: HEADER_HEIGHT }}
                >
                  {columnHeaders.map((col, i) => (
                    <div
                      key={i}
                      className={`shrink-0 flex flex-col items-center justify-center text-center border-r border-gray-100 dark:border-gray-700/30 ${
                        col.isToday ? "bg-red-50 dark:bg-red-900/20" : ""
                      }`}
                      style={{ width: zoomConfig.colWidth }}
                    >
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">
                        {col.label}
                      </span>
                      {col.sub && (
                        <span className="text-[9px] text-gray-400">{col.sub}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Grid rows with bars */}
                <div style={{ position: "relative" }}>
                  {/* Vertical grid lines */}
                  {columnHeaders.map((_, i) => (
                    <div
                      key={`grid-${i}`}
                      className="absolute top-0 bottom-0 border-r border-gray-100 dark:border-gray-700/20"
                      style={{ left: i * zoomConfig.colWidth, width: zoomConfig.colWidth }}
                    />
                  ))}

                  {/* Today vertical line */}
                  {todayOffset >= 0 && todayOffset <= zoomConfig.totalColumns && (
                    <div
                      className="absolute top-0 bottom-0 z-20 pointer-events-none"
                      style={{
                        left: todayOffset * zoomConfig.colWidth,
                        width: 2,
                        borderLeft: "2px dashed #f87171",
                      }}
                    />
                  )}

                  {/* Rows */}
                  {rows.map((row) => {
                    if (row.kind === "module") {
                      return (
                        <div
                          key={`grid-module-${row.moduleId}`}
                          className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40"
                          style={{ height: MODULE_ROW_HEIGHT }}
                        />
                      );
                    }

                    // Task row with bar
                    const barInfo = calcTaskBar(row.task, timelineStart, zoomConfig);
                    const barColor = STATUS_BAR_COLORS[row.task.status] ?? "#94a3b8";
                    const left = barInfo.startOffset * zoomConfig.colWidth;
                    const width = barInfo.widthCols * zoomConfig.colWidth;

                    return (
                      <div
                        key={`grid-task-${row.task.id}`}
                        className="relative border-b border-gray-100 dark:border-gray-700/30"
                        style={{ height: ROW_HEIGHT }}
                      >
                        {barInfo.isDot ? (
                          <div
                            title={row.task.judul}
                            onClick={() => setSelectedTask(row.task)}
                            className="absolute cursor-pointer hover:scale-125 transition-transform z-10 rounded-full"
                            style={{
                              left: Math.max(0, left + zoomConfig.colWidth / 2 - 5),
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 10,
                              height: 10,
                              backgroundColor: barColor,
                            }}
                          />
                        ) : (
                          <div
                            title={`${row.task.judul} — ${STATUS_LABELS[row.task.status] ?? row.task.status}`}
                            onClick={() => setSelectedTask(row.task)}
                            className="absolute cursor-pointer hover:brightness-110 hover:shadow-md transition-all flex items-center px-2 overflow-hidden z-10"
                            style={{
                              left: Math.max(0, left),
                              width: Math.max(width, 8),
                              top: "50%",
                              transform: "translateY(-50%)",
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: barColor,
                              opacity: 0.9,
                            }}
                          >
                            {width > 50 && (
                              <span
                                className="text-[10px] font-medium truncate leading-none"
                                style={{ color: "white" }}
                              >
                                {row.task.judul}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {rows.length === 0 && (
                    <div
                      className="flex items-center justify-center text-gray-400 text-sm gap-2"
                      style={{ height: 160 }}
                    >
                      <FiCalendar className="w-5 h-5" />
                      Tidak ada task untuk ditampilkan
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 flex-wrap">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_BAR_COLORS[status] }}
                />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-auto">
              <span
                className="w-6 border-t-2 border-dashed border-red-400"
                style={{ display: "inline-block" }}
              />
              <span className="text-xs text-gray-500">Hari ini</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        projectId={projectId}
        modules={modules}
        onTaskUpdated={handleTaskUpdated}
      />
    </DashboardLayoutWithDynamicMenu>
  );
}
