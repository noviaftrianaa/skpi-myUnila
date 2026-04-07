"use client";

import { useState, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { siKknMenuConfig } from "../../config/menuConfig";
import { MdDashboard } from "react-icons/md";
import { Spinner, Card, CardBody, Button } from "@heroui/react";
import { FiSave, FiStar } from "react-icons/fi";
import { dummyNilaiMahasiswa, dummyKomponenPenilaian, dummyAnggotaKelompok } from "@/lib/services/si-kkn/dummyData";
import toast, { Toaster } from "react-hot-toast";

export default function NilaiKomponenPage() {
  useRequireAuth();
  const { user } = useAuth();

  // Build a matrix of nilai per mahasiswa per komponen
  const mahasiswaList = useMemo(() => {
    const first10 = dummyAnggotaKelompok.slice(0, 10);
    return first10.map((anggota) => {
      const nilaiMap: Record<string, number> = {};
      dummyNilaiMahasiswa
        .filter((n) => n.id_anggota === anggota.id_anggota)
        .forEach((n) => {
          nilaiMap[n.id_komponen] = n.nilai;
        });
      return { ...anggota, nilaiMap };
    });
  }, []);

  const [nilaiState, setNilaiState] = useState<Record<string, Record<string, number>>>(() => {
    const state: Record<string, Record<string, number>> = {};
    mahasiswaList.forEach((m) => {
      state[m.id_anggota] = { ...m.nilaiMap };
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

  const handleNilaiChange = (idAnggota: string, idKomponen: string, value: string) => {
    const num = Math.min(100, Math.max(0, parseInt(value) || 0));
    setNilaiState((prev) => ({
      ...prev,
      [idAnggota]: { ...prev[idAnggota], [idKomponen]: num },
    }));
  };

  const calculateWeightedTotal = (idAnggota: string) => {
    const anggotaNilai = nilaiState[idAnggota] || {};
    let total = 0;
    dummyKomponenPenilaian.forEach((k) => {
      const nilai = anggotaNilai[k.id_komponen] || 0;
      total += (nilai * k.bobot_persen) / 100;
    });
    return total.toFixed(1);
  };

  const handleSave = () => {
    toast.success("Nilai komponen berhasil disimpan");
  };

  return (
    <DashboardLayoutWithDynamicMenu
      appName="SI KKN"
      appIcon={<MdDashboard className="w-6 h-6" />}
      appKey="e-kkn"
      fallbackMenus={siKknMenuConfig}
      pageTitle="Nilai Komponen"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Nilai Komponen</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Input nilai per komponen penilaian KKN</p>
          </div>
          <Button color="primary" startContent={<FiSave className="w-4 h-4" />} onPress={handleSave}>
            Simpan Nilai
          </Button>
        </div>

        {/* Komponen Info Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {dummyKomponenPenilaian.map((k) => (
            <Card key={k.id_komponen} className="border-none shadow-md rounded-xl overflow-hidden dark:bg-gray-800">
              <CardBody className="p-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <FiStar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{k.nm_komponen}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Bobot: {k.bobot_persen}% | {k.penilai.toUpperCase()}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Nilai Table */}
        <Card className="border-none shadow-lg rounded-xl overflow-hidden dark:bg-gray-800">
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Nama</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">NPM</th>
                    {dummyKomponenPenilaian.map((k) => (
                      <th key={k.id_komponen} className="text-center px-3 py-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {k.nm_komponen}
                        <br />
                        <span className="text-xs font-normal text-gray-400">({k.bobot_persen}%)</span>
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mahasiswaList.map((m) => (
                    <tr key={m.id_anggota} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{m.nm_mahasiswa}</td>
                      <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{m.npm}</td>
                      {dummyKomponenPenilaian.map((k) => (
                        <td key={k.id_komponen} className="px-3 py-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            value={nilaiState[m.id_anggota]?.[k.id_komponen] || ""}
                            onChange={(e) => handleNilaiChange(m.id_anggota, k.id_komponen, e.target.value)}
                          />
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-gray-900 dark:text-white">{calculateWeightedTotal(m.id_anggota)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
