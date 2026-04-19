-- =====================================================
-- ALTER Script: Infrastruktur Notifikasi SIMBAK
-- Date: 2026-04-12
-- Description:
--   1. ref.pengaturan_notifikasi — WA API config + general settings
--   2. ref.template_notifikasi — template email/WA per event
--   3. log.notifikasi — log pengiriman notifikasi
--   4. ref.smtp_config — konfigurasi SMTP multi-config (mirip SI Registrasi)
-- =====================================================

-- =====================================================
-- 1. ref.pengaturan_notifikasi — Konfigurasi SMTP & WA
-- =====================================================
CREATE TABLE IF NOT EXISTS ref.pengaturan_notifikasi (
    id_pengaturan   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode            VARCHAR(50)     NOT NULL UNIQUE,
                                    -- smtp_host, smtp_port, smtp_username, smtp_password,
                                    -- smtp_encryption, smtp_from_address, smtp_from_name,
                                    -- wa_api_url, wa_api_key, wa_sender_number,
                                    -- notifikasi_aktif (true/false)
    nilai           TEXT            NULL,
    deskripsi       VARCHAR(200)    NULL,
    grup            VARCHAR(30)     NOT NULL DEFAULT 'smtp',
                                    -- smtp, whatsapp, umum
    a_rahasia       BOOLEAN         NOT NULL DEFAULT FALSE,
                                    -- TRUE untuk password/api_key (masked di UI)
    id_creator      UUID            NULL,
    id_updater      UUID            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.pengaturan_notifikasi IS 'Konfigurasi SMTP dan WhatsApp API untuk notifikasi SIMBAK';

-- Seed default pengaturan
INSERT INTO ref.pengaturan_notifikasi (kode, nilai, deskripsi, grup, a_rahasia) VALUES
    ('notifikasi_aktif', 'false', 'Aktifkan/nonaktifkan pengiriman notifikasi', 'umum', false),
    ('smtp_host', '', 'SMTP server hostname', 'smtp', false),
    ('smtp_port', '587', 'SMTP server port', 'smtp', false),
    ('smtp_username', '', 'SMTP username / email', 'smtp', false),
    ('smtp_password', '', 'SMTP password', 'smtp', true),
    ('smtp_encryption', 'tls', 'Enkripsi: tls / ssl / none', 'smtp', false),
    ('smtp_from_address', '', 'Alamat email pengirim', 'smtp', false),
    ('smtp_from_name', 'SIMBAK Universitas Lampung', 'Nama pengirim email', 'smtp', false),
    -- WhatsApp tidak perlu API config — dikirim manual via wa.me link
    -- ('wa_api_url', '', 'URL API WhatsApp', 'whatsapp', false),
    -- ('wa_api_key', '', 'API Key WhatsApp', 'whatsapp', true),
    -- ('wa_sender_number', '', 'Nomor pengirim WhatsApp', 'whatsapp', false)
ON CONFLICT (kode) DO NOTHING;


-- =====================================================
-- 2. ref.template_notifikasi — Template pesan per event
-- =====================================================
CREATE TABLE IF NOT EXISTS ref.template_notifikasi (
    id_template     UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_event      VARCHAR(50)     NOT NULL UNIQUE,
                                    -- status_perlu_perbaikan, status_ditolak, status_terbit,
                                    -- batch_putus_studi_warning, batch_hmm_warning
    nm_template     VARCHAR(200)    NOT NULL,
    deskripsi       TEXT            NULL,
    channel         VARCHAR(20)     NOT NULL DEFAULT 'email',
                                    -- email, whatsapp, semua
    subject_email   VARCHAR(300)    NULL,
                                    -- Subject email (support placeholder {{nama}}, {{npm}}, dll)
    body_email      TEXT            NULL,
                                    -- Body email HTML (support placeholder)
    body_whatsapp   TEXT            NULL,
                                    -- Body WhatsApp plain text (support placeholder)
    a_aktif         BOOLEAN         NOT NULL DEFAULT TRUE,
    id_creator      UUID            NULL,
    id_updater      UUID            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.template_notifikasi IS 'Template pesan notifikasi per event (email dan WhatsApp)';
COMMENT ON COLUMN ref.template_notifikasi.kode_event IS 'Kode event trigger: status_perlu_perbaikan, batch_putus_studi_warning, dll';

-- Seed default template
INSERT INTO ref.template_notifikasi (kode_event, nm_template, deskripsi, channel, subject_email, body_email, body_whatsapp) VALUES
    ('status_perlu_perbaikan',
     'Pengajuan Perlu Diperbaiki',
     'Dikirim saat pengajuan dikembalikan ke mahasiswa untuk perbaikan',
     'email',
     '[SIMBAK] Pengajuan Anda Perlu Diperbaiki',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})</p><p>Pengajuan layanan <strong>{{layanan}}</strong> dengan nomor <strong>{{nomor}}</strong> perlu diperbaiki.</p><p><strong>Catatan:</strong> {{catatan}}</p><p>Silakan login ke portal SIMBAK untuk memperbaiki pengajuan Anda.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[SIMBAK] Pengajuan {{layanan}} ({{nomor}}) perlu diperbaiki. Catatan: {{catatan}}. Silakan cek portal SIMBAK.'),

    ('status_ditolak',
     'Pengajuan Ditolak',
     'Dikirim saat pengajuan ditolak',
     'email',
     '[SIMBAK] Pengajuan Anda Ditolak',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})</p><p>Dengan ini kami sampaikan bahwa pengajuan layanan <strong>{{layanan}}</strong> dengan nomor <strong>{{nomor}}</strong> telah <strong>ditolak</strong>.</p><p><strong>Alasan:</strong> {{catatan}}</p><p>Jika ada pertanyaan, silakan hubungi Biro Akademik dan Kemahasiswaan.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[SIMBAK] Pengajuan {{layanan}} ({{nomor}}) ditolak. Alasan: {{catatan}}. Hubungi BAK untuk info lebih lanjut.'),

    ('status_terbit',
     'Surat/SK Telah Terbit',
     'Dikirim saat surat/SK selesai diterbitkan',
     'email',
     '[SIMBAK] Surat/SK Anda Telah Terbit',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})</p><p>Surat/SK untuk layanan <strong>{{layanan}}</strong> dengan nomor permohonan <strong>{{nomor}}</strong> telah diterbitkan.</p><p>Silakan login ke portal SIMBAK untuk mengunduh dokumen Anda.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[SIMBAK] Surat/SK {{layanan}} ({{nomor}}) telah terbit. Silakan download di portal SIMBAK.'),

    ('batch_putus_studi_warning',
     'Peringatan Evaluasi Akademik (Putus Studi)',
     'Dikirim ke kandidat putus studi saat batch dibuat — peringatan jangan bayar UKT',
     'semua',
     '[PENTING] Evaluasi Akademik Semester {{semester}} — Universitas Lampung',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})<br>Program Studi {{prodi}}, {{fakultas}}</p><p>Anda masuk dalam daftar evaluasi akademik semester <strong>{{semester}}</strong> berdasarkan kriteria evaluasi yang berlaku (Pertor No. 12 Tahun 2025 tentang PA Pasal 48).</p><p style="color:red;font-weight:bold;">⚠️ MOHON TIDAK MELAKUKAN PEMBAYARAN UKT sampai ada keputusan resmi.</p><p>Silakan hubungi Biro Akademik dan Kemahasiswaan (BAK) untuk informasi lebih lanjut atau klarifikasi.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[PENTING] Evaluasi Akademik — Universitas Lampung

