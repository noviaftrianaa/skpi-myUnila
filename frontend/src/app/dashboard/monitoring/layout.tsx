"use client";

import { useRequireAppAccess } from "@/lib/hoc/withAuth";
import AccessDenied from "@/shared/components/auth/AccessDenied";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Spinner } from "@heroui/react";
import { useCallback, useState } from "react";
import { FiActivity } from "react-icons/fi";
import { monitoringMenuConfig } from "./config/menuConfig";

// App key untuk Monitoring & Observability (Grafana/Loki/Prometheus dashboards)
const APP_KEY = "monitoring";

export default function MonitoringLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [recheckKey, setRecheckKey] = useState(0);

    const {
        isLoading,
        hasAccess,
        requiresContextSelection,
        message,
    } = useRequireAppAccess({
        appKey: APP_KEY,
        showAccessDenied: true,
    });

    const handleRoleChange = useCallback(() => {
        setRecheckKey(prev => prev + 1);
        window.location.reload();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <Spinner size="lg" color="primary" />
                    <p className="mt-4 text-gray-600">Memeriksa akses...</p>
                </div>
            </div>
        );
    }

    if (hasAccess === false) {
        return (
            <AccessDenied
                message={message}
                requiresContextSelection={requiresContextSelection}
                appName="Monitoring & Observability"
                onRoleChange={handleRoleChange}
            />
        );
    }

    return (
        <DashboardLayoutWithDynamicMenu
            appName="Monitoring & Observability"
            appKey={APP_KEY}
            appIcon={<FiActivity className="w-6 h-6 text-white" />}
            fallbackMenus={monitoringMenuConfig}
            pageTitle="System Monitoring & Observability"
        >
            {children}
        </DashboardLayoutWithDynamicMenu>
    );
}
