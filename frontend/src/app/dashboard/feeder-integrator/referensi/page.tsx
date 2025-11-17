"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayout from "@/shared/components/dashboard/DashboardLayout";
import { feederIntegratorMenuConfig } from "../config/menuConfig";
import { Card, CardBody, Chip, Spinner, Button, Input, Checkbox } from "@heroui/react";
import { MdSchool, MdSelectAll } from "react-icons/md";
import { FiBookOpen, FiDatabase, FiCheckCircle, FiClock, FiSearch, FiActivity } from "react-icons/fi";
import ScheduleList from "@/components/sister-integrator/ScheduleList";

const referensiItems = [
  { key: "jalur_masuk", name: "Jalur Masuk", description: "Data jalur masuk mahasiswa", records: 0 },
  { key: "jenis_evaluasi", name: "Jenis Evaluasi", description: "Data jenis evaluasi perkuliahan", records: 0 },
  { key: "jenis_pendaftaran", name: "Jenis Pendaftaran", description: "Data jenis pendaftaran mahasiswa", records: 0 },
  { key: "jenis_keluar", name: "Jenis Keluar", description: "Data jenis keluar mahasiswa", records: 0 },
  { key: "status_mahasiswa", name: "Status Mahasiswa", description: "Data status mahasiswa", records: 0 },
  { key: "tahun_ajaran", name: "Tahun Ajaran", description: "Data tahun ajaran", records: 0 },
  { key: "semester", name: "Semester", description: "Data semester", records: 0 },
  { key: "jenis_prestasi", name: "Jenis Prestasi", description: "Data jenis prestasi mahasiswa", records: 0 },
  { key: "tingkat_prestasi", name: "Tingkat Prestasi", description: "Data tingkat prestasi", records: 0 },
  { key: "kebutuhan_khusus", name: "Kebutuhan Khusus", description: "Data kebutuhan khusus mahasiswa", records: 0 },
  { key: "wilayah", name: "Wilayah", description: "Data wilayah", records: 0 },
];

export default function ReferensiPage() {
  useRequireAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpoints, setSelectedEndpoints] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleCheckboxChange = (key: string) => {
    setSelectedEndpoints((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Filter data based on search query
  const filteredData = referensiItems.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.key.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    if (selectedEndpoints.length === filteredData.length) {
      setSelectedEndpoints([]);
    } else {
      setSelectedEndpoints(filteredData.map((item) => item.key));
    }
  };

  const totalRecords = referensiItems.reduce((sum, item) => sum + item.records, 0);
  const syncedCount = referensiItems.filter((item) => item.records > 0).length;

  return (
    <DashboardLayout
      appName="Feeder Integrator"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      menuConfig={feederIntegratorMenuConfig}
      pageTitle="Referensi"
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
              {selectedEndpoints.length === filteredData.length ? "Deselect All" : "Select All"}
            </Button>
            <Button
              color="primary"
              size="lg"
              startContent={<FiDatabase className="w-5 h-5" />}
              isDisabled={selectedEndpoints.length === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all rounded-xl"
            >
              Sync Selected ({selectedEndpoints.length})
            </Button>
          </div>
        </div>

        {/* Summary Cards - 4 Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Endpoints */}
          <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiBookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-100">Total Endpoints</p>
                  <h3 className="text-3xl font-bold text-white">{referensiItems.length}</h3>
                  <p className="text-[10px] text-blue-100/80">Endpoint referensi</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Synced */}
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
                    {syncedCount}/{referensiItems.length}
                  </h3>
                  <p className="text-[10px] text-green-100/80">Tersinkronisasi</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Total Records */}
          <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
            <CardBody className="p-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <FiDatabase className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-purple-100">Total Records</p>
                  <h3 className="text-3xl font-bold text-white">{totalRecords.toLocaleString()}</h3>
                  <p className="text-[10px] text-purple-100/80">Total data tersimpan</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Selected */}
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

        {/* Scheduled Syncs Section */}
        <ScheduleList syncType="referensi" />

        {/* Search & Filter Section */}
        <Card className={`shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900 ${searchQuery ? 'mb-2' : ''}`}>
          <CardBody className="p-5">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Input */}
              <div className="flex-1">
                <Input
                  isClearable
                  placeholder="Ketik untuk mencari referensi..."
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

              {/* Search Stats Badge */}
              {searchQuery && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {filteredData.length} / {referensiItems.length}
                  </span>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Referensi Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredData.map((item) => (
              <Card
                key={item.key}
                className={`group relative overflow-hidden transition-all duration-300 cursor-pointer ${
                  selectedEndpoints.includes(item.key)
                    ? "ring-2 ring-blue-500 ring-offset-2 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30"
                    : "hover:shadow-xl hover:scale-[1.02] shadow-md"
                }`}
                isPressable
              >
                {/* Gradient overlay for selected state */}
                {selectedEndpoints.includes(item.key) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-blue-50/40 to-transparent dark:from-blue-900/20 dark:via-blue-900/10 dark:to-transparent pointer-events-none" />
                )}

                <CardBody className="p-5 relative z-10">
                  {/* Header with checkbox and title */}
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

                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-3" />

                  {/* Info section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiDatabase className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">Records</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {item.records.toLocaleString()}
                        </span>
                        {item.records > 0 && (
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
                        Belum sync
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-gray-800 border-none">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <FiBookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Tentang Data Referensi
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Data referensi adalah data master yang digunakan sebagai acuan dalam sistem Neo Feeder PDDIKTI.
                  Data ini mencakup jalur masuk, jenis evaluasi, semester, dan referensi lainnya yang diperlukan
                  untuk pengelolaan data mahasiswa.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
