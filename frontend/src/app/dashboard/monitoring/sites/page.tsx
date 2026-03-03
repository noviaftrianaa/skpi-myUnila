"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { FiPlus, FiActivity } from "react-icons/fi";
import SiteTable from "./components/SiteTable";
import SiteFormModal from "./components/SiteFormModal";
import { siteService, Site, SiteListFilter } from "@/lib/services/webmon/siteService";
import { toast } from "react-hot-toast";

export default function SitesPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [sites, setSites] = useState<Site[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [search, setSearch] = useState("");
    const [isCheckingAll, setIsCheckingAll] = useState(false);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

    const fetchSites = useCallback(async (p?: number, limit?: number, q?: string) => {
        try {
            setIsLoading(true);
            const filter: SiteListFilter = {
                page: p ?? page,
                limit: limit ?? rowsPerPage,
            };
            if ((q ?? search).trim()) filter.search = (q ?? search).trim();
            const res = await siteService.listSites(filter);
            setSites(res.items || []);
            setTotalRecords(res.total);
        } catch {
            toast.error("Gagal memuat data situs");
        } finally {
            setIsLoading(false);
        }
    }, [page, rowsPerPage, search]);

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

    const handleCheckAll = async () => {
        setIsCheckingAll(true);
        try {
            const res = await siteService.checkAll();
            if (res.status === "running") {
                toast("Check all sedang berjalan, tunggu hingga selesai...", { icon: "⏳" });
            } else {
                toast.success("Check all dimulai! Proses berjalan di background (beberapa menit).");
            }
        } catch {
            toast.error("Gagal memulai check all");
        } finally {
            setIsCheckingAll(false);
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
                <div className="flex gap-2">
                    <Button
                        color="secondary"
                        variant="flat"
                        radius="md"
                        startContent={<FiActivity />}
                        onPress={handleCheckAll}
                        isLoading={isCheckingAll}
                        className="font-medium"
                    >
                        Check All Status
                    </Button>
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
            </div>

            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl" radius="lg">
                <CardBody className="p-0">
                    <SiteTable
                        data={sites}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onSync={handleSync}
                        onDelete={handleDelete}
                        serverSide
                        totalRecords={totalRecords}
                        currentPage={page}
                        onPageChange={(p) => { setPage(p); fetchSites(p, rowsPerPage, search); }}
                        onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(1); fetchSites(1, r, search); }}
                        onSearchChange={(q) => {
                            setSearch(q);
                            setPage(1);
                            if (searchTimeout.current) clearTimeout(searchTimeout.current);
                            searchTimeout.current = setTimeout(() => fetchSites(1, rowsPerPage, q), 400);
                        }}
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
