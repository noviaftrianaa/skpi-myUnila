"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Card, CardBody, CardHeader, Divider, Chip, Skeleton,
    Pagination, Button, Progress, Spinner,
} from "@heroui/react";
import {
    FiSettings, FiRefreshCw, FiSearch, FiAlertCircle,
    FiCheckCircle, FiExternalLink, FiClock, FiActivity,
    FiSave, FiEdit2,
} from "react-icons/fi";
import { gscService, GSCQuota, GSCRemovalLog } from "@/lib/services/webmon/gscService";
import { crawlerService, CrawlStats } from "@/lib/services/webmon/crawlerService";
import { settingsService, MonitoringSetting } from "@/lib/services/webmon/settingsService";
import { toast } from "react-hot-toast";

/* ──────── GSC Quota Section ──────── */
function GSCQuotaSection() {
    const [quota, setQuota] = useState<GSCQuota | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetch = () => {
        setLoading(true);
        setError(false);
        gscService.getQuota()
            .then(setQuota)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetch(); }, []);

    const usedPct = quota ? Math.round((quota.used_today / quota.daily_limit) * 100) : 0;

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            <CardHeader className="px-5 pt-5 pb-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FiSearch className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Google Search Console API</h3>
                            <p className="text-[10px] text-gray-500">URL Removal — Quota harian</p>
                        </div>
                    </div>
                    <button onClick={fetch} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                        <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-5">
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4 rounded-lg" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-amber-600 text-sm py-4">
                        <FiAlertCircle className="w-5 h-5" />
                        <div>
                            <p className="font-medium">GSC API belum dikonfigurasi</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Set <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">GSC_ENABLED=true</code> dan
                                sediakan service account JSON di backend.
                            </p>
                        </div>
                    </div>
                ) : quota ? (
                    <div className="space-y-4">
                        <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{quota.used_today}</span>
                            <span className="text-lg text-gray-400 mb-1">/ {quota.daily_limit}</span>
                        </div>

                        <Progress
                            value={usedPct}
                            color={usedPct >= 90 ? "danger" : usedPct >= 70 ? "warning" : "success"}
                            size="md"
                            className="max-w-full"
                            aria-label="Quota usage"
                        />

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-blue-600">{quota.used_today}</div>
                                <div className="text-[10px] text-gray-500">Terpakai</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-green-600">{quota.remaining}</div>
                                <div className="text-[10px] text-gray-500">Tersisa</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-center">
                                <div className="text-lg font-bold text-gray-600">{quota.daily_limit}</div>
                                <div className="text-[10px] text-gray-500">Limit/Hari</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <Chip
                                size="sm"
                                color={quota.quota_exceeded ? "danger" : "success"}
                                variant="flat"
                                startContent={quota.quota_exceeded
                                    ? <FiAlertCircle className="w-3 h-3" />
                                    : <FiCheckCircle className="w-3 h-3" />}
                            >
                                {quota.quota_exceeded ? "Quota habis hari ini" : "Quota tersedia"}
                            </Chip>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <FiClock className="w-3 h-3" />
                                Reset: {quota.reset_at ? new Date(quota.reset_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                            </span>
                        </div>
                    </div>
                ) : null}
            </CardBody>
        </Card>
    );
}

/* ──────── Crawler Stats Section ──────── */
function CrawlerStatsSection() {
    const [stats, setStats] = useState<CrawlStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        crawlerService.getStats()
            .then(setStats)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            <CardBody className="p-5 space-y-3">
                <Skeleton className="h-6 w-40 rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
            </CardBody>
        </Card>
    );

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            <CardHeader className="px-5 pt-5 pb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <FiActivity className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white">Statistik Crawler</h3>
                        <p className="text-[10px] text-gray-500">Ringkasan kegiatan crawling</p>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats?.total_jobs ?? 0}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Total Jobs</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-amber-600">{stats?.running_jobs ?? 0}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Berjalan</div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-indigo-600">{stats?.total_sessions ?? 0}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Sesi</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-green-600">{stats?.total_pages ?? 0}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Halaman</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-red-600">{stats?.total_threats ?? 0}</div>
                        <div className="text-[10px] text-gray-500 mt-1">Ancaman</div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

/* ──────── Recent GSC Logs Section ──────── */
const STATUS_CONFIG: Record<string, { label: string; color: "success" | "warning" | "danger" | "default" | "primary" }> = {
    submitted: { label: "Disubmit", color: "primary" },
    success:   { label: "Berhasil", color: "success" },
    failed:    { label: "Gagal", color: "danger" },
    rate_limited: { label: "Rate Limit", color: "warning" },
    skipped:   { label: "Dilewati", color: "default" },
};

