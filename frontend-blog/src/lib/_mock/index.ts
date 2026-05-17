// Mock data untuk demo frontend-blog selama backend belum ready.
// Toggle via env NEXT_PUBLIC_USE_MOCK=true.

import type { Author, Kategori, Post, Tag } from "@/types/blog";

// =====================================================
// Kategori (~20 dari seed SQL)
// =====================================================

export const kategoriList: Kategori[] = [
  { id_kategori_post: "k1",  slug: "teknologi",      nm_kategori: "Teknologi",            icon_name: "FiCpu",          warna: "#3B82F6", jumlah_post: 142 },
  { id_kategori_post: "k2",  slug: "pendidikan",     nm_kategori: "Pendidikan",           icon_name: "FiBook",         warna: "#10B981", jumlah_post: 98 },
  { id_kategori_post: "k3",  slug: "riset",          nm_kategori: "Riset & Penelitian",   icon_name: "FiSearch",       warna: "#8B5CF6", jumlah_post: 76 },
  { id_kategori_post: "k4",  slug: "opini",          nm_kategori: "Opini",                icon_name: "FiMessageSquare",warna: "#F59E0B", jumlah_post: 124 },
  { id_kategori_post: "k5",  slug: "sastra",         nm_kategori: "Sastra & Karya",       icon_name: "FiFeather",      warna: "#EC4899", jumlah_post: 41 },
  { id_kategori_post: "k6",  slug: "berita-kampus",  nm_kategori: "Berita Kampus",        icon_name: "FiNewspaper",    warna: "#EF4444", jumlah_post: 203 },
  { id_kategori_post: "k7",  slug: "beasiswa",       nm_kategori: "Beasiswa",             icon_name: "FiAward",        warna: "#F97316", jumlah_post: 38 },
  { id_kategori_post: "k8",  slug: "kewirausahaan",  nm_kategori: "Kewirausahaan",        icon_name: "FiTrendingUp",   warna: "#14B8A6", jumlah_post: 29 },
  { id_kategori_post: "k9",  slug: "pengabdian",     nm_kategori: "Pengabdian Masyarakat",icon_name: "FiUsers",        warna: "#06B6D4", jumlah_post: 52 },
  { id_kategori_post: "k10", slug: "lingkungan",     nm_kategori: "Lingkungan",           icon_name: "FiLeaf",         warna: "#22C55E", jumlah_post: 33 },
  { id_kategori_post: "k11", slug: "seni-budaya",    nm_kategori: "Seni & Budaya",        icon_name: "FiMusic",        warna: "#A855F7", jumlah_post: 47 },
  { id_kategori_post: "k12", slug: "kesehatan",      nm_kategori: "Kesehatan",            icon_name: "FiHeart",        warna: "#F43F5E", jumlah_post: 61 },
  { id_kategori_post: "k13", slug: "tutorial",       nm_kategori: "Tutorial",             icon_name: "FiBookOpen",     warna: "#0891B2", jumlah_post: 89 },
  { id_kategori_post: "k14", slug: "karir",          nm_kategori: "Karir",                icon_name: "FiBriefcase",    warna: "#7C3AED", jumlah_post: 44 },
];

// =====================================================
// Top Tags
// =====================================================

export const topTags: Tag[] = [
  { id_tag: "t1",  slug: "nextjs",        nm_tag: "Next.js",       frekuensi: 87 },
  { id_tag: "t2",  slug: "react",         nm_tag: "React",         frekuensi: 124 },
  { id_tag: "t3",  slug: "go",            nm_tag: "Go",            frekuensi: 56 },
  { id_tag: "t4",  slug: "python",        nm_tag: "Python",        frekuensi: 178 },
  { id_tag: "t5",  slug: "ai",            nm_tag: "AI",            frekuensi: 203 },
  { id_tag: "t6",  slug: "machine-learning", nm_tag: "Machine Learning", frekuensi: 95 },
  { id_tag: "t7",  slug: "kkn",           nm_tag: "KKN",           frekuensi: 67 },
  { id_tag: "t8",  slug: "skripsi",       nm_tag: "Skripsi",       frekuensi: 142 },
  { id_tag: "t9",  slug: "beasiswa-lpdp", nm_tag: "Beasiswa LPDP", frekuensi: 34 },
  { id_tag: "t10", slug: "data-science",  nm_tag: "Data Science",  frekuensi: 88 },
  { id_tag: "t11", slug: "kuliah",        nm_tag: "Kuliah",        frekuensi: 256 },
  { id_tag: "t12", slug: "lampung",       nm_tag: "Lampung",       frekuensi: 187 },
  { id_tag: "t13", slug: "tips",          nm_tag: "Tips",          frekuensi: 234 },
  { id_tag: "t14", slug: "tutorial-pemula", nm_tag: "Tutorial Pemula", frekuensi: 76 },
  { id_tag: "t15", slug: "penelitian",    nm_tag: "Penelitian",    frekuensi: 119 },
];

