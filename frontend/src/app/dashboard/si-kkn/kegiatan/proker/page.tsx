"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiPlus, FiX } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyProgramKerja } from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

const bidangColors: Record<string, "primary" | "danger" | "warning" | "default" | "secondary" | "success"> = {
  pendidikan: "primary",
  kesehatan: "danger",
  ekonomi: "warning",
  infrastruktur: "default",
  sosial_budaya: "secondary",
  lingkungan: "success",
  teknologi: "primary",
};

const bidangLabels: Record<string, string> = {
  pendidikan: "Pendidikan",
  kesehatan: "Kesehatan",
  ekonomi: "Ekonomi",
  infrastruktur: "Infrastruktur",
  sosial_budaya: "Sosial Budaya",
  lingkungan: "Lingkungan",
  teknologi: "Teknologi",
};

const statusColors: Record<string, "default" | "primary" | "success" | "danger"> = {
  rencana: "default",
  berjalan: "primary",
  selesai: "success",
  batal: "danger",
};

const statusLabels: Record<string, string> = {
  rencana: "Rencana",
  berjalan: "Berjalan",
  selesai: "Selesai",
  batal: "Batal",
};

export default function ProgramKerjaPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [filterBidang, setFilterBidang] = useState("");
  const [filterStatusProker, setFilterStatusProker] = useState("");
  const [showSlideOver, setShowSlideOver] = useState(false);

  // Form state
  const [formJudul, setFormJudul] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formBidang, setFormBidang] = useState("");
  const [formTglMulai, setFormTglMulai] = useState("");
  const [formTglSelesai, setFormTglSelesai] = useState("");
  const [formSasaran, setFormSasaran] = useState("");
  const [formTarget, setFormTarget] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const filteredData = useMemo(() => {
    let data = [...dummyProgramKerja];
    if (filterBidang) data = data.filter((p) => p.bidang === filterBidang);
    if (filterStatusProker) data = data.filter((p) => p.status === filterStatusProker);
    return data;
  }, [filterBidang, filterStatusProker]);

  const columns: Column<(typeof dummyProgramKerja)[0]>[] = [
    {
      key: "judul",
      label: "Judul",
      sortable: true,
      render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.judul}</span>,
    },
    {
      key: "bidang",
      label: "Bidang",
      align: "center",
      sortable: true,
      render: (item) => (
        <Chip size="sm" color={bidangColors[item.bidang] || "default"} variant="flat">
          {bidangLabels[item.bidang] || item.bidang}
        </Chip>
      ),
    },
    {
      key: "tgl_mulai",
      label: "Periode",
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {new Date(item.tgl_mulai).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          {item.tgl_selesai && ` - ${new Date(item.tgl_selesai).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`}
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
        <Button size="sm" variant="flat" color="primary" onPress={() => toast.success(`Detail: ${item.judul}`)}>
          Detail
        </Button>
      ),
    },
  ];

  const handleSubmit = () => {
    toast.success("Program kerja berhasil ditambahkan");
    setShowSlideOver(false);
    setFormJudul("");
    setFormDeskripsi("");
    setFormBidang("");
    setFormTglMulai("");
    setFormTglSelesai("");
    setFormSasaran("");
    setFormTarget("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Program Kerja"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Program Kerja</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Daftar program kerja KKN kelompok</p>
          </div>
          <Button color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={() => setShowSlideOver(true)}>
            Tambah Proker
          </Button>
        </div>

        {/* DataTable */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            <DataTable
              data={filteredData}
              columns={columns}
              searchable={true}
              searchKeys={["judul", "deskripsi", "target_sasaran"]}
              searchPlaceholder="Cari program kerja..."
              filterSlot={
                <div className="flex gap-2">
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterBidang}
                    onChange={(e) => setFilterBidang(e.target.value)}
                  >
                    <option value="">Semua Bidang</option>
                    {Object.entries(bidangLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterStatusProker}
                    onChange={(e) => setFilterStatusProker(e.target.value)}
                  >
                    <option value="">Semua Status</option>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tambah Program Kerja</h2>
              <button onClick={() => setShowSlideOver(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Judul program kerja"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Deskripsi program kerja..."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bidang</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formBidang}
                  onChange={(e) => setFormBidang(e.target.value)}
                >
                  <option value="">Pilih Bidang</option>
                  {Object.entries(bidangLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={formTglMulai}
                    onChange={(e) => setFormTglMulai(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={formTglSelesai}
                    onChange={(e) => setFormTglSelesai(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sasaran</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Target sasaran kegiatan"
                  value={formSasaran}
                  onChange={(e) => setFormSasaran(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Target capaian"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button color="primary" className="flex-1" onPress={handleSubmit}>
                  Simpan Proker
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
