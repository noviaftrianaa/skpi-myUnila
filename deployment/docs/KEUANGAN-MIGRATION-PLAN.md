# Keuangan — Migration Plan: temp → daftar_ukt & spp_mhs

**Updated:** 2026-03-15  
**Status:** Draft

---

## 📐 Data Source

| Temp Table | Rows | Target Table | Rows Saat Ini |
|---|---|---|---|
| `keuangan.temp_daftar_ukt` | 20,746 | `keuangan.daftar_ukt` | 0 |
| `keuangan.temp_ukt_mhs` | 411,191 | `keuangan.spp_mhs` | 129 (dari SPP sync API) |
| `keuangan.mapping_prodi_simpedam` | 111 | (referensi mapping) | — |

SIMPEDAM WSDL: `https://simpedam.unila.ac.id/ws/live2unila.php?wsdl`  
Akun: `one_data` / `OneData2022` (via SOAP, sudah ada di `apps_pdpt`)

### Hasil Analisis Data

**temp_daftar_ukt (20,746 rows):**
- Tahun: 2012 — 2022 (11 tahun)
- 111 prodi, 8 fakultas
- **100% bisa di-mapping** ke `id_sms` via `mapping_prodi_simpedam` (0 unmapped!)

**temp_ukt_mhs (411,191 rows):**
- Semester: 20141 — 20252 (24 semester)
- 59,610 mahasiswa unique
- **100% match** ke `pdrd.reg_pd` (0 unmatched!)
- **0 duplikat** dengan data `spp_mhs` existing (129 dari API sync)
- Per semester terbesar: 20221 (38,606), 20211 (37,793), 20201 (36,431)
- Status: campuran lunas & belum bayar

---

## 📊 Mapping Kolom

### temp_daftar_ukt → keuangan.daftar_ukt

| temp_daftar_ukt | daftar_ukt | Notes |
|---|---|---|
| `id_ukt` | `id_daftar_ukt` | UUID, primary key |
| `id_prodi` | `id_prodi_simpedam` | UUID prodi SIMPEDAM |
| `nama_prodi` | `nama_prodi` | Nama prodi dari SIMPEDAM |
| `tahun` | `tahun` | Numeric |
| `kode_fak` | `kode_fakultas` | Varchar |
| `fk_fak` | `nama_fakultas` | Varchar |
| `kode_kelas` | `kode_kelas` | Varchar (1,2,3,4,5,6,7,8) |
| `fk_kelas_ukt` | `nama_kelas` | "KELOMPOK I", "KELOMPOK II", dll |
| `nominal` | `nominal` | Numeric — nominal UKT |
| `kode_strata` | `kode_strata` | Numeric (3=D3, 4=S1, 7=non-reg) |
| *(tidak ada)* | `id_sms` | **Perlu mapping** via `mapping_prodi_simpedam` |
| *(tidak ada)* | `id_jenj_didik` | Derive dari `kode_strata` (3→22, 4→30, 7→30) |
| *(generate)* | `create_date` | `GETDATE()` |
| *(system)* | `id_creator` | `00000000-0000-0000-0000-000000000001` |
| *(generate)* | `last_update` | `GETDATE()` |
| *(null)* | `id_updater` | NULL |
| *(0)* | `soft_delete` | 0 |
| *(generate)* | `last_sync` | `GETDATE()` |

### temp_ukt_mhs → keuangan.spp_mhs

| temp_ukt_mhs | spp_mhs | Notes |
|---|---|---|
| *(generate)* | `id_spp_mhs` | UUID SHA1 dari `id_reg_pd` + `id_smt` |
| *(null)* | `id_kelas_ukt` | Lookup dari `kelas_ukt` via `fk_kode_kelas_ukt` |
| `id_smt` | `id_smt` | "20252" format |
| *(lookup)* | `id_daftar_ukt` | Lookup via `id_ukt` di temp → `id_daftar_ukt` di daftar_ukt |
| `id_reg_pd` | `id_reg_pd` | UUID — **harus match pdrd.reg_pd** |
| *(now)* | `tgl_bayar` | `GETDATE()` |
| `nominal_ukt_spp` | `nominal` | Decimal |
| `fk_nama_semester` | `nm_smt` | Nvarchar |
| `total_tagihan` | `total_tagihan` | Decimal |
| `jumlah_spi` | `jumlah_spi` | Decimal |
| `jumlah_denda` | `jumlah_denda` | Decimal |
| `jumlah_lainnya` | `jumlah_lainnya` | Decimal |
| *(calculate)* | `sisa_tagihan` | `total_tagihan - nominal_ukt_spp` |
| *(0)* | `a_cicil` | 0 |
| *(0)* | `cicilan_ke` | 0 |
| *(null)* | `kode_pembayaran` | NULL |
| *(null)* | `nomor_pin` | NULL |
| *(null)* | `kode_akses` | NULL |
| *(null)* | `bill_ref` | NULL |
| `flag_bayar`/`fk_flag_bayar` | `flag_by` | "LUNAS" jika bayar, "BELUM" jika belum |
| *(null)* | `ket` | NULL |
| *(generate)* | `create_date` | `GETDATE()` |
| *(system)* | `id_creator` | `00000000-0000-0000-0000-000000000001` |
| *(generate)* | `last_update` | `GETDATE()` |
| *(null)* | `id_updater` | NULL |
| *(0)* | `soft_delete` | 0 |
| *(generate)* | `last_sync` | `GETDATE()` |

