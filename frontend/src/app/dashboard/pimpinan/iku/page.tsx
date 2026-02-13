"use client";

import React, { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { FiTarget, FiInfo } from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  FilterPanel,
  IKUCard,
  IKUDetailModal,
  IKUDetailData
} from "../components";
import { useDashboardReference } from "../hooks";

const APP_KEY = "dashboard-pimpinan";

// ============================================
// DATA IKU 2026 (STRICT TO PDF 2026 VERIFIED)
// ============================================

// Helper to generate mock drilldown data in 60-75% range
const generateDrilldown = (target: number): any[] => {
  const facs = ["FEB", "Hukum", "KIP", "Pertanian", "Teknik", "ISIP", "MIPA", "Kedokteran"];
  return facs.map((f, i) => {
    // Randomize value between 60% to 75% of target
    // 0.60 to 0.75
    const percentage = 0.60 + (Math.random() * 0.15);
    let val = target * percentage;

    // Round to 1 decimal, or integer if target is integer-like (large)
    if (target > 50) {
      val = Math.round(val);
    } else {
      val = Math.round(val * 10) / 10;
    }

    // Ensure it doesn't exceed target (since we want 60-75%)
    if (val > target) val = target * 0.75;
    if (val < 0) val = 0;

    const isAchieved = val >= target;

    return {
      id: `fac-${i}`,
      name: `Fakultas ${f}`,
      value: val,
      target: target,
      status: "Belum Tercapai", // Since 60-75%, it's mostly "Belum Tercapai"
      children: [
        { id: `prodi-${i}-1`, name: `S1 ${f} A`, value: val, target, status: "Belum Tercapai" },
        { id: `prodi-${i}-2`, name: `S1 ${f} B`, value: val * 0.95, target, status: "Belum Tercapai" },
        { id: `prodi-${i}-3`, name: `D3 ${f} C`, value: val * 1.05, target, status: val * 1.05 >= target ? "Tercapai" : "Belum Tercapai" },
      ]
    };
  });
};

