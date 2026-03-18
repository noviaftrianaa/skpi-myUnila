"use client";

import { useState } from "react";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { FiPrinter, FiFilter } from "react-icons/fi";
import type { Project, ProjectModule, Task } from "@/lib/services/project/projectService";

interface ProgressReportProps {
  project: Project;
  modules: ProjectModule[];
  tasks: Task[];
}

export default function ProgressReport({ project, modules, tasks }: ProgressReportProps) {
  const [periodeAwal, setPeriodeAwal] = useState("");
  const [periodeAkhir, setPeriodeAkhir] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");

  const filteredTasks = tasks.filter(t => {
    const matchModule = selectedModule === "all" || t.module_id === selectedModule;
    const matchPeriode = (!periodeAwal || new Date(t.updated_at) >= new Date(periodeAwal)) &&
                         (!periodeAkhir || new Date(t.updated_at) <= new Date(periodeAkhir + "T23:59:59"));
    return matchModule && matchPeriode;
  });

  const doneTasks = filteredTasks.filter(t => t.status === 'done');
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress');
  const overdueTasks = filteredTasks.filter(t =>
    t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date()
  );

  const progress = project.task_count && project.task_count > 0
    ? Math.round(((project.task_done ?? 0) / project.task_count) * 100)
    : 0;

  const handlePrint = () => {
    window.print();
  };

  const formatDateId = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Filter controls (hidden on print) */}
      <div className="print:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <FiFilter className="w-4 h-4" />
          Filter Laporan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Dari Tanggal</label>
            <Input type="date" value={periodeAwal} onValueChange={setPeriodeAwal} variant="bordered" size="sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sampai Tanggal</label>
            <Input type="date" value={periodeAkhir} onValueChange={setPeriodeAkhir} variant="bordered" size="sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Modul</label>
            <Select
              selectedKeys={new Set([selectedModule])}
              onSelectionChange={(keys) => setSelectedModule(Array.from(keys)[0] as string ?? "all")}
              variant="bordered"
              size="sm"
              items={[{ id: "all", nama: "Semua Modul" }, ...modules]}
            >
              {(m) => <SelectItem key={m.id}>{m.nama}</SelectItem>}
            </Select>
          </div>
        </div>
        <Button
          color="primary"
          className="bg-[#0B5EA8] text-white w-full sm:w-auto"
          startContent={<FiPrinter className="w-4 h-4" />}
          onPress={handlePrint}
        >
          Cetak / Simpan PDF
        </Button>
      </div>

      {/* Printable report */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 print:border-0 print:p-0" id="print-area">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b border-gray-300">
          <p className="text-xs font-medium text-gray-500">UNIVERSITAS LAMPUNG</p>
          <p className="text-xs text-gray-400">UPT Teknologi Informasi & Komunikasi</p>
          <h1 className="text-xl font-bold mt-2 text-gray-900">LAPORAN PROGRESS PROJECT</h1>
          {(periodeAwal || periodeAkhir) && (
            <p className="text-sm text-gray-600 mt-0.5">
              Periode: {periodeAwal ? formatDateId(periodeAwal) : "Semua"} — {periodeAkhir ? formatDateId(periodeAkhir) : "Sekarang"}
            </p>
          )}
        </div>

        {/* Project Info */}
        <div className="mb-5">
          <table className="text-sm w-full">
            <tbody>
              <tr><td className="text-gray-500 w-32 py-0.5">Project</td><td className="font-semibold">{project.nama}</td></tr>
              <tr><td className="text-gray-500 py-0.5">Kode</td><td>{project.kode}</td></tr>
              <tr><td className="text-gray-500 py-0.5">Status</td><td className="capitalize">{project.status}</td></tr>
              <tr><td className="text-gray-500 py-0.5">Progress</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-[#0B5EA8]" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-semibold">{progress}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mb-5">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Ringkasan</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border border-gray-200">
                <th className="border border-gray-200 px-3 py-2 text-center">Total Task</th>
                <th className="border border-gray-200 px-3 py-2 text-center">Selesai</th>
                <th className="border border-gray-200 px-3 py-2 text-center">In Progress</th>
                <th className="border border-gray-200 px-3 py-2 text-center">Overdue</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-3 py-2 text-center font-bold">{filteredTasks.length}</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-emerald-700 font-semibold">{doneTasks.length}</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-amber-700 font-semibold">{inProgressTasks.length}</td>
                <td className="border border-gray-200 px-3 py-2 text-center text-red-700 font-semibold">{overdueTasks.length}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Progress per module */}
        {modules.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">Progress per Modul</h2>
            <div className="space-y-2">
              {modules.map((m, i) => {
                const mTasks = filteredTasks.filter(t => t.module_id === m.id);
                const mDone = mTasks.filter(t => t.status === 'done').length;
                const mPct = mTasks.length > 0 ? Math.round((mDone / mTasks.length) * 100) : 0;
                return (
                  <div key={m.id} className="flex items-center gap-3 text-sm">
                    <span className="w-4 text-gray-400">{i + 1}.</span>
                    <span className="w-36 font-medium text-gray-700 truncate">{m.nama}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="h-2 rounded-full bg-[#0B5EA8]" style={{ width: `${mPct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">{mPct}%</span>
                    <span className="text-xs text-gray-400">{mDone}/{mTasks.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Done tasks */}
        {doneTasks.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">
              Task Selesai Periode Ini ({doneTasks.length})
            </h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-2 py-1 text-left">No</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Kode</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Judul</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Assignee</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Selesai</th>
                </tr>
              </thead>
              <tbody>
                {doneTasks.map((t, i) => (
                  <tr key={t.id}>
                    <td className="border border-gray-200 px-2 py-1">{i + 1}</td>
                    <td className="border border-gray-200 px-2 py-1 font-mono">{t.kode}</td>
                    <td className="border border-gray-200 px-2 py-1">{t.judul}</td>
                    <td className="border border-gray-200 px-2 py-1">{t.assignee_name ?? "-"}</td>
                    <td className="border border-gray-200 px-2 py-1">{formatDateId(t.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Overdue tasks */}
        {overdueTasks.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-red-700 uppercase tracking-wide mb-2">
              Task Overdue ({overdueTasks.length})
            </h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-red-50">
                  <th className="border border-gray-200 px-2 py-1 text-left">No</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Kode</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Judul</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Assignee</th>
                  <th className="border border-gray-200 px-2 py-1 text-left">Deadline</th>
                </tr>
              </thead>
              <tbody>
                {overdueTasks.map((t, i) => (
                  <tr key={t.id}>
                    <td className="border border-gray-200 px-2 py-1">{i + 1}</td>
                    <td className="border border-gray-200 px-2 py-1 font-mono">{t.kode}</td>
                    <td className="border border-gray-200 px-2 py-1">{t.judul}</td>
                    <td className="border border-gray-200 px-2 py-1">{t.assignee_name ?? "-"}</td>
                    <td className="border border-gray-200 px-2 py-1 text-red-600 font-semibold">{formatDateId(t.due_date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          Dicetak: {formatDateId(new Date().toISOString())} • MyUnila — UPT TIK Universitas Lampung
        </div>
      </div>
    </div>
  );
}
