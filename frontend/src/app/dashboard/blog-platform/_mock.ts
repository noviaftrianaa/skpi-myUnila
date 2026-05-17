// Mock data untuk dashboard blog-platform — selama backend belum ready.
// Setelah blog-service jadi, ganti via service layer di lib/services/blog-platform/.

export const MOCK_MY_BLOG = {
  id_blog: "b1",
  subdomain: "2117051070-mhs",
  nm_blog: "Catatan Mizar",
  nm_tampilan: "Mizar Zulmi",
  avatar_url: "https://ui-avatars.com/api/?name=Mizar+Zulmi&background=0B5EA8&color=fff&size=200",
  cover_url: "https://picsum.photos/seed/mizar/1200/400",
  bio: "Mahasiswa Ilmu Komputer FMIPA Unila yang antusias di dunia open source dan web development.",
  tagline: "Belajar Next.js dan Go di sela kuliah",
  fakultas: "FMIPA",
  prodi: "Ilmu Komputer",
  tipe_role: "MHS" as const,
  a_terverifikasi: false,
  a_aktif: true,
  jumlah_post: 23,
  jumlah_view: 12340,
  jumlah_follower: 87,
  jumlah_like_total: 1240,
  rating_avg: 4.7,
  rating_count: 23,
  skor_seo: 8456,
  bahasa: "id",
  timezone: "Asia/Jakarta",
  kode_template: "modern",
  tgl_klaim: "2024-01-15T00:00:00Z",
  sosmed_json: { twitter: "mizarunila", github: "mizar", linkedin: "mizar-zulmi" },
};

export interface MockPost {
  id_post: string;
  judul: string;
  slug: string;
  status: "draft" | "review" | "published" | "scheduled" | "archived" | "trash";
  visibilitas: "public" | "unlisted" | "private" | "password";
  kategori?: { slug: string; nm_kategori: string; warna: string };
  tgl_terbit: string | null;
  tgl_jadwal: string | null;
  jumlah_view: number;
  jumlah_like: number;
  jumlah_komentar: number;
  cover_url?: string;
  ringkasan?: string;
  a_pinned?: boolean;
  a_unggulan?: boolean;
}