function RecentGSCLogs() {
    const [logs, setLogs] = useState<GSCRemovalLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const limit = 10;

    const fetchLogs = useCallback(() => {
        setLoading(true);
        gscService.getLogs({ page, limit })
            .then(({ data, total }) => { setLogs(data); setTotal(total); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            <CardHeader className="px-5 pt-5 pb-2">
                <div className="flex items-center justify-between w-full">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Log URL Removal Terbaru</h3>
                    <button onClick={fetchLogs} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                        <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
                {loading ? (
                    <div className="p-4 space-y-2">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-10 text-center text-gray-400 text-sm">
                        Belum ada log URL removal.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">URL</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-28">Status</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-36">Waktu</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {logs.map((log) => {
                                    const sc = STATUS_CONFIG[log.status] ?? { label: log.status, color: "default" as const };
                                    return (
                                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                            <td className="px-4 py-2.5">
                                                <div className="text-xs text-gray-900 dark:text-gray-200 break-all max-w-sm line-clamp-1">{log.url}</div>
                                                {log.error_message && (
                                                    <div className="text-[10px] text-red-500 mt-0.5">{log.error_message}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <Chip size="sm" color={sc.color} variant="flat" className="text-[10px]">{sc.label}</Chip>
                                            </td>
                                            <td className="px-4 py-2.5 text-xs text-gray-500">
                                                {log.submitted_at
                                                    ? new Date(log.submitted_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                                                    : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="flex justify-center py-3 border-t border-gray-100 dark:border-gray-700">
                        <Pagination total={totalPages} page={page} onChange={setPage} size="sm" />
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

/* ──────── DB Settings Section ──────── */
const GROUP_LABELS: Record<string, string> = {
    gsc: "Google Search Console",
    crawler: "Crawler",
    alert: "Notifikasi",
    general: "Umum",
};

function DBSettingsSection() {
    const [settings, setSettings] = useState<MonitoringSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchSettings = useCallback(() => {
        setLoading(true);
        settingsService.listSettings()
            .then(setSettings)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    const startEdit = (s: MonitoringSetting) => {
        setEditingId(s.id);
        setEditValue(s.setting_value ?? "");
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditValue("");
    };

    const saveEdit = async (id: number) => {
        setSaving(true);
        try {
            await settingsService.updateSetting(id, editValue || null);
            toast.success("Setting disimpan");
            setEditingId(null);
            fetchSettings();
        } catch {
            toast.error("Gagal menyimpan setting");
        } finally {
            setSaving(false);
        }
    };

    // Group by key_group
    const grouped = settings.reduce<Record<string, MonitoringSetting[]>>((acc, s) => {
        (acc[s.key_group] = acc[s.key_group] || []).push(s);
        return acc;
    }, {});

    return (
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-xl">
            <CardHeader className="px-5 pt-5 pb-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <FiSettings className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white">Konfigurasi Sistem</h3>
                            <p className="text-[10px] text-gray-500">Pengaturan dari database monitoring.settings</p>
                        </div>
                    </div>
                    <button onClick={fetchSettings} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                        <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-5">
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                    </div>
                ) : settings.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 text-sm">
                        Belum ada pengaturan. Jalankan seed SQL untuk mengisi data awal.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(grouped).map(([group, items]) => (
                            <div key={group}>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    {GROUP_LABELS[group] ?? group}
                                </h4>
                                <div className="space-y-2">
                                    {items.map((s) => (
                                        <div key={s.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg group">
                                            <code className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded shrink-0 mt-0.5">
                                                {s.setting_key}
                                            </code>
                                            <div className="flex-1 min-w-0">
                                                {editingId === s.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="flex-1 text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            autoFocus
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") saveEdit(s.id);
                                                                if (e.key === "Escape") cancelEdit();
                                                            }}
                                                        />
                                                        <Button size="sm" color="primary" isIconOnly isLoading={saving}
                                                            onPress={() => saveEdit(s.id)} className="min-w-6 h-7">
                                                            <FiSave className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="sm" variant="light" isIconOnly onPress={cancelEdit} className="min-w-6 h-7">
                                                            ✕
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-900 dark:text-gray-200 break-all">
                                                            {s.setting_value ?? <span className="text-gray-400 italic">kosong</span>}
                                                        </span>
                                                        {s.is_sensitive !== 1 && (
                                                            <button
                                                                onClick={() => startEdit(s)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-opacity"
                                                            >
                                                                <FiEdit2 className="w-3 h-3" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {s.description && (
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{s.description}</p>
                                                )}
                                            </div>
                                            {s.is_sensitive === 1 && (
                                                <Chip size="sm" variant="flat" color="warning" className="text-[10px] shrink-0">sensitif</Chip>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );
}

/* ──────── Main Settings Page ──────── */
export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FiSettings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Pengaturan Monitoring</h1>
                    <p className="text-sm text-gray-500">Kelola konfigurasi Google API, crawler, dan monitoring service</p>
                </div>
            </div>

            {/* GSC Quota + Crawler Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GSCQuotaSection />
                <CrawlerStatsSection />
            </div>

            {/* DB Settings */}
            <DBSettingsSection />

            {/* Recent GSC logs */}
            <RecentGSCLogs />
        </div>
    );
}
