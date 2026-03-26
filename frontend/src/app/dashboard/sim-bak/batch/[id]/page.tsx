"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiArrowLeft, FiSend, FiCheckCircle, FiDownload, FiLock } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyBatch, dummyKandidat } from "@/lib/services/sim-bak/dummyData";
import type { KandidatBatch } from "@/lib/services/sim-bak/types";
import toast, { Toaster } from "react-hot-toast";

const statusConfig: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "danger" }> = {
  draft: { label: "Draft", color: "default" },
  verifikasi_fakultas: { label: "Verifikasi Fakultas", color: "warning" },
  finalisasi: { label: "Finalisasi", color: "primary" },
  terbit: { label: "Terbit", color: "success" },
};

const verifikasiConfig: Record<string, { label: string; color: "default" | "primary" | "warning" | "success" | "danger" }> = {
  belum_dicek: { label: "Belum Dicek", color: "default" },
  valid: { label: "Valid", color: "success" },
  tidak_valid: { label: "Tidak Valid", color: "danger" },
  dikecualikan: { label: "Dikecualikan", color: "warning" },
};

const jenisSkLabels: Record<string, string> = {
  HABIS_MASA_MUKIM: "Habis Masa Mukim (HMM)",
  PUTUS_STUDI: "Putus Studi",
};

export default function BatchDetailPage() {
  useRequireAuth();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const batch = dummyBatch.find((b) => b.id_batch === id);
  const kandidat = dummyKandidat.filter((k) => k.id_batch === id);

  const fakultasBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    kandidat.forEach((k) => {
      map.set(k.nm_fakultas, (map.get(k.nm_fakultas) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [kandidat]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!batch) {
    return (
      <DashboardLayoutWithDynamicMenu
        appName="SI MBAK"
        appIcon={<MdDashboard className="w-6 h-6" />}
        appKey="sim-bak"
        fallbackMenus={simBakMenuConfig}
        pageTitle="Batch Tidak Ditemukan"
      >
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Batch dengan ID &quot;{id}&quot; tidak ditemukan.</p>
          <Button variant="flat" onPress={() => router.push("/dashboard/sim-bak/batch")}>
            Kembali ke Daftar Batch
          </Button>
        </div>
      </DashboardLayoutWithDynamicMenu>
    );
  }

  const batchStatus = statusConfig[batch.status];

  const handleAction = (action: string) => {
    const messages: Record<string, string> = {
      kirim: "Batch berhasil dikirim ke fakultas untuk verifikasi",
      finalisasi: "Batch berhasil difinalisasi",
      terbitkan: "SK berhasil diterbitkan",
      download: "Mengunduh file SK...",
    };
    toast.success(messages[action] || "Aksi berhasil dilakukan");
  };

  const columns: Column<KandidatBatch>[] = [
    {
      key: "npm",
      label: "NPM",
      sortable: true,
      render: (item) => <span className="font-mono text-sm">{item.npm}</span>,
    },
    {
      key: "nm_mahasiswa",
      label: "Nama",
      sortable: true,
      render: (item) => <span className="text-sm font-medium text-gray-900 dark:text-white">{item.nm_mahasiswa}</span>,
    },
    {
      key: "nm_prodi",
      label: "Prodi",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_prodi}</span>,
    },
    {
      key: "nm_fakultas",
      label: "Fakultas",
      sortable: true,
      render: (item) => <span className="text-sm text-gray-700 dark:text-gray-300">{item.nm_fakultas}</span>,
    },
    {
      key: "semester_terakhir",
      label: "Semester Terakhir",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.semester_terakhir}</span>,
    },
    {
      key: "ipk_terakhir",
      label: "IPK",
      align: "center",
      sortable: true,
      render: (item) => <span className="text-sm">{item.ipk_terakhir}</span>,
    },
    {
      key: "status_verifikasi",
      label: "Status Verifikasi",
      align: "center",
      sortable: true,
      render: (item) => {
        const cfg = verifikasiConfig[item.status_verifikasi];
        return <Chip size="sm" color={cfg?.color || "default"} variant="flat">{cfg?.label || item.status_verifikasi}</Chip>;
      },
    },
    {
      key: "catatan_verifikasi",
      label: "Catatan",
      render: (item) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {item.catatan_verifikasi || "-"}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle={`Detail Batch - ${batch.no_sk || batch.id_batch}`}
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="light"
            isIconOnly
            onPress={() => router.push("/dashboard/sim-bak/batch")}
          >
            <FiArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Detail Batch
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {batch.no_sk || "SK belum diterbitkan"}
            </p>
          </div>
        </div>

        {/* Batch Info Card */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">No. SK</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {batch.no_sk || "Belum Terbit"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jenis</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {jenisSkLabels[batch.jenis_sk] || batch.jenis_sk}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Periode</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{batch.periode_akademik}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  <Chip size="sm" color={batchStatus?.color || "default"} variant="flat">
                    {batchStatus?.label || batch.status}
                  </Chip>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Tanggal SK</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {batch.tgl_sk || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Jumlah Kandidat</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{batch.jumlah_kandidat}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Per-fakultas Breakdown */}
        {fakultasBreakdown.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Breakdown per Fakultas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {fakultasBreakdown.map((f) => (
                <Card key={f.name} className="border-none shadow-sm rounded-lg dark:bg-gray-800">
                  <CardBody className="p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{f.name}</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{f.count}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Kandidat DataTable */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Kandidat</h2>
            </div>
            <DataTable
              data={kandidat}
              columns={columns}
              searchable={true}
              searchKeys={["npm", "nm_mahasiswa", "nm_prodi", "nm_fakultas"]}
              searchPlaceholder="Cari kandidat..."
              noWrapper
            />
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="flat"
            startContent={<FiArrowLeft className="w-4 h-4" />}
            onPress={() => router.push("/dashboard/sim-bak/batch")}
          >
            Kembali
          </Button>
          <div className="flex-1" />

          {batch.status === "draft" && (
            <Button
              color="primary"
              startContent={<FiSend className="w-4 h-4" />}
              onPress={() => handleAction("kirim")}
            >
              Kirim ke Fakultas
            </Button>
          )}

          {batch.status === "verifikasi_fakultas" && (
            <Button
              color="primary"
              startContent={<FiLock className="w-4 h-4" />}
              onPress={() => handleAction("finalisasi")}
            >
              Finalisasi Batch
            </Button>
          )}

          {batch.status === "finalisasi" && (
            <Button
              color="success"
              startContent={<FiCheckCircle className="w-4 h-4" />}
              onPress={() => handleAction("terbitkan")}
            >
              Terbitkan SK
            </Button>
          )}

          {batch.status === "terbit" && (
            <Button
              color="primary"
              startContent={<FiDownload className="w-4 h-4" />}
              onPress={() => handleAction("download")}
            >
              Download SK
            </Button>
          )}
        </div>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
