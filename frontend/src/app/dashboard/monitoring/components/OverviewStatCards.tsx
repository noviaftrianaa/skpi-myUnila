
"use client";

import { useEffect, useState } from "react";
import { FiGlobe, FiCheckCircle, FiAlertTriangle, FiActivity, FiKey } from "react-icons/fi";
import StatCard from "./StatCard";
import { publicService, MonitoringStats } from "@/lib/services/webmon/publicService";

export default function OverviewStatCards() {
    const [stats, setStats] = useState<MonitoringStats | null>(null);

    useEffect(() => {
        publicService.getStats().then(setStats).catch(() => {});
    }, []);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard
                title="Total Situs"
                value={stats?.total_sites ?? "-"}
                icon={<FiGlobe className="w-6 h-6 text-white" />}
                color="blue"
            />
            <StatCard
                title="Situs Aktif"
                value={stats?.active_sites ?? "-"}
                icon={<FiCheckCircle className="w-6 h-6 text-white" />}
                color="green"
            />
            <StatCard
                title="Ancaman Aktif"
                value={stats?.active_threats ?? "-"}
                icon={<FiAlertTriangle className="w-6 h-6 text-white" />}
                color="red"
                description="Perlu penanganan segera"
            />
            <StatCard
                title="Total Ancaman"
                value={stats?.total_threats ?? "-"}
                icon={<FiActivity className="w-6 h-6 text-white" />}
                color="yellow"
                subtitle="Semua waktu"
            />
            <StatCard
                title="Keywords Aktif"
                value={stats?.total_keywords ?? "-"}
                icon={<FiKey className="w-6 h-6 text-white" />}
                color="purple"
            />
        </div>
    );
}
