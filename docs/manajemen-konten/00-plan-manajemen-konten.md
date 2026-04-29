# Plan — Manajemen Konten Service (myUnila)

**Status**: DRAFT untuk review
**Tanggal**: 2026-04-29
**Target VM**: VM3 (backend2 — Go services)
**Schema target**: `man_konten` di pdut/pdut_staging (SQL Server 192.168.123.119)
**Kategori portal**: Tools & Utilities
**Slug aplikasi**: `manajemen-konten`

---

## 1. Konteks & Tujuan

Saat ini halaman portal (`/portal`, `/portal/announcements`) pakai **dummy data hardcoded** di frontend. User minta dibuatkan service backend yang real untuk:

1. **Notifikasi push** — bell icon di navbar portal samping role badge (badge counter unread)
2. **Pengumuman** — card list di dashboard portal
3. **Berita** — card list di dashboard portal (di bawah pengumuman)

Plus admin CMS untuk CRUD ketiga jenis konten tersebut + targeting per peran/unit.

### Tujuan teknis

- Service Go independen di VM3 (mirip myunila-service / sister-service / feeder-service / keuangan-service)
- Shared SQL Server pdut, schema baru `man_konten`
- REST API consumed by:
  - Portal frontend (pengumuman list, berita list, notification bell)
  - Admin CMS frontend (CRUD pengumuman/berita/broadcast notif)
- Web push (browser) opsional di Phase 2 — Phase 1 cukup in-app notification

---

## 2. Scope Fitur

### Phase 1 (MVP)
1. **Pengumuman**
   - Admin: CRUD (judul, isi, kategori, gambar/banner, tanggal terbit, expiry, pin/featured)
   - Targeting: ALL / per peran / per unit organisasi / per kategori user (mahasiswa/dosen/tendik)
   - Public read: list paginated + detail
   - Frontend portal: card list dengan filter kategori, top 5 di dashboard

2. **Berita**
   - Sama struktur dengan Pengumuman tapi typically lebih panjang (artikel)
   - Tambahan: author, tag, read time, view counter
   - Frontend: card list di bawah pengumuman, halaman detail rich-content

3. **Notifikasi In-App**
   - Generated dari sistem (broadcast manual + auto trigger dari aksi tertentu)
   - Per-user inbox: read/unread, dismiss, click-through ke target URL
   - Bell icon di navbar dengan unread counter
   - Dropdown menampilkan top 10 unread

4. **Admin CMS UI** di `/dashboard/manajemen-konten/`
   - Pengumuman list + form CRUD + preview
   - Berita list + form CRUD + WYSIWYG editor (mungkin Tiptap/Lexical)
   - Broadcast notification form (composer + targeting)
   - Stats: jumlah dibaca, click rate, dll

### Phase 2 (post-MVP, optional)
- **Web Push (browser native)** via Web Push API + VAPID keys
- **Email digest** harian / mingguan
- **Telegram bot integration** untuk admin alert
- **Markdown / WYSIWYG** rich content untuk berita
- **File upload** (banner image, attachments) — pakai MinIO existing
- **Comment/like/share** (kalau dibutuhkan)
- **Schedule publish** (publish at future date/time)

---

