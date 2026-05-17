# Blog Platform myUnila — Database Schema

**Database:** PostgreSQL 16 (dedicated instance di vm9-blog)
**DB name:** `blog_unila`
**Convention:** Mengikuti `simbak` & `si_prestasi` (UUID PK, schemas terpisah, audit cols, soft delete)

---

## 1. Schemas

| Schema | Isi |
|---|---|
| `ref` | Master/referensi (kategori, tag, tipe role, template theme, kata terlarang) |
| `blog` | Core: blog (per-user), post, post_revision, post_tag |
| `media` | Media library (file uploads) |
| `interaction` | Komentar, like, view, follower |
| `moderation` | Klaim subdomain, laporan post, riwayat moderasi |
| `audit` | Jejak audit aksi pengguna |

---

## 2. Naming Convention

| Pattern | Contoh | Keterangan |
|---|---|---|
| **Schema** | `ref`, `blog`, `media`, `interaction`, `moderation`, `audit` | Lowercase, max 12 char |
| **PK** | `id_<table> UUID PRIMARY KEY DEFAULT gen_random_uuid()` | UUID v4 |
| **FK internal** | `id_<referensi> UUID REFERENCES <schema>.<tabel>(id_<tabel>)` | Constraint name auto |
| **FK cross-DB pdut** | `id_<entity>_pdut UUID NULL` | NO physical FK (cross-engine), suffix `_pdut` |
| **Name field** | `nm_<field>` | `nm_blog`, `nm_kategori`, `nm_tampilan` |
| **Date field** | `tgl_<field>` | `tgl_terbit`, `tgl_jadwal`, `tgl_klaim` |
| **Boolean** | `a_<field> BOOLEAN DEFAULT FALSE/TRUE` | `a_aktif`, `a_publik`, `a_unggulan` |
| **JSONB** | `<purpose>_json JSONB` | `theme_config_json`, `meta_seo_json`, `sosmed_json` |
| **Audit** | `id_creator UUID NULL`<br>`id_updater UUID NULL`<br>`created_at TIMESTAMP NOT NULL DEFAULT NOW()`<br>`updated_at TIMESTAMP NOT NULL DEFAULT NOW()`<br>`soft_delete TIMESTAMP NULL` | `id_creator/id_updater` = UUID dari `pdut.man_akses.pengguna` |
| **Index** | `idx_<tabel>_<kolom>` | Btree default. Partial untuk `WHERE soft_delete IS NULL` |

---

## 3. Cross-DB References

`blog_unila` (PostgreSQL) tidak punya FK fisik ke `pdut` (SQL Server). Kolom `*_pdut` menyimpan UUID yang resolve via dual connection di backend (sama pattern dgn simbak & si_prestasi).

Tabel pdut yang di-reference:

| pdut Table | Dipakai untuk | Kolom blog_unila |
|---|---|---|
| `man_akses.pengguna` | Author identity (NIM/NIP, nama lengkap, email, foto) | `id_pengguna_pdut` di hampir semua tabel |
| `man_akses.peran` | Role (mahasiswa/staf/dosen/admin) | Resolve via `id_pengguna_pdut` |
| `man_akses.unit_organisasi` | Fakultas (untuk badge & filter) | Resolve via `id_pengguna_pdut` |
| `siakadu.peserta_didik` | Data mahasiswa (NIM, prodi, angkatan) | Resolve untuk subdomain mhs |
| `pdrd.sms` | Prodi (untuk badge & filter) | Resolve via `peserta_didik` |
| `ref.sdm` | Data dosen/staf (NIP, jabatan) | Resolve untuk subdomain staf/dosen |

---

## 4. ER Diagram (high-level)