export const MOCK_POSTS: MockPost[] = [
  { id_post: "p1", judul: "Belajar Next.js 15 App Router untuk Pemula", slug: "belajar-nextjs-15-app-router-pemula", status: "published", visibilitas: "public", kategori: { slug: "teknologi", nm_kategori: "Teknologi", warna: "#3B82F6" }, tgl_terbit: "2026-05-10T08:00:00Z", tgl_jadwal: null, jumlah_view: 1234, jumlah_like: 89, jumlah_komentar: 23, cover_url: "https://picsum.photos/seed/nextjs/400/225", a_pinned: true, a_unggulan: true, ringkasan: "Panduan komprehensif memulai Next.js 15 dari nol." },
  { id_post: "p2", judul: "PostgreSQL vs SQL Server: Pengalaman Migrasi", slug: "postgresql-vs-sqlserver-migrasi", status: "published", visibilitas: "public", kategori: { slug: "teknologi", nm_kategori: "Teknologi", warna: "#3B82F6" }, tgl_terbit: "2026-05-02T13:00:00Z", tgl_jadwal: null, jumlah_view: 876, jumlah_like: 56, jumlah_komentar: 23, cover_url: "https://picsum.photos/seed/db/400/225", ringkasan: "Dokumentasi proses migrasi database project skripsi." },
  { id_post: "p3", judul: "Refleksi Magang di UPA TIK Unila Semester Ini", slug: "refleksi-magang-upa-tik", status: "draft", visibilitas: "public", kategori: { slug: "karir", nm_kategori: "Karir", warna: "#7C3AED" }, tgl_terbit: null, tgl_jadwal: null, jumlah_view: 0, jumlah_like: 0, jumlah_komentar: 0, ringkasan: "Pengalaman 6 bulan magang sebagai engineer di UPA TIK." },
  { id_post: "p4", judul: "Tutorial Setup Docker Compose untuk Project Multi-Service", slug: "setup-docker-compose-multi-service", status: "scheduled", visibilitas: "public", kategori: { slug: "tutorial", nm_kategori: "Tutorial", warna: "#0891B2" }, tgl_terbit: null, tgl_jadwal: "2026-05-15T08:00:00Z", jumlah_view: 0, jumlah_like: 0, jumlah_komentar: 0, ringkasan: "Step-by-step Docker Compose untuk frontend + backend + db." },
  { id_post: "p5", judul: "Menulis Test untuk REST API Go (Bagian 1)", slug: "menulis-test-rest-api-go-1", status: "published", visibilitas: "public", kategori: { slug: "tutorial", nm_kategori: "Tutorial", warna: "#0891B2" }, tgl_terbit: "2026-04-28T09:00:00Z", tgl_jadwal: null, jumlah_view: 543, jumlah_like: 42, jumlah_komentar: 11, cover_url: "https://picsum.photos/seed/go-test/400/225" },
  { id_post: "p6", judul: "Catatan Acak: Filosofi Open Source", slug: "catatan-acak-filosofi-opensource", status: "draft", visibilitas: "private", kategori: { slug: "opini", nm_kategori: "Opini", warna: "#F59E0B" }, tgl_terbit: null, tgl_jadwal: null, jumlah_view: 0, jumlah_like: 0, jumlah_komentar: 0 },
  { id_post: "p7", judul: "Review Buku: Designing Data-Intensive Applications", slug: "review-ddia", status: "published", visibilitas: "public", kategori: { slug: "teknologi", nm_kategori: "Teknologi", warna: "#3B82F6" }, tgl_terbit: "2026-04-15T20:00:00Z", tgl_jadwal: null, jumlah_view: 387, jumlah_like: 34, jumlah_komentar: 8, cover_url: "https://picsum.photos/seed/ddia/400/225" },
  { id_post: "p8", judul: "[Lama] Tips Lulus Cepat Tepat Waktu", slug: "tips-lulus-cepat", status: "trash", visibilitas: "public", kategori: { slug: "karir", nm_kategori: "Karir", warna: "#7C3AED" }, tgl_terbit: "2026-03-10T10:00:00Z", tgl_jadwal: null, jumlah_view: 1234, jumlah_like: 67, jumlah_komentar: 23 },
];

// Counts per status
export const POST_STATUS_COUNTS = {
  all: MOCK_POSTS.length,
  published: MOCK_POSTS.filter(p => p.status === "published").length,
  draft: MOCK_POSTS.filter(p => p.status === "draft").length,
  scheduled: MOCK_POSTS.filter(p => p.status === "scheduled").length,
  archived: MOCK_POSTS.filter(p => p.status === "archived").length,
  trash: MOCK_POSTS.filter(p => p.status === "trash").length,
};

export const MOCK_VIEWS_30D = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  views: Math.floor(50 + Math.random() * 200 + Math.sin(i / 4) * 50),
}));

export interface MockMedia {
  id_media: string;
  nama_file: string;
  url_publik: string;
  jenis_media: "image" | "video" | "document" | "audio" | "other";
  ukuran_bytes: number;
  uploaded_at: string;
}

