-- ============================================================
-- ADD: pengaturan pejabat penandatangan untuk draft surat
-- Date: 2026-05-13
-- ============================================================
-- Setting untuk Kepala Biro Akademik & Kemahasiswaan (BAK) yang menandatangani
-- surat-surat keterangan (SK-*). Disimpan sebagai key-value di ref.pengaturan_notifikasi
-- agar konsisten dengan setting SMTP/WA yang sudah ada.

INSERT INTO ref.pengaturan_notifikasi (kode, nilai, deskripsi, grup) VALUES
    ('pejabat_nama', 'Hero Satrian Arief, S.E., M.H.', 'Nama lengkap pejabat penandatangan surat (Kepala Biro BAK)', 'pejabat'),
    ('pejabat_nip', '196802251987031001', 'NIP pejabat penandatangan', 'pejabat'),
    ('pejabat_jabatan', 'Kepala Biro Akademik dan Kemahasiswaan', 'Jabatan pejabat penandatangan', 'pejabat'),
    ('tempat_terbit', 'Bandar Lampung', 'Kota tempat surat diterbitkan', 'pejabat')
ON CONFLICT (kode) DO NOTHING;

GRANT ALL PRIVILEGES ON TABLE ref.pengaturan_notifikasi TO myunila_bak;
