"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Button, Textarea, Chip } from "@heroui/react";
import { FiCheck, FiX, FiChevronRight, FiChevronLeft, FiSend, FiUser, FiMapPin, FiClipboard } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/react";
import {
  dummyWilayahKkn,
  dummyKriteriaPendaftaran,
} from "@/lib/services/si-kkn/dummyData";

const steps = [
  { id: 1, title: "Data Mahasiswa", icon: <FiUser className="w-4 h-4" /> },
  { id: 2, title: "Verifikasi Syarat", icon: <FiClipboard className="w-4 h-4" /> },
  { id: 3, title: "Konfirmasi & Ajukan", icon: <FiSend className="w-4 h-4" /> },
];

// Simulated mahasiswa data
const mahasiswaData = {
  nama: "Ahmad Fauzi",
  npm: "2201011107",
  prodi: "Teknik Informatika",
  fakultas: "Fakultas Teknik",
  semester: 7,
  ipk: 3.25,
  total_sks: 120,
  status_ukt: "Lunas",
};

// Simulated verification results
const verifikasiData = dummyKriteriaPendaftaran.map((kr) => ({
  ...kr,
  nilai_aktual:
    kr.kode_kriteria === "MIN_SKS" ? "120" :
    kr.kode_kriteria === "MIN_IPK" ? "3.25" :
    kr.kode_kriteria === "LUNAS_UKT" ? "true" :
    kr.kode_kriteria === "MIN_SEMESTER" ? "7" :
    kr.kode_kriteria === "MAX_SEMESTER" ? "7" :
    kr.kode_kriteria === "STATUS_AKTIF" ? "true" : "-",
  terpenuhi: true,
}));

