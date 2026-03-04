
"use client";

import DashboardLayoutWithDynamicMenu from "@/shared/components/dashboard/DashboardLayoutWithDynamicMenu";
import { monitoringMenuConfig } from "./config/menuConfig";
import { FiShield } from "react-icons/fi";

export default function MonitoringLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <DashboardLayoutWithDynamicMenu
            appName="Web Monitoring"
            appKey="webmon" // Identifier for RBAC (though we use fallback for now)
            appIcon={<FiShield className="w-6 h-6 text-white" />}
            fallbackMenus={monitoringMenuConfig}
            pageTitle="Web Monitoring & Early Warning System"
        >
            {children}
        </DashboardLayoutWithDynamicMenu>
    );
}
