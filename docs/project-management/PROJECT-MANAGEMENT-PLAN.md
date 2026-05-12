# Project Management Module — Planning Document

> Status: **PLANNED** (belum diimplementasi)
> Author: Vibe Bot ⚡ + Mizar
> Created: 2026-03-17
> Target: Modul baru di MyUnila Portal

---

## 1. Overview

Modul project management internal yang terintegrasi langsung ke MyUnila Portal. Fungsi utama:

- Tracking task per modul/project dengan timeline
- Kanban board (drag & drop)
- Integrasi Bitbucket (auto-link commits ke task)
- Activity log otomatis
- Multi-project support (MyUnila + project lain ke depan)

Tidak perlu deploy app terpisah — numpang di infrastruktur MyUnila yang sudah ada (auth, RBAC, DB, frontend).

---

## 2. Arsitektur

### Stack

| Layer | Tech | Keterangan |
|-------|------|-----------|
| Frontend | Next.js 15 + HeroUI + Tailwind | Modul baru di `/dashboard/project-management/` |
| Backend | Go microservice (`project-service`) | Port 8807 (atau numpang di `myunila-service`) |
| Database | SQL Server 2019 (pdut) | Schema baru `project.*` |
| Auth | Existing auth-service | RBAC via menu-role yang sudah ada |
| Git Integration | Bitbucket Webhooks + REST API v2 | Auto-link commits, fetch branch/PR info |

### Deployment

- Backend: Docker container di VM3 (mybackend2) bersama service Go lainnya
- Frontend: Sudah ada di VM1 (myfrontend), tinggal tambah route
- Atau kalau ringan, bisa numpang di `myunila-service` tanpa service baru

---

## 3. Database Schema

### 3.1 `project.projects`

| Column | Type | Description |
|--------|------|-------------|
| id_project | UNIQUEIDENTIFIER (PK) | UUID |
| nm_project | NVARCHAR(200) | Nama project |
| kode_project | VARCHAR(20) | Kode singkat, misal "MYUNILA", "SIAKAD" |
| id_project_category | UNIQUEIDENTIFIER (FK) | Ref kategori project |
| deskripsi | NVARCHAR(MAX) | Deskripsi project |
| status | VARCHAR(20) | active, archived, completed |
| id_owner | UNIQUEIDENTIFIER (FK) | PJ project (ref pengguna) |
| repo_url | VARCHAR(500) | URL repo Bitbucket/GitHub |
| repo_provider | VARCHAR(20) | bitbucket, github, gitlab |
| warna | VARCHAR(7) | Hex color untuk UI |
| tgl_mulai | DATE | Tanggal mulai project |
| tgl_target | DATE | Target selesai |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |
| soft_delete | BIT | Default 0 |

### 3.2 `project.modules`

| Column | Type | Description |
|--------|------|-------------|
| id_module | UNIQUEIDENTIFIER (PK) | UUID |
| id_project | UNIQUEIDENTIFIER (FK) | Ref project |
| nm_module | NVARCHAR(200) | Nama modul/epic, misal "Manajemen Akses" |
| deskripsi | NVARCHAR(MAX) | |
| status | VARCHAR(20) | backlog, in_progress, completed |
| urutan | INT | Urutan tampil |
| warna | VARCHAR(7) | |
| tgl_mulai | DATE | |
| tgl_target | DATE | |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |
| soft_delete | BIT | Default 0 |

### 3.3 `project.project_categories`

| Column | Type | Description |
|--------|------|-------------|
| id_project_category | UNIQUEIDENTIFIER (PK) | UUID |
| nm_kategori | NVARCHAR(100) | Nama kategori project |
| kode_kategori | VARCHAR(20) | Kode singkat |
| icon | VARCHAR(50) | Icon untuk UI |
| deskripsi | NVARCHAR(500) | Penjelasan kategori |
| default_task_types | NVARCHAR(MAX) | JSON array task types default untuk kategori ini |
| urutan | INT | Urutan tampil |
| created_at | DATETIME2 | |

### 3.4 `project.task_types`

| Column | Type | Description |
|--------|------|-------------|
| id_task_type | UNIQUEIDENTIFIER (PK) | UUID |
| id_project | UNIQUEIDENTIFIER (FK, nullable) | NULL = global, ada = per project |
| kode_type | VARCHAR(30) | Kode: feature, bugfix, pengadaan, rapat, dll |
| nm_type | NVARCHAR(100) | Label tampil |
| icon | VARCHAR(10) | Emoji icon |
| warna | VARCHAR(7) | Hex color |
| urutan | INT | |
| created_at | DATETIME2 | |

