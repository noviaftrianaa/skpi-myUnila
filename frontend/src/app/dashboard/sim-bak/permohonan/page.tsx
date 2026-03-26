"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody } from "@heroui/react";
import { FiPauseCircle, FiUserX, FiRefreshCw, FiArrowRight, FiInfo } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { dummyPersyaratan } from "@/lib/services/sim-bak/dummyData";

const permohonanCards = [
  {
    kode: "CUTI",
    title: "Cuti Akademik",
    description: "Permohonan cuti akademik (maks 2 semester). Mahasiswa dapat mengajukan cuti dengan alasan sakit, keuangan, keluarga, atau lainnya.",
    icon: <FiPauseCircle className="w-8 h-8" />,
    gradient: "from-violet-500 to-purple-600",
    rules: ["Maks 2 semester cuti", "Status mahasiswa aktif", "Lunas SPP"],
    idJenisLayanan: "jl-005",
  },
  {
    kode: "UNDUR_DIRI",
    title: "Undur Diri",
    description: "Permohonan pengunduran diri dari status mahasiswa aktif. Memerlukan persetujuan orang tua dan bebas tanggungan.",
    icon: <FiUserX className="w-8 h-8" />,
    gradient: "from-rose-500 to-pink-600",
    rules: ["Persetujuan orang tua", "Bebas tanggungan", "Surat bermaterai"],
    idJenisLayanan: "jl-006",
  },
  {
    kode: "ALIH_PROGRAM",
    title: "Alih Program Studi",
    description: "Permohonan pindah program studi. Memerlukan IPK minimal dan jumlah SKS tertentu serta rekomendasi dekan.",
    icon: <FiRefreshCw className="w-8 h-8" />,
    gradient: "from-cyan-500 to-teal-600",
    rules: ["Min IPK 2.75", "Min 40 SKS", "Rekomendasi Dekan"],
    idJenisLayanan: "jl-007",
  },
];

export default function PermohonanAkademikPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Permohonan Akademik">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Permohonan Akademik</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pilih jenis permohonan akademik yang ingin diajukan</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {permohonanCards.map((item) => {
            const persyaratan = dummyPersyaratan.filter((p) => p.id_jenis_layanan === item.idJenisLayanan);
            return (
              <Card
                key={item.kode}
                className="border-none shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                isPressable
                onPress={() => router.push(`/dashboard/sim-bak/permohonan/${item.kode}`)}
              >
                <CardBody className="p-0">
                  <div className={`p-5 bg-gradient-to-br ${item.gradient} text-white`}>
                    <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{item.description}</p>

                    {/* Validation Rules */}
                    <div className="space-y-1.5 mb-3">
                      {item.rules.map((rule) => (
                        <div key={rule} className="flex items-center gap-1.5">
                          <FiInfo className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{rule}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
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
