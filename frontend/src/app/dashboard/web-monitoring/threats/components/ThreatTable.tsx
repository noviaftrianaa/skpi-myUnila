"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip } from "@heroui/react";
import { FiCheck, FiX, FiExternalLink, FiEye, FiTrash2 } from "react-icons/fi";
import { Threat } from "@/lib/services/webmon/threatService";
import { gscService } from "@/lib/services/webmon/gscService";
import { toast } from "react-hot-toast";

interface ThreatTableProps {
    data: Threat[];
    isLoading?: boolean;
    onUpdateStatus?: (id: number, status: string) => void;
    onViewDetail?: (id: number) => void;
}

export default function ThreatTable({ data, isLoading, onUpdateStatus, onViewDetail }: ThreatTableProps) {
    const [gscLoading, setGscLoading] = React.useState<number | null>(null);

    const handleGSCRemove = async (threatId: number) => {
        setGscLoading(threatId);
        try {
            await gscService.removeThreat(threatId);
            toast.success("URL removal request dikirim ke Google Search Console");
        } catch {
            toast.error("Gagal mengirim GSC removal request");
        } finally {
            setGscLoading(null);
        }
    };
    const columns: Column<Threat>[] = [
        {
            key: "page_url",
            label: "Situs / URL",
            sortable: true,
            render: (threat) => (
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {threat.site_name || threat.site_id}
                        </span>
                        {threat.is_cloaked === 1 && (
                            <Tooltip content="Cloaking: konten berbeda untuk Googlebot vs pengunjung biasa">
                                <Chip size="sm" color="danger" variant="flat" className="text-[10px] h-5">🕵️ Cloaking</Chip>
                            </Tooltip>
                        )}
                    </div>
                    <a
                        href={threat.page_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 break-all"
                    >
                        {threat.page_url} <FiExternalLink className="w-3 h-3" />
                    </a>
                </div>
            ),
        },
        {
            key: "matched_keywords",
            label: "Keyword",
            render: (threat) => (
                <div className="flex flex-wrap gap-1">
                    {threat.matched_keywords.split(",").map((k, i) => (
                        <Chip key={i} size="sm" variant="flat" color="danger">
                            {k.trim()}
                        </Chip>
                    ))}
                </div>
            ),
        },
        {
            key: "threat_score",
            label: "Skor",
            sortable: true,
            render: (threat) => (
                <span className={`font-bold ${threat.threat_score >= 15 ? "text-red-600" : "text-yellow-600"}`}>
                    {threat.threat_score}
                </span>
            ),
        },
        {
            key: "category",
            label: "Kategori",
            sortable: true,
            render: (threat) => <Chip size="sm" variant="flat">{threat.category}</Chip>,
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            render: (threat) => (
                <Chip
                    size="sm"
                    variant="dot"
                    color={
                        threat.status === "pending"
                            ? "danger"
                            : threat.status === "confirmed"
                                ? "warning"
                                : threat.status === "resolved"
                                    ? "success"
                                    : "default"
                    }
                >
                    {threat.status}
                </Chip>
            ),
        },
        {
            key: "detected_at",
            label: "Terdeteksi",
            sortable: true,
            render: (threat) => (
                <span className="text-xs text-gray-500">
                    {new Date(threat.detected_at).toLocaleString("id-ID")}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (threat) => (
                <div className="flex items-center gap-1">
                    <Tooltip content="Lihat Detail">
                        <Button isIconOnly size="sm" variant="light" radius="full"
                            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onPress={() => onViewDetail?.(threat.id)}>
                            <FiEye className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Request GSC Removal">
                        <Button isIconOnly size="sm" variant="light" color="primary" radius="full"
                            className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            isLoading={gscLoading === threat.id}
                            onPress={() => handleGSCRemove(threat.id)}>
                            <FiTrash2 className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    {threat.status === "pending" && (
                        <>
                            <Tooltip content="Konfirmasi Ancaman">
                                <Button isIconOnly size="sm" variant="light" color="warning" radius="full"
                                    className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                    onPress={() => onUpdateStatus?.(threat.id, "confirmed")}>
                                    <FiCheck className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Tandai False Positive">
                                <Button isIconOnly size="sm" variant="light" color="success" radius="full"
                                    className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                    onPress={() => onUpdateStatus?.(threat.id, "false_positive")}>
                                    <FiX className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                        </>
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
            searchKeys={["page_url", "status", "category"]}
            searchPlaceholder="Cari ancaman..."
            noWrapper
            className="border-none shadow-none"
        />
    );
}
