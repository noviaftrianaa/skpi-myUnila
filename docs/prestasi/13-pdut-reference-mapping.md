# PDUT Reference Mapping

Tabel lengkap mapping **SI-Prestasi (PostgreSQL) ↔ SIMKATMAWA payload ↔ pdut SQL Server**. Dipakai saat implement `PdutRepository`, seeder referensi, dan (opsional) proses backfill `pdrd.prestasi`.

---

## 1. Level prestasi

### Mapping 3-arah

| kode_simkatmawa | nm_level | pdut.ref.tingkat_prestasi (id) | pdut nm_tkt_prestasi |
|---|---|---|---|
| KAB | Kabupaten/Kota | 3 | Kab/kota |
| PROV | Provinsi | 4 | Propinsi |
| NAS | Nasional | 5 | Nasional |
| INT | Internasional | 6 | Internasional |
| — | (tidak ada di SIMKATMAWA) | 1 | Sekolah |
| — | (tidak ada di SIMKATMAWA) | 2 | Kecamatan |
| — | (tidak ada di SIMKATMAWA) | 7 | Regional |
| — | (tidak ada di SIMKATMAWA) | 9 | Lainnya |

### Aturan saat import / transform

- Seed `ref.level_prestasi` dengan 4 baris SIMKATMAWA + kolom `id_tkt_prestasi_pdut` terisi 3/4/5/6.
- Saat backfill `pdrd.prestasi`: baris dengan `id_tkt_prestasi IN (1,2,7,9)` **skip** dengan alasan "level tidak valid di SIMKATMAWA".
- Saat form entry di SI-Prestasi UI: dropdown hanya 4 opsi (KAB/PROV/NAS/INT). Ops tidak bisa pilih Sekolah dll.

---

## 2. Kategori prestasi

### Mapping 3-arah

| kode_simkatmawa | nm_kategori | pdut.ref.jenis_prestasi (id) | pdut nm_jenis_prestasi | Confidence |
|---|---|---|---|---|
| RISNOV | Riset dan Inovasi STEM | 1 | Sains | Medium (Sains ≈ RISNOV/RISNOVSSH) |
| RISNOVSSH | Riset dan Inovasi SSH (Sosial, Seni, Humaniora) | 1 | Sains | Medium (collision dengan RISNOV) |
| SENBUD | Seni dan Budaya | 2 | Seni | High |
| OLAHRAGA | Olahraga | 3 | Olahraga | High |
| MINAT | Minat Khusus | 9 | Lain-lain | Low (fallback) |

**Catatan penting:** pdut punya **4 kategori** sedangkan SIMKATMAWA punya **5 kategori**. Kolisi di jenis 1 (Sains) → RISNOV & RISNOVSSH dua-duanya map ke sana. Saat backfill, ops harus clarify manual per record.

### Aturan seed

Seed `ref.kategori_prestasi`:
```
RISNOV    → id_jenis_prestasi_pdut = 1
RISNOVSSH → id_jenis_prestasi_pdut = 1  (collision flag)
SENBUD    → id_jenis_prestasi_pdut = 2
OLAHRAGA  → id_jenis_prestasi_pdut = 3
MINAT     → id_jenis_prestasi_pdut = 9
```

### Aturan backfill

```sql
-- Baris pdut → kategori SI-Prestasi
CASE pdut.pdrd.prestasi.id_jenis_prestasi
  WHEN 1 THEN 'RISNOV'           -- default; ops perlu re-classify RISNOVSSH manual
  WHEN 2 THEN 'SENBUD'
  WHEN 3 THEN 'OLAHRAGA'
  WHEN 9 THEN 'MINAT'
  ELSE 'MINAT'                   -- fallback untuk nilai tidak terduga
END
```

Setelah import, UI harus highlight record dengan `id_kategori_prestasi=RISNOV` yang originalnya dari jenis=1 supaya ops review apakah sebaiknya RISNOVSSH.

---

## 3. Peringkat

### Mapping 3-arah (butuh konfirmasi numeric code pdut)