---

## 🔧 SQL Script — Step 1: temp_daftar_ukt → keuangan.daftar_ukt

```sql
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

-- Insert dari temp_daftar_ukt → daftar_ukt
-- dengan mapping id_sms dari mapping_prodi_simpedam
INSERT INTO keuangan.daftar_ukt (
    id_daftar_ukt, id_prodi_simpedam, nama_prodi, tahun,
    kode_fakultas, nama_fakultas, kode_kelas, nama_kelas,
    nominal, kode_strata, id_sms, id_jenj_didik,
    create_date, id_creator, last_update, id_updater, soft_delete, last_sync
)
SELECT
    t.id_ukt,                              -- id_daftar_ukt
    t.id_prodi,                            -- id_prodi_simpedam
    t.nama_prodi,                          -- nama_prodi
    t.tahun,                               -- tahun
    t.kode_fak,                            -- kode_fakultas
    t.fk_fak,                              -- nama_fakultas
    t.kode_kelas,                          -- kode_kelas
    t.fk_kelas_ukt,                        -- nama_kelas
    t.nominal,                             -- nominal
    CAST(t.kode_strata AS NUMERIC),        -- kode_strata
    m.id_sms,                              -- id_sms (from mapping)
    CASE
        WHEN CAST(t.kode_strata AS INT) = 3 THEN 22    -- D3
        WHEN CAST(t.kode_strata AS INT) IN (4, 7) THEN 30  -- S1/Non-reg
        ELSE NULL
    END,                                   -- id_jenj_didik
    GETDATE(),                             -- create_date
    '00000000-0000-0000-0000-000000000001',-- id_creator
    GETDATE(),                             -- last_update
    NULL,                                  -- id_updater
    0,                                     -- soft_delete
    GETDATE()                              -- last_sync
FROM keuangan.temp_daftar_ukt t
LEFT JOIN keuangan.mapping_prodi_simpedam m
    ON m.id_prodi_simpedam = t.id_prodi
    AND m.kode_strata = CAST(t.kode_strata AS INT)
    AND m.soft_delete = 0
WHERE t.id_ukt NOT IN (
    SELECT id_daftar_ukt FROM keuangan.daftar_ukt
)
AND t.flag_non_aktif = 0;  -- hanya yang aktif
```

---

## 🔧 SQL Script — Step 2: temp_ukt_mhs → keuangan.spp_mhs

```sql
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

-- Insert dari temp_ukt_mhs → spp_mhs
-- Hanya record yang punya id_reg_pd valid di pdrd.reg_pd
INSERT INTO keuangan.spp_mhs (
    id_spp_mhs, id_kelas_ukt, id_smt, id_daftar_ukt, id_reg_pd,
    tgl_bayar, nominal, nm_smt, total_tagihan,
    jumlah_spi, jumlah_denda, jumlah_lainnya, sisa_tagihan,
    a_cicil, cicilan_ke, kode_pembayaran, flag_by,
    create_date, id_creator, last_update, id_updater, soft_delete, last_sync
)
SELECT
    NEWID(),                                    -- id_spp_mhs
    NULL,                                       -- id_kelas_ukt (TODO: lookup)
    t.id_smt,                                   -- id_smt
    d.id_daftar_ukt,                            -- id_daftar_ukt (from daftar_ukt via id_ukt)
    t.id_reg_pd,                                -- id_reg_pd
    GETDATE(),                                  -- tgl_bayar
    ISNULL(t.nominal_ukt_spp, 0),               -- nominal
    t.fk_nama_semester,                         -- nm_smt
    ISNULL(t.total_tagihan, 0),                 -- total_tagihan
    ISNULL(t.jumlah_spi, 0),                    -- jumlah_spi
    ISNULL(t.jumlah_denda, 0),                  -- jumlah_denda
    ISNULL(t.jumlah_lainnya, 0),                -- jumlah_lainnya
    ISNULL(t.total_tagihan, 0) - ISNULL(t.nominal_ukt_spp, 0),  -- sisa_tagihan
    0,                                          -- a_cicil
    0,                                          -- cicilan_ke
    'SIMPEDAM-TEMP',                            -- kode_pembayaran (marking dari temp)
    CASE WHEN t.flag_bayar = '1' THEN 'LUNAS' ELSE 'BELUM' END,  -- flag_by
    GETDATE(),                                  -- create_date
    '00000000-0000-0000-0000-000000000001',     -- id_creator
    GETDATE(),                                  -- last_update
    NULL,                                       -- id_updater
    0,                                          -- soft_delete
    GETDATE()                                   -- last_sync
FROM keuangan.temp_ukt_mhs t
-- Join ke daftar_ukt untuk dapat id_daftar_ukt
LEFT JOIN keuangan.daftar_ukt d ON d.id_daftar_ukt = t.id_ukt
-- Pastikan id_reg_pd valid
INNER JOIN pdrd.reg_pd rp ON rp.id_reg_pd = t.id_reg_pd
-- Cegah duplikat
WHERE NOT EXISTS (
    SELECT 1 FROM keuangan.spp_mhs s
    WHERE s.id_reg_pd = t.id_reg_pd AND s.id_smt = t.id_smt
);
```

