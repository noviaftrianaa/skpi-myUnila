"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiUsers, FiEye, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getBatchList } from "@/lib/services/sim-bak/simBakService";
import type { BatchPenetapan } from "@/lib/services/sim-bak/types";
import { StatusBadge } from "../../components";
import EmptyState from "../../components/EmptyState";

const jenisLabel: Record<string, { label: string; tw: string }> = {
  habis_masa_mukim: { label: "HMM", tw: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  putus_studi: { label: "Putus Studi", tw: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" },
};

export default function BatchVerifikasiPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<BatchPenetapan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterJenis, setFilterJenis] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil batch yang statusnya menunggu verifikasi fakultas
      const result = await getBatchList({ page: 1, limit: 50, status: "kandidat_ditarik", jenis_batch: filterJenis || undefined });
      const result2 = await getBatchList({ page: 1, limit: 50, status: "verifikasi_fakultas", jenis_batch: filterJenis || undefined });
      setData([...(result.data ?? []), ...(result2.data ?? [])]);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [filterJenis]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const columns: Column<BatchPenetapan>[] = [
    { key: "kode_batch", label: "Kode Batch", sortable: true,
      render: (item) => <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{item.kode_batch}</span>
    },
    { key: "nm_batch", label: "Nama Batch", sortable: true,
      render: (item) => <span className="text-sm text-gray-900 dark:text-white">{item.nm_batch}</span>
    },
    { key: "jenis_batch", label: "Jenis",
      render: (item) => {
        const cfg = jenisLabel[item.jenis_batch];
        return cfg ? <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.tw}`}>{cfg.label}</span> : <span>{item.jenis_batch}</span>;
      }
    },
    { key: "jumlah_kandidat", label: "Kandidat", align: "center" as const,
      render: (item) => (
        <div className="text-center">
          <span className="text-sm font-bold">{item.jumlah_kandidat}</span>
          <span className="text-xs text-gray-400 ml-1">({item.jumlah_terverifikasi ?? 0} diverifikasi)</span>
        </div>
      )
    },
    { key: "status", label: "Status",
      render: (item) => <StatusBadge status={item.status} />
    },
    { key: "aksi", label: "Aksi", align: "center" as const,
      render: (item) => (
        <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
          onPress={() => router.push(`/dashboard/sim-bak/batch/${item.id_batch_penetapan}`)}>
          Verifikasi
        </Button>
      )
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Verifikasi Batch">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verifikasi Batch</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Batch yang menunggu verifikasi dari admin fakultas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="border-none shadow-md rounded-xl"><CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white"><FiUsers className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">Total Batch</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.length}</p>
              </div>
            </div>
          </CardBody></Card>
          <Card className="border-none shadow-md rounded-xl"><CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white"><FiUsers className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">HMM</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.filter(b => b.jenis_batch === "habis_masa_mukim").length}</p>
              </div>
            </div>
          </CardBody></Card>
          <Card className="border-none shadow-md rounded-xl"><CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white"><FiUsers className="w-5 h-5" /></div>
              <div>
                <p className="text-xs text-gray-500">Putus Studi</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{data.filter(b => b.jenis_batch === "putus_studi").length}</p>
              </div>
            </div>
          </CardBody></Card>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : data.length === 0 ? (
          <EmptyState
            variant="document"
            title="Tidak ada batch yang perlu diverifikasi"
            description="Semua batch sudah diverifikasi atau belum ada batch baru"
          />
        ) : (
          <DataTable data={data} columns={columns} searchable searchKeys={["kode_batch", "nm_batch"]}
            searchPlaceholder="Cari batch..."
            filterSlot={
              <select value={filterJenis} onChange={e => setFilterJenis(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Jenis</option>
                <option value="habis_masa_mukim">HMM</option>
                <option value="putus_studi">Putus Studi</option>
              </select>
            }
          />
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
