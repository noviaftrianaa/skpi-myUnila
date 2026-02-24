
"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip } from "@heroui/react";

interface Threat {
    id: string;
    url: string;
    site_name: string;
    score: number;
    category: string;
    detected_at: string;
    status: "Baru" | "ikonfirmasi" | "False Positive" | "Resolved";
}

const dummyThreats: Threat[] = [
    {
        id: "1",
        url: "https://example.unila.ac.id/blog/post-123",
        site_name: "Blog Fakultas Teknik",
        score: 85,
        category: "Slot Gacor",
        detected_at: "2026-02-18 10:30",
        status: "Baru",
    },
    {
        id: "2",
        url: "https://example.unila.ac.id/forum/discussion",
        site_name: "Forum Mahasiswa",
        score: 92,
        category: "Judi Online",
        detected_at: "2026-02-18 09:15",
        status: "ikonfirmasi",
    },
    {
        id: "3",
        url: "https://biologi.unila.ac.id/news/detil",
        site_name: "Jurusan Biologi",
        score: 60,
        category: "Poker",
        detected_at: "2026-02-17 14:20",
        status: "Resolved",
    },
    {
        id: "4",
        url: "https://kkn.unila.ac.id/laporan",
        site_name: "KKN Periode 1",
        score: 45,
        category: "Unknown",
        detected_at: "2026-02-17 11:00",
        status: "False Positive",
    },
    {
        id: "5",
        url: "https://fisip.unila.ac.id/agenda",
        site_name: "FISIP Agenda",
        score: 78,
        category: "Togel",
        detected_at: "2026-02-16 16:45",
        status: "Resolved",
    },
];

const columns: Column<Threat>[] = [
    { key: "site_name", label: "Nama Situs", sortable: true },
    {
        key: "url",
        label: "URL",
        sortable: true,
        render: (item) => (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px] block">
                {item.url}
            </a>
        )
    },
    {
        key: "category",
        label: "Kategori",
        sortable: true,
        render: (item) => (
            <Chip size="sm" variant="flat" color="warning" className="text-xs">
                {item.category}
            </Chip>
        )
    },
    {
        key: "score",
        label: "Skor",
        sortable: true,
        render: (item) => (
            <span className={`font-bold ${item.score > 80 ? 'text-red-600' : item.score > 50 ? 'text-orange-600' : 'text-yellow-600'}`}>
                {item.score}
            </span>
        )
    },
    {
        key: "status",
        label: "Status",
        sortable: true,
        render: (item) => {
            const colorMap: Record<string, "danger" | "warning" | "success" | "default"> = {
                "Baru": "danger",
                "ikonfirmasi": "warning",
                "Resolved": "success",
                "False Positive": "default"
            };
            return (
                <Chip size="sm" color={colorMap[item.status]} variant="solid">
                    {item.status}
                </Chip>
            );
        }
    },
    { key: "detected_at", label: "Waktu Deteksi", sortable: true },
];

export default function RecentThreatsTable() {
    return (
        <DataTable
            data={dummyThreats}
            columns={columns}
            searchable
            searchKeys={["site_name", "url", "category"]}
            searchPlaceholder="Cari ancaman..."
            defaultRowsPerPage={5}
            noWrapper
        />
    );
}
