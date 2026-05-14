-- =====================================================
-- SIMBAK Seed Data — Staging
-- Date: 2026-03-28
-- Columns verified against actual schema
-- =====================================================

-- =====================================================
-- 1. ref.jenis_layanan — 10 layanan BAK
-- Columns: kode_layanan, nm_layanan, kategori, deskripsi, a_aktif, a_batch, urutan, sla_hari
-- =====================================================
INSERT INTO ref.jenis_layanan (kode_layanan, nm_layanan, kategori, deskripsi, a_aktif, a_batch, urutan, sla_hari) VALUES
('SK-LOA',    'Surat Keterangan Diterima sebagai Mahasiswa Baru (LoA)', 'surat_mandiri',        'Surat keterangan penerimaan untuk mahasiswa baru atau calon mahasiswa', true, false, 1, 3),
('SK-KTM',    'Surat Keterangan Pengganti KTM',                         'surat_mandiri',        'Penggantian Kartu Tanda Mahasiswa yang hilang atau rusak', true, false, 2, 3),
('SK-PKKMB',  'Surat Keterangan Pengganti Sertifikat PKKMB',            'surat_mandiri',        'Penggantian sertifikat PKKMB yang hilang', true, false, 3, 3),
('SK-HERREG', 'Surat Keterangan Herregistrasi',                         'surat_mandiri',        'Surat keterangan status herregistrasi semester berjalan', true, false, 4, 2),
('PM-CUTI',   'Cuti Akademik',                                          'permohonan_akademik',  'Permohonan cuti akademik 1-2 semester', true, false, 5, 14),
('PM-UNDUR',  'Undur Diri',                                             'permohonan_akademik',  'Permohonan pengunduran diri sebagai mahasiswa', true, false, 6, 14),
('PM-ALIH',   'Alih Program / Pindah Studi',                            'permohonan_akademik',  'Permohonan perpindahan program studi', true, false, 7, 30),
('BA-HMM',    'Penetapan Habis Masa Mukim',                             'batch_administrasi',   'Penetapan mahasiswa yang melewati batas masa studi', true, true, 8, 60),
('BA-PUTUS',  'Penetapan Putus Studi Akademik',                         'batch_administrasi',   'Penetapan mahasiswa putus studi berdasarkan evaluasi akademik', true, true, 9, 60),
('MO-AKTIF',  'Monitoring Mahasiswa Aktif & Lulusan',                    'monitoring',           'Dashboard monitoring data mahasiswa aktif dan lulusan', true, false, 10, NULL);

-- =====================================================
-- 2. ref.persyaratan_layanan — per jenis layanan
-- Columns: id_jenis_layanan, kode_dokumen, nm_dokumen, deskripsi, a_wajib, urutan, tipe_file, max_size_mb
-- =====================================================

-- SK-LOA
INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, a_wajib, urutan)
SELECT id_jenis_layanan, kode, nm, true, v.urutan
FROM ref.jenis_layanan, (VALUES
  ('DOC-SURAT-PERMOHONAN', 'Surat Permohonan Mahasiswa dan Wali', 1),
  ('DOC-KTM-SEMENTARA',    'KTM Sementara', 2),
  ('DOC-SLIP-UKT',         'Slip UKT', 3)
) AS v(kode, nm, urutan)
WHERE kode_layanan = 'SK-LOA';

-- SK-KTM
INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, a_wajib, urutan)
SELECT id_jenis_layanan, kode, nm, true, v.urutan
FROM ref.jenis_layanan, (VALUES
  ('DOC-KTM-SEMENTARA', 'KTM Sementara', 1),
  ('DOC-SK-AKTIF',      'Surat Keterangan Mahasiswa Aktif / Lulus PKKMB', 2),
  ('DOC-SURAT-HILANG',  'Surat Keterangan Kehilangan dari Kepolisian', 3)
) AS v(kode, nm, urutan)
WHERE kode_layanan = 'SK-KTM';

-- SK-PKKMB
INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, a_wajib, urutan)
SELECT id_jenis_layanan, kode, nm, true, v.urutan
FROM ref.jenis_layanan, (VALUES
  ('DOC-KTM-ASLI',     'Scan KTM Asli', 1),
  ('DOC-SK-PKKMB',     'Surat Keterangan Lulus PKKMB dari Fakultas', 2),
  ('DOC-SURAT-HILANG', 'Surat Keterangan Kehilangan dari Kepolisian', 3)
) AS v(kode, nm, urutan)
WHERE kode_layanan = 'SK-PKKMB';

-- SK-HERREG
INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, a_wajib, urutan)
SELECT id_jenis_layanan, kode, nm, true, v.urutan
FROM ref.jenis_layanan, (VALUES
  ('DOC-BUKTI-UKT', 'Bukti Pembayaran UKT Semester Berjalan', 1),
  ('DOC-SK-CUTI',   'SK Cuti Akademik',                      2)
) AS v(kode, nm, urutan)
WHERE kode_layanan = 'SK-HERREG';

