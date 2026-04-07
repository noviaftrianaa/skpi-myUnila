
"use client";

import React, { useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { FiPlus, FiUpload, FiRefreshCw } from "react-icons/fi";
import KeywordTable from "./components/KeywordTable";
import KeywordFormModal from "./components/KeywordFormModal";

export default function KeywordsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState<any>(null);

    const handleCreate = () => {
        setSelectedKeyword(null);
        setIsModalOpen(true);
    };

    const handleEdit = (keyword: any) => {
        setSelectedKeyword(keyword);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Konfigurasi Kata Kunci</h1>
                    <p className="text-sm text-gray-500">
                        Atur daftar kata kunci yang digunakan untuk mendeteksi ancaman.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="flat" radius="md" startContent={<FiRefreshCw />} className="font-medium">
                        Reset Default
                    </Button>
                    <Button variant="flat" radius="md" startContent={<FiUpload />} className="font-medium">
                        Import JSON
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
                    <KeywordTable onEdit={handleEdit} />
                </CardBody>
            </Card>

            <KeywordFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={selectedKeyword}
            />
        </div>
    );
}
