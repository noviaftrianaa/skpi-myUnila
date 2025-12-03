"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { Card, CardBody, Button } from "@heroui/react";
import { FiClock, FiArrowLeft, FiDatabase, FiSettings } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import Link from "next/link";
import { myunilaIntegratorMenuConfig } from "@/app/dashboard/integrator/config/menuConfig";

interface ComingSoonPageProps {
  title: string;
  description?: string;
  parentModule?: string;
  features?: string[];
}

export default function ComingSoonPage({
  title,
  description,
  parentModule,
  features = [],
}: ComingSoonPageProps) {
  useRequireAuth();

  const defaultFeatures = [
    "Sinkronisasi data otomatis",
    "Manajemen data terintegrasi",
    "Monitoring real-time",
    "Export & import data",
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <DashboardLayout
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={myunilaIntegratorMenuConfig}
      pageTitle={title}
    >
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-none shadow-xl">
          <CardBody className="p-8 sm:p-12">
            <div className="text-center space-y-6">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 mx-auto">
                <FiClock className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h1>
                {parentModule && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    {parentModule}
                  </p>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                {description ||
                  "Fitur ini sedang dalam tahap pengembangan. Kami sedang bekerja keras untuk menghadirkan pengalaman terbaik untuk Anda."}
              </p>

              {/* Coming Soon Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium text-sm">
                <FiClock className="w-4 h-4" />
                Coming Soon
              </div>

              {/* Planned Features */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiSettings className="w-4 h-4 text-emerald-600" />
                  Fitur yang akan hadir:
                </h3>
                <ul className="space-y-2">
                  {displayFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Link href="/dashboard/integrator">
                  <Button
                    variant="bordered"
                    startContent={<FiArrowLeft className="w-4 h-4" />}
                    className="border-emerald-600 text-emerald-600"
                  >
                    Kembali ke Dashboard
                  </Button>
                </Link>
                <Button
                  color="primary"
                  startContent={<FiDatabase className="w-4 h-4" />}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600"
                  isDisabled
                >
                  Lihat Data
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
