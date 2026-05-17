"use client";

// Shell layout untuk Blog Platform — sidebar-based (konsisten dengan admin panel).
// Sidebar dimulai dari ProfileCard (no brand block — identity implisit dari URL/context).
// Mobile pakai MobileBrandBar yang menampilkan brand kecil + tombol Tulis.

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FiActivity, FiAward, FiBarChart2, FiCheckSquare, FiEdit3, FiExternalLink,
  FiFileText, FiFlag, FiHash, FiHome, FiImage, FiLayout, FiList,
  FiMessageSquare, FiSettings, FiShield, FiTag, FiTrendingUp, FiUsers,
} from "react-icons/fi";
import { MOCK_MY_BLOG } from "../_mock";
import { NotifBell } from "./NotifBell";

type AuthorNavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  matchPrefix?: string;
  isMaintenance?: boolean;
};

const NAV_AUTHOR: AuthorNavItem[] = [
  { label: "Dashboard",  href: "/dashboard/blog-platform",                  icon: FiBarChart2,     group: "Ringkasan" },

  { label: "Posts",      href: "/dashboard/blog-platform/posts",            icon: FiFileText,      group: "Konten" },
  { label: "Media",      href: "/dashboard/blog-platform/media",            icon: FiImage,         group: "Konten" },
  { label: "Komentar",   href: "/dashboard/blog-platform/komentar",         icon: FiMessageSquare, group: "Konten" },

  { label: "Analytics",  href: "/dashboard/blog-platform/analytics",        icon: FiTrendingUp,    group: "Insight" },
  { label: "Followers",  href: "/dashboard/blog-platform/followers",        icon: FiUsers,         group: "Insight" },

  { label: "Settings",   href: "/dashboard/blog-platform/settings/profile", icon: FiSettings,      group: "Pengaturan", matchPrefix: "/dashboard/blog-platform/settings" },
];

const NAV_ADMIN: { label: string; href: string; icon: React.ComponentType<{ className?: string }>; group: string; isMaintenance?: boolean }[] = [
  { label: "Klaim Subdomain",  href: "/dashboard/blog-platform/admin/klaim",          icon: FiCheckSquare, group: "Moderation" },
  { label: "Laporan Post",     href: "/dashboard/blog-platform/admin/laporan",        icon: FiFlag,        group: "Moderation" },
  { label: "Featured Posts",   href: "/dashboard/blog-platform/admin/featured",       icon: FiAward,       group: "Moderation" },
  { label: "Reserved Words",   href: "/dashboard/blog-platform/admin/kata-terlarang", icon: FiList,        group: "Moderation" },

  { label: "Semua Blog",       href: "/dashboard/blog-platform/admin/blogs",          icon: FiUsers,       group: "Manajemen" },
  { label: "Kategori",         href: "/dashboard/blog-platform/admin/kategori",       icon: FiTag,         group: "Manajemen" },
  { label: "Tag Manager",      href: "/dashboard/blog-platform/admin/tags",           icon: FiHash,        group: "Manajemen" },
  { label: "Templates Theme",  href: "/dashboard/blog-platform/admin/templates",      icon: FiLayout,      group: "Manajemen" },

  { label: "Audit Log",        href: "/dashboard/blog-platform/admin/audit",          icon: FiActivity,    group: "Audit" },
];

interface ShellProps {
  children: React.ReactNode;
}

export default function BlogPlatformShell({ children }: ShellProps) {
  const pathname = usePathname() || "";
  const blog = MOCK_MY_BLOG;
  const isAdmin = pathname.startsWith("/dashboard/blog-platform/admin");

  if (isAdmin) return <AdminShell blog={blog} pathname={pathname}>{children}</AdminShell>;
  return <AuthorShell blog={blog} pathname={pathname}>{children}</AuthorShell>;
}

// =================== AUTHOR SHELL — left sidebar (konsisten dengan admin) ===================

