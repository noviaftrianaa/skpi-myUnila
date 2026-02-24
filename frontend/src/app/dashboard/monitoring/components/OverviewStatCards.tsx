
"use client";

import { FiGlobe, FiCheckCircle, FiAlertTriangle, FiActivity, FiSearch } from "react-icons/fi";
import StatCard from "./StatCard";

export default function OverviewStatCards() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard
                title="Total Situs"
                value={45}
                icon={<FiGlobe className="w-6 h-6 text-white" />}
                color="blue"
                trend={{ value: 5.2, label: "bulan ini" }}
            />
            <StatCard
                title="Situs Online"
                value={42}
                icon={<FiCheckCircle className="w-6 h-6 text-white" />}
                color="green"
                trend={{ value: 2.1, label: "minggu ini" }}
            />
            <StatCard
                title="Terindikasi Judol"
                value={2}
                icon={<FiAlertTriangle className="w-6 h-6 text-white" />}
                color="red"
                description="Perlu penanganan segera"
            />
            <StatCard
                title="Ancaman Baru"
                value={8}
                icon={<FiActivity className="w-6 h-6 text-white" />}
                color="yellow" // StatCard supports 'yellow' which maps to orange/amber gradient
                subtitle="Ditemukan 24 jam terakhir"
            />
            <StatCard
                title="Total Scan"
                value={1250}
                icon={<FiSearch className="w-6 h-6 text-white" />}
                color="purple"
                trend={{ value: 12.5, label: "dari kemarin" }}
            />
        </div>
    );
}
