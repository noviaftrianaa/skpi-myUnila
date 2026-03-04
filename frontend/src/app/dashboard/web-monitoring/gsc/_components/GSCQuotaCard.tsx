"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, Skeleton, Chip } from "@heroui/react";
import { FiRefreshCw, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { gscService, GSCQuota } from "@/lib/services/webmon/gscService";

export default function GSCQuotaCard() {
    const [quota, setQuota] = useState<GSCQuota | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchQuota = () => {
        setLoading(true);
        gscService.getQuota()
            .then(setQuota)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchQuota(); }, []);

    const usedPct = quota ? Math.round((quota.used_today / quota.daily_limit) * 100) : 0;
    const barColor = usedPct >= 90 ? "bg-red-500" : usedPct >= 70 ? "bg-amber-500" : "bg-emerald-500";

    return (
        <Card className="shadow-sm border border-gray-200 bg-white">
            <CardBody className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Quota Google Search Console</h3>
                            <p className="text-xs text-gray-500">URL Removal API — Reset setiap hari</p>
                        </div>
                    </div>
                    <button onClick={fetchQuota} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                        <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4 rounded-lg" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-red-500 text-sm">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>GSC mungkin belum diaktifkan (GSC_ENABLED=false)</span>
                    </div>
                ) : quota ? (
                    <>
                        <div className="flex items-end gap-2 mb-3">
                            <span className="text-4xl font-bold text-gray-900">{quota.used_today}</span>
                            <span className="text-lg text-gray-400 mb-1">/ {quota.daily_limit}</span>
                            <span className="text-sm text-gray-500 mb-1">request hari ini</span>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                            <div
                                className={`h-2 rounded-full transition-all ${barColor}`}
                                style={{ width: `${Math.min(usedPct, 100)}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Chip
                                size="sm"
                                color={quota.quota_exceeded ? "danger" : "success"}
                                variant="flat"
                                startContent={quota.quota_exceeded
                                    ? <FiAlertCircle className="w-3 h-3" />
                                    : <FiCheckCircle className="w-3 h-3" />}
                            >
                                {quota.quota_exceeded ? "Quota habis" : `Sisa ${quota.remaining}`}
                            </Chip>
                            <span className="text-xs text-gray-400">
                                Reset: {quota.reset_at ? new Date(quota.reset_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"}
                            </span>
                        </div>
                    </>
                ) : null}
            </CardBody>
        </Card>
    );
}
