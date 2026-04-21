# Timeline & Milestones

Estimasi kasar. Disesuaikan kapasitas tim.

---

## Assumption

- 1 backend developer (full-time)
- 1 frontend developer (part-time, 50%)
- 1 PM/ops (20%, untuk koordinasi + testing)
- Stack: Laravel + Next.js (sesuai rekomendasi)

---

## Phase 1 — Foundation & Entry (4–6 minggu)

| W | Milestone |
|---|---|
| W1 | Setup repo `backend/si-prestasi-service/` skeleton, Laravel fresh, DB + migrations schema ref + prestasi utama (tanpa sync) |
| W1 | Frontend skeleton `frontend/src/app/dashboard/sim-prestasi/`, routing, client service |
| W2 | API CRUD prestasi_mandiri (tanpa SIMKATMAWA), form frontend + validasi |
| W2 | Lookup mahasiswa & dosen dari pdut (cross-DB) |
| W3 | API CRUD sertifikasi + rekognisi |
| W3 | File upload + nginx public files + scan content-type |
| W4 | Master data UI (referensi read + kode_pt edit) |
| W4 | RBAC — role `operator_fakultas`, `admin_kemahasiswaan` |
| W5 | Unit + integration test backend |
| W5 | UI polish, filter/search, pagination |
| W6 | Dokumentasi user + deployment staging |

**Phase 1 deliverable:** aplikasi entry prestasi **tanpa** push ke SIMKATMAWA. Ops bisa input → list → edit. Data stays local.

---

## Phase 2 — Push SIMKATMAWA (2–3 minggu)

| W | Milestone |
|---|---|
| W7 | `SimkatmawaClient` + token manager + login + ping health |
| W7 | Transform layer: prestasi → payload SIMKATMAWA |
| W8 | Queue job `SubmitToSimkatmawaJob` + state machine + retry |
| W8 | UI submit button, status badges, sync-log page |
| W9 | Test dengan akun SIMKATMAWA (staging kalau ada, atau dry_run) |
| W9 | Monitoring + alert, dokumentasi ops |

**Phase 2 deliverable:** ops bisa tekan "Kirim" → prestasi masuk ke SIMKATMAWA → tercatat `simkatmawa_id`.

---

## Phase 3 — Sync 2 arah (menunggu GET endpoint dari DIKTI)

**Status:** BLOCKED. Tunggu DIKTI expose GET. Tidak dijadwalkan sampai unblocked.

Saat unblocked, estimasi 1–2 minggu:
- Scheduled job `PullFromSimkatmawaJob`
- Reconciliation logic (data beda → flag)
- UI diff viewer

---

## Phase 4 — Analitik & integrasi dashboard (2 minggu — opsional)

| Minggu ke-n | Milestone |
|---|---|
| +1 | Dashboard pimpinan: tabel + chart prestasi per fakultas/tahun |
| +2 | Export CSV, trending tahun, badge mahasiswa berprestasi (top 10) |

---

## Ketergantungan eksternal (critical path)

| # | Item | Impact |
|---|---|---|
| E1 | Kredensial SIMKATMAWA Unila + kode_pt | Blocker Phase 2 |
| E2 | DNS + cert untuk subdomain files (opsional) | Blocker Phase 1 (kalau pakai subdomain) |
| E3 | Approval infra untuk VM target + network ke 192.168.123.119 | Blocker Phase 1 deploy |
| E4 | DIKTI expose GET endpoint SIMKATMAWA | Blocker Phase 3 |
| E5 | Firewall rule VM target → simkatmawa.kemdiktisaintek.go.id:443 | Blocker Phase 2 |

---

## Risk-adjusted timeline

Kalau semua lancar: **Phase 1 + 2 selesai dalam 8 minggu**.
Buffer 25% untuk surprise: realistically **10–11 minggu** sampai Phase 2 deploy ke produksi.

---

## "Crash" timeline (minimum 6 minggu)

Kalau urgent dan boleh skip review step + RBAC basic:

| W | |
|---|---|
| W1 | Schema + migrate + CRUD prestasi_mandiri API |
| W2 | Frontend CRUD prestasi_mandiri + file upload |
| W3 | Sertifikasi + rekognisi |
| W4 | SIMKATMAWA client + queue + submit |
| W5 | Staging test + master data |
| W6 | Production deploy |

Skip: Phase 4, multi-level approval, advanced monitoring.

**Recommendation:** jangan ambil crash timeline kecuali benar-benar urgent. Trade-off kualitas vs speed berisiko karena SIMKATMAWA tidak punya DELETE (sekali kirim salah, susah koreksi).
