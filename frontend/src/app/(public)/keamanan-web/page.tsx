import { PageHero } from "@/shared/components";
import {
    SecurityStatusHero,
    MonitoringStatsRow,
    ThreatTrendPublicChart,
    SecurityTipsSection,
} from "./_components";

export const metadata = {
    title: "Keamanan Web | Universitas Lampung",
    description:
        "Pantau status keamanan website subdomain Universitas Lampung secara real-time. Sistem deteksi otomatis konten ilegal dan ancaman keamanan.",
};

export default function KeamananWebPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <PageHero
                title="Keamanan Web Unila"
                subtitle="Pemantauan Real-time Subdomain unila.ac.id"
                description="Sistem monitoring otomatis untuk mendeteksi konten ilegal dan ancaman keamanan pada seluruh website unit dan fakultas Universitas Lampung."
                gradient="from-red-600 via-rose-600 to-orange-500"
                icon={
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                }
            />

            {/* Status card overlay */}
            <SecurityStatusHero />

            {/* Stats grid */}
            <MonitoringStatsRow />

            {/* 30-day trend chart */}
            <ThreatTrendPublicChart />

            {/* Security tips */}
            <SecurityTipsSection />
        </div>
    );
}
