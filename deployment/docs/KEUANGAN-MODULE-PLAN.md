# Keuangan Module — Plan & Findings

**Status:** Draft  
**Tanggal:** 2026-03-15  
**Scope:** myunila-integrator → Modul Keuangan (SIMPEDAM)

---

## 🔍 Temuan / Root Cause

### 1. Data Kosong di Staging (pdut)

- `keuangan.daftar_ukt` → **0 rows**
- `keuangan.spp_mhs` → **0 rows**
- Schema sudah ada, tabel sudah ada, struktur OK
- Data belum pernah di-sync dari SIMPEDAM ke DB staging

**Root cause:** Sync belum pernah dijalankan di staging. SIMPEDAM API sudah aktif (`is_active=1`, `last_test_status=success`), credential ada di `setting.api_configs` (encrypted), service berjalan. Tinggal trigger sync.

### 2. Side Menu Label

- **Saat ini:** `"Keuangan (SIMPEDAM)"` di `menuConfig.tsx` dan `"Keuangan (SIMPEDAM)"` di DB seed
- **Request:** Ubah jadi **"Keuangan"** saja
- **Lokasi:** 
  - Frontend: `frontend/src/app/dashboard/integrator/config/menuConfig.tsx`
  - DB: `man_akses.menu` (nm_menu untuk `#keuangan`)

### 3. NEXT_PUBLIC_KEUANGAN_API_URL Tidak Diset

- Container frontend staging tidak punya `NEXT_PUBLIC_KEUANGAN_API_URL`
- Fallback ke `localhost:9800/keuangan-service` — ini OK karena frontend dan Kong di VM yang sama
- Via Kong sudah ada route `keuangan-service → myunila-keuangan-staging:8088`
- API test via Kong: **HTTP 200**, response `{"data":null,...,"total":0}` — benar, data memang kosong

### 4. Struktur DB Staging vs Dev (pdut_dev)

Schema `keuangan` di staging (`pdut`) sudah memiliki:
- ✅ `keuangan.daftar_ukt` (18 kolom)
- ✅ `keuangan.spp_mhs` (27 kolom)
- ✅ `keuangan.mapping_prodi_simpedam` (12 kolom)
- ✅ `keuangan.kelas_ukt`
- ✅ Views: `v_daftar_ukt_with_mapping`, `v_daftar_ukt_summary`
- ✅ Temp tables: `temp_daftar_ukt`, `temp_iterasi_ukt`, `temp_ukt_mhs`

**Tidak ada ALTER yang perlu dijalankan** — struktur sudah sama dengan yang dipakai service.

### 5. Frontend Keuangan

- `keuanganClient.ts` — pakai `NEXT_PUBLIC_KEUANGAN_API_URL` atau fallback Kong
- `KeuanganDaftarUktTable.tsx` — component sudah ada
- `KeuanganSppMhsTable.tsx` — component sudah ada
- Page `/dashboard/integrator/keuangan/daftar-ukt` — sudah ada
- Page `/dashboard/integrator/keuangan/spp-mhs` — sudah ada

### 6. SIMPEDAM Credential Issue (Ditemukan saat implementasi)

- Akun `new_regis` di `setting.api_configs` SIMPEDAM berhasil get token
- Tapi `error_code=90: Tidak memiliki hak akses` saat hit method `DaftarUKT`
- Akun tidak punya permission untuk endpoint DaftarUKT di SIMPEDAM
- **Perlu:** Akun SIMPEDAM yang punya akses method `DaftarUKT` dan `SPP_Mahasiswa`
- Alternatif: Cek apakah ada akun lain atau minta aktivasi method ke admin SIMPEDAM

### 7. Status Implementasi (2026-03-15)

| Task | Status |
|---|---|
| Label menu "Keuangan" | ✅ Done |
| SIMPEDAM client init | ✅ Done |
| SPP Mhs sync semester 20252 | ✅ Done — 129 records |
| Daftar UKT sync | ❌ Blocked — akun `new_regis` tidak punya akses method DaftarUKT (error 90) |
| Frontend SPP display | ✅ Bisa ditest di /dashboard/integrator/keuangan/spp-mhs |
| Frontend Daftar UKT | ⏳ Menunggu akses WS SIMPEDAM diaktifkan |

**Action required:** Hubungi admin SIMPEDAM/TIK Unila untuk aktifkan method `DaftarUKT` di akun WS `new_regis`.

---

## 📋 Plan Implementasi

### Task 1 — Ubah Label Side Menu `"Keuangan"`

**A. Frontend (menuConfig.tsx)**
```
File: frontend/src/app/dashboard/integrator/config/menuConfig.tsx
Ubah: title: "Keuangan (SIMPEDAM)" → title: "Keuangan"
```

**B. DB — update nm_menu**
```sql
UPDATE man_akses.menu 
SET nm_menu = 'Keuangan', last_update = GETDATE()
WHERE nm_file = '#keuangan' 
  AND id_aplikasi = (SELECT id_aplikasi FROM man_akses.aplikasi WHERE app_slug = 'myunila-integrator')
```

**C. Update seed JSON** (jika ada per-app file myunila-integrator.json)

---

### Task 2 — Trigger Sync Data SIMPEDAM

Sync daftar UKT dan SPP mahasiswa via API keuangan service:

```bash
# Sync Daftar UKT
curl -X POST http://localhost:8088/api/v1/daftar-ukt/sync \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tahun": 2024}'

# Sync SPP Mahasiswa
curl -X POST http://localhost:8088/api/v1/spp-mhs/sync \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tahun": 2024, "id_smt": "20241"}'
```

Perlu cek endpoint sync yang tersedia di keuangan service router dulu.

---

### Task 3 — Cek & Fix Frontend Data Display

Verifikasi setelah sync:
1. Cek response API `/api/v1/daftar-ukt` — pastikan data muncul
2. Cek response API `/api/v1/spp-mhs` — pastikan data muncul
3. Cek view di frontend — filter, pagination, dll
4. Cek `NEXT_PUBLIC_KEUANGAN_API_URL` env var di docker-compose frontend

---

### Task 4 — Update docker-compose frontend staging

Tambah `NEXT_PUBLIC_KEUANGAN_API_URL` eksplisit (opsional, sudah ada fallback):
```yaml
NEXT_PUBLIC_KEUANGAN_API_URL: "http://192.168.120.45:9800/keuangan-service"
```

---

## 📌 Urutan Implementasi

1. **Task 1** → Ubah label menu (frontend + DB + seed)
2. **Task 2** → Cek endpoint sync → trigger sync SIMPEDAM
3. **Task 3** → Verifikasi data muncul di frontend
4. **Task 4** → Tambah env var jika perlu

---

## ⚠️ Catatan Penting

- **Jangan push .env** yang berisi credentials
- Sync SIMPEDAM mungkin butuh waktu lama (data besar)
- `keuangan.daftar_ukt` join ke `pdrd.sms` — pastikan `id_sms` ter-mapping setelah sync
- `GetDaftarUKTList` pakai `INNER JOIN pdrd.sms` → data hanya tampil jika sudah ter-mapping ke prodi
- `mapping_prodi_simpedam` tabel kosong juga → perlu seed/build mapping dari NPM (`BuildProdiMappingFromNPM`)

---

*Plan dibuat sebelum implementasi. Update setelah setiap task selesai.*
