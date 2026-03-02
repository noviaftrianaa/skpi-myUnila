"use client";

import React from "react";
import { Card, CardHeader, CardBody, Divider, Chip, Spinner } from "@heroui/react";
import { FiClock, FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle } from "react-icons/fi";
import { CrawlJob } from "@/lib/services/webmon/crawlerService";

interface CrawlSessionListProps {
    data: CrawlJob[];
    isLoading?: boolean;
}

const jobTypeLabel: Record<string, string> = {
    full: "Full Crawl",
    incremental: "Incremental",
    single: "Single Site",
};

const statusIcon = (status: string) => {
    switch (status) {
        case "done":    return <FiCheckCircle className="text-green-500 w-5 h-5" />;
        case "running": return <FiLoader className="text-blue-500 w-5 h-5 animate-spin" />;
        case "failed":  return <FiXCircle className="text-red-500 w-5 h-5" />;
        default:        return <FiAlertCircle className="text-gray-400 w-5 h-5" />;
    }
};

const statusColor = (status: string): "success" | "primary" | "danger" | "default" => {
    switch (status) {
        case "done":    return "success";
        case "running": return "primary";
        case "failed":  return "danger";
        default:        return "default";
    }
};

export default function CrawlSessionList({ data, isLoading }: CrawlSessionListProps) {
    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full">
            <CardHeader className="flex justify-between items-center px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold">Riwayat Pemindaian</h3>
            </CardHeader>
            <Divider className="hidden" />
            <CardBody className="p-0">
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Spinner label="Memuat riwayat..." />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                        Belum ada riwayat pemindaian.
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.map((job) => (
                            <div key={job.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl">
                                        {statusIcon(job.status)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {jobTypeLabel[job.job_type] ?? job.job_type}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                            <FiClock className="w-3 h-3" />
                                            {job.started_at
                                                ? new Date(job.started_at).toLocaleString("id-ID")
                                                : "Belum dimulai"}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Chip size="sm" variant="flat" color={statusColor(job.status)}>
                                        {job.status}
                                    </Chip>
                                    {job.triggered_by && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            oleh {job.triggered_by}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
