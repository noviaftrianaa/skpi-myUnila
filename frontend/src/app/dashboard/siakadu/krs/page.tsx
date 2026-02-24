"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { siakaduMenuConfig } from "../config/menuConfig";

export default function KRSPage() {
  useRequireAuth();

  const matakuliah = [
    {
      kode: "TIF301",
      nama: "Pemrograman Web",
      sks: 3,
      semester: 5,
      dosen: "Dr. Budi Santoso",
      jadwal: "Senin, 08:00-10:30",
    },
    {
      kode: "TIF302",
      nama: "Basis Data",
      sks: 3,
      semester: 5,
      dosen: "Prof. Ahmad Fauzi",
      jadwal: "Rabu, 13:00-15:30",
    },
    {
      kode: "TIF303",
      nama: "Sistem Operasi",
      sks: 3,
      semester: 5,
      dosen: "Dr. Siti Nurhaliza",
      jadwal: "Jumat, 08:00-10:30",
    },
  ];

  const totalSKS = matakuliah.reduce((sum, mk) => sum + mk.sks, 0);

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Siakadu"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey="siakadu"
      fallbackMenus={siakaduMenuConfig}
      pageTitle="Kartu Rencana Studi (KRS)"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Kartu Rencana Studi (KRS)
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Semester Genap 2024/2025
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              startContent={<FiPlus />}
              className="bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              Tambah Matakuliah
            </Button>
            <Button color="success" startContent={<FiSave />}>
              Simpan KRS
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total SKS Diambil
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {totalSKS} SKS
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Maksimal SKS
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  24 SKS
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">IPS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  3.75
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Status KRS
                </p>
                <Chip color="warning" variant="flat" className="mt-2">
                  Belum Disetujui
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Table */}
        <Card className="border-none shadow-sm">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Kode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Matakuliah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      SKS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Dosen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Jadwal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {matakuliah.map((mk, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {mk.kode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {mk.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {mk.sks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {mk.dosen}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {mk.jadwal}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                        >
                          <FiTrash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
