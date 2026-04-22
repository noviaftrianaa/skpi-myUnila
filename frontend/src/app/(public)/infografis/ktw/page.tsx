"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { PageHero } from "@/shared/components";
import {
  ktwService,
  type JenjangKode,
  type KtwOverviewResponse,
  type KtwFakultasResponse,
  type KtwProdiListResponse,
  type KtwProdiRow,
  type KtwTrendResponse,
} from "@/lib/services/public/ktwService";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const JENJANG_OPTIONS: JenjangKode[] = ["S1", "D3", "S2", "S3"];
const CURRENT_YEAR = new Date().getFullYear();
const MASA_MAP: Record<JenjangKode, number> = { D3: 3, D4: 4, S1: 4, S2: 2, S3: 3 };

function defaultCohort(jenjang: JenjangKode): number {
  return CURRENT_YEAR - MASA_MAP[jenjang];
}

function fmtPct(v: number): string {
  return `${v.toFixed(2)}%`;
}

function cutoffPresets(): Array<{ group: string; label: string; value: string }> {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const mkEnd = (yr: number, mn: number) => fmt(new Date(yr, mn + 1, 0));

  return [
    // Umum
    { group: "Umum", label: "Hari ini", value: fmt(new Date(y, m, now.getDate())) },
    { group: "Umum", label: "Akhir bulan lalu", value: fmt(new Date(y, m, 0)) },
    { group: "Umum", label: "Akhir bulan ini", value: fmt(new Date(y, m + 1, 0)) },

    // Akhir semester
    { group: "Akhir Semester", label: `Akhir Gasal ${y - 1}/${y} (31 Jan ${y})`, value: `${y}-01-31` },
    { group: "Akhir Semester", label: `Akhir Genap ${y - 1}/${y} (31 Jul ${y})`, value: `${y}-07-31` },
    { group: "Akhir Semester", label: `Akhir Gasal ${y}/${y + 1} (31 Jan ${y + 1})`, value: `${y + 1}-01-31` },

    // Wisuda (tipikal di Unila)
    { group: "Wisuda", label: `Wisuda Maret ${y} (30 Mar)`, value: `${y}-03-30` },
    { group: "Wisuda", label: `Wisuda Agustus ${y} (30 Agu)`, value: `${y}-08-30` },
    { group: "Wisuda", label: `Wisuda November ${y} (30 Nov)`, value: `${y}-11-30` },

    // Akhir tahun
    { group: "Akhir Tahun", label: `31 Desember ${y - 1}`, value: `${y - 1}-12-31` },
    { group: "Akhir Tahun", label: `31 Desember ${y}`, value: `${y}-12-31` },

    // Akhir bulan tiap kuartal tahun ini
    { group: "Per Bulan Tahun Ini", label: `Akhir Maret ${y}`, value: mkEnd(y, 2) },
    { group: "Per Bulan Tahun Ini", label: `Akhir Juni ${y}`, value: mkEnd(y, 5) },
    { group: "Per Bulan Tahun Ini", label: `Akhir September ${y}`, value: mkEnd(y, 8) },
    { group: "Per Bulan Tahun Ini", label: `Akhir Desember ${y}`, value: mkEnd(y, 11) },
  ];
}