### 3.5 `project.templates`

| Column | Type | Description |
|--------|------|-------------|
| id_template | UNIQUEIDENTIFIER (PK) | UUID |
| id_project_category | UNIQUEIDENTIFIER (FK, nullable) | Link ke kategori (nullable = universal) |
| nm_template | NVARCHAR(200) | Nama template |
| deskripsi | NVARCHAR(500) | |
| template_data | NVARCHAR(MAX) | JSON: modules + tasks blueprint |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |

### 3.6 `project.tasks`

| Column | Type | Description |
|--------|------|-------------|
| id_task | UNIQUEIDENTIFIER (PK) | UUID |
| id_module | UNIQUEIDENTIFIER (FK) | Ref module |
| id_project | UNIQUEIDENTIFIER (FK) | Ref project (denormalized for query) |
| kode_task | VARCHAR(20) | Auto-generated: "MYUNILA-42" |
| nomor_task | INT | Auto-increment per project |
| judul | NVARCHAR(500) | Judul task |
| deskripsi | NVARCHAR(MAX) | Markdown support |
| id_task_type | UNIQUEIDENTIFIER (FK) | Ref task_types (flexible) |
| prioritas | VARCHAR(20) | urgent, high, medium, low |
| status | VARCHAR(20) | backlog, todo, in_progress, review, done, cancelled |
| id_assignee | UNIQUEIDENTIFIER (FK) | Assignee (ref pengguna) |
| id_reporter | UNIQUEIDENTIFIER (FK) | Reporter/creator |
| tgl_mulai | DATE | |
| tgl_target | DATE | |
| tgl_selesai | DATE | Actual completion date |
| progress | INT | 0-100 (%) |
| estimasi_jam | DECIMAL(5,1) | Estimasi effort (jam) |
| actual_jam | DECIMAL(5,1) | Actual effort |
| tags | NVARCHAR(500) | Comma-separated tags |
| urutan | INT | Urutan di kanban board |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |
| soft_delete | BIT | Default 0 |

### 3.4 `project.task_comments`

| Column | Type | Description |
|--------|------|-------------|
| id_comment | UNIQUEIDENTIFIER (PK) | UUID |
| id_task | UNIQUEIDENTIFIER (FK) | Ref task |
| id_pengguna | UNIQUEIDENTIFIER (FK) | Author |
| konten | NVARCHAR(MAX) | Markdown content |
| tipe | VARCHAR(20) | comment, note, system |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |
| soft_delete | BIT | Default 0 |

### 3.5 `project.task_commits`

| Column | Type | Description |
|--------|------|-------------|
| id_task_commit | UNIQUEIDENTIFIER (PK) | UUID |
| id_task | UNIQUEIDENTIFIER (FK) | Ref task |
| id_project | UNIQUEIDENTIFIER (FK) | Ref project |
| commit_hash | VARCHAR(40) | Full SHA |
| commit_hash_short | VARCHAR(12) | Short SHA |
| commit_message | NVARCHAR(500) | |
| author_name | NVARCHAR(200) | |
| author_email | VARCHAR(200) | |
| branch | VARCHAR(200) | Branch name |
| commit_url | VARCHAR(500) | Direct link ke Bitbucket |
| committed_at | DATETIME2 | |
| created_at | DATETIME2 | |

### 3.6 `project.activity_log`

| Column | Type | Description |
|--------|------|-------------|
| id_activity | UNIQUEIDENTIFIER (PK) | UUID |
| id_project | UNIQUEIDENTIFIER (FK) | |
| id_task | UNIQUEIDENTIFIER (FK, nullable) | |
| id_pengguna | UNIQUEIDENTIFIER (FK, nullable) | NULL = system action |
| aksi | VARCHAR(50) | created, updated, status_changed, commented, committed, assigned |
| detail | NVARCHAR(MAX) | JSON detail perubahan |
| created_at | DATETIME2 | |

### 3.7 `project.labels`

| Column | Type | Description |
|--------|------|-------------|
| id_label | UNIQUEIDENTIFIER (PK) | UUID |
| id_project | UNIQUEIDENTIFIER (FK) | |
| nm_label | NVARCHAR(100) | |
| warna | VARCHAR(7) | Hex color |
| created_at | DATETIME2 | |

