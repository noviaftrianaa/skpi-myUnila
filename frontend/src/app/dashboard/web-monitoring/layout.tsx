"use client";

import { useRequireAppAccess } from "@/lib/hoc/withAuth";
import AccessDenied from "@/shared/components/auth/AccessDenied";
import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { Spinner } from "@heroui/react";
import { useCallback, useState } from "react";
import { FiShield } from "react-icons/fi";
import { monitoringMenuConfig } from "./config/menuConfig";

// App key untuk Web Monitoring (slug di man_akses.aplikasi)
const APP_KEY = "webmon";

export default function WebMonitoringLayout({
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
                appName="Web Monitoring"
                onRoleChange={handleRoleChange}
            />
        );
    }

    return (
        <DashboardLayoutWithDynamicMenu
            appName="Web Monitoring"
            appKey={APP_KEY}
            appIcon={<FiShield className="w-6 h-6 text-white" />}
            fallbackMenus={monitoringMenuConfig}
            pageTitle="Web Monitoring & Early Warning System"
        >
            {children}
        </DashboardLayoutWithDynamicMenu>
    );
}
