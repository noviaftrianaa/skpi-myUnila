"use client";

import React from "react";
import DataTable, { Column } from "@/shared/components/ui/DataTable";
import { Chip, Button, Tooltip } from "@heroui/react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Keyword } from "@/lib/services/webmon/keywordService";

interface KeywordTableProps {
    data: Keyword[];
    isLoading?: boolean;
    onEdit: (keyword: Keyword) => void;
    onDelete?: (keyword: Keyword) => void;
    onToggleActive?: (keyword: Keyword) => void;
}

export default function KeywordTable({ data, isLoading, onEdit, onDelete, onToggleActive }: KeywordTableProps) {
    const columns: Column<Keyword>[] = [
        {
            key: "keyword",
            label: "Kata Kunci",
            sortable: true,
            render: (item) => (
                <div className="font-mono text-sm">{item.keyword}</div>
            ),
        },
        {
            key: "category",
            label: "Kategori",
            sortable: true,
            render: (item) => <Chip size="sm" variant="flat">{item.category}</Chip>,
        },
        {
            key: "weight",
            label: "Bobot (1-10)",
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${item.weight >= 8 ? "bg-red-500" : item.weight >= 5 ? "bg-orange-500" : "bg-green-500"}`}
                            style={{ width: `${item.weight * 10}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500">{item.weight}</span>
                </div>
            ),
        },
        {
            key: "is_active",
            label: "Aktif",
            sortable: true,
            render: (item) => (
                <button
                    type="button"
                    role="switch"
                    aria-checked={item.is_active === 1}
                    aria-label="Toggle keyword active state"
                    onClick={() => onToggleActive?.(item)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 ${
                        item.is_active === 1 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                    }`}
                >
                    <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
                            item.is_active === 1 ? "translate-x-4" : "translate-x-0.5"
                        }`}
                    />
                </button>
            ),
        },
        {
            key: "actions",
            label: "Aksi",
            render: (item) => (
                <div className="flex items-center gap-1">
                    <Tooltip content="Edit">
                        <Button isIconOnly size="sm" variant="light" radius="full"
                            onPress={() => onEdit(item)}
                            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <FiEdit2 className="w-4 h-4" />
                        </Button>
                    </Tooltip>
                    <Tooltip content="Hapus">
                        <Button isIconOnly size="sm" variant="light" color="danger" radius="full"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onPress={() => onDelete?.(item)}>
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
            searchKeys={["keyword", "category"]}
            searchPlaceholder="Cari keyword..."
            noWrapper
            className="border-none shadow-none"
        />
    );
}
