"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import {
  Card,
  CardBody,
  Chip,
  Spinner,
} from "@heroui/react";
import {
  FiUsers,
  FiActivity,
  FiBookOpen,
  FiArrowRight,
  FiDatabase,
} from "react-icons/fi";
import { RiGovernmentFill } from "react-icons/ri";
import { sisterIntegratorMenuConfig } from "../config/menuConfig";
import { sisterDosenService } from "@/lib/services/dosenService";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function PDRDDashboardPage() {
  useRequireAuth();

  const [dosenStats, setDosenStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDosenStats();
  }, []);

  const fetchDosenStats = async () => {
    try {
      setIsLoading(true);
      const data = await sisterDosenService.getStats();
      setDosenStats(data);
    } catch (error) {
      console.error("Error fetching dosen stats:", error);
      toast.error("Gagal memuat statistik dosen");
    } finally {
      setIsLoading(false);
    }
  };

  // PDRD data modules
  const pdrdModules = [
    {
      key: "dosen",
      name: "Dosen & Tendik",
      description: "Data SDM dosen dan tenaga kependidikan dari SISTER API",
      icon: <FiUsers className="w-8 h-8" />,
      color: "from-purple-500 to-purple-600",
      href: "/dashboard/sister-integrator/pdrd/dosen",
      stats: dosenStats
        ? {
            total: dosenStats.total_dosen,
            aktif: dosenStats.total_aktif,
            lastSync: dosenStats.last_sync,
          }
        : null,
      available: true,
    },
    {
      key: "penelitian",
      name: "Penelitian",
      description: "Data penelitian dosen dari SISTER API",
      icon: <FiActivity className="w-8 h-8" />,
      color: "from-blue-500 to-blue-600",
      href: "/dashboard/sister-integrator/pdrd/penelitian",
      stats: {
        total: 0,
        lastSync: null,
      },
      available: false,
    },
    {
      key: "pengabdian",
      name: "Pengabdian",
      description: "Data pengabdian masyarakat dari SISTER API",
      icon: <FiActivity className="w-8 h-8" />,
      color: "from-green-500 to-green-600",
      href: "/dashboard/sister-integrator/pdrd/pengabdian",
      stats: {
        total: 0,
        lastSync: null,
      },
      available: false,
    },
    {
      key: "publikasi",
      name: "Publikasi",
      description: "Data publikasi ilmiah dari SISTER API",
      icon: <FiBookOpen className="w-8 h-8" />,
      color: "from-orange-500 to-orange-600",
      href: "/dashboard/sister-integrator/pdrd/publikasi",
      stats: {
        total: 0,
        lastSync: null,
      },
      available: false,
    },
  ];

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Belum pernah sync";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Baru saja";
      if (diffMins < 60) return `${diffMins} menit yang lalu`;
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      if (diffDays < 30) return `${diffDays} hari yang lalu`;

      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Belum pernah sync";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        appName="SISTER Integrator"
        appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
        menuConfig={sisterIntegratorMenuConfig}
        pageTitle="Data PDRD"
      >
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" color="primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      appName="SISTER Integrator"
      appIcon={<RiGovernmentFill className="w-6 h-6 text-white" />}
      menuConfig={sisterIntegratorMenuConfig}
      pageTitle="Data PDRD"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiDatabase className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    Pangkalan Data Perguruan Tinggi (PDRD)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  Data PDRD Management
                </h1>
                <p className="text-purple-100 text-sm sm:text-base">
                  Kelola dan sinkronisasi data PDRD dari SISTER API Kemdikbud
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FiDatabase className="w-12 h-12" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDRD Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pdrdModules.map((module) => (
            <Link key={module.key} href={module.available ? module.href : "#"}>
              <Card
                isPressable={module.available}
                isDisabled={!module.available}
                className={`border-none shadow-lg hover:shadow-2xl transition-all duration-300 ${
                  module.available ? "hover:-translate-y-2" : "opacity-60"
                } overflow-hidden group relative`}
              >
                <div className="absolute inset-0 opacity-5">
                  <div
                    className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${module.color}`}
                  ></div>
                </div>

                <CardBody className="p-6 relative z-10">
                  <div className="flex flex-col gap-4">
                    {/* Icon */}
                    <div className="relative">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center text-white shadow-xl ${
                          module.available
                            ? "group-hover:scale-110"
                            : ""
                        } transition-transform duration-300`}
                      >
                        {module.icon}
                      </div>
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${module.color} opacity-20 blur-lg ${
                          module.available
                            ? "group-hover:opacity-30"
                            : ""
                        } transition-opacity`}
                      ></div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {module.name}
                        </h3>
                        {module.available && (
                          <FiArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
                        )}
                        {!module.available && (
                          <Chip size="sm" variant="flat" color="warning">
                            Soon
                          </Chip>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {module.description}
                      </p>
                    </div>

                    {/* Stats */}
                    {module.stats && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Total Records
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {module.stats.total?.toLocaleString() || "0"}
                          </span>
                        </div>
                        {module.stats.aktif !== undefined && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Aktif
                            </span>
                            <Chip size="sm" variant="flat" color="success">
                              {module.stats.aktif?.toLocaleString() || "0"}
                            </Chip>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>Last Sync</span>
                          <span>{formatDate(module.stats.lastSync)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Card */}
        <Card className="border-none shadow-md border-l-4 border-l-purple-500">
          <CardBody className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                <FiDatabase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                  Tentang Data PDRD
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Data PDRD (Pangkalan Data Perguruan Tinggi) berisi informasi lengkap tentang SDM dosen,
                  penelitian, pengabdian masyarakat, dan publikasi ilmiah yang tersinkronisasi dengan SISTER API Kemdikbud.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
