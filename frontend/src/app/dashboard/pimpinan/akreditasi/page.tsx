"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";
import {
  FiArrowLeft,
  FiAward,
  FiBookOpen,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { useQuery } from "@tanstack/react-query";
import {
  executiveAkreditasiService,
  type Fakultas,
  type Prodi,
  type JenjangList,
  type AkreditasiHistory,
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

// Component untuk menampilkan jenjang_list sebagai list
const JenjangListDisplay = ({ jenjangList }: { jenjangList: JenjangList }) => {
  return (
    <ul className="m-0 space-y-1 text-xs">
      {Object.entries(jenjangList).map(([jenjang, jumlah]) => {
        const numJumlah = parseInt((jumlah as string) || "0", 10);
        if (numJumlah === 0) return null;
        return (
          <li key={jenjang} className="flex justify-between gap-4">
            <span>{jenjang}:</span>
            <span className="font-semibold">{numJumlah}</span>
          </li>
        );
      })}
    </ul>
  );
};

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
  const [selectedProdiHistory, setSelectedProdiHistory] = useState<{
    prodi: Prodi;
    history: AkreditasiHistory[];
  } | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Fetch fakultas data
  const {
    data: fakultasData = [],
    isLoading: isLoadingFakultas,
    error: fakultasError,
  } = useQuery({
    queryKey: ["akreditasi", "fakultas"],
    queryFn: () => executiveAkreditasiService.getAllFakultas(),
  });

  // Fetch prodi data when fakultas is selected
  const {
    data: prodiData = [],
    isLoading: isLoadingProdi,
    error: prodiError,
  } = useQuery({
    queryKey: ["akreditasi", "prodi", selectedFakultas?.id],
    queryFn: () =>
      executiveAkreditasiService.getProdiByFakultasId(selectedFakultas!.id),
    enabled: !!selectedFakultas,
  });

  // Handle fakultas click - drill down to prodi
  const handleFakultasClick = (fakultas: Fakultas) => {
    setSelectedFakultas(fakultas);
  };

  // Handle back to fakultas list
  const handleBack = () => {
    setSelectedFakultas(null);
  };

  // Handle show history
  const handleShowHistory = (prodi: Prodi) => {
    setSelectedProdiHistory({ prodi, history: prodi.history_akreditasi });
    setIsHistoryModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedProdiHistory(null);
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate statistics
  const stats = {
    totalFakultas: fakultasData.length,
    totalProdiAktif: fakultasData.reduce(
      (sum, f) => sum + parseInt(f.prodi_aktif.toString() || "0"),
      0,
    ),
    totalProdiReakreditasi: fakultasData.reduce(
      (sum, f) => sum + parseInt(f.prodi_akan_kadaluarsa.toString() || "0"),
      0,
    ),
    totalJenjangProdi: fakultasData.reduce(
      (sum, f) => sum + parseInt(f.total_prodi || "0"),
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
      key: "jenjang_list",
      label: "Jenjang Prodi",
      render: (item) => <JenjangListDisplay jenjangList={item.jenjang_list} />,
    },
    {
      key: "prodi_aktif",
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
          {item.prodi_aktif}
        </Chip>
      ),
    },
    {
      key: "prodi_akan_kadaluarsa",
      label: "Prodi Akan Kadaluarsa",
      align: "center",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          className="text-xs"
          color="warning"
          startContent={<FiClock className="w-3 h-3" />}
        >
          {item.prodi_akan_kadaluarsa}
        </Chip>
      ),
    },
  ];

  // Table columns for Prodi
  const prodiColumns: Column<Prodi>[] = [
    {
      key: "no",
      label: "No",
      align: "center",
      width: "60px",
      render: (_prodi, index = 0) => index + 1,
    },
    {
      key: "nama_prodi",
      label: "Program Studi",
      render: (item) => (
        <div>
          <p className="font-semibold">{item.nama_prodi}</p>
          <p className="text-xs text-gray-500">{item.jenjang}</p>
        </div>
      ),
    },
    {
      key: "akreditasi_terakhir",
      label: "Akreditasi Terakhir",
      align: "center",
      render: (item) => (
        <Chip
          size="sm"
          variant="flat"
          className="text-xs"
          color={item.status_akreditasi === "Proses" ? "default" : "success"}
        >
          {item.akreditasi_terakhir || "-"}
        </Chip>
      ),
    },
    {
      key: "tahun_akreditasi",
      label: "Tahun",
      align: "center",
      render: (item) => item.tahun_akreditasi || "-",
    },
    {
      key: "tanggal_kadaluarsa",
      label: "Masa Berlaku Hingga",
      align: "center",
      render: (item) => formatDate(item.tanggal_kadaluarsa),
    },
    {
      key: "reakreditasi",
      label: "Status",
      align: "center",
      render: (item) =>
        item.is_reakreditasi ? (
          <Chip size="sm" variant="flat" className="text-xs" color="warning">
            Reakreditasi
          </Chip>
        ) : (
          <Chip size="sm" variant="flat" className="text-xs" color="success">
            Aktif
          </Chip>
        ),
    },
    {
      key: "history",
      label: "History",
      align: "center",
      render: (item) => (
        <Button
          size="sm"
          isIconOnly
          variant="flat"
          color="primary"
          onPress={() => handleShowHistory(item)}
          startContent={<FiClock className="w-4 h-4" />}
        />
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
    <>
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
                  ? `Akreditasi - ${selectedFakultas.nama_lembaga}`
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
              searchKeys={["nama_lembaga"]}
              searchPlaceholder="Cari fakultas..."
              defaultRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          ) : isLoadingProdi ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner size="lg" color="primary" />
            </div>
          ) : prodiError ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <FiAlertCircle className="w-16 h-16 text-danger" />
              <p className="text-lg text-danger">Gagal memuat data prodi</p>
            </div>
          ) : (
            <DataTable
              data={prodiData}
              columns={prodiColumns}
              searchable={true}
              searchKeys={["nama_prodi", "jenjang"]}
              searchPlaceholder="Cari prodi..."
              defaultRowsPerPage={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )}
        </motion.div>
      </div>

      {/* History Modal - Outside the main container */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={handleCloseModal}
        size="2xl"
        scrollBehavior="inside"
        backdrop="blur"
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 bg-white">
            <div className="flex items-center gap-2">
              <FiClock className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold">History Akreditasi</span>
            </div>
            <p className="text-sm font-normal text-gray-600">
              {selectedProdiHistory?.prodi.nama_prodi} (
              {selectedProdiHistory?.prodi.jenjang})
            </p>
          </ModalHeader>
          <ModalBody className="bg-white">
            {selectedProdiHistory?.history &&
            selectedProdiHistory.history.length > 0 ? (
              <div className="space-y-4">
                {selectedProdiHistory.history.map((item, index) => (
                  <Card
                    key={index}
                    className={`${
                      index === 0
                        ? "border-2 border-primary shadow-lg"
                        : "border border-gray-200"
                    }`}
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FiAward className="w-5 h-5 text-primary" />
                          <span className="text-lg font-semibold">
                            {item.nilai_akreditasi}
                          </span>
                          {index === 0 && (
                            <Chip size="sm" color="primary" variant="flat">
                              Terbaru
                            </Chip>
                          )}
                        </div>
                        <Chip
                          size="sm"
                          variant="flat"
                          className={getAkreditasiBadgeColor(
                            item.nilai_akreditasi,
                          )}
                        >
                          {item.nilai_akreditasi}
                        </Chip>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-start gap-2">
                          <FiFileText className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-gray-600">Nomor SK:</p>
                            <p className="font-medium">
                              {item.sk_akreditasi || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FiCalendar className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-gray-600">Lembaga Akreditasi:</p>
                            <p className="font-medium">
                              {item.lembaga_akreditasi || "-"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FiCalendar className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-gray-600">Tanggal SK:</p>
                            <p className="font-medium">
                              {formatDate(item.tanggal_sk)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FiCalendar className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-gray-600">
                              Masa Berlaku Hingga:
                            </p>
                            <p className="font-medium">
                              {formatDate(item.tanggal_kadaluarsa)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <FiClock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Tidak ada history akreditasi</p>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
