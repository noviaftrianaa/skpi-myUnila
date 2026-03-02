"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip, Spinner } from "@heroui/react";
import { FiPlay } from "react-icons/fi";
import { CrawlJob } from "@/lib/services/webmon/crawlerService";

interface CrawlJobTableProps {
    data: CrawlJob[];
    isLoading?: boolean;
    onRunNow?: (job: CrawlJob) => void;
}

export default function CrawlJobTable({ data, isLoading, onRunNow }: CrawlJobTableProps) {
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
            render: (job) => <span className="text-xs text-gray-500 font-mono">{job.triggered_by?.slice(0, 8)}...</span>,
        },
        {
            key: "actions",
            label: "Aksi",
            render: (job) => (
                <div className="flex items-center gap-1">
                    {job.status !== "running" && (
                        <Tooltip content="Jalankan Sekarang">
                            <Button isIconOnly size="sm" variant="light" color="primary" radius="full"
                                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onPress={() => onRunNow?.(job)}>
                                <FiPlay className="w-4 h-4" />
                            </Button>
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    if (isLoading) {
        return <div className="flex justify-center py-10"><Spinner label="Memuat crawl jobs..." /></div>;
    }

    return (
        <DataTable
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