## 3. Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend Portal (Next.js, VM1)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ /portal — bell icon + dashboard (pengumuman+berita) │   │
│  │ /dashboard/manajemen-konten — admin CMS (RBAC)      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼ HTTPS via Kong (port 9800)
┌─────────────────────────────────────────────────────────────┐
│  Kong Gateway (VM1)                                         │
│  Route: /man-konten-service/* → vm3:8090 (manajemen-konten) │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  VM3 manajemen-konten-service (Go + Fiber, port 8090)       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ apps/                                                │   │
│  │  ├── pengumuman/    (CRUD + targeting)               │   │
│  │  ├── berita/        (CRUD + view counter)            │   │
│  │  ├── notif/         (broadcast + per-user inbox)     │   │
│  │  ├── kategori/      (ref taxonomy)                   │   │
│  │  ├── target/        (helper: filter by role/unit)    │   │
│  │  └── media/         (banner upload — Phase 2)        │   │
│  │ cmd/api/main.go                                       │   │
│  │ internal/config (env, db, jwt)                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  SQL Server (192.168.123.119)                               │
│  Schema: man_konten                                          │
│  Tables: pengumuman, berita, notifikasi, notif_recipient,   │
│          kategori, target_audience, media (Phase 2)         │
└─────────────────────────────────────────────────────────────┘
```

### Tech stack (mengikuti pattern existing)

- **Language**: Go 1.24+
- **Framework**: Fiber v2
- **DB driver**: `github.com/microsoft/go-mssqldb` via `sqlx`
- **Auth**: JWT-only (validate token issued by auth-service, sama seperti myunila-service)
- **Logger module**: `apps/logger` (sama seperti myunila — record sync_logs untuk operasi admin)
- **Monitoring module**: `apps/monitoring` (sama seperti myunila — singleton)
- **Container**: Alpine multi-stage docker, base myunila-service Dockerfile

### Pola directory (mirror myunila-service)

```
backend/manajemen-konten-service/
├── cmd/
│   └── api/main.go
├── apps/
│   ├── pengumuman/
│   │   ├── entity.go
│   │   ├── repository.go
│   │   ├── service.go
│   │   ├── handler.go
│   │   └── router.go
│   ├── berita/             (sama struktur)
│   ├── notif/              (sama struktur)
│   ├── kategori/
│   ├── api_config/         (mirror myunila)
│   ├── logger/             (mirror myunila)
│   └── monitoring/         (mirror myunila)
├── internal/
│   ├── config/
│   └── middleware/
├── external/
│   ├── database/
│   └── auth/               (JWT validator)
├── pkg/
├── docs/                   (swagger gen output)
├── docker-compose.yml      (untuk standalone local dev)
├── Dockerfile
├── go.mod
├── go.sum
└── README.md
```

---

## 4. Schema Design (`man_konten` di pdut SQL Server)

### Konvensi (mengikuti pdut existing)

- PK uniqueidentifier `NEWID()`
- Audit: `id_creator`, `create_date`, `id_updater`, `last_update`, `soft_delete numeric(1,0) DEFAULT 0`, `last_sync DATETIME`
- Kolom string varchar (bukan nvarchar) — sesuai pdut existing (mis. `kerjasama.mou`, `pdrd.sms`)
- Naming snake_case lowercase
- Schema baru `man_konten` (paralel dengan `man_akses`, `kerjasama`, dst)

### ER (Tabel utama)

```
man_konten.kategori
    id_kategori          UNIQUEIDENTIFIER PK
    kode                 VARCHAR(20) UNIQUE NOT NULL    -- 'akademik', 'beasiswa', dll
    nama                 VARCHAR(100) NOT NULL
    icon_name            VARCHAR(50)                     -- heroicons:academic-cap
    color                VARCHAR(20)                     -- 'blue' / 'green' / 'red'
    jenis                VARCHAR(20) NOT NULL            -- 'pengumuman' | 'berita' | 'both'
    urutan               INT DEFAULT 0
    is_active            BIT NOT NULL DEFAULT 1
    audit cols...

man_konten.pengumuman
    id_pengumuman        UNIQUEIDENTIFIER PK
    judul                VARCHAR(255) NOT NULL
    ringkasan            VARCHAR(500)
    isi                  NVARCHAR(MAX)                   -- rich text/markdown
    id_kategori          UNIQUEIDENTIFIER FK → kategori
    banner_url           VARCHAR(500)                    -- URL gambar (MinIO Phase 2)
    is_pinned            BIT DEFAULT 0
    is_featured          BIT DEFAULT 0
    tgl_terbit           DATETIME NOT NULL
    tgl_expiry           DATETIME NULL
    status               VARCHAR(20) NOT NULL DEFAULT 'draft'  -- draft|published|archived
    target_role          VARCHAR(20) DEFAULT 'all'       -- all|mahasiswa|dosen|tendik|custom
    view_count           INT DEFAULT 0
    audit cols...

man_konten.berita
    id_berita            UNIQUEIDENTIFIER PK
    judul                VARCHAR(255) NOT NULL
    slug                 VARCHAR(255) UNIQUE NOT NULL    -- URL-friendly
    ringkasan            VARCHAR(500)
    isi                  NVARCHAR(MAX)
    id_kategori          UNIQUEIDENTIFIER FK → kategori
    banner_url           VARCHAR(500)
    author               VARCHAR(255)
    tags                 VARCHAR(500)                    -- comma-separated
    is_featured          BIT DEFAULT 0
    tgl_terbit           DATETIME NOT NULL
    status               VARCHAR(20) NOT NULL DEFAULT 'draft'
    target_role          VARCHAR(20) DEFAULT 'all'
    view_count           INT DEFAULT 0
    estimated_read_min   INT DEFAULT 1
    audit cols...

man_konten.notifikasi
    id_notif             UNIQUEIDENTIFIER PK
    tipe                 VARCHAR(30) NOT NULL            -- 'pengumuman'|'berita'|'system'|'reminder'|'alert'
    judul                VARCHAR(255) NOT NULL
    pesan                VARCHAR(1000) NOT NULL
    target_url           VARCHAR(500)                    -- click-through link
    icon_name            VARCHAR(50)
    severity             VARCHAR(20) DEFAULT 'info'      -- info|success|warning|error
    target_role          VARCHAR(20) DEFAULT 'all'
    target_unit_ids      VARCHAR(MAX)                    -- JSON array of id_organisasi
    target_user_ids      VARCHAR(MAX)                    -- JSON array — for direct messaging
    expiry_at            DATETIME
    audit cols...

man_konten.notif_recipient
    id_recipient         UNIQUEIDENTIFIER PK
    id_notif             UNIQUEIDENTIFIER FK → notifikasi
    id_pengguna          UNIQUEIDENTIFIER FK → man_akses.pengguna
    is_read              BIT DEFAULT 0
    read_at              DATETIME NULL
    is_dismissed         BIT DEFAULT 0
    dismissed_at         DATETIME NULL
    delivered_at         DATETIME NOT NULL DEFAULT GETDATE()
    audit cols...
    UNIQUE (id_notif, id_pengguna)

man_konten.target_audience
    id_audience          UNIQUEIDENTIFIER PK
    konten_type          VARCHAR(20) NOT NULL            -- 'pengumuman'|'berita'|'notifikasi'
    konten_id            UNIQUEIDENTIFIER NOT NULL       -- polymorphic: id_pengumuman/berita/notif
    target_type          VARCHAR(20) NOT NULL            -- 'role'|'unit'|'user'|'kategori_user'
    target_value         VARCHAR(100) NOT NULL           -- 'mahasiswa', or UUID, dll
    audit cols...
```

**Indexes**:
- `IX_pengumuman_status_terbit` ON pengumuman(status, tgl_terbit DESC) WHERE soft_delete=0
- `IX_berita_status_terbit` ON berita(status, tgl_terbit DESC) WHERE soft_delete=0
- `IX_notif_recipient_pengguna` ON notif_recipient(id_pengguna, is_read) WHERE soft_delete=0 — untuk fast unread count per user
- `IX_kategori_jenis` ON kategori(jenis, is_active)

### Migration script

File: `data-model/script/sqlserver/man_konten/01-create-man-konten-schema.sql`

Idempotent (`IF NOT EXISTS`), `USE pdut_staging` default, swap to `pdut` for prod. Script include:
1. CREATE SCHEMA man_konten (if not exists)
2. CREATE TABLE kategori, pengumuman, berita, notifikasi, notif_recipient, target_audience
3. CREATE INDEXes
4. INSERT default kategori (Akademik, Kemahasiswaan, Beasiswa, Penelitian, Pengabdian, Sistem, Umum)
5. Verification: count tables created

### Seed default kategori

```sql
INSERT INTO man_konten.kategori (kode, nama, icon_name, color, jenis, urutan, is_active, ...) VALUES
  ('akademik',     'Akademik',          'heroicons:academic-cap',   'blue',    'both', 1, 1, ...),
  ('kemahasiswaan','Kemahasiswaan',     'heroicons:users',          'purple',  'both', 2, 1, ...),
  ('beasiswa',     'Beasiswa',          'heroicons:gift',           'green',   'both', 3, 1, ...),
  ('penelitian',   'Penelitian',        'heroicons:beaker',         'amber',   'both', 4, 1, ...),
  ('pengabdian',   'Pengabdian',        'heroicons:hand-raised',    'rose',    'both', 5, 1, ...),
  ('sistem',       'Sistem & Aplikasi', 'heroicons:cog-6-tooth',    'slate',   'both', 6, 1, ...),
  ('umum',         'Umum',              'heroicons:megaphone',      'sky',     'both', 7, 1, ...);
```

---

## 5. API Endpoints (Phase 1)

Base path: `/api/v1/`. All routes JWT-protected (admin-only for CRUD, all-authenticated for read).

### Pengumuman

```
GET    /pengumuman                    — list paginated + filter (kategori, status, target_role)
GET    /pengumuman/dashboard           — top 5 untuk dashboard portal (published, unexpired)
GET    /pengumuman/:id                 — detail (increment view_count)
POST   /pengumuman                     — create (admin)
PUT    /pengumuman/:id                 — update (admin)
DELETE /pengumuman/:id                 — soft delete (admin)
PATCH  /pengumuman/:id/publish         — publish/archive toggle
GET    /pengumuman/stats               — admin stats (count per status/kategori)
```

### Berita

```
GET    /berita                         — list paginated + filter (kategori, tags)
GET    /berita/dashboard               — top 5 untuk dashboard portal
GET    /berita/slug/:slug              — detail by slug (SEO-friendly)
GET    /berita/:id                     — detail by id
POST   /berita
PUT    /berita/:id
DELETE /berita/:id
PATCH  /berita/:id/publish
GET    /berita/stats
```

### Notifikasi

```
GET    /notif/inbox                    — per-user inbox paginated
GET    /notif/inbox/unread-count       — bell icon badge (cache 30s)
PATCH  /notif/:id/read                 — mark read
PATCH  /notif/:id/dismiss              — dismiss/hide
PATCH  /notif/read-all                 — bulk mark read
POST   /notif/broadcast                — admin broadcast (with targeting)
GET    /notif/broadcasts               — admin list of sent broadcasts
GET    /notif/broadcasts/:id/recipients — admin: see who received + read stats
```

### Kategori (referensi)

```
GET    /kategori?jenis=pengumuman      — list kategori for dropdown
POST   /kategori                       — admin
PUT    /kategori/:id                   — admin
DELETE /kategori/:id                   — admin
```

### Targeting helper

Backend resolves `target_role` + `target_unit_ids` via JWT claims (id_pengguna + role + id_organisasi). Filter di SQL WHERE clause:

```sql
WHERE p.status = 'published'
  AND p.tgl_terbit <= GETDATE()
  AND (p.tgl_expiry IS NULL OR p.tgl_expiry > GETDATE())
  AND p.soft_delete = 0
  AND (
    p.target_role = 'all'
    OR p.target_role = @user_role_kategori   -- mahasiswa/dosen/tendik
    OR EXISTS (SELECT 1 FROM man_konten.target_audience ta
               WHERE ta.konten_id = p.id_pengumuman
                 AND ta.konten_type = 'pengumuman'
                 AND ((ta.target_type='unit' AND ta.target_value = @user_id_organisasi)
                   OR (ta.target_type='user' AND ta.target_value = @user_id_pengguna)))
  )
```

---

## 6. Integration ke Frontend

### 6.1 Portal navbar bell (existing dummy → real)

File: `frontend/src/app/portal/page.tsx` line ~233 (dummy `notifications` array) → ganti dengan fetch `/notif/inbox?limit=10` + poll `/notif/inbox/unread-count` tiap 30s.

UI tetap (sudah ada Dropdown). Tambahkan:
- Click → mark read + redirect ke target_url
- "Mark all as read" button
- "Lihat semua" link → `/portal/notifikasi` (page baru)

### 6.2 Portal dashboard pengumuman + berita

File: `frontend/src/app/portal/page.tsx` — tambah 2 section di main content:
```tsx
<PengumumanWidget limit={5} />   // top 5 pengumuman published
<BeritaWidget limit={5} />        // top 5 berita published
```

Setiap widget pakai card grid responsive, click → halaman detail.

### 6.3 Halaman detail

- `/portal/pengumuman` — list lengkap (existing announcements/page.tsx, replace dummy data)
- `/portal/pengumuman/[id]` — detail (baru)
- `/portal/berita` — list (baru)
- `/portal/berita/[slug]` — detail (baru, SEO-friendly URL)
- `/portal/notifikasi` — full inbox (baru)

### 6.4 Admin CMS

`/dashboard/manajemen-konten/` (RBAC: hanya admin/manajer konten):
- `index` — landing dengan 3 card (Pengumuman/Berita/Notifikasi)
- `pengumuman/` — DataTable + create/edit form
- `berita/` — DataTable + create/edit form (WYSIWYG editor)
- `notifikasi/broadcast` — composer form (judul/pesan/severity/target)
- `notifikasi/sent` — history broadcast
- `kategori/` — manage kategori

### 6.5 Auth-service portal_aplikasi seeder

Tambahkan ke `backend/auth-service/database/seeders/PortalAplikasiSeeder.php`:

```php
['app_slug' => 'manajemen-konten',
 'nm_aplikasi' => 'Manajemen Konten',
 'ket_aplikasi' => 'Kelola pengumuman, berita, dan notifikasi portal',
 'url' => '/dashboard/manajemen-konten',
 'icon_name' => 'heroicons:newspaper',
 'icon_color' => 'text-emerald-600',
 'kategori' => 'Tools & Utilities',
 'urutan' => 5,
 'id_organisasi' => self::ORG_UPT_TIK,    // atau buat ORG_HUMAS kalau diperlukan
 'a_terintegrasi' => true,
 'a_coming_soon' => false]
```

Plus portal_menus JSON: `backend/auth-service/database/seeders/data/portal_menus/manajemen-konten.json`

---

## 7. Docker Integration

### 7.1 Local dev (`backend/docker-compose.yml`)

```yaml
manajemen-konten-service:
  build: ./manajemen-konten-service
  container_name: myunila-man-konten-local
  ports:
    - "8090:8090"
  environment:
    - DB_HOST=192.168.123.119
    - DB_PORT=1433
    - DB_USERNAME=${MAN_KONTEN_DB_USERNAME}
    - DB_PASSWORD=${MAN_KONTEN_DB_PASSWORD}
    - DB_DATABASE=pdut_staging
    - JWT_SECRET=${JWT_SECRET}
    - APP_PORT=:8090
    - APP_ENV=local
    - TZ=Asia/Jakarta
  restart: unless-stopped
```

### 7.2 VM5 staging (`deployment/production/vm5-staging/services/backend-go/docker-compose.man-konten.yml`)

Mirror docker-compose.myunila.yml. Add to `services/scripts/rebuild-service.sh` SERVICE_MAP:
```bash
[man-konten]="backend-go/docker-compose.man-konten.yml"
```

### 7.3 VM3 production (`deployment/production/vm3-backend2/services/man-konten/docker-compose.yml`)

Mirror existing `services/myunila/docker-compose.yml`. Update ansible inventory `vm3-backend2.services` list.

### 7.4 Kong route (VM1)

Add to Kong declarative config:
```yaml
- name: man-konten-service
  url: http://manajemen-konten-prod:8090
  routes:
    - name: man-konten-route
      paths: ['/man-konten-service']
      strip_path: true
```

Tambahkan ke `deployment/production/vm1-frontend-kong/services/kong/kong.yml` + run `kong reload`.

### 7.5 Frontend env

Add `NEXT_PUBLIC_MAN_KONTEN_API_URL` to:
- `frontend/.env.example`
- `frontend/Dockerfile` ARG
- `deployment/production/vm5-staging/services/frontend/docker-compose.frontend.yml`
- `deployment/production/vm1-frontend-kong/services/frontend/docker-compose.frontend.yml`

Default: `${NEXT_PUBLIC_KONG_URL}/man-konten-service/api/v1`

---

## 8. Phasing & Timeline

### Phase 1A — Backend foundation (hari 1-2)
- Scaffold service Go (cmd, apps/{pengumuman,berita,notif,kategori}, config, db)
- Schema migration + seed kategori → pdut_staging
- Implement Pengumuman CRUD (entity/repo/service/handler/router)
- Build clean → docker compose up at port 8090
- Smoke test via curl

### Phase 1B — Backend lengkap (hari 3-4)
- Berita CRUD + view counter
- Notifikasi (broadcast + per-user inbox + read/dismiss)
- Kategori CRUD
- Targeting helper (resolve user role/unit dari JWT)
- Logger module integration
- Monitoring module integration

### Phase 1C — Deploy staging + Kong (hari 5)
- Add docker-compose VM5 staging
- Apply schema migration ke pdut_staging
- Rebuild VM5 → smoke test endpoint
- Add Kong route VM1 staging (kalau ada)
- Auth-service seeder update

### Phase 1D — Frontend portal integration (hari 6-7)
- Service layer `frontend/src/lib/services/manajemen-konten/`
- Portal navbar bell — fetch real notifs
- Portal dashboard — pengumuman + berita widgets
- /portal/pengumuman, /portal/berita, /portal/notifikasi pages
- Replace announcements/page.tsx dummy → real

### Phase 1E — Admin CMS (hari 8-10)
- /dashboard/manajemen-konten/ landing
- Pengumuman + Berita + Notifikasi CRUD UI (DataTable + form modal)
- Kategori manager
- Broadcast composer with targeting
- Recipient stats

### Phase 1F — Production rollout (hari 11)
- Apply schema migration ke pdut prod
- Rebuild VM3 (manajemen-konten container)
- Update Kong VM1 prod
- Rebuild VM2 auth (PortalMenuSeeder)
- Rebuild VM1 frontend
- Smoke test prod + monitor

### Phase 2 (post-MVP, optional, 1-2 minggu)
- Web Push (browser native)
- File upload banner ke MinIO
- WYSIWYG editor untuk berita
- Email digest
- Schedule publish
- Analytics dashboard (heatmap waktu baca, click rate)

---

## 9. Risiko & Open Questions

### Risiko
1. **JWT validation** — perlu pastikan service Go bisa decode JWT yang issued auth-service. Siakapakai shared secret env `JWT_SECRET`. Sama seperti myunila-service.
2. **Volume notifikasi** — kalau broadcast ke 30k+ users, INSERT ke notif_recipient bisa lambat. Mitigasi: BULK INSERT batch 1000, atau materialize on-demand (lazy: pas user pertama buka inbox).
3. **N+1 query di list endpoint** — pakai JOIN kategori (1 query) + pre-fetch view count.
4. **Migration ke pdut prod** — schema `man_konten` baru, idempotent CREATE SCHEMA IF NOT EXISTS, rollback plan: DROP SCHEMA + tables.

### Open Questions (untuk user konfirmasi)

1. **Web Push** — Phase 2 atau skip total? Kalau skip, notifikasi cuma in-app (bell icon).
2. **WYSIWYG editor untuk berita** — Tiptap (ringan) vs Lexical (Meta) vs simple markdown? Default: markdown saja di Phase 1.
3. **File upload banner** — pakai MinIO existing (yang dipakai SIMBAK) atau lazy-deferred ke Phase 2 (URL eksternal saja)?
4. **Targeting unit organisasi** — pakai `man_akses.unit_organisasi.id_unit` atau `pdrd.sms.id_sms` untuk per-prodi? Kemungkinan dual: role-level + prodi-level.
5. **Email digest** — di scope atau skip? Butuh SMTP relay.
6. **Anonymous view counter** — increment by user_id (1 view per user) atau per-session (lebih fluffy)? Default: per-session.
7. **Comment/like** — yes? no?
8. **Audit trail** — perlu audit_log table untuk track admin edit (siapa edit kapan, what changed)? Phase 2 atau Phase 1?
9. **Auth role** — user mana yang boleh CRUD pengumuman? Developer/Admin Humas? Ada role baru "manajer-konten"?
10. **Service nama** — saya pakai `manajemen-konten-service` di repo & docker (slug `man-konten`). Konfirmasi?

---

## 10. Deliverables (untuk session ini)

User minta:
- ✅ **Plan .md lengkap** ← file ini
- ⏳ Schema ALTER SQL `data-model/script/sqlserver/man_konten/01-create-man-konten-schema.sql`
- ⏳ Backend Go scaffolding (`backend/manajemen-konten-service/`)
- ⏳ Docker compose entries (local + VM5 staging + VM3 prod)
- ⏳ Auth-service portal_aplikasi seeder update

Setelah plan ini di-approve, saya lanjut scaffold sesuai phasing 1A-1F. Estimasi total Phase 1 selesai 7-11 hari kerja, tergantung user feedback di Open Questions.

---

## 11. Reference

- Pattern backend: `backend/myunila-service/` (Go + Fiber + sqlx + JWT)
- Pattern schema migration: `data-model/script/sqlserver/kerjasama/01-add-sikerma-mapping.sql`
- Pattern docker prod: `deployment/production/vm3-backend2/services/myunila/`
- Pattern auth seeder: `backend/auth-service/database/seeders/PortalAplikasiSeeder.php`
- Pattern frontend service layer: `frontend/src/lib/services/kerjasama/kerjasamaService.ts`
- Existing portal page (target integrasi): `frontend/src/app/portal/page.tsx`
- Existing announcements (replace dummy): `frontend/src/app/portal/announcements/page.tsx`
