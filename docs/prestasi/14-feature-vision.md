# Feature Vision — SI-Prestasi sebagai Aplikasi Penuh

Catatan update dari user 2026-04-19:
> "Si prestasi ini bukan hanya untuk sync data saja yah tapi ada transaksi data nanti mahasiswa bisa akses dimyunila, admin dll tim kemahasiswaan bisa mengelola juga… yang paling utama pelaporan ke api simkatmawa dulu khusus role admin unit yang mengelola"

Artinya SI-Prestasi **bukan** utility one-off untuk push ke SIMKATMAWA. Ini aplikasi transaksi lengkap dengan UX mahasiswa + admin, dan SIMKATMAWA reporting adalah salah satu fungsi (yang diprioritaskan pertama).

---

## Persona & use case

### 1. Mahasiswa (Phase 1.5 / Phase 2)
- Login di portal MyUnila (SSO existing)
- Akses halaman "Prestasi Saya" → lihat list prestasi yang tercatat atas namanya
- Submit pengajuan prestasi baru (isi form lengkap, upload sertifikat/foto) → status `draft`
- Track status pengajuan: draft / direview fakultas / disetujui / ditolak / dikirim ke SIMKATMAWA
- Edit/cancel pengajuan selagi belum ditinjau
- Notifikasi (email / in-app) kalau status berubah
- Download rekapan prestasi pribadi (CV / transkrip prestasi)

### 2. Admin Unit Kemahasiswaan (Phase 1 — PRIORITAS)
- Role: `admin_kemahasiswaan` (biasanya Bidang Kemahasiswaan Pusat atau Unit BAK)
- **Fungsi utama Phase 1: input & kirim prestasi ke SIMKATMAWA**
- CRUD prestasi / sertifikasi / rekognisi
- Lookup NIM + nama mahasiswa dari pdut (autocomplete)
- Lookup NUPTK/NIDN dosen
- Upload dokumen (sertifikat, foto, undangan, surat tugas)
- Review pengajuan dari fakultas/mahasiswa (Phase 2)
- Approve & push ke SIMKATMAWA (tombol "Kirim")
- Lihat sync log + retry
- Kelola master data (ref) + `setting.api_config` (kredensial SIMKATMAWA)
- Export rekap (CSV/Excel) untuk laporan internal

### 3. Admin Fakultas / Operator Fakultas (Phase 2)
- Role: `operator_fakultas` — 1 per fakultas
- Scope: hanya prestasi mahasiswa fakultasnya
- Input prestasi atas nama mahasiswa fakultas
- Review pengajuan mahasiswa fakultas → forward ke admin pusat atau approve langsung
- Lihat statistik fakultas

### 4. Pimpinan (Phase 4)
- Role: `viewer_pimpinan` (WR3, Dekan, Kaprodi)
- Read-only dashboard prestasi per fakultas, per tahun, per kategori
- Ranking mahasiswa berprestasi (top N)
- Integrasi dengan `frontend/src/app/dashboard/pimpinan/prestasi/` existing

---

## Prioritas eksekusi

**Phase 1 (yang paling utama per arahan user):**
1. Admin unit bisa input prestasi/sertifikasi/rekognisi (CRUD)
2. Upload dokumen, lookup NIM/NUPTK
3. Master data + kredensial SIMKATMAWA
4. Push ke SIMKATMAWA (dry-run → live setelah kode_pt ada)
5. Sync log + retry
6. Role `admin_kemahasiswaan` saja — single-tier workflow

**Phase 1.5 (boleh parallel atau setelah Phase 1 stable):**
- Halaman "Prestasi Saya" untuk mahasiswa (read-only — lihat prestasi yang admin sudah input atas namanya)
- Notifikasi dasar (email) saat status berubah ke `sent`

**Phase 2:**
- Role `operator_fakultas` (multi-tenancy)
- Workflow approval: mahasiswa submit → fakultas review → admin pusat kirim
- Mahasiswa bisa submit sendiri (self-service)
- Notifikasi lebih rich (template, WA link)

**Phase 3 (blocked):**
- Pull 2-arah dari SIMKATMAWA (tunggu DIKTI expose GET)

**Phase 4:**
- Dashboard pimpinan, ranking, IKU integration

---

## Implikasi untuk schema

