"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";

export default function SimBakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();
  return <>{children}</>;
}