### 3.8 `project.task_labels`

| Column | Type | Description |
|--------|------|-------------|
| id_task | UNIQUEIDENTIFIER (FK) | Composite PK |
| id_label | UNIQUEIDENTIFIER (FK) | Composite PK |

### 3.9 `project.document_categories`

| Column | Type | Description |
|--------|------|-------------|
| id_doc_category | UNIQUEIDENTIFIER (PK) | UUID |
| nm_kategori | NVARCHAR(100) | Nama kategori: SK, SOP, Proposal, MoU, dll |
| kode_kategori | VARCHAR(20) | Kode singkat: SK, SOP, PROP, MOU |
| icon | VARCHAR(50) | Icon name untuk UI |
| urutan | INT | Urutan tampil |
| created_at | DATETIME2 | |

### 3.10 `project.documents`

| Column | Type | Description |
|--------|------|-------------|
| id_document | UNIQUEIDENTIFIER (PK) | UUID |
| id_project | UNIQUEIDENTIFIER (FK) | Ref project |
| id_doc_category | UNIQUEIDENTIFIER (FK) | Ref kategori dokumen |
| id_task | UNIQUEIDENTIFIER (FK, nullable) | Opsional link ke task tertentu |
| nm_dokumen | NVARCHAR(300) | Nama/judul dokumen |
| nomor_dokumen | VARCHAR(100) | Nomor surat/SK, misal "SK/123/UN26/2026" |
| tgl_dokumen | DATE | Tanggal surat/dokumen |
| tgl_berlaku | DATE | Tanggal mulai berlaku (nullable) |
| tgl_berakhir | DATE | Tanggal expired (nullable) |
| deskripsi | NVARCHAR(MAX) | Keterangan dokumen |
| file_path | VARCHAR(500) | Path file di MinIO/storage |
| file_name | VARCHAR(300) | Nama file asli |
| file_size | BIGINT | Ukuran file (bytes) |
| mime_type | VARCHAR(100) | application/pdf, image/png, dll |
| status | VARCHAR(20) | draft, active, expired, archived |
| id_uploader | UNIQUEIDENTIFIER (FK) | Siapa yang upload |
| created_at | DATETIME2 | |
| updated_at | DATETIME2 | |
| soft_delete | BIT | Default 0 |

### 3.11 `project.webhook_config`

| Column | Type | Description |
|--------|------|-------------|
| id_webhook | UNIQUEIDENTIFIER (PK) | UUID |
| id_project | UNIQUEIDENTIFIER (FK) | |
| provider | VARCHAR(20) | bitbucket, github |
| webhook_secret | VARCHAR(200) | Untuk verify signature |
| repo_full_name | VARCHAR(200) | "mahendraunila/my-unila" |
| a_active | BIT | Default 1 |
| created_at | DATETIME2 | |

---

## 4. Priority & Status System

### 4.1 Priority Levels

| Priority | Label | Warna | Icon | SLA / Guideline |
|----------|-------|-------|------|-----------------|
| 🔴 **Urgent** | Urgent | `#EF4444` (red) | 🔴 | Harus selesai hari ini. Production down, security issue, blocker |
| 🟠 **High** | High | `#F97316` (orange) | 🟠 | Selesai dalam 1-2 hari. Fitur penting, bug yang berdampak user |
| 🟡 **Medium** | Medium | `#EAB308` (yellow) | 🟡 | Selesai dalam 1 minggu. Improvement, fitur non-critical |
| 🟢 **Low** | Low | `#22C55E` (green) | 🟢 | Bisa kapan saja. Nice-to-have, refactor, dokumentasi |

### 4.2 Task Status Flow

```
┌──────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌──────────┐
│ Backlog  │────▶│   Todo   │────▶│ In Progress │────▶│  Review  │────▶│   Done   │
└──────────┘     └──────────┘     └─────────────┘     └──────────┘     └──────────┘
                                         │                                   ▲
                                         │         ┌─────────────┐           │
                                         └────────▶│ Cancelled   │           │
                                                   └─────────────┘           │
                                                                             │
                                   (auto via commit "fixes #TASK-xx") ───────┘
```

