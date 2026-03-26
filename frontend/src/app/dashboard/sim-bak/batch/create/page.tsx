"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Button, Chip } from "@heroui/react";
import { FiAlertTriangle, FiClock, FiCheck, FiArrowLeft, FiArrowRight, FiUsers } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyKandidat } from "@/lib/services/sim-bak/dummyData";
import type { KandidatBatch } from "@/lib/services/sim-bak/types";
import toast, { Toaster } from "react-hot-toast";

const steps = [
  { num: 1, label: "Pilih Jenis SK" },
  { num: 2, label: "Preview Kandidat" },
  { num: 3, label: "Konfirmasi" },
];

export default function BatchCreatePage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [jenissk, setJenissk] = useState<"HABIS_MASA_MUKIM" | "PUTUS_STUDI" | "">("");
  const [periode, setPeriode] = useState("2025/2026 Genap");
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [catatan, setCatatan] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const kandidatData = dummyKandidat.map((k) => ({
    ...k,
    status_verifikasi: "belum_dicek" as const,
  }));

  const includedKandidat = kandidatData.filter((k) => !excludedIds.has(k.id_kandidat));

  const toggleExclude = (id: string) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    toast.success("Batch berhasil dibuat! Mengarahkan ke daftar batch...");
    setTimeout(() => router.push("/dashboard/sim-bak/batch"), 1500);
  };

  const kandidatColumns: Column<KandidatBatch>[] = [
    {
      key: "npm",
      label: "NPM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.npm}</span>,
    },
    {
      key: "nm_mahasiswa",
      label: "Nama",
      sortable: true,
      render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_mahasiswa}</span>,
    },
    {
      key: "nm_prodi",
      label: "Prodi",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_prodi}</span>,
    },
    {
      key: "nm_fakultas",
      label: "Fakultas",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_fakultas}</span>,
    },
    {
      key: "semester_terakhir",
      label: "Semester",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.semester_terakhir}</span>,
    },
    {
      key: "ipk_terakhir",
      label: "IPK",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.ipk_terakhir}</span>,
    },
    {
      key: "exclude",
      label: "Kecualikan",
      align: "center",
      render: (item) => (
        <input
          type="checkbox"
          checked={excludedIds.has(item.id_kandidat)}
          onChange={() => toggleExclude(item.id_kandidat)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle="Buat Batch Baru"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="light"
            isIconOnly
            onPress={() => router.push("/dashboard/sim-bak/batch")}
          >
            <FiArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Buat Batch Baru
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Wizard pembuatan batch penetapan baru
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep >= step.num
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {currentStep > step.num ? <FiCheck className="w-5 h-5" /> : step.num}
                </div>
                <span
                  className={`text-xs mt-1.5 whitespace-nowrap ${
                    currentStep >= step.num
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${
                    currentStep > step.num ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-6">
            {/* Step 1: Select Jenis SK */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pilih Jenis SK dan Periode
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* HMM Card */}
                  <button
                    type="button"
                    onClick={() => setJenissk("HABIS_MASA_MUKIM")}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      jenissk === "HABIS_MASA_MUKIM"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${jenissk === "HABIS_MASA_MUKIM" ? "bg-amber-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                        <FiClock className="w-6 h-6" />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${jenissk === "HABIS_MASA_MUKIM" ? "border-amber-500" : "border-gray-300 dark:border-gray-600"}`}>
                        {jenissk === "HABIS_MASA_MUKIM" && <div className="w-3 h-3 rounded-full bg-amber-500" />}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Habis Masa Mukim (HMM)</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Penetapan mahasiswa yang melampaui batas waktu studi (&gt;14 semester)
                    </p>
                  </button>

                  {/* Putus Studi Card */}
                  <button
                    type="button"
                    onClick={() => setJenissk("PUTUS_STUDI")}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      jenissk === "PUTUS_STUDI"
                        ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${jenissk === "PUTUS_STUDI" ? "bg-rose-500 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                        <FiAlertTriangle className="w-6 h-6" />
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${jenissk === "PUTUS_STUDI" ? "border-rose-500" : "border-gray-300 dark:border-gray-600"}`}>
                        {jenissk === "PUTUS_STUDI" && <div className="w-3 h-3 rounded-full bg-rose-500" />}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Putus Studi</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Penetapan mahasiswa yang tidak registrasi 2 semester berturut-turut
                    </p>
                  </button>
                </div>

                {/* Periode Akademik */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Periode Akademik
                  </label>
                  <input
                    type="text"
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    placeholder="Contoh: 2025/2026 Genap"
                    className="w-full sm:w-80 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Preview Kandidat */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Preview Kandidat
                  </h2>
                  <Chip size="sm" variant="flat" color="primary">
                    {includedKandidat.length} kandidat terpilih
                  </Chip>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Centang kolom &quot;Kecualikan&quot; untuk mengeluarkan mahasiswa dari batch
                </p>
                <DataTable
                  data={kandidatData}
                  columns={kandidatColumns}
                  searchable={true}
                  searchKeys={["npm", "nm_mahasiswa", "nm_prodi", "nm_fakultas"]}
                  searchPlaceholder="Cari kandidat..."
                  noWrapper
                />
              </div>
            )}

            {/* Step 3: Confirm & Submit */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Konfirmasi & Submit
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jenis SK</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                      {jenissk === "HABIS_MASA_MUKIM" ? "Habis Masa Mukim (HMM)" : "Putus Studi"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Periode Akademik</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{periode}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Kandidat</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{kandidatData.length}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dikecualikan</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{excludedIds.size}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <FiUsers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {includedKandidat.length} mahasiswa akan masuk ke batch
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Catatan (opsional)
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={3}
                    placeholder="Tambahkan catatan untuk batch ini..."
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="flat"
            startContent={<FiArrowLeft className="w-4 h-4" />}
            onPress={() => {
              if (currentStep === 1) router.push("/dashboard/sim-bak/batch");
              else setCurrentStep((s) => s - 1);
            }}
          >
            {currentStep === 1 ? "Kembali" : "Sebelumnya"}
          </Button>

          {currentStep < 3 ? (
            <Button
              color="primary"
              endContent={<FiArrowRight className="w-4 h-4" />}
              isDisabled={currentStep === 1 && (!jenissk || !periode)}
              onPress={() => setCurrentStep((s) => s + 1)}
            >
              Selanjutnya
            </Button>
          ) : (
            <Button
              color="primary"
              startContent={<FiCheck className="w-4 h-4" />}
              onPress={handleSubmit}
            >
              Buat Batch
            </Button>
          )}
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
