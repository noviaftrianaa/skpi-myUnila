"use client";

import { useState } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Checkbox,
  Input,
  Spinner,
} from "@heroui/react";
import {
  FiSearch,
  FiCheckCircle,
  FiDatabase,
  FiClock,
  FiPackage,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import { MdSync, MdSelectAll } from "react-icons/md";
import { RiGraduationCapFill } from "react-icons/ri";

// Mock data - akan diganti dengan data dari API
const referensiMetadata = [
  {
    key: "jalur_masuk",
    name: "Jalur Masuk",
    description: "Data referensi jalur masuk mahasiswa",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "jenis_evaluasi",
    name: "Jenis Evaluasi",
    description: "Data referensi jenis evaluasi pembelajaran",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "jenis_pendaftaran",
    name: "Jenis Pendaftaran",
    description: "Data referensi jenis pendaftaran mahasiswa",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "jenis_keluar",
    name: "Jenis Keluar",
    description: "Data referensi jenis keluar mahasiswa",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "status_mahasiswa",
    name: "Status Mahasiswa",
    description: "Data referensi status mahasiswa",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "tahun_ajaran",
    name: "Tahun Ajaran",
    description: "Data referensi tahun ajaran",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "semester",
    name: "Semester",
    description: "Data referensi semester",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "jenis_prestasi",
    name: "Jenis Prestasi",
    description: "Data referensi jenis prestasi mahasiswa",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "tingkat_prestasi",
    name: "Tingkat Prestasi",
    description: "Data referensi tingkat prestasi",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "kebutuhan_khusus",
    name: "Kebutuhan Khusus",
    description: "Data referensi kebutuhan khusus mahasiswa",
    total_records: 0,
    last_sync: null,
  },
  {
    key: "wilayah",
    name: "Wilayah",
    description: "Data referensi wilayah Indonesia",
    total_records: 0,
    last_sync: null,
  },
];

export default function ReferensiDashboardPage() {
  useRequireAuth();

  const [metadata, setMetadata] = useState(referensiMetadata);
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleCheckboxChange = (key: string) => {
    setSelectedEndpoints((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const filteredMetadata = metadata.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.key.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    if (selectedEndpoints.length === filteredMetadata.length) {
      setSelectedEndpoints([]);
    } else {
      setSelectedEndpoints(filteredMetadata.map((m) => m.key));
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      const year = date.getUTCFullYear();
      const month = date.toLocaleString("id-ID", { month: "short", timeZone: "UTC" });
      const day = date.getUTCDate();
      const hours = String(date.getUTCHours()).padStart(2, "0");
      const minutes = String(date.getUTCMinutes()).padStart(2, "0");
      return `${day} ${month} ${year}, ${hours}.${minutes}`;
    } catch {
      return "-";
    }
  };

  const totalRecords = metadata.reduce((sum, m) => sum + m.total_records, 0);
  const syncedCount = metadata.filter((m) => m.total_records > 0).length;

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<RiGraduationCapFill className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Referensi Dashboard"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Referensi Data Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Kelola dan sinkronisasi semua data referensi dari Neo Feeder PDDIKTI
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="bordered"
              startContent={<MdSelectAll className="w-5 h-5" />}
              onClick={handleSelectAll}
              className="border-blue-600 text-blue-600 font-semibold"
            >
              {selectedEndpoints.length === filteredMetadata.length ? "Deselect All" : "Select All"}
            </Button>
            <Button
              color="primary"
              size="lg"
              startContent={<MdSync className="w-5 h-5" />}
              isDisabled={selectedEndpoints.length === 0}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              Sync Selected ({selectedEndpoints.length})
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiPackage className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-100">Total Endpoints</p>
                  <h3 className="text-3xl font-bold text-white">{metadata.length}</h3>
                  <p className="text-[10px] text-blue-100/80">Endpoint referensi</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 via-green-600 to-teal-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-100">Synced</p>
                  <h3 className="text-3xl font-bold text-white">
                    {syncedCount}/{metadata.length}
                  </h3>
                  <p className="text-[10px] text-green-100/80">Tersinkronisasi</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-indigo-100">Total Records</p>
                  <h3 className="text-3xl font-bold text-white">{totalRecords.toLocaleString()}</h3>
                  <p className="text-[10px] text-indigo-100/80">Total data tersimpan</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiActivity className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-orange-100">Selected</p>
                  <h3 className="text-3xl font-bold text-white">{selectedEndpoints.length}</h3>
                  <p className="text-[10px] text-orange-100/80">Endpoint dipilih</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Search & Filter Section */}
        <Card className={`shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900 ${searchQuery ? 'mb-2' : ''}`}>
          <CardBody className="p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <Input
                  isClearable
                  placeholder="Ketik untuk mencari endpoint..."
                  startContent={
                    <FiSearch className="text-gray-400 dark:text-gray-500 w-5 h-5 mr-2" />
                  }
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  onClear={() => setSearchQuery("")}
                  classNames={{
                    base: "w-full",
                    mainWrapper: "h-full",
                    input: "text-base",
                    inputWrapper: "h-11 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 focus-within:!border-blue-500 dark:focus-within:!border-blue-500 transition-colors rounded-lg",
                  }}
                  size="lg"
                />
              </div>

              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {filteredMetadata.length} / {metadata.length}
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Endpoint Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMetadata.length === 0 ? (
              <div className="col-span-full">
                <Card className="border border-dashed border-gray-300 dark:border-gray-700">
                  <CardBody className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <FiSearch className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Tidak ada endpoint ditemukan
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Pencarian "<span className="font-medium text-blue-600 dark:text-blue-400">{searchQuery}</span>" tidak cocok dengan endpoint manapun
                    </p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      startContent={<FiRefreshCw className="w-4 h-4" />}
                      onClick={() => setSearchQuery("")}
                    >
                      Reset Pencarian
                    </Button>
                  </CardBody>
                </Card>
              </div>
            ) : (
              filteredMetadata.map((item) => (
                <Card
                  key={item.key}
                  className={`group relative overflow-hidden transition-all duration-300 cursor-pointer ${
                    selectedEndpoints.includes(item.key)
                      ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30"
                      : "hover:shadow-xl hover:scale-[1.02] shadow-md"
                  }`}
                  isPressable
                >
                  {selectedEndpoints.includes(item.key) && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-900/20 dark:via-blue-900/10 dark:to-transparent pointer-events-none" />
                  )}

                  <CardBody className="p-5 relative z-10">
                    <div className="flex items-start gap-3.5 mb-4">
                      <Checkbox
                        isSelected={selectedEndpoints.includes(item.key)}
                        onValueChange={() => handleCheckboxChange(item.key)}
                        color="primary"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 leading-tight">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiDatabase className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Records</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {item.total_records.toLocaleString()}
                          </span>
                          {item.total_records > 0 && (
                            <Chip
                              size="sm"
                              color="success"
                              variant="flat"
                              className="shrink-0"
                              startContent={<FiCheckCircle className="w-3 h-3" />}
                            >
                              Synced
                            </Chip>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FiClock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Last Sync</span>
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                          {formatDate(item.last_sync)}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Coming Soon Notice */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700">
          <CardBody className="p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <RiGraduationCapFill className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Integrasi Dalam Pengembangan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Fitur sinkronisasi data referensi dengan Neo Feeder PDDIKTI sedang dalam tahap pengembangan.
              Backend service dan koneksi ke API akan segera tersedia.
            </p>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
