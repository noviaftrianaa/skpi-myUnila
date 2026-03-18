"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";

export default function ProjectManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();
  return <>{children}</>;
}
