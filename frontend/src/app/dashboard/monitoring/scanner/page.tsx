"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Button, Card, CardBody,
    Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Autocomplete, AutocompleteItem,
    Spinner,
} from "@heroui/react";
import { FiPlay, FiGlobe, FiZap, FiSearch } from "react-icons/fi";
import CrawlJobTable from "./components/CrawlJobTable";
import CrawlSessionList from "./components/CrawlSessionList";
import { crawlerService, CrawlJob } from "@/lib/services/webmon/crawlerService";
import { siteService, Site } from "@/lib/services/webmon/siteService";
import { toast } from "react-hot-toast";

export default function ScannerPage() {
    const [isScanOpen, setIsScanOpen] = useState(false);
    const [jobs, setJobs] = useState<CrawlJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<CrawlJob | null>(null);

    // Single-site scan state
    const [sites, setSites] = useState<Site[]>([]);
    const [sitesLoading, setSitesLoading] = useState(false);
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [scanLoading, setScanLoading] = useState<string | null>(null);

    const fetchJobs = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await crawlerService.listJobs({ limit: 50 });
            setJobs(res.items || []);
        } catch {
            toast.error("Gagal memuat crawl jobs");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const loadSites = useCallback(async () => {
        if (sites.length > 0) return;
        setSitesLoading(true);
        try {
            const res = await siteService.listSites({ status: "active", limit: 500 });
            setSites(res.items || []);
        } catch {
            toast.error("Gagal memuat daftar situs");
        } finally {
            setSitesLoading(false);
        }
    }, [sites.length]);

    const openScanModal = () => {
        setIsScanOpen(true);
        loadSites();
    };

    const handleScanAll = async () => {
        setScanLoading("full");
        try {
            await crawlerService.createJob({ job_type: "full" });
            toast.success("Scan semua situs dimulai!");
            setIsScanOpen(false);
            fetchJobs();
        } catch {
            toast.error("Gagal memulai scan");
        } finally {
            setScanLoading(null);
        }
    };

    const handleScanSingle = async () => {
        if (!selectedSiteId) {
            toast.error("Pilih situs terlebih dahulu");
            return;
        }
        setScanLoading("single");
        try {
            await crawlerService.createJob({ job_type: "single", site_id: selectedSiteId });
            const site = sites.find(s => s.id === selectedSiteId);
            toast.success(`Scan dimulai untuk ${site?.name || site?.url || "situs"}`);
            setIsScanOpen(false);
            setSelectedSiteId(null);
            fetchJobs();
        } catch {
            toast.error("Gagal memulai scan");
        } finally {
            setScanLoading(null);
        }
    };

    const handleDeleteJob = async (job: CrawlJob) => {
        if (!confirm(`Hapus job #${job.id} (${job.job_type})?`)) return;
        try {
            await crawlerService.deleteJob(job.id);
            toast.success(`Job #${job.id} dihapus`);
            if (selectedJob?.id === job.id) setSelectedJob(null);
            fetchJobs();
        } catch {
            toast.error("Gagal menghapus job");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pemindaian & Crawling</h1>
                    <p className="text-sm text-gray-500">
                        Pindai situs web untuk mendeteksi konten terlarang (judi online, dll).
                    </p>
                </div>
                <Button
                    color="primary"
                    variant="solid"
                    radius="md"
                    size="md"
                    startContent={<FiSearch className="w-4 h-4" />}
                    className="font-semibold shadow-md"
                    onPress={openScanModal}
                >
                    Mulai Scan
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 h-full rounded-xl" radius="lg">
                        <CardBody className="p-0">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-lg font-bold">Riwayat Scan ({jobs.length})</h3>
                            </div>
                            <CrawlJobTable
                                data={jobs}
                                isLoading={isLoading}
                                onSelectJob={setSelectedJob}
                                onDelete={handleDeleteJob}
                                selectedJobId={selectedJob?.id}
                            />
                        </CardBody>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <CrawlSessionList
                        selectedJob={selectedJob}
                        jobs={jobs}
                        onSelectJob={setSelectedJob}
                    />
                </div>
            </div>

            {/* Scan Modal */}
            <Modal
                isOpen={isScanOpen}
                onClose={() => { setIsScanOpen(false); setSelectedSiteId(null); }}
                size="lg"
                backdrop="blur"
                radius="lg"
                classNames={{
                    backdrop: "bg-black/50 backdrop-blur-sm",
                    base: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl",
                    header: "border-b border-gray-100 dark:border-gray-800 px-6 py-4",
                    body: "px-6 py-5",
                    footer: "border-t border-gray-100 dark:border-gray-800 px-6 py-4",
                    closeButton: "hover:bg-gray-100 dark:hover:bg-gray-800",
                }}
            >
                <ModalContent>
                    {() => (
                    <>
                    <ModalHeader className="flex items-center gap-2">
                        <FiSearch className="w-5 h-5 text-blue-500" />
                        <span className="text-base font-bold">Mulai Scan</span>
                    </ModalHeader>
                    <ModalBody className="space-y-5">
                        {/* Option 1: Scan All Sites */}
                        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                    <FiGlobe className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Scan Semua Situs</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Crawl seluruh situs aktif yang terdaftar. Cocok untuk pemeriksaan rutin berkala.
                                    </p>
                                </div>
                                <Button
                                    color="primary"
                                    radius="md"
                                    size="sm"
                                    className="font-medium flex-shrink-0"
                                    startContent={<FiPlay className="w-3.5 h-3.5" />}
                                    isLoading={scanLoading === "full"}
                                    isDisabled={scanLoading !== null}
                                    onPress={handleScanAll}
                                >
                                    Jalankan
                                </Button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            <span className="text-xs text-gray-400 font-medium">ATAU</span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Option 2: Scan Single Site */}
                        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 hover:border-orange-300 dark:hover:border-orange-600 transition-colors">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                                    <FiZap className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Scan Situs Tertentu</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Pilih satu situs untuk di-scan. Cocok untuk verifikasi cepat atau investigasi situs tertentu.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                {sitesLoading ? (
                                    <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                                        <Spinner size="sm" />
                                        <span>Memuat daftar situs...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Autocomplete
                                            label="Pilih Situs"
                                            placeholder="Ketik untuk mencari situs..."
                                            size="sm"
                                            radius="md"
                                            variant="bordered"
                                            className="flex-1"
                                            selectedKey={selectedSiteId}
                                            onSelectionChange={(key) => setSelectedSiteId(key as string || null)}
                                            popoverProps={{
                                                classNames: {
                                                    content: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl",
                                                },
                                            }}
                                            listboxProps={{
                                                className: "text-gray-800 dark:text-gray-200",
                                            }}
                                        >
                                            {sites.map((site) => (
                                                <AutocompleteItem key={site.id} textValue={`${site.name} — ${site.url}`}>
                                                    <div>
                                                        <p className="text-sm font-medium">{site.name}</p>
                                                        <p className="text-xs text-gray-400">{site.url}</p>
                                                    </div>
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                        <Button
                                            color="warning"
                                            radius="md"
                                            size="sm"
                                            className="font-medium flex-shrink-0 text-white"
                                            startContent={<FiPlay className="w-3.5 h-3.5" />}
                                            isLoading={scanLoading === "single"}
                                            isDisabled={!selectedSiteId || scanLoading !== null}
                                            onPress={handleScanSingle}
                                        >
                                            Jalankan
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" radius="md" size="sm" onPress={() => { setIsScanOpen(false); setSelectedSiteId(null); }}>
                            Batal
                        </Button>
                    </ModalFooter>
                    </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
