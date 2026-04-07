"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { simBakMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Chip, Button } from "@heroui/react";
import { FiCheckSquare, FiCheck, FiSend } from "react-icons/fi";
import DataTable from "@/shared/components/ui/DataTable";
import type { Column } from "@/shared/components/ui/DataTable";
import { dummyBatch, dummyKandidat } from "@/lib/services/sim-bak/dummyData";
import type { KandidatBatch } from "@/lib/services/sim-bak/types";
import toast, { Toaster } from "react-hot-toast";

type VerifikasiStatus = "belum_dicek" | "valid" | "tidak_valid" | "dikecualikan";

interface KandidatLocal extends KandidatBatch {
  localStatus: VerifikasiStatus;
  localCatatan: string;
}

const jenisSkLabels: Record<string, string> = {
  HABIS_MASA_MUKIM: "Habis Masa Mukim (HMM)",
  PUTUS_STUDI: "Putus Studi",
};

export default function BatchVerifikasiPage() {
  const { user } = useAuth();

  const verifikasiBatches = useMemo(
    () => dummyBatch.filter((b) => b.status === "verifikasi_fakultas"),
    []
  );

  const [kandidatState, setKandidatState] = useState<Record<string, KandidatLocal[]>>(() => {
    const state: Record<string, KandidatLocal[]> = {};
    verifikasiBatches.forEach((batch) => {
      state[batch.id_batch] = dummyKandidat
        .filter((k) => k.id_batch === batch.id_batch)
        .map((k) => ({
          ...k,
          localStatus: k.status_verifikasi as VerifikasiStatus,
          localCatatan: k.catatan_verifikasi || "",
        }));
    });
    return state;
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  const updateKandidatStatus = (batchId: string, kandidatId: string, status: VerifikasiStatus) => {
    setKandidatState((prev) => ({
      ...prev,
      [batchId]: prev[batchId].map((k) =>
        k.id_kandidat === kandidatId ? { ...k, localStatus: status } : k
      ),
    }));
  };

  const updateKandidatCatatan = (batchId: string, kandidatId: string, catatan: string) => {
    setKandidatState((prev) => ({
      ...prev,
      [batchId]: prev[batchId].map((k) =>
        k.id_kandidat === kandidatId ? { ...k, localCatatan: catatan } : k
      ),
    }));
  };

  const bulkValidAll = (batchId: string) => {
    setKandidatState((prev) => ({
      ...prev,
      [batchId]: prev[batchId].map((k) => ({ ...k, localStatus: "valid" as VerifikasiStatus })),
    }));
    toast.success("Semua kandidat diset sebagai Valid");
  };

  const submitVerifikasi = (batchId: string) => {
    const batch = verifikasiBatches.find((b) => b.id_batch === batchId);
    toast.success(`Verifikasi batch ${batch?.id_batch || batchId} berhasil disubmit`);
  };

  const makeColumns = (batchId: string): Column<KandidatLocal>[] => [
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
      key: "semester_terakhir",
      label: "Semester",
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
      key: "localStatus",
      label: "Status",
      align: "center",
      render: (item) => (
        <select
          value={item.localStatus}
          onChange={(e) => updateKandidatStatus(batchId, item.id_kandidat, e.target.value as VerifikasiStatus)}
          className="text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
        >
          <option value="belum_dicek">Belum Dicek</option>
          <option value="valid">Valid</option>
          <option value="tidak_valid">Tidak Valid</option>
          <option value="dikecualikan">Dikecualikan</option>
        </select>
      ),
    },
    {
      key: "localCatatan",
      label: "Catatan",
      render: (item) => (
        <input
          type="text"
          value={item.localCatatan}
          onChange={(e) => updateKandidatCatatan(batchId, item.id_kandidat, e.target.value)}
          placeholder="Catatan..."
          className="text-sm ring-1 !ring-gray-400 !border !border-gray-400 shadow-sm rounded-lg px-2 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 w-full min-w-[150px] focus:ring-2 focus:ring-blue-500"
        />
      ),
    },
  ];

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI MBAK"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="sim-bak"
      fallbackMenus={simBakMenuConfig}
      pageTitle="Verifikasi Fakultas"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Verifikasi Fakultas
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Verifikasi kandidat batch oleh admin fakultas
          </p>
        </div>

        {verifikasiBatches.length === 0 ? (
          <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
            <CardBody className="p-10 text-center">
              <FiCheckSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Tidak ada batch yang memerlukan verifikasi saat ini
              </p>
            </CardBody>
          </Card>
        ) : (
          verifikasiBatches.map((batch) => (
            <Card key={batch.id_batch} className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
              <CardBody className="p-0">
                {/* Batch Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {jenisSkLabels[batch.jenis_sk] || batch.jenis_sk}
                        </h2>
                        <Chip size="sm" color="warning" variant="flat">Verifikasi</Chip>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Periode: {batch.periode_akademik} | {batch.jumlah_kandidat} kandidat
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        color="success"
                        startContent={<FiCheck className="w-4 h-4" />}
                        onPress={() => bulkValidAll(batch.id_batch)}
                      >
                        Verifikasi Semua Valid
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        startContent={<FiSend className="w-4 h-4" />}
                        onPress={() => submitVerifikasi(batch.id_batch)}
                      >
                        Submit Verifikasi
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Kandidat Table */}
                <DataTable
                  data={kandidatState[batch.id_batch] || []}
                  columns={makeColumns(batch.id_batch)}
                  searchable={true}
                  searchKeys={["npm", "nm_mahasiswa", "nm_prodi"]}
                  searchPlaceholder="Cari kandidat..."
                  noWrapper
                />
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
