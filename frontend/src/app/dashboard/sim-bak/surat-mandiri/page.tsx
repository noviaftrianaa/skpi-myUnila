"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody } from "@heroui/react";
import { FiFileText, FiCreditCard, FiAward, FiBookOpen, FiArrowRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { dummyJenisLayanan, dummyPersyaratan } from "@/lib/services/sim-bak/dummyData";

const iconMap: Record<string, React.ReactNode> = {
  LOA: <FiFileText className="w-8 h-8" />,
  GANTI_KTM: <FiCreditCard className="w-8 h-8" />,
  GANTI_PKKMB: <FiAward className="w-8 h-8" />,
  HERREGISTRASI: <FiBookOpen className="w-8 h-8" />,
};

const colorMap: Record<string, string> = {
  LOA: "from-blue-500 to-indigo-600",
  GANTI_KTM: "from-emerald-500 to-teal-600",
  GANTI_PKKMB: "from-violet-500 to-purple-600",
  HERREGISTRASI: "from-amber-500 to-orange-600",
};

export default function SuratMandiriPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const suratMandiri = dummyJenisLayanan.filter((j) => j.kategori === "surat_mandiri" && j.apakah_aktif);

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Surat Mandiri">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Surat Mandiri</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pilih jenis surat yang ingin diajukan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {suratMandiri.map((layanan) => {
            const persyaratan = dummyPersyaratan.filter((p) => p.id_jenis_layanan === layanan.id_jenis_layanan);
            return (
              <Card key={layanan.id_jenis_layanan} className="border-none shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group" isPressable
                onPress={() => router.push(`/dashboard/sim-bak/surat-mandiri/${layanan.kode_layanan}`)}>
                <CardBody className="p-0">
                  <div className={`p-5 bg-gradient-to-br ${colorMap[layanan.kode_layanan]} text-white`}>
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      {iconMap[layanan.kode_layanan]}
                    </div>
                    <h3 className="font-bold text-lg">{layanan.nm_layanan}</h3>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{layanan.deskripsi}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">{persyaratan.length} persyaratan</span>
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
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
