
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, Chip, Spinner, Progress, Tooltip } from "@heroui/react";
import {
    FiClock, FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle,
    FiFileText, FiAlertTriangle, FiGlobe, FiChevronRight,
} from "react-icons/fi";
import { crawlerService, CrawlJob, CrawlSession } from "@/lib/services/webmon/crawlerService";

interface CrawlSessionListProps {
    selectedJob: CrawlJob | null;
    jobs: CrawlJob[];
    onSelectJob: (job: CrawlJob) => void;
}

const statusIcon = (status: string) => {
    switch (status) {
        case "done":    return <FiCheckCircle className="text-green-500 w-4 h-4" />;
        case "running": return <FiLoader className="text-blue-500 w-4 h-4 animate-spin" />;
        case "failed":  return <FiXCircle className="text-red-500 w-4 h-4" />;
        default:        return <FiAlertCircle className="text-gray-400 w-4 h-4" />;
    }
};

const statusColor = (status: string): "success" | "primary" | "danger" | "default" | "warning" => {
    switch (status) {
        case "done":    return "success";
        case "running": return "primary";
        case "failed":  return "danger";
        case "queued":  return "warning";
        default:        return "default";
    }
};

function SessionDetail({ session }: { session: CrawlSession }) {
    return (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <FiGlobe className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[180px]">
                        {session.site_id?.slice(0, 8)}...
                    </span>
                </div>
                <Chip size="sm" variant="flat" color={statusColor(session.status)} className="text-[10px]">
                    {session.status}
                </Chip>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <FiFileText className="w-3 h-3 text-blue-400" />
                    <span>{session.total_pages} halaman</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <FiAlertTriangle className="w-3 h-3 text-orange-400" />
                    <span>{session.threat_count} ancaman</span>
                </div>
            </div>
            {session.total_pages > 0 && session.threat_count > 0 && (
                <div className="mt-2">
                    <Progress
                        size="sm"
                        value={(session.threat_count / session.total_pages) * 100}
                        color={session.threat_count > 5 ? "danger" : "warning"}
                        className="max-w-full"
                        aria-label="Threat ratio"
                    />
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {((session.threat_count / session.total_pages) * 100).toFixed(1)}% terancam
                    </span>
                </div>
            )}
            {session.started_at && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-400">
                    <FiClock className="w-2.5 h-2.5" />
                    {new Date(session.started_at).toLocaleString("id-ID")}
                </div>
            )}
            {session.error_msg && (
                <p className="text-[10px] text-red-500 mt-1 line-clamp-2">{session.error_msg}</p>
            )}
        </div>
    );
}

export default function CrawlSessionList({ selectedJob, jobs, onSelectJob }: CrawlSessionListProps) {
    const [sessions, setSessions] = useState<CrawlSession[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    useEffect(() => {
        if (!selectedJob) {
            setSessions([]);
            return;
        }
        setIsLoadingSessions(true);
        crawlerService.listSessions(selectedJob.id)
            .then((res) => setSessions(Array.isArray(res) ? res : []))
            .catch(() => setSessions([]))
            .finally(() => setIsLoadingSessions(false));
    }, [selectedJob]);

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full rounded-xl" radius="lg">
            <CardBody className="p-0">
                {/* Job selector */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Pilih Job</h3>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {jobs.slice(0, 10).map((job) => (
                            <button
                                key={job.id}
                                type="button"
                                onClick={() => onSelectJob(job)}
                                className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                                    selectedJob?.id === job.id
                                        ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
                                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                }`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    {statusIcon(job.status)}
                                    <div className="min-w-0">
                                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                            #{job.id} {job.job_type}
                                        </span>
                                        <div className="text-[10px] text-gray-400 truncate">
                                            {job.started_at ? new Date(job.started_at).toLocaleString("id-ID") : "Menunggu"}
                                        </div>
                                    </div>
                                </div>
                                <FiChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Session details */}
                <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                        Detail Sesi
                        {selectedJob && (
                            <span className="text-gray-400 font-normal ml-1">— Job #{selectedJob.id}</span>
                        )}
                    </h3>

                    {!selectedJob ? (
                        <div className="text-center py-8 text-gray-400 text-xs">
                            Klik job di atas untuk melihat detail sesi.
                        </div>
                    ) : isLoadingSessions ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="sm" label="Memuat sesi..." />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">
                            Belum ada sesi untuk job ini.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[350px] overflow-y-auto">
                            {/* Summary */}
                            <p className="text-[10px] text-gray-400 mb-2">
                                Ringkasan hasil crawl pada job #{selectedJob.id} — setiap sesi mewakili 1 situs yang dipindai.
                            </p>
                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <Tooltip content="Jumlah situs yang di-crawl dalam job ini">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center cursor-help">
                                        <div className="text-lg font-bold text-blue-600">{sessions.length}</div>
                                        <div className="text-[10px] text-gray-500">Sesi Crawl</div>
                                    </div>
                                </Tooltip>
                                <Tooltip content="Total halaman web yang berhasil dipindai dari semua situs">
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center cursor-help">
                                        <div className="text-lg font-bold text-green-600">
                                            {sessions.reduce((sum, s) => sum + (s.total_pages || 0), 0)}
                                        </div>
                                        <div className="text-[10px] text-gray-500">Halaman Dipindai</div>
                                    </div>
                                </Tooltip>
                                <Tooltip content="Total konten terlarang yang terdeteksi (judi online, dll)">
                                    <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 text-center cursor-help">
                                        <div className="text-lg font-bold text-orange-600">
                                            {sessions.reduce((sum, s) => sum + (s.threat_count || 0), 0)}
                                        </div>
                                        <div className="text-[10px] text-gray-500">Ancaman Ditemukan</div>
                                    </div>
                                </Tooltip>
                            </div>

                            {sessions.map((session) => (
                                <SessionDetail key={session.id} session={session} />
                            ))}
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
