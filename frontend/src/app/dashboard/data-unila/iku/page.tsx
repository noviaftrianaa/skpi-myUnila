"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/lib/hoc/withAuth";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Spinner,
  Chip,
  Button,
} from "@heroui/react";
import { MdSchool } from "react-icons/md";
import {
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { dataUnilaMenuConfig } from "../config/menuConfig";
import ikuDataService, {
  type IkuData,
  type IkuItem,
} from "@/lib/services/data-unila/ikuDataService";

const APP_KEY = "data-unila";
const IKU_KEYS: Array<keyof IkuData> = ["iku1", "iku2", "iku3", "iku5", "iku7", "iku9"];
const CURRENT_YEAR = new Date().getFullYear();
const TAHUN_OPTIONS = [2023, 2024, 2025, 2026];

// --- StatCard ---
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}
function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card className={`border-none shadow-lg rounded-xl overflow-hidden bg-gradient-to-br ${color}`}>
      <CardBody className="p-4 relative">
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shadow">
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium text-white/80 uppercase tracking-wide">{label}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

// --- SparkBar ---
function SparkBar({ data }: { data: Array<{ name: string; value: number }> }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-10 mt-2">
      {data.map((d) => (
        <div key={d.name} className="flex flex-col items-center flex-1 gap-0.5">
          <span className="text-[9px] text-gray-500 leading-none">{d.value.toFixed(1)}</span>
          <div
            className="w-full rounded-t"
            style={{
              height: `${Math.max(4, (d.value / max) * 28)}px`,
              backgroundColor: "currentColor",
              opacity: 0.7,
            }}
          />
          <span className="text-[9px] text-gray-400 leading-none">{d.name}</span>
        </div>
      ))}
    </div>
  );
}

