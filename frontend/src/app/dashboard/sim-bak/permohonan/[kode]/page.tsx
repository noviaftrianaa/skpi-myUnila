"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUpload, FiCheck, FiChevronLeft, FiChevronRight, FiFile, FiX, FiSave, FiSend, FiAlertCircle, FiInfo, FiEye } from "react-icons/fi";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "@/contexts/UserContextContext";
import { getJenisLayananPublic, getPersyaratanByLayanan, getTahapanByLayanan, getMyProfile, getRefFakultas, getRefProdi, getRefSemester, getKategoriCutiActive, createPengajuan, uploadDokumen, ajukanPengajuan } from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan, PersyaratanLayanan, TahapanLayanan, DokumenPengajuan, KategoriCuti } from "@/lib/services/sim-bak/types";

const steps = [
  { no: 1, label: "Data & Alasan" },
  { no: 2, label: "Upload Dokumen" },
  { no: 3, label: "Review & Submit" },
];

function computeSemesterAkhir(idSmtMulai: string, jumlah: number): string {
  let year = parseInt(idSmtMulai.substring(0, 4));
  let sem = parseInt(idSmtMulai.substring(4, 5));
  for (let i = 1; i < jumlah; i++) {
    if (sem === 1) { sem = 2; } else { sem = 1; year++; }
  }
  return `${year}${sem}`;
}

function formatSemesterName(idSmt: string): string {
  const year = parseInt(idSmt.substring(0, 4));
  const sem = parseInt(idSmt.substring(4, 5));
  return `${year}/${year + 1} ${sem === 1 ? "Ganjil" : "Genap"}`;
}