```
                          ref.tipe_role
                                │
                                │ 1..N
                                ▼
   pdut.man_akses.pengguna ──── blog.blog ────────────────┐
   (cross-DB UUID)              │                          │
                                │ 1..N                     │ 1..N
                                ▼                          ▼
                          blog.post ─── blog.post_tag ──── ref.tag
                          │ │
                          │ │ N..1
                          │ ▼
                          │ ref.kategori_post
                          │
                          │ 1..N
                          ├──→ blog.post_revision
                          ├──→ media.media
                          ├──→ interaction.komentar (P2)
                          ├──→ interaction.like_post (P2)
                          ├──→ interaction.view_post
                          └──→ moderation.laporan_post (P2)

   blog.blog ──→ ref.template_theme
              ──→ moderation.klaim_subdomain (history klaim)
              ──→ interaction.follower (P2)

   audit.jejak_audit (independent, log semua aksi)
```

---

## 5. Tabel Detail

### 5.1 `ref.tipe_role`

Civitas type (mahasiswa/staf/dosen/alumni). Menentukan suffix subdomain.

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id_tipe_role` | UUID | PK, default gen_random_uuid() | |
| `kode` | VARCHAR(16) | NOT NULL UNIQUE | `MHS`, `STAF`, `DOSEN`, `ALUMNI` |
| `suffix_subdomain` | VARCHAR(16) | NOT NULL UNIQUE | `-mhs`, `-staf`, `-dosen`, `-alumni` |
| `nm_tipe` | VARCHAR(60) | NOT NULL | `Mahasiswa`, `Staf/Tendik`, dst |
| `urutan` | INT | NOT NULL DEFAULT 0 | |
| `a_aktif` | BOOLEAN | NOT NULL DEFAULT TRUE | |
| audit cols | | | |

**Seed:** 4 baris (MHS/STAF/DOSEN/ALUMNI).

---

### 5.2 `ref.kategori_post`

Kategori artikel global (admin curated). Multi-select hingga 3 per post (via JSON kolom `id_kategori_post_array_json` di post atau via tabel relasi terpisah — di MVP kita pakai 1 kategori utama via FK).

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id_kategori_post` | UUID | PK | |
| `slug` | VARCHAR(60) | NOT NULL UNIQUE | URL-safe |
| `nm_kategori` | VARCHAR(120) | NOT NULL | |
| `deskripsi` | TEXT | NULL | |
| `icon_name` | VARCHAR(60) | NULL | react-icons name |
| `warna` | VARCHAR(7) | NULL | hex `#3B82F6` |
| `urutan` | INT | NOT NULL DEFAULT 0 | |
| `jumlah_post` | INT | NOT NULL DEFAULT 0 | Denormalized counter |
| `a_aktif` | BOOLEAN | NOT NULL DEFAULT TRUE | |
| audit cols | | | |

**Seed (~20 kategori):** Teknologi, Pendidikan, Riset, Opini, Sastra, Olahraga, Berita Kampus, Kewirausahaan, Pengabdian, Lingkungan, Seni & Budaya, Kesehatan, Hukum, Ekonomi, Politik, Internasional, Tutorial, Karir, Beasiswa, Lainnya.

---

### 5.3 `ref.tag`

Tag bebas (auto-create dari post). Frekuensi denormalized untuk autocomplete cepat.

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id_tag` | UUID | PK | |
| `slug` | VARCHAR(80) | NOT NULL UNIQUE | |
| `nm_tag` | VARCHAR(80) | NOT NULL | |
| `frekuensi` | INT | NOT NULL DEFAULT 0 | Update via trigger atau cron |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT NOW() | |

**Index:** `idx_tag_frekuensi DESC` (untuk top tags).

---

### 5.4 `ref.template_theme`

Registry template. Default ada 2 di MVP (`modern`, `minimalist`), custom upload P2.

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id_template_theme` | UUID | PK | |
| `kode` | VARCHAR(40) | NOT NULL UNIQUE | `modern`, `minimalist`, `magazine`, `academic` |
| `nm_template` | VARCHAR(120) | NOT NULL | |
| `deskripsi` | TEXT | NULL | |
| `preview_url` | TEXT | NULL | URL screenshot |
| `manifest_json` | JSONB | NOT NULL DEFAULT '{}' | Spec component & layout |
| `a_default` | BOOLEAN | NOT NULL DEFAULT FALSE | Hanya 1 baris boleh TRUE |
| `a_aktif` | BOOLEAN | NOT NULL DEFAULT TRUE | |
| `versi` | VARCHAR(16) | NOT NULL DEFAULT '1.0.0' | Semver |
| audit cols | | | |