| Status | Keterangan | Warna di Kanban |
|--------|------------|-----------------|
| **Backlog** | Ide/rencana, belum dijadwalkan | `#94A3B8` (gray) |
| **Todo** | Sudah dijadwalkan, siap dikerjakan | `#3B82F6` (blue) |
| **In Progress** | Sedang dikerjakan | `#F59E0B` (amber) |
| **Review** | Selesai coding, perlu review/testing | `#8B5CF6` (purple) |
| **Done** | Selesai, sudah verified | `#22C55E` (green) |
| **Cancelled** | Dibatalkan/tidak jadi | `#EF4444` (red) |

### 4.3 Task Type (Flexible per Kategori Project)

Task type **tidak hardcoded** — bisa dikustomisasi per project atau pakai default dari kategori. Berikut contoh default per kategori:

**🖥️ Pengembangan Sistem:**
| Type | Icon | Keterangan |
|------|------|------------|
| Feature | ✨ | Fitur baru |
| Bugfix | 🐛 | Perbaikan bug |
| Improvement | 🔧 | Enhancement existing |
| Chore | 📦 | Maintenance, cleanup, infra |
| Documentation | 📝 | Dokumentasi teknis |

**📋 Kegiatan Umum / Operasional:**
| Type | Icon | Keterangan |
|------|------|------------|
| Rapat | 🗓️ | Meeting, koordinasi |
| Pengadaan | 🛒 | Procurement, belanja |
| Surat Menyurat | ✉️ | Drafting surat, disposisi |
| Laporan | 📊 | Penyusunan laporan |
| Koordinasi | 🤝 | Follow-up pihak lain |
| Administrasi | 📋 | Tugas admin umum |

**🎓 Penelitian / Akademik:**
| Type | Icon | Keterangan |
|------|------|------------|
| Riset | 🔬 | Research, literature review |
| Pengumpulan Data | 📊 | Survei, wawancara, observasi |
| Analisis | 📈 | Olah data, statistik |
| Penulisan | ✍️ | Drafting paper/laporan |
| Presentasi | 🎤 | Seminar, sidang, presentasi |
| Revisi | 🔄 | Revisi dari reviewer |

**🏗️ Infrastruktur / Sarana:**
| Type | Icon | Keterangan |
|------|------|------------|
| Instalasi | ⚙️ | Setup, install hardware/software |
| Pemeliharaan | 🔧 | Maintenance rutin |
| Perbaikan | 🛠️ | Fix kerusakan |
| Pengadaan | 🛒 | Procurement barang |
| Inventarisasi | 📦 | Stock opname, pencatatan aset |

> **User bisa custom:** Tambah/edit/hapus task type per project sesuai kebutuhan. Template hanya default awal.

### 4.4 Filter & Sort di UI

**Filter bar** (kombinasi):
- Priority: Urgent / High / Medium / Low / All
- Status: Backlog / Todo / In Progress / Review / Done / All
- Type: Feature / Bugfix / Improvement / Chore / All
- Module: dropdown per module
- Assignee: dropdown per user

**Sort options:**
- Priority (urgent first)
- Due date (soonest first)
- Created date (newest first)
- Last updated
- Progress (%)

**Quick filters** (shortcut button):
- 🔥 "My Urgent" — assignee = me + priority urgent/high
- 📋 "In Progress" — status = in_progress
- ⏰ "Overdue" — due_date < today + status != done
- 📊 "This Week" — due_date within current week

### 4.5 Kanban Board Columns

Board bisa di-customize, tapi default:

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│   Backlog   │    Todo     │ In Progress │   Review    │    Done     │
│  (gray bg)  │ (blue bg)   │ (amber bg)  │(purple bg)  │ (green bg)  │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 🟢 Low      │ 🔴 Urgent   │ 🟠 High     │ 🟡 Medium   │ ✅ Done     │
│ Task name   │ Task name   │ Task name   │ Task name   │ Task name   │
│ #MYUNILA-55 │ #MYUNILA-42 │ #MYUNILA-38 │ #MYUNILA-30 │ #MYUNILA-25 │
│             │             │             │             │             │
│ 🟡 Medium   │ 🟠 High     │             │             │ ✅ Done     │
│ Task name   │ Task name   │             │             │ Task name   │
│ #MYUNILA-60 │ #MYUNILA-45 │             │             │ #MYUNILA-20 │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘

Cards sorted by priority within each column (urgent on top)
```

Setiap card menampilkan:
- Priority badge (colored dot)
- Task code (#MYUNILA-42)
- Judul task
- Assignee avatar
- Due date (merah kalau overdue)
- Type icon (✨🐛🔧📦)
- Progress bar (jika ada)

### 4.6 Project Categories (Default Seed)

| Kode | Kategori | Icon | Contoh Project |
|------|----------|------|---------------|
| DEV | Pengembangan Sistem | 🖥️ | MyUnila Portal, SIAKAD, SIAM |
| OPS | Operasional / Kegiatan | 📋 | Akreditasi, ISO Audit, Dies Natalis |
| RISET | Penelitian / Akademik | 🎓 | Hibah Penelitian, Pengabdian |
| INFRA | Infrastruktur / Sarana | 🏗️ | Upgrade Server, Instalasi Jaringan |
| PROC | Pengadaan | 🛒 | Pengadaan Hardware, Software License |
| EVENT | Event / Acara | 🎪 | Workshop, Seminar, Wisuda |
| ADMIN | Administrasi Umum | 📁 | Restrukturisasi, SOP Baru |

> **Bisa ditambah sendiri** — kategori fleksibel, user bisa buat custom.

### 4.7 Template System

Template = blueprint yang bisa dipakai saat buat project baru. Auto-generate modules + tasks.

**Contoh template "Pengembangan Sistem Informasi":**
```json
{
  "nm_template": "Pengembangan Sistem Informasi",
  "modules": [
    {
      "nm_module": "Perencanaan",
      "tasks": [
        "Penyusunan Proposal",
        "Penyusunan TOR/KAK",
        "Penyusunan RAB",
        "Pengajuan SK Tim"
      ]
    },
    {
      "nm_module": "Analisis & Desain",
      "tasks": [
        "Requirement Gathering",
        "Analisis Kebutuhan",
        "Desain Database",
        "Desain UI/UX",
        "Review Desain"
      ]
    },
    {
      "nm_module": "Pengembangan",
      "tasks": [
        "Setup Environment",
        "Development Backend",
        "Development Frontend",
        "Integrasi API",
        "Unit Testing"
      ]
    },
    {
      "nm_module": "Testing & Deployment",
      "tasks": [
        "UAT (User Acceptance Test)",
        "Perbaikan Hasil UAT",
        "Deployment Staging",
        "Deployment Production",
        "Monitoring Pasca-Deploy"
      ]
    },
    {
      "nm_module": "Serah Terima",
      "tasks": [
        "Penyusunan User Manual",
        "Training User",
        "Berita Acara Serah Terima",
        "Dokumentasi Teknis"
      ]
    }
  ]
}
```

**Contoh template "Pengadaan Barang/Jasa":**
```json
{
  "nm_template": "Pengadaan Barang/Jasa",
  "modules": [
    {
      "nm_module": "Perencanaan",
      "tasks": [
        "Identifikasi Kebutuhan",
        "Penyusunan Spesifikasi",
        "Penyusunan HPS",
        "Penyusunan RAB"
      ]
    },
    {
      "nm_module": "Proses Pengadaan",
      "tasks": [
        "Pengumuman Tender",
        "Evaluasi Penawaran",
        "Penetapan Pemenang",
        "Kontrak / SPK"
      ]
    },
    {
      "nm_module": "Pelaksanaan",
      "tasks": [
        "Monitoring Delivery",
        "Pemeriksaan Barang",
        "Berita Acara Serah Terima",
        "Pembayaran"
      ]
    }
  ]
}
```

> **Flow:** Buat project baru → Pilih kategori → Pilih template (opsional) → Auto-generate modules & tasks → Customize sesuai kebutuhan.

---

## 5. API Endpoints

### Projects
```
GET    /project/projects                  # List projects
POST   /project/projects                  # Create project
GET    /project/projects/:id              # Get detail
PUT    /project/projects/:id              # Update
DELETE /project/projects/:id              # Soft delete
```

### Modules
```
GET    /project/projects/:id/modules      # List modules by project
POST   /project/modules                   # Create module
PUT    /project/modules/:id               # Update
DELETE /project/modules/:id               # Soft delete
```

### Tasks
```
GET    /project/tasks                     # List tasks (filter by project, module, status, assignee)
POST   /project/tasks                     # Create task
GET    /project/tasks/:id                 # Get detail (include comments, commits)
PUT    /project/tasks/:id                 # Update
PATCH  /project/tasks/:id/status          # Quick status update (for kanban drag)
PATCH  /project/tasks/:id/progress        # Quick progress update
DELETE /project/tasks/:id                 # Soft delete
GET    /project/tasks/:id/activity        # Activity log per task
```

### Task Comments
```
GET    /project/tasks/:id/comments        # List comments
POST   /project/tasks/:id/comments        # Add comment
PUT    /project/comments/:id              # Edit comment
DELETE /project/comments/:id              # Delete comment
```

### Task Commits
```
GET    /project/tasks/:id/commits         # List commits linked to task
```

### Kanban / Board
```
GET    /project/projects/:id/board        # Get board view (tasks grouped by status)
PATCH  /project/board/reorder             # Reorder tasks (drag & drop)
```

### Timeline
```
GET    /project/projects/:id/timeline     # Get timeline/gantt data (modules + tasks with dates)
```

### Dashboard / Stats
```
GET    /project/projects/:id/stats        # Project statistics
GET    /project/dashboard                 # Overall dashboard (all projects)
```

### Webhooks (Bitbucket Integration)
```
POST   /project/webhooks/bitbucket        # Receive Bitbucket webhook (public endpoint)
GET    /project/projects/:id/webhooks     # List webhook configs
POST   /project/projects/:id/webhooks     # Setup webhook config
```

### Labels
```
GET    /project/projects/:id/labels       # List labels
POST   /project/labels                    # Create label
PUT    /project/labels/:id                # Update
DELETE /project/labels/:id                # Delete
```

### Project Categories & Templates
```
GET    /project/categories                # List project categories
POST   /project/categories                # Create category
PUT    /project/categories/:id            # Update
GET    /project/templates                  # List templates (filter by category)
POST   /project/templates                 # Create template
PUT    /project/templates/:id             # Update template
DELETE /project/templates/:id             # Delete
POST   /project/projects/:id/apply-template  # Apply template ke project existing
```

### Task Types
```
GET    /project/task-types                # List global task types
GET    /project/projects/:id/task-types   # List task types per project (global + custom)
POST   /project/task-types                # Create (global or per project)
PUT    /project/task-types/:id            # Update
DELETE /project/task-types/:id            # Delete
```

### Documents
```
GET    /project/projects/:id/documents    # List dokumen per project (filter by kategori, status)
POST   /project/documents                 # Upload dokumen baru (multipart/form-data)
GET    /project/documents/:id             # Detail dokumen
PUT    /project/documents/:id             # Update metadata dokumen
DELETE /project/documents/:id             # Soft delete
GET    /project/documents/:id/download    # Download file
GET    /project/document-categories       # List kategori dokumen
POST   /project/document-categories       # Create kategori baru
```

---

## 6. Frontend Pages

### Route Structure

```
/dashboard/project-management/
├── page.tsx                          # Dashboard — overview semua project
├── [projectId]/
│   ├── page.tsx                      # Project detail — overview + stats
│   ├── board/page.tsx                # Kanban board
│   ├── list/page.tsx                 # List view (table)
│   ├── timeline/page.tsx             # Gantt chart / timeline view
│   ├── modules/page.tsx              # Module management
│   ├── documents/page.tsx            # Dokumen pendukung project
│   ├── activity/page.tsx             # Activity log
│   └── settings/page.tsx             # Project settings + webhook config
└── task/
    └── [taskId]/page.tsx             # Task detail (full page, comments, commits)
