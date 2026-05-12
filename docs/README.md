# docs/

Dokumentasi platform myUnila — terorganisir per kategori.

## Struktur Folder

### 📐 Per Layer / Function

| Folder | Isi |
|---|---|
| [`api/`](api/) | API endpoint reference, panduan integrasi API |
| [`architecture/`](architecture/) | (placeholder) — high-level system architecture, ADR |
| [`operations/`](operations/) | Deployment, setup VM, plans operasional, laporan |
| [`security/`](security/) | RBAC, security plans, audit reports (sebagian sensitive — gitignored) |
| [`sql/`](sql/) | SQL reference, schema notes |
| [`summary/`](summary/) | Blueprint dev, schema analysis (gitignored, sensitive) |

### 🚀 Per Service / Initiative

| Folder | Service |
|---|---|
| [`blog-platform/`](blog-platform/) | Blog Platform myUnila (`v2` plan) |
| [`iku/`](iku/) | Dashboard IKU (1, 2, 3, 5, 7, 9) |
| [`kerjasama/`](kerjasama/) | SIKERMA (Sistem Kerjasama) integrator |
| [`ktw/`](ktw/) | KTW (Kompetensi Tugas Wajib) |
| [`manajemen-konten/`](manajemen-konten/) | CMS pengumuman/berita |
| [`prestasi/`](prestasi/) | SI-Prestasi (SIMKATMAWA integration) |
| [`services/web-monitoring/`](services/web-monitoring/) | Web Monitoring service |
| [`si-kkn/`](si-kkn/) | SI-KKN (Sistem Informasi KKN) |
| [`simbak/`](simbak/) | SIMBAK (Sistem Manajemen BAK) |
| [`sso/`](sso/) | SSO integration guide |

### 🔌 Per Integration

| Folder | External System |
|---|---|
| [`integrations/siakadu/`](integrations/siakadu/) | SIAKADU sync, field mapping |

### 📋 Per Process

| Folder | Topik |
|---|---|
| [`project-management/`](project-management/) | PM plans, org structure, contribution guide |

### 🔒 Gitignored (Local Only)

| Folder | Tujuan |
|---|---|
| `_internal/` | Personal notes, generated reports (HTML/PPTX), sensitive PDFs |
| `_archive/` | Historical Claude planning docs dari 2025 (rename dari `claude/`) |
| `ignore/` | Local scratch — data exports, helper scripts |
| `tools/` | Local utility tools (md2pdf, foto-mhs-uploader) |
| `presentasi-progress-2026/` | PPTX generators untuk laporan pimpinan |

---

## Quick Links — Key Documents

### Deployment & Operations
- [Deployment Production Plan](operations/deployment/DEPLOY-PRODUCTION-PLAN.md)
- [Deployment Checklist](operations/deployment/DEPLOYMENT-CHECKLIST.md)
- [VM6 Replica Setup](operations/deployment/VM6-REPLICA-SETUP.md)
- [VM3 PostgreSQL Setup](operations/setup/VM3-POSTGRESQL-SETUP.md)
- [Bitbucket Webhook Setup](operations/setup/BITBUCKET-WEBHOOK-SETUP.md)

### Architecture & Planning
- [Blog Platform v2 Plan](blog-platform/myunila_blog_platform_plan_v2.pdf)
- [SSO Client External Integration](sso/panduan-integrasi-sso-client-external.md)
- [Plan Blog CMS myUnila](operations/Plan_Blog_CMS_myUnila.md)
- [Plan LMS myUnila](operations/Plan_LMS_myUnila.md)

### Integrations
- [SIAKADU Integration Plan](integrations/siakadu/SIAKADU-INTEGRATION-PLAN.md)
- [SIAKADU Field Mapping](integrations/siakadu/SIAKADU-FIELD-MAPPING.md)

### Project Management
- [Project Management Plan](project-management/PROJECT-MANAGEMENT-PLAN.md)
- [Contribution Guide](project-management/PROJECT-CONTRIBUTION-PLAN.md)
- [Org Structure](project-management/PROJECT-MANAGEMENT-ORG-PLAN.md)

### Service Documentation
- [SIMBAK Overview](simbak/00-overview.md)
- [SI-KKN Panduan Pengembangan](si-kkn/Panduan_Pengembangan_SI_KKN_Tim_Magang.md)
- [SI-Prestasi Overview](prestasi/00-overview-dan-scope.md)
- [Manajemen Konten Plan](manajemen-konten/00-plan-manajemen-konten.md)
- [SIKERMA Integrator Plan](kerjasama/00-plan-sikerma-integrator.md)

### Tools
- `tools/md2pdf/` — Markdown to PDF converter (gitignored)

---

## Convention

- **File naming**: `kebab-case.md` untuk dokumen baru. Existing `UPPER-CASE` filenames di-preserve (historical).
- **Sub-folder**: pakai nama service/topic singkat. Kalau folder kosong, hapus.
- **Sensitive content**: jangan commit credentials, API tokens, atau internal personal notes. Pakai `_internal/` (gitignored).

## Generated PDF

Beberapa markdown punya versi PDF yang di-generate via [`docs/tools/md2pdf/`](tools/md2pdf/) (gitignored). Untuk regenerate:

```bash
docs/tools/md2pdf/md2pdf.bat <file.md>
```

Output PDF (kalau di-track) disimpan di folder yang sama dengan source markdown.