export default function PermohonanFormPage() {
  const { user } = useAuth();
  const { activeContext } = useUserContext();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const kode = params.kode as string;
  const editId = searchParams.get("edit");

  const isAdminRole = (() => {
    const role = (activeContext?.nm_peran ?? "").toLowerCase();
    return role.includes("developer") || role.includes("admin");
  })();

  const [currentStep, setCurrentStep] = useState(editId ? 2 : 1);
  // PM-ALIH dari luar Unila (hanya visible untuk admin)
  const [isDariLuar, setIsDariLuar] = useState(false);
  const [manualData, setManualData] = useState({
    nm_mahasiswa: "", nim_asal: "", nm_pt_asal: "", nm_prodi_asal: "",
    nm_jenjang: "", akreditasi_prodi_asal: "", tempat_lahir: "", tgl_lahir: "",
    jenis_kelamin: "", ipk: "", sks_lulus: "", semester_aktif: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({});
  const [existingDokumen, setExistingDokumen] = useState<DokumenPengajuan[]>([]);
  const [layanan, setLayanan] = useState<JenisLayanan | null>(null);
  const [persyaratan, setPersyaratan] = useState<PersyaratanLayanan[]>([]);
  const [tahapan, setTahapan] = useState<TahapanLayanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [profileData, setProfileData] = useState<Record<string, unknown> | null>(null);
  // Cuti-specific
  const [jumlahSemesterCuti, setJumlahSemesterCuti] = useState<number>(1);
  const [semesterMulaiCuti, setSemesterMulaiCuti] = useState("");
  const [semesterList, setSemesterList] = useState<Array<{ id_smt: string; nm_smt: string; a_periode_aktif: boolean }>>([]);
  const [kategoriCuti, setKategoriCuti] = useState("terencana");
  const [kategoriCutiList, setKategoriCutiList] = useState<KategoriCuti[]>([]);
  const semesterAkhirCuti = semesterMulaiCuti ? computeSemesterAkhir(semesterMulaiCuti, jumlahSemesterCuti) : "";

  const [flaggedFields, setFlaggedFields] = useState<Set<string>>(new Set());
  const fieldWrapStyle = (field: string, valid: boolean): React.CSSProperties => {
    const base: React.CSSProperties = { borderRadius: "0.5rem", border: "1px solid #d1d5db" };
    if (!flaggedFields.has(field)) return base;
    return valid
      ? { ...base, border: "2px solid #22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.15)" }
      : { ...base, border: "2px solid #ef4444", boxShadow: "0 0 0 3px rgba(239,68,68,0.15)" };
  };
  // Alih Program-specific
  const [fakultasList, setFakultasList] = useState<Array<{ id_fakultas: string; nm_fakultas: string }>>([]);
  const [prodiList, setProdiList] = useState<Array<{ id_prodi: string; nm_prodi: string; nm_jenjang: string }>>([]);
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; type: string } | null>(null);

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
          const [p, t] = await Promise.all([
            getPersyaratanByLayanan(found.id_jenis_layanan),
            getTahapanByLayanan(found.id_jenis_layanan),
          ]);
          setPersyaratan((p ?? []).sort((a, b) => a.urutan - b.urutan));
          setTahapan(t ?? []);
        }
        // Load referensi untuk PM-CUTI dan PM-ALIH
        if (kode === "PM-CUTI") {
          getRefSemester().then(setSemesterList).catch(() => {});
          getKategoriCutiActive().then(setKategoriCutiList).catch(() => {});
        }
        if (kode === "PM-ALIH") {
          getRefFakultas().then(setFakultasList).catch(() => {});
        }
        // Mode edit: load dokumen existing
        if (editId) {
          const { getPengajuanDetail } = await import("@/lib/services/sim-bak/simBakService");
          const detail = await getPengajuanDetail(editId).catch(() => null);
          if (detail?.dokumen) setExistingDokumen(detail.dokumen);
          if (detail?.alasan) setAlasan(detail.alasan);
          if (detail?.catatan_pemohon) setCatatan(detail.catatan_pemohon);
        }
      } catch { /* fallback */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, [user, kode, editId]);

  // Cascading: load prodi saat fakultas dipilih
  useEffect(() => {
    if (kode === "PM-ALIH" && selectedFakultas) {
      setProdiList([]);
      setSelectedProdi("");
      getRefProdi(selectedFakultas).then(setProdiList).catch(() => {});
    }
  }, [selectedFakultas, kode]);

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
  const isAlih = kode === "PM-ALIH";
  const isUndur = kode === "PM-UNDUR";
  const dataPemohon = {
    nama: String(profileData?.nm_mahasiswa ?? user?.name ?? "-"),
    npm: String(profileData?.nim ?? user?.username ?? "-"),
    prodi: String(profileData?.nm_prodi ?? "-"),
    fakultas: String(profileData?.nm_fakultas ?? "-"),
    jenjang: String(profileData?.nm_jenjang ?? "-"),
    semester: String(profileData?.semester_aktif ?? "-"),
    ipk: String(profileData?.ipk ?? "-"),
    sks_lulus: String(profileData?.sks_lulus ?? "-"),
  };

  // Syarat akademik untuk Alih Program
  const ipk = Number(profileData?.ipk ?? 0);
  const sks = Number(profileData?.sks_lulus ?? 0);
  const sem = Number(profileData?.semester_aktif ?? 0);
  const jenjang = String(profileData?.nm_jenjang ?? "").toLowerCase();
  const syaratAlih = isAlih && profileData ? (() => {
    const isS1 = ["s1", "sarjana"].includes(jenjang);
    const isD3 = ["d3", "diploma"].includes(jenjang);
    const isS2S3 = ["s2", "s3", "magister", "doktor"].includes(jenjang);
    const rules = isS1 ? [
      { label: "IPK >= 2.75", pass: ipk >= 2.75, detail: `IPK Anda: ${ipk}` },
      { label: "SKS Lulus >= 40", pass: sks >= 40, detail: `SKS Anda: ${sks}` },
      { label: "Semester <= 5", pass: sem <= 5, detail: `Semester Anda: ${sem}` },
    ] : isD3 ? [
      { label: "IPK >= 2.50", pass: ipk >= 2.50, detail: `IPK Anda: ${ipk}` },
      { label: "SKS Lulus >= 36", pass: sks >= 36, detail: `SKS Anda: ${sks}` },
      { label: "Semester <= 5", pass: sem <= 5, detail: `Semester Anda: ${sem}` },
    ] : isS2S3 ? [
      { label: "IPK >= 3.00", pass: ipk >= 3.00, detail: `IPK Anda: ${ipk}` },
      { label: "SKS Lulus >= 12", pass: sks >= 12, detail: `SKS Anda: ${sks}` },
      { label: "Semester <= 3", pass: sem <= 3, detail: `Semester Anda: ${sem}` },
    ] : [];
    return { rules, allPass: rules.every(r => r.pass) };
  })() : null;

  const handleSubmit = async (isDraft: boolean) => {
    if (!isDraft && !alasan.trim()) { toast.error("Alasan permohonan wajib diisi"); return; }
    if (!isDraft && isCuti && !semesterMulaiCuti) { toast.error("Semester mulai cuti wajib dipilih"); return; }
    if (!isDraft && isAlih && !selectedProdi) { toast.error("Prodi tujuan wajib dipilih"); return; }
    if (!isDraft && isAlih && !isDariLuar && syaratAlih && !syaratAlih.allPass) { toast.error("Anda belum memenuhi syarat akademik untuk Alih Program"); return; }
    if (!isDraft && isDariLuar && (!manualData.nm_mahasiswa.trim() || !manualData.nim_asal.trim() || !manualData.nm_pt_asal.trim())) {
      toast.error("Data pemohon (nama, NIM asal, PT asal) wajib diisi"); return;
    }
    setSubmitting(true);
    try {
      // 1. Create pengajuan (skip jika mode edit)
      const createPayload: Record<string, unknown> = {
        id_jenis_layanan: layanan.id_jenis_layanan,
        alasan,
        catatan_pemohon: catatan || undefined,
        jumlah_semester_cuti: isCuti ? jumlahSemesterCuti : undefined,
        id_smt_mulai_cuti: isCuti ? semesterMulaiCuti || undefined : undefined,
        id_smt_akhir_cuti: isCuti ? semesterAkhirCuti || undefined : undefined,
        kategori_cuti: isCuti ? kategoriCuti : undefined,
        id_prodi_tujuan: isAlih ? selectedProdi || undefined : undefined,
        id_fakultas_tujuan: isAlih ? selectedFakultas || undefined : undefined,
      };
      if (isDariLuar) {
        createPayload.a_dari_luar = true;
        createPayload.nm_mahasiswa = manualData.nm_mahasiswa;
        createPayload.nim_asal = manualData.nim_asal;
        createPayload.nm_pt_asal = manualData.nm_pt_asal;
        createPayload.nm_prodi_asal = manualData.nm_prodi_asal || undefined;
        createPayload.nm_jenjang = manualData.nm_jenjang || undefined;
        createPayload.akreditasi_prodi_asal = manualData.akreditasi_prodi_asal || undefined;
        createPayload.tempat_lahir = manualData.tempat_lahir || undefined;
        createPayload.tgl_lahir = manualData.tgl_lahir || undefined;
        createPayload.jenis_kelamin = manualData.jenis_kelamin || undefined;
        createPayload.ipk = manualData.ipk ? Number(manualData.ipk) : undefined;
        createPayload.sks_lulus = manualData.sks_lulus ? Number(manualData.sks_lulus) : undefined;
        createPayload.semester_aktif = manualData.semester_aktif ? Number(manualData.semester_aktif) : undefined;
      }
      const pengajuanId = editId
        ? editId
        : (await createPengajuan(createPayload as Parameters<typeof createPengajuan>[0])).id_pengajuan;

      // 2. Upload dokumen baru
      for (const [kodeDok, file] of Object.entries(uploadedFiles)) {
        if (!file) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("nm_dokumen", persyaratan.find(p => p.kode_dokumen === kodeDok)?.nm_dokumen ?? file.name);
        const match = persyaratan.find(p => p.kode_dokumen === kodeDok);
        if (match) formData.append("id_persyaratan", match.id_persyaratan);
        await uploadDokumen(pengajuanId, formData);
      }

      if (!isDraft) {
        await ajukanPengajuan(pengajuanId);
        toast.success("Permohonan berhasil diajukan!");
      } else {
        toast.success("Draft disimpan");
      }
      setTimeout(() => router.push("/dashboard/sim-bak/riwayat"), 1500);
    } catch (e) {
      const msg = (e as any)?.response?.data?.message || (e instanceof Error ? e.message : "Gagal mengajukan");
      toast.error(msg, { duration: 5000 });
    } finally { setSubmitting(false); }
  };

  const allRequiredUploaded = persyaratan.filter(p => p.a_wajib).every(p =>
    uploadedFiles[p.kode_dokumen] ||
    (editId && existingDokumen.some(d => d.id_persyaratan === p.id_persyaratan))
  );

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle={`Permohonan ${layanan.nm_layanan}`}>
      <Toaster position="top-right" />
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{editId ? "Lanjutkan" : "Permohonan"} {layanan.nm_layanan}</h1>
          <p className="text-sm text-gray-500 mt-1">{editId ? "Lengkapi dokumen dan ajukan permohonan Anda" : layanan.deskripsi}</p>
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

            {/* Toggle: Dari Luar Unila (hanya admin, hanya PM-ALIH) */}
            {isAlih && isAdminRole && (
              <Card className="shadow-sm rounded-xl border border-violet-100 dark:border-violet-900">
                <CardBody className="p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={isDariLuar} onChange={e => setIsDariLuar(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                    <div>
                      <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Pengajuan dari Luar Unila</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Calon mahasiswa tidak memiliki akun SSO — data diinput manual oleh Admin BAK</p>
                    </div>
                  </label>
                </CardBody>
              </Card>
            )}

            <Card className="shadow-md rounded-xl"><CardBody className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isDariLuar ? "Data Pemohon (Input Manual)" : "Data Pemohon"}
              </h2>

              {isDariLuar ? (
                /* Form input manual untuk pemohon dari luar Unila */
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Nama Lengkap *</label>
                      <div style={fieldWrapStyle("nm_mahasiswa", !!manualData.nm_mahasiswa.trim())} className="overflow-hidden">
                        <input type="text" value={manualData.nm_mahasiswa} onChange={e => setManualData(d => ({ ...d, nm_mahasiswa: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none"
                          placeholder="Nama lengkap pemohon" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">NIM Asal *</label>
                      <div style={fieldWrapStyle("nim_asal", !!manualData.nim_asal.trim())} className="overflow-hidden">
                        <input type="text" value={manualData.nim_asal} onChange={e => setManualData(d => ({ ...d, nim_asal: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none"
                          placeholder="NIM dari PT asal" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Perguruan Tinggi Asal *</label>
                      <div style={fieldWrapStyle("nm_pt_asal", !!manualData.nm_pt_asal.trim())} className="overflow-hidden">
                        <input type="text" value={manualData.nm_pt_asal} onChange={e => setManualData(d => ({ ...d, nm_pt_asal: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none"
                          placeholder="Nama perguruan tinggi asal" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Program Studi Asal</label>
                      <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                        <input type="text" value={manualData.nm_prodi_asal} onChange={e => setManualData(d => ({ ...d, nm_prodi_asal: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none"
                          placeholder="Prodi di PT asal" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jenjang</label>
                      <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                        <select value={manualData.nm_jenjang} onChange={e => setManualData(d => ({ ...d, nm_jenjang: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                          <option value="">Pilih</option>
                          <option value="D3">D3</option>
                          <option value="S1">S1</option>
                          <option value="S2">S2</option>
                          <option value="S3">S3</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Akreditasi Prodi Asal</label>
                      <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                        <input type="text" value={manualData.akreditasi_prodi_asal} onChange={e => setManualData(d => ({ ...d, akreditasi_prodi_asal: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none"
                          placeholder="A / B / Unggul" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Jenis Kelamin</label>
                      <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                        <select value={manualData.jenis_kelamin} onChange={e => setManualData(d => ({ ...d, jenis_kelamin: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                          <option value="">Pilih</option>
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">IPK</label>
                      <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                        <input type="number" step="0.01" min="0" max="4" value={manualData.ipk} onChange={e => setManualData(d => ({ ...d, ipk: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none"
                          placeholder="0.00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">SKS Lulus</label>
                      <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                        <input type="number" min="0" value={manualData.sks_lulus} onChange={e => setManualData(d => ({ ...d, sks_lulus: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none"
                          placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Semester Aktif</label>
                      <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                        <input type="number" min="1" value={manualData.semester_aktif} onChange={e => setManualData(d => ({ ...d, semester_aktif: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none"
                          placeholder="1" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 italic">Validasi syarat akademik dilakukan manual berdasarkan transkrip PT asal</p>
                </div>
              ) : (
                /* Data dari PDUT (existing) */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  {Object.entries(dataPemohon).map(([label, value]) => (
                    <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-0.5 capitalize">{label.replace('_', ' ')}</p>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Syarat Akademik Card — khusus Alih Program internal */}
              {isAlih && !isDariLuar && syaratAlih && (
                <div className={`rounded-lg p-4 mb-6 border ${syaratAlih.allPass ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}`}>
                  <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Syarat Akademik Alih Program ({dataPemohon.jenjang})
                  </h3>
                  <div className="space-y-1.5">
                    {syaratAlih.rules.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs ${r.pass ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {r.pass ? '✓' : '✗'}
                        </span>
                        <span className={r.pass ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                          {r.label} — {r.detail}
                        </span>
                      </div>
                    ))}
                  </div>
                  {!syaratAlih.allPass && (
                    <p className="text-xs text-red-600 mt-2 font-medium">Anda belum memenuhi semua syarat untuk mengajukan alih program.</p>
                  )}
                </div>
              )}

              {/* Konfirmasi Undur Diri */}
              {isUndur && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Perhatian: Pengunduran Diri</h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Pengunduran diri bersifat permanen. Setelah SK terbit, Anda tidak dapat mendaftar kembali di program studi yang sama. Pastikan keputusan ini sudah dipertimbangkan dengan matang.</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alasan Permohonan *</label>
                  <div style={fieldWrapStyle("alasan", !!alasan.trim())} className="overflow-hidden">
                    <textarea value={alasan} onChange={e => setAlasan(e.target.value)} rows={4}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none resize-none"
                      placeholder="Jelaskan alasan permohonan Anda..." />
                  </div>
                </div>

                {/* PM-CUTI: Kategori + Semester */}
                {isCuti && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori Cuti *</label>
                      <div style={fieldWrapStyle("kategoriCuti", !!kategoriCuti)} className="overflow-hidden">
                        <select value={kategoriCuti} onChange={e => setKategoriCuti(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                          {kategoriCutiList.length > 0
                            ? kategoriCutiList.map(k => <option key={k.id_kategori_cuti} value={k.id_kategori_cuti}>{k.nm_kategori}</option>)
                            : <>
                                <option value="terencana">Cuti Terencana</option>
                                <option value="kecelakaan">Cuti Tidak Terencana — Kecelakaan</option>
                                <option value="sakit">Cuti Tidak Terencana — Sakit</option>
                                <option value="melahirkan">Cuti Tidak Terencana — Melahirkan</option>
                              </>
                          }
                        </select>
                      </div>
                    </div>
                    {kategoriCuti !== "terencana" && (
                      <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700 dark:text-amber-300">Untuk cuti tidak terencana, pastikan menyertakan dokumen pendukung (surat keterangan dokter/RS, laporan kecelakaan, dll.) pada langkah berikutnya.</p>
                      </div>
                    )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester Mulai Cuti *</label>
                      <div style={fieldWrapStyle("semesterMulaiCuti", !!semesterMulaiCuti)} className="overflow-hidden">
                        <select value={semesterMulaiCuti} onChange={e => setSemesterMulaiCuti(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                          <option value="">Pilih Semester</option>
                          {semesterList.map(s => (
                            <option key={s.id_smt} value={s.id_smt}>{s.nm_smt}{s.a_periode_aktif ? ' (aktif)' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jumlah Semester *</label>
                      <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                        <select value={jumlahSemesterCuti} onChange={e => setJumlahSemesterCuti(Number(e.target.value))}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                          <option value={1}>1 Semester</option>
                          <option value={2}>2 Semester</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester Akhir Cuti</label>
                      <div className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                        {semesterAkhirCuti ? formatSemesterName(semesterAkhirCuti) : <span className="text-gray-400">Otomatis terisi</span>}
                      </div>
                    </div>
                  </div>
                  </div>
                )}

                {/* PM-ALIH: Fakultas + Prodi tujuan (cascading) */}
                {isAlih && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fakultas Tujuan *</label>
                      <div style={fieldWrapStyle("selectedFakultas", !!selectedFakultas)} className="overflow-hidden">
                        <select value={selectedFakultas} onChange={e => setSelectedFakultas(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none">
                          <option value="">Pilih Fakultas</option>
                          {fakultasList.map(f => (
                            <option key={f.id_fakultas} value={f.id_fakultas}>{f.nm_fakultas}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi Tujuan *</label>
                      <div style={fieldWrapStyle("selectedProdi", !!selectedProdi)} className="overflow-hidden">
                        <select value={selectedProdi} onChange={e => setSelectedProdi(e.target.value)}
                          disabled={!selectedFakultas}
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none disabled:opacity-50">
                          <option value="">{selectedFakultas ? (prodiList.length ? 'Pilih Prodi' : 'Memuat...') : 'Pilih fakultas terlebih dahulu'}</option>
                          {prodiList.map(p => (
                            <option key={p.id_prodi} value={p.id_prodi}>{p.nm_prodi} ({p.nm_jenjang})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tambahan</label>
                  <div style={{ borderRadius: "0.5rem", border: "1px solid #d1d5db" }} className="overflow-hidden">
                    <textarea value={catatan} onChange={e => setCatatan(e.target.value)} rows={2}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none resize-none"
                      placeholder="Catatan tambahan (opsional)..." />
                  </div>
                </div>
              </div>
            </CardBody></Card>
          </div>
        )}

        {/* Step 2: Upload */}
        {currentStep === 2 && (
          <Card className="shadow-md rounded-xl"><CardBody className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Upload Dokumen Persyaratan</h2>
            <p className="text-sm text-gray-500 mb-4">{persyaratan.length} dokumen diperlukan</p>

            {editId && existingDokumen.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Dokumen yang sudah diupload sebelumnya:</p>
                <div className="space-y-1.5">
                  {existingDokumen.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <FiFile className="w-3.5 h-3.5" />
                      <span>{String(doc.nm_dokumen)} — {String(doc.nama_file_asli)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">Upload ulang di bawah untuk mengganti dokumen tertentu.</p>
              </div>
            )}

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
              {isCuti && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Kategori Cuti:</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{kategoriCutiList.find(k => k.id_kategori_cuti === kategoriCuti)?.nm_kategori || kategoriCuti}</p>
                  </div>
                  {semesterMulaiCuti && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Periode Cuti:</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatSemesterName(semesterMulaiCuti)} — {semesterAkhirCuti ? formatSemesterName(semesterAkhirCuti) : "-"} ({jumlahSemesterCuti} semester)
                      </p>
                    </div>
                  )}
                </div>
              )}
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Dokumen ({Object.values(uploadedFiles).filter(Boolean).length + existingDokumen.length}/{persyaratan.length})</h3>
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
            <div className="flex gap-3 justify-end">
              <Button variant="flat" startContent={<FiSave className="w-4 h-4" />} isLoading={submitting} onPress={() => handleSubmit(true)}>Simpan Draft</Button>
              <Button color="primary" startContent={<FiSend className="w-4 h-4" />} isDisabled={!allRequiredUploaded || !alasan.trim()} isLoading={submitting} onPress={() => handleSubmit(false)}>Ajukan</Button>
            </div>
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between pt-2">
          <Button variant="flat" startContent={<FiChevronLeft className="w-4 h-4" />} isDisabled={currentStep === 1} onPress={() => setCurrentStep(s => Math.max(1, s - 1))}>Sebelumnya</Button>
          {currentStep < 3 && <Button color="primary" endContent={<FiChevronRight className="w-4 h-4" />} onPress={() => {
            if (currentStep === 1) {
              const errors: string[] = [];
              const flags = new Set(flaggedFields);
              if (!alasan.trim()) { errors.push("Alasan permohonan wajib diisi"); flags.add("alasan"); }
              if (isCuti && !semesterMulaiCuti) { errors.push("Semester mulai cuti wajib dipilih"); flags.add("semesterMulaiCuti"); }
              if (isAlih && !selectedFakultas) { errors.push("Fakultas tujuan wajib dipilih"); flags.add("selectedFakultas"); }
              if (isAlih && !selectedProdi) { errors.push("Program studi tujuan wajib dipilih"); flags.add("selectedProdi"); }
              if (isAlih && !isDariLuar && syaratAlih && !syaratAlih.allPass) errors.push("Anda belum memenuhi syarat akademik untuk Alih Program");
              if (isDariLuar && !manualData.nm_mahasiswa.trim()) { errors.push("Nama lengkap wajib diisi"); flags.add("nm_mahasiswa"); }
              if (isDariLuar && !manualData.nim_asal.trim()) { errors.push("NIM asal wajib diisi"); flags.add("nim_asal"); }
              if (isDariLuar && !manualData.nm_pt_asal.trim()) { errors.push("Perguruan tinggi asal wajib diisi"); flags.add("nm_pt_asal"); }
              setFlaggedFields(flags);
              if (errors.length > 0) { errors.forEach(e => toast.error(e)); return; }
            }
            // Validasi step 2: dokumen wajib harus diupload
            if (currentStep === 2 && !allRequiredUploaded) {
              toast.error("Semua dokumen wajib harus diupload sebelum melanjutkan");
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
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 min-w-0">
                <FiFile className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{previewFile.name}</p>
              </div>
              <Button isIconOnly variant="light" size="sm" onPress={() => { URL.revokeObjectURL(previewFile.url); setPreviewFile(null); }}>
                <FiX className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-1 bg-gray-100 dark:bg-gray-800">
              {previewFile.type.startsWith("image/") ? (
                <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[75vh] mx-auto rounded" />
              ) : previewFile.type === "application/pdf" ? (
                <iframe src={previewFile.url} className="w-full h-[75vh] rounded" title={previewFile.name} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <FiFile className="w-12 h-12 mb-3" />
                  <p className="text-sm">Preview tidak tersedia untuk tipe file ini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayoutWithDynamicMenu>
  );

  function handleFileChange(kodeDokumen: string, file: File | null) {
    setUploadedFiles(prev => ({ ...prev, [kodeDokumen]: file }));
  }
}
