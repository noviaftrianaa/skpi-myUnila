# Project Management — Org Structure & Visibility Plan

## Overview
Menambahkan fitur:
1. **Org Structure / Hierarchy** — bagan organisasi custom yang bisa diatur per project
2. **Project Visibility per Jabatan** — Dekan/Rektor bisa pantau project di unit mereka
3. **Pencarian Pimpinan** — dari tabel SDM (pdut) + SISTER + SIKEP

---

## Background Data

### Relasi User → SDM (sudah ada)
```
man_akses.pengguna.id_sdm_pengguna → pdrd.sdm.id_sdm
```
- User yang SDM-nya terdaftar = dosen/pegawai Unila
- Dari SDM bisa dapat: jabatan fungsional, prodi, fakultas (via reg_ptk → sms)

### SIKEP Org Structure
- `sikep.unit_orga` — unit organisasi dengan hierarki (id_unit_orga_induk)
- Sudah punya data: Rektorat, WR, Fakultas, Prodi, Unit

### SDM → Unit/Jabatan
```
pdrd.sdm → pdrd.reg_ptk (aktif) → pdrd.sms (prodi) → id_fak_unila (fakultas)
```

---

## Feature 1: Project Visibility (Pimpinan bisa pantau)

### Konsep
```
Project → ditetapkan untuk Unit/Org tertentu
Pimpinan Unit (Dekan/Rektor) → bisa lihat semua project di unit mereka
```

### DB Schema (PostgreSQL project DB)
```sql
-- Tambah kolom id_unit ke projects
ALTER TABLE projects ADD COLUMN id_unit VARCHAR(50); -- referensi ke sikep.unit_orga
ALTER TABLE projects ADD COLUMN kode_unit VARCHAR(20);
ALTER TABLE projects ADD COLUMN nm_unit VARCHAR(200);

-- Tabel project_watchers — pimpinan yang bisa pantau
CREATE TABLE project_watchers (
    id_watcher    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_project    UUID NOT NULL REFERENCES projects(id_project) ON DELETE CASCADE,
    id_pengguna   UUID NOT NULL,   -- dari man_akses.pengguna
    id_sdm        UUID,            -- dari pdrd.sdm (nullable jika user belum link ke SDM)
    nm_pengguna   VARCHAR(200),
    jabatan       VARCHAR(200),    -- jabatan di unit (Dekan, Rektor, dll)
    tipe_akses    VARCHAR(20) DEFAULT 'viewer', -- viewer, commenter, editor
    tgl_mulai     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tgl_akhir     TIMESTAMP WITH TIME ZONE, -- NULL = permanent
    added_by      UUID,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    soft_delete   BOOLEAN DEFAULT FALSE,
    UNIQUE(id_project, id_pengguna)
);
```

### API Endpoints (Go project-service)
```
GET  /project/:id/watchers          → list pimpinan yang bisa pantau
POST /project/:id/watchers          → tambah pimpinan
DELETE /project/:id/watchers/:watcherId → hapus akses
GET  /project/by-watcher            → list project yang bisa dipantau user ini
```

### Logic
- Member project → bisa edit/manage
- Watcher → bisa lihat progress, task, documents (read-only)
- Pencarian watcher: dari `man_akses.pengguna` (by nama) → link `id_sdm_pengguna` → `pdrd.sdm` → jabatan/unit

---

## Feature 2: Org Structure Diagram (Custom)

### Konsep
- Per project, bisa setup "Struktur Tim" custom
- Node = orang (dicari dari DB pengguna/SDM)
- Edge = relasi (atasan-bawahan, koordinator, dll)
- Visualisasi: tree/hierarchy diagram di halaman Settings

### DB Schema
```sql
CREATE TABLE project_org_nodes (
    id_node      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_project   UUID NOT NULL REFERENCES projects(id_project) ON DELETE CASCADE,
    id_pengguna  UUID,            -- link ke man_akses.pengguna (nullable = position only)
    id_sdm       UUID,            -- link ke pdrd.sdm
    nm_display   VARCHAR(200) NOT NULL, -- nama tampil (bisa dioverride)
    jabatan      VARCHAR(200),    -- jabatan di struktur ini
    foto_url     VARCHAR(500),    -- URL foto (dari MinIO/SDM)
    urutan       INTEGER DEFAULT 0,
    warna        VARCHAR(10),     -- warna node (#hex)
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    soft_delete  BOOLEAN DEFAULT FALSE
);

CREATE TABLE project_org_edges (
    id_edge      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    id_project   UUID NOT NULL,
    id_node_from UUID NOT NULL REFERENCES project_org_nodes(id_node),
    id_node_to   UUID NOT NULL REFERENCES project_org_nodes(id_node),
    label        VARCHAR(100),    -- label relasi (Koordinator, Anggota, dll)
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints
```
GET  /project/:id/org          → get struktur org (nodes + edges)
POST /project/:id/org/nodes    → tambah node
PUT  /project/:id/org/nodes/:nodeId → update node
DELETE /project/:id/org/nodes/:nodeId → hapus node
POST /project/:id/org/edges    → tambah edge
DELETE /project/:id/org/edges/:edgeId → hapus edge
```

### Frontend Component
- Library: `reactflow` atau `d3.js` (ringan)
- Drag & drop posisi node
- Double click → edit orang
- Search bar → cari dari SDM/pengguna
- Export diagram sebagai PNG/PDF

---

## Feature 3: Search Pimpinan (Multi-source)

### Search Strategy
```
Input: nama / NIP / NIDN

