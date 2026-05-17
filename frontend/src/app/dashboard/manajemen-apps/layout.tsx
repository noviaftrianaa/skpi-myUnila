"use client";

// Shell layout untuk Manajemen Apps.
// Refactor dari manajemen-konten yang sekarang jadi sub-modul.
// Plan terpisah: docs/manajemen-apps/ (TODO).
//
// Sub-modul saat ini:
//  - manajemen-konten/  (existing — pengumuman/berita/artikel CMS)
//  - blog-platform/     (parallel module, BUKAN sub — ada di dashboard/blog-platform/)
//
// Future sub-modul (placeholder card di page.tsx):
//  - manajemen-pengguna
//  - manajemen-aplikasi
//  - manajemen-notifikasi-broadcast

export default function ManajemenAppsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
