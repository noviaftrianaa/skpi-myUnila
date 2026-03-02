"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { FiPlus } from "react-icons/fi";
import SiteTable from "./components/SiteTable";
import SiteFormModal from "./components/SiteFormModal";
import { siteService, Site } from "@/lib/services/webmon/siteService";
import { toast } from "react-hot-toast";

export default function SitesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSites = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await siteService.listSites({ limit: 200 });
            setSites(res.data || []);
        } catch {
            toast.error("Gagal memuat data situs");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchSites(); }, [fetchSites]);

    const handleCreate = () => {
        setSelectedSite(null);
        setIsModalOpen(true);
    };

    const handleEdit = (site: Site) => {
        setSelectedSite(site);
        setIsModalOpen(true);
    };

    const handleSync = async (site: Site) => {
        try {
            await siteService.syncNow(site.id);
            toast.success(`Sync ${site.name} berhasil`);
        } catch {
            toast.error(`Sync ${site.name} gagal`);
        }
    };

    const handleDelete = async (site: Site) => {
        if (!confirm(`Hapus situs "${site.name}"?`)) return;
        try {
            await siteService.deleteSite(site.id);
            toast.success("Situs dihapus");
            fetchSites();
        } catch {
            toast.error("Gagal menghapus situs");
        }
    };

    const handleModalClose = (refresh?: boolean) => {
        setIsModalOpen(false);
        if (refresh) fetchSites();
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
                    <SiteTable
                        data={sites}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onSync={handleSync}
                        onDelete={handleDelete}
                    />
                </CardBody>
            </Card>

            <SiteFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                initialData={selectedSite}
            />
        </div>
    );
}