function AuthorShell({ blog, pathname, children }: { blog: typeof MOCK_MY_BLOG; pathname: string; children: React.ReactNode }) {
  const isActive = (href: string, matchPrefix?: string) => {
    if (matchPrefix) return pathname.startsWith(matchPrefix);
    if (href === "/dashboard/blog-platform") return pathname === href;
    return pathname.startsWith(href);
  };

  // Group nav items
  const groups: Record<string, AuthorNavItem[]> = {};
  for (const item of NAV_AUTHOR) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <MobileBrandBar blog={blog} />

      <div className="max-w-[1600px] mx-auto flex">
        {/* Desktop sidebar */}
        <aside className="w-72 shrink-0 hidden lg:flex flex-col sticky top-0 self-start h-screen overflow-y-auto px-4 py-5 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <SidebarProfileCard blog={blog} />
          <SidebarActions blog={blog} />

          <nav className="mt-5 space-y-5">
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName}>
                <p className="px-2 mb-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{groupName}</p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = isActive(item.href, item.matchPrefix);
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.isMaintenance ? "#" : item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            active
                              ? "bg-myunila/10 dark:bg-myunila/20 text-myunila dark:text-myunila-300"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          } ${item.isMaintenance ? "opacity-50" : ""}`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.isMaintenance && <span className="ml-auto text-[9px] uppercase tracking-wider text-amber-600">P2</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <SidebarFooter showAdminLink />
        </aside>

        {/* Mobile author nav (horizontal scroll) */}
        <div className="lg:hidden w-full">
          <nav className="sticky top-14 z-20 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
            <div className="px-4 flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
              {NAV_AUTHOR.map((item) => {
                const active = isActive(item.href, item.matchPrefix);
                return (
                  <Link
                    key={item.href}
                    href={item.isMaintenance ? "#" : item.href}
                    className={`px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                      active ? "border-myunila text-myunila" : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/dashboard/blog-platform/admin/klaim"
                className="ml-auto px-3 py-3 text-xs font-medium text-slate-500 hover:text-myunila whitespace-nowrap"
              >
                Admin →
              </Link>
            </div>
          </nav>
        </div>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// =================== ADMIN SHELL — left sidebar ===================

