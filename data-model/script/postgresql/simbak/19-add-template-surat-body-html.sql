-- ============================================================
-- ADD: body_html & tipe_template di ref.template_dokumen
-- Date: 2026-05-13
-- ============================================================
-- Mendukung template surat editable oleh admin BAK via CKEditor.
-- Layout induk (kop, judul, TTD, footer) tetap di Blade.
-- Hanya BODY KONTEN yang disimpan di DB sebagai HTML editable.

ALTER TABLE ref.template_dokumen
    ADD COLUMN IF NOT EXISTS body_html      TEXT        NULL,
    ADD COLUMN IF NOT EXISTS body_default   TEXT        NULL,
    ADD COLUMN IF NOT EXISTS tipe_template  VARCHAR(30) NOT NULL DEFAULT 'pdf_upload';

COMMENT ON COLUMN ref.template_dokumen.body_html     IS 'HTML body editable oleh admin BAK (untuk tipe html_editable)';
COMMENT ON COLUMN ref.template_dokumen.body_default  IS 'Backup default body HTML untuk fitur Reset ke Default';
COMMENT ON COLUMN ref.template_dokumen.tipe_template IS 'pdf_upload (template PDF upload) | html_editable (HTML editable via CKEditor)';

-- Seed: 4 template surat editable untuk SK-KTM, SK-PKKMB, SK-HERREG, SK-LOA
DO $$
DECLARE
    rec RECORD;
    body_ktm TEXT;
    body_pkkmb TEXT;
    body_herreg TEXT;
    body_loa TEXT;
