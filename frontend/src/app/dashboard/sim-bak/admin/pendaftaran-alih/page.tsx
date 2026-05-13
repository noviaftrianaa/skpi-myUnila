"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Card, CardBody, Button, Spinner } from "@heroui/react";
import { FiUserPlus, FiSave, FiArrowLeft, FiFile, FiX } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import {
  getJenisLayananPublic,
  getRefFakultas,
  getRefProdi,
  getPersyaratanByLayanan,
  createPengajuanEksternal,
} from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan, PersyaratanLayanan } from "@/lib/services/sim-bak/types";

const JENJANG_OPTIONS = [
  { value: "D3", label: "D3 / Diploma" },
  { value: "S1", label: "S1 / Sarjana" },
];

export default function PendaftaranAlihEksternalPage() {
  const router = useRouter();

  const [layananAlih, setLayananAlih] = useState<JenisLayanan | null>(null);
  const [persyaratan, setPersyaratan] = useState<PersyaratanLayanan[]>([]);
  const [fakultasList, setFakultasList] = useState<Array<{ id_fakultas: string; nm_fakultas: string }>>([]);
  const [prodiList, setProdiList] = useState<Array<{ id_prodi: string; nm_prodi: string; nm_jenjang: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form: data pemohon
  const [nmMahasiswa, setNmMahasiswa] = useState("");
  const [nimAsal, setNimAsal] = useState("");
  const [nmPtAsal, setNmPtAsal] = useState("");
  const [nmProdiAsal, setNmProdiAsal] = useState("");
  const [nmJenjangAsal, setNmJenjangAsal] = useState("");
  const [akreditasi, setAkreditasi] = useState("");
  const [tempatLahir, setTempatLahir] = useState("");
  const [tglLahir, setTglLahir] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [ipk, setIpk] = useState("");
  const [sksLulus, setSksLulus] = useState("");
  const [semesterAktif, setSemesterAktif] = useState("");
  // Kontak
  const [emailPemohon, setEmailPemohon] = useState("");
  const [noHpPemohon, setNoHpPemohon] = useState("");
  // Tujuan
  const [selectedFakultas, setSelectedFakultas] = useState("");
  const [selectedProdi, setSelectedProdi] = useState("");
  // Catatan
  const [alasan, setAlasan] = useState("");
  const [catatanPemohon, setCatatanPemohon] = useState("");
  // SK Dekan (hasil verifikasi fakultas)
  const [nomorSkDekan, setNomorSkDekan] = useState("");
  const [tglSkDekan, setTglSkDekan] = useState(new Date().toISOString().split("T")[0]);
  const [fileSkDekan, setFileSkDekan] = useState<File | null>(null);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState("");
  // Dokumen pendukung lainnya
  const [dokumenFiles, setDokumenFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    (async () => {
      try {
        const [list, fak] = await Promise.all([getJenisLayananPublic(), getRefFakultas()]);
        const alih = list.find(l => l.kode_layanan === "PM-ALIH");
        setLayananAlih(alih ?? null);
        setFakultasList(fak);
        if (alih) {
          const syarat = await getPersyaratanByLayanan(alih.id_jenis_layanan);
          setPersyaratan(syarat);
        }
      } catch {
        toast.error("Gagal memuat data layanan");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedFakultas) {
      getRefProdi(selectedFakultas).then(setProdiList).catch(() => setProdiList([]));
      setSelectedProdi("");
    } else {
      setProdiList([]);
    }
  }, [selectedFakultas]);

  // Filter prodi tujuan sesuai jenjang asal (D3 -> D3; S1 -> D3, S1)
  const isD3 = nmJenjangAsal.toLowerCase() === "d3";
  const isS1 = nmJenjangAsal.toLowerCase() === "s1";
  const allowedJenjang: string[] = isS1 ? ["s1", "sarjana", "d3", "diploma"] : isD3 ? ["d3", "diploma"] : [];
  const prodiFiltered = nmJenjangAsal
    ? prodiList.filter(p => allowedJenjang.includes(String(p.nm_jenjang).toLowerCase()))
    : prodiList;

  const handleSubmit = async () => {
    // Validasi minimum
    const errors: string[] = [];
    if (!nmMahasiswa.trim()) errors.push("Nama lengkap wajib diisi");
    if (!nimAsal.trim()) errors.push("NIM asal wajib diisi");
    if (!nmPtAsal.trim()) errors.push("Perguruan tinggi asal wajib diisi");
    if (!nmJenjangAsal) errors.push("Jenjang asal wajib dipilih");
    if (!emailPemohon.trim()) errors.push("Email pemohon wajib diisi");
    if (!noHpPemohon.trim()) errors.push("Nomor HP pemohon wajib diisi");
    if (!selectedFakultas) errors.push("Fakultas tujuan wajib dipilih");
    if (!selectedProdi) errors.push("Program studi tujuan wajib dipilih");
    if (!nomorSkDekan.trim()) errors.push("Nomor SK Dekan wajib diisi");
    if (!tglSkDekan) errors.push("Tanggal SK Dekan wajib diisi");
    if (!fileSkDekan) errors.push("File SK Dekan wajib diupload");
    if (errors.length > 0) {
      errors.forEach(e => toast.error(e));
      return;
    }

    if (!layananAlih) {
      toast.error("Layanan PM-ALIH tidak ditemukan");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("id_jenis_layanan", layananAlih.id_jenis_layanan);
      formData.append("nm_mahasiswa", nmMahasiswa);
      formData.append("nim_asal", nimAsal);
      formData.append("nm_pt_asal", nmPtAsal);
      if (nmProdiAsal) formData.append("nm_prodi_asal", nmProdiAsal);
      formData.append("nm_jenjang_asal", nmJenjangAsal);
      if (akreditasi) formData.append("akreditasi_prodi_asal", akreditasi);
      if (tempatLahir) formData.append("tempat_lahir", tempatLahir);
      if (tglLahir) formData.append("tgl_lahir", tglLahir);
      if (jenisKelamin) formData.append("jenis_kelamin", jenisKelamin);
      if (ipk) formData.append("ipk", ipk);
      if (sksLulus) formData.append("sks_lulus", sksLulus);
      if (semesterAktif) formData.append("semester_aktif", semesterAktif);
      formData.append("email_pemohon", emailPemohon);
      formData.append("no_hp_pemohon", noHpPemohon);
      formData.append("id_prodi_tujuan", selectedProdi);
      formData.append("id_fakultas_tujuan", selectedFakultas);
      if (alasan) formData.append("alasan", alasan);
      if (catatanPemohon) formData.append("catatan_pemohon", catatanPemohon);

      // SK Dekan (hasil verifikasi fakultas)
      formData.append("nomor_sk_dekan", nomorSkDekan);
      formData.append("tgl_sk_dekan", tglSkDekan);
      if (fileSkDekan) formData.append("file_sk_dekan", fileSkDekan);
      if (catatanVerifikasi) formData.append("catatan_verifikasi", catatanVerifikasi);

      // Lampirkan dokumen
      let idx = 0;
      for (const syarat of persyaratan) {
        const file = dokumenFiles[syarat.id_persyaratan];
        if (file) {
          formData.append(`dokumen[${idx}]`, file);
          formData.append(`dokumen_nm.${idx}`, syarat.nm_dokumen);
          formData.append(`dokumen_kode.${idx}`, syarat.kode_dokumen);
          formData.append(`dokumen_persyaratan.${idx}`, syarat.id_persyaratan);
          idx++;
        }
      }

      const result = await createPengajuanEksternal(formData);
      toast.success(`Pendaftaran berhasil. No. ${result.nomor_permohonan}`);
      router.push(`/dashboard/sim-bak/admin/verifikasi/${result.id_pengajuan}`);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal mendaftarkan pengajuan";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayoutWithDynamicMenu menuConfig={simBakMenuConfig} appName="SIM-BAK" appIcon={<MdDashboard className="w-5 h-5" />}>
        <div className="flex justify-center items-center min-h-[60vh]"><Spinner /></div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  if (!layananAlih) {
    return (
      <DashboardLayoutWithDynamicMenu menuConfig={simBakMenuConfig} appName="SIM-BAK" appIcon={<MdDashboard className="w-5 h-5" />}>
        <div className="p-6">
          <p className="text-red-600">Layanan PM-ALIH belum aktif di sistem.</p>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  return (
    <DashboardLayoutWithDynamicMenu menuConfig={simBakMenuConfig} appName="SIM-BAK" appIcon={<MdDashboard className="w-5 h-5" />}>
      <Toaster position="top-right" />
      <div className="p-4 sm:p-6 space-y-5 max-w-4xl">
        <Button variant="light" startContent={<FiArrowLeft className="w-4 h-4" />} onPress={() => router.back()}>Kembali</Button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FiUserPlus className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Pendaftaran Alih Program Eksternal</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daftarkan calon mahasiswa dari luar Unila secara manual</p>
          </div>
        </div>

        <Card className="shadow-md rounded-xl"><CardBody className="p-5 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Data Calon Mahasiswa</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap *</label>
              <input type="text" value={nmMahasiswa} onChange={e => setNmMahasiswa(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NIM Asal *</label>
              <input type="text" value={nimAsal} onChange={e => setNimAsal(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempat Lahir</label>
              <input type="text" value={tempatLahir} onChange={e => setTempatLahir(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
              <input type="date" value={tglLahir} onChange={e => setTglLahir(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
              <select value={jenisKelamin} onChange={e => setJenisKelamin(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
        </CardBody></Card>

        <Card className="shadow-md rounded-xl"><CardBody className="p-5 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Asal Pendidikan</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Perguruan Tinggi Asal *</label>
              <input type="text" value={nmPtAsal} onChange={e => setNmPtAsal(e.target.value)}
                placeholder="Contoh: Universitas Negeri Padang"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi Asal</label>
              <input type="text" value={nmProdiAsal} onChange={e => setNmProdiAsal(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenjang Asal *</label>
              <select value={nmJenjangAsal} onChange={e => setNmJenjangAsal(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Jenjang</option>
                {JENJANG_OPTIONS.map(j => <option key={j.value} value={j.value}>{j.label}</option>)}
              </select>
              <p className="text-xs text-gray-500 mt-1">Jenjang Pascasarjana tidak dapat mengajukan alih program.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Akreditasi Prodi Asal</label>
              <select value={akreditasi} onChange={e => setAkreditasi(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih</option>
                <option value="A">A / Unggul</option>
                <option value="B">B / Baik Sekali</option>
                <option value="C">C / Baik</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IPK</label>
              <input type="number" step="0.01" min="0" max="4" value={ipk} onChange={e => setIpk(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKS Lulus</label>
              <input type="number" min="0" value={sksLulus} onChange={e => setSksLulus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester Aktif</label>
              <input type="number" min="1" value={semesterAktif} onChange={e => setSemesterAktif(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </CardBody></Card>

        <Card className="shadow-md rounded-xl"><CardBody className="p-5 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Kontak Pemohon</h2>
          <p className="text-xs text-gray-500">Digunakan untuk notifikasi status pengajuan via Email & WhatsApp.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input type="email" value={emailPemohon} onChange={e => setEmailPemohon(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor HP/WhatsApp *</label>
              <input type="text" value={noHpPemohon} onChange={e => setNoHpPemohon(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </CardBody></Card>

        <Card className="shadow-md rounded-xl"><CardBody className="p-5 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Tujuan Alih Program (di Unila)</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fakultas Tujuan *</label>
              <select value={selectedFakultas} onChange={e => setSelectedFakultas(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Fakultas</option>
                {fakultasList.map(f => <option key={f.id_fakultas} value={f.id_fakultas}>{f.nm_fakultas}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi Tujuan *</label>
              <select value={selectedProdi} onChange={e => setSelectedProdi(e.target.value)}
                disabled={!selectedFakultas}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                <option value="">{selectedFakultas ? (prodiFiltered.length ? "Pilih Prodi" : (nmJenjangAsal ? "Tidak ada prodi sesuai jenjang" : "Pilih jenjang asal terlebih dahulu")) : "Pilih fakultas terlebih dahulu"}</option>
                {prodiFiltered.map(p => <option key={p.id_prodi} value={p.id_prodi}>{p.nm_prodi} ({p.nm_jenjang})</option>)}
              </select>
              {nmJenjangAsal && (
                <p className="text-xs text-gray-500 mt-1">{isS1 ? "Hanya menampilkan prodi jenjang D3 dan S1." : "Hanya menampilkan prodi jenjang D3."}</p>
              )}
            </div>
          </div>
        </CardBody></Card>

        <Card className="shadow-md rounded-xl"><CardBody className="p-5 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Alasan & Catatan</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alasan Alih Program</label>
            <textarea rows={3} value={alasan} onChange={e => setAlasan(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Tambahan</label>
            <textarea rows={2} value={catatanPemohon} onChange={e => setCatatanPemohon(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </CardBody></Card>

        <Card className="shadow-md rounded-xl border-2 border-amber-200 dark:border-amber-800"><CardBody className="p-5 space-y-4">
          <h2 className="text-base font-semibold text-amber-800 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800 pb-2">Hasil Verifikasi Fakultas & SK Dekan</h2>
          <p className="text-xs text-amber-700 dark:text-amber-400">Isi nomor, tanggal, dan upload SK Dekan tentang penerimaan calon mahasiswa. Setelah submit, pengajuan akan diteruskan ke Admin BAK untuk verifikasi.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor SK Dekan *</label>
              <input type="text" value={nomorSkDekan} onChange={e => setNomorSkDekan(e.target.value)}
                placeholder="Contoh: 001/UN26.F1/SK/2026"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal SK Dekan *</label>
              <input type="date" value={tglSkDekan} onChange={e => setTglSkDekan(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File SK Dekan (PDF) *</label>
            <div className="border-2 border-dashed border-amber-300 dark:border-amber-700 rounded-lg p-4 text-center hover:border-amber-500 transition-colors">
              <input type="file" accept=".pdf" onChange={e => setFileSkDekan(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 file:font-medium file:text-sm hover:file:bg-amber-100 file:cursor-pointer" />
              {fileSkDekan && (
                <p className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                  {fileSkDekan.name} ({Math.round(fileSkDekan.size / 1024)} KB)
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catatan Verifikasi (opsional)</label>
            <textarea rows={2} value={catatanVerifikasi} onChange={e => setCatatanVerifikasi(e.target.value)}
              placeholder="Catatan hasil verifikasi dokumen oleh fakultas..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
          </div>
        </CardBody></Card>

        {persyaratan.length > 0 && (
          <Card className="shadow-md rounded-xl"><CardBody className="p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Dokumen Pendukung</h2>
            <p className="text-xs text-gray-500">Upload dokumen yang diserahkan oleh calon mahasiswa. Format PDF, maks 20 MB.</p>

            <div className="space-y-3">
              {persyaratan.map(syarat => {
                const file = dokumenFiles[syarat.id_persyaratan];
                return (
                  <div key={syarat.id_persyaratan} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {syarat.nm_dokumen}
                          {syarat.a_wajib && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        {syarat.deskripsi && <p className="text-xs text-gray-500 truncate">{syarat.deskripsi}</p>}
                      </div>
                      {file && (
                        <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => setDokumenFiles(d => ({ ...d, [syarat.id_persyaratan]: null }))}>
                          <FiX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {file ? (
                      <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded px-3 py-2">
                        <FiFile className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{file.name} ({Math.round(file.size / 1024)} KB)</span>
                      </div>
                    ) : (
                      <input type="file" accept={syarat.tipe_file || ".pdf"}
                        onChange={e => setDokumenFiles(d => ({ ...d, [syarat.id_persyaratan]: e.target.files?.[0] || null }))}
                        className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium file:text-xs file:cursor-pointer" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardBody></Card>
        )}

        <div className="flex justify-end gap-3 pb-6">
          <Button variant="flat" onPress={() => router.back()}>Batal</Button>
          <Button color="primary" startContent={<FiSave className="w-4 h-4" />} isLoading={submitting} onPress={handleSubmit}>
            Daftarkan Pengajuan
          </Button>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