**Seed MVP:** `modern` (default), `minimalist`.

---

### 5.5 `ref.kata_terlarang`

Reserved words untuk validation subdomain (~200 list).

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id_kata_terlarang` | UUID | PK | |
| `kata` | VARCHAR(80) | NOT NULL UNIQUE | Lowercase |
| `kategori` | VARCHAR(20) | NOT NULL | `system`/`role`/`brand`/`offensive` |
| `keterangan` | TEXT | NULL | Alasan banned |
| audit cols | | | |

**Seed (sample):** admin, root, www, blog, unila, dosen, mhs, staff, kampus, rektor, dekan, www, api, mail, ftp, ssh, root, support, dst.

---

### 5.6 `blog.blog`

Per-user blog (1 user = 1 blog). Subdomain unique global.

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id_blog` | UUID | PK | |
| `id_pengguna_pdut` | UUID | NOT NULL UNIQUE | FK cross-DB ke `pdut.man_akses.pengguna` |
| `id_tipe_role` | UUID | NOT NULL REFERENCES ref.tipe_role | |
| `subdomain` | VARCHAR(60) | NOT NULL UNIQUE | e.g. `2117051070-mhs`, `rektor-staf` |
| `nm_blog` | VARCHAR(200) | NOT NULL | Display title |
| `nm_tampilan` | VARCHAR(120) | NULL | Override nama author (kalau pseudonym). Default = nama dari pdut. |
| `tagline` | VARCHAR(255) | NULL | Subtitle blog |
| `deskripsi` | TEXT | NULL | Long description |
| `avatar_url` | TEXT | NULL | |
| `cover_url` | TEXT | NULL | |
| `bio` | TEXT | NULL | Author bio (max 500 char) |
| `lokasi` | VARCHAR(120) | NULL | |
| `sosmed_json` | JSONB | NOT NULL DEFAULT '{}' | `{twitter, instagram, linkedin, github, orcid, scholar, website}` |
| `id_template_theme` | UUID | NULL REFERENCES ref.template_theme | NULL = pakai default |
| `theme_config_json` | JSONB | NOT NULL DEFAULT '{}' | Override warna, font, layout |
| `bahasa` | VARCHAR(10) | NOT NULL DEFAULT 'id' | `id`/`en` |
| `timezone` | VARCHAR(40) | NOT NULL DEFAULT 'Asia/Jakarta' | |
| `a_aktif` | BOOLEAN | NOT NULL DEFAULT TRUE | Admin bisa suspend |
| `a_publik` | BOOLEAN | NOT NULL DEFAULT TRUE | FALSE = login-only |
| `a_komentar_aktif` | BOOLEAN | NOT NULL DEFAULT TRUE | Default allow comments |
| `a_terverifikasi` | BOOLEAN | NOT NULL DEFAULT FALSE | Verified badge (admin) |
| `tgl_klaim` | TIMESTAMP | NULL | Kapan subdomain di-claim |
| `tgl_rename_terakhir` | TIMESTAMP | NULL | Untuk cooldown 90 hari |
| `jumlah_post` | INT | NOT NULL DEFAULT 0 | Denormalized |
| `jumlah_view` | BIGINT | NOT NULL DEFAULT 0 | Lifetime |
| `jumlah_follower` | INT | NOT NULL DEFAULT 0 | |
| `meta_seo_json` | JSONB | NOT NULL DEFAULT '{}' | `{og_image, default_meta_desc}` |
| audit cols | | | |

**Index:**
- `idx_blog_subdomain` (sudah unique)
- `idx_blog_pengguna` ON `id_pengguna_pdut` WHERE `soft_delete IS NULL`
- `idx_blog_tipe_role` ON `id_tipe_role`
- `idx_blog_jumlah_view` ON `jumlah_view DESC` (untuk top blogs)

