
"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip } from "@heroui/react";
import { FiCheck, FiX, FiExternalLink, FiEye } from "react-icons/fi";
import { dummyThreats } from "../../data";

interface Threat {
    id: string;
    site_name: string;
    url: string;
    threat_score: number;
    status: string;
    detected_at: string;
    matched_keywords: { keyword: string; category: string; weight: number }[];
}

export default function ThreatTable() {
    const columns: Column<Threat>[] = [
        {
            key: "site_name",
            label: "Situs / URL",
            sortable: true,
            render: (threat) => (
                <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{threat.site_name}</div>
                    <a
                        href={threat.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 break-all"
                    >
                        {threat.url} <FiExternalLink className="w-3 h-3" />
                    </a>
                </div>
            ),
        },
        {
            key: "matched_keywords",
            label: "Keyword",
            render: (threat) => (
                <div className="flex flex-wrap gap-1">
                    {threat.matched_keywords.map((k, i) => (
                        <Chip key={i} size="sm" variant="flat" color="danger">
                            {k.keyword}
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
                <span className={`font-bold ${threat.threat_score >= 8 ? "text-red-600" : "text-yellow-600"}`}>
                    {threat.threat_score}
                </span>
            ),
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
                        threat.status === "new"
                            ? "danger"
                            : threat.status === "confirmed"
                                ? "warning"
                                : "success"
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
            render: (threat) => <span className="text-xs text-gray-500">{new Date(threat.detected_at).toLocaleString()}</span>,
        },
        {
            key: "actions",
            label: "Aksi",
            render: (threat) => (
                <div className="flex items-center gap-1">
                    <Tooltip content="Lihat Detail">
                        <Button isIconOnly size="sm" variant="light" radius="full" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <FiEye className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    {threat.status === "new" && (
                        <>
                            <Tooltip content="Konfirmasi Ancaman">
                                <Button isIconOnly size="sm" variant="light" color="warning" radius="full" className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                                    <FiCheck className="w-4 h-4" />
                                </Button>
                            </Tooltip>
                            <Tooltip content="Tandai False Positive">
                                <Button isIconOnly size="sm" variant="light" color="success" radius="full" className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
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
            data={dummyThreats}
            columns={columns}
            searchable
            searchKeys={["site_name", "url", "status"]}
            searchPlaceholder="Cari ancaman..."
            noWrapper
            className="border-none shadow-none"
        />
    );
}
