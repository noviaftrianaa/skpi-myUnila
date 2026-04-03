"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiCheckCircle, FiAlertCircle, FiX } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyAbsensi } from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

const statusHadirColors: Record<string, "success" | "primary" | "warning" | "danger"> = {
  hadir: "success",
  izin: "primary",
  sakit: "warning",
  alpha: "danger",
};

const statusHadirLabels: Record<string, string> = {
  hadir: "Hadir",
  izin: "Izin",
  sakit: "Sakit",
  alpha: "Alpha",
};

const dotColors: Record<string, string> = {
  hadir: "bg-emerald-500",
  izin: "bg-blue-500",
  sakit: "bg-amber-500",
  alpha: "bg-red-500",
};

export default function AbsensiPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [showMarkPanel, setShowMarkPanel] = useState(false);
  const [markStatus, setMarkStatus] = useState("hadir");
  const [markKeterangan, setMarkKeterangan] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Summary stats
  const totalHadir = dummyAbsensi.filter((a) => a.status_hadir === "hadir").length;
  const totalIzin = dummyAbsensi.filter((a) => a.status_hadir === "izin").length;
  const totalSakit = dummyAbsensi.filter((a) => a.status_hadir === "sakit").length;
  const totalAlpha = dummyAbsensi.filter((a) => a.status_hadir === "alpha").length;

  const summaryBadges = [
    { label: "Hadir", value: totalHadir, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { label: "Izin", value: totalIzin, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { label: "Sakit", value: totalSakit, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    { label: "Alpha", value: totalAlpha, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  ];

  // Calendar grid for March 2026
  const daysInMonth = 31;
  const calendarDays = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `2026-03-${String(day).padStart(2, "0")}`;
      const entries = dummyAbsensi.filter((a) => a.tanggal === dateStr);
      return { day, entries };
    });
  }, []);

  const columns: Column<(typeof dummyAbsensi)[0]>[] = [
    {
      key: "tanggal",
      label: "Tanggal",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {new Date(item.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "nm_mahasiswa",
      label: "Mahasiswa",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_mahasiswa}</span>,
    },
    {
      key: "status_hadir",
      label: "Status",
      align: "center",
      sortable: true,
      render: (item) => (
        <Chip size="sm" color={statusHadirColors[item.status_hadir] || "default"} variant="flat">
          {statusHadirLabels[item.status_hadir] || item.status_hadir}
        </Chip>
      ),
    },
    {
      key: "keterangan",
      label: "Keterangan",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{item.keterangan || "-"}</span>,
    },
    {
      key: "jam_datang",
      label: "Jam Datang - Pulang",
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.jam_datang && item.jam_pulang ? `${item.jam_datang} - ${item.jam_pulang}` : "-"}
        </span>
      ),
    },
  ];

  const handleMarkAttendance = () => {
    toast.success(`Absensi berhasil dicatat: ${statusHadirLabels[markStatus]}`);
    setShowMarkPanel(false);
    setMarkStatus("hadir");
    setMarkKeterangan("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Absensi"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Absensi</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Rekap kehadiran peserta KKN</p>
          </div>
          <Button color="primary" startContent={<FiCheckCircle className="w-4 h-4" />} onPress={() => setShowMarkPanel(true)}>
            Catat Kehadiran
          </Button>
        </div>

        {/* Summary Badges */}
        <div className="flex flex-wrap gap-3">
          {summaryBadges.map((badge) => (
            <div key={badge.label} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badge.color}`}>
              <span>{badge.label}</span>
              <span className="font-bold">{badge.value}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Maret 2026</h3>
            <div className="grid grid-cols-7 gap-1">
              {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">{d}</div>
              ))}
              {/* March 2026 starts on Sunday (index 6), add empty cells */}
              {Array.from({ length: 6 }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calendarDays.map(({ day, entries }) => (
                <div
                  key={day}
                  className="aspect-square flex flex-col items-center justify-center rounded-lg text-xs border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{day}</span>
                  {entries.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {entries.slice(0, 3).map((e, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${dotColors[e.status_hadir] || "bg-gray-400"}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
              {Object.entries(dotColors).map(([key, color]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span>{statusHadirLabels[key]}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* DataTable */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            <DataTable
              data={dummyAbsensi}
              columns={columns}
              searchable={true}
              searchKeys={["nm_mahasiswa", "npm", "keterangan"]}
              searchPlaceholder="Cari absensi..."
            />
          </CardBody>
        </Card>
      </div>

      {/* Slide-over Panel */}
      {showMarkPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowMarkPanel(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Catat Kehadiran</h2>
              <button onClick={() => setShowMarkPanel(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Kehadiran</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={markStatus}
                  onChange={(e) => setMarkStatus(e.target.value)}
                >
                  {Object.entries(statusHadirLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Keterangan (opsional)..."
                  value={markKeterangan}
                  onChange={(e) => setMarkKeterangan(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button color="primary" className="flex-1" onPress={handleMarkAttendance}>
                  Simpan
                </Button>
                <Button variant="flat" className="flex-1" onPress={() => setShowMarkPanel(false)}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}
