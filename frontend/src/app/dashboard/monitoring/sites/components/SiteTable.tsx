"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip, Spinner } from "@heroui/react";
import { FiExternalLink, FiEdit2, FiTrash2, FiRefreshCw } from "react-icons/fi";
import { Site } from "@/lib/services/webmon/siteService";

interface SiteTableProps {
    data: Site[];
    isLoading?: boolean;
    onEdit: (site: Site) => void;
    onSync?: (site: Site) => void;
    onDelete?: (site: Site) => void;
}

export default function SiteTable({ data, isLoading, onEdit, onSync, onDelete }: SiteTableProps) {
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
        {
            key: "fakultas_id",
            label: "Fakultas/Unit",
            sortable: true,
            render: (site) => <span className="text-sm">{site.fakultas_id || site.unit_id || "-"}</span>,
        },
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
            key: "last_check",
            label: "Kesehatan",
            render: (site) => {
                const c = site.last_check;
                if (!c) return <span className="text-xs text-gray-400">Belum dicek</span>;
                return (
                    <div className="flex items-center gap-2">
                        <Tooltip content={c.is_up ? "Online" : "Offline"}>
                            <div className={`w-3 h-3 rounded-full ${c.is_up ? "bg-green-500" : "bg-red-500"}`} />
                        </Tooltip>
                        <span className="text-xs text-gray-500">{c.response_time_ms}ms</span>
                        {c.ssl_expiry_days !== undefined && (
                            <Tooltip content={`SSL: ${c.ssl_expiry_days} hari lagi`}>
                                <div className={`w-3 h-3 rounded-full ${c.ssl_expiry_days > 30 ? "bg-green-500" : "bg-orange-500"}`} />
                            </Tooltip>
                        )}
                    </div>
                );
            },
        },
        {
            key: "actions",
            label: "Aksi",
            render: (site) => (
                <div className="flex items-center gap-1">
                    <Tooltip content="Sync Now">
                        <Button isIconOnly size="sm" variant="light" color="primary" radius="full"
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onPress={() => onSync?.(site)}>
                            <FiRefreshCw className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Edit">
                        <Button isIconOnly size="sm" variant="light" radius="full"
                            onPress={() => onEdit(site)}
                            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <FiEdit2 className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Hapus">
                        <Button isIconOnly size="sm" variant="light" color="danger" radius="full"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onPress={() => onDelete?.(site)}>
                            <FiTrash2 className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return <div className="flex justify-center py-10"><Spinner label="Memuat data situs..." /></div>;
    }

    return (
        <DataTable
            data={data}
            columns={columns}
            searchable
            searchKeys={["name", "url", "fakultas_id"]}
            searchPlaceholder="Cari situs..."
            noWrapper
            className="border-none shadow-none"
        />
    );
}
