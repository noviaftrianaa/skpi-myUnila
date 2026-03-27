"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiPlus, FiX } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyCatatanBimbingan } from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

const jenisColors: Record<string, "primary" | "secondary" | "warning"> = {
  kunjungan: "primary",
  online: "secondary",
  telepon: "warning",
};

const jenisLabels: Record<string, string> = {
  kunjungan: "Kunjungan",
  online: "Online",
  telepon: "Telepon",
};

export default function BimbinganPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [filterJenis, setFilterJenis] = useState("");
  const [showSlideOver, setShowSlideOver] = useState(false);

  // Form state
  const [formTanggal, setFormTanggal] = useState("");
  const [formJenis, setFormJenis] = useState("");
  const [formMateri, setFormMateri] = useState("");
  const [formCatatan, setFormCatatan] = useState("");
  const [formRekomendasi, setFormRekomendasi] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Map dummy data to include a jenis field for filtering
  const dataWithJenis = useMemo(() => {
    return dummyCatatanBimbingan.map((item, i) => ({
      ...item,
      jenis: (["kunjungan", "online", "telepon"] as const)[i % 3],
      rekomendasi: item.catatan_tindak_lanjut || "-",
    }));
  }, []);

  const filteredData = useMemo(() => {
    if (!filterJenis) return dataWithJenis;
    return dataWithJenis.filter((c) => c.jenis === filterJenis);
  }, [filterJenis, dataWithJenis]);

  const columns: Column<(typeof dataWithJenis)[0]>[] = [
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
      key: "jenis",
      label: "Jenis",
      align: "center",
      sortable: true,
      render: (item) => (
        <Chip size="sm" color={jenisColors[item.jenis] || "default"} variant="flat">
          {jenisLabels[item.jenis] || item.jenis}
        </Chip>
      ),
    },
    {
      key: "topik",
      label: "Materi",
      sortable: true,
      render: (item) => (
        <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1" title={item.isi_bimbingan}>
          {item.topik}
        </span>
      ),
    },
    {
      key: "rekomendasi",
      label: "Rekomendasi",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{item.rekomendasi}</span>,
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <Button size="sm" variant="flat" color="primary" onPress={() => toast.success(`Detail bimbingan: ${item.topik}`)}>
          Detail
        </Button>
      ),
    },
  ];

  const handleSubmit = () => {
    toast.success("Catatan bimbingan berhasil ditambahkan");
    setShowSlideOver(false);
    setFormTanggal("");
    setFormJenis("");
    setFormMateri("");
    setFormCatatan("");
    setFormRekomendasi("");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Bimbingan DPL"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Catatan Bimbingan DPL</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Riwayat bimbingan dengan Dosen Pembimbing Lapangan</p>
          </div>
          <Button color="primary" startContent={<FiPlus className="w-4 h-4" />} onPress={() => setShowSlideOver(true)}>
            Tambah Catatan
          </Button>
        </div>

        {/* DataTable */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            <DataTable
              data={filteredData}
              columns={columns}
              searchable={true}
              searchKeys={["topik", "isi_bimbingan", "nm_dosen"]}
              searchPlaceholder="Cari catatan bimbingan..."
              filterSlot={
                <div className="flex gap-2">
                  <select
                    className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value)}
                  >
                    <option value="">Semua Jenis</option>
                    {Object.entries(jenisLabels).map(([key, label]) => (
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tambah Catatan Bimbingan</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Bimbingan</label>
                <select
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value)}
                >
                  <option value="">Pilih Jenis</option>
                  {Object.entries(jenisLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Materi Bimbingan</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Materi yang dibahas..."
                  value={formMateri}
                  onChange={(e) => setFormMateri(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Catatan tambahan..."
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rekomendasi</label>
                <textarea
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Rekomendasi tindak lanjut..."
                  value={formRekomendasi}
                  onChange={(e) => setFormRekomendasi(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button color="primary" className="flex-1" onPress={handleSubmit}>
                  Simpan Catatan
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
