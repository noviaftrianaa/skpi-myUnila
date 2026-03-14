"use client";

import React, { useState } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Chip,
    Tabs,
    Tab,
    Card,
    CardBody,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Breadcrumbs,
    BreadcrumbItem
} from "@heroui/react";
import { FiTrendingUp, FiInfo, FiActivity, FiChevronRight, FiArrowLeft, FiBookOpen, FiDownload } from "react-icons/fi";
import { BarChart, LineChart } from "./charts";

// Data structures for Drilldown
export interface DrilldownRow {
    id: string;
    name: string; // e.g., "Fakultas Teknik" or "S1 Teknik Sipil"
    value: number;
    target: number;
    status: string;
    children?: DrilldownRow[]; // For next level (e.g. Fakultas -> Prodi)
}

export interface JenjangDetail {
    jenjang: string;
    lulus_tepat_waktu: number;
    total_aktif: number;
    aee_realisasi: number;
    aee_ideal: number;
    tingkat_pencapaian: number;
}

// IKU 2 specific
export interface StatusBreakdown {
    bekerja: number;
    wiraswasta: number;
    kuliah_lanjut: number;
    belum_bekerja: number;
}

export interface KategoriKerja {
    kat1: number; // <6bln, >1.2xUMP
    kat2: number; // <12bln, >1.2xUMP
    kat3: number; // <12bln, <1.2xUMP
}

// IKU 3 specific
export interface KegiatanBreakdownItem {
    jenis_kegiatan: string;
    jumlah_mahasiswa: number;
}

export interface IKUDetailData {
    id: number;
    code: string;
    title: string;
    definition: string;
    target: number;
    value: number;
    trendData: any[];
    distributionData?: any[]; // Keep for legacy chart if needed
    drilldownData?: DrilldownRow[]; // New Hierarchical Data
    perJenjang?: JenjangDetail[]; // IKU 1 specific: AEE per jenjang
    color: string;
    description?: string;
    // IKU 2 specific
    statusBreakdown?: StatusBreakdown;
    kategoriKerja?: KategoriKerja;
    totalLulusan?: number;
    totalResponden?: number;
    responseRate?: number;
    // IKU 3 specific
    kegiatanBreakdown?: KegiatanBreakdownItem[];
    mbkm?: number;
    prestasiNasional?: number;
    totalAktif?: number;
    totalBerkegiatan?: number;
    // IKU 5 specific
    totalLuaran?: number;
    totalDosen?: number;
    kerjasamaBreakdown?: { name: string; value: number }[];
    // IKU 7 specific
    kegiatanSDG?: number;
    litabmasSDG?: number;
    kerjasamaSDG?: number;
    totalKegiatan?: number;
    totalLitabmas?: number;
    totalKerjasama?: number;
    sdgBreakdown?: { sdg: number; name: string; value: number }[];
    sdgWajib?: number[];
    sdgPilihan?: number[];
    // IKU 9 specific
    pendapatanMahasiswa?: number;
    pendapatanNonMahasiswa?: number;
    totalPendapatan?: number;
    detailLitabmas?: number;
    detailKerjasama?: number;
    detailOperasional?: number;
    revenueBreakdown?: { name: string; value: number }[];
}

// CSV export helpers
function downloadCSV(filename: string, csvContent: string) {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function exportPerJenjang(data: IKUDetailData) {
    if (!data.perJenjang) return;
    const header = 'Jenjang,Lulus Tepat Waktu,Total Mhs Aktif,AEE Realisasi (%),AEE Ideal (%),Tingkat Pencapaian (%)';
    const rows = data.perJenjang.map(j =>
        `${j.jenjang},${j.lulus_tepat_waktu},${j.total_aktif},${j.aee_realisasi},${j.aee_ideal},${j.tingkat_pencapaian}`
    );
    rows.push(`Rata-rata (AEE PT),,,,,"${data.value}"`);
    downloadCSV(`${data.code}_per_jenjang.csv`, [header, ...rows].join('\n'));
}

function exportDrilldownFakultas(data: IKUDetailData) {
    if (!data.drilldownData) return;
    const header = 'Fakultas,AEE PT (%),Target (%),Status';
    const rows = data.drilldownData.map(f =>
        `"${f.name}",${f.value},${f.target},${f.status}`
    );
    downloadCSV(`${data.code}_per_fakultas.csv`, [header, ...rows].join('\n'));
}

function exportDrilldownProdi(data: IKUDetailData) {
    if (!data.drilldownData) return;
    const header = 'Fakultas,Program Studi,AEE PT (%),Target (%),Status';
    const rows: string[] = [];
    data.drilldownData.forEach(f => {
        (f.children || []).forEach(p => {
            rows.push(`"${f.name}","${p.name}",${p.value},${p.target},${p.status}`);
        });
    });
    downloadCSV(`${data.code}_per_prodi.csv`, [header, ...rows].join('\n'));
}

function exportTrend(data: IKUDetailData) {
    if (!data.trendData || data.trendData.length === 0) return;
    const header = 'Tahun,Nilai AEE PT (%)';
    const rows = data.trendData.map((t: any) => `${t.name},${t.value}`);
    downloadCSV(`${data.code}_trend.csv`, [header, ...rows].join('\n'));
}

interface IKUDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IKUDetailData | null;
}