---

### 5.7 `blog.post`

Artikel.

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id_post` | UUID | PK | |
| `id_blog` | UUID | NOT NULL REFERENCES blog.blog | |
| `id_kategori_post` | UUID | NULL REFERENCES ref.kategori_post | Nullable kalau "Lainnya" |
| `judul` | VARCHAR(255) | NOT NULL | |
| `slug` | VARCHAR(255) | NOT NULL | UNIQUE (id_blog, slug) |
| `ringkasan` | VARCHAR(500) | NULL | Excerpt |
| `konten_html` | TEXT | NULL | TipTap output untuk render cepat |
| `konten_json` | JSONB | NULL | TipTap JSON untuk re-edit |
| `konten_md` | TEXT | NULL | Markdown export (opsional) |
| `cover_url` | TEXT | NULL | |
| `status` | VARCHAR(20) | NOT NULL DEFAULT 'draft' | `draft`/`review`/`published`/`scheduled`/`archived`/`trash` |
| `visibilitas` | VARCHAR(20) | NOT NULL DEFAULT 'public' | `public`/`unlisted`/`private`/`password` |
| `password_hash` | VARCHAR(255) | NULL | bcrypt jika visibilitas=password |
| `tgl_terbit` | TIMESTAMP | NULL | Diisi saat status→published |
| `tgl_jadwal` | TIMESTAMP | NULL | Untuk scheduled |
| `a_pinned` | BOOLEAN | NOT NULL DEFAULT FALSE | Pin di top blog |
| `a_unggulan` | BOOLEAN | NOT NULL DEFAULT FALSE | Featured (admin set) |
| `a_komentar_aktif` | BOOLEAN | NOT NULL DEFAULT TRUE | Override per-post |
| `jumlah_view` | INT | NOT NULL DEFAULT 0 | |
| `jumlah_like` | INT | NOT NULL DEFAULT 0 | |
| `jumlah_komentar` | INT | NOT NULL DEFAULT 0 | |
| `jumlah_share` | INT | NOT NULL DEFAULT 0 | |
| `waktu_baca_menit` | INT | NOT NULL DEFAULT 0 | Auto-calc |
| `jumlah_kata` | INT | NOT NULL DEFAULT 0 | Auto-calc |
| `meta_seo_json` | JSONB | NOT NULL DEFAULT '{}' | `{og_title, og_image, meta_desc, canonical_url, no_index}` |
| `bahasa` | VARCHAR(10) | NOT NULL DEFAULT 'id' | |
| audit cols | | | |

**Constraints:**
- `UNIQUE (id_blog, slug) WHERE soft_delete IS NULL`
- `CHECK (status IN ('draft','review','published','scheduled','archived','trash'))`
- `CHECK (visibilitas IN ('public','unlisted','private','password'))`

**Index:**
- `idx_post_blog_status` ON `(id_blog, status)` WHERE `soft_delete IS NULL`
- `idx_post_kategori` ON `id_kategori_post` WHERE `status='published' AND soft_delete IS NULL`
- `idx_post_tgl_terbit` ON `tgl_terbit DESC` WHERE `status='published'`
- `idx_post_jumlah_view` ON `jumlah_view DESC` WHERE `status='published'`
- `idx_post_unggulan` ON `tgl_terbit DESC` WHERE `a_unggulan=TRUE AND status='published'`
- GIN on `to_tsvector('indonesian', judul || ' ' || COALESCE(ringkasan,''))` (FTS fallback kalau Meilisearch down)

---

### 5.8 `blog.post_tag`

Many-to-many post ⇄ tag.

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_post_tag` | UUID | PK |
| `id_post` | UUID | NOT NULL REFERENCES blog.post ON DELETE CASCADE |
| `id_tag` | UUID | NOT NULL REFERENCES ref.tag |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT NOW() |

**Index:** UNIQUE `(id_post, id_tag)`, `idx_post_tag_tag` ON `id_tag`.

---

### 5.9 `blog.post_revision`

