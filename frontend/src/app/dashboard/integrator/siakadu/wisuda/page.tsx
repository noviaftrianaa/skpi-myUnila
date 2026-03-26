"use client";

import { useState, useEffect, useCallback } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { myunilaIntegratorMenuConfig } from "../../config/menuConfig";
import { myunilaClient } from "@/lib/api/myunilaClient";

const APP_KEY = "myunila-integrator";

import { Card, CardBody, Chip } from "@heroui/react";
import { FiAward, FiDatabase, FiClock, FiAlertCircle } from "react-icons/fi";
import { MdSchool } from "react-icons/md";

interface Lulusan {
  nim: string;
  nama: string;
  nm_prodi?: string;
  nm_fakultas?: string;
  angkatan?: string;
  ipk?: number;
  status?: string;
  last_sync?: string;
}

export default function SiakaduWisudaPage() {
  useRequireAuth();

  const [data, setData] = useState<Lulusan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await myunilaClient.get("/siakadu/mahasiswa", {
        params: { page: currentPage, limit: rowsPerPage, search: searchQuery || undefined, status: "L" },
      });
      const r = response.data;
      if (r.success) {
        setData(r.data || []);
        setTotalRecords(r.meta?.total || 0);
      }
    } catch (e) {
      console.error("Error fetching data:", e);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, rowsPerPage, searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns: Column<Lulusan>[] = [
    { key: "nim", label: "NIM", sortable: true },
    { key: "nama", label: "Nama", sortable: true },
    { key: "nm_prodi", label: "Prodi" },
    { key: "angkatan", label: "Angkatan", align: "center" },
    { key: "ipk", label: "IPK", align: "center", render: (item) => item.ipk?.toFixed(2) || "-" },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (item) => (
        <Chip size="sm" variant="flat" color="success">
          {item.status === "L" ? "Lulus" : item.status || "Lulus"}
        </Chip>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="MyUnila Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={myunilaIntegratorMenuConfig}
      pageTitle="Data Wisuda / Lulusan"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Data Wisuda / Lulusan
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Data mahasiswa yang telah lulus dari SIAKADU
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
                  <FiAward className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Lulusan</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {isLoading ? "..." : totalRecords.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="border-none shadow-md">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                  <FiDatabase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sumber Data</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">SIAKADU</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="border-none shadow-md bg-amber-50 dark:bg-amber-900/20">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    Filter: status = Lulus
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="border-none shadow-md">
          <CardBody className="p-0 sm:p-4">
            <DataTable
              data={data}
              columns={columns}
              searchable
              searchPlaceholder="Cari NIM atau nama lulusan..."
              loading={isLoading}
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
