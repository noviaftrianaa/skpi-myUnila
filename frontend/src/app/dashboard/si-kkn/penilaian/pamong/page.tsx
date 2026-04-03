"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Button } from "@heroui/react";
import { FiX } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyPenilaianPamong } from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

const nilaiColorClass = (val: number): string => {
  if (val >= 90) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (val >= 80) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  if (val >= 70) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
  if (val >= 60) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
};

export default function PenilaianPamongPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [showSlideOver, setShowSlideOver] = useState(false);
  const [editItem, setEditItem] = useState<(typeof dummyPenilaianPamong)[0] | null>(null);

  // Form state
  const [formKehadiran, setFormKehadiran] = useState("");
  const [formPartisipasi, setFormPartisipasi] = useState("");
  const [formSikap, setFormSikap] = useState("");
  const [formKontribusi, setFormKontribusi] = useState("");
  const [formCatatan, setFormCatatan] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleEdit = (item: (typeof dummyPenilaianPamong)[0]) => {
    setEditItem(item);
    setFormKehadiran(item.nilai_kehadiran.toFixed(0));
    setFormPartisipasi(item.nilai_kerjasama.toFixed(0));
    setFormSikap(item.nilai_sikap.toFixed(0));
    setFormKontribusi(item.nilai_inisiatif.toFixed(0));
    setFormCatatan(item.catatan || "");
    setShowSlideOver(true);
  };

  const renderNilaiBadge = (val: number) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${nilaiColorClass(val)}`}>
      {val.toFixed(0)}
    </span>
  );

  const columns: Column<(typeof dummyPenilaianPamong)[0]>[] = [
    {
      key: "nm_mahasiswa",
      label: "Nama Mahasiswa",
      sortable: true,
      render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_mahasiswa}</span>,
    },
    {
      key: "npm",
      label: "NPM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{item.npm}</span>,
    },
    {
      key: "nilai_kehadiran",
      label: "Kehadiran",
      align: "center",
      sortable: true,
      render: (item) => renderNilaiBadge(item.nilai_kehadiran),
    },
    {
      key: "nilai_kerjasama",
      label: "Partisipasi",
      align: "center",
      sortable: true,
      render: (item) => renderNilaiBadge(item.nilai_kerjasama),
    },
    {
      key: "nilai_sikap",
      label: "Sikap",
      align: "center",
      sortable: true,
      render: (item) => renderNilaiBadge(item.nilai_sikap),
    },
    {
      key: "nilai_inisiatif",
      label: "Kontribusi",
      align: "center",
      sortable: true,
      render: (item) => renderNilaiBadge(item.nilai_inisiatif),
    },
    {
      key: "nilai_rata_rata",
      label: "Rata-rata",
      align: "center",
      sortable: true,
      render: (item) => (
        <span className="text-sm font-bold text-gray-900 dark:text-white">{item.nilai_rata_rata.toFixed(1)}</span>
      ),
    },
    {
      key: "catatan",
      label: "Catatan",
      render: (item) => <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{item.catatan || "-"}</span>,
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "center",
      render: (item) => (
        <Button size="sm" variant="flat" color="primary" onPress={() => handleEdit(item)}>
          Edit
        </Button>
      ),
    },
  ];

  const handleSubmit = () => {
    toast.success(`Penilaian pamong untuk ${editItem?.nm_mahasiswa} berhasil disimpan`);
    setShowSlideOver(false);
    setEditItem(null);
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Penilaian Pamong"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Penilaian Pamong</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Penilaian dari pamong desa terhadap mahasiswa KKN</p>
        </div>

        {/* DataTable */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            <DataTable
              data={dummyPenilaianPamong}
              columns={columns}
              searchable={true}
              searchKeys={["nm_mahasiswa", "npm", "nm_pamong"]}
              searchPlaceholder="Cari mahasiswa..."
            />
          </CardBody>
        </Card>
      </div>

      {/* Slide-over Panel */}
      {showSlideOver && editItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowSlideOver(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Penilaian Pamong</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{editItem.nm_mahasiswa} ({editItem.npm})</p>
              </div>
              <button onClick={() => setShowSlideOver(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kehadiran (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formKehadiran}
                  onChange={(e) => setFormKehadiran(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Partisipasi (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formPartisipasi}
                  onChange={(e) => setFormPartisipasi(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sikap (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formSikap}
                  onChange={(e) => setFormSikap(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kontribusi (0-100)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={formKontribusi}
                  onChange={(e) => setFormKontribusi(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Catatan penilaian..."
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button color="primary" className="flex-1" onPress={handleSubmit}>
                  Simpan Penilaian
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
