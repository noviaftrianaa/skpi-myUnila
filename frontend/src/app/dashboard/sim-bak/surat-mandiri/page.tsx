"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody } from "@heroui/react";
import { FiFileText, FiCreditCard, FiAward, FiBookOpen, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getJenisLayananPublic, getPersyaratanByLayanan } from "@/lib/services/sim-bak/simBakService";
import type { JenisLayanan } from "@/lib/services/sim-bak/types";

const iconMap: Record<string, React.ReactNode> = {
  "SK-LOA": <FiFileText className="w-8 h-8" />,
  "SK-KTM": <FiCreditCard className="w-8 h-8" />,
  "SK-PKKMB": <FiAward className="w-8 h-8" />,
  "SK-HERREG": <FiBookOpen className="w-8 h-8" />,
};

const colorMap: Record<string, string> = {
  "SK-LOA": "from-blue-500 to-indigo-600",
  "SK-KTM": "from-emerald-500 to-teal-600",
  "SK-PKKMB": "from-violet-500 to-purple-600",
  "SK-HERREG": "from-amber-500 to-orange-600",
};

export default function SuratMandiriPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [suratMandiri, setSuratMandiri] = useState<JenisLayanan[]>([]);
  const [persyaratanCount, setPersyaratanCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const allLayanan = await getJenisLayananPublic();
        const filtered = allLayanan.filter(j => j.kategori === "surat_mandiri");
        setSuratMandiri(filtered);

        // Fetch persyaratan count per layanan
        const counts: Record<string, number> = {};
        await Promise.all(filtered.map(async (j) => {
          try {
            const p = await getPersyaratanByLayanan(j.id_jenis_layanan);
            counts[j.id_jenis_layanan] = p.length;
          } catch { counts[j.id_jenis_layanan] = 0; }
        }));
        setPersyaratanCount(counts);
      } catch {
        // fallback — empty
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Surat Mandiri">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Surat Mandiri</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pilih jenis surat yang ingin diajukan</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse rounded-xl bg-white dark:bg-gray-800 shadow-md overflow-hidden">
                <div className="h-32 bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : suratMandiri.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-300 mb-4">
              <FiFileText className="w-10 h-10" />
            </div>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300">Belum ada layanan surat mandiri</p>
            <p className="text-sm text-gray-500 mt-1">Hubungi admin untuk mengaktifkan layanan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {suratMandiri.map((layanan) => (
              <Card key={layanan.id_jenis_layanan} className="border-none shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group flex flex-col h-full" isPressable
                onPress={() => router.push(`/dashboard/sim-bak/surat-mandiri/${layanan.kode_layanan}`)}>
                <CardBody className="p-0 flex flex-col h-full">
                  <div className={`p-5 bg-gradient-to-br ${colorMap[layanan.kode_layanan] || "from-gray-500 to-gray-600"} text-white h-[180px] flex flex-col`}>
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-auto group-hover:scale-110 transition-transform">
                      {iconMap[layanan.kode_layanan] || <FiFileText className="w-7 h-7" />}
                    </div>
                    <h3 className="font-bold text-base leading-snug">{layanan.nm_layanan}</h3>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 flex flex-col flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{layanan.deskripsi}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {persyaratanCount[layanan.id_jenis_layanan] ?? 0} persyaratan
                        {layanan.sla_hari ? ` · ${layanan.sla_hari} hari` : ""}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                        Ajukan <FiArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