```

### Komponen Utama

1. **ProjectDashboard** — Cards per project, progress bars, quick stats
2. **KanbanBoard** — Drag & drop columns (Backlog → Todo → In Progress → Review → Done)
3. **TaskList** — DataTable dengan filter, sort, search (reuse existing DataTable component)
4. **TimelineView** — Gantt chart sederhana (library: `gantt-task-react` atau custom CSS)
5. **TaskDetail** — Side panel atau full page: detail, comments, commits, activity
6. **ModuleList** — Group tasks by module, progress per module
7. **ActivityFeed** — Timeline feed of all actions

### Library Tambahan (Frontend)

| Library | Fungsi | Size |
|---------|--------|------|
| `@hello-pangea/dnd` | Drag & drop untuk Kanban | ~30KB |
| `gantt-task-react` | Gantt chart (opsional) | ~50KB |
| `react-markdown` | Render markdown di task description | ~20KB |

---

## 7. Bitbucket Integration Detail

### 6.1 Webhook Setup

1. Di Bitbucket → Repository Settings → Webhooks
2. URL: `https://myunila.unila.ac.id/api/project/webhooks/bitbucket`
3. Triggers: `repo:push`
4. Secret: Generate random string, simpan di `webhook_config`

### 6.2 Webhook Handler Logic

