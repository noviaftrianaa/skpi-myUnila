"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Chip, Button } from "@heroui/react";
import { FiClock, FiEye, FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { getApprovalQueue } from "@/lib/services/sim-bak/simBakService";
import type { Pengajuan } from "@/lib/services/sim-bak/types";

export default function PersetujuanPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Pengajuan[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getApprovalQueue({ page, limit: 10 });
      setData(result.data);
      setTotal(result.pagination?.total ?? 0);
    } catch { setData([]); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { if (user) fetchData(); }, [user, fetchData]);

  if (!user) return <div className="flex items-center justify-center min-h-screen"><Spinner size="lg" /></div>;

  const columns: Column<Pengajuan>[] = [
    { key: "nomor_permohonan", label: "No. Pengajuan", render: (item) => <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">{item.nomor_permohonan}</span> },
    { key: "pemohon", label: "Pemohon", render: (item) => (
      <div>
        <p className="font-medium text-sm text-gray-900 dark:text-white">{item.nm_mahasiswa || "-"}</p>
        <p className="text-xs text-gray-500">{item.nim} · {item.nm_prodi}</p>
      </div>
    )},
    { key: "layanan", label: "Layanan", render: (item) => <span className="text-sm">{item.nm_layanan || "-"}</span> },
    { key: "tgl_diajukan", label: "Tgl Ajuan", render: (item) => (
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {item.tgl_diajukan ? new Date(item.tgl_diajukan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
      </span>
    )},
    { key: "status", label: "Status", render: (item) => <Chip size="sm" variant="flat" color="warning">Menunggu Persetujuan</Chip> },
    { key: "aksi", label: "Aksi", align: "center" as const, render: (item) => (
      <Button size="sm" variant="flat" color="primary" startContent={<FiEye className="w-3.5 h-3.5" />}
        onPress={() => router.push(`/dashboard/sim-bak/admin/persetujuan/${item.id_pengajuan}`)}>Review</Button>
    )},
  ];

  return (
    <DashboardLayoutWithDynamicMenu appName="SI MBAK" appIcon={<MdDashboard className="w-6 h-6" />} appKey="sim-bak" fallbackMenus={simBakMenuConfig} pageTitle="Persetujuan">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Persetujuan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pengajuan yang menunggu persetujuan Anda</p>
        </div>

        <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl p-5 text-white shadow-lg inline-flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><FiClock className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-white/80">Menunggu Persetujuan</p>
            <p className="text-3xl font-bold">{total}</p>
          </div>
        </div>

        {data.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FiAlertCircle className="w-12 h-12 mb-3" />
            <p className="text-lg font-medium">Tidak ada pengajuan yang menunggu</p>
            <p className="text-sm">Semua pengajuan sudah ditinjau</p>
          </div>
        ) : (
          <DataTable data={data} columns={columns} searchable searchKeys={["nomor_permohonan", "nm_mahasiswa", "nm_layanan"]}
            searchPlaceholder="Cari pengajuan..." defaultRowsPerPage={10} />
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
