# Project Management — Contribution Charts & Profile Plan

## Overview
Tambah fitur visualisasi kontribusi & progress tracking di Project Management:
1. **Contribution Heatmap** — seperti GitHub contribution graph (titik-titik hijau)
2. **Project Charts** — grafik progress, burndown, activity timeline
3. **Team Profile** — profil kontribusi per anggota (bukan cuma commit)
4. **Multi-role tracking** — developer (commit), analis (task update), QA (status progress)

---

## Filosofi: Bukan Hanya Git!

GitHub cuma track commits. Kita track **semua kontribusi**:

| Role | Kontribusi yang di-track |
|------|--------------------------|
| Developer | Commit git, task completed, code review |
| Analis | Task created, dokumen dibuat, requirement update |
| QA | Task status change (review→done/reject), bug report |
| PM/Lead | Sprint planning, task assign, project update |
| Pimpinan | Comment, approval, document review |

Semua terekam di `activity_log` yang sudah ada.

---

## Feature 1: Contribution Heatmap (GitHub-style)

### Konsep
```
Profile: Mizar Zulmi — Developer

  Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep
  ░░░░░░░░░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
  Mon ░░░░▒▒▒░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓█▓▓▓▓▓▓▓▒▒░░░░░░░░░
  Wed ░░░▒▒▒▒▒░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒░░░░░░░
  Fri ░░░░▒▒▒░░░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓█▓▓▓▓▓▒▒▒░░░░░░░░░
  
  ░ = 0  ▒ = 1-3  ▓ = 4-7  █ = 8+
  
  Total: 847 kontribusi di 2026
  Streak: 23 hari berturut-turut
```

### Data Source
- **activity_log** di PostgreSQL (sudah ada!) — semua aksi user terekam
- Group by: `DATE(created_at)` + `id_pengguna`
- Count per hari = intensitas warna

### API Endpoint
```
GET /project/contributions?user_id=xxx&year=2026
GET /project/:id/contributions?year=2026  (per project)

Response:
{
  "year": 2026,
  "total": 847,
  "longest_streak": 23,
  "current_streak": 5,
  "data": {
    "2026-01-01": 0,
    "2026-01-02": 3,
    "2026-01-03": 7,
    ...
    "2026-03-18": 12
  },
  "by_type": {
    "task_completed": 234,
    "task_created": 156,
    "comment_added": 198,
    "document_uploaded": 45,
    "status_changed": 214
  }
}
```

### SQL Query (PostgreSQL)
```sql
SELECT 
    DATE(created_at) AS tanggal,
    COUNT(*) AS total,
    SUM(CASE WHEN aksi LIKE '%task%done%' THEN 1 ELSE 0 END) AS task_done,
    SUM(CASE WHEN aksi LIKE '%created%' THEN 1 ELSE 0 END) AS created,
    SUM(CASE WHEN aksi LIKE '%comment%' THEN 1 ELSE 0 END) AS comments,
    SUM(CASE WHEN aksi LIKE '%document%' THEN 1 ELSE 0 END) AS documents,
    SUM(CASE WHEN aksi LIKE '%status%' THEN 1 ELSE 0 END) AS status_changes
FROM activity_log
WHERE id_pengguna = $1
  AND created_at >= $2 AND created_at < $3
  AND soft_delete = FALSE
GROUP BY DATE(created_at)
ORDER BY tanggal
```

---

## Feature 2: Project Charts

### 2A. Activity Timeline (Area Chart)
```
  Aktivitas Mingguan — MyUnila Portal
  
  50 │            ╱╲
  40 │      ╱╲  ╱    ╲    ╱╲
  30 │    ╱    ╲╱      ╲╱    ╲
  20 │  ╱                      ╲
  10 │╱                          ╲
   0 └──────────────────────────────
     W1   W2   W3   W4   W5   W6
     
  ── Task Done  ── Task Created  ── Comments
```

### 2B. Sprint Burndown
```
  Sprint 1 — Burndown Chart
  
  40 │╲
  30 │  ╲  ─ ─ ─ ideal line
  20 │    ╲   ╲
  10 │      ╲    ╲___
   0 │────────────────╲──
     Day1  3   5   7   10
     
  ── Actual  ─ ─ Ideal
```

### 2C. Task Distribution (Donut)
```
  Status Tasks          Priority
  ┌──────────┐         ┌──────────┐
  │  ╭━━━╮   │         │  ╭━━━╮   │
  │ ╭╯   ╰╮  │         │ ╭╯   ╰╮  │
  │ ┃ 67% ┃  │         │ ┃     ┃  │
  │ ╰╮   ╭╯  │         │ ╰╮   ╭╯  │
  │  ╰━━━╯   │         │  ╰━━━╯   │
  └──────────┘         └──────────┘
  ■ Done 67%           ■ High 15%
  ■ In Progress 20%    ■ Medium 60%
  ■ Todo 13%           ■ Low 25%
```

### 2D. Team Contribution Bar Chart
```
  Kontribusi Tim — Maret 2026
  
  Mizar    ████████████████████████  124
  Andi     ███████████████           78
  Siti     ████████████              65
  Budi     ████████                  43
  Dewi     ██████                    31
```

### API Endpoints
```
GET /project/:id/charts/activity?period=weekly|monthly&months=3
GET /project/:id/charts/burndown?sprint_id=xxx
GET /project/:id/charts/distribution
GET /project/:id/charts/team-contribution?months=1
```

---

## Feature 3: Team Profile Page

### Konsep
Setiap user punya "profile card" di project management:

