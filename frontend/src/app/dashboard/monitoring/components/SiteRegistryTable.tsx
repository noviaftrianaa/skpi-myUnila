
"use client";

import React, { useMemo, useState } from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button } from "@heroui/react";
import { FiExternalLink, FiShield, FiAlertTriangle } from "react-icons/fi";

interface SiteEntry {
    id: string;
    name: string;
    url: string;
    unit: string;
    pic: string;
    cmsType: string;
    cmsVersion: string;
    sslExpiry: string;
    uptime: number;
    status: "aman" | "waspada" | "bahaya";
    lastScan: string;
    healthScore: number;
}

const dummySites: SiteEntry[] = [
    {
        id: "1", name: "Portal FT", url: "ft.unila.ac.id", unit: "Fakultas Teknik",
        pic: "Admin FT", cmsType: "WordPress", cmsVersion: "6.4.2", sslExpiry: "2026-08-15",
        uptime: 99.8, status: "bahaya", lastScan: "2026-02-18 13:00", healthScore: 45,
    },
    {
        id: "2", name: "Portal FKIP", url: "fkip.unila.ac.id", unit: "FKIP",
        pic: "Admin FKIP", cmsType: "WordPress", cmsVersion: "6.3.1", sslExpiry: "2026-06-20",
        uptime: 98.5, status: "waspada", lastScan: "2026-02-18 12:00", healthScore: 62,
    },
    {
        id: "3", name: "Portal FEB", url: "feb.unila.ac.id", unit: "FEB",
        pic: "Admin FEB", cmsType: "Joomla", cmsVersion: "4.3.2", sslExpiry: "2026-12-01",
        uptime: 99.9, status: "aman", lastScan: "2026-02-18 11:00", healthScore: 92,
    },
    {
        id: "4", name: "Portal FISIP", url: "fisip.unila.ac.id", unit: "FISIP",
        pic: "Admin FISIP", cmsType: "WordPress", cmsVersion: "6.4.2", sslExpiry: "2026-03-01",
        uptime: 97.2, status: "aman", lastScan: "2026-02-18 10:00", healthScore: 78,
    },
    {
        id: "5", name: "Portal FMIPA", url: "fmipa.unila.ac.id", unit: "FMIPA",
        pic: "Admin FMIPA", cmsType: "Custom", cmsVersion: "-", sslExpiry: "2026-11-15",
        uptime: 99.5, status: "aman", lastScan: "2026-02-18 09:00", healthScore: 88,
    },
    {
        id: "6", name: "Portal FH", url: "fh.unila.ac.id", unit: "Fakultas Hukum",
        pic: "Admin FH", cmsType: "WordPress", cmsVersion: "6.2.0", sslExpiry: "2026-04-10",
        uptime: 98.0, status: "aman", lastScan: "2026-02-18 08:00", healthScore: 81,
    },
    {
        id: "7", name: "Portal FK", url: "fk.unila.ac.id", unit: "Fakultas Kedokteran",
        pic: "Admin FK", cmsType: "WordPress", cmsVersion: "6.4.2", sslExpiry: "2026-09-30",
        uptime: 99.9, status: "aman", lastScan: "2026-02-18 07:00", healthScore: 95,
    },
    {
        id: "8", name: "Portal FP", url: "fp.unila.ac.id", unit: "Fakultas Pertanian",
        pic: "Admin FP", cmsType: "Joomla", cmsVersion: "4.2.0", sslExpiry: "2026-07-20",
        uptime: 96.8, status: "waspada", lastScan: "2026-02-18 06:00", healthScore: 58,
    },
];

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
        label: "CMS",
        sortable: true,
        render: (item) => (
            <div>
                <span className="text-xs sm:text-sm">{item.cmsType}</span>
                <div className="text-[10px] text-gray-400">v{item.cmsVersion}</div>
            </div>
        ),
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
    // Status filter
    const [statusFilter, setStatusFilter] = useState<"all" | "aman" | "waspada" | "bahaya">("all");

    const filteredSites = useMemo(() => {
        if (statusFilter === "all") return dummySites;
        return dummySites.filter((s) => s.status === statusFilter);
    }, [statusFilter]);

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