export const MOCK_MEDIA: MockMedia[] = [
  { id_media: "m1", nama_file: "cover-nextjs.jpg", url_publik: "https://picsum.photos/seed/m1/400/300", jenis_media: "image", ukuran_bytes: 234567, uploaded_at: "2026-05-10T08:00:00Z" },
  { id_media: "m2", nama_file: "diagram-arsitektur.png", url_publik: "https://picsum.photos/seed/m2/400/300", jenis_media: "image", ukuran_bytes: 187234, uploaded_at: "2026-05-08T14:00:00Z" },
  { id_media: "m3", nama_file: "screenshot-vscode.png", url_publik: "https://picsum.photos/seed/m3/400/300", jenis_media: "image", ukuran_bytes: 312890, uploaded_at: "2026-05-07T10:00:00Z" },
  { id_media: "m4", nama_file: "demo-app.mp4", url_publik: "https://picsum.photos/seed/m4/400/300", jenis_media: "video", ukuran_bytes: 8456789, uploaded_at: "2026-05-05T16:00:00Z" },
  { id_media: "m5", nama_file: "panduan.pdf", url_publik: "https://picsum.photos/seed/m5/400/300", jenis_media: "document", ukuran_bytes: 1234567, uploaded_at: "2026-05-03T11:00:00Z" },
  { id_media: "m6", nama_file: "logo-blog.svg", url_publik: "https://picsum.photos/seed/m6/400/300", jenis_media: "image", ukuran_bytes: 12345, uploaded_at: "2026-05-01T09:00:00Z" },
  { id_media: "m7", nama_file: "infografis.png", url_publik: "https://picsum.photos/seed/m7/400/300", jenis_media: "image", ukuran_bytes: 456789, uploaded_at: "2026-04-30T15:00:00Z" },
  { id_media: "m8", nama_file: "wireframe.jpg", url_publik: "https://picsum.photos/seed/m8/400/300", jenis_media: "image", ukuran_bytes: 234567, uploaded_at: "2026-04-28T12:00:00Z" },
];

// ============= Admin mock =============

export interface MockKlaim {
  id_klaim: string;
  pemohon: string;
  fakultas: string;
  role: "STAF" | "DOSEN";
  subdomain_diminta: string;
  alasan?: string;
  validasi: { layer1: boolean; layer2: boolean; layer3: boolean; layer4: { score: number; matched?: string } };
  status: "pending" | "manual_review" | "approved" | "rejected";
  tgl_klaim: string;
}

export const MOCK_KLAIM: MockKlaim[] = [
  { id_klaim: "k1", pemohon: "Dr. Andi Pratama, S.H., M.H.", fakultas: "FH", role: "DOSEN", subdomain_diminta: "andi-dosen", alasan: "Untuk publikasi analisis hukum tata negara.", validasi: { layer1: true, layer2: true, layer3: true, layer4: { score: 95 } }, status: "manual_review", tgl_klaim: "2026-05-12T08:30:00Z" },
  { id_klaim: "k2", pemohon: "Siti Nurhaliza, S.A.P.", fakultas: "BAK", role: "STAF", subdomain_diminta: "siti-staf", validasi: { layer1: true, layer2: true, layer3: true, layer4: { score: 88 } }, status: "manual_review", tgl_klaim: "2026-05-12T10:00:00Z" },
  { id_klaim: "k3", pemohon: "Prof. Dr. Bambang Surya", fakultas: "FT", role: "DOSEN", subdomain_diminta: "rektor-staf", alasan: "Saya mantan rektor periode 2017-2021.", validasi: { layer1: true, layer2: false, layer3: false, layer4: { score: 30, matched: "rektor (reserved)" } }, status: "manual_review", tgl_klaim: "2026-05-11T14:00:00Z" },
  { id_klaim: "k4", pemohon: "Dr. Rina Hartanti", fakultas: "FMIPA", role: "DOSEN", subdomain_diminta: "rina-dosen", validasi: { layer1: true, layer2: true, layer3: true, layer4: { score: 92 } }, status: "approved", tgl_klaim: "2026-05-10T08:00:00Z" },
];

export interface MockBlog {
  subdomain: string;
  nm_tampilan: string;
  fakultas: string;
  role: "MHS" | "STAF" | "DOSEN" | "ALUMNI";
  jumlah_post: number;
  jumlah_view: number;
  a_aktif: boolean;
  a_terverifikasi: boolean;
  tgl_klaim: string;
}