---

## 🔧 SQL Script — Step 3: Auto-mapping id_sms yang belum ter-mapping

```sql
-- Jalankan setelah Step 1 — update daftar_ukt yang id_sms masih NULL
-- berdasarkan fuzzy matching nama prodi
UPDATE d
SET d.id_sms = bm.id_sms,
    d.id_jenj_didik = CASE
        WHEN d.kode_strata = 3 THEN 22
        WHEN d.kode_strata IN (4, 7) THEN 30
        ELSE bm.id_jenj_didik
    END,
    d.last_update = GETDATE()
FROM keuangan.daftar_ukt d
INNER JOIN (
    SELECT
        d2.id_prodi_simpedam,
        d2.kode_strata,
        sms.id_sms,
        sms.id_jenj_didik,
        ROW_NUMBER() OVER (
            PARTITION BY d2.id_prodi_simpedam, d2.kode_strata
            ORDER BY
                CASE
                    WHEN UPPER(d2.nama_prodi) = UPPER(sms.nm_lemb) THEN 100
                    WHEN UPPER(sms.nm_lemb) LIKE '%' + UPPER(d2.nama_prodi) + '%' THEN 90
                    WHEN UPPER(d2.nama_prodi) LIKE '%' + UPPER(sms.nm_lemb) + '%' THEN 90
                    WHEN UPPER(LEFT(d2.nama_prodi, 15)) = UPPER(LEFT(sms.nm_lemb, 15)) THEN 80
                    ELSE 0
                END DESC
        ) as rn
    FROM keuangan.daftar_ukt d2
    CROSS JOIN pdrd.sms sms
    WHERE d2.id_sms IS NULL
      AND d2.soft_delete = 0
      AND sms.soft_delete = 0
      AND sms.stat_prodi = 'A'
) bm ON bm.id_prodi_simpedam = d.id_prodi_simpedam
    AND bm.kode_strata = d.kode_strata
    AND bm.rn = 1
WHERE d.id_sms IS NULL AND d.soft_delete = 0;
```

---

## ✅ Urutan Eksekusi

1. **Step 1** — `temp_daftar_ukt → daftar_ukt` (20,746 rows + mapping via `mapping_prodi_simpedam`)
2. **Step 3** — Auto-mapping `id_sms` untuk yang belum ter-mapping
3. **Step 2** — `temp_ukt_mhs → spp_mhs` (411,191 rows, hanya yang match `reg_pd`)
4. **Verifikasi** — Cek count, cek API response, cek frontend

---

## ⚠️ Catatan Penting

1. **BACKUP dulu** sebelum jalankan script:
   ```sql
   SELECT * INTO keuangan.daftar_ukt_backup FROM keuangan.daftar_ukt
   SELECT * INTO keuangan.spp_mhs_backup FROM keuangan.spp_mhs
   ```
2. Step 2 (spp_mhs) cek `INNER JOIN pdrd.reg_pd` — hanya insert yang punya mahasiswa valid
3. `kode_pembayaran = 'SIMPEDAM-TEMP'` sebagai marker bahwa data dari temp (bisa dibedakan dari sync API)
4. Jangan jalankan Step 2 sebelum Step 1 selesai — `id_daftar_ukt` reference ke `daftar_ukt`

---

*Plan dibuat berdasarkan analisis UKTMhsSeeder.php dan struktur temp tables yang ada.*