-- PM-CUTI
INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, a_wajib, urutan)
SELECT id_jenis_layanan, kode, nm, true, v.urutan
FROM ref.jenis_layanan, (VALUES
  ('DOC-SURAT-PERMOHONAN',      'Surat Permohonan Mahasiswa dan Wali', 1),
  ('DOC-KTM-ASLI',              'KTM Asli (Scan)', 2),
  ('DOC-SLIP-UKT',              'Slip UKT / Bukti Bayar UKT Terakhir', 3),
  ('DOC-SURAT-PENGANTAR-PRODI', 'Surat Pengantar Kepala Jurusan / Prodi', 4)
) AS v(kode, nm, urutan)
WHERE kode_layanan = 'PM-CUTI';

-- PM-UNDUR
INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, a_wajib, urutan)
SELECT id_jenis_layanan, kode, nm, true, v.urutan
FROM ref.jenis_layanan, (VALUES
  ('DOC-SURAT-PERMOHONAN',      'Surat Permohonan Mahasiswa dan Wali', 1),
  ('DOC-KTM-ASLI',              'KTM Asli (Scan)', 2),
  ('DOC-SLIP-UKT',              'Slip UKT / Bukti Bayar UKT', 3),
  ('DOC-SURAT-PENGANTAR-PRODI', 'Surat Pengantar Kepala Jurusan / Prodi', 4)
) AS v(kode, nm, urutan)
WHERE kode_layanan = 'PM-UNDUR';

-- PM-ALIH
INSERT INTO ref.persyaratan_layanan (id_jenis_layanan, kode_dokumen, nm_dokumen, a_wajib, urutan)
SELECT id_jenis_layanan, kode, nm, true, v.urutan
FROM ref.jenis_layanan, (VALUES
  ('DOC-SURAT-PERMOHONAN',  'Surat Permohonan Mahasiswa dan Wali', 1),
  ('DOC-SK-TATA-TERTIB',    'Surat Keterangan Tidak Melanggar Tata Tertib', 2),
  ('DOC-SK-TIDAK-PUTUS',    'Surat Keterangan Tidak Diputus Studi', 3),
  ('DOC-TRANSKRIP',         'Transkrip Akademik', 4),
  ('DOC-SK-KELAKUAN-BAIK',  'Surat Keterangan Berkelakuan Baik dari Fakultas', 5),
  ('DOC-BUKTI-UKT',         'Bukti Pembayaran UKT Terakhir', 6)
) AS v(kode, nm, urutan)
WHERE kode_layanan = 'PM-ALIH';

-- =====================================================
-- 3. ref.tahapan_layanan — workflow steps per layanan
-- Columns: id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, a_opsional, deskripsi
-- =====================================================

-- Surat Mandiri (SK-LOA, SK-KTM, SK-PKKMB, SK-HERREG) — 4 tahap (revisi 13 Mei 2026: tambah Persetujuan Pimpinan)
INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, deskripsi)
SELECT jl.id_jenis_layanan, v.urutan, v.nm, v.kode_role, v.status_masuk, v.status_selesai, v.deskripsi
FROM ref.jenis_layanan jl, (VALUES
  (1, 'Pengajuan oleh Mahasiswa', 'mahasiswa',  'draft',                'diajukan',              'Mahasiswa mengisi formulir dan mengunggah dokumen'),
  (2, 'Verifikasi Admin BAK',    'admin_bak',   'diajukan',             'menunggu_persetujuan',  'Admin BAK memverifikasi kelengkapan dokumen'),
  (3, 'Persetujuan Pimpinan',    'kabag',       'menunggu_persetujuan', 'disetujui',             'Kepala Bagian/Koordinator/PJ memberikan persetujuan atas surat sebelum diterbitkan'),
  (4, 'Penerbitan Surat',        'admin_bak',   'disetujui',            'terbit',                'Admin BAK menerbitkan surat setelah disetujui pimpinan')
) AS v(urutan, nm, kode_role, status_masuk, status_selesai, deskripsi)
WHERE jl.kategori = 'surat_mandiri';

-- Permohonan Akademik: Cuti & Undur Diri
INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, deskripsi)
SELECT jl.id_jenis_layanan, v.urutan, v.nm, v.kode_role, v.status_masuk, v.status_selesai, v.deskripsi
FROM ref.jenis_layanan jl, (VALUES
  (1, 'Pengajuan oleh Mahasiswa',    'mahasiswa',       'draft',                  'diajukan',              'Mahasiswa mengisi formulir dan mengunggah dokumen persyaratan'),
  (2, 'Verifikasi Admin Fakultas',   'admin_fakultas',  'diajukan',               'diverifikasi',          'Admin Fakultas memverifikasi dan mengunggah surat pengantar'),
  (3, 'Verifikasi Admin BAK',        'admin_bak',       'diverifikasi',           'menunggu_persetujuan',  'Admin BAK melakukan verifikasi akhir'),
  (4, 'Persetujuan Pimpinan',        'kabag',           'menunggu_persetujuan',   'disetujui',             'Kepala Bagian/Koordinator/PJ memberikan persetujuan'),
  (5, 'Penerbitan Dokumen',          'admin_bak',       'disetujui',              'terbit',                'Admin BAK menerbitkan surat keterangan/SK')
) AS v(urutan, nm, kode_role, status_masuk, status_selesai, deskripsi)
WHERE jl.kode_layanan IN ('PM-CUTI', 'PM-UNDUR');

