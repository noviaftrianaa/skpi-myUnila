"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Select,
  SelectItem,
} from "@heroui/react";
import { FiBarChart2 } from "react-icons/fi";
import { dummyFakultas, dummyProdi } from "@/shared/components/pimpinan/rasio/dummyData";
import { RasioStatsCard } from "@/shared/components/pimpinan/rasio/RasioStatsCard";
import { RasioChart } from "@/shared/components/pimpinan/rasio/RasioChart";
import { RasioDataModal } from "@/shared/components/pimpinan/rasio/RasioDataModal";

// ========================================
// Main Page Component
// ========================================

export default function RasioPage() {
  const [selectedFakultas, setSelectedFakultas] = useState<string>("");
  const [selectedProdi, setSelectedProdi] = useState<string>("");
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);

  // Handle fakultas change
  const handleFakultasChange = (value: string) => {
    setSelectedFakultas(value);
    setSelectedProdi(""); // Reset prodi when fakultas changes
  };

  // Handle prodi change
  const handleProdiChange = (value: string) => {
    setSelectedProdi(value);
  };

  // Get chart data based on selection
  const getChartData = () => {
    if (selectedProdi) {
      // Show specific prodi data
      const prodi = dummyProdi.find((p) => p.id === selectedProdi);
      if (prodi) {
        return [
          {
            name: prodi.nama_prodi,
            dosen: prodi.jumlah_dosen,
            mahasiswa: prodi.jumlah_mahasiswa,
            rasio: prodi.rasio,
          },
        ];
      }
    }

    if (selectedFakultas) {
      // Show all prodi in selected fakultas
      return dummyProdi
        .filter((p) => p.fakultas_id === selectedFakultas)
        .map((p) => ({
          name: p.nama_prodi.substring(0, 20) + (p.nama_prodi.length > 20 ? "..." : ""),
          dosen: p.jumlah_dosen,
          mahasiswa: p.jumlah_mahasiswa,
          rasio: p.rasio,
        }));
    }

    // Show all fakultas
    return dummyFakultas.map((f) => ({
      name: f.nama_fakultas.substring(0, 20) + (f.nama_fakultas.length > 20 ? "..." : ""),
      dosen: f.total_dosen,
      mahasiswa: f.total_mahasiswa,
      rasio: f.rasio,
    }));
  };

  // Get stats based on selection
  const getStats = () => {
    if (selectedProdi) {
      const prodi = dummyProdi.find((p) => p.id === selectedProdi);
      return {
        totalDosen: prodi?.jumlah_dosen || 0,
        totalMahasiswa: prodi?.jumlah_mahasiswa || 0,
        rasio: prodi?.rasio || "0:0",
      };
    }

    if (selectedFakultas) {
      const fakultas = dummyFakultas.find((f) => f.id === selectedFakultas);
      return {
        totalDosen: fakultas?.total_dosen || 0,
        totalMahasiswa: fakultas?.total_mahasiswa || 0,
        rasio: fakultas?.rasio || "0:0",
      };
    }

    // Show all fakultas stats
    return {
      totalDosen: dummyFakultas.reduce((sum, f) => sum + f.total_dosen, 0),
      totalMahasiswa: dummyFakultas.reduce((sum, f) => sum + f.total_mahasiswa, 0),
      rasio: "1:35",
    };
  };

  // Get filtered data for tables
  const getFilteredMahasiswaData = () => {
    if (selectedProdi) {
      const prodi = dummyProdi.find((p) => p.id === selectedProdi);
      return prodi?.detail_mahasiswa || [];
    }

    if (selectedFakultas) {
      return dummyProdi
        .filter((p) => p.fakultas_id === selectedFakultas)
        .flatMap((p) => p.detail_mahasiswa);
    }

    return dummyProdi.flatMap((p) => p.detail_mahasiswa);
  };

  const getFilteredDosenData = () => {
    if (selectedProdi) {
      const prodi = dummyProdi.find((p) => p.id === selectedProdi);
      return prodi?.detail_dosen || [];
    }

    if (selectedFakultas) {
      return dummyProdi
        .filter((p) => p.fakultas_id === selectedFakultas)
        .flatMap((p) => p.detail_dosen);
    }

    return dummyProdi.flatMap((p) => p.detail_dosen);
  };

  const chartData = getChartData();
  const stats = getStats();
  const mahasiswaData = getFilteredMahasiswaData();
  const dosenData = getFilteredDosenData();

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
              <FiBarChart2 className="w-8 h-8 text-myunila" />
              <h1 className="text-3xl font-bold text-gray-800">
                Rasio Dosen-Mahasiswa
              </h1>
            </div>
            <p className="text-gray-600 ml-11">
              Analisis rasio dosen terhadap mahasiswa per fakultas dan program studi
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Select Fakultas */}
              <Select
                label="Fakultas"
                placeholder="Pilih fakultas"
                selectedKeys={selectedFakultas ? [selectedFakultas] : []}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  handleFakultasChange(value);
                }}
                variant="bordered"
                classNames={{
                  trigger: "h-12",
                }}
              >
                {dummyFakultas.map((fakultas) => (
                  <SelectItem key={fakultas.id} value={fakultas.id}>
                    {fakultas.nama_fakultas}
                  </SelectItem>
                ))}
              </Select>

              {/* Select Prodi */}
              {selectedFakultas && (
                <Select
                  label="Program Studi"
                  placeholder="Pilih program studi"
                  selectedKeys={selectedProdi ? [selectedProdi] : []}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    handleProdiChange(value);
                  }}
                  variant="bordered"
                  classNames={{
                    trigger: "h-12",
                  }}
                >
                  {dummyProdi
                    .filter((p) => p.fakultas_id === selectedFakultas)
                    .map((prodi) => (
                      <SelectItem key={prodi.id} value={prodi.id}>
                        {prodi.nama_prodi}
                      </SelectItem>
                    ))}
                </Select>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
            <RasioStatsCard
              title="Total Dosen"
              value={stats.totalDosen}
              icon="dosen"
              color="blue"
            />
            <RasioStatsCard
              title="Total Mahasiswa"
              value={stats.totalMahasiswa}
              icon="mahasiswa"
              color="green"
            />
            <RasioStatsCard
              title="Rasio (Dosen:Mhs)"
              value={stats.rasio}
              icon="rasio"
              color="purple"
            />
          </div>

          {/* Chart Card */}
          <RasioChart
            data={chartData}
            onLihatData={() => setIsDataModalOpen(true)}
          />
        </motion.div>
      </div>

      {/* Data Modal */}
      <RasioDataModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        selectedFakultas={selectedFakultas}
        selectedProdi={selectedProdi}
        mahasiswaData={mahasiswaData}
        dosenData={dosenData}
      />
    </>
  );
}