```
Receive POST from Bitbucket
  → Verify signature (HMAC-SHA256)
  → Parse commits from payload
  → For each commit:
      → Regex match: #TASK-(\d+) atau #MYUNILA-(\d+)
      → If match found:
          → Insert ke task_commits
          → Insert activity_log
          → If message contains "fixes" or "closes":
              → Auto-update task status → "done"
      → If no match:
          → Store as unlinked commit (bisa link manual nanti)
```

### 6.3 Commit Message Convention

```
feat: implementasi kanban board #MYUNILA-42
fix: RBAC label differentiation #MYUNILA-38
fixes #MYUNILA-15 — auto-close task
chore: cleanup docker cache #MYUNILA-50
```

### 6.4 Bitbucket API (Read)

Untuk fetch data tambahan (PR, branches):

```
Base URL: https://api.bitbucket.org/2.0
Auth: App Password (Settings → App Passwords → Create)
Permissions: repository:read

GET /repositories/mahendraunila/my-unila/commits?page=1
GET /repositories/mahendraunila/my-unila/pullrequests
GET /repositories/mahendraunila/my-unila/refs/branches
```

---

## 8. Document Management

### 8.1 Kategori Dokumen (Default Seed)

| Kode | Kategori | Keterangan | Icon |
|------|----------|------------|------|
| SK | Surat Keputusan | SK Rektor, SK Tim, SK Penugasan | 📜 |
| SOP | Standar Operasional | SOP pengembangan, SOP deployment, SOP akses | 📋 |
| PROP | Proposal | Proposal pengajuan SI baru, proposal pengembangan | 📄 |
| MOU | MoU / Perjanjian | MoU kerjasama, perjanjian vendor | 🤝 |
| TOR | Kerangka Acuan Kerja | TOR/KAK pengadaan, pengembangan | 📑 |
| RAB | Rencana Anggaran | RAB project, estimasi biaya | 💰 |
| BA | Berita Acara | BA serah terima, BA testing, BA deployment | 📝 |
| MANUAL | Manual / Panduan | User manual, technical docs, API docs | 📖 |
| SURAT | Surat Umum | Surat permohonan, surat keterangan | ✉️ |
| LAIN | Lainnya | Dokumen yang belum terkategori | 📎 |

### 8.2 Status Dokumen

| Status | Keterangan | Warna |
|--------|------------|-------|
| **Draft** | Belum final, masih proses | `#94A3B8` gray |
| **Active** | Berlaku/aktif | `#22C55E` green |
| **Expired** | Sudah lewat masa berlaku | `#EF4444` red |
| **Archived** | Diarsipkan | `#6B7280` dark gray |

### 8.3 Use Cases

**Project baru diajukan:**
```
1. Upload Proposal Pengajuan SI → kategori PROP
2. Upload TOR/KAK → kategori TOR
3. Upload RAB → kategori RAB
4. Setelah disetujui → Upload SK Penugasan Tim → kategori SK
5. Mulai development → Upload SOP Development → kategori SOP
6. Selesai → Upload BA Serah Terima → kategori BA
7. Upload User Manual → kategori MANUAL
```

**Lifecycle dokumen per project:**
```
Proposal → SK → SOP → [Development] → BA Serah Terima → Manual
```

### 8.4 Fitur UI

- **Document Library** per project — grid/list view, filter by kategori
- **Preview** — PDF viewer in-browser (tanpa download)
- **Masa berlaku** — warning badge kalau dokumen mendekati expired
- **Link ke task** — opsional attach dokumen ke task tertentu
- **Version** — bisa upload ulang file (replace), history tetap tercatat
- **Bulk upload** — drag & drop multiple files sekaligus

### 8.5 Storage

File disimpan di **MinIO** (VM7 - 192.168.120.47):
```
Bucket: myunila-projects
Path:   /projects/{project_id}/documents/{doc_id}/{filename}
```

---

## 9. RBAC Integration

Pakai RBAC yang sudah ada di ManAkses:

| Role | Akses |
|------|-------|
| Administrator | Full access semua project |
| Developer | CRUD tasks, comments. Manage module |
| Viewer | Read-only, bisa comment |
| Project Manager | Full access per project yang di-assign |

