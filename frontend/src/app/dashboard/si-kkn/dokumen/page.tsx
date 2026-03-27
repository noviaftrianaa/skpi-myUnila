"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiFile, FiAward, FiUpload, FiDownload, FiPlus, FiX } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyDokumenKkn, dummySertifikat, dummyJenisDokumen } from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

const dokumenChipColors: Record<string, "primary" | "success" | "warning" | "default" | "secondary" | "danger"> = {
  PROPOSAL: "primary",
  LOGBOOK: "secondary",
  LAPORAN_HARIAN: "warning",
  LAPORAN_AKHIR: "success",
  FOTO_KEGIATAN: "default",
  SURAT_TUGAS: "danger",
  SERTIFIKAT: "success",
  LAINNYA: "default",
};

const tabs = [
  { key: "dokumen", label: "Dokumen KKN", icon: <FiFile className="w-4 h-4" /> },
  { key: "sertifikat", label: "Sertifikat", icon: <FiAward className="w-4 h-4" /> },
];

const formatFileSize = (bytes: number) => {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  return `${(bytes / 1000).toFixed(0)} KB`;
};

export default function DokumenPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dokumen");
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [formJenis, setFormJenis] = useState("");
  const [formKeterangan, setFormKeterangan] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const dokumenColumns: Column<(typeof dummyDokumenKkn)[0]>[] = [
    {
      key: "nm_file",
      label: "Nama File",
      sortable: true,
      render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_file}</span>,
    },
    {
      key: "kode_dokumen",
      label: "Jenis Dokumen",
      align: "center",
      sortable: true,
      render: (item) => (
        <Chip size="sm" color={dokumenChipColors[item.kode_dokumen] || "default"} variant="flat">
          {item.kode_dokumen.replace(/_/g, " ")}
        </Chip>
      ),
    },
    {
      key: "id_kelompok",
      label: "Kelompok/Anggota",
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {item.id_kelompok ? `Kelompok ${item.id_kelompok.replace("kel-", "")}` : item.id_anggota || "-"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Tanggal Upload",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "ukuran_byte",
      label: "Ukuran",
      align: "center",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400">{formatFileSize(item.ukuran_byte)}</span>,
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-3 h-3" />} onPress={() => toast.success(`Mengunduh: ${item.nm_file}`)}>
          Download
        </Button>
      ),
    },
  ];

  const sertifikatColumns: Column<(typeof dummySertifikat)[0]>[] = [
    {
      key: "no_sertifikat",
      label: "Nomor Sertifikat",
      sortable: true,
      render: (item) => <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{item.no_sertifikat}</span>,
    },
    {
      key: "nm_mahasiswa",
      label: "Mahasiswa",
      sortable: true,
      render: (item) => (
        <div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_mahasiswa}</span>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.npm}</p>
        </div>
      ),
    },
    {
      key: "tgl_terbit",
      label: "Tanggal Terbit",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(item.tgl_terbit).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "final",
      label: "Status",
      align: "center",
      render: () => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Final
        </span>
      ),
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <Button size="sm" variant="flat" color="primary" startContent={<FiDownload className="w-3 h-3" />} onPress={() => toast.success(`Mengunduh sertifikat: ${item.no_sertifikat}`)}>
          Download
        </Button>
      ),
    },
  ];

  const handleUpload = () => {
    toast.success("Dokumen berhasil diupload");
    setShowSlideOver(false);
    setFormJenis("");
    setFormKeterangan("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Dokumen & Sertifikat"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dokumen & Sertifikat</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Kelola dokumen KKN dan sertifikat kelulusan</p>
          </div>
          <Button color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={() => setShowSlideOver(true)}>
            Upload Dokumen
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Dokumen KKN */}
        {activeTab === "dokumen" && (
          <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-0">
              <DataTable
                data={dummyDokumenKkn}
                columns={dokumenColumns}
                searchable={true}
                searchKeys={["nm_file", "kode_dokumen", "deskripsi"]}
                searchPlaceholder="Cari dokumen..."
              />
            </CardBody>
          </Card>
        )}

        {/* Tab: Sertifikat */}
        {activeTab === "sertifikat" && (
          <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-0">
              <DataTable
                data={dummySertifikat}
                columns={sertifikatColumns}
                searchable={true}
                searchKeys={["no_sertifikat", "nm_mahasiswa", "npm"]}
                searchPlaceholder="Cari sertifikat..."
              />
            </CardBody>
          </Card>
        )}
      </div>

      {/* Slide-over Panel */}
      {showSlideOver && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowSlideOver(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Dokumen</h2>
              <button onClick={() => setShowSlideOver(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Dokumen</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value)}
                >
                  <option value="">Pilih Jenis</option>
                  {dummyJenisDokumen.map((j) => (
                    <option key={j.id_jenis_dokumen} value={j.kode_dokumen}>{j.nm_dokumen}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Klik atau drag & drop file</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (maks. 20MB)</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Keterangan dokumen..."
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button color="primary" className="flex-1" onPress={handleUpload}>
                  Upload
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
