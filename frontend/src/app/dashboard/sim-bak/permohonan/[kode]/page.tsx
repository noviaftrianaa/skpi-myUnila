"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUpload, FiCheck, FiChevronLeft, FiChevronRight, FiFile, FiX, FiSave, FiSend, FiAlertCircle, FiInfo } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { getJenisLayananPublic, getPersyaratanByLayanan, getTahapanByLayanan, createPengajuan, uploadDokumen, ajukanPengajuan } from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan, PersyaratanLayanan, TahapanLayanan } from "@/lib/services/sim-bak/types";

const steps = [
  { no: 1, label: "Data & Alasan" },
  { no: 2, label: "Upload Dokumen" },
  { no: 3, label: "Review & Submit" },
];

export default function PermohonanFormPage() {
  useRequireAuth();
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const kode = params.kode as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [layanan, setLayanan] = useState<JenisLayanan | null>(null);
  const [persyaratan, setPersyaratan] = useState<PersyaratanLayanan[]>([]);
  const [tahapan, setTahapan] = useState<TahapanLayanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [catatan, setCatatan] = useState("");
  // Cuti-specific
  const [jumlahSemesterCuti, setJumlahSemesterCuti] = useState<number>(1);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const allLayanan = await getJenisLayananPublic();
        const found = allLayanan.find(j => j.kode_layanan === kode);
        setLayanan(found ?? null);
        if (found) {
          const [p, t] = await Promise.all([
            getPersyaratanByLayanan(found.id_jenis_layanan),
            getTahapanByLayanan(found.id_jenis_layanan),
          ]);
          setPersyaratan((p ?? []).sort((a, b) => a.urutan - b.urutan));
          setTahapan(t ?? []);
        }
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user, kode]);

  if (!user || loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (!layanan) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center py-20">
          <FiAlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500">Jenis layanan <span className="font-mono font-bold">{kode}</span> tidak ditemukan.</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/permohonan")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const isCuti = kode === "PM-CUTI";
  const dataPemohon = { nama: user?.nm_pengguna ?? "-", npm: user?.username ?? "-", prodi: "-", fakultas: "-", semester: "-", ipk: "-" };

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && !alasan.trim()) { toast.error("Alasan permohonan wajib diisi"); return; }
    setSubmitting(true);
    try {
      const pengajuan = await createPengajuan({
        id_jenis_layanan: layanan.id_jenis_layanan,
        alasan,
        catatan_pemohon: catatan || undefined,
        jumlah_semester_cuti: isCuti ? jumlahSemesterCuti : undefined,
      });

      for (const [kodeDok, file] of Object.entries(uploadedFiles)) {
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("nm_dokumen", persyaratan.find(p => p.kode_dokumen === kodeDok)?.nm_dokumen ?? file.name);
        const match = persyaratan.find(p => p.kode_dokumen === kodeDok);
        if (match) formData.append("id_persyaratan", match.id_persyaratan);
        await uploadDokumen(pengajuan.id_pengajuan, formData);
      }

      if (!isDraft) {
        await ajukanPengajuan(pengajuan.id_pengajuan);
        toast.success("Permohonan berhasil diajukan!");
      } else {
        toast.success("Draft disimpan");
      }
      setTimeout(() => router.push("/dashboard/sim-bak/riwayat"), 1500);
    } catch (e) {
      toast.error("Gagal: " + (e instanceof Error ? e.message : "Error"));
    } finally { setSubmitting(false); }
  };

  const allRequiredUploaded = persyaratan.filter(p => p.a_wajib).every(p => uploadedFiles[p.kode_dokumen]);

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Permohonan ${layanan.nm_layanan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permohonan {layanan.nm_layanan}</h1>
          <p className="text-sm text-gray-500 mt-1">{layanan.deskripsi}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0">
          {steps.map((step, idx) => (
            <div key={step.no} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${currentStep > step.no ? "bg-green-500 border-green-500 text-white" : currentStep === step.no ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"}`}>
                  {currentStep > step.no ? <FiCheck className="w-5 h-5" /> : step.no}
                </div>
                <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${currentStep >= step.no ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>{step.label}</span>
              </div>
              {idx < steps.length - 1 && <div className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 ${currentStep > step.no ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Data + Alasan */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Tahapan info */}
            {tahapan.length > 0 && (
              <Card className="shadow-sm rounded-xl border border-blue-100 dark:border-blue-900">
                <CardBody className="p-4">
                  <div className="flex items-start gap-2">
                    <FiInfo className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Alur proses ({tahapan.length} tahap)</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tahapan.map((t, i) => (
                          <span key={t.id_tahapan} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {i + 1}. {t.nm_tahapan}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            <Card className="shadow-md rounded-xl"><CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Pemohon</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {Object.entries(dataPemohon).map(([label, value]) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 mb-0.5 capitalize">{label}</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alasan Permohonan *</label>
                  <textarea value={alasan} onChange={e => setAlasan(e.target.value)} rows={4}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Jelaskan alasan permohonan Anda..." />
                </div>

                {isCuti && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah Semester Cuti</label>
                    <select value={jumlahSemesterCuti} onChange={e => setJumlahSemesterCuti(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value={1}>1 Semester</option>
                      <option value={2}>2 Semester</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tambahan</label>
                  <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Catatan tambahan (opsional)..." />
                </div>
              </div>
            </CardBody></Card>
          </div>
        )}

        {/* Step 2: Upload */}
        {currentStep === 2 && (
          <Card className="shadow-md rounded-xl"><CardBody className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Upload Dokumen Persyaratan</h2>
            <p className="text-sm text-gray-500 mb-6">{persyaratan.length} dokumen diperlukan</p>
            <div className="space-y-4">
              {persyaratan.map(req => (
                <div key={req.id_persyaratan} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{req.nm_dokumen}</span>
                      {req.a_wajib && <Chip color="danger" variant="flat" size="sm">Wajib</Chip>}
                    </div>
                    <span className="text-xs text-gray-400">Maks {req.max_size_mb} MB</span>
                  </div>
                  {uploadedFiles[req.kode_dokumen] ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        <FiFile className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-green-700 dark:text-green-300">{uploadedFiles[req.kode_dokumen]!.name}</p>
                      </div>
                      <button onClick={() => handleFileChange(req.kode_dokumen, null)} className="p-1 rounded-full hover:bg-green-100"><FiX className="w-4 h-4 text-green-600" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                      onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFileChange(req.kode_dokumen, e.dataTransfer.files[0]); }}>
                      <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Drag & drop atau <span className="text-blue-600 font-medium">pilih file</span></p>
                      <input type="file" className="hidden" accept={req.tipe_file} onChange={e => handleFileChange(req.kode_dokumen, e.target.files?.[0] || null)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </CardBody></Card>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Card className="shadow-md rounded-xl"><CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ringkasan</h2>
              <Chip color="primary" variant="flat" size="sm" className="mb-3">{layanan.nm_layanan}</Chip>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Alasan:</p>
                <p className="text-sm text-gray-900 dark:text-white">{alasan || "-"}</p>
              </div>
              {isCuti && <p className="text-sm text-gray-600 mb-4">Jumlah semester cuti: <strong>{jumlahSemesterCuti}</strong></p>}
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dokumen ({Object.values(uploadedFiles).filter(Boolean).length}/{persyaratan.length})</h3>
              <div className="space-y-2">
                {persyaratan.map(req => (
                  <div key={req.id_persyaratan} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{req.nm_dokumen}</span>
                    <Chip color={uploadedFiles[req.kode_dokumen] ? "success" : req.a_wajib ? "danger" : "default"} variant="flat" size="sm">
                      {uploadedFiles[req.kode_dokumen] ? "✓" : req.a_wajib ? "!" : "-"}
                    </Chip>
                  </div>
                ))}
              </div>
            </CardBody></Card>
            <div className="flex gap-3 justify-end">
              <Button variant="flat" startContent={<FiSave className="w-4 h-4" />} isLoading={submitting} onPress={() => handleSubmit(true)}>Simpan Draft</Button>
              <Button color="primary" startContent={<FiSend className="w-4 h-4" />} isDisabled={!allRequiredUploaded || !alasan.trim()} isLoading={submitting} onPress={() => handleSubmit(false)}>Ajukan</Button>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between pt-2">
          <Button variant="flat" startContent={<FiChevronLeft className="w-4 h-4" />} isDisabled={currentStep === 1} onPress={() => setCurrentStep(s => Math.max(1, s - 1))}>Sebelumnya</Button>
          {currentStep < 3 && <Button color="primary" endContent={<FiChevronRight className="w-4 h-4" />} onPress={() => setCurrentStep(s => Math.min(3, s + 1))}>Selanjutnya</Button>}
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );

  function handleFileChange(kodeDokumen: string, file: File | null) {
    setUploadedFiles(prev => ({ ...prev, [kodeDokumen]: file }));
  }
}