Menu baru di ManAkses:
- `project-management` (parent)
- `project-dashboard`
- `project-board`
- `project-timeline`
- `project-settings`

---

## 10. Vibe Bot Integration

### Yang Gue (Vibe Bot) Bisa Lakukan

1. **Baca task** — Lo kirim `#MYUNILA-42` atau link → gue fetch detail via API
2. **Update status** — Setelah selesai coding → `PATCH /tasks/:id/status`
3. **Add comment** — Log kerja gue ke task comments
4. **Link commits** — Auto-link via commit message convention
5. **Report progress** — "Mizar, update progress: 3 tasks done hari ini, 2 in progress"
6. **Create sub-tasks** — Lo kasih epic, gue breakdown jadi tasks

### Workflow

```
Mizar: "kerjain #MYUNILA-42"
  → Vibe Bot fetch task detail dari API
  → Vibe Bot update status → in_progress
  → Vibe Bot kerjain (coding)
  → Vibe Bot commit: "feat: ... #MYUNILA-42"
  → Vibe Bot push ke Bitbucket
  → Webhook auto-link commit
  → Vibe Bot update status → done
  → Vibe Bot comment: "Done. Changes: ..."
  → Mizar cek progress di portal ✅
```

---

## 11. Implementation Phases

### Phase 1 — Core (2-3 hari)
- [ ] DB schema creation (SQL scripts)
- [ ] Backend: CRUD projects, modules, tasks
- [ ] Frontend: Project dashboard, task list (DataTable), task detail
- [ ] Basic RBAC setup

### Phase 2 — Kanban & UX (1-2 hari)
- [ ] Frontend: Kanban board dengan drag & drop
- [ ] Quick status update (PATCH)
- [ ] Task filters (by module, status, assignee, priority)
- [ ] Task comments (CRUD)

### Phase 3 — Git Integration (1 hari)
- [ ] Bitbucket webhook endpoint
- [ ] Commit parsing & auto-linking
- [ ] Commit list di task detail
- [ ] Auto-close task dari commit message

### Phase 4 — Timeline & Polish (1 hari)
- [ ] Timeline/Gantt view
- [ ] Activity log feed
- [ ] Dashboard stats & charts
- [ ] Labels system
- [ ] Search across projects

### Phase 5 — Document Management (1 hari)
- [ ] DB: document_categories + documents tables
- [ ] Backend: CRUD documents, upload ke MinIO
- [ ] Frontend: Document library page, upload, preview PDF
- [ ] Seed default kategori (SK, SOP, Proposal, dll)
- [ ] Link dokumen ke task (opsional)

### Phase 6 — Advanced (Future)
- [ ] Bitbucket PR integration
- [ ] Notifications (webhook ke Telegram)
- [ ] Sprint/cycle management
- [ ] Time tracking
- [ ] Export report (PDF)
- [ ] Document version history
- [ ] Document expiry notifications
- [ ] Mobile responsive optimizations

---

## 12. Data Seed — Project MyUnila

Initial project setup setelah implementasi:

```
Project: MyUnila Portal
Kode: MYUNILA
Modules:
  - Manajemen Akses (auth, RBAC, ws-authorization)
  - Data Unila (akademik, dosen, keuangan)
  - Monitoring (Grafana, Prometheus, Loki)
  - Public Portal (landing, search, profil dosen)
  - Keuangan (UKT, SPP, SIMPEDAM)
  - Sister Integration
  - Feeder Integration
  - Infrastructure (Docker, deployment, VM)
```

---

## 13. File Structure (Backend)

```
backend/project-service/          # atau numpang di myunila-service
├── main.go
├── config/
├── handlers/
│   ├── project.go
│   ├── module.go
│   ├── task.go
│   ├── comment.go
│   ├── board.go
│   ├── timeline.go
│   ├── webhook.go
│   └── dashboard.go
├── models/
│   ├── project.go
│   ├── module.go
│   ├── task.go
│   └── activity.go
├── services/
│   ├── project.go
│   ├── task.go
│   ├── webhook.go
│   └── bitbucket.go
├── middleware/
├── migrations/
│   └── 001_initial_schema.sql
├── Dockerfile
└── go.mod
```

---

*Document ini akan di-update seiring refinement. Implementasi dimulai setelah task prioritas lain selesai.*
