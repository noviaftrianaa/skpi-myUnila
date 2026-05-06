"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Button, Chip } from "@heroui/react";
import { FiArrowLeft, FiUsers, FiAlertCircle, FiSearch, FiCheck } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { createBatch, getJenisLayananPublic, getRefSemester, getRefFakultas, previewBatchCandidates } from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan } from "@/lib/services/sim-bak/types";
import toast, { Toaster } from "react-hot-toast";

export default function CreateBatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [batchLayanan, setBatchLayanan] = useState<JenisLayanan[]>([]);
  const [semesterList, setSemesterList] = useState<Array<{ id_smt: string; nm_smt: string; a_periode_aktif: boolean }>>([]);
  const [fakultasList, setFakultasList] = useState<Array<{ id_fakultas: string; nm_fakultas: string }>>([]);
  const [filterFakultas, setFilterFakultas] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_jenis_layanan: "",
    nm_batch: "",
    jenis_batch: "habis_masa_mukim",
    id_smt: "",
    catatan: "",
  });

  // Preview state
  const [previewing, setPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<{
    total: number;
    candidates: Array<Record<string, unknown>>;
    kriteria: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getJenisLayananPublic().then(data => setBatchLayanan(data.filter(j => j.kategori === "batch_administrasi"))),
      getRefSemester().then(data => {
        setSemesterList(data);
        const aktif = data.find(s => s.a_periode_aktif);
        if (aktif && !form.id_smt) setForm(f => ({ ...f, id_smt: aktif.id_smt }));
      }),
      getRefFakultas().then(setFakultasList),
    ]).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handlePreview = useCallback(async () => {
    if (!form.jenis_batch || !form.id_smt) {
      toast.error("Pilih jenis penetapan dan semester terlebih dahulu");
      return;
    }
    setPreviewing(true);
    setPreviewData(null);
    try {
      const data = await previewBatchCandidates({
        jenis_batch: form.jenis_batch,
        id_smt: form.id_smt,
        id_fakultas: filterFakultas || undefined,
      });
      setPreviewData(data);
    } catch {
      toast.error("Gagal memuat preview kandidat");
    } finally {
      setPreviewing(false);
    }
  }, [form.jenis_batch, form.id_smt, filterFakultas]);

  const handleSubmit = async () => {
    if (!form.id_jenis_layanan || !form.nm_batch || !form.id_smt || !filterFakultas) {
      toast.error("Jenis layanan, nama batch, semester, dan fakultas wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const result = await createBatch({
        ...form,
        id_fakultas: filterFakultas,
        kriteria_snapshot: JSON.stringify({ jenis: form.jenis_batch, id_smt: form.id_smt, id_fakultas: filterFakultas }),
      }) as unknown as { batch: { id_batch_penetapan: string }; jumlah_kandidat: number };
      toast.success(`Batch berhasil dibuat dengan ${result.jumlah_kandidat ?? 0} kandidat`);
      router.push(`/dashboard/sim-bak/batch/${result.batch.id_batch_penetapan}`);
    } catch {
      toast.error("Gagal membuat batch");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Buat Evaluasi Baru">
      <Toaster position="top-right" />
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/batch")}>
            <FiArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Evaluasi Baru</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Tarik kandidat dari data akademik (PDUT) berdasarkan kriteria</p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-md rounded-xl">
          <CardBody className="p-6 space-y-5">
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Pastikan data akademik sudah diperbarui</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Kandidat ditarik otomatis dari PDUT berdasarkan kriteria jenjang dan semester.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jenis Penetapan *</label>
                <select value={form.id_jenis_layanan}
                  onChange={(e) => {
                    const jl = batchLayanan.find(j => j.id_jenis_layanan === e.target.value);
                    setForm({ ...form, id_jenis_layanan: e.target.value, jenis_batch: jl?.kode_layanan === "BA-HMM" ? "habis_masa_mukim" : "putus_studi" });
                    setPreviewData(null);
                  }}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Jenis Penetapan</option>
                  {batchLayanan.map(j => <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester Akademik *</label>
                <select value={form.id_smt} onChange={(e) => { setForm({ ...form, id_smt: e.target.value }); setPreviewData(null); }}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Semester</option>
                  {semesterList.map(s => (
                    <option key={s.id_smt} value={s.id_smt}>{s.nm_smt}{s.a_periode_aktif ? ' (aktif)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Fakultas *</label>
                <select value={filterFakultas} onChange={(e) => { setFilterFakultas(e.target.value); setPreviewData(null); }}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Pilih Fakultas</option>
                  {fakultasList.map(f => (
                    <option key={f.id_fakultas} value={f.id_fakultas}>{f.nm_fakultas}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Batch *</label>
              <input type="text" value={form.nm_batch} onChange={(e) => setForm({ ...form, nm_batch: e.target.value })}
                placeholder="cth: Penetapan HMM Semester Genap 2024/2025"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={2}
                placeholder="Catatan tambahan (opsional)..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            {/* Preview Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <Button color="secondary" variant="flat" isLoading={previewing}
                startContent={!previewing && <FiSearch className="w-4 h-4" />}
                isDisabled={!form.id_jenis_layanan || !form.id_smt}
                onPress={handlePreview}>
                Preview Kandidat
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Preview Results */}
        {previewData && (
          <Card className="shadow-md rounded-xl">
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Preview Kandidat</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Kriteria: {previewData.kriteria}</p>
                </div>
                <Chip color={previewData.total > 0 ? "primary" : "default"} variant="flat" size="lg">
                  <FiUsers className="w-4 h-4 mr-1 inline" />
                  {previewData.total} mahasiswa
                </Chip>
              </div>

              {previewData.total === 0 ? (
                <div className="text-center py-8">
                  <FiUsers className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Tidak ditemukan mahasiswa yang memenuhi kriteria</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">NIM</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Nama</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Prodi</th>
                        <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Jenjang</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">IPK</th>
                        <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase">Semester</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.candidates.slice(0, 20).map((c, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="py-2 px-3 text-gray-400">{i + 1}</td>
                          <td className="py-2 px-3 font-mono text-xs">{String(c.nim)}</td>
                          <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">{String(c.nm_mahasiswa)}</td>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{String(c.nm_prodi ?? '-')}</td>
                          <td className="py-2 px-3"><Chip size="sm" variant="flat">{String(c.nm_jenjang ?? '-')}</Chip></td>
                          <td className="py-2 px-3 text-right">{String(c.ipk ?? '-')}</td>
                          <td className="py-2 px-3 text-right">{String(c.masa_studi_semester ?? c.semester_aktif ?? '-')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.total > 20 && (
                    <p className="text-xs text-gray-400 text-center mt-3">Menampilkan 20 dari {previewData.total} kandidat. Semua kandidat akan dimasukkan ke batch.</p>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 justify-end">
          <Button variant="flat" onPress={() => router.push("/dashboard/sim-bak/batch")}>Batal</Button>
          <Button color="primary" isLoading={saving}
            startContent={!saving && <FiCheck className="w-4 h-4" />}
            isDisabled={!form.id_jenis_layanan || !form.nm_batch || !form.id_smt || !filterFakultas}
            onPress={handleSubmit}>
            Buat Evaluasi & Tarik Data{previewData ? ` (${previewData.total} kandidat)` : ''}
          </Button>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
