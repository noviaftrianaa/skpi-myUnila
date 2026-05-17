"use client";

// Settings layout — tabbed navigation across Profile / About / Subdomain / Theme / SEO.
// Setiap child page render form-nya sendiri; layout ini hanya tampilkan header + tab nav.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBookOpen, FiGlobe, FiSearch, FiSettings, FiStar, FiUser,
} from "react-icons/fi";

const TABS = [
  { label: "Profile",   href: "/dashboard/blog-platform/settings/profile",   icon: FiUser,     desc: "Avatar, bio, sosial media" },
  { label: "About",     href: "/dashboard/blog-platform/settings/about",     icon: FiBookOpen, desc: "Long-form bio (markdown)" },
  { label: "Subdomain", href: "/dashboard/blog-platform/settings/subdomain", icon: FiGlobe,    desc: "URL blog kamu" },
  { label: "Theme",     href: "/dashboard/blog-platform/settings/theme",     icon: FiStar,     desc: "Tampilan reader" },
  { label: "SEO",       href: "/dashboard/blog-platform/settings/seo",       icon: FiSearch,   desc: "Google-friendly meta" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const active = TABS.find(t => pathname.startsWith(t.href));

  return (
    <div className="space-y-6">
      {/* Settings header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight inline-flex items-center gap-2">
          <FiSettings className="w-6 h-6 text-myunila" /> Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Atur profil, subdomain, tampilan, dan SEO blog kamu.
          {active && <span className="ml-1 text-slate-700 dark:text-slate-300">· <strong>{active.label}</strong> — {active.desc}</span>}
        </p>
      </div>

      {/* Tab navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
          {TABS.map(tab => {
            const isActive = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-myunila text-myunila"
                    : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Page content */}
      <div>{children}</div>
    </div>
  );
}
