"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import KeywordTable from "./components/KeywordTable";
import KeywordFormModal from "./components/KeywordFormModal";
import { keywordService, Keyword } from "@/lib/services/webmon/keywordService";
import { toast } from "react-hot-toast";

export default function KeywordsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchKeywords = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await keywordService.listKeywords({ limit: 200 });
            setKeywords(res.data || []);
        } catch {
            toast.error("Gagal memuat keywords");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchKeywords(); }, [fetchKeywords]);

    const handleCreate = () => { setSelectedKeyword(null); setIsModalOpen(true); };
    const handleEdit = (kw: Keyword) => { setSelectedKeyword(kw); setIsModalOpen(true); };

    const handleDelete = async (kw: Keyword) => {
        if (!confirm(`Hapus keyword "${kw.keyword}"?`)) return;
        try {
            await keywordService.deleteKeyword(kw.id);
            toast.success("Keyword dihapus");
            fetchKeywords();
        } catch {
            toast.error("Gagal menghapus keyword");
        }
    };

    const handleToggleActive = async (kw: Keyword) => {
        try {
            await keywordService.updateKeyword(kw.id, { is_active: kw.is_active === 1 ? 0 : 1 });
            fetchKeywords();
        } catch {
            toast.error("Gagal update keyword");
        }
    };

    const handleResetDefault = async () => {
        if (!confirm("Reset ke keyword default? Data keyword yang ada akan diganti.")) return;
        try {
            await keywordService.seedDefault();
            toast.success("Keywords direset ke default (41 kata kunci)");
            fetchKeywords();
        } catch {
            toast.error("Gagal reset keywords");
        }
    };

    const handleModalClose = (refresh?: boolean) => {
        setIsModalOpen(false);
        if (refresh) fetchKeywords();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Konfigurasi Kata Kunci</h1>
                    <p className="text-sm text-gray-500">
                        Atur daftar kata kunci yang digunakan untuk mendeteksi ancaman ({keywords.length} keywords).
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="flat" radius="md" startContent={<FiRefreshCw />} className="font-medium"
                        onPress={handleResetDefault}>
                        Reset Default
                    </Button>
                    <Button
                        color="primary"
                        variant="solid"
                        radius="md"
                        startContent={<FiPlus />}
                        onPress={handleCreate}
                        className="font-medium shadow-sm"
                    >
                        Tambah Keyword
                    </Button>
                </div>
            </div>

            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl" radius="lg">
                <CardBody className="p-0">
                    <KeywordTable
                        data={keywords}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleActive={handleToggleActive}
                    />
                </CardBody>
            </Card>

            <KeywordFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                initialData={selectedKeyword}
            />
        </div>
    );
}
