
"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip } from "@heroui/react";
import { FiPlay, FiSettings, FiTrash2 } from "react-icons/fi";
import { dummyCrawlJobs } from "../../data";

interface CrawlJob {
    id: number;
    name: string;
    target_scope: string;
    cron_expression: string;
    last_run: string;
    next_run: string;
    status: string;
    avg_duration: string;
}

export default function CrawlJobTable() {
    const columns: Column<CrawlJob>[] = [
        { key: "name", label: "Nama Job", sortable: true },
        {
            key: "target_scope",
            label: "Scope",
            render: (job) => (
                <Chip size="sm" variant="flat">
                    {job.target_scope}
                </Chip>
            ),
        },
        { key: "cron_expression", label: "Jadwal (Cron)", sortable: true },
        { key: "last_run", label: "Terakhir Run", sortable: true },
        { key: "next_run", label: "Berikutnya", sortable: true },
        {
            key: "status",
            label: "Status",
            render: (job) => (
                <Chip
                    size="sm"
                    variant="dot"
                    color={job.status === "active" ? "success" : "default"}
                >
                    {job.status}
                </Chip>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (job) => (
                <div className="flex items-center gap-1">
                    <Tooltip content="Jalankan Sekarang">
                        <Button isIconOnly size="sm" variant="light" color="primary" radius="full" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <FiPlay className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Edit">
                        <Button isIconOnly size="sm" variant="light" radius="full" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <FiSettings className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            data={dummyCrawlJobs}
            columns={columns}
            searchable
            searchKeys={["name", "target_scope"]}
            searchPlaceholder="Cari job..."
            noWrapper
            className="border-none shadow-none"
        />
    );
}