export default function IKUDetailModal({
    isOpen,
    onClose,
    data,
}: IKUDetailModalProps) {
    const [selectedFakultas, setSelectedFakultas] = useState<DrilldownRow | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    if (!data) return null;

    // Helper to handle drilldown click
    const handleFakultasClick = (row: DrilldownRow) => {
        if (row.children && row.children.length > 0) {
            setSelectedFakultas(row);
        }
    };

    const handleBackToFakultas = () => {
        setSelectedFakultas(null);
    };

    const unit = data.code.includes("Rasio") ? "" : data.code.includes("Jumlah") || data.title.includes("Jumlah") ? "" : "%";
    const gap = data.value - data.target;

    // Render content
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            scrollBehavior="inside"
            hideCloseButton={true}
            classNames={{
                backdrop: "bg-gray-900/60 backdrop-blur-md",
                base: "bg-gray-50 dark:bg-gray-900 border-0 sm:border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[100vh] h-[100vh] sm:max-h-[90vh] sm:h-[90vh] m-0 sm:m-auto rounded-none sm:rounded-lg overflow-hidden",
                header: "border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4",
                body: "p-0 bg-gray-50 dark:bg-gray-900 overflow-y-auto custom-scrollbar",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        {/* Top-right buttons: Export + Close */}
                        <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
                            {/* Export Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-500 hover:text-blue-500 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
                                    title="Export Data"
                                >
                                    <FiDownload className="w-5 h-5" />
                                </button>
                                {showExportMenu && (
                                    <>
                                        <div className="fixed inset-0" onClick={() => setShowExportMenu(false)} />
                                        <div className="absolute right-0 top-11 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 min-w-[200px] z-50">
                                            <p className="px-4 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">Export CSV</p>
                                            {data.perJenjang && data.perJenjang.length > 0 && (
                                                <button
                                                    onClick={() => { exportPerJenjang(data); setShowExportMenu(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Per Jenjang (D3, S1, S2, S3)
                                                </button>
                                            )}
                                            {data.drilldownData && data.drilldownData.length > 0 && (
                                                <>
                                                    <button
                                                        onClick={() => { exportDrilldownFakultas(data); setShowExportMenu(false); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        Per Fakultas
                                                    </button>
                                                    <button
                                                        onClick={() => { exportDrilldownProdi(data); setShowExportMenu(false); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        Per Prodi (Detail)
                                                    </button>
                                                </>
                                            )}
                                            {data.trendData && data.trendData.length > 0 && (
                                                <button
                                                    onClick={() => { exportTrend(data); setShowExportMenu(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Trend Historical
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-500 hover:text-red-500 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Modal Header content (Title & Chip) */}
                        <div className="shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-40">
                            <div className="flex items-center gap-3 sm:gap-4 pr-10 sm:pr-12">
                                <div
                                    className="hidden sm:flex p-3 rounded-2xl shadow-sm"
                                    style={{ backgroundColor: `${data.color}15`, color: data.color }}
                                >
                                    <FiActivity className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                            {data.code}
                                        </h3>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            className={data.value >= data.target ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}
                                        >
                                            {data.value >= data.target ? "Tercapai" : "Belum Tercapai"}
                                        </Chip>
                                    </div>
                                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium line-clamp-1">
                                        {data.title}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ModalBody>
                            <div className="max-w-7xl mx-auto w-full p-3 sm:p-4 md:p-8 space-y-4 sm:space-y-6">

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
                                    {/* Left Sidebar: Key Metrics & Info */}
                                    <div className="lg:col-span-4 space-y-6">
                                        {/* Main Score Card */}
                                        <Card className="shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 overflow-visible">
                                            <CardBody className="p-4 sm:p-6">
                                                <h5 className="text-xs sm:text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">Capaian Saat Ini</h5>

                                                <div className="flex items-end gap-3 mb-4 sm:mb-6">
                                                    <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                                        {data.value.toLocaleString('id-ID')}
                                                        <span className="text-xl sm:text-2xl md:text-3xl text-gray-400 ml-1 font-normal">{unit}</span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 mb-4 sm:mb-6">
                                                    <div>
                                                        <span className="block text-xs text-gray-400 font-medium uppercase mb-1">Target 2026</span>
                                                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                            {data.target.toLocaleString('id-ID')}{unit}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="block text-xs text-gray-400 font-medium uppercase mb-1">Gap / Selisih</span>
                                                        <span className={`text-lg font-bold ${gap >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                            {gap > 0 ? "+" : ""}{gap.toLocaleString('id-ID')}{unit}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-medium text-gray-500">
                                                        <span>Progress</span>
                                                        <span>{((data.value / data.target) * 100).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                                            style={{
                                                                width: `${Math.min((data.value / data.target) * 100, 100)}%`,
                                                                backgroundColor: data.color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        {/* Definition Card */}
                                        <Card className="shadow-none bg-blue-50/60 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                            <CardBody className="p-4 sm:p-5">
                                                <div className="flex items-start gap-3">
                                                    <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-2">
                                                            Definisi Operasional
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-blue-800/80 dark:text-blue-200/80 leading-relaxed">
                                                            {data.definition}
                                                        </p>
                                                        {data.description && (
                                                            <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-blue-700/50">
                                                                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                                                    {data.description}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>

                                        {/* Formula Card (IKU 3 only) */}
                                        {data.kegiatanBreakdown && (
                                        <Card className="shadow-none bg-amber-50/60 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                                            <CardBody className="p-4 sm:p-5">
                                                <div className="flex items-start gap-3">
                                                    <FiBookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
                                                            Formula Perhitungan
                                                        </h4>
                                                        <div className="space-y-1.5 text-xs text-amber-800/80 dark:text-amber-200/80 font-mono">
                                                            <p>IKU 3 = (A + B) / Total Mhs Aktif &times; 100%</p>
                                                            <p><span className="font-semibold">A</span> = MBKM (konversi SKS)</p>
                                                            <p><span className="font-semibold">B</span> = Prestasi min. nasional</p>
                                                        </div>
                                                        <div className="mt-2 pt-2 border-t border-amber-200/50 dark:border-amber-700/50 text-xs text-amber-700 dark:text-amber-300">
                                                            <p className="font-medium">Target: 50% | Jenjang: S1, D4, D3, D2, D1</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                        )}

                                        {/* Formula Card (IKU 1 only) */}
                                        {data.perJenjang && data.perJenjang.length > 0 && (
                                        <Card className="shadow-none bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                                            <CardBody className="p-4 sm:p-5">
                                                <div className="flex items-start gap-3">
                                                    <FiBookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-sm">
                                                            Formula Perhitungan
                                                        </h4>
                                                        <div className="space-y-1.5 text-xs text-emerald-800/80 dark:text-emerald-200/80 font-mono">
                                                            <p><span className="font-semibold">1.</span> AEE = (Lulus Tepat Waktu / Mhs Aktif) &times; 100%</p>
                                                            <p><span className="font-semibold">2.</span> Pencapaian = (AEE Realisasi / AEE Ideal) &times; 100%</p>
                                                            <p><span className="font-semibold">3.</span> AEE PT = Rata-rata Pencapaian semua jenjang</p>
                                                        </div>
                                                        <div className="mt-2 pt-2 border-t border-emerald-200/50 dark:border-emerald-700/50 text-xs text-emerald-700 dark:text-emerald-300">
                                                            <p className="font-medium">AEE Ideal: D3=33% | S1=25% | S2=50% | S3=33%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                        )}
                                    </div>

                                    {/* Right Content: Tabs & Drilldown */}
                                    <div className="lg:col-span-8 min-h-[400px] sm:min-h-[500px]">
                                        <Card className="h-full shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                                            <Tabs
                                                aria-label="Analysis Tabs"
                                                color="primary"
                                                variant="underlined"
                                                classNames={{
                                                    base: "w-full border-b border-gray-100 dark:border-gray-700 px-3 sm:px-6",
                                                    cursor: "bg-blue-600 h-[2px]",
                                                    tab: "h-10 sm:h-14 text-xs sm:text-sm font-medium text-gray-500",
                                                    tabContent: "group-data-[selected=true]:text-blue-600 dark:group-data-[selected=true]:text-blue-400 font-semibold",
                                                    panel: "p-0"
                                                }}
                                            >
                                                {/* TAB 1: DRILLDOWN */}
                                                <Tab key="drilldown" title="Breakdown & Drilldown">
                                                    <div className="p-3 sm:p-6">
                                                        {selectedFakultas ? (
                                                            // PRODI VIEW
                                                            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                                                <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                                    <Button
                                                                        isIconOnly variant="light" size="sm" onPress={handleBackToFakultas}
                                                                        className="bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-blue-600"
                                                                    >
                                                                        <FiArrowLeft className="w-4 h-4" />
                                                                    </Button>
                                                                    <Breadcrumbs size="md" separator="/">
                                                                        <BreadcrumbItem onPress={handleBackToFakultas}>Universitas</BreadcrumbItem>
                                                                        <BreadcrumbItem className="font-bold text-blue-600">{selectedFakultas.name}</BreadcrumbItem>
                                                                    </Breadcrumbs>
                                                                </div>

                                                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                                    <Table
                                                                        aria-label="Data Prodi"
                                                                        shadow="none"
                                                                        classNames={{
                                                                            th: "bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider py-4",
                                                                            td: "py-4 border-b border-gray-50 dark:border-gray-800"
                                                                        }}
                                                                    >
                                                                        <TableHeader>
                                                                            <TableColumn>PROGRAM STUDI</TableColumn>
                                                                            <TableColumn>CAPAIAN</TableColumn>
                                                                            <TableColumn>TARGET</TableColumn>
                                                                            <TableColumn>STATUS</TableColumn>
                                                                        </TableHeader>
                                                                        <TableBody items={selectedFakultas.children || []}>
                                                                            {(prodi) => (
                                                                                <TableRow key={prodi.id}>
                                                                                    <TableCell className="font-semibold text-gray-700 dark:text-gray-200">{prodi.name}</TableCell>
                                                                                    <TableCell>
                                                                                        <span className="font-bold text-gray-900 dark:text-white text-base">
                                                                                            {prodi.value.toLocaleString('id-ID')}
                                                                                        </span>
                                                                                    </TableCell>
                                                                                    <TableCell className="text-gray-500">{prodi.target}</TableCell>
                                                                                    <TableCell>
                                                                                        <Chip
                                                                                            size="sm"
                                                                                            variant="flat"
                                                                                            className={prodi.value >= prodi.target ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}
                                                                                            startContent={<span className={`w-1.5 h-1.5 rounded-full mr-1 ${prodi.value >= prodi.target ? "bg-green-500" : "bg-red-500"}`}></span>}
                                                                                        >
                                                                                            {prodi.status}
                                                                                        </Chip>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            // FAKULTAS VIEW
                                                            <div className="animate-in fade-in slide-in-from-left-4 duration-300 space-y-8">
                                                                {/* Chart Section */}
                                                                <div>
                                                                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                                        <h4 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                                            <FiTrendingUp className="text-blue-500" />
                                                                            Grafik Perbandingan Fakultas
                                                                        </h4>
                                                                    </div>
                                                                    <div className="p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                                                        <BarChart
                                                                            data={data.drilldownData || []}
                                                                            height={280}
                                                                            colors={[data.color]}
                                                                            horizontal={false}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Table Section */}
                                                                <div>
                                                                    <h4 className="text-base font-bold text-gray-800 dark:text-white mb-4">Detail Data Fakultas</h4>
                                                                    <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                                        <Table
                                                                            aria-label="Data Fakultas"
                                                                            selectionMode="single"
                                                                            color="primary"
                                                                            shadow="none"
                                                                            onRowAction={(key) => {
                                                                                const row = data.drilldownData?.find(d => d.id === key);
                                                                                if (row) handleFakultasClick(row);
                                                                            }}
                                                                            classNames={{
                                                                                wrapper: "p-0",
                                                                                th: "bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider py-4 pl-6",
                                                                                td: "py-4 pl-6 border-b border-gray-50 dark:border-gray-800 group-data-[first=true]:first:before:rounded-none",
                                                                                row: "cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                                                                            }}
                                                                        >
                                                                            <TableHeader>
                                                                                <TableColumn>UNIT / FAKULTAS</TableColumn>
                                                                                <TableColumn>CAPAIAN</TableColumn>
                                                                                <TableColumn>PERSENTASE</TableColumn>
                                                                                <TableColumn align="center">DETAIL</TableColumn>
                                                                            </TableHeader>
                                                                            <TableBody items={data.drilldownData || []}>
                                                                                {(fak) => (
                                                                                    <TableRow key={fak.id}>
                                                                                        <TableCell>
                                                                                            <span className="font-semibold text-gray-700 dark:text-gray-200">{fak.name}</span>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <div className="flex flex-col">
                                                                                                <span className={`font-bold ${fak.value >= fak.target ? "text-green-600" : "text-gray-900"}`}>
                                                                                                    {fak.value.toLocaleString('id-ID')}
                                                                                                </span>
                                                                                                <span className="text-[10px] text-gray-400">Target: {fak.target}</span>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <div className="flex items-center gap-3 w-full max-w-[140px]">
                                                                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                                                    <div
                                                                                                        className="h-full rounded-full"
                                                                                                        style={{ width: `${Math.min((fak.value / fak.target) * 100, 100)}%`, backgroundColor: data.color }}
                                                                                                    />
                                                                                                </div>
                                                                                                <span className="text-xs font-medium text-gray-500">
                                                                                                    {((fak.value / fak.target) * 100).toFixed(1)}%
                                                                                                </span>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Button size="sm" variant="light" isIconOnly className="text-gray-400 group-hover:text-blue-500">
                                                                                                <FiChevronRight />
                                                                                            </Button>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </Tab>

                                                {/* TAB 2: PER JENJANG (IKU 1 only) */}
                                                {data.perJenjang && data.perJenjang.length > 0 && (
                                                <Tab key="jenjang" title="Rincian per Jenjang">
                                                    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FiBookOpen className="text-blue-500" />
                                                            <h4 className="text-base font-bold text-gray-800 dark:text-white">
                                                                Breakdown AEE per Jenjang Pendidikan
                                                            </h4>
                                                        </div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
                                                            Rumus: Tingkat Pencapaian = (AEE Realisasi / AEE Ideal) &times; 100%
                                                        </p>

                                                        {/* Jenjang Cards */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                            {data.perJenjang.map((j) => {
                                                                const pct = j.aee_ideal > 0 ? (j.aee_realisasi / j.aee_ideal) * 100 : 0;
                                                                const achieved = pct >= 100;
                                                                return (
                                                                    <Card key={j.jenjang} className="shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                                                                        <CardBody className="p-4 sm:p-5">
                                                                            <div className="flex items-center justify-between mb-3">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: data.color }}>
                                                                                        {j.jenjang}
                                                                                    </span>
                                                                                    <Chip
                                                                                        size="sm"
                                                                                        variant="flat"
                                                                                        className={achieved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}
                                                                                    >
                                                                                        {j.tingkat_pencapaian.toFixed(1)}%
                                                                                    </Chip>
                                                                                </div>
                                                                            </div>

                                                                            {/* AEE Values */}
                                                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                                                                    <span className="block text-[10px] text-gray-400 uppercase font-medium mb-1">AEE Realisasi</span>
                                                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{j.aee_realisasi.toFixed(2)}%</span>
                                                                                </div>
                                                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                                                                                    <span className="block text-[10px] text-gray-400 uppercase font-medium mb-1">AEE Ideal</span>
                                                                                    <span className="text-lg font-bold text-gray-900 dark:text-white">{j.aee_ideal.toFixed(0)}%</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Numerator / Denominator */}
                                                                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-3">
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-[10px] text-gray-400 uppercase font-medium">Lulus Tepat Waktu</span>
                                                                                    <span className="font-bold text-base">{j.lulus_tepat_waktu.toLocaleString('id-ID')}</span>
                                                                                </div>
                                                                                <span className="text-gray-300 text-lg">/</span>
                                                                                <div className="flex flex-col text-right">
                                                                                    <span className="text-[10px] text-gray-400 uppercase font-medium">Total Mhs Aktif</span>
                                                                                    <span className="font-bold text-base">{j.total_aktif.toLocaleString('id-ID')}</span>
                                                                                </div>
                                                                            </div>

                                                                            {/* Progress bar */}
                                                                            <div className="space-y-1">
                                                                                <div className="flex justify-between text-[10px] font-medium text-gray-400">
                                                                                    <span>Tingkat Pencapaian</span>
                                                                                    <span>{j.tingkat_pencapaian.toFixed(1)}%</span>
                                                                                </div>
                                                                                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                                    <div
                                                                                        className="h-full rounded-full transition-all duration-700"
                                                                                        style={{
                                                                                            width: `${Math.min(j.tingkat_pencapaian, 100)}%`,
                                                                                            backgroundColor: achieved ? '#10b981' : data.color
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </CardBody>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Summary Table */}
                                                        <div className="mt-2">
                                                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Ringkasan Perhitungan AEE PT</h4>
                                                            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <Table
                                                                    aria-label="Ringkasan AEE per Jenjang"
                                                                    shadow="none"
                                                                    classNames={{
                                                                        th: "bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider py-3",
                                                                        td: "py-3 border-b border-gray-50 dark:border-gray-800 text-sm"
                                                                    }}
                                                                >
                                                                    <TableHeader>
                                                                        <TableColumn>JENJANG</TableColumn>
                                                                        <TableColumn align="end">LULUS TW</TableColumn>
                                                                        <TableColumn align="end">MHS AKTIF</TableColumn>
                                                                        <TableColumn align="end">AEE REAL</TableColumn>
                                                                        <TableColumn align="end">AEE IDEAL</TableColumn>
                                                                        <TableColumn align="end">PENCAPAIAN</TableColumn>
                                                                    </TableHeader>
                                                                    <TableBody
                                                                        items={[
                                                                            ...(data.perJenjang || []).map((j) => ({ ...j, _key: j.jenjang })),
                                                                            { _key: 'avg', jenjang: 'Rata-rata (AEE PT)', lulus_tepat_waktu: -1, total_aktif: -1, aee_realisasi: -1, aee_ideal: -1, tingkat_pencapaian: data.value }
                                                                        ]}
                                                                    >
                                                                        {(item) => (
                                                                            <TableRow key={item._key}>
                                                                                <TableCell className={item._key === 'avg' ? "font-bold text-gray-900 dark:text-white" : "font-semibold"}>
                                                                                    {item.jenjang}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    {item._key === 'avg' ? '-' : item.lulus_tepat_waktu.toLocaleString('id-ID')}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    {item._key === 'avg' ? '-' : item.total_aktif.toLocaleString('id-ID')}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    {item._key === 'avg' ? '-' : `${item.aee_realisasi.toFixed(2)}%`}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    {item._key === 'avg' ? '-' : `${item.aee_ideal.toFixed(0)}%`}
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    <span className={item._key === 'avg'
                                                                                        ? "font-extrabold text-base"
                                                                                        : `font-bold ${item.tingkat_pencapaian >= 100 ? 'text-green-600' : 'text-amber-600'}`
                                                                                    } style={item._key === 'avg' ? { color: data.color } : undefined}>
                                                                                        {item.tingkat_pencapaian.toFixed(2)}%
                                                                                    </span>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: STATUS LULUSAN (IKU 2 only) */}
                                                {data.statusBreakdown && (
                                                <Tab key="status" title="Rincian Status">
                                                    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FiActivity className="text-blue-500" />
                                                            <h4 className="text-base font-bold text-gray-800 dark:text-white">
                                                                Breakdown Status Lulusan
                                                            </h4>
                                                        </div>

                                                        {/* Response Rate Banner */}
                                                        {data.responseRate !== undefined && (
                                                        <div className="bg-blue-50/60 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                            <div>
                                                                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Response Rate Tracer Study</span>
                                                                <p className="text-xs text-blue-600/70 dark:text-blue-300/70 mt-0.5">
                                                                    {data.totalResponden?.toLocaleString('id-ID')} responden dari {data.totalLulusan?.toLocaleString('id-ID')} total lulusan
                                                                </p>
                                                            </div>
                                                            <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.responseRate.toFixed(1)}%</span>
                                                        </div>
                                                        )}

                                                        {/* Status Cards */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {[
                                                                { label: 'Bekerja', value: data.statusBreakdown.bekerja, color: '#10b981', icon: '💼' },
                                                                { label: 'Wiraswasta', value: data.statusBreakdown.wiraswasta, color: '#f59e0b', icon: '🏢' },
                                                                { label: 'Kuliah Lanjut', value: data.statusBreakdown.kuliah_lanjut, color: '#3b82f6', icon: '🎓' },
                                                                { label: 'Belum Bekerja', value: data.statusBreakdown.belum_bekerja, color: '#ef4444', icon: '⏳' },
                                                            ].map((item) => {
                                                                const total = data.statusBreakdown!.bekerja + data.statusBreakdown!.wiraswasta + data.statusBreakdown!.kuliah_lanjut + data.statusBreakdown!.belum_bekerja;
                                                                const pct = total > 0 ? (item.value / total * 100) : 0;
                                                                return (
                                                                    <Card key={item.label} className="shadow-sm border border-gray-100 dark:border-gray-700">
                                                                        <CardBody className="p-3 sm:p-4 text-center">
                                                                            <span className="text-2xl mb-1 block">{item.icon}</span>
                                                                            <span className="text-xl sm:text-2xl font-bold block" style={{ color: item.color }}>
                                                                                {item.value.toLocaleString('id-ID')}
                                                                            </span>
                                                                            <span className="text-[10px] text-gray-400 uppercase font-medium block mt-1">{item.label}</span>
                                                                            <span className="text-xs text-gray-500 block">{pct.toFixed(1)}%</span>
                                                                        </CardBody>
                                                                    </Card>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Kategori Pekerjaan */}
                                                        {data.kategoriKerja && (
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Kategori Pekerjaan (Detail Bobot)</h4>
                                                            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <Table
                                                                    aria-label="Kategori Pekerjaan"
                                                                    shadow="none"
                                                                    classNames={{
                                                                        th: "bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider py-3",
                                                                        td: "py-3 border-b border-gray-50 dark:border-gray-800 text-sm"
                                                                    }}
                                                                >
                                                                    <TableHeader>
                                                                        <TableColumn>KATEGORI</TableColumn>
                                                                        <TableColumn>KONDISI</TableColumn>
                                                                        <TableColumn align="center">BOBOT</TableColumn>
                                                                        <TableColumn align="end">JUMLAH</TableColumn>
                                                                    </TableHeader>
                                                                    <TableBody items={[
                                                                        { _key: 'k1', label: 'Kategori 1', kondisi: 'Masa tunggu < 6 bln, Gaji > 1.2× UMP', bobot: '10', value: data.kategoriKerja.kat1 },
                                                                        { _key: 'k2', label: 'Kategori 2', kondisi: 'Masa tunggu < 12 bln, Gaji > 1.2× UMP', bobot: '6', value: data.kategoriKerja.kat2 },
                                                                        { _key: 'k3', label: 'Kategori 3', kondisi: 'Masa tunggu < 12 bln, Gaji ≤ 1.2× UMP', bobot: '4', value: data.kategoriKerja.kat3 },
                                                                    ]}>
                                                                        {(item) => (
                                                                            <TableRow key={item._key}>
                                                                                <TableCell className="font-semibold">{item.label}</TableCell>
                                                                                <TableCell className="text-gray-500 text-xs">{item.kondisi}</TableCell>
                                                                                <TableCell className="text-center">
                                                                                    <Chip size="sm" variant="flat" className="bg-blue-50 text-blue-700">{item.bobot}</Chip>
                                                                                </TableCell>
                                                                                <TableCell className="text-right font-bold">{item.value.toLocaleString('id-ID')}</TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                        )}

                                                        {/* Summary */}
                                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Lulusan Produktif (A+B+C)</span>
                                                                <p className="text-xs text-gray-400 mt-0.5">Bekerja + Wiraswasta + Kuliah Lanjut</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-2xl font-bold" style={{ color: data.color }}>
                                                                    {(data.statusBreakdown.bekerja + data.statusBreakdown.wiraswasta + data.statusBreakdown.kuliah_lanjut).toLocaleString('id-ID')}
                                                                </span>
                                                                <span className="text-sm text-gray-400 ml-1">/ {data.totalLulusan?.toLocaleString('id-ID')}</span>
                                                                <span className="block text-lg font-bold" style={{ color: data.color }}>{data.value}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: TREND */}
                                                <Tab key="trend" title="Trend Historical">
                                                    <div className="p-3 sm:p-6 md:p-8">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-8 gap-2">
                                                            <div>
                                                                <h4 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Trend Performa (5 Tahun)</h4>
                                                                <p className="text-gray-500 text-sm mt-1">Analisis kenaikan/penurunan capaian IKU dari tahun ke tahun</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></span> Capaian
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
                                                            <LineChart
                                                                data={data.trendData}
                                                                height={400}
                                                                color={data.color}
                                                                showArea={true}
                                                                smooth={true}
                                                            />
                                                        </div>
                                                    </div>
                                                </Tab>

                                                {/* TAB: FORMULA (IKU 1 only) */}
                                                {data.perJenjang && data.perJenjang.length > 0 && (
                                                <Tab key="formula" title="Formula">
                                                    <div className="p-3 sm:p-6 md:p-8 space-y-6">
                                                        <div className="flex items-center gap-2">
                                                            <FiBookOpen className="text-emerald-500 w-5 h-5" />
                                                            <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                                                                Formula Perhitungan AEE
                                                            </h4>
                                                        </div>

                                                        {/* Step 1 */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">AEE per Jenjang</h5>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 font-mono text-sm sm:text-base text-center text-gray-700 dark:text-gray-200">
                                                                AEE = (Jumlah Lulus Tepat Waktu / Total Mhs Aktif) &times; 100%
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-2">
                                                                <p><strong>Total Mhs Aktif:</strong> Mahasiswa berstatus aktif pada semester yang dipilih.</p>
                                                                <div>
                                                                    <strong>Lulus Tepat Waktu:</strong> Mahasiswa yang memenuhi <em>seluruh</em> syarat berikut:
                                                                    <ol className="list-decimal list-inside mt-1 ml-2 space-y-0.5">
                                                                        <li>Status keluar = <strong>Lulus</strong></li>
                                                                        <li>Tanggal masuk dan tanggal lulus tercatat</li>
                                                                        <li>Nomor seri ijazah sudah terbit</li>
                                                                        <li>Lulus pada <strong>tahun</strong> yang sesuai filter semester</li>
                                                                        <li>Masa studi &le; masa studi standar jenjang (D3: 3 thn, S1: 4 thn, S2: 2 thn, S3: 3 thn)</li>
                                                                    </ol>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Step 2 */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">2</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Tingkat Pencapaian per Jenjang</h5>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 font-mono text-sm sm:text-base text-center text-gray-700 dark:text-gray-200">
                                                                Tingkat Pencapaian = (AEE Realisasi / AEE Ideal) &times; 100%
                                                            </div>
                                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                                                {[
                                                                    { jenjang: 'D3', ideal: '33%', masa: '3 tahun' },
                                                                    { jenjang: 'S1', ideal: '25%', masa: '4 tahun' },
                                                                    { jenjang: 'S2', ideal: '50%', masa: '2 tahun' },
                                                                    { jenjang: 'S3', ideal: '33%', masa: '3 tahun' },
                                                                ].map((item) => (
                                                                    <div key={item.jenjang} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                                                        <span className="block text-xs text-gray-400 uppercase font-medium">{item.jenjang}</span>
                                                                        <span className="block text-lg font-bold text-gray-900 dark:text-white">{item.ideal}</span>
                                                                        <span className="block text-[10px] text-gray-400">Masa Studi: {item.masa}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Step 3 */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">AEE Perguruan Tinggi (Agregat)</h5>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 font-mono text-sm sm:text-base text-center text-gray-700 dark:text-gray-200">
                                                                AEE PT = &Sigma;(Tingkat Pencapaian<sub>i</sub>) / n
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Rata-rata dari seluruh Tingkat Pencapaian jenjang yang memiliki mahasiswa aktif.
                                                                Jenjang tanpa mahasiswa aktif tidak dihitung.
                                                            </p>
                                                        </div>

                                                        {/* Ketentuan */}
                                                        <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4 sm:p-6 space-y-2">
                                                            <h5 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                                                <FiInfo className="w-4 h-4" />
                                                                Ketentuan
                                                            </h5>
                                                            <ul className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
                                                                <li>Lulusan valid: status keluar = Lulus, memiliki No. Ijazah, tanggal masuk, dan tanggal keluar tercatat</li>
                                                                <li>Tepat waktu: masa studi &le; masa studi standar jenjang (D3: 3 thn, S1: 4 thn, S2: 2 thn, S3: 3 thn)</li>
                                                                <li>Masa studi dihitung dari tanggal masuk sampai tanggal lulus dalam satuan hari / 365.25</li>
                                                                <li>Tidak termasuk: mahasiswa pindah, DO, cuti melebihi ketentuan</li>
                                                                <li>Indikator ini merupakan indikator <strong>wajib</strong> bagi semua perguruan tinggi</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: RINCIAN KEGIATAN (IKU 3 only) */}
                                                {data.kegiatanBreakdown && (
                                                <Tab key="kegiatan" title="Rincian Kegiatan">
                                                    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FiActivity className="text-amber-500" />
                                                            <h4 className="text-base font-bold text-gray-800 dark:text-white">
                                                                Breakdown Kegiatan & Prestasi
                                                            </h4>
                                                        </div>

                                                        {/* Summary Cards */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            {[
                                                                { label: 'MBKM (Konversi SKS)', value: data.mbkm ?? 0, color: '#f59e0b', desc: 'Mahasiswa dengan kegiatan MBKM' },
                                                                { label: 'Prestasi Nasional+', value: data.prestasiNasional ?? 0, color: '#8b5cf6', desc: 'Prestasi min. tingkat nasional' },
                                                                { label: 'Total Berkegiatan', value: data.totalBerkegiatan ?? 0, color: data.color, desc: 'Unik (tanpa double-count)' },
                                                            ].map((item) => (
                                                                <Card key={item.label} className="shadow-sm border border-gray-100 dark:border-gray-700">
                                                                    <CardBody className="p-3 sm:p-4 text-center">
                                                                        <span className="text-2xl sm:text-3xl font-bold block" style={{ color: item.color }}>
                                                                            {item.value.toLocaleString('id-ID')}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400 uppercase font-medium block mt-1">{item.label}</span>
                                                                        <span className="text-xs text-gray-500 block">{item.desc}</span>
                                                                    </CardBody>
                                                                </Card>
                                                            ))}
                                                        </div>

                                                        {/* Breakdown per Jenis Kegiatan MBKM */}
                                                        {data.kegiatanBreakdown.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Detail per Jenis Kegiatan MBKM</h4>
                                                            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <Table
                                                                    aria-label="Breakdown Kegiatan MBKM"
                                                                    shadow="none"
                                                                    classNames={{
                                                                        th: "bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider py-3",
                                                                        td: "py-3 border-b border-gray-50 dark:border-gray-800 text-sm"
                                                                    }}
                                                                >
                                                                    <TableHeader>
                                                                        <TableColumn>JENIS KEGIATAN</TableColumn>
                                                                        <TableColumn align="end">JUMLAH MAHASISWA</TableColumn>
                                                                        <TableColumn align="end">PROPORSI</TableColumn>
                                                                    </TableHeader>
                                                                    <TableBody items={data.kegiatanBreakdown.map((k, i) => ({ ...k, _key: `k-${i}` }))}>
                                                                        {(item) => {
                                                                            const totalMbkm = data.mbkm ?? 1;
                                                                            const pct = totalMbkm > 0 ? (item.jumlah_mahasiswa / totalMbkm * 100) : 0;
                                                                            return (
                                                                                <TableRow key={item._key}>
                                                                                    <TableCell className="font-semibold">{item.jenis_kegiatan}</TableCell>
                                                                                    <TableCell className="text-right font-bold">{item.jumlah_mahasiswa.toLocaleString('id-ID')}</TableCell>
                                                                                    <TableCell className="text-right">
                                                                                        <div className="flex items-center justify-end gap-2">
                                                                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                                                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: data.color }} />
                                                                                            </div>
                                                                                            <span className="text-xs text-gray-500">{pct.toFixed(1)}%</span>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        }}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                        )}

                                                        {/* Summary */}
                                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Mahasiswa Berkegiatan (A + B)</span>
                                                                <p className="text-xs text-gray-400 mt-0.5">MBKM + Prestasi Nasional (tanpa double-count)</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-2xl font-bold" style={{ color: data.color }}>
                                                                    {(data.totalBerkegiatan ?? 0).toLocaleString('id-ID')}
                                                                </span>
                                                                <span className="text-sm text-gray-400 ml-1">/ {(data.totalAktif ?? 0).toLocaleString('id-ID')}</span>
                                                                <span className="block text-lg font-bold" style={{ color: data.color }}>{data.value}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: FORMULA (IKU 3 only) */}
                                                {data.kegiatanBreakdown && (
                                                <Tab key="formula3" title="Formula">
                                                    <div className="p-3 sm:p-6 md:p-8 space-y-6">
                                                        <div className="flex items-center gap-2">
                                                            <FiBookOpen className="text-amber-500 w-5 h-5" />
                                                            <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                                                                Formula Perhitungan IKU 3
                                                            </h4>
                                                        </div>

                                                        {/* Formula Utama */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Formula Utama</h5>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 font-mono text-sm sm:text-base text-center text-gray-700 dark:text-gray-200">
                                                                IKU 3 = (A + B) / Total Mahasiswa Aktif &times; 100
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                                                {[
                                                                    { label: 'A', desc: 'Mahasiswa dengan pengalaman & pengakuan SKS dari kegiatan di luar kampus (MBKM)', color: '#f59e0b' },
                                                                    { label: 'B', desc: 'Mahasiswa yang meraih prestasi minimal tingkat nasional', color: '#8b5cf6' },
                                                                ].map((item) => (
                                                                    <div key={item.label} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 flex items-start gap-2">
                                                                        <span className="px-2 py-0.5 rounded text-xs font-bold text-white shrink-0" style={{ backgroundColor: item.color }}>{item.label}</span>
                                                                        <span className="text-xs text-gray-600 dark:text-gray-300">{item.desc}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                <strong>Jenjang yang dihitung:</strong> S1, D4, D3, D2, D1. Denominator = total mahasiswa aktif pada semester tersebut.
                                                                Mahasiswa yang masuk A dan B sekaligus hanya dihitung sekali (UNION).
                                                            </p>
                                                        </div>

                                                        {/* Kriteria MBKM */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Kriteria Kegiatan MBKM (A)</h5>
                                                            </div>
                                                            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                                            <th className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase">Kegiatan</th>
                                                                            <th className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase">Standar Kegiatan</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-gray-600 dark:text-gray-300">
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Magang/Praktek Kerja</td>
                                                                            <td className="px-3 py-2 text-xs">Perusahaan swasta, nirlaba, organisasi multilateral, lembaga pemerintah, BUMN/BUMD</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Pertukaran Pelajar</td>
                                                                            <td className="px-3 py-2 text-xs">PT luar/dalam negeri berdasarkan perjanjian kerjasama (ekuivalensi transfer SKS)</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Penelitian/Riset</td>
                                                                            <td className="px-3 py-2 text-xs">Riset akademik di bawah pengawasan dosen/peneliti, di PT sendiri atau lembaga lain</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Program Mhs Berdampak</td>
                                                                            <td className="px-3 py-2 text-xs">Pengabdian masyarakat, tim lomba internasional, capstone design project</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                Mahasiswa harus memiliki <strong>konversi SKS</strong> yang tercatat di sistem MBKM. Pertukaran pelajar menggunakan ekuivalensi transfer.
                                                            </p>
                                                        </div>

                                                        {/* Kriteria Prestasi */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">3</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Kriteria Prestasi (B)</h5>
                                                            </div>
                                                            <ul className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                                <li>Minimal tingkat <strong>nasional</strong> (id_tkt_prestasi = 5) atau <strong>internasional</strong> (id_tkt_prestasi = 6)</li>
                                                                <li>Dibuktikan dengan sertifikat penghargaan yang divalidasi</li>
                                                                <li>Kompetisi atau lomba minimal tingkat provinsi, nasional, dan internasional</li>
                                                                <li>Mahasiswa harus berstatus aktif pada semester yang dipilih</li>
                                                            </ul>
                                                        </div>

                                                        {/* Ketentuan */}
                                                        <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4 sm:p-6 space-y-2">
                                                            <h5 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                                                <FiInfo className="w-4 h-4" />
                                                                Ketentuan
                                                            </h5>
                                                            <ul className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
                                                                <li>Hanya menghitung mahasiswa aktif jenjang <strong>S1, D4, D3, D2, D1</strong></li>
                                                                <li>Data kegiatan bersumber dari modul <strong>MBKM</strong> terintegrasi PDUT</li>
                                                                <li>Konversi SKS harus tercatat di sistem (<code className="text-xs bg-amber-100/50 dark:bg-amber-800/30 px-1 rounded">konversi_akt_mhs</code> atau <code className="text-xs bg-amber-100/50 dark:bg-amber-800/30 px-1 rounded">ekuiv_transfer</code>)</li>
                                                                <li>Mahasiswa yang masuk kategori A dan B dihitung sekali saja (UNION)</li>
                                                                <li>Indikator ini merupakan indikator <strong>wajib</strong> bagi semua perguruan tinggi</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: RINCIAN KERJASAMA (IKU 5 only) */}
                                                {data.kerjasamaBreakdown && (
                                                <Tab key="kerjasama" title="Rincian Kerjasama">
                                                    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FiActivity className="text-pink-500" />
                                                            <h4 className="text-base font-bold text-gray-800 dark:text-white">
                                                                Breakdown Luaran Kerjasama
                                                            </h4>
                                                        </div>

                                                        {/* Summary Cards */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                            {[
                                                                { label: 'Total Luaran', value: data.totalLuaran ?? 0, color: data.color, desc: 'Kerjasama dengan luaran tercatat' },
                                                                { label: 'Total Dosen', value: data.totalDosen ?? 0, color: '#3b82f6', desc: 'Dosen aktif PT' },
                                                                { label: 'Rasio (%)', value: data.value, color: '#10b981', desc: '(Luaran / Dosen) × 100', isPercent: true },
                                                            ].map((item) => (
                                                                <Card key={item.label} className="shadow-sm border border-gray-100 dark:border-gray-700">
                                                                    <CardBody className="p-3 sm:p-4 text-center">
                                                                        <span className="text-2xl sm:text-3xl font-bold block" style={{ color: item.color }}>
                                                                            {'isPercent' in item && item.isPercent ? `${item.value}%` : item.value.toLocaleString('id-ID')}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400 uppercase font-medium block mt-1">{item.label}</span>
                                                                        <span className="text-xs text-gray-500 block">{item.desc}</span>
                                                                    </CardBody>
                                                                </Card>
                                                            ))}
                                                        </div>

                                                        {/* Breakdown per Aktivitas Kerjasama */}
                                                        {data.kerjasamaBreakdown.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Detail per Bentuk Kegiatan Kerjasama</h4>
                                                            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <Table
                                                                    aria-label="Breakdown Kerjasama"
                                                                    shadow="none"
                                                                    classNames={{
                                                                        th: "bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider py-3",
                                                                        td: "py-3 border-b border-gray-50 dark:border-gray-800 text-sm"
                                                                    }}
                                                                >
                                                                    <TableHeader>
                                                                        <TableColumn>BENTUK KEGIATAN</TableColumn>
                                                                        <TableColumn align="end">JUMLAH LUARAN</TableColumn>
                                                                        <TableColumn align="end">PROPORSI</TableColumn>
                                                                    </TableHeader>
                                                                    <TableBody items={data.kerjasamaBreakdown.map((k, i) => ({ ...k, _key: `ks-${i}` }))}>
                                                                        {(item) => {
                                                                            const totalLuaran = data.totalLuaran ?? 1;
                                                                            const pct = totalLuaran > 0 ? (item.value / totalLuaran * 100) : 0;
                                                                            return (
                                                                                <TableRow key={item._key}>
                                                                                    <TableCell className="font-semibold">{item.name}</TableCell>
                                                                                    <TableCell className="text-right font-bold">{item.value.toLocaleString('id-ID')}</TableCell>
                                                                                    <TableCell className="text-right">
                                                                                        <div className="flex items-center justify-end gap-2">
                                                                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                                                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: data.color }} />
                                                                                            </div>
                                                                                            <span className="text-xs text-gray-500">{pct.toFixed(1)}%</span>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        }}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                        )}

                                                        {/* Summary */}
                                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Rasio Luaran / Dosen</span>
                                                                <p className="text-xs text-gray-400 mt-0.5">Jumlah luaran kerjasama dibanding total dosen aktif</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-2xl font-bold" style={{ color: data.color }}>
                                                                    {(data.totalLuaran ?? 0).toLocaleString('id-ID')}
                                                                </span>
                                                                <span className="text-sm text-gray-400 ml-1">/ {(data.totalDosen ?? 0).toLocaleString('id-ID')}</span>
                                                                <span className="block text-lg font-bold" style={{ color: data.color }}>{data.value}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: FORMULA (IKU 5 only) */}
                                                {data.kerjasamaBreakdown && (
                                                <Tab key="formula5" title="Formula">
                                                    <div className="p-3 sm:p-6 md:p-8 space-y-6">
                                                        <div className="flex items-center gap-2">
                                                            <FiBookOpen className="text-pink-500 w-5 h-5" />
                                                            <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                                                                Formula Perhitungan IKU 5
                                                            </h4>
                                                        </div>

                                                        {/* Formula Utama */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xs font-bold">1</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Formula Utama</h5>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 font-mono text-sm sm:text-base text-center text-gray-700 dark:text-gray-200">
                                                                IKU 5 = (Jumlah Luaran Kerjasama / Total Dosen PT) &times; 100
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-2">
                                                                <p><strong>Pembilang:</strong> Jumlah kerjasama prodi (sms_kerjasama) yang memiliki luaran tercatat — produk barang, produk jasa, atau prestasi/penghargaan.</p>
                                                                <p><strong>Penyebut:</strong> Total dosen aktif PT (id_jns_sdm = 12, belum keluar).</p>
                                                            </div>
                                                        </div>

                                                        {/* Kriteria Luaran */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xs font-bold">2</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Kriteria Luaran</h5>
                                                            </div>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Kerjasama dianggap memiliki <strong>luaran</strong> jika salah satu kolom berikut terisi:
                                                            </p>
                                                            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                                            <th className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase">Kolom</th>
                                                                            <th className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase">Keterangan</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-gray-600 dark:text-gray-300">
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium font-mono text-xs">hsl_prod_brg</td>
                                                                            <td className="px-3 py-2 text-xs">Hasil produk barang</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium font-mono text-xs">hsl_prod_jasa</td>
                                                                            <td className="px-3 py-2 text-xs">Hasil produk jasa</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium font-mono text-xs">prestasi_penghargaan</td>
                                                                            <td className="px-3 py-2 text-xs">Prestasi / penghargaan</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        {/* Kategori Resmi IKU 5 */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">3</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Kategori Luaran (Panduan Resmi)</h5>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                                                {[
                                                                    { label: '5a', title: 'Karya Tulis Ilmiah', desc: 'Studi kasus hasil kolaborasi PT dengan mitra', color: '#3b82f6' },
                                                                    { label: '5b', title: 'Karya Terapan', desc: 'Produk/invensi hasil kolaborasi PT dengan mitra', color: '#10b981' },
                                                                    { label: '5c', title: 'Karya Seni', desc: 'Karya visual/audio/pertunjukan hasil kolaborasi', color: '#f59e0b' },
                                                                ].map((item) => (
                                                                    <div key={item.label} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                                                        <span className="px-2 py-0.5 rounded text-xs font-bold text-white inline-block mb-1" style={{ backgroundColor: item.color }}>{item.label}</span>
                                                                        <span className="block text-sm font-bold text-gray-900 dark:text-white">{item.title}</span>
                                                                        <span className="block text-[10px] text-gray-400 mt-1">{item.desc}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-lg p-3 text-xs text-amber-800/80 dark:text-amber-200/80">
                                                                <strong>Catatan:</strong> Tabel <code className="text-xs bg-amber-100/50 dark:bg-amber-800/30 px-1 rounded">sms_kerjasama</code> tidak memiliki mapping langsung ke 3 kategori di atas.
                                                                Perhitungan saat ini menghitung semua kerjasama yang memiliki luaran tercatat tanpa klasifikasi kategori.
                                                            </div>
                                                        </div>

                                                        {/* Filter MoU */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-600 dark:text-pink-400 flex items-center justify-center text-xs font-bold">4</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Filter Periode</h5>
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Kerjasama difilter berdasarkan <strong>MoU yang overlap</strong> dengan tahun yang dipilih.
                                                                MoU dianggap aktif jika periode berlaku (tgl_mulai s.d. tgl_selesai) memiliki irisan dengan tahun filter.
                                                            </p>
                                                        </div>

                                                        {/* Ketentuan */}
                                                        <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4 sm:p-6 space-y-2">
                                                            <h5 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                                                <FiInfo className="w-4 h-4" />
                                                                Ketentuan
                                                            </h5>
                                                            <ul className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
                                                                <li>Luaran dihitung dari <code className="text-xs bg-amber-100/50 dark:bg-amber-800/30 px-1 rounded">kerjasama.sms_kerjasama</code> yang memiliki output di kolom hsl_prod_brg, hsl_prod_jasa, atau prestasi_penghargaan</li>
                                                                <li>Hanya kerjasama dengan prodi aktif (<code className="text-xs bg-amber-100/50 dark:bg-amber-800/30 px-1 rounded">stat_prodi = &apos;A&apos;</code>) yang dihitung</li>
                                                                <li>Dosen dihitung dari SDM aktif dengan jenis SDM = Dosen dan belum keluar</li>
                                                                <li>MoU harus aktif (overlap) pada tahun yang dipilih</li>
                                                                <li>Indikator ini merupakan indikator <strong>wajib</strong> bagi semua perguruan tinggi</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: RINCIAN SDGs (IKU 7 only) */}
                                                {data.sdgBreakdown && (
                                                <Tab key="sdg" title="Rincian SDGs">
                                                    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FiActivity className="text-orange-500" />
                                                            <h4 className="text-base font-bold text-gray-800 dark:text-white">
                                                                Breakdown Kegiatan per SDG
                                                            </h4>
                                                        </div>

                                                        {/* Summary Cards */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                            {[
                                                                { label: 'Litabmas SDG', value: data.litabmasSDG ?? 0, color: '#f97316', desc: 'Penelitian & PkM match keyword' },
                                                                { label: 'Kerjasama (SDG 17)', value: data.kerjasamaSDG ?? 0, color: '#3b82f6', desc: 'Semua kerjasama aktif' },
                                                                { label: 'Total Kegiatan SDG', value: data.kegiatanSDG ?? 0, color: '#10b981', desc: 'Litabmas SDG + Kerjasama' },
                                                                { label: 'Total Tri Dharma', value: data.totalKegiatan ?? 0, color: '#6b7280', desc: 'Semua kegiatan' },
                                                            ].map((item) => (
                                                                <Card key={item.label} className="shadow-sm border border-gray-100 dark:border-gray-700">
                                                                    <CardBody className="p-3 text-center">
                                                                        <span className="text-xl sm:text-2xl font-bold block" style={{ color: item.color }}>
                                                                            {item.value.toLocaleString('id-ID')}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400 uppercase font-medium block mt-1">{item.label}</span>
                                                                        <span className="text-[10px] text-gray-500 block">{item.desc}</span>
                                                                    </CardBody>
                                                                </Card>
                                                            ))}
                                                        </div>

                                                        {/* SDG Breakdown Table */}
                                                        {data.sdgBreakdown.length > 0 && (
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">
                                                                Kontribusi per SDG Target
                                                                {data.sdgWajib && <span className="text-xs font-normal text-gray-400 ml-2">(Wajib: SDG {data.sdgWajib.join(', ')})</span>}
                                                            </h4>
                                                            <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <Table
                                                                    aria-label="Breakdown SDG"
                                                                    shadow="none"
                                                                    classNames={{
                                                                        th: "bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider py-3",
                                                                        td: "py-3 border-b border-gray-50 dark:border-gray-800 text-sm"
                                                                    }}
                                                                >
                                                                    <TableHeader>
                                                                        <TableColumn>SDG</TableColumn>
                                                                        <TableColumn align="end">JUMLAH KEGIATAN</TableColumn>
                                                                        <TableColumn align="end">PROPORSI</TableColumn>
                                                                    </TableHeader>
                                                                    <TableBody items={data.sdgBreakdown.map((s, i) => ({ ...s, _key: `sdg-${i}` }))}>
                                                                        {(item) => {
                                                                            const total = data.kegiatanSDG ?? 1;
                                                                            const pct = total > 0 ? (item.value / total * 100) : 0;
                                                                            const isWajib = data.sdgWajib?.includes(item.sdg);
                                                                            return (
                                                                                <TableRow key={item._key}>
                                                                                    <TableCell>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <span className="font-semibold">{item.name}</span>
                                                                                            {isWajib && <Chip size="sm" variant="flat" color="warning" className="text-[10px] h-4">Wajib</Chip>}
                                                                                        </div>
                                                                                    </TableCell>
                                                                                    <TableCell className="text-right font-bold">{item.value.toLocaleString('id-ID')}</TableCell>
                                                                                    <TableCell className="text-right">
                                                                                        <div className="flex items-center justify-end gap-2">
                                                                                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                                                <div className="h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: data.color }} />
                                                                                            </div>
                                                                                            <span className="text-xs text-gray-500">{pct.toFixed(1)}%</span>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            );
                                                                        }}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                        )}

                                                        {/* Summary */}
                                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Kegiatan Berkontribusi SDG / Total Tri Dharma</span>
                                                                <p className="text-xs text-gray-400 mt-0.5">Litabmas (keyword match) + Kerjasama (SDG 17)</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-2xl font-bold" style={{ color: data.color }}>
                                                                    {(data.kegiatanSDG ?? 0).toLocaleString('id-ID')}
                                                                </span>
                                                                <span className="text-sm text-gray-400 ml-1">/ {(data.totalKegiatan ?? 0).toLocaleString('id-ID')}</span>
                                                                <span className="block text-lg font-bold" style={{ color: data.color }}>{data.value}%</span>
                                                            </div>
                                                        </div>

                                                        {/* Note tentang pendekatan proxy */}
                                                        <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4 space-y-2">
                                                            <h5 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                                                <FiInfo className="w-4 h-4" />
                                                                Catatan Metodologi
                                                            </h5>
                                                            <ul className="text-xs text-amber-800/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
                                                                <li>Data SDG dihitung menggunakan <strong>keyword matching</strong> pada judul penelitian dan pengabdian (pendekatan proxy)</li>
                                                                <li>Semua kerjasama aktif otomatis dihitung sebagai kontribusi <strong>SDG 17 (Kemitraan)</strong></li>
                                                                <li>Akurasi dapat ditingkatkan jika tersedia tagging SDG langsung di sistem</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: FORMULA (IKU 7 only) */}
                                                {data.sdgBreakdown && (
                                                <Tab key="formula7" title="Formula">
                                                    <div className="p-3 sm:p-6 md:p-8 space-y-6">
                                                        <div className="flex items-center gap-2">
                                                            <FiBookOpen className="text-orange-500 w-5 h-5" />
                                                            <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                                                                Formula Perhitungan IKU 7
                                                            </h4>
                                                        </div>

                                                        {/* Formula Utama */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">1</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Formula Utama</h5>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 font-mono text-sm sm:text-base text-center text-gray-700 dark:text-gray-200">
                                                                IKU 7 = (Kegiatan berkontribusi SDG / Total Kegiatan Tri Dharma) &times; 100
                                                            </div>
                                                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 space-y-2">
                                                                <p><strong>Pembilang:</strong> Litabmas yang judulnya match keyword SDG target + semua kerjasama (SDG 17).</p>
                                                                <p><strong>Penyebut:</strong> Total litabmas (penelitian + pengabdian) + total kerjasama pada tahun filter.</p>
                                                            </div>
                                                        </div>

                                                        {/* SDG Target */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">2</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">SDG Target</h5>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                                                {[
                                                                    { sdg: 1, label: 'SDG 1', title: 'Tanpa Kemiskinan', color: '#e5243b', wajib: true },
                                                                    { sdg: 4, label: 'SDG 4', title: 'Pendidikan Berkualitas', color: '#c5192d', wajib: true },
                                                                    { sdg: 17, label: 'SDG 17', title: 'Kemitraan', color: '#19486a', wajib: true },
                                                                ].map((item) => (
                                                                    <div key={item.sdg} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                                                        <span className="px-2 py-0.5 rounded text-xs font-bold text-white inline-block mb-1" style={{ backgroundColor: item.color }}>{item.label}</span>
                                                                        <span className="block text-sm font-bold text-gray-900 dark:text-white">{item.title}</span>
                                                                        <span className="block text-[10px] text-gray-400 mt-1">Wajib</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                + 2 SDGs pilihan sesuai keunggulan PT (ditetapkan di Renstra).
                                                                {(!data.sdgPilihan || data.sdgPilihan.length === 0) && <span className="text-amber-500 ml-1">Belum ditetapkan.</span>}
                                                            </p>
                                                        </div>

                                                        {/* Pendekatan Proxy */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">3</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Pendekatan Keyword Matching (Proxy)</h5>
                                                            </div>
                                                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                Karena database belum memiliki tagging SDG eksplisit, digunakan <strong>keyword matching</strong> pada judul kegiatan litabmas.
                                                                Setiap SDG memiliki daftar keyword yang didefinisikan di config server.
                                                            </p>
                                                            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                                            <th className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase">Komponen</th>
                                                                            <th className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase">Metode Identifikasi SDG</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-gray-600 dark:text-gray-300">
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Penelitian (L)</td>
                                                                            <td className="px-3 py-2 text-xs">Keyword matching pada judul_litabmas</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Pengabdian/PkM (M)</td>
                                                                            <td className="px-3 py-2 text-xs">Keyword matching pada judul_litabmas</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Kerjasama</td>
                                                                            <td className="px-3 py-2 text-xs">Otomatis SDG 17 (Kemitraan) — semua kerjasama aktif</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        {/* Ketentuan */}
                                                        <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4 sm:p-6 space-y-2">
                                                            <h5 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                                                <FiInfo className="w-4 h-4" />
                                                                Ketentuan
                                                            </h5>
                                                            <ul className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
                                                                <li><strong>Wajib:</strong> SDG 1 (Tanpa Kemiskinan), SDG 4 (Pendidikan Berkualitas), SDG 17 (Kemitraan)</li>
                                                                <li><strong>Pilihan:</strong> 2 SDG lain sesuai keunggulan PT, ditetapkan di Renstra</li>
                                                                <li>Ruang lingkup: Pendidikan, Penelitian, PkM, Kerjasama, Inisiatif Institusional</li>
                                                                <li>Satu kegiatan bisa berkontribusi ke lebih dari satu SDG</li>
                                                                <li>Data menggunakan pendekatan proxy (keyword matching) — akurasi terbatas</li>
                                                                <li>Indikator ini merupakan indikator <strong>wajib</strong> bagi semua perguruan tinggi</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: RINCIAN PENDAPATAN (IKU 9 only) */}
                                                {data.pendapatanMahasiswa !== undefined && (
                                                <Tab key="pendapatan" title="Rincian Pendapatan">
                                                    <div className="p-3 sm:p-6 md:p-8 space-y-6">
                                                        <div className="flex items-center gap-2">
                                                            <FiActivity className="text-indigo-500 w-5 h-5" />
                                                            <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                                                                Rincian Pendapatan PT
                                                            </h4>
                                                        </div>

                                                        {/* Summary Cards */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                                            <Card className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                                                <CardBody className="p-4 text-center">
                                                                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Pendapatan Mahasiswa (UKT)</p>
                                                                    <p className="text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-200">
                                                                        Rp {(data.pendapatanMahasiswa ?? 0).toLocaleString('id-ID')}
                                                                    </p>
                                                                </CardBody>
                                                            </Card>
                                                            <Card className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                                                                <CardBody className="p-4 text-center">
                                                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1">Pendapatan Non-Mahasiswa</p>
                                                                    <p className="text-lg sm:text-xl font-bold text-indigo-800 dark:text-indigo-200">
                                                                        Rp {(data.pendapatanNonMahasiswa ?? 0).toLocaleString('id-ID')}
                                                                    </p>
                                                                </CardBody>
                                                            </Card>
                                                            <Card className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                                                                <CardBody className="p-4 text-center">
                                                                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Pendapatan</p>
                                                                    <p className="text-lg sm:text-xl font-bold text-green-800 dark:text-green-200">
                                                                        Rp {(data.totalPendapatan ?? 0).toLocaleString('id-ID')}
                                                                    </p>
                                                                </CardBody>
                                                            </Card>
                                                        </div>

                                                        {/* Breakdown Table */}
                                                        {data.revenueBreakdown && data.revenueBreakdown.length > 0 && (
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                                            <Table aria-label="Breakdown Pendapatan" removeWrapper>
                                                                <TableHeader>
                                                                    <TableColumn>Sumber Pendapatan</TableColumn>
                                                                    <TableColumn className="text-right">Jumlah (Rp)</TableColumn>
                                                                    <TableColumn className="text-right">Proporsi</TableColumn>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {data.revenueBreakdown.map((item, idx) => {
                                                                        const total = data.totalPendapatan ?? 1;
                                                                        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0';
                                                                        return (
                                                                            <TableRow key={idx}>
                                                                                <TableCell>
                                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    <span className="text-sm text-gray-700 dark:text-gray-200">{item.value.toLocaleString('id-ID')}</span>
                                                                                </TableCell>
                                                                                <TableCell className="text-right">
                                                                                    <Chip size="sm" variant="flat" color={item.name.includes('Mahasiswa') ? 'primary' : 'secondary'}>
                                                                                        {pct}%
                                                                                    </Chip>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        );
                                                                    })}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                        )}

                                                        {/* Detail Non-Mahasiswa */}
                                                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 sm:p-6 space-y-3">
                                                            <h5 className="font-bold text-sm text-gray-700 dark:text-gray-200">Detail Pendapatan Non-Mahasiswa</h5>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Dana Riset (Litabmas)</p>
                                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
                                                                        Rp {(data.detailLitabmas ?? 0).toLocaleString('id-ID')}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Kerjasama</p>
                                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
                                                                        Rp {(data.detailKerjasama ?? 0).toLocaleString('id-ID')}
                                                                    </p>
                                                                </div>
                                                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Operasional (Pemasukan)</p>
                                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">
                                                                        Rp {(data.detailOperasional ?? 0).toLocaleString('id-ID')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Rasio Summary */}
                                                        <div className="bg-indigo-50/60 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-4 sm:p-6">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-indigo-700 dark:text-indigo-300">Rasio Non-Mahasiswa / Total</span>
                                                                <span className="text-xl font-bold text-indigo-700 dark:text-indigo-200">{data.value}%</span>
                                                            </div>
                                                            <div className="mt-2 w-full bg-indigo-200 dark:bg-indigo-800 rounded-full h-2.5">
                                                                <div
                                                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                                                                    style={{ width: `${Math.min(data.value, 100)}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex justify-between mt-1">
                                                                <span className="text-xs text-indigo-500">0%</span>
                                                                <span className="text-xs text-indigo-500">Target: {data.target}%</span>
                                                                <span className="text-xs text-indigo-500">100%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: FORMULA (IKU 9 only) */}
                                                {data.pendapatanMahasiswa !== undefined && (
                                                <Tab key="formula9" title="Formula">
                                                    <div className="p-3 sm:p-6 md:p-8 space-y-6">
                                                        <div className="flex items-center gap-2">
                                                            <FiBookOpen className="text-indigo-500 w-5 h-5" />
                                                            <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                                                                Formula Perhitungan IKU 9
                                                            </h4>
                                                        </div>

                                                        {/* Formula Utama */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">1</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Formula Utama</h5>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 font-mono text-sm sm:text-base text-center text-gray-700 dark:text-gray-200">
                                                                IKU 9 = (Pendapatan Non Mahasiswa / Total Pendapatan PT) &times; 100
                                                            </div>
                                                        </div>

                                                        {/* Sumber Data */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">2</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Sumber Data</h5>
                                                            </div>
                                                            <Table aria-label="Sumber Data IKU 9" removeWrapper>
                                                                <TableHeader>
                                                                    <TableColumn>Komponen</TableColumn>
                                                                    <TableColumn>Sumber Data</TableColumn>
                                                                    <TableColumn>Keterangan</TableColumn>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    <TableRow>
                                                                        <TableCell><span className="font-medium text-sm">Pendapatan Mahasiswa (A)</span></TableCell>
                                                                        <TableCell><span className="text-sm text-gray-600 dark:text-gray-300">keuangan.spp_mhs</span></TableCell>
                                                                        <TableCell><span className="text-sm text-gray-500 dark:text-gray-400">SUM(nominal) — UKT/SPP</span></TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell><span className="font-medium text-sm">Dana Riset (B1)</span></TableCell>
                                                                        <TableCell><span className="text-sm text-gray-600 dark:text-gray-300">pdrd.litabmas</span></TableCell>
                                                                        <TableCell><span className="text-sm text-gray-500 dark:text-gray-400">dana_dikti + dana_pt + dana_institusi_lain</span></TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell><span className="font-medium text-sm">Kerjasama (B2)</span></TableCell>
                                                                        <TableCell><span className="text-sm text-gray-600 dark:text-gray-300">kerjasama.sms_kerjasama</span></TableCell>
                                                                        <TableCell><span className="text-sm text-gray-500 dark:text-gray-400">SUM(besaran_kerjasama) — MoU overlap tahun</span></TableCell>
                                                                    </TableRow>
                                                                    <TableRow>
                                                                        <TableCell><span className="font-medium text-sm">Operasional (B3)</span></TableCell>
                                                                        <TableCell><span className="text-sm text-gray-600 dark:text-gray-300">keuangan.biaya_operasional</span></TableCell>
                                                                        <TableCell><span className="text-sm text-gray-500 dark:text-gray-400">SUM(total_biaya) WHERE pemasukan — bisa kosong</span></TableCell>
                                                                    </TableRow>
                                                                </TableBody>
                                                            </Table>
                                                        </div>

                                                        {/* Penjelasan Proxy */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">3</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Pendekatan Proxy</h5>
                                                            </div>
                                                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                                                <p>Karena tidak tersedia tabel &quot;total pendapatan PT&quot; yang komprehensif, data digabungkan dari 3 sumber yang tersedia di database.</p>
                                                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 font-mono text-xs">
                                                                    <p>Non-Mahasiswa (B) = B1 + B2 + B3</p>
                                                                    <p>Total Pendapatan = A + B</p>
                                                                    <p>IKU 9 = (B / (A + B)) &times; 100</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Ketentuan */}
                                                        <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4 sm:p-6 space-y-2">
                                                            <h5 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                                                <FiInfo className="w-4 h-4" />
                                                                Ketentuan
                                                            </h5>
                                                            <ul className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
                                                                <li><strong>Termasuk:</strong> Dana riset/hibah, kontrak riset industri, royalti paten, komersialisasi inovasi, jasa konsultasi, sertifikasi, pengelolaan aset</li>
                                                                <li><strong>Tidak termasuk:</strong> SPP/UKT, subsidi pemerintah (block grant), sumbangan/filantropi di luar laporan keuangan</li>
                                                                <li>Data biaya_operasional (pemasukan) mungkin kosong — jika kosong hanya menggunakan litabmas + kerjasama</li>
                                                                <li>besaran_kerjasama yang NULL atau 0 tidak dihitung</li>
                                                                <li>Filter tahun kerjasama menggunakan overlap MoU (tgl_mulai &le; akhir tahun AND tgl_selesai &ge; awal tahun)</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}

                                                {/* TAB: FORMULA (IKU 2 only) */}
                                                {data.statusBreakdown && (
                                                <Tab key="formula2" title="Formula">
                                                    <div className="p-3 sm:p-6 md:p-8 space-y-6">
                                                        <div className="flex items-center gap-2">
                                                            <FiBookOpen className="text-blue-500 w-5 h-5" />
                                                            <h4 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                                                                Formula Perhitungan IKU 2
                                                            </h4>
                                                        </div>

                                                        {/* Formula Utama */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Formula Utama</h5>
                                                            </div>
                                                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 sm:p-4 font-mono text-sm sm:text-base text-center text-gray-700 dark:text-gray-200">
                                                                IKU 2 = (A + B + C) / Total Lulusan &times; 100
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                                                {[
                                                                    { label: 'A', desc: 'Lulusan yang mendapat pekerjaan', color: '#10b981' },
                                                                    { label: 'B', desc: 'Lulusan yang melanjutkan studi', color: '#3b82f6' },
                                                                    { label: 'C', desc: 'Lulusan yang berwirausaha', color: '#f59e0b' },
                                                                ].map((item) => (
                                                                    <div key={item.label} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 flex items-start gap-2">
                                                                        <span className="px-2 py-0.5 rounded text-xs font-bold text-white shrink-0" style={{ backgroundColor: item.color }}>{item.label}</span>
                                                                        <span className="text-xs text-gray-600 dark:text-gray-300">{item.desc}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-gray-500">
                                                                <strong>Jenjang yang dihitung:</strong> S1, D3, dan D4 saja. Denominator = total lulusan S1 &amp; diploma pada tahun tersebut.
                                                            </p>
                                                        </div>

                                                        {/* Kriteria Pekerjaan */}
                                                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">2</span>
                                                                <h5 className="font-bold text-sm sm:text-base text-gray-800 dark:text-white">Kriteria Pekerjaan (A)</h5>
                                                            </div>
                                                            <div className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-x-auto">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                                                                            <th className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase">Kategori</th>
                                                                            <th className="text-left px-3 py-2 text-xs font-bold text-gray-400 uppercase">Kondisi</th>
                                                                            <th className="text-center px-3 py-2 text-xs font-bold text-gray-400 uppercase">Bobot</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="text-gray-600 dark:text-gray-300">
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Kategori 1</td>
                                                                            <td className="px-3 py-2 text-xs">Masa tunggu &lt; 6 bulan DAN gaji &gt; 1.2&times; UMP</td>
                                                                            <td className="px-3 py-2 text-center font-bold text-emerald-600">10</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Kategori 2</td>
                                                                            <td className="px-3 py-2 text-xs">Masa tunggu &lt; 12 bulan DAN gaji &gt; 1.2&times; UMP</td>
                                                                            <td className="px-3 py-2 text-center font-bold text-blue-600">6</td>
                                                                        </tr>
                                                                        <tr className="border-t border-gray-50 dark:border-gray-800">
                                                                            <td className="px-3 py-2 font-medium">Kategori 3</td>
                                                                            <td className="px-3 py-2 text-xs">Masa tunggu &lt; 12 bulan DAN gaji &le; 1.2&times; UMP</td>
                                                                            <td className="px-3 py-2 text-center font-bold text-amber-600">4</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>

                                                        {/* Kriteria Studi Lanjut & Kewirausahaan */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
                                                                    <h5 className="font-bold text-sm text-gray-800 dark:text-white">Studi Lanjut (B)</h5>
                                                                </div>
                                                                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                                    <li>Mendapat surat penerimaan ke jenjang lebih tinggi</li>
                                                                    <li>Dalam waktu &lt; 12 bulan setelah lulus</li>
                                                                    <li>S2/S2 Terapan, S3/S3 Terapan</li>
                                                                    <li>Dalam atau luar negeri</li>
                                                                </ul>
                                                            </div>
                                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs font-bold">4</span>
                                                                    <h5 className="font-bold text-sm text-gray-800 dark:text-white">Kewirausahaan (C)</h5>
                                                                </div>
                                                                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1 list-disc list-inside">
                                                                    <li>Mulai bekerja &lt; 6 bulan setelah lulus</li>
                                                                    <li>Penghasilan &gt; 1.2&times; UMP</li>
                                                                    <li>Pendiri/Co-founder (Bobot 0.75)</li>
                                                                    <li>Freelancer (Bobot 0.25)</li>
                                                                </ul>
                                                            </div>
                                                        </div>

                                                        {/* UMP Info & Ketentuan */}
                                                        <div className="bg-amber-50/60 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 p-4 sm:p-6 space-y-2">
                                                            <h5 className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                                                                <FiInfo className="w-4 h-4" />
                                                                Ketentuan
                                                            </h5>
                                                            <ul className="text-xs sm:text-sm text-amber-800/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
                                                                <li><strong>UMP:</strong> Diambil dinamis dari tabel <code className="text-xs bg-amber-100/50 dark:bg-amber-800/30 px-1 rounded">umr_wilayah</code> berdasarkan provinsi tempat bekerja &amp; tahun lulus. Threshold = 1.2&times; UMP</li>
                                                                <li>Data bersumber dari <strong>tracer study</strong> 1 tahun setelah kelulusan</li>
                                                                <li>Minimal &ge;50% responden lulusan mengisi tracer study</li>
                                                                <li>Hanya menghitung lulusan jenjang <strong>S1, D3, dan D4</strong></li>
                                                                <li>Indikator ini merupakan indikator <strong>wajib</strong> bagi semua perguruan tinggi</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Tab>
                                                )}
                                            </Tabs>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