Di pdut `pdrd.prestasi.peringkat` bertipe `numeric(1)`, artinya 0..9. Dokumentasi PDDIKTI lama biasa pakai:

| peringkat pdut (asumsi) | kode_simkatmawa | nm_peringkat |
|---|---|---|
| 1 | JUARA1 | Juara 1 |
| 2 | JUARA2 | Juara 2 |
| 3 | JUARA3 | Juara 3 |
| 4 | HARAPAN1 | Harapan 1 |
| 5 | HARAPAN2 | Harapan 2 |
| 6 | HARAPAN3 | Harapan 3 |
| 7 | APRESIASI | Apresiasi |
| 8 | PESERTA | Peserta |
| 9 | — | Lain (skip) |

**Perlu verifikasi:** query sample `SELECT peringkat, COUNT(*) FROM pdut.pdrd.prestasi GROUP BY peringkat` untuk lihat distribusi nilai aktual. Kalau ada numeric lain (0, 9, NULL), ops perlu tentukan policy.

### Aturan

- Seed `ref.peringkat` dengan 8 baris + kolom `peringkat_pdut` terisi 1-8 (mapping asumsi di atas).
- Saat backfill: `peringkat=9` atau NULL → flag + set default 'PESERTA' + isi catatan.

---

## 4. Field TANPA ekuivalen di pdut

Field SIMKATMAWA yang tidak ada di `pdrd.prestasi` sama sekali — harus diisi manual saat backfill (atau saat entry baru):

| SIMKATMAWA field | Default saat backfill | Kenapa tidak bisa auto |
|---|---|---|
| `cabang` | NULL → ops isi | Tidak ada kolom cabang di pdrd |
| `jumlah_unit_peserta` | 1 | Feeder tidak track |
| `kelompok_prestasi` | INDIVIDU | Feeder single-student, asumsikan individu (kecuali ops tahu sebaliknya) |
| `bentuk` | LURING | Feeder lama biasanya off-line |
| `url_peserta`, `url_sertifikat`, `url_foto_upp`, `url_dokumen_undangan` | NULL | Tidak ada dokumen digital di feeder — ops upload manual kalau ada arsip |
| `tgl_sertifikat` | `DATE(thn_prestasi || '-12-31')` | Feeder cuma simpan tahun |
| `keterangan` | "Imported from PDDIKTI feeder" | audit trail |
| `dosen[]` | empty array | Feeder tidak track dosen pembimbing |

---

## 5. PDUT queries yang akan dipakai `PdutRepository`

### a. Lookup mahasiswa by NIM (aktif + lulus)

```sql
SELECT
  pd.id_pd,
  pd.nim,
  pd.nm_pd,
  rp.id_sms,
  sms.nm_lemb AS nm_prodi,
  uo.id_unit AS id_fakultas,
  uo.nm_unit AS nm_fakultas,
  sm.nm_stat_mhs
FROM siakadu.peserta_didik pd
LEFT JOIN siakadu.reg_pd rp ON rp.id_pd = pd.id_pd
LEFT JOIN pdrd.sms ON sms.id_sms = rp.id_sms
LEFT JOIN man_akses.unit_organisasi uo ON uo.id_unit = sms.id_unit_induk_1
LEFT JOIN siakadu.status_mahasiswa sm ON sm.id_stat_mhs = pd.id_stat_mhs
WHERE pd.nim = ?
```

### b. Lookup dosen by NUPTK / NIDN

```sql
SELECT id_sdm, nuptk, nidn, nm_sdm, nip, id_ikatan_kerja
FROM ref.sdm
WHERE (nuptk = ? OR nidn = ?)
  AND id_ikatan_kerja IN (...)  -- dosen only, perlu confirm kode
```

### c. Backfill source

```sql
SELECT
  p.id_prestasi, p.id_jenis_prestasi, p.id_tkt_prestasi,
  p.nm_prestasi, p.thn_prestasi, p.penyelenggara, p.peringkat,
  p.id_pd, p.id_sp, p.create_date, p.last_update, p.soft_delete
FROM pdrd.prestasi p
WHERE p.soft_delete = 0
  AND p.id_tkt_prestasi IN (3, 4, 5, 6)   -- skip level tidak valid
ORDER BY p.thn_prestasi DESC, p.create_date DESC
```