```
┌─────────────────────────────────────────────┐
│  👤 Mizar Zulmi Ramadhan                    │
│  Developer · UPT TIK                        │
│                                             │
│  ┌─── Contribution Heatmap ───────────────┐ │
│  │ ░░▒▓▓▓▓█▓▓▓▒▒░░▒▓▓▓▓▓▓▓█▓▓▓▓▒▒░░░░ │ │
│  │ ░▒▒▓▓▓█▓▓▓▓▒░░▒▓▓▓▓▓▓▓▓█▓▓▓▒▒░░░░░ │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  847 kontribusi · 23 hari streak            │
│                                             │
│  Statistik:                                 │
│  ✅ 234 task selesai                        │
│  📝 198 komentar                            │
│  📄 45 dokumen                              │
│  🔄 156 task dibuat                         │
│                                             │
│  Project Aktif:                             │
│  • MyUnila Portal (owner) — 67% done       │
│  • SIAKAD Migration (member) — 45% done    │
│                                             │
│  Aktivitas Terakhir:                        │
│  • 5 menit lalu: Completed "Fix IKU 9"     │
│  • 1 jam lalu: Commented on PR-234         │
│  • 2 jam lalu: Created "RBAC Matrix UI"    │
└─────────────────────────────────────────────┘
```

### API Endpoints
```
GET /project/profile/:userId — profil kontribusi user
GET /project/profile/:userId/activity?limit=20 — aktivitas terbaru
GET /project/profile/:userId/projects — project yang dia ikut
```

---

## Feature 4: QA & Analis View

### Task Progress Board (khusus QA/Analis)
```
┌─── Testing Queue ──────────────────────────┐
│                                             │
│ 🔴 Need Review (5)                         │
│  • MYUNILA-134 Fix login timeout    → Mizar│
│  • MYUNILA-142 Export Excel Data    → Andi  │
│  • MYUNILA-145 RBAC Matrix UI      → Siti  │
│                                             │
│ 🟡 In Testing (3)                          │
│  • MYUNILA-139 Dashboard Pimpinan   → QA   │
│  • MYUNILA-141 IKU 9 Drilldown     → QA   │
│                                             │
│ 🟢 Verified (12 this sprint)               │
│  • MYUNILA-130 WS Auth Revamp ✓           │
│  • MYUNILA-131 Data Unila Modul ✓         │
│                                             │
│ Progress: ██████████░░░░ 72% verified      │
└─────────────────────────────────────────────┘
```

Ini cukup pakai filter status yang sudah ada (`review` → QA pending, `done` → verified). Tinggal buat view khusus.

---

## Implementation Plan

### Phase 1: Backend — Charts & Contribution API (2-3 jam)
1. Repository: contribution heatmap query (group by date)
2. Repository: activity timeline (weekly/monthly aggregation)
3. Repository: burndown chart data
4. Repository: team contribution ranking
5. Repository: user profile stats
6. Handler + Router: 8 new endpoints
7. Service layer

### Phase 2: Frontend — Chart Components (3-4 jam)
1. **ContributionHeatmap.tsx** — SVG grid, 52 weeks × 7 days, color intensity
   - Library: pure SVG/CSS (no external lib needed)
   - Tooltip on hover: "5 contributions on Mar 18, 2026"
2. **ActivityChart.tsx** — recharts Area/Line chart (sudah ada recharts? kalau belum pakai CSS)
3. **BurndownChart.tsx** — Line chart ideal vs actual
4. **DistributionChart.tsx** — Donut/pie (CSS-based atau recharts)
5. **TeamContributionBar.tsx** — Horizontal bar chart
6. **UserProfileCard.tsx** — Profile card dengan heatmap + stats

### Phase 3: Frontend — Pages (2-3 jam)
1. **Project Overview page update** — tambah chart section
2. **New: `/[projectId]/analytics` page** — full analytics dashboard
3. **New: `/profile` page** — user contribution profile
4. **Settings: QA view toggle** — filter tasks by review status

### Phase 4: Polish (1 jam)
1. Dark mode support
2. Responsive
3. Export chart as PNG
4. Date range picker

---

## Chart Library Decision

| Option | Pro | Con |
|--------|-----|-----|
| **recharts** | Popular, React-native, declarative | Bundle size ~200KB |
| **Chart.js + react-chartjs-2** | Lightweight, canvas-based | Less React-idiomatic |
| **Pure CSS/SVG** | Zero dependencies | More code, less interactive |
| **lightweight-charts** | Financial-grade, fast | Overkill |

**Recommendation: recharts** — paling cocok Next.js, declarative, responsive built-in.
Kalau sudah ada di project, pakai langsung. Kalau belum, install `recharts`.

Heatmap pakai **pure SVG** (ringan, custom warna).

---

## DB Schema (tidak perlu tabel baru!)

Semua data dari tabel yang sudah ada:
- `activity_log` — semua aksi user (task CRUD, comment, document, status change)
- `tasks` — status, priority, assignee, dates
- `sprints` — sprint data
- `project_members` — team info

Hanya perlu **query aggregation** — tidak ada migration.

---

## Estimasi Total: 1 malam kerja (8-10 jam)

| Phase | Effort |
|-------|--------|
| Backend charts API | 2-3 jam |
| Heatmap component (SVG) | 1-2 jam |
| Chart components (recharts) | 2-3 jam |
| Pages + integration | 2-3 jam |
| Polish + responsive | 1 jam |

---

## Notes
- Contribution heatmap: 1 tahun = 365 cells, ringan di SVG
- Recharts bisa di-lazy-load (dynamic import) supaya ga nambah initial bundle
- Activity log sudah ada tapi perlu dipastikan semua aksi ke-log (buat/edit/hapus task, comment, document, status change)
- Streak calculation: consecutive days with ≥1 contribution
- Export: pakai `html2canvas` untuk screenshot chart → PNG
