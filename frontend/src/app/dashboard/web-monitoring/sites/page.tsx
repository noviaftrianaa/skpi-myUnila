"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Card, CardBody, Progress, Spinner } from "@heroui/react";
import { FiPlus, FiActivity, FiCheckCircle, FiXCircle } from "react-icons/fi";
import SiteTable from "./components/SiteTable";
import SiteFormModal from "./components/SiteFormModal";
import { siteService, Site, SiteListFilter, CheckAllProgress } from "@/lib/services/webmon/siteService";
import { settingsService } from "@/lib/services/webmon/settingsService";
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
    const [waTemplate, setWaTemplate] = useState<string>("");
    const [checkProgress, setCheckProgress] = useState<CheckAllProgress | null>(null);
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>();
    const pollRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        settingsService.listSettings("alert")
            .then((items) => {
                const tpl = items.find((s) => s.setting_key === "whatsapp_template");
                if (tpl?.setting_value) setWaTemplate(tpl.setting_value);
            })
            .catch(() => {});
    }, []);

    // On mount: check if there's already a running check
    useEffect(() => {
        siteService.getCheckProgress()
            .then((p) => {
                if (p.status === "running" || p.status === "completed") {
                    setCheckProgress(p);
                    if (p.status === "running") startPolling();
                }
            })
            .catch(() => {});
        return () => stopPolling();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startPolling = () => {
        stopPolling();
        pollRef.current = setInterval(async () => {
            try {
                const p = await siteService.getCheckProgress();
                setCheckProgress(p);
                if (p.status === "completed") {
                    stopPolling();
                    fetchSites();
                    // Auto-hide after 10 seconds
                    setTimeout(() => setCheckProgress(null), 10000);
                } else if (p.status === "failed") {
                    stopPolling();
                    setTimeout(() => setCheckProgress(null), 10000);
                } else if (p.status === "idle") {
                    stopPolling();
                    setCheckProgress(null);
                }
            } catch {
                // ignore polling errors
            }
        }, 3000);
    };

    const stopPolling = () => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = undefined;
        }
    };

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
                toast("Check all sedang berjalan, tunggu hingga selesai...", { icon: "\u23F3" });
            } else {
                toast.success("Check all dimulai!");
            }
            // Start polling for progress
            startPolling();
            // Immediately fetch first progress
            const p = await siteService.getCheckProgress();
            setCheckProgress(p);
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

    const progressPct = checkProgress && checkProgress.total > 0
        ? Math.round((checkProgress.checked / checkProgress.total) * 100)
        : 0;

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
                        isDisabled={checkProgress?.status === "running"}
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

            {/* Check All Progress Bar */}
            {checkProgress && checkProgress.status !== "idle" && (
                <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl">
                    <CardBody className="p-4">
                        <div className="flex items-center gap-3">
                            {checkProgress.status === "running" && <Spinner size="sm" />}
                            {checkProgress.status === "completed" && <FiCheckCircle className="w-5 h-5 text-green-500 shrink-0" />}
                            {checkProgress.status === "failed" && <FiXCircle className="w-5 h-5 text-red-500 shrink-0" />}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                                        {checkProgress.message}
                                    </span>
                                    {checkProgress.status === "running" && checkProgress.total > 0 && (
                                        <span className="text-gray-500 font-mono shrink-0 ml-2">{progressPct}%</span>
                                    )}
                                </div>
                                {checkProgress.total > 0 && (
                                    <Progress
                                        value={checkProgress.status === "completed" ? 100 : progressPct}
                                        size="sm"
                                        color={checkProgress.status === "completed" ? "success" : checkProgress.status === "failed" ? "danger" : "primary"}
                                        className="max-w-full"
                                    />
                                )}
                            </div>
                        </div>
                        {checkProgress.total > 0 && (
                            <div className="flex gap-4 mt-2 text-xs ml-8">
                                <span className="text-green-600 dark:text-green-400">Online: {checkProgress.ok}</span>
                                <span className="text-red-600 dark:text-red-400">Gagal: {checkProgress.fail}</span>
                                <span className="text-gray-400">Total: {checkProgress.checked}/{checkProgress.total}</span>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}

            <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-xl" radius="lg">
                <CardBody className="p-0">
                    <SiteTable
                        data={sites}
                        isLoading={isLoading}
                        onEdit={handleEdit}
                        onSync={handleSync}
                        onDelete={handleDelete}
                        waTemplate={waTemplate}
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
