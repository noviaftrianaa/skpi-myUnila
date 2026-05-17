/**
 * Menu Configuration — Blog Platform
 *
 * Dashboard untuk:
 *  - Author panel: civitas yang sudah klaim subdomain blog (kelola post sendiri)
 *  - Admin panel: moderasi blog platform global (klaim subdomain, featured, reserved words, dst)
 *
 * App key: blog-platform (perlu seed di pdut.man_akses.aplikasi)
 */

import {
  FiActivity, FiAward, FiBarChart2, FiBookOpen, FiCheckSquare, FiEdit3, FiFileText, FiSlash,
  FiGrid, FiHash, FiImage, FiLayout, FiList, FiMail, FiMessageSquare, FiSettings,
  FiShield, FiTag, FiUser, FiUsers,
} from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import type { MenuItem } from "@/lib/types/dashboardTypes";

const authorRoles = ["mahasiswa", "dosen", "staf", "tendik", "alumni", "developer", "admin", "blog_admin"];
const adminRoles = ["developer", "admin", "blog_admin"];

export const blogPlatformMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard className="w-5 h-5" />,
    href: "/dashboard/blog-platform",
    roles: authorRoles,
  },

  // ============= Author panel =============
  {
    title: "My Posts",
    icon: <FiFileText className="w-5 h-5" />,
    children: [
      { title: "Semua",        icon: <FiList    className="w-4 h-4" />, href: "/dashboard/blog-platform/posts" },
      { title: "Tulis Baru",   icon: <FiEdit3   className="w-4 h-4" />, href: "/dashboard/blog-platform/posts/baru" },
      { title: "Draft",        icon: <FiBookOpen className="w-4 h-4" />, href: "/dashboard/blog-platform/posts?status=draft" },
      { title: "Terjadwal",    icon: <FiActivity className="w-4 h-4" />, href: "/dashboard/blog-platform/posts?status=scheduled" },
      { title: "Trash",        icon: <FiList    className="w-4 h-4" />, href: "/dashboard/blog-platform/posts?status=trash" },
    ],
    roles: authorRoles,
  },
  {
    title: "Media Library",
    icon: <FiImage className="w-5 h-5" />,
    href: "/dashboard/blog-platform/media",
    roles: authorRoles,
  },
  {
    title: "Series",
    icon: <FiBookOpen className="w-5 h-5" />,
    href: "/dashboard/blog-platform/series",
    roles: authorRoles,
  },
  {
    title: "Co-author Invites",
    icon: <FiMail className="w-5 h-5" />,
    href: "/dashboard/blog-platform/co-author-invites",
    roles: authorRoles,
  },
  {
    title: "Komentar",
    icon: <FiMessageSquare className="w-5 h-5" />,
    href: "/dashboard/blog-platform/komentar",
    isMaintenance: true,
    roles: authorRoles,
  },
  {
    title: "Analytics",
    icon: <FiBarChart2 className="w-5 h-5" />,
    href: "/dashboard/blog-platform/analytics",
    roles: authorRoles,
  },
  {
    title: "Settings Blog",
    icon: <FiSettings className="w-5 h-5" />,
    children: [
      { title: "Profile",         icon: <FiUser    className="w-4 h-4" />, href: "/dashboard/blog-platform/settings/profile" },
      { title: "Subdomain",       icon: <FiHash    className="w-4 h-4" />, href: "/dashboard/blog-platform/settings/subdomain" },
      { title: "Theme",           icon: <FiLayout  className="w-4 h-4" />, href: "/dashboard/blog-platform/settings/theme" },
      { title: "SEO",             icon: <FiActivity className="w-4 h-4" />, href: "/dashboard/blog-platform/settings/seo" },
    ],
    roles: authorRoles,
  },

  // ============= Admin panel =============
  {
    title: "Moderation",
    icon: <FiShield className="w-5 h-5" />,
    children: [
      { title: "Klaim Subdomain", icon: <FiCheckSquare className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/klaim" },
      { title: "Laporan Post",    icon: <FiMessageSquare className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/laporan", isMaintenance: true },
      { title: "Featured Posts",  icon: <FiAward className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/featured" },
      { title: "Banned Users",    icon: <FiSlash className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/banned" },
      { title: "Reserved Words",  icon: <FiList  className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/kata-terlarang" },
    ],
    roles: adminRoles,
  },
  {
    title: "Manajemen",
    icon: <FiGrid className="w-5 h-5" />,
    children: [
      { title: "Semua Blog",      icon: <FiUsers   className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/blogs" },
      { title: "Kategori",        icon: <FiTag     className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/kategori" },
      { title: "Templates",       icon: <FiLayout  className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/templates" },
      { title: "Mail Config",     icon: <FiMail    className="w-4 h-4" />, href: "/dashboard/blog-platform/admin/mail-config" },
    ],
    roles: adminRoles,
  },
  {
    title: "Audit Log",
    icon: <FiList className="w-5 h-5" />,
    href: "/dashboard/blog-platform/admin/audit",
    roles: adminRoles,
  },
];
