-- ============================================================
-- UPDATE tahapan PM-ALIH: tambah tahap Persetujuan Pejabat
-- Sesuaikan dengan PM-CUTI/PM-UNDUR (konsisten 6 tahap)
-- Date: 2026-05-12
-- ============================================================
-- Workflow baru PM-ALIH:
--   1. Mahasiswa            draft → diajukan
--   2. Fakultas Asal        diajukan → diverifikasi          (skip untuk a_dari_luar)
--   3. Fakultas Tujuan      diverifikasi → diperiksa_fakultas (NEW STATUS)
--   4. Admin BAK Verifikasi diperiksa_fakultas → menunggu_persetujuan
--   5. Pejabat              menunggu_persetujuan → disetujui (NEW TAHAP)
--   6. Admin BAK Terbit     disetujui → terbit
-- Status baru: diperiksa_fakultas (antara fakultas tujuan dan BAK verifikasi).

DO $$
DECLARE
    v_id_jenis UUID;
BEGIN
    SELECT id_jenis_layanan INTO v_id_jenis FROM ref.jenis_layanan WHERE kode_layanan = 'PM-ALIH';
    IF v_id_jenis IS NULL THEN
        RAISE EXCEPTION 'Jenis layanan PM-ALIH tidak ditemukan';
    END IF;

    -- Hapus tahap lama (4, 5)
    DELETE FROM ref.tahapan_layanan
    WHERE id_jenis_layanan = v_id_jenis
      AND urutan IN (4, 5);

    -- Ubah tahap 3: status_selesai jadi 'diperiksa_fakultas'
    UPDATE ref.tahapan_layanan
    SET status_selesai = 'diperiksa_fakultas',
        nm_tahapan = 'Verifikasi & Penerimaan Fakultas Tujuan'
    WHERE id_jenis_layanan = v_id_jenis
      AND urutan = 3;

    -- Insert tahap 4: BAK Verifikasi
    INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi)
    VALUES (v_id_jenis, 4, 'Verifikasi Admin BAK', 'admin_bak', 'diperiksa_fakultas', 'menunggu_persetujuan', false,
            'Admin BAK memverifikasi kelengkapan dokumen dan SK Dekan dari fakultas tujuan');

    -- Insert tahap 5: Persetujuan Pejabat
    INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi)
    VALUES (v_id_jenis, 5, 'Persetujuan Pejabat', 'pejabat', 'menunggu_persetujuan', 'disetujui', false,
            'Pejabat (Kabag) memberikan persetujuan atas alih program');

    -- Insert tahap 6: Penerbitan SK Rektor
    INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi)
    VALUES (v_id_jenis, 6, 'Penerbitan SK Rektor / Surat Penolakan', 'admin_bak', 'disetujui', 'terbit', false,
            'Admin BAK menerbitkan SK Rektor (diterima) atau surat penolakan');
END $$;
