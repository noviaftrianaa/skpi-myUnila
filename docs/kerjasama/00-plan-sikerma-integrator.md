# Plan — Modul Kerjasama myUnila Integrator (Sync SIKERMA)

**Status**: DRAFT untuk review user
**Tanggal**: 2026-04-27
**Sumber data**: SIKERMA Unila (https://sikerma.unila.ac.id/api/v1/api-docs)
**Target**: pdut SQL Server schema `kerjasama` + `pdrd.dudi`

---

## 1. Konteks

User minta tambah **Modul Kerjasama** di myunila integrator (mengikuti pola siakadu / sikep / radius), dengan fitur sync data dari SIKERMA ke pdut.

### Existing state pdut

| Tabel | Rows | Catatan |
|-------|------|---------|
| `kerjasama.mou` | 1010 | Sudah ada data legacy (manual/import lama) |
| `kerjasama.sms_kerjasama` | 1232 | Mapping prodi ↔ kerjasama |
| `pdrd.dudi` | 0 | Master partner — KOSONG |

Schema sudah complete. Tinggal isi via sync API.

### Schema `kerjasama.mou` (key fields)

```
id_mou (UUID PK), id_sp, id_akt_kerjasama, id_dudi (FK → pdrd.dudi),
sk_mou, judul_mou, uraian_mou, tgl_mulai, tgl_selesai,
nm_dudi, npwp_dudi, nm_bu (badan usaha), tel_kantor, fax,
cp (contact person), tel_cp, jab_cp,
create_date, last_update, soft_delete (0/1), last_sync
```

### Reference tables (sudah ada di pdut)

- `ref.aktifitas_kerjasama` — jenis aktivitas (penelitian, pengabdian, MoU, MoA, dll)
- `ref.bentuk_kegiatan_kerjasama` — bentuk kegiatan
- `ref.bidang_kerjasama` — bidang
- `ref.kriteria_mitra` — kriteria mitra (industri, pemerintah, akademik)
- `ref.status_kerjasama` — status (aktif, expired, terminated)
- `ref.tingkat_kerjasama` — Lokal / Nasional / Internasional

---

## 2. Blocker — SIKERMA API Doc

URL `https://sikerma.unila.ac.id/api/v1/api-docs` di-protect Cloudflare bot challenge — **automation tidak bisa fetch langsung** (HTTP 403 + JS challenge).

### Yang perlu user sediakan

1. **Salinan OpenAPI/Swagger spec** SIKERMA (file JSON/YAML, atau screenshot Scalar/Swagger UI)
2. **Credentials SIKERMA API**:
   - Auth method (JWT / API key / Basic auth?)
   - Username + password / API key
   - Token endpoint kalau JWT-based
3. **Sample response** dari endpoint utama (mis. `GET /kerjasama` 1-2 row supaya bisa map field)
4. **Rate limit / throttle** info (kalau ada)

### Workaround sementara

Kalau API doc belum bisa di-share, mulai dari **field mapping manual** based on schema pdut yang sudah ada. Kalau SIKERMA pakai struktur berbeda, perlu translator layer.

---

## 3. Architecture (mirror pattern siakadu)

Ikuti struktur Go service `backend/myunila-service/apps/siakadu/` yang sudah running:

```
backend/myunila-service/apps/kerjasama/
├── entity.go         # struct DTO Kerjasama, MoU, Mitra
├── repository.go     # query pdut kerjasama.mou + sms_kerjasama + dudi
├── service.go        # business logic + sync orchestration
├── controller.go     # HTTP handlers
├── router.go         # route registration
└── sikerma_client.go # HTTP client ke SIKERMA API (auth + fetch + retry)
```

### API endpoints baru (mirip pattern siakadu)

| Method | Path | Tujuan |
|--------|------|--------|
| GET | `/kerjasama/mou` | List MoU dengan pagination + filter (tahun/tingkat/status) |
| GET | `/kerjasama/mou/stats` | Stats card: total, aktif, expired, per-tingkat |
| GET | `/kerjasama/mou/filters` | Available filter values (tahun, dudi, dst) |
| GET | `/kerjasama/mou/:id` | Detail 1 MoU |
| POST | `/kerjasama/sync` | Trigger sync dari SIKERMA → pdut (full atau filter) |
| GET | `/kerjasama/sync-progress` | Progress real-time sync (untuk modal sync UI) |
| GET | `/kerjasama/sms-kerjasama` | List sms_kerjasama (mapping prodi) |
| GET | `/kerjasama/dudi` | List partner (mitra) |

### Scheduler integration

Tambah sync_type `kerjasama` di:
- `backend/myunila-service/apps/scheduler/entity.go` — oneof validation + GetSyncTypes()
- `backend/myunila-service/apps/scheduler/service.go` — switch case
- SQL: `data-model/script/sqlserver/myunila/seed_scheduler_myunila_consolidated.sql` — schedule entry

Frequency saran: **mingguan Senin malam** (data kerjasama jarang berubah, weekly cukup).

---

## 4. Frontend Plan

### Side menu

`frontend/src/app/dashboard/integrator/config/menuConfig.tsx` — tambah:

```tsx
{
  title: "Kerjasama (SIKERMA)",
  icon: <FiBriefcase className="w-5 h-5" />,
  href: "/dashboard/integrator/sikerma",  // group root
  children: [
    { title: "MoU", href: "/dashboard/integrator/sikerma/mou" },
    { title: "Mitra (DUDI)", href: "/dashboard/integrator/sikerma/dudi" },
    { title: "SMS Kerjasama", href: "/dashboard/integrator/sikerma/sms" },
  ],
  roles: adminRoles,
}
```

### Page structure (mirip /integrator/siakadu/mahasiswa)

`frontend/src/app/dashboard/integrator/sikerma/mou/page.tsx`:
- Header + sync button + stats card (4 metrics)
- ScheduleList component (jadwal sync)
- Filter panel (tahun, tingkat, status, search)
- DataTable dengan pagination + drilldown ke detail MoU
- Modal detail (judul + uraian + tgl + dudi + lampiran SK)

Reuse pattern + components dari siakadu integrator (saya bisa copy-adapt).

---

## 5. Field Mapping (TENTATIVE)

Belum bisa final tanpa SIKERMA API spec. Asumsi berdasarkan schema pdut:

| pdut.kerjasama.mou field | SIKERMA expected field |
|--------------------------|------------------------|
| id_mou (UUID) | id (atau generate UUID baru, simpan SIKERMA id di field terpisah) |
| sk_mou | nomor_sk / no_dokumen |
| judul_mou | judul / title |
| uraian_mou | deskripsi / abstract |
| tgl_mulai | tanggal_mulai / start_date |
| tgl_selesai | tanggal_selesai / end_date |
| id_akt_kerjasama | jenis_aktivitas (map ke ref.aktifitas_kerjasama) |
| id_dudi | mitra_id (ke pdrd.dudi) |
| nm_dudi, npwp_dudi, nm_bu | mitra info |
| tel_kantor, cp, tel_cp, jab_cp | contact |

User confirm setelah dapat API spec.

---

## 6. Phasing (saran)

### Phase 1 — Foundation (3-5 hari kerja)
1. ✅ Audit existing schema pdut (DONE — di plan ini)
2. ⏳ Tunggu API doc SIKERMA + credentials dari user
3. Setup SIKERMA HTTP client (auth + retry + dry-run mode)
4. Implement repository + service (read-only first — list + stats)
5. Mount routes di myunila-service

### Phase 2 — Sync (5-7 hari kerja)
6. SikermaClient.GetListMoU() + transform → MoU entity
7. SikermaClient.GetListMitra() + transform → DUDI entity
8. Service.SyncMoU() — upsert ke kerjasama.mou + populate pdrd.dudi
9. Service.SyncMitra() — populate pdrd.dudi
10. Sync log via existing logger module (`apps/logger/`)
11. Scheduler integration

### Phase 3 — Frontend (3-5 hari kerja)
12. Menu config + 3 page (mou + dudi + sms)
13. Sync button + progress modal
14. ScheduleList integration
15. Filter + table + detail modal

### Phase 4 — Testing (2 hari)
16. Dry-run sync di staging vs SIKERMA staging endpoint
17. Verify upsert idempotent (re-run tidak duplicate)
18. Verify ref tables mapping benar (aktifitas, status, tingkat)
19. Frontend manual test
20. Production rollout

**Total estimasi**: 13-19 hari kerja, tergantung kompleksitas SIKERMA API.

---

## 7. Risiko + Mitigasi

| Risiko | Mitigasi |
|--------|----------|
| SIKERMA API doc belum dibuka untuk integrasi | Hubungi LP2M/PIC SIKERMA — dapatkan akses + credentials |
| SIKERMA pakai schema field berbeda total | Translator layer di `transform.go` — flexible mapping |
| Data legacy pdut.kerjasama.mou (1010 row) dari import lama mungkin overlap | Implement upsert by `sk_mou` + `tgl_mulai` (composite unique key) |
| `pdrd.dudi` kosong — kebutuhan id_dudi FK | Sync mitra DULU sebelum MoU. MoU yg referensi mitra baru auto-link |
| Cloudflare bot challenge di SIKERMA | Pakai user-agent yang sah + cookies session, atau tunggu IP whitelist |

---

## 8. Open Questions buat User

1. **Apakah SIKERMA backend diakses Anda atau LP2M/PIC?** Perlu konfirmasi siapa yang bisa kasih akses API.
2. **Direction sync**: read-only (pull) atau bidirectional (write back ke SIKERMA)?
3. **Frekuensi sync**: realtime / harian / mingguan? (Saran: mingguan)
4. **Fitur write di myUnila**: Apakah user di myUnila bisa input MoU baru, atau SIKERMA tetap one-way source-of-truth?
5. **Phase 1 priority**: read-only listing dulu, atau langsung full sync?

---

## 9. Next Step

Setelah Anda:
- Share OpenAPI spec SIKERMA (file/screenshot)
- Konfirm credentials + endpoint base URL
- Jawab open questions di atas

Saya bisa lanjut ke:
- Phase 1 scaffold backend (entity, repo, service skeleton)
- SikermaClient implementation dengan dry-run mode
- Map fields finalize berdasarkan response real

---

**Pic dev**: dev@unila.ac.id
**Repo modul nantinya**: `backend/myunila-service/apps/kerjasama/` + `frontend/src/app/dashboard/integrator/sikerma/`