const IKU_DATA_SOURCE: IKUDetailData[] = [
  {
    id: 1,
    code: "IKU 1",
    title: "Angka Efisiensi Edukasi Perguruan Tinggi (AEE)",
    definition: "Indikator yang mengukur tingkat keberhasilan mahasiswa menyelesaikan studi tepat waktu sesuai masa studi standar, dibandingkan dengan total mahasiswa yang masuk pada periode tertentu.",
    value: 54.5, // Target 80 (68%)
    target: 80.0,
    color: "#10b981", // Emerald
    trendData: [
      { name: '2022', value: 45.0 }, { name: '2023', value: 50.2 }, { name: '2024', value: 54.5 }
    ],
    drilldownData: generateDrilldown(80),
    description: "Rumus: (Lulusan Tepat Waktu / Mahasiswa Baru Angkatan Terkait) x 100%"
  },
  {
    id: 2,
    code: "IKU 2",
    title: "Lulusan Langsung Bekerja/Studi Lanjut/Wiraswasta",
    definition: "Indikator yang mengukur persentase lulusan S1 dan D4/D3/D2 yang berhasil mendapat pekerjaan, melanjutkan studi, atau menjadi wiraswasta dengan penghasilan yang layak (> 1,2x UMP) dalam waktu kurang dari 12 bulan setelah kelulusan.",
    value: 58.2, // Target 80 (72.7%)
    target: 80.0,
    color: "#3b82f6", // Blue
    trendData: [
      { name: '2022', value: 48.0 }, { name: '2023', value: 52.5 }, { name: '2024', value: 58.2 }
    ],
    drilldownData: generateDrilldown(80),
  },
  {
    id: 3,
    code: "IKU 3",
    title: "Mahasiswa Berkegiatan di Luar Program Studi",
    definition: "Indikator yang mengukur persentase mahasiswa S1 dan D4/D3/D2 yang menghabiskan paling sedikit 20 (dua puluh) SKS beraktivitas di luar kampus atau meraih prestasi paling rendah tingkat nasional.",
    value: 34.8, // Target 50 (69.6%)
    target: 50.0,
    color: "#f59e0b", // Amber
    trendData: [
      { name: '2022', value: 25 }, { name: '2023', value: 30 }, { name: '2024', value: 34.8 }
    ],
    drilldownData: generateDrilldown(50),
  },
  {
    id: 4,
    code: "IKU 4",
    title: "Dosen dengan Rekognisi Internasional",
    definition: "Indikator yang mengukur jumlah dosen tetap yang karya atau keahliannya diakui di tingkat internasional, seperti menjadi staf ahli, editor jurnal internasional, atau memiliki paten terekognisi global.",
    value: 135, // Target 200 (67.5%)
    target: 200,
    color: "#8b5cf6", // Violet
    trendData: [
      { name: '2022', value: 100 }, { name: '2023', value: 120 }, { name: '2024', value: 135 }
    ],
    drilldownData: generateDrilldown(200),
    description: "Satuan: Orang (Jumlah Dosen)"
  },
  {
    id: 5,
    code: "IKU 5",
    title: "Rasio Luaran Hasil Kerjasama Mitra",
    definition: "Indikator yang mengukur rasio jumlah luaran penelitian dan pengabdian kepada masyarakat yang berhasil mendapat rekognisi internasional atau diterapkan oleh masyarakat per jumlah dosen.",
    value: 0.68, // Target 1.0 (68%)
    target: 1.0,
    color: "#ec4899", // Pink
    trendData: [
      { name: '2022', value: 0.4 }, { name: '2023', value: 0.55 }, { name: '2024', value: 0.68 }
    ],
    description: "Satuan: Rasio (Karya / Total Dosen)"
  },
  {
    id: 6,
    code: "IKU 6",
    title: "Publikasi Bereputasi Internasional (Scopus/WoS)",
    definition: "Indikator yang mengukur persentase publikasi ilmiah dosen tetap yang berhasil terindeks di pangkalan data internasional bereputasi (Scopus atau Web of Science).",
    value: 32.5, // Target 50 (65%)
    target: 50.0,
    color: "#06b6d4", // Cyan
    trendData: [
      { name: '2022', value: 20 }, { name: '2023', value: 28 }, { name: '2024', value: 32.5 }
    ],
    drilldownData: generateDrilldown(50),
  },
  {
    id: 7,
    code: "IKU 7",
    title: "Keterlibatan dalam SDGs",
    definition: "Indikator yang mengukur persentase mata kuliah, pengabdian masyarakat, atau kegiatan kampus yang memiliki relevansi langsung dengan pencapaian 17 Tujuan Pembangunan Berkelanjutan (SDGs).",
    value: 56.4, // Target 80 (70.5%)
    target: 80.0,
    color: "#f97316", // Orange
    trendData: [
      { name: '2022', value: 45 }, { name: '2023', value: 50 }, { name: '2024', value: 56.4 }
    ],
    drilldownData: generateDrilldown(80),
  },
  {
    id: 8,
    code: "IKU 8",
    title: "SDM Terlibat dalam Kebijakan",
    definition: "Indikator yang mengukur jumlah SDM (Dosen/Peneliti) yang terlibat sebagai pakar/ahli dalam perumusan kebijakan di tingkat Instansi Pemerintah atau Dunia Usaha Dunia Industri.",
    value: 31, // Target 50 (62%)
    target: 50,
    color: "#ef4444", // Red
    trendData: [
      { name: '2022', value: 20 }, { name: '2023', value: 25 }, { name: '2024', value: 31 }
    ],
    drilldownData: generateDrilldown(50),
    description: "Satuan: Orang"
  },
  {
    id: 9,
    code: "IKU 9",
    title: "Pendapatan Non-Pendidikan/Non-UKT",
    definition: "Indikator yang mengukur persentase penerimaan perguruan tinggi yang bersumber dari kegiatan usaha dan pemanfaatan aset (selain UKT dan APBN) terhadap total penerimaan.",
    value: 27.8, // Target 40 (69.5%)
    target: 40.0,
    color: "#6366f1", // Indigo
    trendData: [
      { name: '2022', value: 15 }, { name: '2023', value: 22 }, { name: '2024', value: 27.8 }
    ],
    drilldownData: generateDrilldown(40),
  },
  {
    id: 10,
    code: "IKU 10",
    title: "Usulan Zona Integritas (WBK/WBBM)",
    definition: "Indikator yang mengukur jumlah unit kerja (Fakultas/Lembaga) yang telah ditetapkan sebagai Zona Integritas Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi Bersih Melayani (WBBM).",
    value: 4, // Target 6 (66%)
    target: 6,
    color: "#14b8a6", // Teal
    trendData: [
      { name: '2022', value: 1 }, { name: '2023', value: 2 }, { name: '2024', value: 4 }
    ],
    drilldownData: generateDrilldown(6),
    description: "Satuan: Unit Kerja"
  },
  {
    id: 11,
    code: "IKU 11",
    title: "Tata Kelola (WTP / SAKIP / Etik)",
    definition: "Indikator yang mengukur capaian kualitas tata kelola institusi melalui perolehan Opini Wajar Tanpa Pengecualian (WTP), Nilai Akuntabilitas Kinerja (SAKIP), dan kepatuhan terhadap kode etik.",
    value: 72.5, // Target 100 (72.5%)
    target: 100.0,
    color: "#84cc16", // Lime
    trendData: [
      { name: '2022', value: 65.0 }, { name: '2023', value: 70.0 }, { name: '2024', value: 72.5 }
    ],
    drilldownData: generateDrilldown(100),
  }
];

