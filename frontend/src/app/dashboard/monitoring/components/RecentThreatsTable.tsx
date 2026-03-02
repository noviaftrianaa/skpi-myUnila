
"use client";

import React, { useEffect, useState } from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Spinner } from "@heroui/react";
import { threatService, Threat } from "@/lib/services/webmon/threatService";

const statusMap: Record<string, { label: string; color: "danger" | "warning" | "success" | "default" }> = {
    pending:        { label: "Baru",          color: "danger" },
    confirmed:      { label: "Dikonfirmasi",  color: "warning" },
    resolved:       { label: "Resolved",      color: "success" },
    false_positive: { label: "False Positive",color: "default" },
};

const columns: Column<Threat>[] = [
    {
        key: "site_id",
        label: "Site",
        sortable: true,
        render: (item) => <span className="text-xs font-medium">{item.site_id}</span>,
    },
    {
        key: "page_url",
        label: "URL",
        sortable: true,
        render: (item) => (
            <a href={item.page_url} target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate max-w-[200px] block text-xs">
                {item.page_url}
            </a>
        ),
    },
    {
        key: "category",
        label: "Kategori",
        sortable: true,
        render: (item) => (
            <Chip size="sm" variant="flat" color="warning" className="text-xs">
                {item.category}
            </Chip>
        ),
    },
    {
        key: "threat_score",
        label: "Skor",
        sortable: true,
        render: (item) => (
            <span className={`font-bold text-sm ${item.threat_score > 15 ? "text-red-600" : item.threat_score > 8 ? "text-orange-600" : "text-yellow-600"}`}>
                {item.threat_score}
            </span>
        ),
    },
    {
        key: "status",
        label: "Status",
        sortable: true,
        render: (item) => {
            const cfg = statusMap[item.status] ?? { label: item.status, color: "default" as const };
            return <Chip size="sm" color={cfg.color} variant="solid">{cfg.label}</Chip>;
        },
    },
    {
        key: "detected_at",
        label: "Waktu Deteksi",
        sortable: true,
        render: (item) => (
            <span className="text-xs text-gray-500 whitespace-nowrap">
                {item.detected_at ? new Date(item.detected_at).toLocaleString("id-ID") : "-"}
            </span>
        ),
    },
];

export default function RecentThreatsTable() {
    const [data, setData] = useState<Threat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        threatService.listThreats({ limit: 10 })
            .then((res) => setData(res.data || []))
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return <div className="flex justify-center py-8"><Spinner label="Memuat ancaman..." /></div>;
    }

    return (
        <DataTable
            data={data}
            columns={columns}
            searchable
            searchKeys={["site_id", "page_url", "category"]}
            searchPlaceholder="Cari ancaman..."
            defaultRowsPerPage={5}
            noWrapper
        />
    );
}
