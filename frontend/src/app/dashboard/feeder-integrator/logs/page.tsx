"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import {
  Card,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Pagination,
  Select,
  SelectItem
} from "@heroui/react";
import { MdSchool } from "react-icons/md";
import { FiFileText, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";

export default function SyncLogsPage() {
  useRequireAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages] = useState(1);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Sync Logs"
    >
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
          <CardBody className="p-6">
            <div className="flex items-center gap-4 text-white">
              <FiFileText className="w-12 h-12" />
              <div>
                <h1 className="text-2xl font-bold">Sync Logs</h1>
                <p className="text-blue-100">Riwayat sinkronisasi data mahasiswa</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiCheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <p className="text-xs opacity-90">Success</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiXCircle className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <p className="text-xs opacity-90">Failed</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
            <CardBody className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <p className="text-xs opacity-90">Total Logs</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Status" placeholder="Semua Status">
                <SelectItem key="all">Semua Status</SelectItem>
                <SelectItem key="success">Success</SelectItem>
                <SelectItem key="failed">Failed</SelectItem>
              </Select>
              <Select label="Endpoint" placeholder="Semua Endpoint">
                <SelectItem key="all">Semua Endpoint</SelectItem>
                <SelectItem key="mahasiswa">Mahasiswa</SelectItem>
              </Select>
              <Select label="Periode" placeholder="Semua Waktu">
                <SelectItem key="all">Semua Waktu</SelectItem>
                <SelectItem key="today">Hari Ini</SelectItem>
                <SelectItem key="week">Minggu Ini</SelectItem>
                <SelectItem key="month">Bulan Ini</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sync History</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiFileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No sync logs available</p>
                <p className="text-sm mt-2">Sync logs will appear here after synchronization operations</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
