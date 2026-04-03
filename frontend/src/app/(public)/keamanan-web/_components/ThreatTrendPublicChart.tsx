"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader, Divider, Skeleton } from "@heroui/react";
import { FiTrendingUp } from "react-icons/fi";
import dynamic from "next/dynamic";
import { publicService, DailySummary } from "@/lib/services/webmon/publicService";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
            Memuat grafik...
        </div>
    ),
});

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    } catch {
        return dateStr;
    }
}

export default function ThreatTrendPublicChart() {
    const [summaries, setSummaries] = useState<DailySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        publicService.getDailySummary(30)
            .then(setSummaries)
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const option = useMemo(() => {
        const sorted = [...summaries].sort(
            (a, b) => new Date(a.summary_date).getTime() - new Date(b.summary_date).getTime()
        );
        const dates = sorted.map((s) => formatDate(s.summary_date));
        const newThreats = sorted.map((s) => s.new_threats_count);
        const resolved = sorted.map((s) => s.resolved_threats_count);

        return {
            tooltip: {
                trigger: "axis",
                formatter: (params: Array<{ seriesName: string; value: number; name: string }>) => {
                    const date = params[0]?.name ?? "";
                    const lines = params.map((p) => `<div style="display:flex;justify-content:space-between;gap:16px"><span>${p.seriesName}</span><strong>${p.value}</strong></div>`).join("");
                    return `<div style="padding:8px"><div style="font-weight:600;margin-bottom:6px">${date}</div>${lines}</div>`;
                },
            },
            legend: {
                data: ["Ancaman Baru", "Diselesaikan"],
                bottom: 0,
                textStyle: { color: "#6b7280", fontSize: 12 },
            },
            grid: { left: "3%", right: "4%", bottom: "15%", top: "8%", containLabel: true },
            xAxis: {
                type: "category",
                data: dates,
                boundaryGap: false,
                axisLabel: { color: "#9ca3af", fontSize: 10, interval: Math.max(0, Math.floor(dates.length / 7) - 1) },
                axisLine: { lineStyle: { color: "#e5e7eb" } },
            },
            yAxis: {
                type: "value",
                minInterval: 1,
                axisLabel: { color: "#9ca3af", fontSize: 11 },
                splitLine: { lineStyle: { color: "#f3f4f6" } },
            },
            series: [
                {
                    name: "Ancaman Baru",
                    type: "line",
                    data: newThreats,
                    smooth: 0.3,
                    symbol: "circle",
                    symbolSize: 6,
                    lineStyle: { width: 2.5, color: "#ef4444" },
                    itemStyle: { color: "#ef4444", borderWidth: 2, borderColor: "#fff" },
                    areaStyle: {
                        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#ef444430" }, { offset: 1, color: "#ef444408" }] },
                    },
                },
                {
                    name: "Diselesaikan",
                    type: "line",
                    data: resolved,
                    smooth: 0.3,
                    symbol: "circle",
                    symbolSize: 6,
                    lineStyle: { width: 2.5, color: "#10b981" },
                    itemStyle: { color: "#10b981", borderWidth: 2, borderColor: "#fff" },
                    areaStyle: {
                        color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "#10b98130" }, { offset: 1, color: "#10b98108" }] },
                    },
                },
            ],
            animationDuration: 1200,
        };
    }, [summaries]);

    return (
        <section className="py-6 bg-white">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <Card className="shadow-sm border border-gray-200">
                        <CardHeader className="px-4 pt-4 pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                                    <FiTrendingUp className="w-5 h-5 text-orange-500" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Tren Ancaman 30 Hari Terakhir</h2>
                                    <p className="text-xs text-gray-500">Deteksi konten ilegal baru vs. yang berhasil diselesaikan</p>
                                </div>
                            </div>
                        </CardHeader>
                        <Divider />
                        <CardBody className="px-2 py-4">
                            {loading ? (
                                <Skeleton className="h-[260px] w-full rounded-lg" />
                            ) : error || summaries.length === 0 ? (
                                <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">
                                    {error ? "Data grafik tidak tersedia saat ini." : "Belum ada data dalam 30 hari terakhir."}
                                </div>
                            ) : (
                                <ReactECharts option={option} style={{ height: 260, width: "100%" }} opts={{ renderer: "canvas" }} />
                            )}
                        </CardBody>
                    </Card>
                </div>
            </div>
        </section>
    );
}
