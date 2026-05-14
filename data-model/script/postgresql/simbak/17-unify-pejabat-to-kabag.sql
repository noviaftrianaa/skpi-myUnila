-- ============================================================
-- UNIFY role 'pejabat' jadi 'kabag' untuk semua tahapan persetujuan
-- Date: 2026-05-13
-- ============================================================
-- User mengkonfirmasi: persetujuan pimpinan untuk semua layanan
-- menggunakan role yang sama yaitu Kepala Bagian/Koordinator/PJ (id_peran 4006 di PDUT).
-- Sebelumnya: PM-* pakai kode_role 'pejabat', SK-* pakai 'kabag' (commit terakhir).
-- Sekarang: semua persetujuan pakai 'kabag' agar konsisten dengan ID role di PDUT.

-- 1. Update kode_role di tahapan_layanan
UPDATE ref.tahapan_layanan
SET kode_role = 'kabag',
    nm_tahapan = 'Persetujuan Pimpinan'
WHERE kode_role = 'pejabat';

-- 2. Update riwayat_pengajuan: kode_role_aktor 'pejabat' -> 'kabag' (untuk konsistensi audit log)
UPDATE layanan.riwayat_pengajuan
SET kode_role_aktor = 'kabag'
WHERE kode_role_aktor = 'pejabat';

-- 3. Update persetujuan_pengajuan: kode_role_approver
UPDATE layanan.persetujuan_pengajuan
SET kode_role_approver = 'kabag'
WHERE kode_role_approver = 'pejabat';