export const MOCK_BLOGS: MockBlog[] = [
  { subdomain: "2117051070-mhs", nm_tampilan: "Mizar Zulmi", fakultas: "FMIPA", role: "MHS", jumlah_post: 23, jumlah_view: 12340, a_aktif: true, a_terverifikasi: false, tgl_klaim: "2024-01-15T00:00:00Z" },
  { subdomain: "rektor-staf", nm_tampilan: "Prof. Dr. Lusmeilia Afriani", fakultas: "FT", role: "STAF", jumlah_post: 45, jumlah_view: 89230, a_aktif: true, a_terverifikasi: true, tgl_klaim: "2023-08-01T00:00:00Z" },
  { subdomain: "rina-dosen", nm_tampilan: "Dr. Rina Hartanti", fakultas: "FMIPA", role: "DOSEN", jumlah_post: 67, jumlah_view: 34520, a_aktif: true, a_terverifikasi: true, tgl_klaim: "2023-09-15T00:00:00Z" },
  { subdomain: "1957081076-mhs", nm_tampilan: "Aulia Rahma", fakultas: "FKIP", role: "MHS", jumlah_post: 34, jumlah_view: 8760, a_aktif: true, a_terverifikasi: false, tgl_klaim: "2024-02-10T00:00:00Z" },
  { subdomain: "2017011019-mhs", nm_tampilan: "Bagus Setiawan", fakultas: "FT", role: "MHS", jumlah_post: 56, jumlah_view: 23410, a_aktif: true, a_terverifikasi: false, tgl_klaim: "2023-11-20T00:00:00Z" },
  { subdomain: "siti-staf", nm_tampilan: "Siti Nurhaliza, S.A.P.", fakultas: "BAK", role: "STAF", jumlah_post: 42, jumlah_view: 56780, a_aktif: true, a_terverifikasi: true, tgl_klaim: "2024-03-05T00:00:00Z" },
  { subdomain: "spam-test-mhs", nm_tampilan: "Test User Suspended", fakultas: "FT", role: "MHS", jumlah_post: 5, jumlah_view: 234, a_aktif: false, a_terverifikasi: false, tgl_klaim: "2025-12-01T00:00:00Z" },
];

export const MOCK_KATA_TERLARANG = [
  { id: "1",  kata: "admin",     kategori: "system",    keterangan: "Path admin panel" },
  { id: "2",  kata: "root",      kategori: "system",    keterangan: "Reserved system" },
  { id: "3",  kata: "rektor",    kategori: "role",      keterangan: "Reserved untuk akun resmi rektor" },
  { id: "4",  kata: "dekan",     kategori: "role",      keterangan: "Reserved untuk dekan (pre-claim per fakultas)" },
  { id: "5",  kata: "unila",     kategori: "brand",     keterangan: "Universitas Lampung brand" },
  { id: "6",  kata: "myunila",   kategori: "brand",     keterangan: "Brand portal" },
  { id: "7",  kata: "judi",      kategori: "offensive", keterangan: "Gambling" },
  { id: "8",  kata: "porno",     kategori: "offensive", keterangan: "Adult content" },
];

export interface MockTag {
  id: string;
  slug: string;
  nm_tag: string;
  deskripsi?: string;
  jumlah_post: number;
  a_aktif: boolean;
  tgl_create: string;
}

