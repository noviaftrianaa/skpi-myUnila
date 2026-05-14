-- ============================================================
-- UPDATE tahapan: tambah tahap Persetujuan Kabag untuk surat mandiri (SK-*)
-- Date: 2026-05-13
-- ============================================================
-- Workflow lama SK-* (3 tahap): Mahasiswa -> BAK Verifikasi -> BAK Terbit
-- Workflow baru SK-* (4 tahap): Mahasiswa -> BAK Verifikasi -> Kabag Persetujuan -> BAK Terbit
--
-- Berlaku untuk: SK-HERREG, SK-KTM, SK-LOA, SK-PKKMB
-- Role kode_role baru: 'kabag' (mapped dari nm_peran 'Kepala Bagian/Koordinator/PJ', id_peran 4006)

DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN
        SELECT id_jenis_layanan, kode_layanan
        FROM ref.jenis_layanan
        WHERE kode_layanan IN ('SK-HERREG', 'SK-KTM', 'SK-LOA', 'SK-PKKMB')
    LOOP
        -- Hapus tahap lama (urutan 3: Penerbitan Surat: diverifikasi -> terbit)
        DELETE FROM ref.tahapan_layanan
        WHERE id_jenis_layanan = rec.id_jenis_layanan
          AND urutan = 3;

        -- Update tahap 2: status_selesai dari 'diverifikasi' jadi 'menunggu_persetujuan'
        UPDATE ref.tahapan_layanan
        SET status_selesai = 'menunggu_persetujuan',
            nm_tahapan = 'Verifikasi Admin BAK'
        WHERE id_jenis_layanan = rec.id_jenis_layanan
          AND urutan = 2;

        -- Insert tahap 3: Persetujuan Kabag
        INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi)
        VALUES (rec.id_jenis_layanan, 3, 'Persetujuan Pimpinan', 'kabag', 'menunggu_persetujuan', 'disetujui', false,
                'Kepala Bagian/Koordinator/PJ memberikan persetujuan atas surat sebelum diterbitkan');

        -- Insert tahap 4: Penerbitan Surat
        INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi)
        VALUES (rec.id_jenis_layanan, 4, 'Penerbitan Surat', 'admin_bak', 'disetujui', 'terbit', false,
                'Admin BAK menerbitkan surat setelah disetujui pimpinan');

        RAISE NOTICE 'Updated tahapan for %', rec.kode_layanan;
    END LOOP;
END $$;

-- Migrasi data: pengajuan SK-* yang status 'diverifikasi' di-bump ke 'menunggu_persetujuan'
UPDATE layanan.pengajuan
SET status = 'menunggu_persetujuan',
    updated_at = NOW()
WHERE id_jenis_layanan IN (
    SELECT id_jenis_layanan FROM ref.jenis_layanan
    WHERE kode_layanan IN ('SK-HERREG', 'SK-KTM', 'SK-LOA', 'SK-PKKMB')
)
AND status = 'diverifikasi'
AND soft_delete = false;
