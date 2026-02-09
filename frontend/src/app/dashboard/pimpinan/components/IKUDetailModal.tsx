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
import { FiTrendingUp, FiInfo, FiActivity, FiChevronRight, FiArrowLeft } from "react-icons/fi";
import { BarChart, LineChart } from "./charts";

// Data structures for Drilldown
export interface DrilldownRow {
    id: string;
    name: string; // e.g., "Fakultas Teknik" or "S1 Teknik Sipil"
    value: number;
    target: number;
    status: "Tercapai" | "Belum Tercapai";
    children?: DrilldownRow[]; // For next level (e.g. Fakultas -> Prodi)
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
    color: string;
    description?: string;
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
                base: "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[90vh] h-[90vh] overflow-hidden",
                header: "border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-4",
                body: "p-0 bg-gray-50 dark:bg-gray-900 overflow-y-auto custom-scrollbar",
            }}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        {/* Custom Close Button */}
                        <div className="absolute top-4 right-4 z-50">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-white/90 dark:bg-gray-800/90 text-gray-500 hover:text-red-500 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:scale-105"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Modal Header content (Title & Chip) */}
                        <div className="shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-40">
                            <div className="flex items-center gap-4 pr-12">
                                <div
                                    className="p-3 rounded-2xl shadow-sm"
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
                            <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                                    {/* Left Sidebar: Key Metrics & Info */}
                                    <div className="lg:col-span-4 space-y-6">
                                        {/* Main Score Card */}
                                        <Card className="shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 overflow-visible">
                                            <CardBody className="p-6">
                                                <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Capaian Saat Ini</h5>

                                                <div className="flex items-end gap-3 mb-6">
                                                    <span className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                                        {data.value.toLocaleString('id-ID')}
                                                        <span className="text-2xl md:text-3xl text-gray-400 ml-1 font-normal">{unit}</span>
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 mb-6">
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
                                            <CardBody className="p-5">
                                                <div className="flex items-start gap-3">
                                                    <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <h4 className="font-semibold text-blue-900 dark:text-blue-200 text-sm mb-2">
                                                            Definisi Operasional
                                                        </h4>
                                                        <p className="text-sm text-blue-800/80 dark:text-blue-200/80 leading-relaxed">
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
                                    </div>

                                    {/* Right Content: Tabs & Drilldown */}
                                    <div className="lg:col-span-8 min-h-[500px]">
                                        <Card className="h-full shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                                            <Tabs
                                                aria-label="Analysis Tabs"
                                                color="primary"
                                                variant="underlined"
                                                classNames={{
                                                    base: "w-full border-b border-gray-100 dark:border-gray-700 px-6",
                                                    cursor: "bg-blue-600 h-[2px]",
                                                    tab: "h-14 text-sm font-medium text-gray-500",
                                                    tabContent: "group-data-[selected=true]:text-blue-600 dark:group-data-[selected=true]:text-blue-400 font-semibold",
                                                    panel: "p-0"
                                                }}
                                            >
                                                {/* TAB 1: DRILLDOWN */}
                                                <Tab key="drilldown" title="Breakdown & Drilldown">
                                                    <div className="p-6">
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

                                                {/* TAB 2: TREND */}
                                                <Tab key="trend" title="Trend Historical">
                                                    <div className="p-6 md:p-8">
                                                        <div className="flex items-center justify-between mb-8">
                                                            <div>
                                                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">Trend Performa (3 Tahun)</h4>
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