### d. Referensi fakultas

```sql
SELECT id_unit, nm_unit, kd_unit
FROM man_akses.unit_organisasi
WHERE kd_unit LIKE 'FK%' OR kd_unit LIKE 'FMIPA%' OR kd_unit IN (...)  -- sesuaikan
  AND a_aktif = 1
```

---

## 6. Ringkasan kolom `_pdut` di si_prestasi schema

Kolom yang berakhiran `_pdut` = kolom foreign-reference ke SQL Server (tanpa FK fisik):

| Tabel | Kolom | Referensi pdut |
|---|---|---|
| `ref.level_prestasi` | `id_tkt_prestasi_pdut` | `pdut.ref.tingkat_prestasi.id_tkt_prestasi` |
| `ref.kategori_prestasi` | `id_jenis_prestasi_pdut` | `pdut.ref.jenis_prestasi.id_jenis_prestasi` |
| `ref.peringkat` | `peringkat_pdut` | `pdut.pdrd.prestasi.peringkat` |
| `prestasi.prestasi_mandiri` | `id_prestasi_pdut` | `pdut.pdrd.prestasi.id_prestasi` (traceback) |
| `prestasi.peserta_mhs` | `id_reg_pd_pdut` | `pdut.pdrd.reg_pd.id_reg_pd` — id_pd derivable via `reg_pd.id_pd` FK |
| `prestasi.peserta_mhs` | `id_sms_pdut` | `pdut.pdrd.sms.id_sms` — fakultas derivable via self-ref sms hierarchy |
| `prestasi.peserta_dosen` | `id_sdm_pdut` | `pdut.ref.sdm.id_sdm` |

**Catatan minimalis:** `id_pd_pdut`, `id_fakultas_pdut`, `nm_fakultas` TIDAK disimpan — semua derivable dari kombinasi (`nim`, `id_reg_pd_pdut`, `id_sms_pdut`) plus pdut hierarchy.

---

## 7. Verifikasi data quality pdut (saran dijalankan sebelum backfill)

Query untuk ops cek sebelum commit backfill policy:

```sql
-- Distribusi jenis_prestasi
SELECT p.id_jenis_prestasi, r.nm_jenis_prestasi, COUNT(*) AS jumlah
FROM pdrd.prestasi p
LEFT JOIN ref.jenis_prestasi r ON r.id_jenis_prestasi = p.id_jenis_prestasi
WHERE p.soft_delete = 0
GROUP BY p.id_jenis_prestasi, r.nm_jenis_prestasi
ORDER BY jumlah DESC;

-- Distribusi tingkat
SELECT p.id_tkt_prestasi, t.nm_tkt_prestasi, COUNT(*) AS jumlah
FROM pdrd.prestasi p
LEFT JOIN ref.tingkat_prestasi t ON t.id_tkt_prestasi = p.id_tkt_prestasi
WHERE p.soft_delete = 0
GROUP BY p.id_tkt_prestasi, t.nm_tkt_prestasi
ORDER BY jumlah DESC;

-- Distribusi peringkat numeric
SELECT peringkat, COUNT(*) AS jumlah
FROM pdrd.prestasi
WHERE soft_delete = 0
GROUP BY peringkat
ORDER BY peringkat;

-- Orphan (id_pd tidak ditemukan)
SELECT COUNT(*) AS orphan_count
FROM pdrd.prestasi p
LEFT JOIN siakadu.peserta_didik pd ON pd.id_pd = p.id_pd
WHERE p.soft_delete = 0 AND pd.id_pd IS NULL;

-- Invalid level
SELECT COUNT(*) AS invalid_level_count
FROM pdrd.prestasi
WHERE soft_delete = 0 AND id_tkt_prestasi NOT IN (3, 4, 5, 6);
```

Saat implementasi, Artisan command `php artisan siprestasi:import-pdut --dry-run` harus pertama kali menjalankan query ini dan print summary sebelum ops konfirmasi actual import.
