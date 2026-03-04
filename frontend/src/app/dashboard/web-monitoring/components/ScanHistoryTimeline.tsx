
"use client";

import { Card, CardBody, CardHeader, Divider, Chip } from "@heroui/react";
import { FiClock, FiCheckCircle, FiAlertTriangle, FiSearch, FiXCircle } from "react-icons/fi";
import { useEffect, useState } from "react";
import { crawlerService, CrawlJob } from "@/lib/services/webmon/crawlerService";

const jobTypeLabel: Record<string, string> = {
    full: "Full Crawl",
    incremental: "Incremental",
    single: "Single Site",
};

function jobToScanResult(job: CrawlJob): "clean" | "warning" | "threat" | "error" {
    if (job.status === "done")    return "clean";
    if (job.status === "failed")  return "error";
    if (job.status === "running") return "warning";
    return "warning"; // queued
}

function jobDuration(job: CrawlJob): string {
    if (!job.started_at || !job.finished_at) return "-";
    const ms = new Date(job.finished_at).getTime() - new Date(job.started_at).getTime();
    return ms < 60000 ? `${(ms / 1000).toFixed(1)}s` : `${(ms / 60000).toFixed(1)}m`;
}

const resultConfig = {
    clean: {
        color: "success" as const,
        icon: <FiCheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />,
        label: "Bersih",
        line: "border-green-300 dark:border-green-700",
    },
    warning: {
        color: "warning" as const,
        icon: <FiAlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />,
        label: "Peringatan",
        line: "border-yellow-300 dark:border-yellow-700",
    },
    threat: {
        color: "danger" as const,
        icon: <FiAlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />,
        label: "Ancaman",
        line: "border-red-300 dark:border-red-700",
    },
    error: {
        color: "default" as const,
        icon: <FiXCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />,
        label: "Error",
        line: "border-gray-300 dark:border-gray-700",
    },
};

export default function ScanHistoryTimeline() {
    const [jobs, setJobs] = useState<CrawlJob[]>([]);

    useEffect(() => {
        crawlerService.listJobs({ limit: 8 })
            .then((res) => setJobs(res.items || []))
            .catch(() => {});
    }, []);

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 transition-shadow duration-300 h-full">
            <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                            Riwayat Scan
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-500">
                            Timeline pemindaian otomatis terbaru
                        </p>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-3 sm:p-4 max-h-[360px] sm:max-h-[420px] lg:max-h-[520px] overflow-y-auto">
                {jobs.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">Belum ada riwayat scan.</div>
                ) : (
                    <div className="relative">
                        <div className="absolute left-[15px] sm:left-[17px] top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-0">
                            {jobs.map((job) => {
                                const result = jobToScanResult(job);
                                const config = resultConfig[result];
                                return (
                                    <div key={job.id} className="relative flex gap-2 sm:gap-3 pb-4 sm:pb-5 last:pb-0 group">
                                        <div className="relative z-10 flex-shrink-0">
                                            <div className={`w-[30px] h-[30px] sm:w-[36px] sm:h-[36px] rounded-full flex items-center justify-center bg-white dark:bg-gray-800 border-2 ${config.line} shadow-sm group-hover:scale-110 transition-transform`}>
                                                {config.icon}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-colors">
                                            <div className="flex items-start sm:items-center justify-between gap-1 flex-col sm:flex-row">
                                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                    <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white">
                                                        {jobTypeLabel[job.job_type] ?? job.job_type}
                                                    </span>
                                                    <Chip size="sm" variant="flat" color={config.color} className="text-[10px]">
                                                        {config.label}
                                                    </Chip>
                                                </div>
                                                <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-[10px] text-gray-500">
                                                    <FiClock className="w-3 h-3 flex-shrink-0" />
                                                    <span className="whitespace-nowrap">
                                                        {job.started_at ? new Date(job.started_at).toLocaleString("id-ID") : "Menunggu"}
                                                    </span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="hidden sm:inline">{jobDuration(job)}</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                {job.error_msg || job.notes || `Job ${job.job_type} oleh ${job.triggered_by}`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
