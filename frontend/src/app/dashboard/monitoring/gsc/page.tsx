"use client";

import { useState } from "react";
import { FiSearch, FiInfo } from "react-icons/fi";
import { GSCQuotaCard, GSCRemovalTable, GSCRemoveButton } from "./_components";

export default function GSCDashboardPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRemoveSuccess = () => {
        setRefreshTrigger((n) => n + 1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <FiSearch className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Google Search Console</h1>
                        <p className="text-sm text-gray-500">Kelola permintaan penghapusan URL dari hasil pencarian Google</p>
                    </div>
                </div>
                <GSCRemoveButton onSuccess={handleRemoveSuccess} />
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <FiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                    <strong>Cara kerja:</strong> Sistem secara otomatis mengirim permintaan penghapusan URL ke Google
                    ketika ancaman terdeteksi dengan skor ≥ threshold (default: 15). Anda juga bisa submit manual di sini.
                    Google Indexing API memiliki batas <strong>200 request/hari</strong> pada paket gratis.
                </div>
            </div>

            {/* Quota card */}
            <div className="max-w-md">
                <GSCQuotaCard />
            </div>

            {/* Removal logs table */}
            <GSCRemovalTable refreshTrigger={refreshTrigger} />
        </div>
    );
}