-- Alih Program — 6 tahapan (revisi 12 Mei 2026: tambah tahap Persetujuan Pimpinan)
INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, deskripsi)
SELECT jl.id_jenis_layanan, v.urutan, v.nm, v.kode_role, v.status_masuk, v.status_selesai, v.deskripsi
FROM ref.jenis_layanan jl, (VALUES
  (1, 'Pengajuan oleh Mahasiswa',                  'mahasiswa',       'draft',                  'diajukan',              'Mahasiswa memilih prodi tujuan dan mengunggah dokumen'),
  (2, 'Verifikasi Admin Fakultas Asal',            'admin_fakultas',  'diajukan',               'diverifikasi',          'Verifikasi dokumen, upload surat pengantar Dekan ke SIMBAK'),
  (3, 'Verifikasi & Penerimaan Fakultas Tujuan',   'admin_fakultas',  'diverifikasi',           'diperiksa_fakultas',    'Wawancara, keputusan diterima/ditolak, upload konversi SKS dan surat balasan'),
  (4, 'Verifikasi Admin BAK',                      'admin_bak',       'diperiksa_fakultas',     'menunggu_persetujuan',  'Admin BAK memverifikasi kelengkapan dokumen dan SK Dekan dari fakultas tujuan'),
  (5, 'Persetujuan Pimpinan',                      'kabag',           'menunggu_persetujuan',   'disetujui',             'Kepala Bagian/Koordinator/PJ memberikan persetujuan'),
  (6, 'Penerbitan SK Rektor / Surat Penolakan',    'admin_bak',       'disetujui',              'terbit',                'Upload SK Rektor (diterima) atau Surat Penolakan WR (ditolak)')
) AS v(urutan, nm, kode_role, status_masuk, status_selesai, deskripsi)
WHERE jl.kode_layanan = 'PM-ALIH';

-- Batch Administrasi (HMM & Putus Studi)
INSERT INTO ref.tahapan_layanan (id_jenis_layanan, urutan, nm_tahapan, kode_role, status_masuk, status_selesai, deskripsi)
SELECT jl.id_jenis_layanan, v.urutan, v.nm, v.kode_role, v.status_masuk, v.status_selesai, v.deskripsi
FROM ref.jenis_layanan jl, (VALUES
  (1, 'Tarik Data Kandidat',     'admin_bak',       'draft',                  'diajukan',              'Admin BAK menarik data mahasiswa berdasarkan kriteria'),
  (2, 'Verifikasi Fakultas',     'admin_fakultas',  'diajukan',               'diverifikasi',          'Admin Fakultas memverifikasi dan memberi catatan per kandidat'),
  (3, 'Penerbitan SK Dekan',     'admin_fakultas',  'diverifikasi',           'menunggu_persetujuan',  'Admin Fakultas membuat SK Dekan'),
  (4, 'Finalisasi Admin BAK',    'admin_bak',       'menunggu_persetujuan',   'disetujui',             'Admin BAK menyusun SK Rektor'),
  (5, 'Penerbitan SK Rektor',    'admin_bak',       'disetujui',              'terbit',                'SK Rektor diterbitkan dan notifikasi dikirim')
) AS v(urutan, nm, kode_role, status_masuk, status_selesai, deskripsi)
WHERE jl.kategori = 'batch_administrasi';

-- =====================================================
-- 4. ref.template_dokumen — placeholder templates
-- Columns: id_jenis_layanan, nm_template, versi, path_file, tipe_file, a_aktif, keterangan
-- =====================================================
INSERT INTO ref.template_dokumen (id_jenis_layanan, nm_template, versi, path_file, tipe_file, a_aktif, keterangan)
SELECT jl.id_jenis_layanan,
  'Template ' || jl.nm_layanan,
  '1.0',
  'simbak/templates/' || jl.kode_layanan || '.docx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  true,
  CASE 
    WHEN jl.kategori = 'batch_administrasi' THEN 'Template SK Rektor untuk ' || jl.nm_layanan
    WHEN jl.kode_layanan = 'PM-ALIH' THEN 'Template SK Rektor Alih Program'
    ELSE 'Template Surat Keterangan ' || jl.nm_layanan
  END
FROM ref.jenis_layanan jl
WHERE jl.kategori != 'monitoring';

-- =====================================================
-- Verify seed
-- =====================================================
SELECT 'jenis_layanan' as tabel, count(*) FROM ref.jenis_layanan
UNION ALL SELECT 'persyaratan', count(*) FROM ref.persyaratan_layanan
UNION ALL SELECT 'tahapan', count(*) FROM ref.tahapan_layanan
UNION ALL SELECT 'template', count(*) FROM ref.template_dokumen
ORDER BY tabel;