export default function DashboardIkuPage() {
  useRequireAuth();
  const [selectedSemesters, setSelectedSemesters] = useState<Set<string>>(new Set());
  const [selectedIKU, setSelectedIKU] = useState<IKUDetailData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { semester, activeSemesters } = useDashboardReference();

  useEffect(() => {
    if (activeSemesters.length > 0 && selectedSemesters.size === 0) {
      setSelectedSemesters(new Set(activeSemesters));
    }
  }, [activeSemesters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReset = () => {
    setSelectedSemesters(new Set(activeSemesters));
  };

  const handleDetail = (iku: IKUDetailData) => {
    setSelectedIKU(iku);
    setIsModalOpen(true);
  }

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Dashboard Pimpinan"
      appIcon={<FiTarget className="w-6 h-6" />}
      appKey={APP_KEY}
      fallbackMenus={pimpinanMenuConfig}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 p-6 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FiTarget className="w-8 h-8 text-blue-600" />
              Capaian IKU Institusi
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              Monitoring realisasi 11 Indikator Kinerja Utama Perguruan Tinggi (IKU-PT) sesuai Kepmendikbudristek Tahun 2026.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
              <FiInfo className="text-blue-500" />
              <span>Target: Renstra 2026</span>
            </div>
          </div>
        </div>

        {/* Global Filter - Not Sticky */}
        <div className="mb-6">
          <FilterPanel
            semester={semester}
            selectedSemesters={selectedSemesters}
            onSemesterChange={setSelectedSemesters}
            onReset={handleReset}
          />
        </div>

        {/* Grid IKU 1-11 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {IKU_DATA_SOURCE.map((iku) => (
            <IKUCard
              key={iku.id}
              id={iku.id}
              code={iku.code}
              title={iku.title}
              value={iku.value}
              target={iku.target}
              color={iku.color}
              unit={iku.code.includes("Rasio") ? "" : iku.code.includes("Jumlah") || iku.title.includes("Jumlah") ? "" : "%"}
              onDetailClick={() => handleDetail(iku)}
            />
          ))}
        </div>

        {/* Modal Detail */}
        <IKUDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedIKU}
        />

        {/* Footer Notes */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            © Universitas Lampung - Sistem Informasi Eksekutif Terintegrasi
          </p>
        </div>

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
