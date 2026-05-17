"use client";

// Layout shell untuk Blog Platform dashboard.
// Pattern: NO sidebar (writer-focused, mirip Medium/Substack/Notion editor).
// Top horizontal nav dgn module sections + admin section.
//
// MVP scaffolding pakai dummy data — backend blog-service belum ready.
// Setelah backend deploy, integrate real API via service layer di lib/services/blog-platform/.

import BlogPlatformShell from "./_components/BlogPlatformShell";

export default function BlogPlatformLayout({ children }: { children: React.ReactNode }) {
  return <BlogPlatformShell>{children}</BlogPlatformShell>;
}
