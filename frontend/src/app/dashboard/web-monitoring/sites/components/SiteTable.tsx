"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip } from "@heroui/react";
import { FiExternalLink, FiEdit2, FiTrash2, FiRefreshCw, FiMessageCircle } from "react-icons/fi";
import { Site } from "@/lib/services/webmon/siteService";

interface SiteTableProps {
    data: Site[];
    isLoading?: boolean;
    onEdit: (site: Site) => void;
    onSync?: (site: Site) => void;
    onDelete?: (site: Site) => void;
    waTemplate?: string;
    serverSide?: boolean;
    totalRecords?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rows: number) => void;
    onSearchChange?: (query: string) => void;
}

const DEFAULT_WA_TEMPLATE =
    `Yth. {nama_pj},\n\n` +
    `Kami dari Tim Monitoring Web Universitas Lampung menginformasikan bahwa website *{nama_situs}* ({url_situs}) terdeteksi memerlukan perhatian.\n\n` +
    `Mohon segera lakukan pengecekan dan penanganan:\n` +
    `1. Periksa konten website dari sisipan ilegal (judi online, dll)\n` +
    `2. Ganti password admin & FTP\n` +
    `3. Update CMS dan plugin ke versi terbaru\n` +
    `4. Scan malware dan hapus file mencurigakan\n\n` +
    `Detail lengkap dapat dilihat di dashboard monitoring.\n\nTerima kasih.`;

export default function SiteTable({ data, isLoading, onEdit, onSync, onDelete, waTemplate, serverSide, totalRecords, currentPage, onPageChange, onRowsPerPageChange, onSearchChange }: SiteTableProps) {
    const columns: Column<Site>[] = [
        {
            key: "name",
            label: "Situs",
            sortable: true,
            render: (site) => {
                const fullUrl = site.url.startsWith("http") ? site.url : `https://${site.url}`;
                return (
                    <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{site.name}</div>
                        <a
                            href={fullUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                        >
                            {site.url} <FiExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                );
            },
        },
        { key: "platform", label: "Platform", sortable: true },
        {
            key: "fakultas_id",
            label: "Fakultas/Unit",
            sortable: true,
            render: (site) => (
                <div>
                    <span className="text-sm">{site.nama_unit || site.fakultas_id || site.unit_id || "-"}</span>
                    {site.id_sms && (
                        <div className="text-[10px] text-blue-400">pdrd.sms linked</div>
                    )}
                </div>
            ),
        },
        {
            key: "admin_name",
            label: "Penanggung Jawab",
            render: (site) => {
                if (!site.admin_name && !site.admin_whatsapp) return <span className="text-xs text-gray-400">-</span>;
                const waNumber = site.admin_whatsapp?.replace(/^0/, "62").replace(/[^0-9]/g, "");
                const template = waTemplate || DEFAULT_WA_TEMPLATE;
                const waText = encodeURIComponent(
                    template
                        .replace(/\{nama_pj\}/g, site.admin_name || "Pengelola")
                        .replace(/\{nama_situs\}/g, site.name)
                        .replace(/\{url_situs\}/g, site.url)
                );
                return (
                    <div className="space-y-0.5">
                        {site.admin_name && <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{site.admin_name}</div>}
                        {site.admin_email && <div className="text-[10px] text-gray-400">{site.admin_email}</div>}
                        {waNumber && (
                            <a
                                href={`https://wa.me/${waNumber}?text=${waText}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-green-600 hover:text-green-700 hover:underline"
                            >
                                <FiMessageCircle className="w-3 h-3" />
                                {site.admin_whatsapp}
                            </a>
                        )}
                    </div>
                );
            },
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

    return (
        <DataTable
            loading={isLoading}
            data={data}
            columns={columns}
            searchable
            searchKeys={["name", "url", "fakultas_id", "admin_name", "nama_unit"]}
            searchPlaceholder="Cari situs..."
            noWrapper
            className="border-none shadow-none"
            serverSide={serverSide}
            totalRecords={totalRecords}
            currentPage={currentPage}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            onSearchChange={onSearchChange}
        />
    );
}
