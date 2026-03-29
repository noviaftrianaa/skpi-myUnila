"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody } from "@heroui/react";
import { FiPauseCircle, FiUserX, FiRefreshCw, FiArrowRight, FiInfo, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getJenisLayananPublic, getPersyaratanByLayanan, getTahapanByLayanan } from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan } from "@/lib/services/sim-bak/types";

const iconMap: Record<string, React.ReactNode> = {
  "PM-CUTI": <FiPauseCircle className="w-8 h-8" />,
  "PM-UNDUR": <FiUserX className="w-8 h-8" />,
  "PM-ALIH": <FiRefreshCw className="w-8 h-8" />,
};

const colorMap: Record<string, string> = {
  "PM-CUTI": "from-violet-500 to-purple-600",
  "PM-UNDUR": "from-rose-500 to-pink-600",
  "PM-ALIH": "from-cyan-500 to-teal-600",
};

const rulesMap: Record<string, string[]> = {
  "PM-CUTI": ["Maks 2 semester cuti", "Status mahasiswa aktif", "Lunas UKT"],
  "PM-UNDUR": ["Persetujuan orang tua", "Bebas tanggungan", "Surat bermaterai"],
  "PM-ALIH": ["Min IPK 2.75 (internal)", "Min 40 SKS", "Maks semester 5", "Rekomendasi Dekan"],
};

export default function PermohonanAkademikPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [permohonan, setPermohonan] = useState<JenisLayanan[]>([]);
  const [persyaratanCount, setPersyaratanCount] = useState<Record<string, number>>({});
  const [tahapanCount, setTahapanCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const allLayanan = await getJenisLayananPublic();
        const filtered = allLayanan.filter(j => j.kategori === "permohonan_akademik" && j.a_aktif);
        setPermohonan(filtered);

        const pCounts: Record<string, number> = {};
        const tCounts: Record<string, number> = {};
        await Promise.all(filtered.map(async (j) => {
          try {
            const [p, t] = await Promise.all([
              getPersyaratanByLayanan(j.id_jenis_layanan),
              getTahapanByLayanan(j.id_jenis_layanan),
            ]);
            pCounts[j.id_jenis_layanan] = p.length;
            tCounts[j.id_jenis_layanan] = t.length;
          } catch {
            pCounts[j.id_jenis_layanan] = 0;
            tCounts[j.id_jenis_layanan] = 0;
          }
        }));
        setPersyaratanCount(pCounts);
        setTahapanCount(tCounts);
      } catch {} finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Permohonan Akademik">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Permohonan Akademik</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pilih jenis permohonan akademik yang ingin diajukan</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
        ) : permohonan.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiAlertCircle className="w-12 h-12 mb-3" />
            <p>Belum ada layanan permohonan tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {permohonan.map((layanan) => {
              const rules = rulesMap[layanan.kode_layanan] || [];
              return (
                <Card key={layanan.id_jenis_layanan} className="border-none shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group" isPressable
                  onPress={() => router.push(`/dashboard/sim-bak/permohonan/${layanan.kode_layanan}`)}>
                  <CardBody className="p-0">
                    <div className={`p-5 bg-gradient-to-br ${colorMap[layanan.kode_layanan] || "from-gray-500 to-gray-600"} text-white`}>
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {iconMap[layanan.kode_layanan] || <FiRefreshCw className="w-8 h-8" />}
                      </div>
                      <h3 className="font-bold text-lg">{layanan.nm_layanan}</h3>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{layanan.deskripsi}</p>

                      {rules.length > 0 && (
                        <div className="space-y-1.5 mb-3">
                          {rules.map((rule) => (
                            <div key={rule} className="flex items-center gap-1.5">
                              <FiInfo className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">{rule}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {persyaratanCount[layanan.id_jenis_layanan] ?? 0} persyaratan · {tahapanCount[layanan.id_jenis_layanan] ?? 0} tahap
                          {layanan.sla_hari ? ` · ${layanan.sla_hari}h` : ""}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                          Ajukan <FiArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
