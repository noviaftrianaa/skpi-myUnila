
"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip } from "@heroui/react";
import { FiExternalLink, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { dummySites } from "../../data";

interface Site {
    id: string;
    url: string;
    name: string;
    platform: string;
    status: string;
    fakultas: string;
    last_sync: string;
    health: {
        is_online: boolean;
        response_time: number;
        ssl_valid: boolean;
        ssl_expiry: string;
    };
}

export default function SiteTable({ onEdit }: { onEdit: (site: Site) => void }) {
    const columns: Column<Site>[] = [
        {
            key: "name",
            label: "Situs",
            sortable: true,
            render: (site) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{site.name}</div>
                    <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                    >
                        {site.url} <FiExternalLink className="w-3 h-3" />
                    </a>
                </div>
            ),
        },
        { key: "platform", label: "Platform", sortable: true },
        { key: "fakultas", label: "Unit/Fakultas", sortable: true },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (site) => (
                <Chip
                    size="sm"
                    variant="flat"
                    color={
                        site.status === "active"
                            ? "success"
                            : site.status === "compromised"
                                ? "danger"
                                : "warning"
                    }
                >
                    {site.status}
                </Chip>
            ),
        },
        {
            key: "health",
            label: "Kesehatan",
            render: (site) => (
                <div className="flex gap-2">
                    <Tooltip content={site.health.is_online ? "Online" : "Offline"}>
                        <div
                            className={`w-3 h-3 rounded-full ${site.health.is_online ? "bg-green-500" : "bg-red-500"
                                }`}
                        />
                    </Tooltip>
                    <Tooltip content="SSL Valid">
                        <div
                            className={`w-3 h-3 rounded-full ${site.health.ssl_valid ? "bg-green-500" : "bg-red-500"
                                }`}
                        />
                    </Tooltip>
                    <span className="text-xs text-gray-500">{site.health.response_time}ms</span>
                </div>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (site) => (
                <div className="flex items-center gap-1">
                    <Tooltip content="Sync Now">
                        <Button isIconOnly size="sm" variant="light" color="primary" radius="full" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <FiRefreshCw className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Edit">
                        <Button isIconOnly size="sm" variant="light" radius="full" onPress={() => onEdit(site)} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <FiEdit2 className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Hapus">
                        <Button isIconOnly size="sm" variant="light" color="danger" radius="full" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <FiTrash2 className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <DataTable
            data={dummySites}
            columns={columns}
            searchable
            searchKeys={["name", "url", "fakultas"]}
            searchPlaceholder="Cari situs..."
            noWrapper
            className="border-none shadow-none"
        />
    );
}
