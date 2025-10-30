"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { Card, CardBody, Button } from "@heroui/react";
import { FiArrowLeft, FiRefreshCw, FiClock } from "react-icons/fi";
import { sisterIntegratorMenuConfig } from "../../config/menuConfig";
import Link from "next/link";

export default function RiwayatPekerjaanPage() {
  useRequireAuth();

  return (
    <DashboardLayout appName="SISTER Integrator" menuConfig={sisterIntegratorMenuConfig}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <Link href="/dashboard/sister-integrator" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4">
            <FiArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Riwayat Pekerjaan</h1>
            <p className="text-gray-600 dark:text-gray-400">Kelola dan sinkronisasi data riwayat pekerjaan dosen dari SISTER API</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {[
            { icon: FiClock, title: "Total Data", value: "-", subtitle: "Belum tersinkronisasi", color: "from-blue-500 to-blue-600" },
            { icon: FiRefreshCw, title: "Sync Terakhir", value: "-", subtitle: "Belum pernah sync", color: "from-green-500 to-green-600" },
            { icon: FiClock, title: "Status", value: "Coming Soon", subtitle: "Dalam pengembangan", color: "from-purple-500 to-purple-600" },
          ].map((stat, idx) => (
            <Card key={idx} className={`bg-gradient-to-br ${stat.color} border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <CardBody className="p-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/90 mb-1">{stat.title}</p>
                    <h3 className={`${stat.value === "Coming Soon" ? "text-2xl" : "text-3xl"} font-bold text-white tracking-tight leading-none`}>{stat.value}</h3>
                    <p className="text-xs text-white/80 mt-1">{stat.subtitle}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardBody className="p-8 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                <FiClock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Fitur Dalam Pengembangan</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                Halaman Riwayat Pekerjaan sedang dalam tahap pengembangan. Fitur ini akan segera tersedia untuk melakukan sinkronisasi data riwayat pekerjaan dosen dari SISTER API.
              </p>
              <Link href="/dashboard/sister-integrator">
                <Button color="primary" variant="flat" startContent={<FiArrowLeft />}>Kembali ke Dashboard</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
