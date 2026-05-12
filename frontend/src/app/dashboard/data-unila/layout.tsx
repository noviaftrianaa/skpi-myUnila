"use client";

import { useRequireAppAccess } from "@/lib/hoc/withAuth";
import AccessDenied from "@/shared/components/auth/AccessDenied";
import ScopeGuard from "@/shared/components/dashboard/ScopeGuard";
import { Spinner } from "@heroui/react";
import { useCallback, useState } from "react";

// App key untuk Data Unila (slug di man_akses.aplikasi)
const APP_KEY = "data-unila";

export default function DataUnilaLayout({
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
        appName="Data Unila"
        onRoleChange={handleRoleChange}
      />
    );
  }

  return <ScopeGuard>{children}</ScopeGuard>;
}
