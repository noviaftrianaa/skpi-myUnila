"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "./config/menuConfig";
import { Card, CardBody, Spinner } from "@heroui/react";
import { FiDatabase, FiUsers, FiCheckCircle, FiClock } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { RiGraduationCapFill } from "react-icons/ri";
import { toast } from "react-hot-toast";

export default function FeederIntegratorDashboard() {
  useRequireAuth();
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call
      // const response = await feederService.getStats();
      // setStats(response);

      // Mock data for now
      setStats({
        total_mahasiswa: 0,
        total_referensi: 0,
        total_sync_today: 0,
        last_sync: null,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Gagal memuat statistik");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<RiGraduationCapFill className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Dashboard"
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Feeder Integrator</h1>
              <p className="text-blue-100">
                Sistem integrasi data mahasiswa dengan Neo Feeder PDDIKTI
              </p>
            </div>
            <div className="hidden md:block">
              <RiGraduationCapFill className="w-24 h-24 text-white/20" />
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Mahasiswa */}
            <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiUsers className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-100">Total Mahasiswa</p>
                    <h3 className="text-3xl font-bold text-white">{stats?.total_mahasiswa || 0}</h3>
                    <p className="text-[10px] text-purple-100/80">Data mahasiswa aktif</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Total Referensi */}
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiDatabase className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-blue-100">Data Referensi</p>
                    <h3 className="text-3xl font-bold text-white">{stats?.total_referensi || 0}</h3>
                    <p className="text-[10px] text-blue-100/80">Data master tersinkron</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Sync Today */}
            <Card className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiCheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-100">Sync Hari Ini</p>
                    <h3 className="text-3xl font-bold text-white">{stats?.total_sync_today || 0}</h3>
                    <p className="text-[10px] text-green-100/80">Operasi sinkronisasi</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Last Sync */}
            <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <FiClock className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-orange-100">Sync Terakhir</p>
                    <h3 className="text-xl font-bold text-white truncate">
                      {stats?.last_sync || "Belum pernah"}
                    </h3>
                    <p className="text-[10px] text-orange-100/80">Waktu sinkronisasi</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Coming Soon Notice */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardBody className="p-8 text-center">
            <div className="mb-4">
              <MdSchool className="w-24 h-24 text-blue-500 mx-auto opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Coming Soon
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Feeder Integrator sedang dalam tahap pengembangan.
              <br />
              Fitur sinkronisasi data mahasiswa akan segera tersedia.
            </p>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
