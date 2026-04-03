
"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";
import { FiShield, FiAlertOctagon, FiDownload } from "react-icons/fi";
import {
    OverviewStatCards,
    MonitoringCharts,
    RecentThreatsTable,
    TrendChart,
    TopUnitsChart,
    ResponseTimeChart,
    AlertFeed,
    SiteRegistryTable,
    ScanHistoryTimeline,
} from "./components";
import { Card, CardBody, CardHeader, Divider, Button } from "@heroui/react";

export default function WebMonitoringPage() {
    useRequireAuth();
    return (
        <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
                        <FiShield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-blue-600" />
                        Web Monitoring & Early Warning
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Pantauan keamanan website unit kerja dari konten ilegal (Judi Online)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" color="primary" variant="flat" startContent={<FiDownload className="w-4 h-4" />}>
                        Export
                    </Button>
                    <Button size="sm" color="danger" variant="flat" startContent={<FiAlertOctagon className="w-4 h-4" />}>
                        Lapor Insiden
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <OverviewStatCards />

            {/* Early Warning + Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1">
                    <AlertFeed />
                </div>
                <div className="lg:col-span-2">
                    <TrendChart />
                </div>
            </div>

            {/* Response + TopUnits  */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1">
                    <ResponseTimeChart />
                </div>
                <div className="lg:col-span-2">
                    <TopUnitsChart />
                </div>
            </div>

            {/* Charts Section */}
            <MonitoringCharts />

            {/* Scan History + Threats Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-1">
                    <ScanHistoryTimeline />
                </div>
                <div className="lg:col-span-2">
                    <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300">
                        <CardHeader className="flex justify-between items-center px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                                    Temuan Ancaman Terbaru
                                </h2>
                                <p className="text-[10px] sm:text-xs text-gray-500">
                                    Daftar konten yang terindikasi melanggar kebijakan
                                </p>
                            </div>
                            <Button size="sm" variant="light" color="primary" className="text-[10px] sm:text-xs">
                                Lihat Semua
                            </Button>
                        </CardHeader>
                        <Divider />
                        <CardBody className="p-0">
                            <RecentThreatsTable />
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* Site Registry */}
            <div>
                <div className="mb-3 sm:mb-4">
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        Inventaris Situs Universitas
                    </h2>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                        Kelola dan pantau kesehatan seluruh website unit kerja
                    </p>
                </div>
                <SiteRegistryTable />
            </div>
        </div>
    );
}
