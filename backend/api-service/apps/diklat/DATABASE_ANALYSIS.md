# Analisis Database - Tabel Diklat

## 📊 Informasi Database

**Koneksi:** `192.168.123.119:1433`  
**Database:** `pdut_dev`  
**Schema:** `pdrd` (BUKAN `sdm`)  
**Tabel:** `diklat`  
**Full Name:** `pdrd.diklat`

---

## 🔍 Struktur Tabel Lengkap (27 Kolom)

| No | Kolom | Tipe Data | Length | Nullable | Keterangan |
|----|-------|-----------|--------|----------|------------|
| 1 | id_diklat | uniqueidentifier | - | NO | PK - UUID Format |
| 2 | id_sp | uniqueidentifier | - | YES | FK Surat Perintah |
| 3 | id_sdm | uniqueidentifier | - | NO | FK SDM (Required) |
| 4 | id_kel_bidang | uniqueidentifier | - | YES | FK Kelompok Bidang |
| 5 | id_katgiat | int | - | NO | FK Kategori Kegiatan |
| 6 | id_jns_diklat | int | - | NO | FK Jenis Diklat |
| 7 | nm_diklat | varchar(160) | 160 | NO | Nama Diklat |
| 8 | penyelenggara | varchar(100) | 100 | YES | Penyelenggara |
| 9 | thn | numeric | - | NO | Tahun (Required) |
| 10 | peran | varchar(30) | 30 | YES | PESERTA/NARASUMBER |
| 11 | tkt | numeric | - | YES | Tingkat (1,2,3) |
| 12 | jml_jam | numeric | - | YES | Jumlah Jam |
| 13 | no_sert | varchar(80) | 80 | YES | Nomor Sertifikat |
| 14 | tgl_sert | date | - | YES | Tanggal Sertifikat |
| 15 | tempat | varchar(20) | 20 | YES | Tempat |
| 16 | tgl_mulai | date | - | YES | Tanggal Mulai |
| 17 | tgl_selesai | date | - | YES | Tanggal Selesai |
| 18 | sk_tugas | varchar(80) | 80 | YES | SK Tugas |
| 19 | tgl_sk_tugas | date | - | YES | Tanggal SK Tugas |
| 20 | a_valid | numeric | - | YES | Status Validasi |
| 21 | tgl_validasi | datetime | - | YES | Tanggal Validasi |
| 22 | create_date | datetime | - | NO | Waktu Dibuat |
| 23 | id_creator | uniqueidentifier | - | NO | User Pembuat |
| 24 | last_update | datetime | - | NO | Waktu Update |
| 25 | id_updater | uniqueidentifier | - | YES | User Pengupdate |
| 26 | soft_delete | numeric | - | NO | 0=Aktif, 1=Deleted |
| 27 | last_sync | datetime | - | NO | Waktu Sync |

---

## ⚠️ PERBEDAAN DENGAN KODE SAAT INI

### 1. Schema Database
```diff
- FROM sdm.diklat           ❌ SALAH
+ FROM pdrd.diklat          ✅ BENAR
```

### 2. Soft Delete Pattern
```diff
- WHERE expired_date IS NULL     ❌ SALAH (kolom tidak ada)
+ WHERE soft_delete = 0          ✅ BENAR
```

### 3. Kolom yang Belum Ada di Entity
- ❌ `id_sp` - Surat Perintah
- ❌ `a_valid` - Status validasi
- ❌ `tgl_validasi` - Tanggal validasi
- ❌ `id_creator` - User pembuat
- ❌ `id_updater` - User pengupdate
- ❌ `soft_delete` - Flag delete (0/1)
- ❌ `last_sync` - Waktu sync

### 4. Tipe Data
- ❌ `thn` adalah `numeric` bukan `string`
- ❌ `tkt` adalah `numeric` bukan `string`
- ❌ `jml_jam` adalah `numeric` bukan `string`
- ❌ `id_sdm`, `id_kel_bidang`, dll adalah `uniqueidentifier` bukan string biasa

---

## 📝 Sample Data dari Database

```
ID: B1148A7F-359F-4B9B-B8F8-0085C0BFB268
SDM: 590D9639-E2D2-4996-AB8B-599EFA91145C
Nama: KURSUS CALON DOSEN KEWIRAAN
Penyelenggara: LEMBAGA PERTAHANAN NASIONAL (LEMHANNAS)
Tahun: 1990
Peran: PESERTA
Tingkat: 3
Jam: 248
Tempat: JAKARTA
Mulai: 1990-02-03
Selesai: 1990-03-10
Soft Delete: 0
```

---

## 🔧 REKOMENDASI PERBAIKAN

### 1. Update Entity (`entity.go`)
- Tambah semua kolom yang missing
- Ubah tipe data sesuai database
- Tambah tag `db` untuk semua field

### 2. Update Repository (`repo.go`)
- Ganti semua `sdm.diklat` → `pdrd.diklat`
- Ganti `expired_date IS NULL` → `soft_delete = 0`
- Update SELECT query sesuai kolom asli
- Update INSERT/UPDATE query

### 3. Update Request DTOs
- Sesuaikan dengan kolom required di database
- Tambah validasi

### 4. Soft Delete Implementation
```sql
-- Delete (Soft)
UPDATE pdrd.diklat 
SET soft_delete = 1, 
    last_update = GETDATE()
WHERE id_diklat = @id

-- Restore
UPDATE pdrd.diklat 
SET soft_delete = 0, 
    last_update = GETDATE()
WHERE id_diklat = @id
```

---

## 🚀 Next Steps

1. ✅ Perbaiki entity.go dengan struktur lengkap
2. ✅ Update repo.go (schema dan soft delete)
3. ✅ Update service.go jika perlu
4. ✅ Test dengan data asli dari database
5. ✅ Update handler dan validation

---

Generated: 2026-01-15
