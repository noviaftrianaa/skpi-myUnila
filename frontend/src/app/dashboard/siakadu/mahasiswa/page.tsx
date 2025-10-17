"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { Card, CardBody, Button, Input, Chip } from "@heroui/react";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { MdSchool } from "react-icons/md";
import { siakaduMenuConfig } from "../config/menuConfig";

export default function MahasiswaPage() {
  useRequireAuth();

  const mahasiswa = [
    {
      npm: "2115101001",
      nama: "Ahmad Fauzi",
      prodi: "Teknik Informatika",
      angkatan: "2021",
      status: "Aktif",
    },
    {
      npm: "2115101002",
      nama: "Siti Nurhaliza",
      prodi: "Sistem Informasi",
      angkatan: "2021",
      status: "Aktif",
    },
    {
      npm: "2015101003",
      nama: "Budi Santoso",
      prodi: "Teknik Informatika",
      angkatan: "2020",
      status: "Cuti",
    },
  ];

  return (
    <DashboardLayout
      appName="Siakadu"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={siakaduMenuConfig}
      pageTitle="Data Mahasiswa"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Data Mahasiswa
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Kelola data mahasiswa secara terpusat
            </p>
          </div>
          <Button
            color="primary"
            startContent={<FiPlus />}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Tambah Mahasiswa
          </Button>
        </div>

        {/* Filter & Search */}
        <Card className="border-none shadow-sm">
          <CardBody className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Cari mahasiswa..."
                startContent={<FiSearch className="text-gray-400" />}
                className="flex-1"
              />
              <Button variant="flat">Filter</Button>
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
                      NPM
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Program Studi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Angkatan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {mahasiswa.map((mhs, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {mhs.npm}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {mhs.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {mhs.prodi}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {mhs.angkatan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Chip
                          size="sm"
                          color={mhs.status === "Aktif" ? "success" : "warning"}
                          variant="flat"
                        >
                          {mhs.status}
                        </Chip>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <Button isIconOnly size="sm" variant="light" color="primary">
                            <FiEye />
                          </Button>
                          <Button isIconOnly size="sm" variant="light" color="warning">
                            <FiEdit2 />
                          </Button>
                          <Button isIconOnly size="sm" variant="light" color="danger">
                            <FiTrash2 />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
