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

### 3.3 `project.tasks`

| Column | Type | Description |
|--------|------|-------------|
| id_task | UNIQUEIDENTIFIER (PK) | UUID |
| id_module | UNIQUEIDENTIFIER (FK) | Ref module |
| id_project | UNIQUEIDENTIFIER (FK) | Ref project (denormalized for query) |
| kode_task | VARCHAR(20) | Auto-generated: "MYUNILA-42" |
| nomor_task | INT | Auto-increment per project |
| judul | NVARCHAR(500) | Judul task |
| deskripsi | NVARCHAR(MAX) | Markdown support |
| tipe | VARCHAR(20) | feature, bugfix, improvement, chore |
| prioritas | VARCHAR(20) | critical, high, medium, low |
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

### 3.9 `project.webhook_config`

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

## 4. API Endpoints

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

---

## 5. Frontend Pages

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

## 6. Bitbucket Integration Detail

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

## 7. RBAC Integration

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

## 8. Vibe Bot Integration

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

## 9. Implementation Phases

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

### Phase 5 — Advanced (Future)
- [ ] Bitbucket PR integration
- [ ] Notifications (webhook ke Telegram)
- [ ] Sprint/cycle management
- [ ] Time tracking
- [ ] Export report (PDF)
- [ ] Mobile responsive optimizations

---

## 10. Data Seed — Project MyUnila

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

## 11. File Structure (Backend)

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