Yth. {{nama}} ({{npm}})

Anda masuk daftar evaluasi akademik semester {{semester}}.

⚠️ MOHON TIDAK BAYAR UKT sampai ada keputusan resmi.

Hubungi BAK untuk info lebih lanjut.'),

    ('batch_hmm_warning',
     'Peringatan Evaluasi Masa Studi (Habis Masa Mukim)',
     'Dikirim ke kandidat HMM saat batch dibuat',
     'semua',
     '[PENTING] Evaluasi Masa Studi — Universitas Lampung',
     '<p>Yth. <strong>{{nama}}</strong> (NPM: {{npm}})<br>Program Studi {{prodi}}, {{fakultas}}</p><p>Anda masuk dalam daftar evaluasi masa studi berdasarkan Pertor No. 12 Tahun 2025 tentang PA Pasal 24.</p><p>Data akademik Anda:<br>- Jenjang: {{jenjang}}<br>- Angkatan: {{angkatan}}<br>- Semester saat ini: {{semester}}<br>- Batas masa studi: {{batas_semester}} semester</p><p>Silakan hubungi Biro Akademik dan Kemahasiswaan (BAK) atau fakultas Anda untuk informasi lebih lanjut.</p><br><p>Hormat kami,<br>Biro Akademik dan Kemahasiswaan<br>Universitas Lampung</p>',
     '[PENTING] Evaluasi Masa Studi — Universitas Lampung

Yth. {{nama}} ({{npm}})
Jenjang: {{jenjang}} | Semester: {{semester}}

Anda masuk daftar evaluasi masa studi (batas: {{batas_semester}} smt).

Hubungi BAK atau fakultas untuk info lebih lanjut.')
ON CONFLICT (kode_event) DO NOTHING;


-- =====================================================
-- 3. log.notifikasi — Log pengiriman notifikasi
-- =====================================================
CREATE TABLE IF NOT EXISTS log.notifikasi (
    id_notifikasi   UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_event      VARCHAR(50)     NOT NULL,
                                    -- event yang memicu notifikasi
    channel         VARCHAR(20)     NOT NULL,
                                    -- email, whatsapp
    penerima        VARCHAR(200)    NOT NULL,
                                    -- email address atau nomor WA
    nm_penerima     VARCHAR(200)    NULL,
    subject         VARCHAR(300)    NULL,
    body            TEXT            NULL,
                                    -- body yang sudah di-render (placeholder sudah diganti)
    status          VARCHAR(20)     NOT NULL DEFAULT 'pending',
                                    -- pending, sent, failed
    error_message   TEXT            NULL,
                                    -- error message jika gagal
    id_pengajuan    UUID            NULL,
                                    -- referensi ke pengajuan (jika terkait)
    id_batch        UUID            NULL,
                                    -- referensi ke batch (jika terkait)
    id_kandidat     UUID            NULL,
                                    -- referensi ke kandidat batch (jika terkait)
    retry_count     INT             NOT NULL DEFAULT 0,
    sent_at         TIMESTAMP       NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE log.notifikasi IS 'Log pengiriman notifikasi email dan WhatsApp';

CREATE INDEX IF NOT EXISTS idx_notifikasi_kode_event ON log.notifikasi(kode_event);
CREATE INDEX IF NOT EXISTS idx_notifikasi_status ON log.notifikasi(status);
CREATE INDEX IF NOT EXISTS idx_notifikasi_created_at ON log.notifikasi(created_at DESC);


-- =====================================================
-- 4. ref.smtp_config — Konfigurasi SMTP multi-config
-- =====================================================
-- Mirip SI Registrasi: support multi SMTP, limit harian/bulanan, prioritas
CREATE TABLE IF NOT EXISTS ref.smtp_config (
    id_smtp         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    nm_config       VARCHAR(200)    NOT NULL,
    smtp_host       VARCHAR(200)    NOT NULL,
    smtp_port       INT             NOT NULL DEFAULT 587,
    smtp_encryption VARCHAR(10)     NOT NULL DEFAULT 'tls',
    smtp_username   VARCHAR(200)    NOT NULL,
    smtp_password   VARCHAR(500)    NOT NULL,
    from_name       VARCHAR(200)    NOT NULL,
    from_address    VARCHAR(200)    NOT NULL,
    reply_to        VARCHAR(200)    NULL,
    limit_harian    INT             NOT NULL DEFAULT 2000,
    limit_bulanan   INT             NOT NULL DEFAULT 10000,
    terkirim_hari   INT             NOT NULL DEFAULT 0,
    terkirim_bulan  INT             NOT NULL DEFAULT 0,
    tgl_reset_hari  DATE            NOT NULL DEFAULT CURRENT_DATE,
    tgl_reset_bulan DATE            NOT NULL DEFAULT CURRENT_DATE,
    prioritas       INT             NOT NULL DEFAULT 1,
    a_aktif         BOOLEAN         NOT NULL DEFAULT TRUE,
    a_default       BOOLEAN         NOT NULL DEFAULT FALSE,
    id_creator      UUID            NULL,
    id_updater      UUID            NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ref.smtp_config IS 'Konfigurasi SMTP multi-config untuk pengiriman email (mirip SI Registrasi)';