function downloadCSV(filename: string, rows: Array<Array<string | number>>): void {
  const csv = rows.map((r) => r.map((c) => {
    const s = String(c ?? "");
    return s.includes(",") || s.includes("\"") || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });

  // IE / legacy Edge fallback (beberapa client kampus masih pakai)
  const nav = window.navigator as unknown as { msSaveBlob?: (b: Blob, n: string) => void };
  if (typeof nav.msSaveBlob === "function") {
    nav.msSaveBlob(blob, filename);
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // setAttribute lebih reliable daripada property assignment di beberapa browser
  link.setAttribute("download", filename);
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();

  // Delay cleanup supaya browser sempat mulai download sebelum URL di-revoke
  setTimeout(() => {
    if (link.parentNode) link.parentNode.removeChild(link);
    URL.revokeObjectURL(url);
  }, 200);
}

// ECharts instance type (partial)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EChartsRef = { getEchartsInstance: () => any } | null;

function downloadChartPNG(chartRef: React.MutableRefObject<EChartsRef>, filename: string) {
  if (!chartRef.current) return;
  try {
    const inst = chartRef.current.getEchartsInstance();
    const url = inst.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#fff" });
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.error("chart download failed", e);
  }
}

type SortKey = "nm_prodi" | "kode_dikti" | "maba" | "sudah_lulus" | "pct_ktw_strict" | "pct_survival";
type SortDir = "asc" | "desc";

type JalurRow = { id_jalur_daftar: string; nm_jalur: string; maba: number; lulus: number; ktw: number; pct_ktw: number; pct_survival: number };
type MasaStats = { jumlah_lulusan: number; avg_masa: number; min_masa: number; max_masa: number; stddev_masa: number; masa_normatif_tahun: number };

export default function KtwInfografisPage() {
  const [jenjang, setJenjang] = useState<JenjangKode>("S1");
  const [cohort, setCohort] = useState<number>(defaultCohort("S1"));
  const [cutoff, setCutoff] = useState<string>("");
  const [overview, setOverview] = useState<KtwOverviewResponse | null>(null);
  const [fakultas, setFakultas] = useState<KtwFakultasResponse | null>(null);
  const [prodiList, setProdiList] = useState<KtwProdiListResponse | null>(null);
  const [trend, setTrend] = useState<KtwTrendResponse | null>(null);
  const [selectedFakultas, setSelectedFakultas] = useState<{ id: string; nama: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Table controls
  const [searchProdi, setSearchProdi] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("nm_prodi");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Extra breakdowns
  const [statusData, setStatusData] = useState<Array<{ id_jns_keluar: string; nm_status: string; color: string; jumlah: number; persentase: number }> | null>(null);
  const [genderData, setGenderData] = useState<Array<{ jk: string; nm_gender: string; color: string; maba: number; lulus: number; ktw_strict: number; pct_ktw: number }> | null>(null);
  const [jalurData, setJalurData] = useState<JalurRow[] | null>(null);
  const [masaStats, setMasaStats] = useState<MasaStats | null>(null);
  const [topProdi, setTopProdi] = useState<KtwProdiRow[] | null>(null);
  const [presetsData, setPresetsData] = useState<Array<{ group: string; label: string; value: string }> | null>(null);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  // Phased loading: above-fold first, below-fold after
  const [phase, setPhase] = useState<"initial" | "full">("initial");

  const trendChartRef = useRef<EChartsRef>(null);
  const fakultasChartRef = useRef<EChartsRef>(null);
  const statusChartRef = useRef<EChartsRef>(null);
  const genderChartRef = useRef<EChartsRef>(null);
  const jalurChartRef = useRef<EChartsRef>(null);

  // Fetch dynamic presets from backend (ref.semester + common static)
  useEffect(() => {
    ktwService.getPresets().then((r) => setPresetsData(r.data)).catch(() => {});
  }, []);
  const presets = useMemo(() => presetsData ?? cutoffPresets(), [presetsData]);

  useEffect(() => {
    setCohort(defaultCohort(jenjang));
  }, [jenjang]);

  // Phase 1: above-fold data (overview + fakultas + prodi + masa_stats)
  useEffect(() => {
    async function loadPhase1() {
      setLoading(true);
      setPhase("initial");
      try {
        const [ov, fak, prodi, masa] = await Promise.all([
          ktwService.getOverview(cohort, jenjang, false, cutoff || undefined),
          ktwService.getByFakultas(cohort, jenjang, cutoff || undefined),
          ktwService.getByProdi(cohort, jenjang, selectedFakultas?.id ?? undefined, cutoff || undefined),
          ktwService.getMasaMukimStats(cohort, jenjang, cutoff || undefined),
        ]);
        setOverview(ov);
        setFakultas(fak);
        setProdiList(prodi);
        setMasaStats(masa.data);
      } catch (e) {
        console.error("KTW phase 1 error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadPhase1();
  }, [cohort, jenjang, cutoff, selectedFakultas]);

  // Phase 2 (lazy): below-fold charts — deferred 300ms after phase 1 settles
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(async () => {
      try {
        const [tr, stat, gend, jalur, top] = await Promise.all([
          ktwService.getTrend(jenjang, cohort - 5, cohort),
          ktwService.getStatusBreakdown(cohort, jenjang, cutoff || undefined),
          ktwService.getGenderBreakdown(cohort, jenjang, cutoff || undefined),
          ktwService.getJalurBreakdown(cohort, jenjang, cutoff || undefined),
          ktwService.getTopProdi(cohort, jenjang, 10, cutoff || undefined),
        ]);
        setTrend(tr);
        setStatusData(stat.data);
        setGenderData(gend.data);
        setJalurData(jalur.data);
        setTopProdi(top.data);
        setPhase("full");
      } catch (e) {
        console.error("KTW phase 2 error:", e);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [loading, cohort, jenjang, cutoff]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await ktwService.refreshCache();
      // Re-fetch by bumping a state value — easier: trigger effect via cutoff toggle
      // Simpler: reload the window cache by setting phase to reset
      setTrend(null);
      setStatusData(null);
      setGenderData(null);
      setJalurData(null);
      // Trigger both effects: change cutoff then change back is messy. Just reload page data.
      setLoading(true);
      const [ov, fak, prodi, masa] = await Promise.all([
        ktwService.getOverview(cohort, jenjang, false, cutoff || undefined),
        ktwService.getByFakultas(cohort, jenjang, cutoff || undefined),
        ktwService.getByProdi(cohort, jenjang, selectedFakultas?.id ?? undefined, cutoff || undefined),
        ktwService.getMasaMukimStats(cohort, jenjang, cutoff || undefined),
      ]);
      setOverview(ov); setFakultas(fak); setProdiList(prodi); setMasaStats(masa.data);
      setLoading(false);
    } catch (e) {
      console.error("Refresh error:", e);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  // ====== ECharts options ======

  const fakultasChartOption = useMemo(() => {
    if (!fakultas || fakultas.data.length === 0) return null;
    const sorted = [...fakultas.data].sort((a, b) => b.pct_ktw_strict - a.pct_ktw_strict);
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;",
        formatter: (params: Array<{ axisValue: string; marker: string; seriesName: string; value: number }>) => {
          const row = sorted.find((r) => r.nm_fakultas === params[0].axisValue);
          if (!row) return "";
          let html = `<div style="padding:6px;min-width:240px;"><div style="font-weight:700;color:#1e40af;margin-bottom:6px;">${row.nm_fakultas}</div>`;
          html += `<div style="font-size:11px;color:#6b7280;margin-bottom:6px;">Maba ${row.maba.toLocaleString("id-ID")} • Lulus ${row.sudah_lulus.toLocaleString("id-ID")}</div>`;
          params.forEach((p) => {
            html += `<div>${p.marker} <strong>${p.seriesName}:</strong> ${p.value}%</div>`;
          });
          html += `<div style="font-size:11px;color:#9ca3af;margin-top:6px;font-style:italic;">Klik bar untuk drilldown →</div>`;
          html += "</div>";
          return html;
        },
      },
      grid: { left: 8, right: 60, top: 20, bottom: 20, containLabel: true },
      xAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%", fontSize: 10, color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } } },
      yAxis: {
        type: "category",
        data: sorted.map((r) => r.nm_fakultas),
        axisLabel: { fontSize: 11, color: "#1f2937", overflow: "break", width: 170, fontWeight: 600 },
      },
      series: [
        {
          name: "KTW",
          type: "bar",
          data: sorted.map((r) => ({
            value: r.pct_ktw_strict,
            _id: r.id_fakultas,
            _nama: r.nm_fakultas,
            itemStyle: {
              color: r.pct_ktw_strict < 50 ? "#ef4444" : r.pct_ktw_strict < 65 ? "#f59e0b" : "#10b981",
              borderRadius: [0, 4, 4, 0],
            },
          })),
          label: { show: true, position: "right", formatter: "{c}%", fontSize: 10, fontWeight: 600 },
          cursor: "pointer",
        },
      ],
    };
  }, [fakultas]);

  const trendChartOption = useMemo(() => {
    if (!trend || trend.data.length === 0) return null;
    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.96)",
        borderColor: "#3b82f6",
        borderWidth: 1,
        extraCssText: "box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px;",
        formatter: (params: Array<{ axisValue: string; marker: string; seriesName: string; value: number }>) => {
          const yr = params[0].axisValue;
          const row = trend.data.find((d) => String(d.tahun) === yr);
          let html = `<div style="padding:6px;min-width:200px;"><div style="font-weight:700;color:#1e40af;margin-bottom:4px;">Angkatan ${yr} Gasal</div>`;
          if (row) html += `<div style="font-size:11px;color:#6b7280;margin-bottom:6px;">Maba ${row.maba.toLocaleString("id-ID")} PDB</div>`;
          params.forEach((p) => {
            html += `<div>${p.marker} <strong>${p.seriesName}:</strong> ${p.value}%</div>`;
          });
          html += "</div>";
          return html;
        },
      },
      legend: { data: ["KTW", "Total Lulus"], bottom: 0, textStyle: { fontSize: 11, fontWeight: 600 } },
      grid: { left: 50, right: 30, top: 20, bottom: 50 },
      xAxis: {
        type: "category",
        data: trend.data.map((d) => d.tahun),
        axisLabel: { fontSize: 11, fontWeight: 600, color: "#1f2937" },
      },
      yAxis: {
        type: "value",
        max: 100,
        axisLabel: { formatter: "{value}%", fontSize: 10, color: "#6b7280" },
        splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } },
      },
      series: [
        {
          name: "KTW",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 10,
          data: trend.data.map((d) => d.pct_ktw_strict),
          itemStyle: { color: "#3b82f6" },
          lineStyle: { width: 3 },
          areaStyle: { color: "rgba(59, 130, 246, 0.1)" },
        },
        {
          name: "Total Lulus",
          type: "line",
          smooth: true,
          symbol: "diamond",
          symbolSize: 8,
          data: trend.data.map((d) => d.pct_survival),
          itemStyle: { color: "#8b5cf6" },
          lineStyle: { width: 2, type: "dashed" },
        },
      ],
    };
  }, [trend]);

  const cohortOptions = useMemo(() => {
    const startYear = CURRENT_YEAR - 10;
    const endYear = CURRENT_YEAR - MASA_MAP[jenjang];
    const years: number[] = [];
    for (let y = endYear; y >= startYear; y--) years.push(y);
    return years;
  }, [jenjang]);

  // ====== Status & Gender chart options ======
  const statusChartOption = useMemo(() => {
    if (!statusData || statusData.length === 0) return null;
    return {
      tooltip: {
        trigger: "item",
        formatter: (p: { data: { value: number; name: string; meta: { persentase: number } } }) =>
          `<div style="padding:4px;"><strong>${p.data.name}</strong><br/>${p.data.value.toLocaleString("id-ID")} mhs (${p.data.meta.persentase}%)</div>`,
      },
      legend: { orient: "horizontal", bottom: 0, textStyle: { fontSize: 11 } },
      series: [
        {
          name: "Status Mahasiswa",
          type: "pie",
          radius: ["45%", "75%"],
          center: ["50%", "44%"],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
          label: { show: true, formatter: "{b}\n{d}%", fontSize: 10, fontWeight: 600 },
          labelLine: { length: 8, length2: 4 },
          data: statusData.map((s) => ({
            name: s.nm_status,
            value: s.jumlah,
            itemStyle: { color: s.color },
            meta: { persentase: s.persentase },
          })),
        },
      ],
    };
  }, [statusData]);

  const genderChartOption = useMemo(() => {
    if (!genderData || genderData.length === 0) return null;
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: { bottom: 0, textStyle: { fontSize: 11 } },
      grid: { left: 50, right: 30, top: 20, bottom: 50, containLabel: true },
      xAxis: {
        type: "category",
        data: genderData.map((g) => g.nm_gender),
        axisLabel: { fontSize: 12, fontWeight: 600, color: "#1f2937" },
      },
      yAxis: { type: "value", axisLabel: { fontSize: 10, color: "#6b7280" } },
      series: [
        {
          name: "Maba",
          type: "bar",
          data: genderData.map((g) => ({ value: g.maba, itemStyle: { color: "#94a3b8", borderRadius: [4, 4, 0, 0] } })),
          label: { show: true, position: "top", fontSize: 10, fontWeight: 600 },
        },
        {
          name: "Sudah Lulus",
          type: "bar",
          data: genderData.map((g) => ({ value: g.lulus, itemStyle: { color: "#8b5cf6", borderRadius: [4, 4, 0, 0] } })),
          label: { show: true, position: "top", fontSize: 10, fontWeight: 600 },
        },
        {
          name: "KTW",
          type: "bar",
          data: genderData.map((g) => ({ value: g.ktw_strict, itemStyle: { color: g.color, borderRadius: [4, 4, 0, 0] } })),
          label: { show: true, position: "top", fontSize: 10, fontWeight: 600, formatter: (p: { value: number; dataIndex: number }) => `${p.value}\n(${genderData[p.dataIndex].pct_ktw}%)` },
        },
      ],
    };
  }, [genderData]);

  // Gauge IKU target
  const gaugeIkuOption = useMemo(() => {
    if (!overview) return null;
    const pct = overview.data.pct_ktw_strict;
    return {
      series: [
        {
          type: "gauge",
          startAngle: 200,
          endAngle: -20,
          min: 0,
          max: 100,
          radius: "90%",
          center: ["50%", "65%"],
          progress: { show: true, width: 20, itemStyle: { color: pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444" } },
          axisLine: { lineStyle: { width: 20, color: [[0.5, "#fecaca"], [0.8, "#fde68a"], [1, "#bbf7d0"]] } },
          axisTick: { distance: -30, splitNumber: 5, lineStyle: { color: "#94a3b8", width: 2 } },
          splitLine: { distance: -30, length: 14, lineStyle: { color: "#64748b", width: 3 } },
          axisLabel: { distance: -20, color: "#64748b", fontSize: 11, formatter: "{value}%" },
          pointer: { show: false },
          title: { show: false },
          detail: {
            valueAnimation: true,
            width: "60%",
            lineHeight: 40,
            borderRadius: 8,
            offsetCenter: [0, "0%"],
            fontSize: 42,
            fontWeight: "bold",
            formatter: `{value}%`,
            color: pct >= 80 ? "#059669" : pct >= 60 ? "#d97706" : "#dc2626",
          },
          data: [{ value: pct.toFixed(2) }],
        },
      ],
    };
  }, [overview]);

  // Jalur breakdown
  const jalurChartOption = useMemo(() => {
    if (!jalurData || jalurData.length === 0) return null;
    const sorted = [...jalurData].sort((a, b) => b.maba - a.maba);
    const palette = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#ef4444", "#6366f1", "#f97316", "#14b8a6"];
    return {
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: Array<{ axisValue: string; marker: string; seriesName: string; value: number; dataIndex: number }>) => {
          const row = sorted[params[0].dataIndex];
          let html = `<div style="padding:6px;min-width:200px;"><div style="font-weight:700;color:#1e40af;margin-bottom:4px;">${row.nm_jalur}</div>`;
          html += `<div style="font-size:11px;color:#6b7280;margin-bottom:6px;">Maba ${row.maba.toLocaleString("id-ID")} • Lulus ${row.lulus.toLocaleString("id-ID")}</div>`;
          params.forEach((p) => {
            html += `<div>${p.marker} <strong>${p.seriesName}:</strong> ${p.value}%</div>`;
          });
          html += "</div>";
          return html;
        },
      },
      legend: { data: ["KTW", "Total Lulus"], bottom: 0, textStyle: { fontSize: 11, fontWeight: 600 } },
      grid: { left: 8, right: 50, top: 20, bottom: 40, containLabel: true },
      xAxis: { type: "value", max: 100, axisLabel: { formatter: "{value}%", fontSize: 10, color: "#6b7280" }, splitLine: { lineStyle: { color: "#e5e7eb", type: "dashed" } } },
      yAxis: {
        type: "category",
        data: sorted.map((r) => r.nm_jalur),
        axisLabel: { fontSize: 11, color: "#1f2937", overflow: "break", width: 200, fontWeight: 600 },
      },
      series: [
        {
          name: "KTW",
          type: "bar",
          data: sorted.map((r, i) => ({
            value: r.pct_ktw,
            itemStyle: { color: palette[i % palette.length], borderRadius: [0, 4, 4, 0] },
          })),
          label: { show: true, position: "right", formatter: "{c}%", fontSize: 10, fontWeight: 600 },
        },
        {
          name: "Total Lulus",
          type: "bar",
          data: sorted.map((r) => ({
            value: r.pct_survival,
            itemStyle: { color: "#cbd5e1", borderRadius: [0, 4, 4, 0] },
          })),
          label: { show: true, position: "right", formatter: "{c}%", fontSize: 10, fontWeight: 600 },
        },
      ],
    };
  }, [jalurData]);

  // ====== Table filter & sort ======
  const sortedFilteredProdi = useMemo(() => {
    if (!prodiList) return [];
    const q = searchProdi.trim().toLowerCase();
    let rows = prodiList.data;
    if (q) {
      rows = rows.filter((p) =>
        p.nm_prodi.toLowerCase().includes(q) ||
        (p.kode_dikti ?? "").toLowerCase().includes(q)
      );
    }
    const dir = sortDir === "asc" ? 1 : -1;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      const as = String(av ?? "");
      const bs = String(bv ?? "");
      return as.localeCompare(bs) * dir;
    });
    return copy;
  }, [prodiList, searchProdi, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "nm_prodi" || key === "kode_dikti" ? "asc" : "desc");
    }
  };

  // ====== Export handlers ======

  const exportProdiCSV = () => {
    if (!prodiList) return;
    const header = ["No", "Kode PDDIKTI", "Prodi", "Maba (PDB)", "Sudah Lulus", "KTW", "% KTW", "% Total Lulus", "Flag Bawah Standar"];
    const rows: Array<Array<string | number>> = [header];
    prodiList.data.forEach((p, i) => {
      rows.push([
        i + 1,
        p.kode_dikti ?? "",
        p.nm_prodi,
        p.maba,
        p.sudah_lulus,
        p.ktw_strict,
        p.pct_ktw_strict,
        p.pct_survival,
        (p as unknown as { flag_bawah_standar?: boolean }).flag_bawah_standar ? "YA" : "",
      ]);
    });
    const fname = `KTW_${jenjang}_Angkatan_${cohort}${selectedFakultas ? `_${selectedFakultas.nama.replace(/\s+/g, "_")}` : ""}_${cutoff || "today"}.csv`;
    downloadCSV(fname, rows);
  };

  const exportFakultasCSV = () => {
    if (!fakultas) return;
    const header = ["No", "Fakultas", "Maba (PDB)", "Sudah Lulus", "KTW", "% KTW", "% Total Lulus"];
    const rows: Array<Array<string | number>> = [header];
    fakultas.data.forEach((f, i) => {
      rows.push([i + 1, f.nm_fakultas, f.maba, f.sudah_lulus, f.ktw_strict, f.pct_ktw_strict, f.pct_survival]);
    });
    downloadCSV(`KTW_${jenjang}_Angkatan_${cohort}_Fakultas_${cutoff || "today"}.csv`, rows);
  };

  // ====== Chart click handler for drilldown ======
  const handleFakultasChartClick = (e: { data?: { _id?: string; _nama?: string } }) => {
    const d = e.data;
    if (!d?._id || !d?._nama) return;
    setSelectedFakultas({ id: d._id, nama: d._nama });
    setTimeout(() => {
      document.getElementById("prodi-table-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <PageHero
        title="Kelulusan Tepat Waktu"
        subtitle="Statistik KTW per Angkatan — Universitas Lampung"
        description="Data kelulusan tepat waktu mahasiswa Universitas Lampung per angkatan Gasal sesuai masa studi normatif PDDIKTI — drilldown hingga program studi."
        gradient="from-blue-600 via-indigo-600 to-purple-700"
        icon={
          <svg className="w-10 h-10 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        }
      />

      <div className="bg-gradient-to-b from-slate-50 to-white pb-20">
        <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/infografis" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Infografis
            </Link>
          </div>

          {/* Filter Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-800">Filter Data</h2>
                <button
                  onClick={() => setShowInfo((v) => !v)}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-blue-300 bg-blue-50 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100"
                  title="Apa itu KTW?"
                  aria-label="Info KTW"
                >i</button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {jenjang} • Angkatan {cohort} Gasal{cutoff ? ` • s.d ${cutoff}` : ""}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition-all hover:bg-blue-100 disabled:opacity-50"
                  title="Refresh cache (ambil data terbaru dari pdut)"
                >
                  <svg className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {refreshing ? "Refreshing…" : "Refresh"}
                </button>
                {(cutoff || selectedFakultas || jenjang !== "S1" || cohort !== defaultCohort("S1")) && (
                  <button
                    onClick={() => {
                      setJenjang("S1");
                      setCohort(defaultCohort("S1"));
                      setCutoff("");
                      setSelectedFakultas(null);
                      setSearchProdi("");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    title="Reset semua filter ke default"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reset Filter
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900">
                    <div className="mb-2 font-bold">Definisi KTW — Kelulusan Tepat Waktu</div>
                    <ul className="space-y-1.5">
                      <li>
                        <strong>Formula:</strong> Mahasiswa dihitung KTW kalau lulus dengan masa studi ≤ masa normatif PDDIKTI (S1 ≤ 4 tahun, D3 ≤ 3 tahun, S2 ≤ 2 tahun, S3 ≤ 3 tahun).
                      </li>
                      <li>
                        Dihitung dengan rumus kalender: <code className="rounded bg-white px-1">tgl_keluar − tgl_masuk_sp</code>. Tidak exclude cuti — sesuai PDDIKTI feeder standard.
                      </li>
                      <li>
                        Persentase = <code className="rounded bg-white px-1">KTW / Maba</code> di angkatan Gasal (Peserta Didik Baru). Transfer, pindahan, alih jenjang TIDAK dihitung.
                      </li>
                      <li className="pt-1">
                        Definisi ini match dengan spordit (<code className="rounded bg-white px-1">masa_studi_generate_lulusan.jml_ktw</code>) dan laporan IKU Kemdiktisaintek.
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Jenjang */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Jenjang</label>
                <select
                  value={jenjang}
                  onChange={(e) => setJenjang(e.target.value as JenjangKode)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {JENJANG_OPTIONS.map((j) => (
                    <option key={j} value={j}>{j} — {MASA_MAP[j]} tahun normatif</option>
                  ))}
                </select>
              </div>

              {/* Cohort */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tahun Angkatan (Gasal)</label>
                <select
                  value={cohort}
                  onChange={(e) => setCohort(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {cohortOptions.map((y) => (
                    <option key={y} value={y}>{y} → tepat waktu {y + MASA_MAP[jenjang]}</option>
                  ))}
                </select>
              </div>

              {/* Unified cutoff — date input + preset dropdown combined */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Cutoff Tanggal
                  <span className="ml-1 text-slate-400 font-normal">(snapshot lulus s.d tanggal ini)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={cutoff}
                    onChange={(e) => setCutoff(e.target.value)}
                    placeholder="Hari ini"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <select
                    value=""
                    onChange={(e) => { if (e.target.value) setCutoff(e.target.value); }}
                    className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-xs text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    title="Preset dari kalender akademik Unila"
                  >
                    <option value="">⚡ Preset</option>
                    {Array.from(new Set(presets.map((p) => p.group))).map((group) => (
                      <optgroup key={group} label={group}>
                        {presets.filter((p) => p.group === group).map((p) => (
                          <option key={p.value + p.label} value={p.value}>{p.label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              <strong>Filter sesuai tim wali data:</strong> KTW dihitung untuk <strong>Peserta Didik Baru murni</strong> (id_jns_daftar=1), periode masuk <strong>Gasal</strong> (Agustus-Desember). Tidak termasuk Pindahan, Lintas Jalur, Alih Jenjang, RPL. Sumber: pdut realtime.
            </div>
          </motion.div>

          {/* Loading skeleton saat initial */}
          {loading && !overview && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-slate-100 p-5 shadow-sm animate-pulse">
                    <div className="h-3 w-20 rounded bg-slate-200" />
                    <div className="mt-3 h-8 w-24 rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
                  </div>
                ))}
              </div>
              <div className="mb-8 h-32 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
              <div className="mb-8 h-96 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
            </>
          )}
          {loading && overview && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memuat ulang…
            </div>
          )}

          {/* Stat cards */}
          {overview && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <StatCard
                icon="users"
                label="Maba (PDB)"
                value={overview.data.maba.toLocaleString("id-ID")}
                sub="Populasi awal angkatan"
                color="slate"
              />
              <StatCard
                icon="check"
                label="KTW"
                value={fmtPct(overview.data.pct_ktw_strict)}
                sub={`${overview.data.ktw_strict.toLocaleString("id-ID")} mhs lulus ≤ ${overview.data.masa_normatif_tahun} tahun`}
                color="blue"
              />
              <StatCard
                icon="graduation"
                label="Total Lulus"
                value={fmtPct(overview.data.pct_survival)}
                sub={`${overview.data.sudah_lulus.toLocaleString("id-ID")} dari ${overview.data.maba.toLocaleString("id-ID")}`}
                color="violet"
              />
              <StatCard
                icon="clock"
                label="Masih Aktif"
                value={overview.data.masih_aktif.toLocaleString("id-ID")}
                sub="Belum lulus, belum keluar"
                color="green"
              />
            </motion.div>
          )}

          {/* Secondary info row + Masa Mukim stats */}
          {overview && (
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
              <InfoPill label="Keluar Non-Lulus" value={overview.data.keluar_non_lulus.toLocaleString("id-ID")} tone="red" />
              <InfoPill label="Periode Masuk" value={overview.data.id_smt_masuk ?? "-"} tone="indigo" />
              <InfoPill label="Snapshot per" value={overview.cutoff_date ?? new Date().toISOString().slice(0, 10)} tone="slate" />
              {masaStats && masaStats.jumlah_lulusan > 0 && (
                <>
                  <InfoPill label="Rata-rata Masa Studi" value={`${masaStats.avg_masa.toFixed(2)} thn`} tone="blue" />
                  <InfoPill label="Min / Max" value={`${masaStats.min_masa.toFixed(2)} / ${masaStats.max_masa.toFixed(2)} thn`} tone="indigo" />
                  <InfoPill label="Std Deviasi" value={`± ${masaStats.stddev_masa.toFixed(2)} thn`} tone="slate" />
                </>
              )}
            </div>
          )}

          {/* Trend chart */}
          {trend && trendChartOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                    <span>📈</span> Trend KTW 6 Angkatan — {jenjang}
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm">KTW & Total Lulus angkatan {cohort - 5}-{cohort} Gasal</p>
                </div>
                <button
                  onClick={() => downloadChartPNG(trendChartRef, `KTW_Trend_${jenjang}_${cohort - 5}-${cohort}.png`)}
                  className="rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25"
                  title="Download chart sebagai PNG"
                >
                  <DownloadIcon /> PNG
                </button>
              </div>
              <div className="p-4 sm:p-5">
                <ReactECharts
                  ref={(r: unknown) => { trendChartRef.current = r as EChartsRef; }}
                  option={trendChartOption}
                  style={{ height: "320px", width: "100%" }}
                  opts={{ renderer: "svg" }}
                />
              </div>
            </motion.div>
          )}

          {/* Gauge IKU + Cerita Angkatan — 2 col */}
          {overview && (
            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Gauge IKU */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                  <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                    <span>🎯</span> Pencapaian Target IKU
                  </h3>
                  <p className="text-indigo-100 text-xs sm:text-sm">Target Kemdiktisaintek: 80% KTW</p>
                </div>
                <div className="p-4 sm:p-5">
                  {gaugeIkuOption && (
                    <div className="h-[240px]">
                      <ReactECharts option={gaugeIkuOption} style={{ height: "100%", width: "100%" }} opts={{ renderer: "svg" }} />
                    </div>
                  )}
                  <div className="mt-3 text-center text-xs">
                    {overview.data.pct_ktw_strict >= 80 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">✓ Tercapai</span>
                    ) : overview.data.pct_ktw_strict >= 60 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">⚠ Perlu ditingkatkan</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">⚠ Di bawah standar</span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Cerita Angkatan */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-cyan-600">
                  <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                    <span>📖</span> Cerita Angkatan {cohort}
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm">Perjalanan {overview.data.maba.toLocaleString("id-ID")} mahasiswa</p>
                </div>
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">👨‍🎓</div>
                      <div>
                        <div className="text-xs text-slate-500">Maba angkatan {cohort}</div>
                        <div className="text-lg font-bold text-slate-900">{overview.data.maba.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-700">100%</div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-3 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">✅</div>
                      <div>
                        <div className="text-xs text-emerald-700">Lulus tepat waktu (≤ {overview.data.masa_normatif_tahun}y)</div>
                        <div className="text-lg font-bold text-emerald-900">{overview.data.ktw_strict.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-emerald-700">{overview.data.pct_ktw_strict.toFixed(1)}%</div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-amber-50 p-3 border border-amber-200">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🕐</div>
                      <div>
                        <div className="text-xs text-amber-700">Lulus terlambat</div>
                        <div className="text-lg font-bold text-amber-900">{Math.max(0, overview.data.sudah_lulus - overview.data.ktw_strict).toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-amber-700">{overview.data.maba > 0 ? (((overview.data.sudah_lulus - overview.data.ktw_strict) / overview.data.maba) * 100).toFixed(1) : 0}%</div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📚</div>
                      <div>
                        <div className="text-xs text-blue-700">Masih aktif (belum lulus)</div>
                        <div className="text-lg font-bold text-blue-900">{overview.data.masih_aktif.toLocaleString("id-ID")}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-blue-700">{overview.data.maba > 0 ? ((overview.data.masih_aktif / overview.data.maba) * 100).toFixed(1) : 0}%</div>
                  </div>
                  {overview.data.keluar_non_lulus > 0 && (
                    <div className="flex items-center justify-between rounded-lg bg-red-50 p-3 border border-red-200">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">🚪</div>
                        <div>
                          <div className="text-xs text-red-700">Keluar (DO/Undur/PS/dll)</div>
                          <div className="text-lg font-bold text-red-900">{overview.data.keluar_non_lulus.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-red-700">{overview.data.maba > 0 ? ((overview.data.keluar_non_lulus / overview.data.maba) * 100).toFixed(1) : 0}%</div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Top 10 Prodi tercepat lulus */}
          {topProdi && topProdi.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-500">
                <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                  <span>🏆</span> Top 10 Prodi Terbaik KTW
                </h3>
                <p className="text-amber-50 text-xs sm:text-sm">Prodi dengan persentase KTW tertinggi (minimum 20 Maba)</p>
              </div>
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {topProdi.slice(0, 10).map((p, i) => {
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
                    const pct = p.pct_ktw_strict;
                    const bg = pct >= 80 ? "from-emerald-50 to-emerald-100 border-emerald-200" : pct >= 65 ? "from-blue-50 to-blue-100 border-blue-200" : "from-slate-50 to-slate-100 border-slate-200";
                    return (
                      <div key={p.id_prodi} className={`flex items-center gap-3 rounded-xl border bg-gradient-to-br ${bg} p-3 transition-all hover:scale-[1.02]`}>
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-xl font-bold shadow-sm">
                          {medal}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate" title={p.nm_prodi}>{p.nm_prodi}</div>
                          <div className="text-[10px] text-slate-500">Kode {p.kode_dikti ?? "-"} · {p.maba.toLocaleString("id-ID")} Maba</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-emerald-700">{pct.toFixed(1)}%</div>
                          <div className="text-[10px] text-slate-500">{p.ktw_strict}/{p.maba}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Status & Gender breakdown — 2 kolom di desktop */}
          {(statusData || genderData) && (
            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {statusData && statusChartOption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-500 to-purple-600">
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                        <span>📊</span> Status Mahasiswa
                      </h3>
                      <p className="text-violet-100 text-xs sm:text-sm">Distribusi Lulus/Aktif/DO/PS angkatan {cohort}</p>
                    </div>
                    <button
                      onClick={() => downloadChartPNG(statusChartRef, `KTW_Status_${jenjang}_${cohort}.png`)}
                      className="rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25"
                    >
                      <DownloadIcon /> PNG
                    </button>
                  </div>
                  <div className="p-4 sm:p-5">
                    <ReactECharts
                      ref={(r: unknown) => { statusChartRef.current = r as EChartsRef; }}
                      option={statusChartOption}
                      style={{ height: "340px", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </motion.div>
              )}

              {genderData && genderChartOption && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-pink-500 to-rose-600">
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                        <span>👫</span> Perbandingan Gender
                      </h3>
                      <p className="text-pink-100 text-xs sm:text-sm">Maba, lulus, dan KTW — L vs P</p>
                    </div>
                    <button
                      onClick={() => downloadChartPNG(genderChartRef, `KTW_Gender_${jenjang}_${cohort}.png`)}
                      className="rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25"
                    >
                      <DownloadIcon /> PNG
                    </button>
                  </div>
                  <div className="p-4 sm:p-5">
                    <ReactECharts
                      ref={(r: unknown) => { genderChartRef.current = r as EChartsRef; }}
                      option={genderChartOption}
                      style={{ height: "340px", width: "100%" }}
                      opts={{ renderer: "svg" }}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Jalur Breakdown chart */}
          {jalurData && jalurChartOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-cyan-500 to-teal-500">
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                    <span>🚪</span> KTW per Jalur Masuk
                  </h3>
                  <p className="text-cyan-50 text-xs sm:text-sm">Perbandingan SBMPTN/SNMPTN/Mandiri/SNBP/dll</p>
                </div>
                <button
                  onClick={() => downloadChartPNG(jalurChartRef, `KTW_Jalur_${jenjang}_${cohort}.png`)}
                  className="rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25"
                >
                  <DownloadIcon /> PNG
                </button>
              </div>
              <div className="p-4 sm:p-5">
                <ReactECharts
                  ref={(r: unknown) => { jalurChartRef.current = r as EChartsRef; }}
                  option={jalurChartOption}
                  style={{ height: `${Math.max(280, jalurData.length * 46)}px`, width: "100%" }}
                  opts={{ renderer: "svg" }}
                />
              </div>
            </motion.div>
          )}

          {/* Fakultas chart + drilldown hint */}
          {fakultas && fakultasChartOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600">
                <div>
                  <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                    <span>🏛️</span> KTW per Fakultas
                  </h3>
                  <p className="text-emerald-50 text-xs sm:text-sm">Klik bar untuk drilldown ke prodi di fakultas tersebut</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportFakultasCSV}
                    className="rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25"
                    title="Export tabel fakultas ke CSV"
                  >
                    <DownloadIcon /> CSV
                  </button>
                  <button
                    onClick={() => downloadChartPNG(fakultasChartRef, `KTW_Fakultas_${jenjang}_${cohort}.png`)}
                    className="rounded-lg bg-white/15 border border-white/30 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-white/25"
                    title="Download chart sebagai PNG"
                  >
                    <DownloadIcon /> PNG
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <ReactECharts
                  ref={(r: unknown) => { fakultasChartRef.current = r as EChartsRef; }}
                  option={fakultasChartOption}
                  style={{ height: `${Math.max(360, fakultas.data.length * 48)}px`, width: "100%" }}
                  onEvents={{ click: handleFakultasChartClick }}
                  opts={{ renderer: "svg" }}
                />
              </div>
            </motion.div>
          )}

          {/* Prodi table */}
          {prodiList && (
            <motion.div
              id="prodi-table-section"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-md overflow-hidden"
            >
              <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    KTW per Program Studi
                    {selectedFakultas && (
                      <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {selectedFakultas.nama}
                      </span>
                    )}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {prodiList.data.length} prodi • diurutkan A-Z
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedFakultas && (
                    <button
                      onClick={() => setSelectedFakultas(null)}
                      className="rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition-colors hover:bg-blue-100"
                    >
                      ← Tampilkan semua fakultas
                    </button>
                  )}
                  <button
                    onClick={exportProdiCSV}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                  >
                    <DownloadIcon /> Export CSV
                  </button>
                </div>
              </div>

              {/* Search bar */}
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
                <div className="relative max-w-md">
                  <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                  <input
                    type="text"
                    value={searchProdi}
                    onChange={(e) => setSearchProdi(e.target.value)}
                    placeholder="Cari prodi atau kode PDDIKTI…"
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  {searchProdi && (
                    <button
                      onClick={() => setSearchProdi("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      title="Clear search"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  {searchProdi
                    ? `Menampilkan ${sortedFilteredProdi.length} dari ${prodiList.data.length} prodi`
                    : `Menampilkan semua ${prodiList.data.length} prodi`}
                </div>
              </div>

              {sortedFilteredProdi.length === 0 ? (
                <div className="p-10 text-center text-sm text-slate-500">
                  {prodiList.data.length === 0
                    ? "Tidak ada data prodi untuk filter ini."
                    : `Tidak ada prodi yang cocok dengan "${searchProdi}".`}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-700 w-12">No</th>
                        <SortableTh label="Kode" sortKey="kode_dikti" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} align="left" />
                        <SortableTh label="Program Studi" sortKey="nm_prodi" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} align="left" />
                        <SortableTh label="Maba" sortKey="maba" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} align="right" />
                        <SortableTh label="Lulus" sortKey="sudah_lulus" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} align="right" />
                        <SortableTh label="KTW" sortKey="pct_ktw_strict" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} align="right" />
                        <SortableTh label="% Total Lulus" sortKey="pct_survival" currentKey={sortKey} currentDir={sortDir} onClick={toggleSort} align="right" />
                      </tr>
                    </thead>
                    <tbody>
                      {sortedFilteredProdi.map((p: KtwProdiRow, i: number) => {
                        const pct = p.pct_ktw_strict;
                        const tier = pct < 50 ? "danger" : pct < 65 ? "warning" : "ok";
                        const rowBg = tier === "danger" ? "bg-red-50/60" : tier === "warning" ? "bg-amber-50/50" : "";
                        const dotColor = tier === "danger" ? "bg-red-500" : tier === "warning" ? "bg-amber-500" : "bg-emerald-500";
                        const title = tier === "danger" ? "KTW di bawah 50% — perlu perhatian"
                          : tier === "warning" ? "KTW 50-65% — perlu pemantauan"
                          : "KTW di atas 65% — baik";
                        const badgeColor: "blue" | "red" | "amber" | "green" = tier === "danger" ? "red" : tier === "warning" ? "amber" : "green";
                        return (
                          <tr
                            key={p.id_prodi ?? p.nm_prodi}
                            className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${rowBg}`}
                            title={title}
                          >
                            <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                            <td className="px-4 py-3 text-xs font-mono text-slate-600">{p.kode_dikti ?? "-"}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`inline-flex h-2 w-2 rounded-full ${dotColor}`} title={title} />
                                {p.nm_prodi}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">{p.maba.toLocaleString("id-ID")}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{p.sudah_lulus.toLocaleString("id-ID")}</td>
                            <td className="px-4 py-3 text-right">
                              <PctBadge pct={p.pct_ktw_strict} color={badgeColor} count={p.ktw_strict} />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <PctBadge pct={p.pct_survival} color="violet" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {prodiList.summary && !searchProdi && (
                      <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-semibold">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-slate-800">Total</td>
                          <td className="px-4 py-3 text-right tabular-nums">{prodiList.summary.maba.toLocaleString("id-ID")}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{prodiList.summary.sudah_lulus.toLocaleString("id-ID")}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{prodiList.summary.ktw_strict.toLocaleString("id-ID")} <span className="text-xs font-normal text-slate-500">({fmtPct(prodiList.summary.pct_ktw_strict)})</span></td>
                          <td className="px-4 py-3 text-right tabular-nums">{fmtPct(prodiList.summary.pct_survival)}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Metadata panel — default OPEN di bawah table */}
          {overview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-sm font-bold text-slate-800">
                  Sumber, Formula & Catatan Tim Wali Data
                </h4>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <Row label="Sumber Data" value={overview.meta.source} />
                <Row label="Formula KTW" value={<code className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">{overview.meta.formula}</code>} />
                <Row label="Masa Normatif" value={`${overview.meta.masa_normatif_tahun} tahun (${overview.meta.jenjang})`} />
                <Row label="Filter Jenis Daftar" value={(overview.meta as unknown as { filter_jns_daftar: string }).filter_jns_daftar} />
                <Row label="Filter Periode Masuk" value={(overview.meta as unknown as { filter_periode_masuk: string }).filter_periode_masuk} />
                {(overview.meta as unknown as { cutoff_note?: string }).cutoff_note && (
                  <Row label="Cutoff" value={(overview.meta as unknown as { cutoff_note: string }).cutoff_note} />
                )}
                <Row label="Catatan Cuti" value={overview.meta.note_cuti} />
                {(overview.meta as unknown as { note_wali_data?: string }).note_wali_data && (
                  <Row label="Catatan Wali Data" value={(overview.meta as unknown as { note_wali_data: string }).note_wali_data} />
                )}
                <Row label="Flag Bawah Standar" value="Prodi dengan KTW < 50% (threshold umum BAN-PT) di-highlight merah di tabel." />
                <Row label="Data per" value={new Date(overview.meta.as_of).toLocaleString("id-ID")} />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

// ====== Sub-components ======

function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color: "slate" | "blue" | "green" | "violet" }) {
  const bg: Record<string, string> = {
    slate: "from-slate-500 to-slate-600",
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    violet: "from-violet-500 to-violet-600",
  };
  const icons: Record<string, React.ReactNode> = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    graduation: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />,
  };
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${bg[color]} p-5 text-white shadow-lg`}
    >
      <div className="absolute -right-3 -top-3 opacity-20">
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <div className="relative">
        <div className="text-[11px] font-semibold uppercase tracking-wide opacity-90">{label}</div>
        <div className="mt-1 text-2xl font-bold md:text-3xl">{value}</div>
        {sub && <div className="mt-1 text-xs opacity-85">{sub}</div>}
      </div>
    </motion.div>
  );
}

function InfoPill({ label, value, tone }: { label: string; value: string; tone: "blue" | "red" | "indigo" | "slate" }) {
  const colorMap: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    red: "border-red-200 bg-red-50 text-red-900",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 ${colorMap[tone]}`}>
      <div className="text-[10px] uppercase tracking-wide font-semibold opacity-80">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}

function SortableTh({
  label,
  sortKey,
  currentKey,
  currentDir,
  onClick,
  align,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onClick: (k: SortKey) => void;
  align: "left" | "right";
}) {
  const isActive = sortKey === currentKey;
  return (
    <th
      onClick={() => onClick(sortKey)}
      className={`cursor-pointer select-none px-4 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-100 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="inline-flex w-3 h-3 items-center justify-center text-[10px]">
          {isActive ? (currentDir === "asc" ? "▲" : "▼") : <span className="text-slate-300">⇅</span>}
        </span>
      </span>
    </th>
  );
}

function PctBadge({ pct, color, count }: { pct: number; color: "blue" | "green" | "violet" | "red" | "amber"; count?: number }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-emerald-100 text-emerald-800",
    violet: "bg-violet-100 text-violet-800",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
  };
  return (
    <span className="inline-flex flex-col items-end">
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorMap[color]}`}>
        {pct.toFixed(2)}%
      </span>
      {count !== undefined && <span className="mt-0.5 text-[10px] text-slate-500">{count.toLocaleString("id-ID")}</span>}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-1.5 sm:grid-cols-[200px_1fr]">
      <dt className="font-semibold text-slate-700">{label}:</dt>
      <dd className="text-slate-600">{value}</dd>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
