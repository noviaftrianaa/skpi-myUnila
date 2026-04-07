
"use client";

import React, { useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import SiteTable from "./components/SiteTable";
import SiteFormModal from "./components/SiteFormModal";

export default function SitesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState<any>(null);

    const handleCreate = () => {
        setSelectedSite(null);
        setIsModalOpen(true);
    };

    const handleEdit = (site: any) => {
        setSelectedSite(site);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Situs</h1>
                    <p className="text-sm text-gray-500">
                        Kelola daftar situs yang dipantau oleh sistem.
                    </p>
                </div>
                <Button
                    color="primary"
                    variant="solid"
                    radius="md"
                    startContent={<FiPlus />}
                    onPress={handleCreate}
                    className="font-medium shadow-sm"
                >
                    Tambah Situs
                </Button>
            </div>

            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl" radius="lg">
                <CardBody className="p-0">
                    <SiteTable onEdit={handleEdit} />
                </CardBody>
            </Card>

            <SiteFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={selectedSite}
            />
        </div>
    );
}
