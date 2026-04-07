"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip } from "@heroui/react";
import { FiPlay, FiEye, FiTrash2 } from "react-icons/fi";
import { CrawlJob } from "@/lib/services/webmon/crawlerService";

interface CrawlJobTableProps {
    data: CrawlJob[];
    isLoading?: boolean;
    onRunNow?: (job: CrawlJob) => void;
    onSelectJob?: (job: CrawlJob) => void;
    onDelete?: (job: CrawlJob) => void;
    selectedJobId?: number;
}

export default function CrawlJobTable({ data, isLoading, onRunNow, onSelectJob, onDelete, selectedJobId }: CrawlJobTableProps) {
    const columns: Column<CrawlJob>[] = [
        {
            key: "id",
            label: "ID",
            sortable: true,
            render: (job) => <span className="font-mono text-sm">#{job.id}</span>,
        },
        {
            key: "job_type",
            label: "Tipe",
            sortable: true,
            render: (job) => <Chip size="sm" variant="flat">{job.job_type}</Chip>,
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (job) => (
                <Chip
                    size="sm"
                    variant="dot"
                    color={
                        job.status === "running"
                            ? "warning"
                            : job.status === "done"
                                ? "success"
                                : job.status === "failed"
                                    ? "danger"
                                    : "default"
                    }
                >
                    {job.status}
                </Chip>
            ),
        },
        {
            key: "started_at",
            label: "Mulai",
            sortable: true,
            render: (job) => (
                <span className="text-xs text-gray-500">
                    {job.started_at ? new Date(job.started_at).toLocaleString("id-ID") : "-"}
                </span>
            ),
        },
        {
            key: "finished_at",
            label: "Selesai",
            sortable: true,
            render: (job) => (
                <span className="text-xs text-gray-500">
                    {job.finished_at ? new Date(job.finished_at).toLocaleString("id-ID") : "-"}
                </span>
            ),
        },
        {
            key: "triggered_by",
            label: "Dipicu oleh",
            render: (job) => (
                <span className="text-xs text-gray-500 font-mono">
                    {job.triggered_by ? `${job.triggered_by.slice(0, 8)}...` : "-"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (job) => (
                <div className="flex items-center gap-1">
                    <Tooltip content="Lihat Detail">
                        <Button isIconOnly size="sm" variant="light" radius="full"
                            className={`${selectedJobId === job.id ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                            onPress={() => onSelectJob?.(job)}>
                            <FiEye className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    {job.status !== "running" && (
                        <Tooltip content="Jalankan Lagi">
                            <Button isIconOnly size="sm" variant="light" color="primary" radius="full"
                                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onPress={() => onRunNow?.(job)}>
                                <FiPlay className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    )}
                    {job.status !== "running" && (
                        <Tooltip content="Hapus Job">
                            <Button isIconOnly size="sm" variant="light" color="danger" radius="full"
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onPress={() => onDelete?.(job)}>
                                <FiTrash2 className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    return (
        <DataTable
            loading={isLoading}
            data={data}
            columns={columns}
            searchable
            searchKeys={["job_type", "status"]}
            searchPlaceholder="Cari job..."
            noWrapper
            className="border-none shadow-none"
        />
    );
}
