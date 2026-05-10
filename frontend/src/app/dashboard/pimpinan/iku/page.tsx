"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { FiTarget } from "react-icons/fi";
import { pimpinanMenuConfig } from "../config/menuConfig";
import {
  FilterPanel,
  IKUCard,
  IKUDetailModal,
  IKUDetailData,
  DashboardSkeleton,
  ErrorAlert,
  StatCard,
} from "../components";
import { FiCheckCircle, FiAlertTriangle, FiTrendingUp, FiTarget as FiTargetIcon } from "react-icons/fi";
import { useDashboardData } from "../hooks";
import { ENDPOINTS } from "@/shared/api/endpoints";
import type { IkuData } from "../types";

const APP_KEY = "dashboard-pimpinan";

export default function DashboardIkuPage() {
  useRequireAuth();
  const [selectedTahun, setSelectedTahun] = useState<string>("");
  const [selectedIKU, setSelectedIKU] = useState<IKUDetailData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Tahun IKU options: tahun lalu jadi default karena tahun berjalan biasanya
  // belum ada data lulusan (cycle akademik belum selesai). 3 tahun terakhir + tahun depan.
  const tahunOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 4 }, (_, i) => {
      const yr = currentYear - i;
      return { key: String(yr), label: String(yr) };
    });
  }, []);

  // Default: tahun lalu (data IKU lebih lengkap karena akademik sudah complete)
  useEffect(() => {
    if (!selectedTahun && tahunOptions.length > 1) {
      setSelectedTahun(tahunOptions[1].key);
    }
  }, [tahunOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch IKU data - kirim tahun, backend resolve semester dari config
  const { data: ikuData, loading, error } = useDashboardData<IkuData>(
    ENDPOINTS.DASHBOARD_PIMPINAN.IKU,
    { tahun: selectedTahun }
  );

  // Set IKU wajib dari config backend (fallback ke default)
  const ikuWajibSet = useMemo(
    () => new Set(ikuData?.ikuWajib ?? [1, 2, 3, 5, 7, 9]),
    [ikuData?.ikuWajib]
  );

  // Gabungkan IKU 1 & 2 real dari API dengan IKU 3-11 mock
  const allIkuItems: IKUDetailData[] = useMemo(() => {
    const iku1Real: IKUDetailData | null = ikuData?.iku1
      ? {
          id: ikuData.iku1.id,
          code: ikuData.iku1.code,
          title: ikuData.iku1.title,
          definition: ikuData.iku1.definition,
          value: ikuData.iku1.value,
          target: ikuData.iku1.target,
          color: ikuData.iku1.color,
          description: ikuData.iku1.description,
          trendData: ikuData.iku1.trendData || [],
          drilldownData: ikuData.iku1.drilldownData,
          perJenjang: ikuData.iku1.perJenjang,
        }
      : null;

    const iku2Real: IKUDetailData | null = ikuData?.iku2
      ? {
          id: ikuData.iku2.id,
          code: ikuData.iku2.code,
          title: ikuData.iku2.title,
          definition: ikuData.iku2.definition,
          value: ikuData.iku2.value,
          target: ikuData.iku2.target,
          color: ikuData.iku2.color,
          description: ikuData.iku2.description,
          trendData: ikuData.iku2.trendData || [],
          drilldownData: ikuData.iku2.drilldownData,
          statusBreakdown: ikuData.iku2.statusBreakdown,
          kategoriKerja: ikuData.iku2.kategoriKerja,
          totalLulusan: ikuData.iku2.totalLulusan,
          totalResponden: ikuData.iku2.totalResponden,
          responseRate: ikuData.iku2.responseRate,
        }
      : null;

    // Fallback IKU 1 mock jika API belum tersedia
    const iku1Fallback: IKUDetailData = {
      id: 1,
      code: "IKU 1",
      title: "Angka Efisiensi Edukasi Perguruan Tinggi (AEE)",
      definition: "Indikator yang mengukur tingkat keberhasilan mahasiswa menyelesaikan studi tepat waktu sesuai masa studi standar, dibandingkan dengan total mahasiswa yang masuk pada periode tertentu.",
      value: 0,
      target: 80.0,
      color: "#10b981",
      trendData: [],
      description: "Rumus: Rata-rata Tingkat Pencapaian AEE per Jenjang (D3, S1, S2, S3)"
    };

    const iku2Fallback: IKUDetailData = {
      id: 2,
      code: "IKU 2",
      title: "Lulusan Langsung Bekerja/Studi Lanjut/Wiraswasta",
      definition: "Persentase lulusan S1 dan program diploma yang langsung bekerja, melanjutkan studi, atau berwirausaha dalam 1 tahun setelah kelulusan.",
      value: 0,
      target: 80.0,
      color: "#3b82f6",
      trendData: [],
    };

    const iku3Real: IKUDetailData | null = ikuData?.iku3
      ? {
          id: ikuData.iku3.id,
          code: ikuData.iku3.code,
          title: ikuData.iku3.title,
          definition: ikuData.iku3.definition,
          value: ikuData.iku3.value,
          target: ikuData.iku3.target,
          color: ikuData.iku3.color,
          description: ikuData.iku3.description,
          trendData: ikuData.iku3.trendData || [],
          drilldownData: ikuData.iku3.drilldownData,
          kegiatanBreakdown: ikuData.iku3.kegiatanBreakdown,
          mbkm: ikuData.iku3.mbkm,
          prestasiNasional: ikuData.iku3.prestasiNasional,
          totalAktif: ikuData.iku3.totalAktif,
          totalBerkegiatan: ikuData.iku3.totalBerkegiatan,
        }
      : null;

    const iku3Fallback: IKUDetailData = {
      id: 3,
      code: "IKU 3",
      title: "Mahasiswa Berkegiatan di Luar Program Studi",
      definition: "Persentase mahasiswa S1 dan D4/D3/D2/D1 yang berkegiatan di luar program studi atau meraih prestasi minimal tingkat nasional.",
      value: 0,
      target: 50.0,
      color: "#f59e0b",
      trendData: [],
    };

    const iku5Real: IKUDetailData | null = ikuData?.iku5
      ? {
          id: ikuData.iku5.id,
          code: ikuData.iku5.code,
          title: ikuData.iku5.title,
          definition: ikuData.iku5.definition,
          value: ikuData.iku5.value,
          target: ikuData.iku5.target,
          color: ikuData.iku5.color,
          description: ikuData.iku5.description,
          trendData: ikuData.iku5.trendData || [],
          drilldownData: ikuData.iku5.drilldownData,
          totalLuaran: ikuData.iku5.totalLuaran,
          totalDosen: ikuData.iku5.totalDosen,
          kerjasamaBreakdown: ikuData.iku5.kerjasamaBreakdown,
        }
      : null;

    const iku5Fallback: IKUDetailData = {
      id: 5,
      code: "IKU 5",
      title: "Rasio Luaran Hasil Kerjasama Mitra",
      definition: "Rasio jumlah luaran hasil kerjasama PT dan start-up/industri/lembaga terhadap total dosen PT.",
      value: 0,
      target: 100.0,
      color: "#ec4899",
      trendData: [],
      description: "Rumus: (Jumlah Luaran Kerjasama / Total Dosen) × 100",
    };

    const iku7Real: IKUDetailData | null = ikuData?.iku7
      ? {
          id: ikuData.iku7.id,
          code: ikuData.iku7.code,
          title: ikuData.iku7.title,
          definition: ikuData.iku7.definition,
          value: ikuData.iku7.value,
          target: ikuData.iku7.target,
          color: ikuData.iku7.color,
          description: ikuData.iku7.description,
          trendData: ikuData.iku7.trendData || [],
          drilldownData: ikuData.iku7.drilldownData,
          kegiatanSDG: ikuData.iku7.kegiatanSDG,
          litabmasSDG: ikuData.iku7.litabmasSDG,
          kerjasamaSDG: ikuData.iku7.kerjasamaSDG,
          totalKegiatan: ikuData.iku7.totalKegiatan,
          totalLitabmas: ikuData.iku7.totalLitabmas,
          totalKerjasama: ikuData.iku7.totalKerjasama,
          sdgBreakdown: ikuData.iku7.sdgBreakdown,
          sdgWajib: ikuData.iku7.sdgWajib,
          sdgPilihan: ikuData.iku7.sdgPilihan,
        }
      : null;

    const iku7Fallback: IKUDetailData = {
      id: 7,
      code: "IKU 7",
      title: "Keterlibatan PT dalam SDGs",
      definition: "Persentase program/kegiatan Tri Dharma PT yang berkontribusi pada SDG 1, SDG 4, SDG 17, dan 2 SDGs lain sesuai keunggulan PT.",
      value: 0,
      target: 50.0,
      color: "#f97316",
      trendData: [],
    };

    const iku9Real: IKUDetailData | null = ikuData?.iku9
      ? {
          id: ikuData.iku9.id,
          code: ikuData.iku9.code,
          title: ikuData.iku9.title,
          definition: ikuData.iku9.definition,
          value: ikuData.iku9.value,
          target: ikuData.iku9.target,
          color: ikuData.iku9.color,
          description: ikuData.iku9.description,
          trendData: ikuData.iku9.trendData || [],
          drilldownData: ikuData.iku9.drilldownData,
          pendapatanMahasiswa: ikuData.iku9.pendapatanMahasiswa,
          pendapatanNonMahasiswa: ikuData.iku9.pendapatanNonMahasiswa,
          totalPendapatan: ikuData.iku9.totalPendapatan,
          detailLitabmas: ikuData.iku9.detailLitabmas,
          detailKerjasama: ikuData.iku9.detailKerjasama,
          detailOperasional: ikuData.iku9.detailOperasional,
          revenueBreakdown: ikuData.iku9.revenueBreakdown,
        }
      : null;

    const iku9Fallback: IKUDetailData = {
      id: 9,
      code: "IKU 9",
      title: "Pendapatan Non Pendidikan/Non-UKT",
      definition: "Persentase pendapatan PT dari sumber selain biaya pendidikan mahasiswa (SPP/UKT).",
      value: 0,
      target: 40.0,
      color: "#6366f1",
      trendData: [],
    };

    // IKU opsional dari backend config (value 0, belum ada data)
    const opsionalItems: IKUDetailData[] = (ikuData?.ikuOpsional ?? []).map((o) => ({
      id: o.id,
      code: o.code,
      title: o.title,
      definition: o.definition || '',
      value: o.value,
      target: o.target,
      color: o.color,
      trendData: o.trendData || [],
      drilldownData: o.drilldownData,
    }));

    return [
      iku1Real ?? iku1Fallback,
      iku2Real ?? iku2Fallback,
      iku3Real ?? iku3Fallback,
      iku5Real ?? iku5Fallback,
      iku7Real ?? iku7Fallback,
      iku9Real ?? iku9Fallback,
      ...opsionalItems,
    ];
  }, [ikuData]);

  const handleReset = () => {
    setSelectedTahun(tahunOptions[0]?.key || String(new Date().getFullYear()));
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 p-3 sm:p-6 space-y-6 sm:space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
              <FiTarget className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 shrink-0" />
              Capaian IKU Institusi
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 max-w-2xl">
              Monitoring realisasi 11 Indikator Kinerja Utama Perguruan Tinggi (IKU-PT) sesuai Kepmendikbudristek Tahun 2026.
            </p>
          </div>
        </div>

        {/* Global Filter - Tahun IKU only */}
        <div className="mb-6">
          <FilterPanel
            tahun={tahunOptions}
            selectedTahun={selectedTahun}
            onTahunChange={setSelectedTahun}
            onReset={handleReset}
          />
        </div>

        {/* Loading & Error */}
        {loading && <DashboardSkeleton />}
        {error && <ErrorAlert message={error} />}

        {/* Summary StatCard — konsisten dgn dashboard pimpinan lain */}
        {!loading && allIkuItems.length > 0 && (() => {
          const total = allIkuItems.length;
          const tercapai = allIkuItems.filter((i) => i.value >= i.target && i.value > 0).length;
          const belumTercapai = allIkuItems.filter((i) => i.value < i.target).length;
          const rataAchievement = total > 0
            ? Math.round(allIkuItems.reduce((sum, i) => sum + (i.target > 0 ? Math.min((i.value / i.target) * 100, 100) : 0), 0) / total)
            : 0;
          return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
              <StatCard
                title="Total IKU Dipantau"
                value={total}
                icon={<FiTargetIcon className="w-6 h-6 text-white" />}
                color="indigo"
                subtitle={`${ikuWajibSet.size} IKU Wajib`}
              />
              <StatCard
                title="Tercapai"
                value={tercapai}
                icon={<FiCheckCircle className="w-6 h-6 text-white" />}
                color="green"
                subtitle="Memenuhi atau lampaui target"
              />
              <StatCard
                title="Belum Tercapai"
                value={belumTercapai}
                icon={<FiAlertTriangle className="w-6 h-6 text-white" />}
                color="red"
                subtitle="Perlu intervensi"
              />
              <StatCard
                title="Rata Achievement"
                value={`${rataAchievement}%`}
                icon={<FiTrendingUp className="w-6 h-6 text-white" />}
                color="purple"
                subtitle="Rata-rata progress vs target"
              />
            </div>
          );
        })()}

        {/* Grid IKU 1-11 */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {allIkuItems.map((iku) => (
              <IKUCard
                key={iku.id}
                id={iku.id}
                code={iku.code}
                title={iku.title}
                value={iku.value}
                target={iku.target}
                color={iku.color}
                unit={iku.code.includes("Rasio") ? "" : iku.code.includes("Jumlah") || iku.title.includes("Jumlah") ? "" : "%"}
                isWajib={ikuWajibSet.has(iku.id)}
                onDetailClick={() => handleDetail(iku)}
              />
            ))}
          </div>
        )}

        {/* Modal Detail */}
        <IKUDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={selectedIKU}
        />

        {/* Footer Notes */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            &copy; Universitas Lampung - Sistem Informasi Eksekutif Terintegrasi
          </p>
        </div>

      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
