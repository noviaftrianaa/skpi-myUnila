"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardBody, CardHeader, Divider, Chip, Skeleton, Pagination, Select, SelectItem, Button, Checkbox } from "@heroui/react";
import { FiExternalLink, FiRefreshCw, FiRotateCw } from "react-icons/fi";
import { gscService, GSCRemovalLog } from "@/lib/services/webmon/gscService";
import { toast } from "react-hot-toast";

const STATUS_CONFIG: Record<string, { label: string; color: "success" | "warning" | "danger" | "default" | "primary" }> = {
    submitted: { label: "Disubmit", color: "primary" },
    success:   { label: "Berhasil", color: "success" },
    failed:    { label: "Gagal", color: "danger" },
    rate_limited: { label: "Rate Limit", color: "warning" },
    skipped:   { label: "Dilewati", color: "default" },
};

const RETRYABLE_STATUSES = new Set(["failed", "rate_limited", "skipped"]);

interface GSCRemovalTableProps {
    refreshTrigger?: number;
}

export default function GSCRemovalTable({ refreshTrigger }: GSCRemovalTableProps) {
    const [logs, setLogs] = useState<GSCRemovalLog[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [retrying, setRetrying] = useState(false);
    const limit = 15;

    const fetchLogs = useCallback(() => {
        setLoading(true);
        setSelected(new Set());
        gscService.getLogs({ page, limit, status: statusFilter || undefined })
            .then(({ data, total }) => { setLogs(data); setTotal(total); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [page, statusFilter, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const retryableLogs = logs.filter((l) => RETRYABLE_STATUSES.has(l.status));
    const allRetryableSelected = retryableLogs.length > 0 && retryableLogs.every((l) => selected.has(l.id));

    const toggleSelect = (id: number) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (allRetryableSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(retryableLogs.map((l) => l.id)));
        }
    };

    const handleRetrySelected = async () => {
        const toRetry = logs.filter((l) => selected.has(l.id) && RETRYABLE_STATUSES.has(l.status));
        if (toRetry.length === 0) return;

        setRetrying(true);
        let successCount = 0;
        let failCount = 0;

        for (const log of toRetry) {
            try {
                await gscService.removeURL({
                    threat_id: log.threat_id,
                    url: log.url,
                    action: log.action,
                });
                successCount++;
            } catch {
                failCount++;
            }
        }

        if (successCount > 0) toast.success(`${successCount} URL berhasil di-resync`);
        if (failCount > 0) toast.error(`${failCount} URL gagal di-resync`);

        setRetrying(false);
        setSelected(new Set());
        fetchLogs();
    };

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <Card className="shadow-sm border border-gray-200 bg-white">
            <CardHeader className="px-4 pt-4 pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm">History URL Removal</h3>
                        <p className="text-xs text-gray-500">Log request penghapusan URL dari Google Search</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selected.size > 0 && (
                            <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<FiRotateCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />}
                                isLoading={retrying}
                                onPress={handleRetrySelected}
                            >
                                Resync ({selected.size})
                            </Button>
                        )}
                        <Select
                            size="sm"
                            placeholder="Semua status"
                            className="w-36"
                            selectedKeys={statusFilter ? [statusFilter] : []}
                            onSelectionChange={(keys) => {
                                setStatusFilter(Array.from(keys)[0] as string ?? "");
                                setPage(1);
                            }}
                        >
                            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                <SelectItem key={k}>{v.label}</SelectItem>
                            ))}
                        </Select>
                        <button onClick={fetchLogs} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-0">
                {loading ? (
                    <div className="p-4 space-y-3">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                    </div>
                ) : logs.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">
                        Belum ada log URL removal
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-3 py-2.5 w-10">
                                        {retryableLogs.length > 0 && (
                                            <Checkbox
                                                size="sm"
                                                isSelected={allRetryableSelected}
                                                isIndeterminate={selected.size > 0 && !allRetryableSelected}
                                                onValueChange={toggleSelectAll}
                                            />
                                        )}
                                    </th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">URL</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-24">Aksi</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-28">Status</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-36">Disubmit</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {logs.map((log) => {
                                    const sc = STATUS_CONFIG[log.status] ?? { label: log.status, color: "default" as const };
                                    const canRetry = RETRYABLE_STATUSES.has(log.status);
                                    return (
                                        <tr key={log.id} className={`hover:bg-gray-50 ${selected.has(log.id) ? "bg-blue-50/50" : ""}`}>
                                            <td className="px-3 py-3">
                                                {canRetry ? (
                                                    <Checkbox
                                                        size="sm"
                                                        isSelected={selected.has(log.id)}
                                                        onValueChange={() => toggleSelect(log.id)}
                                                    />
                                                ) : (
                                                    <span className="w-4 h-4 block" />
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-gray-900 break-all max-w-xs line-clamp-2">{log.url}</div>
                                                {log.error_message && (
                                                    <div className="text-xs text-red-500 mt-0.5">{log.error_message}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-gray-600">
                                                    {log.action === "URL_DELETED" ? "Dihapus" : "Diperbarui"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Chip size="sm" color={sc.color} variant="flat">{sc.label}</Chip>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {log.submitted_at
                                                    ? new Date(log.submitted_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
                                                    : "-"}
                                            </td>
                                            <td className="px-4 py-3">
                                                <a href={log.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-600">
                                                    <FiExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center py-4 border-t border-gray-100">
                        <Pagination total={totalPages} page={page} onChange={setPage} size="sm" />
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