Source 1: man_akses.pengguna (utama)
  → JOIN pdrd.sdm via id_sdm_pengguna
  → JOIN pdrd.reg_ptk → pdrd.sms (dapat prodi/fak)

Source 2: pdrd.sdm langsung (jika belum punya akun portal)
  → JOIN pdrd.reg_ptk untuk jabatan
  → Note: id_pengguna = NULL (belum punya akun)

Source 3: sikep.unit_orga (untuk jabatan struktural)
  → Cek jabatan Dekan, WR, Rektor, Kaprodi, dll
```

### API Endpoint (project-service via SQL Server ref)
```
GET /users/search?q=nama&source=pengguna|sdm|all&limit=20

Response:
{
  "id_pengguna": "uuid|null",
  "id_sdm": "uuid",
  "nm_sdm": "Dr. Budi Santoso",
  "nidn": "0021098801",
  "nip": "198801012010011001",
  "jabatan": "Dekan",
  "nm_prodi": null,
  "nm_fakultas": "Fakultas Teknik",
  "nm_unit": "Fakultas Teknik",
  "foto_url": null,
  "has_portal_account": true
}
```

### SQL Query (via SQL Server connection)
```sql
SELECT TOP 20
    CONVERT(VARCHAR(36), p.id_pengguna) AS id_pengguna,
    CONVERT(VARCHAR(36), s.id_sdm) AS id_sdm,
    s.nm_sdm,
    s.nidn, s.nip,
    ms.nm_prodi,
    'Fakultas ' + fak.nm_fak AS nm_unit,
    CASE WHEN p.id_pengguna IS NOT NULL THEN 1 ELSE 0 END AS has_portal_account
FROM pdrd.sdm s
LEFT JOIN man_akses.pengguna p ON p.id_sdm_pengguna = s.id_sdm
LEFT JOIN pdrd.reg_ptk ptk ON ptk.id_sdm = s.id_sdm 
    AND ptk.soft_delete = 0 AND ptk.id_jns_keluar IS NULL
LEFT JOIN pdrd.sms ms ON ptk.id_sms = ms.id_sms AND ms.soft_delete = 0
WHERE s.soft_delete = 0
  AND (s.nm_sdm LIKE '%?%' OR s.nidn LIKE '%?%' OR s.nip LIKE '%?%')
ORDER BY s.nm_sdm
```

---

## Implementation Plan

### Phase 1: Database (PostgreSQL) — 30 menit
1. Alter `projects` table — tambah `id_unit`, `kode_unit`, `nm_unit`
2. Create `project_watchers` table
3. Create `project_org_nodes` + `project_org_edges` tables

### Phase 2: Backend Go — 2-3 jam
1. Entity, Repository, Service, Handler untuk watchers
2. Entity, Repository, Service, Handler untuk org structure
3. Update user search endpoint untuk multi-source (pengguna + SDM)
4. Router update

### Phase 3: Frontend — 3-4 jam
1. **Project Settings page**: tab "Tim & Pengawas" — manage watchers + org structure
2. **Search component**: cari orang dari pengguna/SDM dengan debounce
3. **Org diagram**: reactflow tree view, drag & drop, export
4. **Watcher badge**: di project overview, tampilkan siapa yang bisa memantau
5. **Project list (pimpinan view)**: filter project by unit, tampilkan progress

### Phase 4: Integrasi SIKEP/SISTER — 1 jam
1. Ambil jabatan struktural dari `sikep.unit_orga`
2. Tampilkan di search result (Dekan, WR, dll)
3. Optional: sync foto dari SISTER

---

## UI Wireframe — Org Diagram

```
┌─────────────────────────────────────────────────┐
│ Struktur Tim — MyUnila Portal                   │
│                                                 │
│ [+ Tambah Orang] [Export PNG]    [Cari SDM...]  │
│                                                 │
│              ┌─────────────┐                    │
│              │   Dr. Budi  │                    │
│              │ Project Lead│                    │
│              └──────┬──────┘                    │
│              ┌──────┴──────┐                    │
│       ┌──────┴──┐    ┌─────┴────┐               │
│       │  Andi   │    │  Siti    │               │
│       │ Backend │    │Frontend  │               │
│       └─────────┘    └──────────┘               │
│                                                 │
│ [Simpan Struktur]                               │
└─────────────────────────────────────────────────┘
```

## UI Wireframe — Watcher/Pengawas

```
┌─────────────────────────────────────┐
│ Pengawas Project                    │
│                                     │
│ Cari pimpinan... [Cari]             │
│                                     │
│ [Prof. Ahmad - Rektor]    [+ Tambah]│
│ [Dr. Dewi - Dekan FT]    [+ Tambah] │
│ [Dr. Budi - WR 2]        [+ Tambah] │
│                                     │
│ Pengawas aktif:                     │
│ ✅ Prof. Ahmad (Rektor) — sejak 1 Mar│
│ ✅ Dr. Dewi (Dekan FT)  — sejak 5 Mar│
│ [Hapus] per orang                   │
└─────────────────────────────────────┘
```

---

## Notes
- `reactflow` sudah ada di banyak project Next.js, ringan
- Foto SDM bisa dari MinIO (jika sudah di-upload via SISTER integrator)
- Jabatan struktural perlu query ke `sikep.unit_orga` via SQL Server connection
- Watcher hanya bisa VIEW project (read-only semua), bukan member aktif
- Pimpinan yang jadi member tetap bisa via project_members (existing)
- Estimasi total: 1 malam kerja (6-8 jam)
