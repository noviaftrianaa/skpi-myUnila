"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUpload, FiCheck, FiChevronLeft, FiChevronRight, FiFile, FiX, FiSave, FiSend, FiAlertCircle, FiEye } from "react-icons/fi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { getJenisLayananPublic, getPersyaratanByLayanan, getMyProfile, createPengajuan, uploadDokumen, ajukanPengajuan, deleteDokumen } from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan, PersyaratanLayanan } from "@/lib/services/sim-bak/types";

const steps = [
  { no: 1, label: "Data Pemohon" },
  { no: 2, label: "Upload Dokumen" },
  { no: 3, label: "Review & Submit" },
];

export default function SuratMandiriFormPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const kode = params.kode as string;
  const editId = searchParams.get("edit"); // ID pengajuan draft yang akan dilanjutkan

  const [currentStep, setCurrentStep] = useState(editId ? 2 : 1); // Jika edit, langsung ke step upload
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [layanan, setLayanan] = useState<JenisLayanan | null>(null);
  const [persyaratan, setPersyaratan] = useState<PersyaratanLayanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: string } | null>(null);
  const [existingDokumen, setExistingDokumen] = useState<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [allLayanan, profile] = await Promise.all([
          getJenisLayananPublic(),
          getMyProfile().catch(() => null),
        ]);
        setProfileData(profile);
        const found = allLayanan.find(j => j.kode_layanan === kode);
        setLayanan(found ?? null);
        if (found) {
          const p = await getPersyaratanByLayanan(found.id_jenis_layanan);
          setPersyaratan((p ?? []).sort((a, b) => a.urutan - b.urutan));
        }
        // Mode edit: load dokumen yang sudah diupload sebelumnya
        if (editId) {
          const { getPengajuanDetail } = await import("@/lib/services/sim-bak/simBakService");
          const detail = await getPengajuanDetail(editId).catch(() => null);
          if (detail?.dokumen) {
            setExistingDokumen(detail.dokumen as Array<Record<string, unknown>>);
          }
        }
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user, kode, editId]);

  if (!user || loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  if (!layanan) {
    return (
      <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Layanan Tidak Ditemukan">
        <div className="flex flex-col items-center justify-center py-20">
          <FiAlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Jenis layanan dengan kode <span className="font-mono font-bold">{kode}</span> tidak ditemukan.</p>
          <Button className="mt-4" variant="flat" color="primary" onPress={() => router.push("/dashboard/sim-bak/surat-mandiri")}>Kembali</Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const dataPemohon = {
    nama: String(profileData?.nm_mahasiswa ?? user?.name ?? "-"),
    npm: String(profileData?.nim ?? user?.username ?? "-"),
    prodi: String(profileData?.nm_prodi ?? "-"),
    fakultas: String(profileData?.nm_fakultas ?? "-"),
    jenjang: String(profileData?.nm_jenjang ?? "-"),
    angkatan: String(profileData?.angkatan ?? "-"),
    semester: String(profileData?.semester_aktif ?? "-"),
    ipk: String(profileData?.ipk ?? "-"),
    sks_lulus: String(profileData?.sks_lulus ?? "-"),
    status: String(profileData?.status_registrasi ?? "-"),
  };

  const isPdutConnected = profileData?._pdut_connected === true;
  const statusRegistrasi = String(profileData?.status_registrasi ?? "").toLowerCase();
  const isHerregBlocked = kode === "SK-HERREG" && isPdutConnected && statusRegistrasi && !["aktif", "active", "a"].includes(statusRegistrasi);

  const handleFileChange = (kodeDokumen: string, file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [kodeDokumen]: file }));
  };

  const handleSubmit = async (isDraft: boolean) => {
    setSubmitting(true);
    try {
      // 1. Create pengajuan (skip jika mode edit — sudah ada)
      const pengajuanId = editId
        ? editId
        : (await createPengajuan({ id_jenis_layanan: layanan.id_jenis_layanan, catatan_pemohon: `Pengajuan ${layanan.nm_layanan}` })).id_pengajuan;

      // 2. Upload dokumen baru (yang dipilih user)
      for (const [kodeDok, file] of Object.entries(uploadedFiles)) {
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("nm_dokumen", persyaratan.find(p => p.kode_dokumen === kodeDok)?.nm_dokumen ?? file.name);
        const matchPersyaratan = persyaratan.find(p => p.kode_dokumen === kodeDok);
        if (matchPersyaratan) formData.append("id_persyaratan", matchPersyaratan.id_persyaratan);
        await uploadDokumen(pengajuanId, formData);
      }

      // 3. Submit if not draft
      if (!isDraft) {
        await ajukanPengajuan(pengajuanId);
        toast.success("Pengajuan berhasil diajukan!");
      } else {
        toast.success("Draft berhasil disimpan");
      }

      setTimeout(() => router.push("/dashboard/sim-bak/riwayat"), 1500);
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || (e instanceof Error ? e.message : "Gagal mengajukan");
      toast.error(msg, { duration: 5000 });
    } finally {
      setSubmitting(false);
    }
  };

  const allRequiredUploaded = persyaratan.filter(p => p.a_wajib).every(p =>
    uploadedFiles[p.kode_dokumen] || // file baru dipilih
    (editId && existingDokumen.some(d => d.id_persyaratan === p.id_persyaratan)) // sudah diupload sebelumnya
  );

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Pengajuan ${layanan.nm_layanan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{editId ? "Lanjutkan" : "Pengajuan"} {layanan.nm_layanan}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{editId ? "Lengkapi dokumen dan ajukan pengajuan Anda" : layanan.deskripsi}</p>
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

        {/* Step 1: Data Pemohon */}
        {currentStep === 1 && (
          <Card className="shadow-md rounded-xl"><CardBody className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Pemohon</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Data berikut diambil dari profil akademik Anda.</p>

            {!isPdutConnected && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-700 dark:text-amber-300">Data akademik belum tersedia dari sistem PDUT. Beberapa field mungkin kosong.</p>
              </div>
            )}

            {isHerregBlocked && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Anda tidak memenuhi syarat untuk layanan ini. Status registrasi Anda saat ini: <span className="font-bold">{profileData?.status_registrasi as string}</span>. Layanan Surat Herregistrasi hanya untuk mahasiswa yang sudah herregistrasi pada semester berjalan.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {Object.entries(dataPemohon).map(([label, value]) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">{label.replace('_', ' ')}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
                    {label === "status" && isHerregBlocked && (
                      <Chip size="sm" variant="flat" color="danger">Tidak Memenuhi Syarat</Chip>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody></Card>
        )}

        {/* Step 2: Upload Dokumen */}
        {currentStep === 2 && (
          <Card className="shadow-md rounded-xl"><CardBody className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Upload Dokumen Persyaratan</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload semua dokumen yang diperlukan.</p>

            {/* Dokumen yang sudah diupload sebelumnya (mode edit) */}
            <div className="space-y-4">
              {persyaratan.map(req => {
                const existingDoc = existingDokumen.find(d => d.id_persyaratan === req.id_persyaratan);
                return (
                  <UploadCard
                    key={req.id_persyaratan}
                    persyaratan={req}
                    file={uploadedFiles[req.kode_dokumen] || null}
                    existingDoc={existingDoc}
                    onFileChange={(file) => handleFileChange(req.kode_dokumen, file)}
                    onPreview={(name, url, type) => setPreviewFile({ name, url, type })}
                    onDeleteExisting={async (idDokumen) => {
                      try {
                        await deleteDokumen(idDokumen);
                        setExistingDokumen(prev => prev.filter(d => d.id_dokumen !== idDokumen));
                        toast.success("Dokumen lama berhasil dihapus");
                      } catch {
                        toast.error("Gagal menghapus dokumen");
                      }
                    }}
                  />
                );
              })}
              {persyaratan.length === 0 && <p className="text-sm text-gray-400 text-center py-8">Tidak ada persyaratan dokumen untuk layanan ini</p>}
            </div>
          </CardBody></Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Card className="shadow-md rounded-xl"><CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ringkasan Pengajuan</h2>
              <div className="mb-4">
                <Chip color="primary" variant="flat" size="sm">{layanan.nm_layanan}</Chip>
                {layanan.sla_hari && <span className="text-xs text-gray-400 ml-2">SLA: {layanan.sla_hari} hari</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(dataPemohon).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 min-w-[80px] capitalize">{label}:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            </CardBody></Card>

            <Card className="shadow-md rounded-xl"><CardBody className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Dokumen</h3>
              <div className="space-y-2">
                {persyaratan.map(req => {
                  const file = uploadedFiles[req.kode_dokumen];
                  const existingDoc = existingDokumen.find(d => d.id_persyaratan === req.id_persyaratan);
                  const hasFile = !!file || !!existingDoc;
                  const fileName = file ? file.name : existingDoc ? String(existingDoc.nama_file_asli) : "";
                  const fileSize = file ? `${(file.size / 1024).toFixed(0)} KB` : existingDoc?.ukuran_byte ? `${Math.round(Number(existingDoc.ukuran_byte) / 1024)} KB` : "";
                  return (
                    <div key={req.id_persyaratan} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <FiFile className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{req.nm_dokumen}</p>
                          {hasFile && <p className="text-xs text-gray-500">{fileName} {fileSize && `· ${fileSize}`}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file && (
                          <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
                            onPress={() => setPreviewFile({ name: file.name, url: URL.createObjectURL(file), type: file.type })}>
                            Lihat
                          </Button>
                        )}
                        {!file && existingDoc && (
                          <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
                            onPress={async () => {
                              try {
                                const bakClient = (await import("@/lib/api/bakClient")).default;
                                const resp = await bakClient.get(`/layanan/dokumen/${existingDoc.id_dokumen}/download?preview=1`, { responseType: "blob" });
                                const blob = new Blob([resp.data], { type: String(existingDoc.tipe_file || "application/pdf") });
                                setPreviewFile({ name: String(existingDoc.nama_file_asli), url: URL.createObjectURL(blob), type: String(existingDoc.tipe_file || "") });
                              } catch { /* ignore */ }
                            }}>
                            Lihat
                          </Button>
                        )}
                        <Chip color={hasFile ? "success" : req.a_wajib ? "danger" : "default"} variant="flat" size="sm">
                          {hasFile ? (file ? "File Baru" : "Sudah Upload") : req.a_wajib ? "Belum Upload" : "Opsional"}
                        </Chip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody></Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="flat" startContent={<FiSave className="w-4 h-4" />} isLoading={submitting} onPress={() => handleSubmit(true)}>Simpan Draft</Button>
              <Button color="primary" startContent={<FiSend className="w-4 h-4" />} isDisabled={!allRequiredUploaded} isLoading={submitting} onPress={() => handleSubmit(false)}>Ajukan Pengajuan</Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-2">
          <Button variant="flat" startContent={<FiChevronLeft className="w-4 h-4" />} isDisabled={currentStep === 1} onPress={() => setCurrentStep(s => Math.max(1, s - 1))}>Sebelumnya</Button>
          {currentStep < 3 && <Button color="primary" endContent={<FiChevronRight className="w-4 h-4" />} onPress={() => {
            // Validasi step 2: dokumen wajib harus diupload
            if (currentStep === 2 && !allRequiredUploaded) {
              toast.error("Semua dokumen wajib harus diupload sebelum melanjutkan");
              return;
            }
            // Validasi step 1 SK-HERREG: status harus aktif
            if (currentStep === 1 && isHerregBlocked) {
              toast.error("Anda tidak memenuhi syarat untuk layanan ini");
              return;
            }
            setCurrentStep(s => Math.min(3, s + 1));
          }}>Selanjutnya</Button>}
        </div>
      </div>

      {/* Modal Preview Dokumen */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { URL.revokeObjectURL(previewFile.url); setPreviewFile(null); }} />
          <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 min-w-0">
                <FiFile className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{previewFile.name}</p>
              </div>
              <Button isIconOnly variant="light" size="sm" onPress={() => { URL.revokeObjectURL(previewFile.url); setPreviewFile(null); }}>
                <FiX className="w-5 h-5" />
              </Button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-auto p-1 bg-gray-100 dark:bg-gray-800">
              {previewFile.type.startsWith("image/") ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[75vh] mx-auto rounded" />
              ) : previewFile.type === "application/pdf" ? (
                <iframe src={previewFile.url} className="w-full h-[75vh] rounded" title={previewFile.name} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <FiFile className="w-12 h-12 mb-3" />
                  <p className="text-sm">Preview tidak tersedia untuk tipe file ini</p>
                  <a href={previewFile.url} download={previewFile.name} className="mt-3 text-sm text-blue-600 hover:underline">Download file</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );
}

function UploadCard({ persyaratan, file, existingDoc, onFileChange, onPreview, onDeleteExisting }: {
  persyaratan: PersyaratanLayanan;
  file: File | null;
  existingDoc?: Record<string, unknown>;
  onFileChange: (file: File | null) => void;
  onPreview?: (name: string, url: string, type: string) => void;
  onDeleteExisting?: (idDokumen: string) => Promise<void>;
}) {
  const hasExisting = !!existingDoc && !file;
  const hasFile = !!file;

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{persyaratan.nm_dokumen}</span>
          {persyaratan.a_wajib && <Chip color="danger" variant="flat" size="sm">Wajib</Chip>}
        </div>
        <span className="text-xs text-gray-400">Maks {persyaratan.max_size_mb} MB</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">Format: {persyaratan.tipe_file.split(",").map(t => t.split("/")[1]).join(", ")}</p>

      {/* File baru dipilih */}
      {hasFile && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <FiFile className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">{file.name}</p>
              <p className="text-xs text-green-600">{(file.size / 1024).toFixed(0)} KB · File baru</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onPreview && (
              <button onClick={() => onPreview(file.name, URL.createObjectURL(file), file.type)}
                className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors" title="Lihat">
                <FiEye className="w-4 h-4 text-green-600" />
              </button>
            )}
            <button onClick={() => onFileChange(null)}
              className="p-1.5 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors" title="Hapus">
              <FiX className="w-4 h-4 text-green-600" />
            </button>
          </div>
        </div>
      )}

      {/* Dokumen existing dari draft */}
      {hasExisting && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2">
            <FiFile className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{String(existingDoc.nama_file_asli)}</p>
              <p className="text-xs text-blue-600">
                {existingDoc.ukuran_byte ? `${Math.round(Number(existingDoc.ukuran_byte) / 1024)} KB · ` : ""}Sudah diupload
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onPreview && (
              <button onClick={async () => {
                try {
                  const bakClient = (await import("@/lib/api/bakClient")).default;
                  const resp = await bakClient.get(`/layanan/dokumen/${existingDoc.id_dokumen}/download?preview=1`, { responseType: "blob" });
                  const blob = new Blob([resp.data], { type: String(existingDoc.tipe_file || "application/pdf") });
                  onPreview(String(existingDoc.nama_file_asli), URL.createObjectURL(blob), String(existingDoc.tipe_file || ""));
                } catch { /* ignore */ }
              }} className="p-1.5 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors" title="Lihat">
                <FiEye className="w-4 h-4 text-blue-600" />
              </button>
            )}
            {onDeleteExisting && (
              <button onClick={() => onDeleteExisting(String(existingDoc.id_dokumen))}
                className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Hapus">
                <FiX className="w-4 h-4 text-red-500" />
              </button>
            )}
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-700 bg-blue-100 dark:bg-blue-800 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors">
              <FiUpload className="w-3.5 h-3.5" /> Ganti
              <input type="file" className="hidden" accept={persyaratan.tipe_file} onChange={async e => {
                const newFile = e.target.files?.[0] || null;
                if (newFile && onDeleteExisting) {
                  await onDeleteExisting(String(existingDoc.id_dokumen));
                }
                onFileChange(newFile);
              }} />
            </label>
          </div>
        </div>
      )}

      {/* Belum ada file sama sekali */}
      {!hasFile && !hasExisting && (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
          onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onFileChange(e.dataTransfer.files[0] || null); }}>
          <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Drag & drop atau <span className="text-blue-600 font-medium">pilih file</span></p>
          <input type="file" className="hidden" accept={persyaratan.tipe_file} onChange={e => onFileChange(e.target.files?.[0] || null)} />
        </label>
      )}
    </div>
  );
}