export const MOCK_TAGS: MockTag[] = [
  { id: "t1",  slug: "nextjs",      nm_tag: "Next.js",       deskripsi: "React framework",       jumlah_post: 23, a_aktif: true, tgl_create: "2024-01-15T00:00:00Z" },
  { id: "t2",  slug: "go",          nm_tag: "Go",            deskripsi: "Bahasa pemrograman",     jumlah_post: 18, a_aktif: true, tgl_create: "2024-01-20T00:00:00Z" },
  { id: "t3",  slug: "database",    nm_tag: "Database",      deskripsi: "SQL, NoSQL, design",     jumlah_post: 15, a_aktif: true, tgl_create: "2024-02-01T00:00:00Z" },
  { id: "t4",  slug: "skripsi",     nm_tag: "Skripsi",       deskripsi: "Tugas akhir",            jumlah_post: 34, a_aktif: true, tgl_create: "2024-02-10T00:00:00Z" },
  { id: "t5",  slug: "docker",      nm_tag: "Docker",        deskripsi: "Container platform",     jumlah_post: 12, a_aktif: true, tgl_create: "2024-03-01T00:00:00Z" },
  { id: "t6",  slug: "unila",       nm_tag: "Unila",         deskripsi: "Universitas Lampung",    jumlah_post: 67, a_aktif: true, tgl_create: "2024-01-01T00:00:00Z" },
  { id: "t7",  slug: "mahasiswa",   nm_tag: "Mahasiswa",     deskripsi: "Kehidupan mahasiswa",    jumlah_post: 89, a_aktif: true, tgl_create: "2024-01-05T00:00:00Z" },
  { id: "t8",  slug: "dosen",       nm_tag: "Dosen",         deskripsi: "Perspektif dosen",       jumlah_post: 24, a_aktif: true, tgl_create: "2024-01-10T00:00:00Z" },
  { id: "t9",  slug: "riset",       nm_tag: "Riset",         deskripsi: "Penelitian akademik",    jumlah_post: 45, a_aktif: true, tgl_create: "2024-01-12T00:00:00Z" },
  { id: "t10", slug: "karir",       nm_tag: "Karir",         deskripsi: "Pengembangan diri",      jumlah_post: 31, a_aktif: true, tgl_create: "2024-02-15T00:00:00Z" },
  { id: "t11", slug: "opensource",  nm_tag: "Open Source",   deskripsi: "OSS & komunitas",        jumlah_post: 9,  a_aktif: true, tgl_create: "2024-03-10T00:00:00Z" },
  { id: "t12", slug: "tutorial",    nm_tag: "Tutorial",      deskripsi: "Panduan step-by-step",   jumlah_post: 28, a_aktif: true, tgl_create: "2024-01-25T00:00:00Z" },
  { id: "t13", slug: "spam-old",    nm_tag: "spam-test-old", deskripsi: "Test tag inactive",     jumlah_post: 0,  a_aktif: false, tgl_create: "2024-04-01T00:00:00Z" },
];

export const MOCK_KATEGORI_LIST = [
  { id: "k1",  slug: "teknologi", nm_kategori: "Teknologi",            jumlah_post: 142, warna: "#3B82F6", a_aktif: true },
  { id: "k2",  slug: "pendidikan", nm_kategori: "Pendidikan",          jumlah_post: 98,  warna: "#10B981", a_aktif: true },
  { id: "k3",  slug: "riset", nm_kategori: "Riset & Penelitian",       jumlah_post: 76,  warna: "#8B5CF6", a_aktif: true },
  { id: "k4",  slug: "opini", nm_kategori: "Opini",                    jumlah_post: 124, warna: "#F59E0B", a_aktif: true },
  { id: "k5",  slug: "berita-kampus", nm_kategori: "Berita Kampus",    jumlah_post: 203, warna: "#EF4444", a_aktif: true },
  { id: "k6",  slug: "tutorial", nm_kategori: "Tutorial",              jumlah_post: 89,  warna: "#0891B2", a_aktif: true },
];

export const MOCK_AUDIT = [
  { id: "a1", tgl: "2026-05-12T15:30:00Z", pengguna: "Mizar Zulmi", aksi: "publish_post",   entitas: "post",  detail: "Publish 'Belajar Next.js 15'" },
  { id: "a2", tgl: "2026-05-12T14:00:00Z", pengguna: "Admin",       aksi: "approve_claim",  entitas: "klaim", detail: "Approve klaim 'rina-dosen'" },
  { id: "a3", tgl: "2026-05-12T11:00:00Z", pengguna: "Mizar Zulmi", aksi: "create_post",    entitas: "post",  detail: "Create draft 'Refleksi Magang'" },
  { id: "a4", tgl: "2026-05-11T20:00:00Z", pengguna: "Admin",       aksi: "suspend_blog",   entitas: "blog",  detail: "Suspend 'spam-test-mhs'" },
  { id: "a5", tgl: "2026-05-11T16:00:00Z", pengguna: "Aulia Rahma", aksi: "update_post",    entitas: "post",  detail: "Update 'Lampu Jalan'" },
  { id: "a6", tgl: "2026-05-10T10:00:00Z", pengguna: "Admin",       aksi: "feature_post",   entitas: "post",  detail: "Mark featured 'Visi Unila 2030'" },
];