// --- IKU Card ---
function IkuCard({ iku }: { iku: IkuItem }) {
  const [expanded, setExpanded] = useState(false);
  const [defExpanded, setDefExpanded] = useState(false);
  const [drillExpanded, setDrillExpanded] = useState(false);

  const pct = Math.min(100, (iku.value / (iku.target || 1)) * 100);
  const tercapai = iku.value >= iku.target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
        {/* Color header */}
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ backgroundColor: iku.color }}
        >
          <div>
            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
              {iku.code}
            </span>
          </div>
          {tercapai ? (
            <Chip size="sm" className="bg-white/20 text-white font-semibold text-xs border-none">
              ✅ Tercapai
            </Chip>
          ) : (
            <Chip size="sm" className="bg-white/20 text-white font-semibold text-xs border-none">
              ⚠️ Belum
            </Chip>
          )}
        </div>

        <CardBody className="p-5 space-y-3">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">
            {iku.title}
          </h3>

          {/* Value + Target */}
          <div className="flex items-end justify-between">
            <div>
              <span
                className="text-4xl font-bold"
                style={{ color: iku.color }}
              >
                {iku.value.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 ml-1">%</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Target</p>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {iku.target}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: iku.color }}
            />
          </div>
          <p className="text-xs text-gray-400">{pct.toFixed(1)}% dari target</p>

          {/* Definition */}
          {iku.definition && (
            <div>
              <p
                className={`text-xs text-gray-500 dark:text-gray-400 leading-relaxed ${
                  defExpanded ? "" : "line-clamp-2"
                }`}
              >
                {iku.definition}
              </p>
              <button
                onClick={() => setDefExpanded(!defExpanded)}
                className="text-xs text-primary-500 hover:text-primary-700 mt-1 font-medium"
              >
                {defExpanded ? "Sembunyikan" : "Selengkapnya"}
              </button>
            </div>
          )}

          {/* Trend sparkbar */}
          {iku.trendData && iku.trendData.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Tren</p>
              <div style={{ color: iku.color }}>
                <SparkBar data={iku.trendData} />
              </div>
            </div>
          )}

          {/* Drilldown */}
          {iku.drilldownData && iku.drilldownData.length > 0 && (
            <div>
              <Button
                size="sm"
                variant="flat"
                onPress={() => setDrillExpanded(!drillExpanded)}
                endContent={
                  drillExpanded ? (
                    <FiChevronUp className="w-4 h-4" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )
                }
                className="w-full font-medium"
              >
                Lihat Detail per Fakultas
              </Button>

              <AnimatePresence>
                {drillExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            <th className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 font-semibold">
                              Nama
                            </th>
                            <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300 font-semibold">
                              Nilai
                            </th>
                            <th className="px-3 py-2 text-right text-gray-600 dark:text-gray-300 font-semibold">
                              Target
                            </th>
                            <th className="px-3 py-2 text-center text-gray-600 dark:text-gray-300 font-semibold">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {iku.drilldownData.map((row, i) => (
                            <tr
                              key={row.id}
                              className={
                                i % 2 === 0
                                  ? "bg-white dark:bg-gray-900"
                                  : "bg-gray-50/50 dark:bg-gray-800/50"
                              }
                            >
                              <td className="px-3 py-2 text-gray-800 dark:text-gray-200">
                                {row.name}
                              </td>
                              <td className="px-3 py-2 text-right font-mono font-medium text-gray-800 dark:text-gray-200">
                                {row.value.toFixed(2)}%
                              </td>
                              <td className="px-3 py-2 text-right font-mono text-gray-500">
                                {row.target}%
                              </td>
                              <td className="px-3 py-2 text-center">
                                {row.value >= row.target ? (
                                  <Chip
                                    size="sm"
                                    color="success"
                                    variant="flat"
                                    className="text-[10px]"
                                  >
                                    ✅ Tercapai
                                  </Chip>
                                ) : (
                                  <Chip
                                    size="sm"
                                    color="warning"
                                    variant="flat"
                                    className="text-[10px]"
                                  >
                                    ⚠️ Belum
                                  </Chip>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
}

// --- Skeleton ---
function IkuSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="border-none shadow-lg rounded-xl overflow-hidden">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <CardBody className="p-5 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </CardBody>
        </Card>
      ))}
    </div>
  );
}

// --- Main Page ---
export default function IkuPage() {
  useRequireAuth();
  const [data, setData] = useState<IkuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTahun, setFilterTahun] = useState<number>(
    TAHUN_OPTIONS.includes(CURRENT_YEAR) ? CURRENT_YEAR : 2025
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    ikuDataService
      .getData({ tahun: filterTahun })
      .then(setData)
      .catch((e) => setError(e.message || "Gagal memuat data IKU"))
      .finally(() => setLoading(false));
  }, [filterTahun]);

  // Compute summary
  const ikuList = data
    ? IKU_KEYS.map((k) => data[k] as IkuItem | null | undefined)
    : [];
  const tercapai = ikuList.filter((i) => i && i.value >= i.target).length;
  const belum = ikuList.filter((i) => i && i.value < i.target).length;
  const unavailable = ikuList.filter((i) => !i).length;

  return (
    <DashboardLayoutWithDynamicMenu
      appName="Data Unila"
      appIcon={<MdSchool className="w-6 h-6 text-white" />}
      appKey={APP_KEY}
      fallbackMenus={dataUnilaMenuConfig}
      pageTitle="Dashboard IKU"
    >
      <Toaster position="top-right" />
      <div className="space-y-6">
        {/* Header + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard IKU
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Indikator Kinerja Utama Universitas Lampung
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              aria-label="Tahun"
              selectedKeys={[String(filterTahun)]}
              onSelectionChange={(k) => {
                const v = Array.from(k)[0] as string;
                if (v) setFilterTahun(Number(v));
              }}
              size="sm"
              variant="bordered"
              classNames={{ base: "w-[130px]", trigger: "h-10" }}
            >
              {TAHUN_OPTIONS.map((t) => (
                <SelectItem key={String(t)}>{String(t)}</SelectItem>
              ))}
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && data && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              icon={<FiCheckCircle className="w-6 h-6" />}
              label="Tercapai"
              value={`${tercapai} / 6`}
              color="from-green-500 to-emerald-600"
            />
            <StatCard
              icon={<FiXCircle className="w-6 h-6" />}
              label="Belum Tercapai"
              value={`${belum} / 6`}
              color="from-amber-500 to-orange-500"
            />
            <StatCard
              icon={<FiHelpCircle className="w-6 h-6" />}
              label="Tidak Tersedia"
              value={`${unavailable} / 6`}
              color="from-gray-400 to-gray-500"
            />
          </div>
        )}

        {/* Loading */}
        {loading && <IkuSkeleton />}

        {/* Error */}
        {!loading && error && (
          <Card className="border-none shadow-lg rounded-xl">
            <CardBody className="p-8 text-center">
              <div className="text-red-500 text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Gagal Memuat Data
              </h3>
              <p className="text-sm text-gray-500">{error}</p>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                className="mt-4"
                onPress={() => {
                  setLoading(true);
                  ikuDataService
                    .getData({ tahun: filterTahun })
                    .then(setData)
                    .catch((e) => setError(e.message))
                    .finally(() => setLoading(false));
                }}
              >
                Coba Lagi
              </Button>
            </CardBody>
          </Card>
        )}

        {/* IKU Cards Grid */}
        {!loading && data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {IKU_KEYS.map((key) => {
              const iku = data[key] as IkuItem | null | undefined;
              if (!iku) {
                const code = `IKU ${key.replace("iku", "")}`;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-lg rounded-xl overflow-hidden opacity-60">
                      <div className="px-5 py-3 flex items-center justify-between bg-gray-400">
                        <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                          {code}
                        </span>
                        <Chip
                          size="sm"
                          className="bg-white/20 text-white font-semibold text-xs border-none"
                        >
                          ❓ Tidak Tersedia
                        </Chip>
                      </div>
                      <CardBody className="p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Data {code} belum tersedia untuk tahun {filterTahun}.
                        </p>
                      </CardBody>
                    </Card>
                  </motion.div>
                );
              }
              return <IkuCard key={key} iku={iku} />;
            })}
          </div>
        )}
      </div>
    </DashboardLayoutWithDynamicMenu>
  );
}
