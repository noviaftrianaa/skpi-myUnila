-- ============================================================
-- ADD: Ketentuan akademik dinamis per jenis layanan
-- Date: 2026-05-12
-- ============================================================
-- Tabel ref.ketentuan_layanan menampung semua kriteria akademik:
--   - Evaluasi Studi (BA-HMM, BA-PUTUS): kriteria tarik kandidat
--   - Permohonan Akademik (PM-ALIH): syarat akademik pemohon
-- Sebelumnya kriteria di-hardcode di PdutRepository & PengajuanController.

CREATE TABLE IF NOT EXISTS ref.ketentuan_layanan (
    id_ketentuan      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_layanan  UUID NOT NULL REFERENCES ref.jenis_layanan(id_jenis_layanan),
    nm_jenjang        VARCHAR(50)  NULL,
    kondisi_semester  INTEGER      NULL,
    kode_ketentuan    VARCHAR(50)  NOT NULL,
    nm_ketentuan      VARCHAR(200) NOT NULL,
    operator          VARCHAR(10)  NOT NULL,
    nilai             NUMERIC(10, 2) NOT NULL,
    pesan_gagal       TEXT         NULL,
    deskripsi         TEXT         NULL,
    a_aktif           BOOLEAN      DEFAULT true,
    urutan            INTEGER      DEFAULT 1,
    created_at        TIMESTAMP    DEFAULT NOW(),
    updated_at        TIMESTAMP    DEFAULT NOW()
);

COMMENT ON TABLE ref.ketentuan_layanan IS 'Ketentuan/kriteria akademik dinamis per jenis layanan (HMM, Putus Studi, PM-ALIH, dll)';
COMMENT ON COLUMN ref.ketentuan_layanan.nm_jenjang IS 'Filter jenjang (D3/S1/S2/S3) atau NULL = semua';
COMMENT ON COLUMN ref.ketentuan_layanan.kondisi_semester IS 'Gate semester (mis. 4 atau 8 untuk Putus Studi)';
COMMENT ON COLUMN ref.ketentuan_layanan.kode_ketentuan IS 'masa_studi_min, ipk_min, sks_min, semester_max, dll';
COMMENT ON COLUMN ref.ketentuan_layanan.operator IS '<, >, <=, >=, =, !=';

CREATE INDEX IF NOT EXISTS idx_ketentuan_jenis ON ref.ketentuan_layanan (id_jenis_layanan, a_aktif);

-- Seed: BA-HMM (Habis Masa Mukim) — masa studi minimum per jenjang
INSERT INTO ref.ketentuan_layanan (id_jenis_layanan, nm_jenjang, kode_ketentuan, nm_ketentuan, operator, nilai, deskripsi, urutan)
SELECT id_jenis_layanan, 'D3', 'masa_studi_min', 'Masa Studi Minimum', '>=', 13, 'Mahasiswa D3 dengan masa studi >= 13 semester', 1 FROM ref.jenis_layanan WHERE kode_layanan = 'BA-HMM'
UNION ALL
SELECT id_jenis_layanan, 'S1', 'masa_studi_min', 'Masa Studi Minimum', '>=', 17, 'Mahasiswa S1 dengan masa studi >= 17 semester', 2 FROM ref.jenis_layanan WHERE kode_layanan = 'BA-HMM'
UNION ALL
SELECT id_jenis_layanan, 'S2', 'masa_studi_min', 'Masa Studi Minimum', '>=', 9, 'Mahasiswa S2 dengan masa studi >= 9 semester', 3 FROM ref.jenis_layanan WHERE kode_layanan = 'BA-HMM'
UNION ALL
SELECT id_jenis_layanan, 'S3', 'masa_studi_min', 'Masa Studi Minimum', '>=', 13, 'Mahasiswa S3 dengan masa studi >= 13 semester', 4 FROM ref.jenis_layanan WHERE kode_layanan = 'BA-HMM';

-- Seed: BA-PUTUS (Putus Studi) — per gate semester
INSERT INTO ref.ketentuan_layanan (id_jenis_layanan, nm_jenjang, kondisi_semester, kode_ketentuan, nm_ketentuan, operator, nilai, deskripsi, urutan)
SELECT id_jenis_layanan, 'S1', 4, 'ipk_min', 'IPK Minimum', '<', 2.00, 'Pada semester 4: IPK < 2.00 (jenjang S1/D4)', 1 FROM ref.jenis_layanan WHERE kode_layanan = 'BA-PUTUS'
UNION ALL
SELECT id_jenis_layanan, 'S1', 4, 'sks_min', 'SKS Lulus Minimum', '<', 40, 'Pada semester 4: SKS < 40 (jenjang S1/D4)', 2 FROM ref.jenis_layanan WHERE kode_layanan = 'BA-PUTUS'
UNION ALL
SELECT id_jenis_layanan, 'S1', 8, 'ipk_min', 'IPK Minimum', '<', 2.00, 'Pada semester 8: IPK < 2.00 (jenjang S1/D4)', 3 FROM ref.jenis_layanan WHERE kode_layanan = 'BA-PUTUS'
UNION ALL
SELECT id_jenis_layanan, 'S1', 8, 'sks_min', 'SKS Lulus Minimum', '<', 80, 'Pada semester 8: SKS < 80 (jenjang S1/D4)', 4 FROM ref.jenis_layanan WHERE kode_layanan = 'BA-PUTUS';

-- Seed: PM-ALIH (Alih Program) — syarat akademik per jenjang
INSERT INTO ref.ketentuan_layanan (id_jenis_layanan, nm_jenjang, kode_ketentuan, nm_ketentuan, operator, nilai, deskripsi, urutan)
SELECT id_jenis_layanan, 'D3', 'ipk_min', 'IPK Minimum', '>=', 2.50, 'Syarat alih program jenjang D3', 1 FROM ref.jenis_layanan WHERE kode_layanan = 'PM-ALIH'
UNION ALL
SELECT id_jenis_layanan, 'D3', 'sks_min', 'SKS Lulus Minimum', '>=', 36, 'Syarat alih program jenjang D3', 2 FROM ref.jenis_layanan WHERE kode_layanan = 'PM-ALIH'
UNION ALL
SELECT id_jenis_layanan, 'D3', 'semester_max', 'Semester Maksimum', '<=', 5, 'Syarat alih program jenjang D3', 3 FROM ref.jenis_layanan WHERE kode_layanan = 'PM-ALIH'
UNION ALL
SELECT id_jenis_layanan, 'S1', 'ipk_min', 'IPK Minimum', '>=', 2.75, 'Syarat alih program jenjang S1', 4 FROM ref.jenis_layanan WHERE kode_layanan = 'PM-ALIH'
UNION ALL
SELECT id_jenis_layanan, 'S1', 'sks_min', 'SKS Lulus Minimum', '>=', 40, 'Syarat alih program jenjang S1', 5 FROM ref.jenis_layanan WHERE kode_layanan = 'PM-ALIH'
UNION ALL
SELECT id_jenis_layanan, 'S1', 'semester_max', 'Semester Maksimum', '<=', 5, 'Syarat alih program jenjang S1', 6 FROM ref.jenis_layanan WHERE kode_layanan = 'PM-ALIH';
