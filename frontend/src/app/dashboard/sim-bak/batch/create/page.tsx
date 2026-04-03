"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Button } from "@heroui/react";
import { FiArrowLeft, FiLoader, FiUsers, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { createBatch, getJenisLayananPublic } from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan } from "@/lib/services/sim-bak/types";
import toast, { Toaster } from "react-hot-toast";

const semesterOptions = ["20251","20252","20241","20242","20231","20232"];

export default function CreateBatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [batchLayanan, setBatchLayanan] = useState<JenisLayanan[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    id_jenis_layanan: "",
    nm_batch: "",
    jenis_batch: "habis_masa_mukim",
    id_smt: "",
    catatan: "",
  });

  useEffect(() => {
    if (!user) return;
    getJenisLayananPublic()
      .then(data => setBatchLayanan(data.filter(j => j.kategori === "batch_administrasi")))
      .catch(() => {});
  }, [user]);

  const handleSubmit = async () => {
    if (!form.id_jenis_layanan || !form.nm_batch || !form.id_smt) {
      toast.error("Jenis layanan, nama batch, dan semester wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const result = await createBatch({
        ...form,
        kriteria_snapshot: JSON.stringify({ jenis: form.jenis_batch, id_smt: form.id_smt }),
      });
      toast.success("Batch berhasil dibuat");
      router.push(`/dashboard/sim-bak/batch/${result.id_batch_penetapan}`);
    } catch {
      toast.error("Gagal membuat batch");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Buat Batch Baru">
      <Toaster position="top-right" />
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <Button isIconOnly variant="light" size="sm" onPress={() => router.push("/dashboard/sim-bak/batch")}>
            <FiArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Batch Baru</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Buat batch penetapan HMM atau Putus Studi</p>
          </div>
        </div>

        <Card className="shadow-md rounded-xl">
          <CardBody className="p-6 space-y-5">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <FiAlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Sebelum membuat batch</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Pastikan data akademik mahasiswa sudah diperbarui di sistem. Batch akan menarik data kandidat berdasarkan kriteria semester dan jenis penetapan.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jenis Penetapan *</label>
              <select value={form.id_jenis_layanan}
                onChange={(e) => {
                  const jl = batchLayanan.find(j => j.id_jenis_layanan === e.target.value);
                  setForm({ ...form, id_jenis_layanan: e.target.value, jenis_batch: jl?.kode_layanan === "BA-HMM" ? "habis_masa_mukim" : "putus_studi" });
                }}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Jenis Penetapan</option>
                {batchLayanan.map(j => <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>{j.nm_layanan}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nama Batch *</label>
              <input type="text" value={form.nm_batch} onChange={(e) => setForm({ ...form, nm_batch: e.target.value })}
                placeholder="cth: Penetapan HMM Semester Genap 2024/2025"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester Akademik *</label>
              <select value={form.id_smt} onChange={(e) => setForm({ ...form, id_smt: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Semester</option>
                {semesterOptions.map(s => {
                  const year = s.substring(0, 4);
                  const term = s.substring(4) === "1" ? "Ganjil" : "Genap";
                  return <option key={s} value={s}>{term} {year}/{parseInt(year)+1}</option>;
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan</label>
              <textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={3}
                placeholder="Catatan tambahan (opsional)..."
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </CardBody>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button variant="flat" onPress={() => router.push("/dashboard/sim-bak/batch")}>Batal</Button>
          <Button color="primary" isLoading={saving} startContent={!saving && <FiUsers className="w-4 h-4" />} onPress={handleSubmit}>
            Buat Batch & Tarik Data
          </Button>
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