// =====================================================
// Authors (sample 8 civitas)
// =====================================================

export const topAuthors: Author[] = [
  {
    id_blog: "b1", subdomain: "2117051070-mhs", nm_blog: "Catatan Mizar", nm_tampilan: "Mizar Zulmi",
    avatar_url: "https://ui-avatars.com/api/?name=Mizar+Zulmi&background=0B5EA8&color=fff&size=200",
    cover_url: "https://picsum.photos/seed/mizar/1200/400",
    bio: "Mahasiswa Ilmu Komputer FMIPA Unila yang antusias di dunia open source dan web development. Hobi koding sambil ngopi, sering sharing tutorial Next.js dan Go di sela kuliah.",
    tagline: "Belajar Next.js dan Go di sela kuliah",
    lokasi: "Bandar Lampung",
    fakultas: "FMIPA", prodi: "Ilmu Komputer", tipe_role: "MHS", a_terverifikasi: false,
    jumlah_post: 23, jumlah_view: 12340, jumlah_follower: 87,
    jumlah_like_total: 1240, rating_avg: 4.7, rating_count: 23, skor_seo: 8456,
    member_sejak: "2024-01-15T00:00:00Z",
    sosmed_json: { twitter: "mizarunila", github: "mizar", linkedin: "mizar-zulmi", website: "mizar.dev" },
    kode_template: "devlog",
    cv_json: {
      pendidikan: [
        { jenjang: "S1", institusi: "Universitas Lampung", prodi: "Ilmu Komputer", tahun_mulai: 2021, tahun_selesai: null, deskripsi: "Kuliah aktif, fokus di software engineering & AI." },
        { jenjang: "SMA", institusi: "SMA Negeri 2 Bandar Lampung", prodi: "IPA", tahun_mulai: 2018, tahun_selesai: 2021 },
      ],
      pengalaman: [
        { posisi: "Software Engineer Intern", organisasi: "UPA TIK Unila", lokasi: "Bandar Lampung", tahun_mulai: 2024, tahun_selesai: null, deskripsi: "Membangun MyUnila Portal & integrasi data akademik. Stack: Next.js, Go Fiber, PostgreSQL, Docker." },
        { posisi: "Open Source Contributor", organisasi: "Komunitas LampungJS", lokasi: "Lampung", tahun_mulai: 2023, tahun_selesai: null, deskripsi: "Maintainer 3 library opensource untuk komunitas developer Lampung." },
        { posisi: "Asisten Lab Algoritma", organisasi: "Jurusan Ilmu Komputer Unila", lokasi: "Bandar Lampung", tahun_mulai: 2023, tahun_selesai: 2024, deskripsi: "Membimbing 40+ mahasiswa dalam praktikum struktur data & algoritma." },
      ],
      skills: [
        { nm_skill: "Next.js",      level: 5, kategori: "Frontend" },
        { nm_skill: "TypeScript",   level: 5, kategori: "Frontend" },
        { nm_skill: "React",        level: 5, kategori: "Frontend" },
        { nm_skill: "Tailwind CSS", level: 4, kategori: "Frontend" },
        { nm_skill: "Go (Golang)",  level: 4, kategori: "Backend" },
        { nm_skill: "PostgreSQL",   level: 4, kategori: "Database" },
        { nm_skill: "Docker",       level: 3, kategori: "DevOps" },
        { nm_skill: "Linux",        level: 4, kategori: "DevOps" },
        { nm_skill: "Git",          level: 5, kategori: "Tools" },
      ],
      sertifikasi: [
        { nm: "AWS Cloud Practitioner", issuer: "Amazon Web Services", tahun: 2024, url: "https://www.credly.com/badges/example" },
        { nm: "Meta Front-End Developer", issuer: "Meta (Coursera)", tahun: 2023, url: "#" },
      ],
      publikasi: [
        { judul: "Implementasi Sistem Informasi Akademik Berbasis Microservices", venue: "JTIIK Unila", tahun: 2024, url: "#" },
      ],
      bahasa: [
        { nm: "Indonesia", level: "native" },
        { nm: "English",   level: "advanced" },
        { nm: "Lampung",   level: "intermediate" },
      ],
    },
  },
  {
    id_blog: "b2", subdomain: "rektor-staf", nm_blog: "Rektor Unila", nm_tampilan: "Prof. Dr. Lusmeilia Afriani",
    avatar_url: "https://ui-avatars.com/api/?name=Lusmeilia+Afriani&background=07A8B8&color=fff&size=200",
    cover_url: "https://picsum.photos/seed/rektor/1200/400",
    bio: "Rektor Universitas Lampung periode 2023-2027. Profesor di bidang Teknik Sipil. Aktif menulis tentang manajemen perguruan tinggi, kebijakan pendidikan, dan strategi transformasi kampus.",
    tagline: "Bersama membangun Unila yang inklusif & inovatif",
    lokasi: "Bandar Lampung",
    fakultas: "FT", prodi: "Teknik Sipil", tipe_role: "STAF", a_terverifikasi: true,
    jumlah_post: 45, jumlah_view: 89230, jumlah_follower: 1240,
    jumlah_like_total: 4530, rating_avg: 4.9, rating_count: 187, skor_seo: 24560,
    member_sejak: "2023-08-01T00:00:00Z",
    sosmed_json: { twitter: "rektorunila", website: "lusmeilia.unila.ac.id" },
    kode_template: "modern",
  },
  {
    id_blog: "b3", subdomain: "rina-dosen", nm_blog: "Lab Riset Rina", nm_tampilan: "Dr. Rina Hartanti",
    avatar_url: "https://ui-avatars.com/api/?name=Rina+Hartanti&background=8B5CF6&color=fff&size=200",
    cover_url: "https://picsum.photos/seed/rina/1200/400",
    bio: "Dosen Statistika FMIPA Unila. Riset di bidang biostatistika dan epidemiologi. Membagikan kuliah praktis statistika untuk mahasiswa.",
    tagline: "Statistika bukan momok",
    lokasi: "Bandar Lampung",
    fakultas: "FMIPA", prodi: "Matematika", tipe_role: "DOSEN", a_terverifikasi: true,
    jumlah_post: 67, jumlah_view: 34520, jumlah_follower: 423,
    jumlah_like_total: 2340, rating_avg: 4.8, rating_count: 89, skor_seo: 14230,
    member_sejak: "2023-09-15T00:00:00Z",
    sosmed_json: { linkedin: "rina-hartanti", website: "rina.unila.ac.id", scholar: "rina-hartanti" },
    kode_template: "academic",
    cv_json: {
      pendidikan: [
        { jenjang: "S3", institusi: "Universitas Indonesia", prodi: "Biostatistika", tahun_mulai: 2015, tahun_selesai: 2019, deskripsi: "Disertasi: Modeling penyebaran penyakit menular di Indonesia." },
        { jenjang: "S2", institusi: "Institut Teknologi Bandung", prodi: "Statistika", tahun_mulai: 2012, tahun_selesai: 2014 },
        { jenjang: "S1", institusi: "Universitas Lampung", prodi: "Matematika", tahun_mulai: 2008, tahun_selesai: 2012 },
      ],
      pengalaman: [
        { posisi: "Dosen Tetap", organisasi: "FMIPA Universitas Lampung", lokasi: "Bandar Lampung", tahun_mulai: 2019, tahun_selesai: null, deskripsi: "Mengampu mata kuliah Statistika Dasar, Biostatistika, dan Analisis Multivariat." },
        { posisi: "Peneliti Tamu", organisasi: "Universiti Malaya", lokasi: "Kuala Lumpur", tahun_mulai: 2022, tahun_selesai: 2023, deskripsi: "Kolaborasi riset epidemiologi DBD di Asia Tenggara." },
      ],
      skills: [
        { nm_skill: "R",                level: 5, kategori: "Statistical Computing" },
        { nm_skill: "Python (pandas)",  level: 4, kategori: "Data Science" },
        { nm_skill: "SPSS",             level: 5, kategori: "Statistical Computing" },
        { nm_skill: "STATA",            level: 4, kategori: "Statistical Computing" },
        { nm_skill: "Biostatistika",    level: 5, kategori: "Domain" },
        { nm_skill: "Epidemiologi",     level: 5, kategori: "Domain" },
      ],
      publikasi: [
        { judul: "Spatial Modeling of Dengue Fever in Lampung Province", venue: "Asian Pacific Journal of Tropical Medicine", tahun: 2023, url: "#" },
        { judul: "ARIMA Forecasting for Public Health Surveillance", venue: "JURNAL EPIDEMIOLOGI", tahun: 2022, url: "#" },
        { judul: "Bayesian Approach for Multi-strain Disease Modeling", venue: "Statistical Methods in Medical Research", tahun: 2021, url: "#" },
      ],
      bahasa: [
        { nm: "Indonesia", level: "native" },
        { nm: "English",   level: "native" },
        { nm: "Mandarin",  level: "intermediate" },
      ],
    },
  },
  {
    id_blog: "b4", subdomain: "1957081076-mhs", nm_blog: "Notes by Aulia", nm_tampilan: "Aulia Rahma",
    avatar_url: "https://ui-avatars.com/api/?name=Aulia+Rahma&background=EC4899&color=fff&size=200",
    bio: "Mahasiswa Sastra Inggris FKIP. Menulis cerpen, esai sastra, dan ulasan buku.",
    tagline: "Words are everything",
    fakultas: "FKIP", prodi: "Pendidikan Bahasa Inggris", tipe_role: "MHS", a_terverifikasi: false,
    jumlah_post: 34, jumlah_view: 8760, jumlah_follower: 156,
    kode_template: "minimalist",
  },
  {
    id_blog: "b5", subdomain: "andi-dosen", nm_blog: "Riset Hukum Andi", nm_tampilan: "Dr. Andi Pratama, S.H., M.H.",
    avatar_url: "https://ui-avatars.com/api/?name=Andi+Pratama&background=6366F1&color=fff&size=200",
    bio: "Dosen Hukum Tata Negara FH Unila. Analisis kebijakan & studi kasus konstitusi.",
    tagline: "Hukum untuk semua",
    fakultas: "FH", prodi: "Ilmu Hukum", tipe_role: "DOSEN", a_terverifikasi: true,
    jumlah_post: 28, jumlah_view: 19340, jumlah_follower: 287,
    kode_template: "modern",
  },
  {
    id_blog: "b6", subdomain: "2017011019-mhs", nm_blog: "BangSel Coding", nm_tampilan: "Bagus Setiawan",
    avatar_url: "https://ui-avatars.com/api/?name=Bagus+Setiawan&background=14B8A6&color=fff&size=200",
    bio: "Mahasiswa Teknik Informatika FT. Tutorial pemrograman, project case-study, sharing pengalaman intern.",
    tagline: "Code & coffee",
    fakultas: "FT", prodi: "Teknik Informatika", tipe_role: "MHS", a_terverifikasi: false,
    jumlah_post: 56, jumlah_view: 23410, jumlah_follower: 198,
    kode_template: "modern",
  },
  {
    id_blog: "b7", subdomain: "siti-staf", nm_blog: "Akademik Siti", nm_tampilan: "Siti Nurhaliza, S.A.P.",
    avatar_url: "https://ui-avatars.com/api/?name=Siti+Nurhaliza&background=F97316&color=fff&size=200",
    bio: "Staf BAK Unila. Berbagi info beasiswa, prosedur akademik, dan tips sukses kuliah.",
    tagline: "Info akademik untuk mahasiswa",
    fakultas: "BAK", prodi: "Administrasi", tipe_role: "STAF", a_terverifikasi: true,
    jumlah_post: 42, jumlah_view: 56780, jumlah_follower: 678,
    kode_template: "magazine",
  },
  {
    id_blog: "b8", subdomain: "1957051099-alumni", nm_blog: "From Lampung", nm_tampilan: "Dimas Kurniawan",
    avatar_url: "https://ui-avatars.com/api/?name=Dimas+Kurniawan&background=DC2626&color=fff&size=200",
    bio: "Alumni Teknik Mesin Unila 2019. Sekarang engineer di Tokopedia. Sharing tips karir & pengalaman kerja.",
    tagline: "Alumni Unila in tech",
    fakultas: "FT", prodi: "Teknik Mesin", tipe_role: "ALUMNI", a_terverifikasi: false,
    jumlah_post: 19, jumlah_view: 7820, jumlah_follower: 134,
    kode_template: "portfolio",
  },
];