Version history untuk undo + audit.

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_post_revision` | UUID | PK |
| `id_post` | UUID | NOT NULL REFERENCES blog.post ON DELETE CASCADE |
| `nomor_revisi` | INT | NOT NULL |
| `judul_snapshot` | VARCHAR(255) | NOT NULL |
| `ringkasan_snapshot` | VARCHAR(500) | NULL |
| `konten_html_snapshot` | TEXT | NULL |
| `konten_json_snapshot` | JSONB | NULL |
| `catatan` | VARCHAR(255) | NULL — `auto_save`/`manual_save`/`publish`/`schedule` |
| `id_creator` | UUID | NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT NOW() |

**Index:** `idx_post_revision_post` ON `(id_post, nomor_revisi DESC)`.
**Retention:** Keep last 50 revision per post (cleanup via cron).

---

### 5.10 `media.media`

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_media` | UUID | PK |
| `id_blog` | UUID | NOT NULL REFERENCES blog.blog |
| `id_pengguna_pdut` | UUID | NOT NULL — uploader |
| `nama_file` | VARCHAR(255) | NOT NULL |
| `path_storage` | VARCHAR(500) | NOT NULL — MinIO key |
| `url_publik` | VARCHAR(500) | NOT NULL — CDN URL |
| `mime_type` | VARCHAR(100) | NOT NULL |
| `ukuran_bytes` | BIGINT | NOT NULL |
| `lebar_px` | INT | NULL — image only |
| `tinggi_px` | INT | NULL — image only |
| `durasi_detik` | INT | NULL — video/audio |
| `varian_json` | JSONB | NOT NULL DEFAULT '{}' — `{thumbnail, medium, large}` URL |
| `alt_text` | VARCHAR(255) | NULL |
| `caption` | TEXT | NULL |
| `jenis_media` | VARCHAR(20) | NOT NULL — `image`/`video`/`audio`/`document`/`other` |
| audit cols | | |

**Index:** `idx_media_blog` ON `id_blog`, `idx_media_jenis` ON `jenis_media`.

---

### 5.11 `interaction.komentar` (P2 — siap dari MVP)

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_komentar` | UUID | PK |
| `id_post` | UUID | NOT NULL REFERENCES blog.post ON DELETE CASCADE |
| `id_komentar_parent` | UUID | NULL REFERENCES interaction.komentar — threaded |
| `id_pengguna_pdut` | UUID | NULL — NULL = anonymous |
| `nm_komentator` | VARCHAR(120) | NULL — kalau anonymous |
| `email_komentator` | VARCHAR(120) | NULL |
| `isi` | TEXT | NOT NULL |
| `status_moderasi` | VARCHAR(20) | NOT NULL DEFAULT 'pending' — `pending`/`approved`/`spam`/`rejected` |
| `ip_alamat` | INET | NULL |
| `user_agent` | VARCHAR(255) | NULL |
| `jumlah_like` | INT | NOT NULL DEFAULT 0 |
| `a_pinned` | BOOLEAN | NOT NULL DEFAULT FALSE |
| audit cols | | |

**Index:** `idx_komentar_post_status` ON `(id_post, status_moderasi)`, `idx_komentar_parent` ON `id_komentar_parent`.

---

### 5.12 `interaction.like_post` (P2)

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_like_post` | UUID | PK |
| `id_post` | UUID | NOT NULL REFERENCES blog.post ON DELETE CASCADE |
| `id_pengguna_pdut` | UUID | NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT NOW() |

**Index:** UNIQUE `(id_post, id_pengguna_pdut)`.

---

### 5.13 `interaction.view_post`