Skema yang sudah saya drift di §04 **sudah support** vision penuh ini — karena sejak awal saya modelkan:
- Multi-mahasiswa per prestasi (`prestasi.peserta_mhs`)
- State machine workflow (draft/review/ready/sent/error/archived)
- Polymorphic untuk 3 tipe (prestasi/sertifikasi/rekognisi)
- Ownership per fakultas (`id_fakultas`)
- Audit trail (`log.jejak_audit`)

Yang **BELUM** saya model dan perlu ditambah untuk Phase 1.5/2 (tapi boleh ditambah di v1.1 — Phase 1 v1.0 cukup):
- Tabel `prestasi.catatan_review` — komentar reviewer ke pengaju (Phase 2)
- Tabel `notifikasi.pesan` + template (mirip SIMBAK `ref.template_notifikasi`) — Phase 1.5
- Kolom `id_pengaju` terpisah dari `id_creator` (supaya bisa bedain mahasiswa submit vs admin input atas namanya)

Untuk v1.0 Phase 1, saya **akan tambah** kolom `id_pengaju UUID NULL` di parent tables (prestasi_mandiri, sertifikasi, rekognisi) dari sekarang — biar nanti Phase 2 tidak perlu alter. Default NULL kalau admin input manual.

---

## Implikasi untuk UI (frontend sim-prestasi)

Route tambahan Phase 1.5/2:
```
frontend/src/app/dashboard/sim-prestasi/
├── admin/               # admin_kemahasiswaan only
│   ├── page.tsx         # dashboard admin (count status, quick-filter)
│   ├── prestasi/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── sertifikasi/ …
│   ├── rekognisi/ …
│   ├── sync-log/page.tsx
│   └── master-data/
│       ├── page.tsx
│       └── api-config/page.tsx    # edit setting.api_config
├── fakultas/            # operator_fakultas (Phase 2)
│   └── …
└── mahasiswa/           # Phase 1.5
    └── prestasi-saya/page.tsx
```

Portal mahasiswa entry point: tambah menu "Prestasi Saya" di menu mahasiswa existing (biasanya di `frontend/src/app/portal/` atau `dashboard/` tergantung struktur aktif).

---

## Phase 1 deliverable (yang akan saya kerjakan sekarang)

✅ = Phase 1 scope
🟡 = Phase 1.5 (opsional parallel)
🔵 = Phase 2+ (later)

| Deliverable | Phase |
|---|---|
| DDL si_prestasi v1.0 (schemas, tables, ref) | ✅ |
| Seed referensi SIMKATMAWA + setting.api_config | ✅ |
| Service skeleton backend/si-prestasi-service (copy SIMBAK + rename) | ✅ |
| PdutRepository (lookup mahasiswa/dosen/fakultas) | ✅ |
| CRUD API prestasi/sertifikasi/rekognisi (admin only) | ✅ |
| Upload dokumen + nginx static | ✅ |
| ApiConfigService + SimkatmawaClient + dry-run mode | ✅ |
| Submit-to-SIMKATMAWA job + queue worker | ✅ |
| Frontend admin page (CRUD + submit button + sync log) | ✅ |
| Master Data UI (ref read-only + api-config edit) | ✅ |
| Docker compose VM8 (staging di VM5 dulu) | ✅ |
| Kong route + frontend env VM1 | ✅ |
| Mahasiswa "Prestasi Saya" (read-only) | 🟡 |
| Notifikasi email status change | 🟡 |
| Operator fakultas RBAC + workflow approval | 🔵 |
| Mahasiswa self-submit | 🔵 |
| Dashboard pimpinan | 🔵 |

---

## Catatan penting

1. **Prioritas user jelas:** "pelaporan ke SIMKATMAWA dulu, role admin unit". Saya tidak akan terdistraksi build workflow multi-tier di Phase 1.
2. **Mahasiswa di Phase 1** hanya bisa lihat (kalau kita tambah halaman "Prestasi Saya" di Phase 1.5). Tidak bisa input — mencegah data mentah masuk ke workflow yang belum siap.
3. **Phase 1 harus deliverable self-contained** — admin unit bisa 100% kerjakan tugas laporan ke SIMKATMAWA tanpa dependency dari mahasiswa/fakultas yang belum on-board.
