"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { myunilaClient } from "@/lib/api/myunilaClient";

const APP_KEY = "myunila-integrator";

import { Card, CardBody, Chip } from "@heroui/react";
import { FiUsers, FiDatabase, FiClock } from "react-icons/fi";
import { MdSchool } from "react-icons/md";

interface Pegawai {
  id_pegawai: string;
  nm_pegawai: string;
  nip?: string;
  nidn?: string;
  jk?: string;
  jns_pegawai?: string;
  jns_tenaga?: string;
  nama_org2?: string;
  nama_org3?: string;
  status?: string;
  last_sync?: string;
}

interface StatsData {
  total_pegawai: number;
  total_dosen_aktif: number;
  total_tendik_aktif: number;
  last_sync?: string;
}

export default function SiakaduPegawaiPage() {
  useRequireAuth();

  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [data, setData] = useState<Pegawai[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const response = await myunilaClient.get("/sikep/pegawai/stats");
      setStats(response.data?.data);
    } catch (e) {
      console.error("Error fetching stats:", e);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const response = await myunilaClient.get("/sikep/pegawai", {
        params: { page: currentPage, limit: rowsPerPage, search: searchQuery || undefined },
      });
      const r = response.data;
      if (r.success) {
        setData(r.data || []);
        setTotalRecords(r.meta?.total || 0);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoadingData(false);
    }
  }, [currentPage, rowsPerPage, searchQuery]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<Pegawai>[] = [
    { key: "nm_pegawai", label: "Nama Pegawai", sortable: true },
    { key: "nip", label: "NIP", sortable: true, render: (item) => item.nip?.trim() || "-" },
    { key: "nidn", label: "NIDN", render: (item) => item.nidn?.trim() || "-" },
    { key: "jk", label: "JK", align: "center", render: (item) => item.jk?.trim() || "-" },
    { key: "jns_tenaga", label: "Jenis", sortable: true },
    { key: "nama_org3", label: "Fakultas" },
    { key: "nama_org2", label: "Unit" },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (item) => (
        <Chip size="sm" variant="flat" color={item.status === "Aktif" ? "success" : "default"}>
          {item.status || "-"}
        </Chip>
      ),
    },
  ];

  const statCards = [
    { label: "Total Pegawai", value: stats?.total_pegawai ?? 0, icon: <FiUsers className="w-5 h-5" />, color: "from-blue-500 to-blue-600" },
    { label: "Dosen Aktif", value: stats?.total_dosen_aktif ?? 0, icon: <FiUsers className="w-5 h-5" />, color: "from-green-500 to-green-600" },
    { label: "Tendik Aktif", value: stats?.total_tendik_aktif ?? 0, icon: <FiUsers className="w-5 h-5" />, color: "from-purple-500 to-purple-600" },
    { label: "Total Records", value: totalRecords, icon: <FiDatabase className="w-5 h-5" />, color: "from-orange-500 to-orange-600" },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Data Pegawai (SIKEP)"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Data Pegawai / Dosen
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Data pegawai dari SIKEP — {stats?.total_pegawai?.toLocaleString("id-ID") || "..."} records
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <Card key={i} className="border-none shadow-md">
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white`}>
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{s.label}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {isLoadingStats ? "..." : s.value.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {stats?.last_sync && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FiClock className="w-3 h-3" />
            Last sync: {new Date(stats.last_sync).toLocaleString("id-ID")}
          </div>
        )}

        {/* Data Table */}
        <Card className="border-none shadow-md">
          <CardBody className="p-0 sm:p-4">
            <DataTable
              data={data}
              columns={columns}
              searchable
              searchPlaceholder="Cari nama atau NIP..."
              loading={isLoadingData}
              serverSide
              totalRecords={totalRecords}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
              onSearchChange={(q) => { setSearchQuery(q); setCurrentPage(1); }}
              defaultRowsPerPage={rowsPerPage}
            />
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
