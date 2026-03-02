
"use client";

import React, { useMemo, useState, useEffect } from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button } from "@heroui/react";
import { FiExternalLink } from "react-icons/fi";
import { siteService, Site } from "@/lib/services/webmon/siteService";

interface SiteEntry {
    id: string;
    name: string;
    url: string;
    unit: string;
    pic: string;
    cmsType: string;
    sslExpiry: string;
    uptime: number;
    status: "aman" | "waspada" | "bahaya";
    lastScan: string;
    healthScore: number;
}

function siteToEntry(s: Site): SiteEntry {
    const isUp = s.last_check?.is_up ?? true;
    const sslDays = s.last_check?.ssl_expiry_days;
    const sslDate = sslDays != null
        ? new Date(Date.now() + sslDays * 86400000).toISOString().slice(0, 10)
        : new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);

    const status: SiteEntry["status"] =
        s.status === "compromised" ? "bahaya" :
        s.status === "maintenance" || !isUp ? "waspada" : "aman";

    let score = 100;
    if (!isUp) score -= 50;
    if (status === "waspada") score -= 20;
    if (status === "bahaya") score -= 40;
    if (sslDays != null && sslDays < 30) score -= 10;

    return {
        id: s.id,
        name: s.name,
        url: s.url,
        unit: s.fakultas_id || s.unit_id || "-",
        pic: s.admin_name || "-",
        cmsType: s.platform,
        sslExpiry: sslDate,
        uptime: isUp ? 99.0 : 0,
        status,
        lastScan: s.last_check?.checked_at
            ? new Date(s.last_check.checked_at).toLocaleString("id-ID")
            : "-",
        healthScore: Math.max(0, score),
    };
}

const statusConfig = {
    aman: { color: "success" as const, label: "Aman" },
    waspada: { color: "warning" as const, label: "Waspada" },
    bahaya: { color: "danger" as const, label: "Bahaya" },
};

function HealthBar({ score }: { score: number }) {
    const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500";
    return (
        <div className="flex items-center gap-2">
            <div className="w-12 sm:w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{score}</span>
        </div>
    );
}

const columns: Column<SiteEntry>[] = [
    {
        key: "name",
        label: "Situs",
        sortable: true,
        minWidth: "180px",
        render: (item) => (
            <div>
                <div className="font-semibold text-gray-900 dark:text-white text-xs sm:text-sm">{item.name}</div>
                <a
                    href={`https://${item.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] sm:text-xs text-blue-500 hover:underline flex items-center gap-1"
                >
                    {item.url} <FiExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
            </div>
        ),
    },
    {
        key: "unit",
        label: "Unit",
        sortable: true,
    },
    {
        key: "cmsType",
        label: "Platform",
        sortable: true,
        render: (item) => <span className="text-xs sm:text-sm capitalize">{item.cmsType}</span>,
    },
    {
        key: "sslExpiry",
        label: "SSL",
        sortable: true,
        render: (item) => {
            const sslDate = new Date(item.sslExpiry);
            const now = new Date();
            const daysLeft = Math.ceil((sslDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const warning = daysLeft < 30;
            return (
                <Chip size="sm" variant="flat" color={warning ? "warning" : "success"}>
                    {warning ? `${daysLeft}d` : "OK"}
                </Chip>
            );
        },
    },
    {
        key: "uptime",
        label: "Uptime",
        sortable: true,
        align: "center",
        render: (item) => (
            <span className={`font-mono text-xs font-semibold ${item.uptime >= 99 ? "text-green-600" : item.uptime >= 97 ? "text-yellow-600" : "text-red-600"}`}>
                {item.uptime}%
            </span>
        ),
    },
    {
        key: "healthScore",
        label: "Health",
        sortable: true,
        render: (item) => <HealthBar score={item.healthScore} />,
    },
    {
        key: "status",
        label: "Status",
        sortable: true,
        render: (item) => {
            const config = statusConfig[item.status];
            return (
                <Chip size="sm" variant="flat" color={config.color}>
                    {config.label}
                </Chip>
            );
        },
    },
    {
        key: "lastScan",
        label: "Terakhir Scan",
        sortable: true,
        render: (item) => (
            <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{item.lastScan}</span>
        ),
    },
];

export default function SiteRegistryTable() {
    const [statusFilter, setStatusFilter] = useState<"all" | "aman" | "waspada" | "bahaya">("all");
    const [sites, setSites] = useState<SiteEntry[]>([]);

    useEffect(() => {
        siteService.listSites({ limit: 300 })
            .then((res) => setSites((res.data || []).map(siteToEntry)))
            .catch(() => {});
    }, []);

    const filteredSites = useMemo(() => {
        if (statusFilter === "all") return sites;
        return sites.filter((s) => s.status === statusFilter);
    }, [statusFilter, sites]);

    const filterSlot = (
        <div className="flex gap-1 flex-wrap">
            {(["all", "aman", "waspada", "bahaya"] as const).map((s) => (
                <Chip
                    key={s}
                    size="sm"
                    variant={statusFilter === s ? "solid" : "flat"}
                    color={s === "all" ? "default" : statusConfig[s].color}
                    className="cursor-pointer text-[10px] sm:text-xs"
                    onClick={() => setStatusFilter(s)}
                >
                    {s === "all" ? "Semua" : statusConfig[s].label}
                </Chip>
            ))}
        </div>
    );

    const actionSlot = (
        <Button size="sm" color="primary" variant="flat" className="text-[10px] sm:text-xs">
            + Tambah Situs
        </Button>
    );

    return (
        <DataTable
            data={filteredSites}
            columns={columns}
            searchable
            searchKeys={["name", "url", "unit", "cmsType"]}
            searchPlaceholder="Cari situs, URL, atau unit..."
            defaultRowsPerPage={10}
            filterSlot={filterSlot}
            actionSlot={actionSlot}
        />
    );
}