BEGIN
    body_ktm := '<p style="text-align: justify;">' ||
        'Berdasarkan Surat Keterangan Mahasiswa Aktif dari Fakultas {{nm_fakultas}} nomor: ' ||
        '<strong>{{nomor_surat_ket_aktif}}</strong> dan Surat Laporan Kehilangan dari Kepolisian nomor: ' ||
        '<strong>{{nomor_surat_polisi}}</strong>, Kepala Biro Akademik dan Kemahasiswaan (BAK) Universitas Lampung, menerangkan bahwa:' ||
        '</p>' ||
        '<table class="data" style="margin-top: 8px;">' ||
        '<tr><td style="width: 140px;">Nama</td><td>: {{nm_mahasiswa}}</td></tr>' ||
        '<tr><td>NPM</td><td>: {{nim}}</td></tr>' ||
        '<tr><td>Program Studi</td><td>: {{nm_prodi}}</td></tr>' ||
        '<tr><td>Fakultas</td><td>: {{nm_fakultas}}</td></tr>' ||
        '</table>' ||
        '<p style="text-align: justify;">setelah dilakukan verifikasi dan validasi oleh Bagian Akademik BAK, adalah benar mahasiswa aktif Universitas Lampung.</p>' ||
        '<p style="text-align: justify;">Demikian surat keterangan ini dibuat sebagai pengganti Kartu Tanda Mahasiswa (KTM).</p>';

    body_pkkmb := '<p style="text-align: justify;">' ||
        'Berdasarkan Surat Permohonan Pengganti Sertifikat PKKMB dari Fakultas {{nm_fakultas}} nomor: ' ||
        '<strong>{{nomor_surat_ket_aktif}}</strong> dan Surat Laporan Kehilangan dari Kepolisian nomor: ' ||
        '<strong>{{nomor_surat_polisi}}</strong>, Kepala Biro Akademik dan Kemahasiswaan (BAK) Universitas Lampung menerangkan bahwa:' ||
        '</p>' ||
        '<table class="data" style="margin-top: 8px;">' ||
        '<tr><td style="width: 140px;">Nama</td><td>: {{nm_mahasiswa}}</td></tr>' ||
        '<tr><td>NPM</td><td>: {{nim}}</td></tr>' ||
        '<tr><td>Program Studi</td><td>: {{nm_prodi}}</td></tr>' ||
        '<tr><td>Fakultas</td><td>: {{nm_fakultas}}</td></tr>' ||
        '</table>' ||
        '<p style="text-align: justify;">setelah dilakukan validasi oleh Bagian Akademik BAK, adalah benar mahasiswa aktif Universitas Lampung dan dinyatakan lulus Program Pengenalan Kehidupan Kampus Mahasiswa Baru (PKKMB) Tahun {{tahun_pkkmb}}.</p>' ||
        '<p style="text-align: justify;">Demikian surat keterangan ini dibuat sebagai pengganti Sertifikat Pengenalan Kehidupan Kampus Mahasiswa Baru (PKKMB).</p>';

    body_herreg := '<p style="text-align: justify;">' ||
        'Berdasarkan SK Cuti Akademik nomor: <strong>{{nomor_sk_cuti}}</strong> tanggal <strong>{{tgl_sk_cuti}}</strong> dan Bukti Pembayaran UKT Semester Berjalan, ' ||
        'Kepala Biro Akademik dan Kemahasiswaan (BAK) Universitas Lampung menerangkan bahwa:' ||
        '</p>' ||
        '<table class="data" style="margin-top: 8px;">' ||
        '<tr><td style="width: 140px;">Nama</td><td>: {{nm_mahasiswa}}</td></tr>' ||
        '<tr><td>NPM</td><td>: {{nim}}</td></tr>' ||
        '<tr><td>Program Studi</td><td>: {{nm_prodi}}</td></tr>' ||
        '<tr><td>Fakultas</td><td>: {{nm_fakultas}}</td></tr>' ||
        '</table>' ||
        '<p style="text-align: justify;">adalah benar mahasiswa aktif Universitas Lampung dan telah melakukan heregistrasi/her pada semester berjalan setelah menjalani cuti akademik.</p>' ||
        '<p style="text-align: justify;">Demikian Surat Keterangan Heregistrasi ini dibuat untuk dipergunakan sebagaimana mestinya.</p>';

    body_loa := '<p style="text-align: justify;">Kepala Biro Akademik dan Kemahasiswaan (BAK) Universitas Lampung dengan ini menerangkan bahwa:</p>' ||
        '<table class="data" style="margin-top: 8px;">' ||
        '<tr><td style="width: 140px;">Nama</td><td>: {{nm_mahasiswa}}</td></tr>' ||
        '<tr><td>NPM</td><td>: {{nim}}</td></tr>' ||
        '<tr><td>Program Studi</td><td>: {{nm_prodi}}</td></tr>' ||
        '<tr><td>Fakultas</td><td>: {{nm_fakultas}}</td></tr>' ||
        '<tr><td>Angkatan</td><td>: {{angkatan}}</td></tr>' ||
        '</table>' ||
        '<p style="text-align: justify;">adalah benar telah diterima sebagai Mahasiswa Baru Universitas Lampung pada program studi tersebut di atas. Yang bersangkutan dinyatakan terdaftar dan berhak mengikuti seluruh kegiatan akademik di Universitas Lampung.</p>' ||
        '<p style="text-align: justify;">Surat Keterangan ini diterbitkan sebagai Letter of Acceptance (LoA) atas permintaan yang bersangkutan untuk dipergunakan sebagaimana mestinya.</p>';

    FOR rec IN SELECT id_jenis_layanan, kode_layanan FROM ref.jenis_layanan
               WHERE kode_layanan IN ('SK-KTM', 'SK-PKKMB', 'SK-HERREG', 'SK-LOA')
    LOOP
        INSERT INTO ref.template_dokumen (id_jenis_layanan, nm_template, versi, path_file, tipe_file, tipe_template, body_html, body_default, a_aktif, keterangan)
        SELECT rec.id_jenis_layanan,
               'Template Draft ' || rec.kode_layanan,
               '1.0',
               '', -- path_file kosong untuk html_editable
               'text/html',
               'html_editable',
               CASE rec.kode_layanan
                    WHEN 'SK-KTM'    THEN body_ktm
                    WHEN 'SK-PKKMB'  THEN body_pkkmb
                    WHEN 'SK-HERREG' THEN body_herreg
                    WHEN 'SK-LOA'    THEN body_loa
               END,
               CASE rec.kode_layanan
                    WHEN 'SK-KTM'    THEN body_ktm
                    WHEN 'SK-PKKMB'  THEN body_pkkmb
                    WHEN 'SK-HERREG' THEN body_herreg
                    WHEN 'SK-LOA'    THEN body_loa
               END,
               true,
               'Template draft surat editable via CKEditor (body content saja, layout di Blade)'
        WHERE NOT EXISTS (
            SELECT 1 FROM ref.template_dokumen td
            WHERE td.id_jenis_layanan = rec.id_jenis_layanan
              AND td.tipe_template = 'html_editable'
              AND td.soft_delete = false
        );
        RAISE NOTICE 'Seeded template for %', rec.kode_layanan;
    END LOOP;
END $$;

GRANT ALL PRIVILEGES ON TABLE ref.template_dokumen TO myunila_bak;
