"use client";

import { useRequireAppAccess } from "@/lib/hoc/withAuth";
import AccessDenied from "@/shared/components/auth/AccessDenied";
import { Spinner } from "@heroui/react";
import { useCallback, useState } from "react";

// App key for SIM-BAK
const APP_KEY = "sim-bak";

export default function SimBakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Force re-check counter
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

  // Callback when role is changed - forces re-check by updating state
  const handleRoleChange = useCallback(() => {
    setRecheckKey(prev => prev + 1);
    // Also reload the page to fully re-initialize
    window.location.reload();
  }, []);

  // Show loading state
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

  // Show access denied if no access
  if (hasAccess === false) {
    return (
      <AccessDenied
        message={message}
        requiresContextSelection={requiresContextSelection}
        appName="SI MBAK"
        onRoleChange={handleRoleChange}
      />
    );
  }

  // Render children if access granted
  return <>{children}</>;
}
