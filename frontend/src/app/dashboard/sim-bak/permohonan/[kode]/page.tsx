"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Button, Chip } from "@heroui/react";
import { FiArrowLeft, FiArrowRight, FiCheck, FiUpload, FiInfo } from "react-icons/fi";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { dummyJenisLayanan, dummyPersyaratan, prodiList } from "@/lib/services/sim-bak/dummyData";

const stepLabels = ["Data & Informasi", "Upload Dokumen", "Konfirmasi"];

const alasanCutiOptions = ["Sakit", "Keuangan", "Keluarga", "Lainnya"];

export default function PermohonanFormPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const kode = params.kode as string;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    catatan: "",
    // CUTI fields
    semester_cuti: 1,
    alasan_cuti: "",
    // UNDUR_DIRI fields
    alasan_undur_diri: "",
    pernyataan_ortu: false,
    // ALIH_PROGRAM fields
    prodi_tujuan: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const layanan = dummyJenisLayanan.find((j) => j.kode_layanan === kode);
  const persyaratan = dummyPersyaratan.filter((p) => p.id_jenis_layanan === layanan?.id_jenis_layanan);

  const handleFileChange = (kodeDoc: string, file: File | null) => {
    setUploadedFiles((prev) => ({ ...prev, [kodeDoc]: file }));
  };

  const canProceedStep0 = useMemo(() => {
    if (kode === "CUTI") return formData.alasan_cuti !== "";
    if (kode === "UNDUR_DIRI") return formData.alasan_undur_diri.trim() !== "" && formData.pernyataan_ortu;
    if (kode === "ALIH_PROGRAM") return formData.prodi_tujuan !== "";
    return true;
  }, [kode, formData]);

  const canProceedStep1 = useMemo(() => {
    const wajib = persyaratan.filter((p) => p.apakah_wajib);
    return wajib.every((p) => uploadedFiles[p.kode_dokumen]);
  }, [persyaratan, uploadedFiles]);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Permohonan berhasil diajukan! Silakan pantau status di halaman Riwayat.");
      setTimeout(() => router.push("/dashboard/sim-bak/permohonan"), 1500);
    }, 1500);
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (!layanan) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Permohonan">
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400">Layanan tidak ditemukan</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/permohonan")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Ajukan ${layanan.nm_layanan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/permohonan")}>
            <FiArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{layanan.nm_layanan}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{layanan.deskripsi}</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0">
          {stepLabels.map((label, idx) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  idx < currentStep ? "bg-green-500 text-white" : idx === currentStep ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                }`}>
                  {idx < currentStep ? <FiCheck className="w-5 h-5" /> : idx + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${idx === currentStep ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
                  {label}
                </span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${idx < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="shadow-md rounded-xl border-none">
          <CardBody className="p-6">
            {/* Step 1: Data & Information */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Permohonan</h2>

                {/* Type-specific fields */}
                {kode === "CUTI" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester Cuti <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        min={1}
                        max={2}
                        className="w-full sm:w-48 text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        value={formData.semester_cuti}
                        onChange={(e) => setFormData((prev) => ({ ...prev, semester_cuti: parseInt(e.target.value) || 1 }))}
                      />
                      <p className="text-xs text-gray-400 mt-1">Maksimal 2 semester cuti</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alasan Cuti <span className="text-red-500">*</span></label>
                      <select
                        className="w-full sm:w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        value={formData.alasan_cuti}
                        onChange={(e) => setFormData((prev) => ({ ...prev, alasan_cuti: e.target.value }))}
                      >
                        <option value="">Pilih alasan...</option>
                        {alasanCutiOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {kode === "UNDUR_DIRI" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alasan Pengunduran Diri <span className="text-red-500">*</span></label>
                      <textarea
                        rows={4}
                        className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        placeholder="Jelaskan alasan pengunduran diri Anda..."
                        value={formData.alasan_undur_diri}
                        onChange={(e) => setFormData((prev) => ({ ...prev, alasan_undur_diri: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        id="pernyataan_ortu"
                        className="mt-1"
                        checked={formData.pernyataan_ortu}
                        onChange={(e) => setFormData((prev) => ({ ...prev, pernyataan_ortu: e.target.checked }))}
                      />
                      <label htmlFor="pernyataan_ortu" className="text-sm text-gray-700 dark:text-gray-300">
                        Saya menyatakan bahwa orang tua/wali telah mengetahui dan menyetujui pengunduran diri ini <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </>
                )}

                {kode === "ALIH_PROGRAM" && (
                  <>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                      <FiInfo className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">Syarat: IPK minimal 2.75 dan minimal 40 SKS yang telah ditempuh</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi Tujuan <span className="text-red-500">*</span></label>
                      <select
                        className="w-full sm:w-80 text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        value={formData.prodi_tujuan}
                        onChange={(e) => setFormData((prev) => ({ ...prev, prodi_tujuan: e.target.value }))}
                      >
                        <option value="">Pilih program studi tujuan...</option>
                        {prodiList.map((prodi) => (
                          <option key={prodi.id} value={prodi.id}>{prodi.nama}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Common catatan field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tambahan</label>
                  <textarea
                    rows={3}
                    className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    placeholder="Catatan tambahan (opsional)..."
                    value={formData.catatan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, catatan: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Upload Documents */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Dokumen</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload dokumen persyaratan berikut. Dokumen bertanda <span className="text-red-500">*</span> wajib diupload.</p>

                <div className="space-y-4">
                  {persyaratan.map((req) => (
                    <div key={req.id_persyaratan} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {req.nm_persyaratan} {req.apakah_wajib && <span className="text-red-500">*</span>}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">Maks {req.ukuran_maks_mb} MB &middot; {req.tipe_file.split(",").map((t) => t.split("/").pop()?.toUpperCase()).join(", ")}</p>
                        </div>
                        {uploadedFiles[req.kode_dokumen] && (
                          <Chip size="sm" color="success" variant="flat">Uploaded</Chip>
                        )}
                      </div>
                      <div className="mt-3">
                        <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 hover:border-blue-400 transition-colors">
                          <FiUpload className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {uploadedFiles[req.kode_dokumen] ? uploadedFiles[req.kode_dokumen]!.name : "Pilih file..."}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept={req.tipe_file}
                            onChange={(e) => handleFileChange(req.kode_dokumen, e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Konfirmasi Pengajuan</h2>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-blue-800 dark:text-blue-300 mb-2">Ringkasan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Jenis Permohonan</span>
                      <span className="font-medium text-gray-900 dark:text-white">{layanan.nm_layanan}</span>
                    </div>
                    {kode === "CUTI" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Semester Cuti</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formData.semester_cuti} semester</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Alasan</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formData.alasan_cuti}</span>
                        </div>
                      </>
                    )}
                    {kode === "UNDUR_DIRI" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Alasan</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{formData.alasan_undur_diri}</span>
                      </div>
                    )}
                    {kode === "ALIH_PROGRAM" && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Prodi Tujuan</span>
                        <span className="font-medium text-gray-900 dark:text-white">{prodiList.find((p) => p.id === formData.prodi_tujuan)?.nama || "-"}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dokumen</span>
                      <span className="font-medium text-gray-900 dark:text-white">{Object.values(uploadedFiles).filter(Boolean).length} file</span>
                    </div>
                    {formData.catatan && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Catatan</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{formData.catatan}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                  <FiInfo className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Pastikan semua data dan dokumen sudah benar. Setelah diajukan, permohonan akan melewati proses verifikasi dan persetujuan bertahap.
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="flat"
            color="default"
            startContent={<FiArrowLeft className="w-4 h-4" />}
            onPress={() => {
              if (currentStep === 0) router.push("/dashboard/sim-bak/permohonan");
              else setCurrentStep((s) => s - 1);
            }}
          >
            {currentStep === 0 ? "Kembali" : "Sebelumnya"}
          </Button>
          {currentStep < 2 ? (
            <Button
              color="primary"
              endContent={<FiArrowRight className="w-4 h-4" />}
              isDisabled={currentStep === 0 ? !canProceedStep0 : !canProceedStep1}
              onPress={() => setCurrentStep((s) => s + 1)}
            >
              Selanjutnya
            </Button>
          ) : (
            <Button
              color="success"
              startContent={<FiCheck className="w-4 h-4" />}
              isLoading={isSubmitting}
              onPress={handleSubmit}
            >
              Ajukan Permohonan
            </Button>
          )}
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
