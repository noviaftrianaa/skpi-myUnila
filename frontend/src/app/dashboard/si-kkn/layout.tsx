"use client";

import { useRequireAuth } from "@/lib/hoc/withAuth";

export default function SiKknLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireAuth();
  return <>{children}</>;
}