export default function DaftarKknPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [wilayah1, setWilayah1] = useState("");
  const [wilayah2, setWilayah2] = useState("");
  const [alasan, setAlasan] = useState("");

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleSubmit = () => {
    addToast({
      title: "Pendaftaran Berhasil",
      description: "Pendaftaran KKN Anda telah berhasil diajukan. Silakan tunggu verifikasi dari admin.",
      color: "success",
    });
    setTimeout(() => router.push("/dashboard/si-kkn/pendaftaran"), 1500);
  };

  const allSyaratMet = verifikasiData.every((v) => v.terpenuhi);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Formulir Pendaftaran KKN"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Formulir Pendaftaran KKN</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lengkapi data dan ajukan pendaftaran KKN</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => {
                  if (step.id < currentStep) setCurrentStep(step.id);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full
                  ${currentStep === step.id
                    ? "bg-blue-500 text-white shadow-lg"
                    : currentStep > step.id
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                  }`}
              >
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-xs font-bold">
                  {currentStep > step.id ? <FiCheck className="w-3.5 h-3.5" /> : step.id}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
              {idx < steps.length - 1 && (
                <FiChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Data Mahasiswa */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <Card className="border-none shadow-lg rounded-xl overflow-hidden">
              <CardBody className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiUser className="w-5 h-5 text-blue-500" />
                  Data Mahasiswa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Nama Lengkap", value: mahasiswaData.nama },
                    { label: "NPM", value: mahasiswaData.npm },
                    { label: "Program Studi", value: mahasiswaData.prodi },
                    { label: "Fakultas", value: mahasiswaData.fakultas },
                    { label: "Semester", value: `Semester ${mahasiswaData.semester}` },
                    { label: "IPK", value: mahasiswaData.ipk.toFixed(2) },
                    { label: "Total SKS", value: `${mahasiswaData.total_sks} SKS` },
                    { label: "Status UKT", value: mahasiswaData.status_ukt },
                  ].map((item) => (
                    <div key={item.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="border-none shadow-lg rounded-xl overflow-hidden">
              <CardBody className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-emerald-500" />
                  Pilihan Wilayah
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Pilihan Wilayah 1 <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      value={wilayah1}
                      onChange={(e) => setWilayah1(e.target.value)}
                    >
                      <option value="">-- Pilih Wilayah --</option>
                      {dummyWilayahKkn.filter((w) => w.apakah_aktif).map((w) => (
                        <option key={w.id_wilayah} value={w.id_wilayah}>{w.nm_wilayah} ({w.nm_kabupaten})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Pilihan Wilayah 2
                    </label>
                    <select
                      className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      value={wilayah2}
                      onChange={(e) => setWilayah2(e.target.value)}
                    >
                      <option value="">-- Pilih Wilayah --</option>
                      {dummyWilayahKkn.filter((w) => w.apakah_aktif && w.id_wilayah !== wilayah1).map((w) => (
                        <option key={w.id_wilayah} value={w.id_wilayah}>{w.nm_wilayah} ({w.nm_kabupaten})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-end">
              <Button
                color="primary"
                endContent={<FiChevronRight className="w-4 h-4" />}
                onPress={() => setCurrentStep(2)}
                isDisabled={!wilayah1}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Verifikasi Syarat */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Card className="border-none shadow-lg rounded-xl overflow-hidden">
              <CardBody className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiClipboard className="w-5 h-5 text-amber-500" />
                  Verifikasi Syarat Pendaftaran
                </h3>
                <div className="space-y-3">
                  {verifikasiData.map((v) => (
                    <div
                      key={v.id_kriteria}
                      className={`flex items-center gap-3 p-4 rounded-lg border ${
                        v.terpenuhi
                          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                      }`}
                    >
                      {v.terpenuhi ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <FiCheck className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <FiX className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{v.nm_kriteria}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{v.deskripsi}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400 dark:text-gray-500">Min: {v.nilai_minimum}</p>
                        <p className={`text-sm font-semibold ${v.terpenuhi ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                          Aktual: {v.nilai_aktual === "true" ? "Ya" : v.nilai_aktual}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {!allSyaratMet && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">Beberapa syarat belum terpenuhi. Anda tidak dapat melanjutkan pendaftaran.</p>
                  </div>
                )}
              </CardBody>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="flat"
                startContent={<FiChevronLeft className="w-4 h-4" />}
                onPress={() => setCurrentStep(1)}
              >
                Sebelumnya
              </Button>
              <Button
                color="primary"
                endContent={<FiChevronRight className="w-4 h-4" />}
                onPress={() => setCurrentStep(3)}
                isDisabled={!allSyaratMet}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Konfirmasi & Ajukan */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Card className="border-none shadow-lg rounded-xl overflow-hidden">
              <CardBody className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiSend className="w-5 h-5 text-blue-500" />
                  Ringkasan Pendaftaran
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nama</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{mahasiswaData.nama}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">NPM</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{mahasiswaData.npm}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pilihan Wilayah 1</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {dummyWilayahKkn.find((w) => w.id_wilayah === wilayah1)?.nm_wilayah || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pilihan Wilayah 2</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {dummyWilayahKkn.find((w) => w.id_wilayah === wilayah2)?.nm_wilayah || "Tidak dipilih"}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Syarat Pendaftaran</p>
                  <Chip size="sm" variant="flat" color="success">{verifikasiData.filter((v) => v.terpenuhi).length}/{verifikasiData.length} Terpenuhi</Chip>
                </div>

                <Textarea
                  label="Alasan / Catatan (opsional)"
                  placeholder="Tuliskan alasan atau catatan tambahan untuk pendaftaran Anda..."
                  value={alasan}
                  onValueChange={setAlasan}
                  minRows={3}
                  className="mb-2"
                />
              </CardBody>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="flat"
                startContent={<FiChevronLeft className="w-4 h-4" />}
                onPress={() => setCurrentStep(2)}
              >
                Sebelumnya
              </Button>
              <Button
                color="primary"
                endContent={<FiSend className="w-4 h-4" />}
                onPress={handleSubmit}
              >
                Ajukan Pendaftaran
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
