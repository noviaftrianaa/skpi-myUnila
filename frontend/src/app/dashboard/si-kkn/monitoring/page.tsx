"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUsers, FiGrid, FiCheckCircle, FiBarChart2, FiDownload } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import {
  dummyDashboardStatsKkn,
  dummyKelompokKkn,
  dummyNilaiAkhir,
  dummyLogbookHarian,
  dummyAbsensi,
  dummyProgramKerja,
  dummyPeriodeKkn,
  dummyWilayahKkn,
} from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

const statusColors: Record<string, "success" | "primary" | "default" | "warning"> = {
  aktif: "primary",
  selesai: "success",
  dibentuk: "default",
  dibubarkan: "warning",
};

export default function MonitoringPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [filterPeriode, setFilterPeriode] = useState("");
  const [filterWilayah, setFilterWilayah] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = dummyDashboardStatsKkn;
  const totalLulus = dummyNilaiAkhir.filter((n) => n.apakah_lulus).length;
  const rataRata = stats.rata_rata_nilai;

  const statCards = [
    { label: "Total Peserta", value: stats.total_peserta, icon: <FiUsers className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Kelompok Aktif", value: stats.kelompok_aktif, icon: <FiGrid className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
    { label: "Lulus", value: totalLulus, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-violet-500 to-purple-600" },
    { label: "Rata-rata Nilai", value: rataRata, icon: <FiBarChart2 className="w-6 h-6" />, gradient: "from-amber-500 to-orange-500" },
  ];

  // Distribusi nilai huruf for bar chart
  const nilaiDistribusi = useMemo(() => {
    const dist: Record<string, number> = { A: 0, AB: 0, B: 0, BC: 0, C: 0, D: 0, E: 0 };
    dummyNilaiAkhir.forEach((n) => {
      if (dist[n.nilai_huruf] !== undefined) dist[n.nilai_huruf]++;
    });
    return Object.entries(dist).map(([huruf, count]) => ({ huruf, count }));
  }, []);

  const maxDistribusi = Math.max(...nilaiDistribusi.map((d) => d.count), 1);

  const barColors: Record<string, string> = {
    A: "bg-emerald-500",
    AB: "bg-blue-500",
    B: "bg-blue-400",
    BC: "bg-amber-500",
    C: "bg-amber-400",
    D: "bg-red-400",
    E: "bg-red-500",
  };

  // Kelompok monitoring data
  const kelompokData = useMemo(() => {
    return dummyKelompokKkn.map((kel) => {
      const kelLogbooks = dummyLogbookHarian.filter((l) => l.id_kelompok === kel.id_kelompok);
      const kelAbsensi = dummyAbsensi.filter((a) => a.id_kelompok === kel.id_kelompok);
      const kelProker = dummyProgramKerja.filter((p) => p.id_kelompok === kel.id_kelompok);
      const prokerSelesai = kelProker.filter((p) => p.status === "selesai").length;
      const hadirCount = kelAbsensi.filter((a) => a.status_hadir === "hadir").length;
      const absensiRate = kelAbsensi.length > 0 ? Math.round((hadirCount / kelAbsensi.length) * 100) : 0;
      const logbookProgress = Math.min(100, Math.round((kelLogbooks.length / 30) * 100));

      return {
        ...kel,
        logbook_progress: logbookProgress,
        absensi_rate: absensiRate,
        proker_selesai: `${prokerSelesai}/${kelProker.length}`,
      };
    });
  }, []);

  const filteredKelompok = useMemo(() => {
    let data = [...kelompokData];
    if (filterPeriode) data = data.filter((k) => k.id_periode === filterPeriode);
    if (filterWilayah) data = data.filter((k) => k.nm_kabupaten === filterWilayah);
    return data;
  }, [kelompokData, filterPeriode, filterWilayah]);

  const columns: Column<(typeof kelompokData)[0]>[] = [
    {
      key: "kode_kelompok",
      label: "Kode",
      sortable: true,
      render: (item) => <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{item.kode_kelompok}</span>,
    },
    {
      key: "nm_desa",
      label: "Lokasi",
      sortable: true,
      render: (item) => (
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_desa}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.nm_kecamatan}, {item.nm_kabupaten}</p>
        </div>
      ),
    },
    {
      key: "jumlah_anggota",
      label: "Anggota",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.jumlah_anggota}</span>,
    },
    {
      key: "logbook_progress",
      label: "Logbook",
      align: "center",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${item.logbook_progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">{item.logbook_progress}%</span>
        </div>
      ),
    },
    {
      key: "absensi_rate",
      label: "Absensi",
      align: "center",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${item.absensi_rate}%` }}
            />
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 w-8 text-right">{item.absensi_rate}%</span>
        </div>
      ),
    },
    {
      key: "proker_selesai",
      label: "Proker",
      align: "center",
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.proker_selesai}</span>,
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true,
      render: (item) => (
        <Chip size="sm" color={statusColors[item.status] || "default"} variant="flat">
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Chip>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Monitoring"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Monitoring</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Dashboard monitoring pelaksanaan KKN</p>
          </div>
          <Button color="success" variant="flat" startContent={<FiDownload className="w-4 h-4" />} onPress={() => toast.success("Data berhasil diekspor")}>
            Export
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <Card key={card.label} className="border-none shadow-md rounded-xl overflow-hidden dark:bg-gray-800">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Bar Chart - Distribusi Nilai */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Distribusi Nilai Huruf</h3>
            <div className="flex items-end gap-3 h-40">
              {nilaiDistribusi.map((d) => (
                <div key={d.huruf} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{d.count}</span>
                  <div
                    className={`w-full rounded-t-lg ${barColors[d.huruf] || "bg-gray-400"} transition-all`}
                    style={{ height: `${(d.count / maxDistribusi) * 100}%`, minHeight: d.count > 0 ? "8px" : "2px" }}
                  />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{d.huruf}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* DataTable Kelompok */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            <DataTable
              data={filteredKelompok}
              columns={columns}
              searchable={true}
              searchKeys={["kode_kelompok", "nm_desa", "nm_kecamatan", "nm_kabupaten"]}
              searchPlaceholder="Cari kelompok..."
              filterSlot={
                <div className="flex gap-2">
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterPeriode}
                    onChange={(e) => setFilterPeriode(e.target.value)}
                  >
                    <option value="">Semua Periode</option>
                    {dummyPeriodeKkn.map((p) => (
                      <option key={p.id_periode} value={p.id_periode}>{p.nm_periode}</option>
                    ))}
                  </select>
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterWilayah}
                    onChange={(e) => setFilterWilayah(e.target.value)}
                  >
                    <option value="">Semua Wilayah</option>
                    {dummyWilayahKkn.map((w) => (
                      <option key={w.id_wilayah} value={w.nm_kabupaten}>{w.nm_kabupaten}</option>
                    ))}
                  </select>
                </div>
              }
            />
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