// =====================================================
// Posts pool (~30 sample posts)
// =====================================================

const COVER_SEEDS = ["nextjs", "react", "data", "ai", "campus", "research", "code", "study", "writing", "design"];
const cover = (seed: string) => `https://picsum.photos/seed/${seed}/800/450`;

export const allPosts: Post[] = [
  {
    id_post: "p1", id_blog: "b1", judul: "Belajar Next.js 15 App Router untuk Pemula: Routing, Server Components, dan ISR",
    slug: "belajar-nextjs-15-app-router-pemula", ringkasan: "Panduan komprehensif memulai Next.js 15 dari nol — termasuk perbedaan App Router vs Pages Router, Server Components, dan strategi caching modern.",
    konten_html: `<p>Next.js 15 membawa banyak perubahan menarik...</p><h2>Apa itu App Router?</h2><p>App Router adalah paradigma baru yang menggantikan Pages Router. Berbasis React Server Components secara default.</p><h2>Server vs Client Components</h2><p>Default-nya semua component adalah Server Component...</p>`,
    cover_url: cover("nextjs"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-10T08:00:00Z", a_pinned: true, a_unggulan: true,
    jumlah_view: 1234, jumlah_like: 89, jumlah_komentar: 23, jumlah_share: 45,
    waktu_baca_menit: 8, jumlah_kata: 1240, bahasa: "id",
    kategori: kategoriList[0], tags: [topTags[0], topTags[1]], author: topAuthors[0],
  },
  {
    id_post: "p2", id_blog: "b3", judul: "Memahami Regresi Linear: Dari Rumus hingga Implementasi di Python",
    slug: "memahami-regresi-linear-python", ringkasan: "Statistika dasar yang harus dipahami setiap mahasiswa STEM. Tutorial step-by-step dengan contoh dataset nyata.",
    konten_html: `<p>Regresi linear adalah salah satu teknik paling fundamental dalam statistika...</p>`,
    cover_url: cover("data"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-08T10:30:00Z", a_pinned: false, a_unggulan: true,
    jumlah_view: 892, jumlah_like: 67, jumlah_komentar: 18, jumlah_share: 22,
    waktu_baca_menit: 12, jumlah_kata: 1850, bahasa: "id",
    kategori: kategoriList[2], tags: [topTags[3], topTags[5]], author: topAuthors[2],
  },
  {
    id_post: "p3", id_blog: "b2", judul: "Visi Unila Menuju World-Class University 2030: Strategi & Tantangan",
    slug: "visi-unila-world-class-2030", ringkasan: "Refleksi 1 tahun kepemimpinan dan peta jalan transformasi Unila menuju kampus berkelas dunia.",
    konten_html: `<p>Universitas Lampung telah menetapkan visi besar...</p>`,
    cover_url: cover("campus"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-09T07:00:00Z", a_pinned: true, a_unggulan: true,
    jumlah_view: 2341, jumlah_like: 156, jumlah_komentar: 67, jumlah_share: 89,
    waktu_baca_menit: 15, jumlah_kata: 2300, bahasa: "id",
    kategori: kategoriList[1], tags: [topTags[10]], author: topAuthors[1],
  },
  {
    id_post: "p4", id_blog: "b4", judul: "Lampu Jalan: Cerpen tentang Pulang ke Lampung",
    slug: "lampu-jalan-cerpen", ringkasan: "Cerita pendek tentang kerinduan, perjalanan pulang, dan rumah yang selalu menanti.",
    konten_html: `<p>Hujan turun perlahan saat aku tiba di stasiun Tanjung Karang...</p>`,
    cover_url: cover("writing"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-07T20:00:00Z", a_pinned: false, a_unggulan: false,
    jumlah_view: 567, jumlah_like: 98, jumlah_komentar: 34, jumlah_share: 12,
    waktu_baca_menit: 6, jumlah_kata: 950, bahasa: "id",
    kategori: kategoriList[4], tags: [topTags[11]], author: topAuthors[3],
  },
  {
    id_post: "p5", id_blog: "b6", judul: "Setup Development Environment Go untuk Mahasiswa Pemula",
    slug: "setup-go-development-environment", ringkasan: "Install Go, set GOPATH, pilih IDE, dan bikin project pertama dalam 15 menit.",
    konten_html: `<p>Go (Golang) adalah bahasa yang dikembangkan Google dengan fokus pada simplicity...</p>`,
    cover_url: cover("code"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-06T14:00:00Z", a_pinned: false, a_unggulan: false,
    jumlah_view: 1876, jumlah_like: 134, jumlah_komentar: 45, jumlah_share: 67,
    waktu_baca_menit: 7, jumlah_kata: 1100, bahasa: "id",
    kategori: kategoriList[12], tags: [topTags[2], topTags[13]], author: topAuthors[5],
  },
  {
    id_post: "p6", id_blog: "b5", judul: "Putusan MK No. 90/PUU-XXI/2023: Analisis Hukum Tata Negara",
    slug: "analisis-putusan-mk-90", ringkasan: "Telaah putusan kontroversial MK tentang batas usia capres-cawapres dari perspektif hukum tata negara.",
    konten_html: `<p>Putusan Mahkamah Konstitusi No. 90/PUU-XXI/2023 telah memicu perdebatan luas...</p>`,
    cover_url: cover("research"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-05T11:00:00Z", a_pinned: false, a_unggulan: true,
    jumlah_view: 1567, jumlah_like: 89, jumlah_komentar: 78, jumlah_share: 145,
    waktu_baca_menit: 14, jumlah_kata: 2150, bahasa: "id",
    kategori: kategoriList[3], tags: [topTags[14]], author: topAuthors[4],
  },
  {
    id_post: "p7", id_blog: "b7", judul: "10 Beasiswa LPDP 2026 yang Wajib Kamu Tahu (Plus Tips Lulus)",
    slug: "10-beasiswa-lpdp-2026-tips-lulus", ringkasan: "Daftar lengkap program LPDP 2026 plus strategi dari penerima beasiswa Unila yang sudah lulus.",
    konten_html: `<p>LPDP membuka pendaftaran 2026 dengan beberapa update penting...</p>`,
    cover_url: cover("study"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-04T09:00:00Z", a_pinned: false, a_unggulan: true,
    jumlah_view: 3421, jumlah_like: 287, jumlah_komentar: 134, jumlah_share: 234,
    waktu_baca_menit: 11, jumlah_kata: 1680, bahasa: "id",
    kategori: kategoriList[6], tags: [topTags[8], topTags[12]], author: topAuthors[6],
  },
  {
    id_post: "p8", id_blog: "b8", judul: "Dari Bandar Lampung ke Tokopedia: Cerita Career Switch ke Tech",
    slug: "career-switch-bandar-lampung-tokopedia", ringkasan: "Pengalaman 5 tahun setelah lulus, dari engineer mesin pindah ke software engineer di startup unicorn.",
    konten_html: `<p>2019, saya wisuda dari Teknik Mesin Unila...</p>`,
    cover_url: cover("design"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-03T16:00:00Z", a_pinned: false, a_unggulan: false,
    jumlah_view: 2143, jumlah_like: 198, jumlah_komentar: 89, jumlah_share: 156,
    waktu_baca_menit: 9, jumlah_kata: 1420, bahasa: "id",
    kategori: kategoriList[13], tags: [topTags[12]], author: topAuthors[7],
  },
  {
    id_post: "p9", id_blog: "b1", judul: "PostgreSQL vs SQL Server: Pengalaman Migrasi Project Skripsi",
    slug: "postgresql-vs-sqlserver-migrasi", ringkasan: "Dokumentasi proses migrasi database project skripsi dari SQL Server ke PostgreSQL — pain points, lessons learned.",
    konten_html: `<p>Awalnya project saya pakai SQL Server karena legacy alasan...</p>`,
    cover_url: cover("data"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-02T13:00:00Z", a_pinned: false, a_unggulan: false,
    jumlah_view: 876, jumlah_like: 56, jumlah_komentar: 23, jumlah_share: 18,
    waktu_baca_menit: 10, jumlah_kata: 1530, bahasa: "id",
    kategori: kategoriList[0], tags: [topTags[1]], author: topAuthors[0],
  },
  {
    id_post: "p10", id_blog: "b3", judul: "ANOVA Satu Arah vs Dua Arah: Kapan Pakai yang Mana?",
    slug: "anova-satu-arah-dua-arah", ringkasan: "Penjelasan praktis ANOVA dengan contoh data kuliah, lengkap dengan code R dan SPSS.",
    konten_html: `<p>ANOVA (Analysis of Variance) adalah teknik statistika...</p>`,
    cover_url: cover("research"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-05-01T08:30:00Z", a_pinned: false, a_unggulan: false,
    jumlah_view: 654, jumlah_like: 47, jumlah_komentar: 12, jumlah_share: 19,
    waktu_baca_menit: 11, jumlah_kata: 1620, bahasa: "id",
    kategori: kategoriList[2], tags: [topTags[3], topTags[14]], author: topAuthors[2],
  },
  {
    id_post: "p11", id_blog: "b6", judul: "Bikin REST API Pertama dengan Go Fiber dalam 30 Menit",
    slug: "rest-api-pertama-go-fiber-30-menit", ringkasan: "Tutorial cepat bikin REST API dari nol pakai Go + Fiber + SQLite. Deploy ke Railway.",
    konten_html: `<p>Fiber adalah framework HTTP yang sangat cepat...</p>`,
    cover_url: cover("code"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-04-30T15:00:00Z", a_pinned: false, a_unggulan: false,
    jumlah_view: 1432, jumlah_like: 98, jumlah_komentar: 34, jumlah_share: 56,
    waktu_baca_menit: 8, jumlah_kata: 1230, bahasa: "id",
    kategori: kategoriList[12], tags: [topTags[2]], author: topAuthors[5],
  },
  {
    id_post: "p12", id_blog: "b7", judul: "Prosedur Cuti Akademik di Unila: Dokumen, Tahapan, dan Tips",
    slug: "prosedur-cuti-akademik-unila", ringkasan: "Panduan lengkap mengajukan cuti akademik resmi di BAK Unila.",
    konten_html: `<p>Cuti akademik adalah hak mahasiswa yang dijamin peraturan universitas...</p>`,
    cover_url: cover("study"), status: "published", visibilitas: "public",
    tgl_terbit: "2026-04-29T10:00:00Z", a_pinned: false, a_unggulan: false,
    jumlah_view: 1098, jumlah_like: 67, jumlah_komentar: 45, jumlah_share: 89,
    waktu_baca_menit: 6, jumlah_kata: 950, bahasa: "id",
    kategori: kategoriList[1], tags: [topTags[10]], author: topAuthors[6],
  },
];

// =====================================================
// Computed lists
// =====================================================

export const trending = [...allPosts].sort((a, b) => {
  const scoreA = a.jumlah_view + a.jumlah_like * 5 + a.jumlah_komentar * 10;
  const scoreB = b.jumlah_view + b.jumlah_like * 5 + b.jumlah_komentar * 10;
  return scoreB - scoreA;
});

export const latestPosts = [...allPosts].sort((a, b) =>
  (b.tgl_terbit || "").localeCompare(a.tgl_terbit || "")
);

export const featured = allPosts.filter(p => p.a_unggulan);

// =====================================================
// Helpers
// =====================================================

export function findBlog(subdomain: string): Author | null {
  return topAuthors.find(a => a.subdomain === subdomain) ?? null;
}
