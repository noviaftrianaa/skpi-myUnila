"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUpload, FiCheck, FiChevronLeft, FiChevronRight, FiFile, FiX, FiSave, FiSend } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { dummyJenisLayanan, dummyPersyaratan } from "@/lib/services/sim-bak/dummyData";
import type { PersyaratanLayanan } from "@/lib/services/sim-bak/types";

const steps = [
  { no: 1, label: "Data Pemohon" },
  { no: 2, label: "Upload Dokumen" },
  { no: 3, label: "Review & Submit" },
];

// Dummy pemohon data (would come from auth/profile in production)
const dataPemohon = {
  nama: "Andi Pratama",
  npm: "2201011100",
  prodi: "Teknik Informatika",
  fakultas: "Fakultas Teknik",
  semester: 6,
  ipk: 3.45,
};

export default function SuratMandiriFormPage() {
  useRequireAuth();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const kode = params.kode as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});

  const layanan = useMemo(
    () => dummyJenisLayanan.find((j) => j.kode_layanan === kode),
    [kode]
  );

  const persyaratan = useMemo(
    () =>
      layanan
        ? dummyPersyaratan
            .filter((p) => p.id_jenis_layanan === layanan.id_jenis_layanan)
            .sort((a, b) => a.urutan - b.urutan)
        : [],
    [layanan]
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!layanan) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="SI MBAK"
        appIcon={<MdDashboard className="w-6 h-6" />}
        appKey="sim-bak"
        fallbackMenus={simBakMenuConfig}
        pageTitle="Layanan Tidak Ditemukan"
      >
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Jenis layanan dengan kode <span className="font-mono font-bold">{kode}</span> tidak ditemukan.
          </p>
          <Button
            className="mt-4"
            variant="flat"
            color="primary"
            onPress={() => router.push("/dashboard/sim-bak/surat-mandiri")}
          >
            Kembali
          </Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const handleFileChange = (kodeDokumen: string, file: File | null) => {
    setUploadedFiles((prev) => ({ ...prev, [kodeDokumen]: file }));
  };

  const handleSubmit = (isDraft: boolean) => {
    if (isDraft) {
      toast.success("Draft berhasil disimpan");
    } else {
      toast.success("Pengajuan berhasil diajukan! Anda akan diarahkan ke halaman riwayat.");
    }
    setTimeout(() => {
      router.push("/dashboard/sim-bak/riwayat");
    }, 1500);
  };

  const allRequiredUploaded = persyaratan
    .filter((p) => p.apakah_wajib)
    .every((p) => uploadedFiles[p.kode_dokumen]);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle={`Pengajuan ${layanan.nm_layanan}`}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Pengajuan {layanan.nm_layanan}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {layanan.deskripsi}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, idx) => (
            <div key={step.no} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                    currentStep > step.no
                      ? "bg-green-500 border-green-500 text-white"
                      : currentStep === step.no
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {currentStep > step.no ? <FiCheck className="w-5 h-5" /> : step.no}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                    currentStep >= step.no
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${
                    currentStep > step.no
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Data Pemohon */}
        {currentStep === 1 && (
          <Card className="shadow-md rounded-xl">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Data Pemohon
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Data berikut diambil dari profil Anda. Pastikan data sudah benar sebelum melanjutkan.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nama Lengkap", value: dataPemohon.nama },
                  { label: "NPM", value: dataPemohon.npm },
                  { label: "Program Studi", value: dataPemohon.prodi },
                  { label: "Fakultas", value: dataPemohon.fakultas },
                  { label: "Semester", value: dataPemohon.semester },
                  { label: "IPK", value: dataPemohon.ipk.toFixed(2) },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {item.label}
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Step 2: Upload Dokumen */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <Card className="shadow-md rounded-xl">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Upload Dokumen Persyaratan
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Upload semua dokumen yang diperlukan. Dokumen bertanda wajib harus dilengkapi.
                </p>
                <div className="space-y-4">
                  {persyaratan.map((req) => (
                    <UploadCard
                      key={req.id_persyaratan}
                      persyaratan={req}
                      file={uploadedFiles[req.kode_dokumen] || null}
                      onFileChange={(file) => handleFileChange(req.kode_dokumen, file)}
                    />
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {/* Review - Data Pemohon */}
            <Card className="shadow-md rounded-xl">
              <CardBody className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Ringkasan Pengajuan
                </h2>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Jenis Layanan
                  </h3>
                  <Chip color="primary" variant="flat" size="sm">
                    {layanan.nm_layanan}
                  </Chip>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Nama", value: dataPemohon.nama },
                    { label: "NPM", value: dataPemohon.npm },
                    { label: "Prodi", value: dataPemohon.prodi },
                    { label: "Fakultas", value: dataPemohon.fakultas },
                    { label: "Semester", value: dataPemohon.semester },
                    { label: "IPK", value: dataPemohon.ipk.toFixed(2) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 min-w-[80px]">
                        {item.label}:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Review - Dokumen */}
            <Card className="shadow-md rounded-xl">
              <CardBody className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Dokumen yang Diupload
                </h3>
                <div className="space-y-2">
                  {persyaratan.map((req) => {
                    const file = uploadedFiles[req.kode_dokumen];
                    return (
                      <div
                        key={req.id_persyaratan}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <FiFile className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {req.nm_persyaratan}
                            </p>
                            {file && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {file.name} ({(file.size / 1024).toFixed(0)} KB)
                              </p>
                            )}
                          </div>
                        </div>
                        {file ? (
                          <Chip color="success" variant="flat" size="sm">
                            Uploaded
                          </Chip>
                        ) : (
                          <Chip
                            color={req.apakah_wajib ? "danger" : "default"}
                            variant="flat"
                            size="sm"
                          >
                            {req.apakah_wajib ? "Belum Upload" : "Opsional"}
                          </Chip>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                variant="flat"
                startContent={<FiSave className="w-4 h-4" />}
                onPress={() => handleSubmit(true)}
              >
                Simpan Draft
              </Button>
              <Button
                color="primary"
                startContent={<FiSend className="w-4 h-4" />}
                isDisabled={!allRequiredUploaded}
                onPress={() => handleSubmit(false)}
              >
                Ajukan Pengajuan
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-2">
          <Button
            variant="flat"
            startContent={<FiChevronLeft className="w-4 h-4" />}
            isDisabled={currentStep === 1}
            onPress={() => setCurrentStep((s) => Math.max(1, s - 1))}
          >
            Sebelumnya
          </Button>
          {currentStep < 3 && (
            <Button
              color="primary"
              endContent={<FiChevronRight className="w-4 h-4" />}
              onPress={() => setCurrentStep((s) => Math.min(3, s + 1))}
            >
              Selanjutnya
            </Button>
          )}
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}

// ---- Upload Card Component ----

function UploadCard({
  persyaratan,
  file,
  onFileChange,
}: {
  persyaratan: PersyaratanLayanan;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileChange(droppedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {persyaratan.nm_persyaratan}
          </span>
          {persyaratan.apakah_wajib && (
            <Chip color="danger" variant="flat" size="sm">
              Wajib
            </Chip>
          )}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Maks {persyaratan.ukuran_maks_mb} MB
        </span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
        Format: {persyaratan.tipe_file.split(",").map((t) => t.split("/")[1]).join(", ")}
      </p>

      {file ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <FiFile className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                {file.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
          </div>
          <button
            onClick={() => onFileChange(null)}
            className="p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
          >
            <FiX className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <FiUpload className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag & drop file atau{" "}
            <span className="text-blue-600 dark:text-blue-400 font-medium">pilih file</span>
          </p>
          <input
            type="file"
            className="hidden"
            accept={persyaratan.tipe_file}
            onChange={handleInputChange}
          />
        </label>
      )}
    </div>
  );
}