function AdminShell({ blog, pathname, children }: { blog: typeof MOCK_MY_BLOG; pathname: string; children: React.ReactNode }) {
  const groups: Record<string, typeof NAV_ADMIN> = {};
  for (const item of NAV_ADMIN) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <MobileBrandBar blog={blog} adminMode />

      <div className="max-w-[1600px] mx-auto flex">
        {/* Desktop sidebar */}
        <aside className="w-72 shrink-0 hidden lg:flex flex-col sticky top-0 self-start h-screen overflow-y-auto px-4 py-5 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <SidebarProfileCard blog={blog} adminBadge />

          <Link
            href="/dashboard/blog-platform"
            className="mt-4 inline-flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ← Kembali ke Author Panel
          </Link>

          <nav className="mt-5 space-y-5">
            {Object.entries(groups).map(([groupName, items]) => (
              <div key={groupName}>
                <p className="px-2 mb-1.5 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">{groupName}</p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.isMaintenance ? "#" : item.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            active
                              ? "bg-myunila/10 dark:bg-myunila/20 text-myunila dark:text-myunila-300"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          } ${item.isMaintenance ? "opacity-50" : ""}`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                          {item.isMaintenance && <span className="ml-auto text-[9px] uppercase tracking-wider text-amber-600">P2</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <SidebarFooter />
        </aside>

        {/* Mobile admin nav (horizontal scroll) */}
        <div className="lg:hidden w-full">
          <nav className="sticky top-14 z-20 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
            <div className="px-4 flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
              {NAV_ADMIN.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.isMaintenance ? "#" : item.href}
                    className={`px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                      active ? "border-myunila text-myunila" : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// =================== Sidebar Actions (Tulis Baru — primary CTA) ===================

function SidebarActions({ blog: _blog }: { blog: typeof MOCK_MY_BLOG }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      <Link
        href="/dashboard/blog-platform/posts/baru"
        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white hover:shadow-md transition-shadow"
      >
        <FiEdit3 className="w-3.5 h-3.5" /> Tulis Baru
      </Link>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0">
        <NotifBell />
      </div>
    </div>
  );
}

// =================== Mobile Brand Bar (top of page, only visible <lg) ===================

function MobileBrandBar({ blog: _blog, adminMode = false }: { blog: typeof MOCK_MY_BLOG; adminMode?: boolean }) {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-14 flex items-center justify-between px-4">
      <Link href="/dashboard/blog-platform" className="flex items-center gap-2 group">
        <div className={`relative w-9 h-9 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 ${adminMode ? "bg-gradient-to-br from-purple-500 to-purple-700" : "bg-gradient-to-br from-blue-500 to-blue-600 dark:bg-white"}`}>
          <Image src="/assets/images/logo-unila.png" alt="Logo Unila" width={24} height={24} className="object-contain" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">myUnila</span>
          <span className="text-[10px] font-semibold text-slate-900 dark:text-slate-100">
            Blog Platform {adminMode && <span className="text-purple-600">· Admin</span>}
          </span>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <NotifBell compact />
        <Link
          href="/dashboard/blog-platform/posts/baru"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-myunila to-myunila-700 text-white"
        >
          <FiEdit3 className="w-3 h-3" /> Tulis
        </Link>
      </div>
    </header>
  );
}

// =================== Sidebar Profile Card (mini profile + foto) ===================

function SidebarProfileCard({ blog, adminBadge = false }: { blog: typeof MOCK_MY_BLOG; adminBadge?: boolean }) {
  const blogUrl = `${blog.subdomain}.blog.unila.ac.id`;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Image
            src={blog.avatar_url}
            alt={blog.nm_tampilan}
            width={56}
            height={56}
            className="rounded-xl ring-2 ring-white dark:ring-slate-900 shadow-md bg-white"
          />
          {adminBadge ? (
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-purple-500 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center"
              title="Administrator"
            >
              <FiShield className="w-2.5 h-2.5" />
            </span>
          ) : blog.a_terverifikasi ? (
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center"
              title="Terverifikasi"
            >
              <FiEdit3 className="w-2.5 h-2.5" />
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{blog.nm_tampilan}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              adminBadge
                ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400"
                : "bg-myunila/10 text-myunila"
            }`}>
              {adminBadge ? "Admin" : blog.tipe_role}
            </span>
            <span className="text-[10px] text-slate-500 truncate">{blog.fakultas}</span>
          </div>
        </div>
      </div>

      <a
        href={`http://localhost:3002/?tenant=${blog.subdomain}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-myunila bg-myunila/5 hover:bg-myunila/10 transition-colors group"
      >
        <span className="truncate">{blogUrl}</span>
        <FiExternalLink className="w-3 h-3 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
}

// =================== Sidebar Footer — Admin link + Kembali ke Portal ===================

function SidebarFooter({ showAdminLink = false }: { showAdminLink?: boolean }) {
  return (
    <div className="mt-auto pt-5 space-y-1.5 border-t border-slate-200 dark:border-slate-800 -mx-4 px-4 pb-1">
      {showAdminLink && (
        <Link
          href="/dashboard/blog-platform/admin/klaim"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-700 dark:hover:text-purple-400 transition-colors group"
        >
          <FiShield className="w-4 h-4 shrink-0" />
          <span>Admin Panel</span>
          <span className="ml-auto text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all">→</span>
        </Link>
      )}
      <Link
        href="/portal"
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-myunila transition-colors group"
      >
        <FiHome className="w-4 h-4 shrink-0" />
        <span>Kembali ke Portal</span>
      </Link>
    </div>
  );
}

