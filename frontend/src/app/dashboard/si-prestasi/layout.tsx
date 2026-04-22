"use client";

import { useRequireAppAccess } from "@/lib/hoc/withAuth";
import AccessDenied from "@/shared/components/auth/AccessDenied";
import { useCallback, useState } from "react";

const APP_KEY = "si-prestasi";

export default function SimPrestasiLayout({ children }: { children: React.ReactNode }) {
  const [, setRecheckKey] = useState(0);

  const { isLoading, hasAccess, requiresContextSelection, message } = useRequireAppAccess({
    appKey: APP_KEY,
    showAccessDenied: true,
  });

  const handleRoleChange = useCallback(() => {
    setRecheckKey(p => p + 1);
    window.location.reload();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-600">Memeriksa akses SI Prestasi...</p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    return (
      <AccessDenied
        message={message}
        requiresContextSelection={requiresContextSelection}
        appName="SI Prestasi"
        onRoleChange={handleRoleChange}
      />
    );
  }

  return <>{children}</>;
}
