"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, Button, Chip, Spinner } from "@heroui/react";
import {
  FiArrowLeft,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { useQuery } from "@tanstack/react-query";
import {
  executiveAkreditasiService,
  type Fakultas,
  type Prodi,
  type JenjangProdi,
} from "@/lib/services/executive";

// ========================================
// Helper Functions
// ========================================

const getAkreditasiBadgeColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    Unggul: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white",
    "Baik Sekali": "bg-gradient-to-r from-green-400 to-green-600 text-white",
    Baik: "bg-gradient-to-r from-emerald-400 to-emerald-600 text-white",
    A: "bg-gradient-to-r from-blue-400 to-blue-600 text-white",
    B: "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white",
    C: "bg-gradient-to-r from-orange-400 to-orange-600 text-white",
    Proses: "bg-gradient-to-r from-gray-400 to-gray-600 text-white",
  };
  return colorMap[status] || "bg-gray-200 text-gray-700";
};

const calculateTotalJenjangProdi = (
  jenjangProdi: JenjangProdi[] | undefined,
): number => jenjangProdi?.reduce((sum, j) => sum + j.jumlah, 0) ?? 0;

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

// ========================================
// Components
// ========================================

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => (
  <Card className={`text-white ${color}`}>
    <CardBody className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="w-8 h-8 opacity-80">{icon}</div>
      </div>
    </CardBody>
  </Card>
);

// ========================================
// Main Page Component
// ========================================

export default function AkreditasiPage() {
  const [selectedFakultas, setSelectedFakultas] = useState<Fakultas | null>(
    null,
  );

  // Fetch fakultas data
  const {
    data: fakultasData = [],
    isLoading: isLoadingFakultas,
    error: fakultasError,
  } = useQuery({
    queryKey: ["akreditasi", "fakultas"],
    queryFn: () => executiveAkreditasiService.getAllFakultas(),
  });

  // Handle fakultas click - drill down to prodi
  const handleFakultasClick = (fakultas: Fakultas) => {
    setSelectedFakultas(fakultas);
  };

  // Handle back to fakultas list
  const handleBack = () => {
    setSelectedFakultas(null);
  };

  // Calculate statistics
  const stats = {
    totalFakultas: fakultasData.length,
    totalProdiAktif: fakultasData.reduce((sum, f) => sum + f.prodi_aktif, 0),
    totalProdiReakreditasi: fakultasData.reduce(
      (sum, f) => sum + f.jumlah_prodi_reakreditasi,
      0,
    ),
    totalJenjangProdi: fakultasData.reduce(
      (sum, f) => sum + calculateTotalJenjangProdi(f.jenjang_prodi),
      0,
    ),
  };

  // Table columns for Fakultas
  const fakultasColumns: Column<Fakultas>[] = [
    {
      key: "no",
      label: "No",
      align: "center",
      width: "60px",
      render: (_fakultas, index = 0) => index + 1,
    },
    {
      key: "nama_fakultas",
      label: "Fakultas",
      render: (item) => (
        <button
          onClick={() => handleFakultasClick(item)}
          className="font-semibold text-left text-blue-600 transition-colors hover:text-blue-800 hover:underline"
        >
          {item.nama_lembaga}
        </button>
      ),
    },
    {
      key: "jenjang_prodi",
      label: "Jumlah Jenjang Prodi",
      align: "center",
      render: (item) => (
        <div className="flex flex-wrap justify-center gap-1">
          <Chip size="sm" variant="flat" className="text-xs" color="primary">
            {item.total_prodi}
          </Chip>
        </div>
      ),
    },
    {
      key: "jumlah_prodi_aktif",
      label: "Jumlah Prodi Aktif",
      align: "center",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          className="text-xs"
          color="success"
          startContent={<FiCheckCircle className="w-3 h-3" />}
        >
          {item.jumlah_prodi_aktif}
        </Chip>
      ),
    },
    {
      key: "jumlah_prodi_reakreditasi",
      label: "Jumlah Prodi Reakreditasi",
      align: "center",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          className="text-xs"
          color="warning"
          startContent={<FiClock className="w-3 h-3" />}
        >
          {item.jumlah_prodi_reakreditasi}
        </Chip>
      ),
    },
  ];

  // Loading state
  if (isLoadingFakultas) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Error state
  if (fakultasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiAlertCircle className="w-16 h-16 text-danger" />
        <p className="text-lg text-danger">Gagal memuat data akreditasi</p>
        <p className="text-sm text-gray-500">
          {(fakultasError as Error).message || "Terjadi kesalahan pada server"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl"
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FiAward className="w-8 h-8 text-myunila" />
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedFakultas
                ? `Akreditasi - ${selectedFakultas.nama_fakultas}`
                : "Data Akreditasi Program Studi"}
            </h1>
          </div>
          <p className="text-gray-600 ml-11">
            {selectedFakultas
              ? "Daftar program studi beserta status akreditasinya"
              : "Ringkasan akreditasi program studi per fakultas"}
          </p>
        </div>

        {/* Back Button */}
        {selectedFakultas && (
          <Button
            onPress={handleBack}
            variant="flat"
            color="primary"
            className="mb-4"
            startContent={<FiArrowLeft className="w-4 h-4" />}
          >
            Kembali ke Daftar Fakultas
          </Button>
        )}

        {/* Stats Cards */}
        {!selectedFakultas && (
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
            <StatsCard
              title="Total Fakultas"
              value={stats.totalFakultas}
              icon={<FiBookOpen />}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
            />
            <StatsCard
              title="Total Prodi Aktif"
              value={stats.totalProdiAktif}
              icon={<FiCheckCircle />}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatsCard
              title="Prodi Reakreditasi"
              value={stats.totalProdiReakreditasi}
              icon={<FiClock />}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
            <StatsCard
              title="Total Jenjang Prodi"
              value={stats.totalJenjangProdi}
              icon={<FiAward />}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>
        )}

        {/* Tables */}
        {!selectedFakultas ? (
          <DataTable
            data={fakultasData}
            columns={fakultasColumns}
            searchable={true}
            searchKeys={["nama_fakultas"]}
            searchPlaceholder="Cari fakultas..."
            defaultRowsPerPage={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        ) : (
          <div className="py-12 text-center text-gray-500">
            <FiBookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Fitur detail prodi akan segera tersedia</p>
            <p className="mt-2 text-sm">Silakan kembali ke daftar fakultas</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
