# Project Management — UI/UX Plan

> Mengikuti template & pattern yang ada di MyUnila Portal
> Stack: Next.js 15 + HeroUI + Tailwind + Framer Motion
> Brand color: myunila (#0B5EA8)

---

## 1. Route Structure

```
/dashboard/project-management/
├── page.tsx                      → Dashboard overview
├── [projectId]/
│   ├── page.tsx                  → Project detail + stats
│   ├── board/page.tsx            → Kanban board (drag & drop)
│   ├── list/page.tsx             → Task list view (DataTable)
│   ├── timeline/page.tsx         → Timeline/Gantt view
│   ├── modules/page.tsx          → Module management
│   └── activity/page.tsx         → Activity feed
├── config/
│   └── menuConfig.tsx            → Sidebar menu config
└── components/
    ├── ProjectCard.tsx           → Card untuk dashboard
    ├── KanbanBoard.tsx           → Kanban utama
    ├── KanbanColumn.tsx          → Column kanban
    ├── KanbanCard.tsx            → Task card di kanban
    ├── TaskDetailPanel.tsx       → Side panel detail task
    ├── TaskCreateModal.tsx       → Modal buat task
    ├── ModuleList.tsx            → Module management
    ├── ActivityFeed.tsx          → Activity timeline
    ├── TimelineChart.tsx         → Gantt chart sederhana
    └── ProgressReport.tsx        → Print laporan progress
```

---

## 2. Dashboard Overview (`/project-management`)

### Layout Reference: Dashboard Pimpinan pattern

```
┌──────────────────────────────────────────────────────┐
│  🎯 Project Management                    [+ Project] │
│  Kelola dan pantau progress project Anda               │
├──────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Total   │ │ Active  │ │ Tasks   │ │ Overdue │    │
│  │ Project │ │ Project │ │ Done    │ │ Tasks   │    │
│  │   5     │ │   3     │ │  127    │ │   8     │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│                                                        │
│  Project Cards (grid 1/2/3 cols responsive):           │
│  ┌──────────────────┐ ┌──────────────────┐            │
│  │ 🔵 MyUnila Portal │ │ 🟢 SIAKAD        │            │
│  │ MYUNILA           │ │ SIAKAD           │            │
│  │ ████████░░ 75%    │ │ ██░░░░░░░░ 20%   │            │
│  │ 45/60 tasks done  │ │ 8/40 tasks done  │            │
│  │ 5 modules         │ │ 3 modules        │            │
│  │ [Board] [List]    │ │ [Board] [List]   │            │
│  └──────────────────┘ └──────────────────┘            │
└──────────────────────────────────────────────────────┘
```

### Stat Cards
- Gradient cards (same style as ManAkses stats)
- Colors: indigo, emerald, blue, orange

### Project Cards
- HeroUI Card with hover shadow
- Progress bar (Tailwind `bg-myunila` for fill)
- Quick action buttons: Board, List, Timeline
- Badge: status (active=green, archived=gray)
- Warna accent strip kiri sesuai project.warna

---

## 3. Kanban Board (`/[projectId]/board`)

### Trend: Modern kanban like Linear/Notion

```
┌─────────────────────────────────────────────────────────────────┐
│  MyUnila Portal — Board                [Filter ▾] [+ Task]      │
│  Module: [Semua ▾]                                               │
├──────────┬──────────┬──────────┬──────────┬──────────┤
│ Backlog  │  Todo    │In Progress│ Review  │  Done    │
│ (12)     │  (5)     │   (8)    │  (3)     │  (45)   │
├──────────┼──────────┼──────────┼──────────┼──────────┤
│┌────────┐│┌────────┐│┌────────┐│┌────────┐│┌────────┐│
││🔴 Urgent ││🟠 High  ││🟠 High  ││🟡 Med   ││✅ Done  ││
││Fix login ││API Auth ││Kanban UI││Review PR││Fix RBAC ││
││MYUNILA-5││MYUNILA-3││MYUNILA-8││MYUNILA-2││MYUNILA-1││
││👤 Mizar ││👤 Mahend││👤 Mizar ││         ││👤 Mizar ││
││📅 Mar 20││📅 Mar 18││📅 Mar 22││📅 Mar 19││✓ Mar 15 ││
│└────────┘│└────────┘│└────────┘│└────────┘│└────────┘│
│┌────────┐│┌────────┐│┌────────┐│         ││┌────────┐│
││🟡 Med   ││🟢 Low   ││🔴 Urgent││         │││✅ Done  ││
││New feat ││Docs upd ││DB migrat││         │││WS Auth  ││
│└────────┘│└────────┘│└────────┘│         ││└────────┘│
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Kanban Card Design
```jsx
<div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 
  dark:border-slate-700 p-3 shadow-sm hover:shadow-md transition-all 
  cursor-grab active:cursor-grabbing group">
  
  {/* Priority + Type */}
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-1.5">
      {/* Priority dot */}
      <span className="w-2 h-2 rounded-full bg-red-500" />
      {/* Type badge */}
      <Chip size="sm" variant="flat" color="primary" className="text-[10px]">
        ✨ Feature
      </Chip>
    </div>
    <span className="text-[10px] text-gray-400 font-mono">MYUNILA-42</span>
  </div>
  
  {/* Title */}
  <h4 className="text-sm font-medium text-gray-900 dark:text-white 
    line-clamp-2 mb-2">
    Implementasi kanban board drag & drop
  </h4>
  
  {/* Tags */}
  <div className="flex flex-wrap gap-1 mb-2">
    <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 
      rounded-md">frontend</span>
  </div>
  
  {/* Footer */}
  <div className="flex items-center justify-between pt-2 border-t 
    border-gray-100 dark:border-slate-700">
    {/* Assignee */}
    <div className="flex items-center gap-1.5">
      <div className="w-5 h-5 rounded-full bg-myunila text-white 
        text-[10px] flex items-center justify-center font-bold">M</div>
      <span className="text-[10px] text-gray-500">Mizar</span>
    </div>
    {/* Due date */}
    <span className="text-[10px] text-gray-400 flex items-center gap-1">
      📅 Mar 20
    </span>
  </div>
</div>
```

### Drag & Drop
- Library: `@hello-pangea/dnd` (fork of react-beautiful-dnd)
- Install: `npm install @hello-pangea/dnd`
- Smooth animation, touch support
- On drop: call `POST /tasks/reorder` with new positions
- Optimistic update (update UI first, then API)

### Column Styling
```
Backlog:     bg-slate-50    border-l-4 border-slate-400
Todo:        bg-blue-50     border-l-4 border-blue-400
In Progress: bg-amber-50    border-l-4 border-amber-400
Review:      bg-purple-50   border-l-4 border-purple-400
Done:        bg-emerald-50  border-l-4 border-emerald-400
```

### Mobile Responsive
- On mobile (<640px): horizontal scroll for columns
- Column min-width: 280px
- Cards stack vertically in each column
- Touch-friendly drag handles

---

## 4. Task List View (`/[projectId]/list`)

### Uses existing DataTable component
- Same pattern as ManAkses tables
- Columns: Kode, Judul, Module, Prioritas, Status, Assignee, Due Date, Progress
- Filters: Module, Status, Priority, Assignee
- Server-side pagination + search
- Inline status change (dropdown)

---

## 5. Task Detail Panel

### Side panel (slide from right) or modal
```
┌─────────────────────────────────────┐
│ MYUNILA-42                    [✕]    │
│ ✨ Feature | 🔴 Urgent              │
├─────────────────────────────────────┤
│                                      │
│ Implementasi kanban board            │
│ drag & drop                          │
│                                      │
│ Deskripsi:                           │
│ Buat kanban board dengan drag and    │
│ drop support menggunakan...          │
│                                      │
│ ┌──────────┬───────────────┐        │
│ │ Status   │ [In Progress ▾] │        │
│ │ Priority │ [Urgent ▾]      │        │
│ │ Assignee │ [Mizar ▾]       │        │
│ │ Module   │ [ManAkses]      │        │
│ │ Due Date │ [2026-03-20]    │        │
│ │ Progress │ [███░░] 60%     │        │
│ └──────────┴───────────────┘        │
│                                      │
│ ── Commits ──────────────────       │
│ 📌 80ee146 fix: RBAC labels         │
│ 📌 71ab7c3 feat: WS Auth revamp     │
│                                      │
│ ── Komentar ─────────────────       │
│ 👤 Mizar — 2 jam lalu               │
│ "Progress update: UI done, perlu    │
│  testing di mobile"                  │
│                                      │
│ [Tulis komentar...]          [Kirim] │
└─────────────────────────────────────┘
```

---

## 6. Progress Report (Print)

### Template cetak laporan untuk pimpinan

```
┌──────────────────────────────────────────┐
│  [Logo Unila]                             │
│  UNIVERSITAS LAMPUNG                      │
│  UPT Teknologi Informasi & Komunikasi     │
│                                            │
│  LAPORAN PROGRESS PROJECT                  │
│  Periode: 1 Mar 2026 - 17 Mar 2026        │
├──────────────────────────────────────────┤
│                                            │
│  Project: MyUnila Portal                   │
│  Status: Active                            │
│  Overall Progress: ████████░░ 75%          │
│                                            │
│  RINGKASAN                                 │
│  ┌────────┬────────┬────────┬────────┐    │
│  │ Total  │ Selesai│ Proses │ Overdue│    │
│  │  60    │  45    │   8    │   3    │    │
│  └────────┴────────┴────────┴────────┘    │
│                                            │
│  PROGRESS PER MODUL                        │
│  1. Manajemen Akses    ████████░░ 80%     │
│  2. Data Unila          ██████░░░░ 60%     │
│  3. Monitoring          ████░░░░░░ 40%     │
│                                            │
│  DETAIL TASK SELESAI PERIODE INI           │
│  ┌───┬──────────┬──────────┬──────┐       │
│  │No │ Task     │ Selesai  │ PJ   │       │
│  ├───┼──────────┼──────────┼──────┤       │
│  │ 1 │MYUNILA-38│ 15 Mar   │Mizar │       │
│  │ 2 │MYUNILA-42│ 17 Mar   │Mizar │       │
│  └───┴──────────┴──────────┴──────┘       │
│                                            │
│  TASK OVERDUE                              │
│  ┌───┬──────────┬──────────┬──────┐       │
│  │No │ Task     │ Deadline │ PJ   │       │
│  └───┴──────────┴──────────┴──────┘       │
│                                            │
│  Dicetak: 17 Maret 2026                    │
│  MyUnila — UPT TIK Universitas Lampung     │
└──────────────────────────────────────────┘
```

### Filter untuk print:
- Periode (tanggal mulai - tanggal akhir)
- Module (pilih modul tertentu atau semua)
- Status (selesai saja / semua)
- Format: PDF via window.print()

---

## 7. Color & Icon System

### Priority Colors
```css
urgent:  bg-red-500/10 text-red-600 border-red-200
high:    bg-orange-500/10 text-orange-600 border-orange-200
medium:  bg-yellow-500/10 text-yellow-600 border-yellow-200
low:     bg-green-500/10 text-green-600 border-green-200
```

### Status Colors
```css
backlog:     bg-slate-100 text-slate-600
todo:        bg-blue-100 text-blue-600
in_progress: bg-amber-100 text-amber-600
review:      bg-purple-100 text-purple-600
done:        bg-emerald-100 text-emerald-600
cancelled:   bg-red-100 text-red-600
```

### Task Type Icons
```
feature:       ✨ (or FiStar)
bugfix:        🐛 (or FiAlertCircle) 
improvement:   🔧 (or FiTool)
chore:         📦 (or FiPackage)
documentation: 📝 (or FiFileText)
```

---

## 8. Responsive Breakpoints

```
Mobile   (<640px):  1 column, stacked cards, horizontal scroll kanban
Tablet   (640-1024): 2 column grid, kanban with scroll
Desktop  (>1024):   3 column grid, full kanban view
```

### Mobile-specific:
- Bottom sheet for task detail (instead of side panel)
- Swipe cards for status change
- Floating action button for "+ Task"
- Hamburger collapse for kanban columns

---

## 9. Dependencies to Install

```bash
npm install @hello-pangea/dnd    # Drag & drop for kanban
# gantt-task-react              # Optional: for timeline view (later)
```

---

## 10. Sidebar Menu Config

```typescript
export const projectMenuConfig: MenuItem[] = [
  {
    title: "Dashboard",
    icon: <MdDashboard />,
    href: "/dashboard/project-management",
  },
  {
    title: "Projects",
    icon: <FiFolder />,
    children: [
      // Dynamic per project - or link to dashboard
      { title: "Semua Project", href: "/dashboard/project-management" },
    ],
  },
];
```

For each project, sidebar shows:
- Board
- List  
- Timeline
- Modules
- Activity
- Settings