Tracking view granular untuk trending. Anonymous via ip_hash (privacy).

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_view_post` | UUID | PK |
| `id_post` | UUID | NOT NULL REFERENCES blog.post ON DELETE CASCADE |
| `id_pengguna_pdut` | UUID | NULL |
| `ip_hash` | VARCHAR(64) | NULL — sha256(ip + user_agent + salt) untuk dedup tanpa simpan PII |
| `referer` | VARCHAR(500) | NULL |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT NOW() |

**Partition:** Monthly (untuk performance & retention 6 bulan).
**Index:** `idx_view_post_post_created` ON `(id_post, created_at DESC)`.

---

### 5.14 `interaction.follower` (P2)

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_follower` | UUID | PK |
| `id_blog` | UUID | NOT NULL REFERENCES blog.blog — yang di-follow |
| `id_pengguna_pdut` | UUID | NOT NULL — yang follow |
| `tgl_follow` | TIMESTAMP | NOT NULL DEFAULT NOW() |

**Index:** UNIQUE `(id_blog, id_pengguna_pdut)`, `idx_follower_pengguna` ON `id_pengguna_pdut`.

---

### 5.15 `moderation.klaim_subdomain`

History request klaim + 4-layer validation hasil.

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_klaim_subdomain` | UUID | PK |
| `id_pengguna_pdut` | UUID | NOT NULL |
| `id_tipe_role` | UUID | NOT NULL REFERENCES ref.tipe_role |
| `subdomain_diminta` | VARCHAR(60) | NOT NULL |
| `alasan_subdomain` | TEXT | NULL — justification kalau borderline |
| `validasi_json` | JSONB | NOT NULL DEFAULT '{}' — hasil 4 layer (`{layer1_format, layer2_reserved, layer3_unique, layer4_impersonation}`) |
| `status` | VARCHAR(20) | NOT NULL DEFAULT 'pending' — `pending`/`auto_approved`/`manual_review`/`approved`/`rejected` |
| `catatan_moderator` | TEXT | NULL |
| `id_moderator_pdut` | UUID | NULL |
| `tgl_diputuskan` | TIMESTAMP | NULL |
| audit cols | | |

**Index:** `idx_klaim_status` ON `status` WHERE `status IN ('pending','manual_review')`.

---

### 5.16 `moderation.laporan_post` (P2)

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_laporan_post` | UUID | PK |
| `id_post` | UUID | NOT NULL REFERENCES blog.post |
| `id_pelapor_pdut` | UUID | NULL — bisa anonymous |
| `alasan` | VARCHAR(60) | NOT NULL — `spam`/`plagiarism`/`hate_speech`/`misinfo`/`copyright`/`lainnya` |
| `detail` | TEXT | NULL |
| `status` | VARCHAR(20) | NOT NULL DEFAULT 'pending' — `pending`/`reviewed`/`actioned`/`dismissed` |
| `tindakan` | VARCHAR(60) | NULL — `none`/`hide_post`/`suspend_blog`/`warn_user`/`ban_user` |
| `id_moderator_pdut` | UUID | NULL |
| `tgl_diputuskan` | TIMESTAMP | NULL |
| audit cols | | |

---

### 5.17 `audit.jejak_audit`

Log aksi pengguna (independent dari tabel utama).

| Kolom | Tipe | Constraint |
|---|---|---|
| `id_jejak_audit` | UUID | PK |
| `id_pengguna_pdut` | UUID | NULL |
| `aksi` | VARCHAR(60) | NOT NULL — `create_post`/`publish_post`/`delete_post`/`claim_subdomain`/`approve_claim`/`suspend_blog`/dst |
| `entitas` | VARCHAR(60) | NOT NULL — `post`/`blog`/`komentar`/`media`/`klaim`/dst |
| `id_entitas` | UUID | NULL |
| `detail_json` | JSONB | NOT NULL DEFAULT '{}' |
| `ip_alamat` | INET | NULL |
| `user_agent` | VARCHAR(255) | NULL |
| `created_at` | TIMESTAMP | NOT NULL DEFAULT NOW() |

**Partition:** Monthly. **Retention:** 1 tahun.
**Index:** `idx_audit_pengguna_created` ON `(id_pengguna_pdut, created_at DESC)`, `idx_audit_entitas` ON `(entitas, id_entitas)`.

---

## 6. Triggers & Jobs

