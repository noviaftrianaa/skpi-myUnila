"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiBookOpen, FiSend, FiCheckCircle, FiPlus, FiX, FiUpload } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyLogbookHarian } from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

const statusColors: Record<string, "default" | "primary" | "success"> = {
  draft: "default",
  diajukan: "primary",
  disetujui_dpl: "success",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  disetujui_dpl: "Disetujui DPL",
};

export default function LogbookHarianPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState("");
  const [showSlideOver, setShowSlideOver] = useState(false);

  // Form state
  const [formTanggal, setFormTanggal] = useState("");
  const [formJamMulai, setFormJamMulai] = useState("");
  const [formJamSelesai, setFormJamSelesai] = useState("");
  const [formUraian, setFormUraian] = useState("");
  const [formHasil, setFormHasil] = useState("");
  const [formKendala, setFormKendala] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredData = useMemo(() => {
    if (!filterStatus) return dummyLogbookHarian;
    return dummyLogbookHarian.filter((l) => l.status === filterStatus);
  }, [filterStatus]);

  // Stats
  const totalLogbook = dummyLogbookHarian.length;
  const totalDiajukan = dummyLogbookHarian.filter((l) => l.status === "diajukan").length;
  const totalDisetujui = dummyLogbookHarian.filter((l) => l.status === "disetujui_dpl").length;

  const statCards = [
    { label: "Total Logbook", value: totalLogbook, icon: <FiBookOpen className="w-6 h-6" />, gradient: "from-blue-500 to-blue-600" },
    { label: "Diajukan", value: totalDiajukan, icon: <FiSend className="w-6 h-6" />, gradient: "from-amber-500 to-orange-500" },
    { label: "Disetujui DPL", value: totalDisetujui, icon: <FiCheckCircle className="w-6 h-6" />, gradient: "from-emerald-500 to-green-600" },
  ];

  const columns: Column<(typeof dummyLogbookHarian)[0]>[] = [
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
      key: "jam_mulai",
      label: "Jam",
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.jam_mulai} - {item.jam_selesai}
        </span>
      ),
    },
    {
      key: "judul_kegiatan",
      label: "Uraian Kegiatan",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1" title={item.deskripsi_kegiatan}>
          {item.judul_kegiatan}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true,
      render: (item) => (
        <Chip size="sm" color={statusColors[item.status] || "default"} variant="flat">
          {statusLabels[item.status] || item.status}
        </Chip>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <div className="flex items-center gap-1 justify-center">
          <Button size="sm" variant="flat" color="primary" onPress={() => toast.success(`Detail logbook: ${item.judul_kegiatan}`)}>
            Detail
          </Button>
          {item.status === "diajukan" && (
            <Button size="sm" variant="flat" color="success" onPress={() => toast.success("Logbook disetujui")}>
              Setujui
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleSubmit = () => {
    toast.success("Logbook berhasil ditambahkan");
    setShowSlideOver(false);
    setFormTanggal("");
    setFormJamMulai("");
    setFormJamSelesai("");
    setFormUraian("");
    setFormHasil("");
    setFormKendala("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Logbook Harian"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Logbook Harian</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Catatan kegiatan harian KKN</p>
          </div>
          <Button color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={() => setShowSlideOver(true)}>
            Tambah Logbook
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

        {/* DataTable */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            <DataTable
              data={filteredData}
              columns={columns}
              searchable={true}
              searchKeys={["judul_kegiatan", "deskripsi_kegiatan", "nm_mahasiswa"]}
              searchPlaceholder="Cari logbook..."
              filterSlot={
                <div className="flex gap-2">
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Semua Status</option>
                    <option value="draft">Draft</option>
                    <option value="diajukan">Diajukan</option>
                    <option value="disetujui_dpl">Disetujui DPL</option>
                  </select>
                </div>
              }
            />
          </CardBody>
        </Card>
      </div>

      {/* Slide-over Panel */}
      {showSlideOver && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowSlideOver(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tambah Logbook</h2>
              <button onClick={() => setShowSlideOver(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={formJamMulai}
                    onChange={(e) => setFormJamMulai(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={formJamSelesai}
                    onChange={(e) => setFormJamSelesai(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uraian Kegiatan</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Deskripsikan kegiatan hari ini..."
                  value={formUraian}
                  onChange={(e) => setFormUraian(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hasil Kegiatan</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Hasil yang dicapai..."
                  value={formHasil}
                  onChange={(e) => setFormHasil(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kendala</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Kendala yang dihadapi (jika ada)..."
                  value={formKendala}
                  onChange={(e) => setFormKendala(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto Dokumentasi</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Klik atau drag & drop foto</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG (maks. 5MB)</p>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button color="primary" className="flex-1" onPress={handleSubmit}>
                  Simpan Logbook
                </Button>
                <Button variant="flat" className="flex-1" onPress={() => setShowSlideOver(false)}>
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
