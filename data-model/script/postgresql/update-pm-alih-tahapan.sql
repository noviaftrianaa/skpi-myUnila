-- =====================================================
-- Update PM-ALIH Tahapan: 6 tahapan → 5 tahapan
-- Tahap 5 (Persetujuan Pejabat) dihilangkan
-- Tahap 4 status_selesai diubah dari diverifikasi → disetujui
-- Tanggal: 9 April 2026
-- =====================================================

-- Soft delete semua tahapan PM-ALIH lama
UPDATE ref.tahapan_layanan
SET soft_delete = true
WHERE id_jenis_layanan = (SELECT id_jenis_layanan FROM ref.jenis_layanan WHERE kode_layanan = 'PM-ALIH')
  AND soft_delete = false;

-- Insert tahapan PM-ALIH baru (5 tahapan)
INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi)
SELECT id_jenis_layanan, v.urutan, v.nm, v.role, v.masuk, v.selesai, false, v.desk
FROM ref.jenis_layanan, (VALUES
  (1, 'Pengajuan oleh Mahasiswa',           'mahasiswa',       'draft',                  'diajukan',              'Mahasiswa mengisi formulir, upload dokumen, dan submit pengajuan'),
  (2, 'Verifikasi Admin Fakultas Asal',      'admin_fakultas',  'diajukan',               'diverifikasi',          'Verifikasi dokumen, upload surat pengantar Dekan ke SIMBAK, kirim via SAP ke WR1'),
  (3, 'Proses Penerimaan Fakultas Tujuan',   'admin_fakultas',  'diverifikasi',           'menunggu_persetujuan',  'Wawancara, keputusan diterima/ditolak, upload konversi SKS dan surat balasan'),
  (4, 'Verifikasi Akhir Admin BAK',          'admin_bak',       'menunggu_persetujuan',   'disetujui',             'Verifikasi semua dokumen lintas fakultas, buat SK Rektor atau Surat Penolakan'),
  (5, 'Penerbitan SK Rektor / Surat Penolakan', 'admin_bak',    'disetujui',              'terbit',                'Upload SK Rektor (diterima) atau Surat Penolakan WR (ditolak)')
) AS v(urutan, nm, role, masuk, selesai, desk)
WHERE kode_layanan = 'PM-ALIH';

-- Verifikasi
SELECT t.urutan, t.nm_tahapan, t.kode_role, t.status_masuk, t.status_selesai
FROM ref.tahapan_layanan t
JOIN ref.jenis_layanan jl ON jl.id_jenis_layanan = t.id_jenis_layanan
WHERE jl.kode_layanan = 'PM-ALIH' AND t.soft_delete = false
ORDER BY t.urutan;