| Trigger / Job | Tujuan |
|---|---|
| Trigger `blog.post` AFTER INSERT/DELETE | Update `blog.blog.jumlah_post` denormalized counter |
| Trigger `interaction.like_post` AFTER INSERT/DELETE | Update `blog.post.jumlah_like` |
| Trigger `interaction.komentar` AFTER INSERT (status='approved') | Update `blog.post.jumlah_komentar` |
| Trigger `blog.post_tag` AFTER INSERT/DELETE | Update `ref.tag.frekuensi` |
| Cron job (every 1 min) di blog-service | Cek post status='scheduled' AND tgl_jadwal <= NOW() → set status='published', tgl_terbit=NOW() |
| Cron job (daily) | Cleanup `blog.post_revision` keep last 50 per post |
| Cron job (daily) | Cleanup `interaction.view_post` rentang > 6 bulan |
| Cron job (hourly) | Recompute trending score per post (cache di Redis) |
| Cron job (daily) | Sync ke Meilisearch `blog_posts` index |

---

## 7. Sample Query

### Top trending posts (apex)

```sql
WITH trending AS (
    SELECT
        p.id_post, p.id_blog, p.judul, p.slug, p.ringkasan, p.cover_url,
        p.tgl_terbit, p.jumlah_view, p.jumlah_like, p.jumlah_komentar,
        b.subdomain, b.nm_blog, b.nm_tampilan, b.avatar_url,
        EXTRACT(EPOCH FROM (NOW() - p.tgl_terbit)) / 3600 AS umur_jam
    FROM blog.post p
    JOIN blog.blog b ON b.id_blog = p.id_blog AND b.a_aktif = TRUE
    WHERE p.status = 'published'
      AND p.visibilitas = 'public'
      AND p.soft_delete IS NULL
      AND p.tgl_terbit > NOW() - INTERVAL '30 days'
)
SELECT *,
    (jumlah_view * 1.0 + jumlah_like * 5.0 + jumlah_komentar * 10.0)
        * EXP(-umur_jam / 72.0) AS skor_trending
FROM trending
ORDER BY skor_trending DESC
LIMIT 20;
```

### Posts oleh subdomain

```sql
SELECT p.*, k.nm_kategori, k.warna AS warna_kategori
FROM blog.post p
JOIN blog.blog b ON b.id_blog = p.id_blog
LEFT JOIN ref.kategori_post k ON k.id_kategori_post = p.id_kategori_post
WHERE b.subdomain = $1
  AND p.status = 'published'
  AND p.visibilitas IN ('public','unlisted')
  AND p.soft_delete IS NULL
ORDER BY p.tgl_terbit DESC
LIMIT $2 OFFSET $3;
```

### Search via Meilisearch (proxy di backend)

Backend kirim ke Meilisearch:
```json
POST http://meilisearch:7700/indexes/blog_posts/search
{
  "q": "next.js routing",
  "filter": ["status = published", "visibilitas = public"],
  "facets": ["kategori", "tipe_role", "fakultas"],
  "limit": 20,
  "offset": 0,
  "sort": ["tgl_terbit:desc"]
}
```

Document indexed:
```json
{
  "id_post": "uuid",
  "judul": "...",
  "ringkasan": "...",
  "konten_text": "stripped HTML",  // for full-text search
  "subdomain": "...",
  "nm_blog": "...",
  "nm_tampilan": "...",
  "avatar_url": "...",
  "kategori": "Teknologi",
  "tags": ["nextjs","react"],
  "tipe_role": "MHS",
  "fakultas": "Teknik",
  "tgl_terbit": 1747200000,
  "jumlah_view": 123,
  "cover_url": "..."
}
```

---

## 8. SQL File Output

Schema fresh akan ditulis di:
- **`data-model/script/postgresql/blog/01-blog_unila_v1.0_fresh.sql`** — fresh deploy
- **`data-model/script/postgresql/blog/02-blog_unila_v1.0_seed.sql`** — seed `ref.tipe_role`, `ref.kategori_post`, `ref.template_theme` (modern + minimalist), `ref.kata_terlarang` (~200 list)
