"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { Card, CardBody, Button } from "@heroui/react";
import { FiHome, FiArrowLeft } from "react-icons/fi";
import { MdSecurity, MdConstruction } from "react-icons/md";
import { manajemenAksesMenuConfig } from "../../config/menuConfig";
import Link from "next/link";

export default function DaftarUnitPage() {
  useRequireAuth();

  return (
    <DashboardLayout
      appName="Manajemen Akses"
      appIcon={<MdSecurity className="w-6 h-6 text-white" />}
      menuConfig={manajemenAksesMenuConfig}
      pageTitle="Daftar Unit"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-lg w-full border-none shadow-xl">
          <CardBody className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4">
                <MdConstruction className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Fitur Daftar Unit sedang dalam pengembangan
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <FiHome className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Kelola struktur organisasi unit
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <FiHome className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Hierarki fakultas, jurusan, prodi
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <FiHome className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Assign pengguna ke unit
                </span>
              </div>
            </div>

            <Button
              as={Link}
              href="/dashboard/manajemen-akses"
              color="primary"
              variant="flat"
              startContent={<FiArrowLeft className="w-4 h-4" />}
            >
              Kembali ke Dashboard
            </Button>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
