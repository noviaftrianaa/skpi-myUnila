-- ============================================================================
-- SIKNILA — Sistem Informasi Kuliah Kerja Nyata (SI KKN) Universitas Lampung
-- ============================================================================
-- Database    : siknila (PostgreSQL 15+)
-- Dibuat      : 2026-03-27
-- Deskripsi   : Schema lengkap untuk manajemen KKN meliputi pendaftaran,
--               pembentukan kelompok, kegiatan lapangan, penilaian,
--               dokumen, dan audit trail.
--
-- Arsitektur Dual-DB:
--   • PostgreSQL (siknila)  → database utama read-write
--   • SQL Server  (pdut)    → database referensi read-only via Foreign Data Wrapper
--     Tabel referensi PDUT:
--       - man_akses.pengguna        (data pengguna/akun)
--       - siakadu.peserta_didik     (data mahasiswa)
--       - siakadu.reg_pd            (registrasi peserta didik)
--       - siakadu.semester           (data semester)
--       - siakadu.sms               (satuan manajemen sumberdaya / prodi)
--       - siakadu.nilai_smt_mhs     (nilai semester mahasiswa)
--       - keuangan.spp_mhs          (status pembayaran SPP/UKT)
--
-- Object Storage (MinIO):
--   • Bucket  : myunila-storage
--   • Prefix  : siknila/dokumen/*, siknila/logbook/*, siknila/sertifikat/*,
--               siknila/laporan/*, siknila/foto/*, siknila/bimbingan/*
--
-- Konvensi Penamaan:
--   • PK       : id_xxx UUID DEFAULT gen_random_uuid()
--   • Nama     : nm_xxx
--   • Tanggal  : tgl_xxx
--   • Boolean  : a_xxx
--   • Audit    : id_creator, id_updater, created_at, updated_at, soft_delete
--   • Index    : idx_<schema>_<tabel>_<kolom>
--   • Trigger  : trg_<tabel>_set_updated_at, trg_<tabel>_catat_aktivitas
-- ============================================================================

-- Bersihkan schema public bawaan
DROP SCHEMA IF EXISTS public CASCADE;

-- ============================================================================
-- BUAT SCHEMA
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS ref;
COMMENT ON SCHEMA ref IS 'Data referensi/master untuk SI KKN';

CREATE SCHEMA IF NOT EXISTS pendaftaran;
COMMENT ON SCHEMA pendaftaran IS 'Modul pendaftaran dan registrasi KKN';

CREATE SCHEMA IF NOT EXISTS kelompok;
COMMENT ON SCHEMA kelompok IS 'Modul pembentukan dan manajemen kelompok KKN';

CREATE SCHEMA IF NOT EXISTS kegiatan;
COMMENT ON SCHEMA kegiatan IS 'Modul kegiatan lapangan, logbook, absensi, dan bimbingan';

CREATE SCHEMA IF NOT EXISTS penilaian;
COMMENT ON SCHEMA penilaian IS 'Modul penilaian dan nilai akhir KKN';

CREATE SCHEMA IF NOT EXISTS dokumen;
COMMENT ON SCHEMA dokumen IS 'Modul manajemen dokumen dan sertifikat KKN';

CREATE SCHEMA IF NOT EXISTS log;
COMMENT ON SCHEMA log IS 'Audit trail dan logging aktivitas data';


-- ############################################################################
-- SCHEMA: ref — Data Referensi / Master
-- ############################################################################

-- ----------------------------------------------------------------------------
-- ref.periode_kkn — Periode pelaksanaan KKN per semester/gelombang
-- ----------------------------------------------------------------------------
CREATE TABLE ref.periode_kkn (
    id_periode_kkn      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_periode        VARCHAR(30)     NOT NULL,
    nm_periode          VARCHAR(200)    NOT NULL,
    id_smt              VARCHAR(10)     NULL,           -- ref pdut: siakadu.semester
    tahun_akademik      VARCHAR(9)      NULL,           -- format: 2025/2026
    gelombang           INT             NOT NULL DEFAULT 1,
    tgl_daftar_mulai    DATE            NULL,
    tgl_daftar_selesai  DATE            NULL,
    tgl_pembekalan_mulai    DATE        NULL,
    tgl_pembekalan_selesai  DATE        NULL,
    tgl_pelaksanaan_mulai   DATE        NULL,
    tgl_pelaksanaan_selesai DATE        NULL,
    durasi_hari         INT             NOT NULL DEFAULT 40,
    kuota_total         INT             NULL,
    deskripsi           TEXT            NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_periode_kkn_kode UNIQUE (kode_periode)
);

COMMENT ON TABLE ref.periode_kkn IS 'Periode pelaksanaan KKN per semester dan gelombang';
COMMENT ON COLUMN ref.periode_kkn.id_periode_kkn IS 'Primary key UUID';
COMMENT ON COLUMN ref.periode_kkn.kode_periode IS 'Kode unik periode, misal: KKN-2026-GENAP-G1';
COMMENT ON COLUMN ref.periode_kkn.id_smt IS 'Referensi ke siakadu.semester di PDUT';
COMMENT ON COLUMN ref.periode_kkn.tahun_akademik IS 'Tahun akademik, format: 2025/2026';
COMMENT ON COLUMN ref.periode_kkn.gelombang IS 'Gelombang pelaksanaan dalam satu semester';
COMMENT ON COLUMN ref.periode_kkn.durasi_hari IS 'Durasi pelaksanaan KKN dalam hari';
COMMENT ON COLUMN ref.periode_kkn.kuota_total IS 'Kuota total mahasiswa yang dapat mendaftar';

-- ----------------------------------------------------------------------------
-- ref.lokasi_kkn — Lokasi penempatan KKN (desa/dusun)
-- ----------------------------------------------------------------------------
CREATE TABLE ref.lokasi_kkn (
    id_lokasi           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_lokasi         VARCHAR(20)     NOT NULL,
    nm_provinsi         VARCHAR(100)    NULL,
    nm_kabupaten        VARCHAR(100)    NULL,
    nm_kecamatan        VARCHAR(200)    NULL,
    nm_desa             VARCHAR(200)    NULL,
    nm_dusun            VARCHAR(60)     NULL,
    kode_pos            VARCHAR(5)      NULL,
    latitude            DECIMAL(10,7)   NULL,
    longitude           DECIMAL(10,7)   NULL,
    alamat_lengkap      TEXT            NULL,
    nm_kepala_desa      VARCHAR(200)    NULL,
    no_telp_desa        VARCHAR(20)     NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_lokasi_kkn_kode UNIQUE (kode_lokasi)
);

COMMENT ON TABLE ref.lokasi_kkn IS 'Master lokasi penempatan KKN (desa/dusun)';
COMMENT ON COLUMN ref.lokasi_kkn.kode_lokasi IS 'Kode unik lokasi, misal: LOK-LPG-001';
COMMENT ON COLUMN ref.lokasi_kkn.latitude IS 'Koordinat latitude lokasi';
COMMENT ON COLUMN ref.lokasi_kkn.longitude IS 'Koordinat longitude lokasi';

-- ----------------------------------------------------------------------------
-- ref.wilayah_kkn — Wilayah/zona pengelompokan lokasi KKN
-- ----------------------------------------------------------------------------
CREATE TABLE ref.wilayah_kkn (
    id_wilayah          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_wilayah        VARCHAR(20)     NOT NULL,
    nm_wilayah          VARCHAR(200)    NOT NULL,
    deskripsi           TEXT            NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_wilayah_kkn_kode UNIQUE (kode_wilayah)
);

COMMENT ON TABLE ref.wilayah_kkn IS 'Wilayah/zona pengelompokan lokasi KKN';
COMMENT ON COLUMN ref.wilayah_kkn.kode_wilayah IS 'Kode unik wilayah, misal: WIL-LAMPUNG-SELATAN';

-- ----------------------------------------------------------------------------
-- ref.jenis_dokumen — Jenis-jenis dokumen KKN
-- ----------------------------------------------------------------------------
CREATE TABLE ref.jenis_dokumen (
    id_jenis_dokumen    UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_dokumen        VARCHAR(30)     NOT NULL,
    nm_dokumen          VARCHAR(200)    NOT NULL,
    deskripsi           TEXT            NULL,
    tipe_file           VARCHAR(100)    NOT NULL DEFAULT 'application/pdf',
    max_size_mb         INT             NOT NULL DEFAULT 10,
    a_wajib             BOOLEAN         NOT NULL DEFAULT FALSE,
    urutan              INT             NOT NULL DEFAULT 0,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_jenis_dokumen_kode UNIQUE (kode_dokumen)
);

COMMENT ON TABLE ref.jenis_dokumen IS 'Master jenis dokumen KKN (PROPOSAL, LOGBOOK, LAPORAN_HARIAN, LAPORAN_AKHIR, FOTO_KEGIATAN, SURAT_TUGAS, SERTIFIKAT, LAINNYA)';
COMMENT ON COLUMN ref.jenis_dokumen.kode_dokumen IS 'Kode unik jenis dokumen: PROPOSAL, LOGBOOK, LAPORAN_HARIAN, LAPORAN_AKHIR, FOTO_KEGIATAN, SURAT_TUGAS, SERTIFIKAT, LAINNYA';
COMMENT ON COLUMN ref.jenis_dokumen.tipe_file IS 'MIME type yang diperbolehkan';
COMMENT ON COLUMN ref.jenis_dokumen.max_size_mb IS 'Ukuran maksimal file dalam MB';
COMMENT ON COLUMN ref.jenis_dokumen.a_wajib IS 'Apakah dokumen ini wajib diunggah';

-- ----------------------------------------------------------------------------
-- ref.komponen_penilaian — Komponen dan bobot penilaian KKN
-- ----------------------------------------------------------------------------
CREATE TABLE ref.komponen_penilaian (
    id_komponen         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_komponen       VARCHAR(30)     NOT NULL,
    nm_komponen         VARCHAR(200)    NOT NULL,
    deskripsi           TEXT            NULL,
    bobot               DECIMAL(5,2)    NOT NULL,       -- total semua komponen = 100
    penilai             VARCHAR(30)     NOT NULL,       -- dpl, pamong, admin
    urutan              INT             NOT NULL DEFAULT 0,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_komponen_penilaian_kode UNIQUE (kode_komponen),
    CONSTRAINT ck_komponen_bobot CHECK (bobot >= 0 AND bobot <= 100),
    CONSTRAINT ck_komponen_penilai CHECK (penilai IN ('dpl', 'pamong', 'admin'))
);

COMMENT ON TABLE ref.komponen_penilaian IS 'Master komponen penilaian KKN (KEHADIRAN, PARTISIPASI, LOGBOOK, LAPORAN, PRESENTASI, SIKAP, PAMONG). Total bobot harus 100%.';
COMMENT ON COLUMN ref.komponen_penilaian.kode_komponen IS 'Kode unik komponen: KEHADIRAN, PARTISIPASI, LOGBOOK, LAPORAN, PRESENTASI, SIKAP, PAMONG';
COMMENT ON COLUMN ref.komponen_penilaian.bobot IS 'Bobot penilaian dalam persen (total seluruh komponen = 100)';
COMMENT ON COLUMN ref.komponen_penilaian.penilai IS 'Siapa yang menilai: dpl, pamong, admin';

-- ----------------------------------------------------------------------------
-- ref.kriteria_pendaftaran — Kriteria/syarat pendaftaran KKN
-- ----------------------------------------------------------------------------
CREATE TABLE ref.kriteria_pendaftaran (
    id_kriteria         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_kriteria       VARCHAR(30)     NOT NULL,
    nm_kriteria         VARCHAR(200)    NOT NULL,
    deskripsi           TEXT            NULL,
    nilai_min           DECIMAL(10,2)   NULL,           -- misal: 100 SKS, 2.0 IPK
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_kriteria_pendaftaran_kode UNIQUE (kode_kriteria)
);

COMMENT ON TABLE ref.kriteria_pendaftaran IS 'Master kriteria/syarat pendaftaran KKN (MIN_SKS, MIN_IPK, LUNAS_UKT, MIN_SEMESTER, MAX_SEMESTER, STATUS_AKTIF)';
COMMENT ON COLUMN ref.kriteria_pendaftaran.kode_kriteria IS 'Kode unik kriteria: MIN_SKS, MIN_IPK, LUNAS_UKT, MIN_SEMESTER, MAX_SEMESTER, STATUS_AKTIF';
COMMENT ON COLUMN ref.kriteria_pendaftaran.nilai_min IS 'Nilai minimum yang harus dipenuhi, misal: 100 (SKS), 2.00 (IPK), 6 (semester)';


-- ############################################################################
-- SCHEMA: pendaftaran — Modul Pendaftaran KKN
-- ############################################################################

-- ----------------------------------------------------------------------------
-- pendaftaran.registrasi_kkn — Registrasi pendaftaran KKN mahasiswa
-- ----------------------------------------------------------------------------
CREATE TABLE pendaftaran.registrasi_kkn (
    id_registrasi       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_periode_kkn      UUID            NOT NULL,
    id_pemohon          UUID            NOT NULL,       -- ref pdut: man_akses.pengguna
    nomor_registrasi    VARCHAR(50)     NOT NULL,       -- auto: KKN-2026G-0001
    status              VARCHAR(30)     NOT NULL DEFAULT 'draft',
    pilihan_wilayah_1   UUID            NULL,
    pilihan_wilayah_2   UUID            NULL,
    alasan              TEXT            NULL,
    catatan_admin       TEXT            NULL,
    tgl_diajukan        TIMESTAMP       NULL,
    tgl_diproses        TIMESTAMP       NULL,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_registrasi_nomor UNIQUE (nomor_registrasi),
    CONSTRAINT fk_registrasi_periode FOREIGN KEY (id_periode_kkn)
        REFERENCES ref.periode_kkn (id_periode_kkn),
    CONSTRAINT fk_registrasi_wilayah_1 FOREIGN KEY (pilihan_wilayah_1)
        REFERENCES ref.wilayah_kkn (id_wilayah),
    CONSTRAINT fk_registrasi_wilayah_2 FOREIGN KEY (pilihan_wilayah_2)
        REFERENCES ref.wilayah_kkn (id_wilayah),
    CONSTRAINT ck_registrasi_status CHECK (
        status IN ('draft', 'diajukan', 'diterima', 'ditolak', 'mengundurkan_diri')
    )
);

COMMENT ON TABLE pendaftaran.registrasi_kkn IS 'Registrasi pendaftaran KKN mahasiswa';
COMMENT ON COLUMN pendaftaran.registrasi_kkn.id_pemohon IS 'UUID pemohon, referensi ke man_akses.pengguna di PDUT';
COMMENT ON COLUMN pendaftaran.registrasi_kkn.nomor_registrasi IS 'Nomor registrasi otomatis, format: KKN-2026G-0001';
COMMENT ON COLUMN pendaftaran.registrasi_kkn.status IS 'Status pendaftaran: draft, diajukan, diterima, ditolak, mengundurkan_diri';
COMMENT ON COLUMN pendaftaran.registrasi_kkn.pilihan_wilayah_1 IS 'Pilihan wilayah penempatan prioritas 1';
COMMENT ON COLUMN pendaftaran.registrasi_kkn.pilihan_wilayah_2 IS 'Pilihan wilayah penempatan prioritas 2';

-- ----------------------------------------------------------------------------
-- pendaftaran.data_pemohon — Snapshot data mahasiswa saat mendaftar
-- ----------------------------------------------------------------------------
CREATE TABLE pendaftaran.data_pemohon (
    id_data_pemohon     UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_registrasi       UUID            NOT NULL,
    id_mahasiswa        UUID            NOT NULL,       -- ref pdut: siakadu.peserta_didik
    nim                 VARCHAR(20)     NULL,
    nm_mahasiswa        VARCHAR(200)    NULL,
    tempat_lahir        VARCHAR(200)    NULL,
    tgl_lahir           DATE            NULL,
    jenis_kelamin       VARCHAR(1)      NULL,           -- L / P
    id_fakultas         UUID            NULL,
    nm_fakultas         VARCHAR(200)    NULL,
    id_prodi            UUID            NULL,
    nm_prodi            VARCHAR(200)    NULL,
    nm_jenjang          VARCHAR(50)     NULL,
    angkatan            INT             NULL,
    semester_aktif      INT             NULL,
    id_smt              VARCHAR(10)     NULL,           -- ref pdut: siakadu.semester
    ipk                 DECIMAL(4,2)    NULL,
    sks_lulus           INT             NULL,
    status_mahasiswa    VARCHAR(50)     NULL,
    status_pembayaran   VARCHAR(50)     NULL,           -- ref pdut: keuangan.spp_mhs
    no_hp               VARCHAR(20)     NULL,
    email               VARCHAR(200)    NULL,
    tgl_snapshot        TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_data_pemohon_registrasi UNIQUE (id_registrasi),
    CONSTRAINT fk_data_pemohon_registrasi FOREIGN KEY (id_registrasi)
        REFERENCES pendaftaran.registrasi_kkn (id_registrasi)
);

COMMENT ON TABLE pendaftaran.data_pemohon IS 'Snapshot data mahasiswa pada saat mendaftar KKN (diambil dari PDUT)';
COMMENT ON COLUMN pendaftaran.data_pemohon.id_mahasiswa IS 'UUID mahasiswa, referensi ke siakadu.peserta_didik di PDUT';
COMMENT ON COLUMN pendaftaran.data_pemohon.tgl_snapshot IS 'Waktu pengambilan snapshot data dari PDUT';
COMMENT ON COLUMN pendaftaran.data_pemohon.status_pembayaran IS 'Status pembayaran UKT dari keuangan.spp_mhs di PDUT';

-- ----------------------------------------------------------------------------
-- pendaftaran.verifikasi_syarat — Hasil verifikasi syarat pendaftaran
-- ----------------------------------------------------------------------------
CREATE TABLE pendaftaran.verifikasi_syarat (
    id_verifikasi       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_registrasi       UUID            NOT NULL,
    id_kriteria         UUID            NOT NULL,
    a_terpenuhi         BOOLEAN         NOT NULL,
    nilai_aktual        DECIMAL(10,2)   NULL,
    nilai_min           DECIMAL(10,2)   NULL,
    catatan             TEXT            NULL,
    tgl_verifikasi      TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- minimal audit (created_at only)
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_verifikasi_registrasi FOREIGN KEY (id_registrasi)
        REFERENCES pendaftaran.registrasi_kkn (id_registrasi),
    CONSTRAINT fk_verifikasi_kriteria FOREIGN KEY (id_kriteria)
        REFERENCES ref.kriteria_pendaftaran (id_kriteria)
);

COMMENT ON TABLE pendaftaran.verifikasi_syarat IS 'Hasil verifikasi otomatis syarat pendaftaran KKN per kriteria';
COMMENT ON COLUMN pendaftaran.verifikasi_syarat.a_terpenuhi IS 'Apakah kriteria terpenuhi';
COMMENT ON COLUMN pendaftaran.verifikasi_syarat.nilai_aktual IS 'Nilai aktual mahasiswa untuk kriteria ini';
COMMENT ON COLUMN pendaftaran.verifikasi_syarat.nilai_min IS 'Nilai minimum yang disyaratkan';


-- ############################################################################
-- SCHEMA: kelompok — Modul Kelompok KKN
-- ############################################################################

-- ----------------------------------------------------------------------------
-- kelompok.kelompok_kkn — Kelompok KKN
-- ----------------------------------------------------------------------------
CREATE TABLE kelompok.kelompok_kkn (
    id_kelompok         UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_periode_kkn      UUID            NOT NULL,
    id_lokasi           UUID            NULL,
    id_wilayah          UUID            NULL,
    kode_kelompok       VARCHAR(20)     NOT NULL,       -- KLP-2026G-001
    nm_kelompok         VARCHAR(200)    NULL,
    kuota               INT             NOT NULL DEFAULT 10,
    jumlah_anggota      INT             NOT NULL DEFAULT 0,
    status              VARCHAR(30)     NOT NULL DEFAULT 'dibentuk',
    catatan             TEXT            NULL,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_kelompok_kode UNIQUE (kode_kelompok),
    CONSTRAINT fk_kelompok_periode FOREIGN KEY (id_periode_kkn)
        REFERENCES ref.periode_kkn (id_periode_kkn),
    CONSTRAINT fk_kelompok_lokasi FOREIGN KEY (id_lokasi)
        REFERENCES ref.lokasi_kkn (id_lokasi),
    CONSTRAINT fk_kelompok_wilayah FOREIGN KEY (id_wilayah)
        REFERENCES ref.wilayah_kkn (id_wilayah),
    CONSTRAINT ck_kelompok_status CHECK (
        status IN ('dibentuk', 'aktif', 'selesai', 'dibatalkan')
    )
);

COMMENT ON TABLE kelompok.kelompok_kkn IS 'Kelompok KKN yang ditempatkan di suatu lokasi';
COMMENT ON COLUMN kelompok.kelompok_kkn.kode_kelompok IS 'Kode unik kelompok, format: KLP-2026G-001';
COMMENT ON COLUMN kelompok.kelompok_kkn.status IS 'Status kelompok: dibentuk, aktif, selesai, dibatalkan';
COMMENT ON COLUMN kelompok.kelompok_kkn.jumlah_anggota IS 'Jumlah anggota aktif saat ini (denormalisasi)';

-- ----------------------------------------------------------------------------
-- kelompok.anggota_kelompok — Anggota kelompok KKN
-- ----------------------------------------------------------------------------
CREATE TABLE kelompok.anggota_kelompok (
    id_anggota          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelompok         UUID            NOT NULL,
    id_registrasi       UUID            NOT NULL,
    id_mahasiswa        UUID            NOT NULL,       -- ref pdut: siakadu.peserta_didik
    peran               VARCHAR(20)     NOT NULL DEFAULT 'anggota',
    tgl_bergabung       TIMESTAMP       NOT NULL DEFAULT NOW(),
    tgl_keluar          TIMESTAMP       NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'aktif',

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_anggota_kelompok_mhs UNIQUE (id_kelompok, id_mahasiswa),
    CONSTRAINT fk_anggota_kelompok FOREIGN KEY (id_kelompok)
        REFERENCES kelompok.kelompok_kkn (id_kelompok),
    CONSTRAINT fk_anggota_registrasi FOREIGN KEY (id_registrasi)
        REFERENCES pendaftaran.registrasi_kkn (id_registrasi),
    CONSTRAINT ck_anggota_peran CHECK (
        peran IN ('ketua', 'sekretaris', 'bendahara', 'anggota')
    ),
    CONSTRAINT ck_anggota_status CHECK (
        status IN ('aktif', 'keluar', 'pindah')
    )
);

COMMENT ON TABLE kelompok.anggota_kelompok IS 'Anggota kelompok KKN beserta peran';
COMMENT ON COLUMN kelompok.anggota_kelompok.id_mahasiswa IS 'UUID mahasiswa, referensi ke siakadu.peserta_didik di PDUT';
COMMENT ON COLUMN kelompok.anggota_kelompok.peran IS 'Peran dalam kelompok: ketua, sekretaris, bendahara, anggota';
COMMENT ON COLUMN kelompok.anggota_kelompok.status IS 'Status keanggotaan: aktif, keluar, pindah';

-- ----------------------------------------------------------------------------
-- kelompok.dpl_kelompok — Dosen Pembimbing Lapangan (DPL) kelompok
-- ----------------------------------------------------------------------------
CREATE TABLE kelompok.dpl_kelompok (
    id_dpl              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelompok         UUID            NOT NULL,
    id_dosen            UUID            NOT NULL,       -- ref pdut: man_akses.pengguna
    nm_dosen            VARCHAR(200)    NULL,
    nidn                VARCHAR(20)     NULL,
    peran               VARCHAR(20)     NOT NULL DEFAULT 'pembimbing',
    no_hp               VARCHAR(20)     NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_dpl_kelompok_dosen UNIQUE (id_kelompok, id_dosen),
    CONSTRAINT fk_dpl_kelompok FOREIGN KEY (id_kelompok)
        REFERENCES kelompok.kelompok_kkn (id_kelompok),
    CONSTRAINT ck_dpl_peran CHECK (
        peran IN ('pembimbing', 'pendamping')
    )
);

COMMENT ON TABLE kelompok.dpl_kelompok IS 'Dosen Pembimbing Lapangan (DPL) yang ditugaskan ke kelompok KKN';
COMMENT ON COLUMN kelompok.dpl_kelompok.id_dosen IS 'UUID dosen, referensi ke man_akses.pengguna di PDUT';
COMMENT ON COLUMN kelompok.dpl_kelompok.peran IS 'Peran DPL: pembimbing, pendamping';

-- ----------------------------------------------------------------------------
-- kelompok.pamong_desa — Pamong desa pendamping kelompok
-- ----------------------------------------------------------------------------
CREATE TABLE kelompok.pamong_desa (
    id_pamong           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelompok         UUID            NOT NULL,
    nm_pamong           VARCHAR(200)    NOT NULL,
    jabatan             VARCHAR(100)    NULL,
    no_hp               VARCHAR(20)     NULL,
    alamat              TEXT            NULL,
    a_aktif             BOOLEAN         NOT NULL DEFAULT TRUE,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_pamong_kelompok FOREIGN KEY (id_kelompok)
        REFERENCES kelompok.kelompok_kkn (id_kelompok)
);

COMMENT ON TABLE kelompok.pamong_desa IS 'Pamong desa yang mendampingi kelompok KKN di lokasi';
COMMENT ON COLUMN kelompok.pamong_desa.nm_pamong IS 'Nama lengkap pamong desa';
COMMENT ON COLUMN kelompok.pamong_desa.jabatan IS 'Jabatan pamong di desa';


-- ############################################################################
-- SCHEMA: kegiatan — Modul Kegiatan Lapangan
-- ############################################################################

-- ----------------------------------------------------------------------------
-- kegiatan.program_kerja — Program kerja kelompok KKN
-- ----------------------------------------------------------------------------
CREATE TABLE kegiatan.program_kerja (
    id_proker           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelompok         UUID            NOT NULL,
    judul               VARCHAR(300)    NOT NULL,
    deskripsi           TEXT            NULL,
    bidang              VARCHAR(50)     NULL,
    tgl_mulai           DATE            NULL,
    tgl_selesai         DATE            NULL,
    status              VARCHAR(20)     NOT NULL DEFAULT 'rencana',
    sasaran             TEXT            NULL,
    target              TEXT            NULL,
    realisasi           TEXT            NULL,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_proker_kelompok FOREIGN KEY (id_kelompok)
        REFERENCES kelompok.kelompok_kkn (id_kelompok),
    CONSTRAINT ck_proker_bidang CHECK (
        bidang IS NULL OR bidang IN ('pendidikan', 'kesehatan', 'ekonomi', 'infrastruktur', 'sosial_budaya', 'lingkungan')
    ),
    CONSTRAINT ck_proker_status CHECK (
        status IN ('rencana', 'berjalan', 'selesai', 'batal')
    )
);

COMMENT ON TABLE kegiatan.program_kerja IS 'Program kerja kelompok KKN di lokasi penempatan';
COMMENT ON COLUMN kegiatan.program_kerja.bidang IS 'Bidang proker: pendidikan, kesehatan, ekonomi, infrastruktur, sosial_budaya, lingkungan';
COMMENT ON COLUMN kegiatan.program_kerja.status IS 'Status proker: rencana, berjalan, selesai, batal';

-- ----------------------------------------------------------------------------
-- kegiatan.logbook_harian — Logbook harian anggota KKN
-- ----------------------------------------------------------------------------
CREATE TABLE kegiatan.logbook_harian (
    id_logbook          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_anggota          UUID            NOT NULL,
    tgl_kegiatan        DATE            NOT NULL,
    jam_mulai           TIME            NULL,
    jam_selesai         TIME            NULL,
    uraian_kegiatan     TEXT            NOT NULL,
    hasil               TEXT            NULL,
    kendala             TEXT            NULL,
    path_foto           VARCHAR(1000)   NULL,           -- MinIO: siknila/logbook/{id}/{filename}
    status              VARCHAR(20)     NOT NULL DEFAULT 'draft',
    catatan_dpl         TEXT            NULL,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_logbook_anggota FOREIGN KEY (id_anggota)
        REFERENCES kelompok.anggota_kelompok (id_anggota),
    CONSTRAINT ck_logbook_status CHECK (
        status IN ('draft', 'diajukan', 'disetujui_dpl')
    )
);

COMMENT ON TABLE kegiatan.logbook_harian IS 'Logbook harian kegiatan anggota KKN';
COMMENT ON COLUMN kegiatan.logbook_harian.path_foto IS 'Path foto dokumentasi di MinIO (siknila/logbook/{id}/{filename})';
COMMENT ON COLUMN kegiatan.logbook_harian.status IS 'Status logbook: draft, diajukan, disetujui_dpl';
COMMENT ON COLUMN kegiatan.logbook_harian.catatan_dpl IS 'Catatan/feedback dari DPL';

-- ----------------------------------------------------------------------------
-- kegiatan.laporan_kelompok — Laporan kelompok KKN
-- ----------------------------------------------------------------------------
CREATE TABLE kegiatan.laporan_kelompok (
    id_laporan          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelompok         UUID            NOT NULL,
    jenis_laporan       VARCHAR(30)     NULL,
    judul               VARCHAR(300)    NULL,
    deskripsi           TEXT            NULL,
    path_file           VARCHAR(1000)   NOT NULL,       -- MinIO: siknila/laporan/{id}/{filename}
    status              VARCHAR(20)     NOT NULL DEFAULT 'draft',
    catatan_reviewer    TEXT            NULL,
    id_reviewer         UUID            NULL,           -- ref pdut: man_akses.pengguna
    tgl_submit          TIMESTAMP       NULL,
    tgl_review          TIMESTAMP       NULL,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_laporan_kelompok FOREIGN KEY (id_kelompok)
        REFERENCES kelompok.kelompok_kkn (id_kelompok),
    CONSTRAINT ck_laporan_jenis CHECK (
        jenis_laporan IS NULL OR jenis_laporan IN ('proposal', 'laporan_mingguan', 'laporan_akhir')
    ),
    CONSTRAINT ck_laporan_status CHECK (
        status IN ('draft', 'diajukan', 'direvisi', 'disetujui')
    )
);

COMMENT ON TABLE kegiatan.laporan_kelompok IS 'Laporan kelompok KKN (proposal, mingguan, akhir)';
COMMENT ON COLUMN kegiatan.laporan_kelompok.jenis_laporan IS 'Jenis laporan: proposal, laporan_mingguan, laporan_akhir';
COMMENT ON COLUMN kegiatan.laporan_kelompok.path_file IS 'Path file laporan di MinIO (siknila/laporan/{id}/{filename})';
COMMENT ON COLUMN kegiatan.laporan_kelompok.status IS 'Status review: draft, diajukan, direvisi, disetujui';
COMMENT ON COLUMN kegiatan.laporan_kelompok.id_reviewer IS 'UUID reviewer/DPL, referensi ke man_akses.pengguna di PDUT';

-- ----------------------------------------------------------------------------
-- kegiatan.absensi — Absensi harian anggota KKN
-- ----------------------------------------------------------------------------
CREATE TABLE kegiatan.absensi (
    id_absensi          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_anggota          UUID            NOT NULL,
    tgl_absensi         DATE            NOT NULL,
    status_hadir        VARCHAR(20)     NOT NULL DEFAULT 'hadir',
    keterangan          TEXT            NULL,
    path_bukti          VARCHAR(1000)   NULL,           -- MinIO: siknila/foto/{id}/{filename}
    jam_datang          TIME            NULL,
    jam_pulang          TIME            NULL,

    -- minimal audit (created_at only)
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_absensi_anggota_tanggal UNIQUE (id_anggota, tgl_absensi),
    CONSTRAINT fk_absensi_anggota FOREIGN KEY (id_anggota)
        REFERENCES kelompok.anggota_kelompok (id_anggota),
    CONSTRAINT ck_absensi_status CHECK (
        status_hadir IN ('hadir', 'izin', 'sakit', 'alpha')
    )
);

COMMENT ON TABLE kegiatan.absensi IS 'Absensi/kehadiran harian anggota KKN';
COMMENT ON COLUMN kegiatan.absensi.status_hadir IS 'Status kehadiran: hadir, izin, sakit, alpha';
COMMENT ON COLUMN kegiatan.absensi.path_bukti IS 'Path bukti absensi di MinIO (foto/surat)';

-- ----------------------------------------------------------------------------
-- kegiatan.catatan_bimbingan — Catatan bimbingan DPL ke kelompok
-- ----------------------------------------------------------------------------
CREATE TABLE kegiatan.catatan_bimbingan (
    id_catatan          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_kelompok         UUID            NOT NULL,
    id_dpl              UUID            NOT NULL,
    tgl_bimbingan       DATE            NOT NULL,
    jenis               VARCHAR(20)     NULL,
    materi              TEXT            NOT NULL,
    catatan             TEXT            NULL,
    rekomendasi         TEXT            NULL,
    path_dokumentasi    VARCHAR(1000)   NULL,           -- MinIO: siknila/bimbingan/{id}/{filename}

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_bimbingan_kelompok FOREIGN KEY (id_kelompok)
        REFERENCES kelompok.kelompok_kkn (id_kelompok),
    CONSTRAINT fk_bimbingan_dpl FOREIGN KEY (id_dpl)
        REFERENCES kelompok.dpl_kelompok (id_dpl),
    CONSTRAINT ck_bimbingan_jenis CHECK (
        jenis IS NULL OR jenis IN ('kunjungan', 'online', 'telepon')
    )
);

COMMENT ON TABLE kegiatan.catatan_bimbingan IS 'Catatan bimbingan/kunjungan DPL ke kelompok KKN';
COMMENT ON COLUMN kegiatan.catatan_bimbingan.jenis IS 'Jenis bimbingan: kunjungan, online, telepon';
COMMENT ON COLUMN kegiatan.catatan_bimbingan.path_dokumentasi IS 'Path dokumentasi bimbingan di MinIO (siknila/bimbingan/{id}/{filename})';


-- ############################################################################
-- SCHEMA: penilaian — Modul Penilaian KKN
-- ############################################################################

-- ----------------------------------------------------------------------------
-- penilaian.nilai_mahasiswa — Nilai per komponen penilaian
-- ----------------------------------------------------------------------------
CREATE TABLE penilaian.nilai_mahasiswa (
    id_nilai            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_anggota          UUID            NOT NULL,
    id_komponen         UUID            NOT NULL,
    nilai               DECIMAL(5,2)    NOT NULL,
    catatan             TEXT            NULL,
    id_penilai          UUID            NOT NULL,       -- ref pdut: man_akses.pengguna
    tgl_penilaian       TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_nilai_anggota_komponen UNIQUE (id_anggota, id_komponen),
    CONSTRAINT fk_nilai_anggota FOREIGN KEY (id_anggota)
        REFERENCES kelompok.anggota_kelompok (id_anggota),
    CONSTRAINT fk_nilai_komponen FOREIGN KEY (id_komponen)
        REFERENCES ref.komponen_penilaian (id_komponen),
    CONSTRAINT ck_nilai_range CHECK (nilai >= 0 AND nilai <= 100)
);

COMMENT ON TABLE penilaian.nilai_mahasiswa IS 'Nilai mahasiswa per komponen penilaian KKN';
COMMENT ON COLUMN penilaian.nilai_mahasiswa.id_penilai IS 'UUID penilai (DPL/pamong/admin), referensi ke man_akses.pengguna di PDUT';
COMMENT ON COLUMN penilaian.nilai_mahasiswa.nilai IS 'Nilai komponen, range 0-100';

-- ----------------------------------------------------------------------------
-- penilaian.nilai_akhir — Nilai akhir / rekapitulasi KKN
-- ----------------------------------------------------------------------------
CREATE TABLE penilaian.nilai_akhir (
    id_nilai_akhir      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_anggota          UUID            NOT NULL,
    nilai_angka         DECIMAL(5,2)    NULL,
    nilai_huruf         VARCHAR(2)      NULL,           -- A, AB, B, BC, C, D, E
    bobot_mutu          DECIMAL(3,2)    NULL,           -- 4.00, 3.50, 3.00, 2.50, 2.00, 1.00, 0.00
    a_lulus             BOOLEAN         NOT NULL DEFAULT FALSE,
    catatan             TEXT            NULL,
    id_penilai          UUID            NULL,           -- ref pdut: man_akses.pengguna
    tgl_finalisasi      TIMESTAMP       NULL,

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_nilai_akhir_anggota UNIQUE (id_anggota),
    CONSTRAINT fk_nilai_akhir_anggota FOREIGN KEY (id_anggota)
        REFERENCES kelompok.anggota_kelompok (id_anggota),
    CONSTRAINT ck_nilai_huruf CHECK (
        nilai_huruf IS NULL OR nilai_huruf IN ('A', 'AB', 'B', 'BC', 'C', 'D', 'E')
    )
);

COMMENT ON TABLE penilaian.nilai_akhir IS 'Nilai akhir / rekapitulasi KKN mahasiswa';
COMMENT ON COLUMN penilaian.nilai_akhir.nilai_huruf IS 'Nilai huruf: A, AB, B, BC, C, D, E';
COMMENT ON COLUMN penilaian.nilai_akhir.bobot_mutu IS 'Bobot mutu: A=4.00, AB=3.50, B=3.00, BC=2.50, C=2.00, D=1.00, E=0.00';
COMMENT ON COLUMN penilaian.nilai_akhir.a_lulus IS 'Apakah mahasiswa dinyatakan lulus KKN';

-- ----------------------------------------------------------------------------
-- penilaian.penilaian_pamong — Penilaian dari pamong desa
-- ----------------------------------------------------------------------------
CREATE TABLE penilaian.penilaian_pamong (
    id_penilaian_pamong UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_anggota          UUID            NOT NULL,
    id_pamong           UUID            NOT NULL,
    nilai_kehadiran     INT             NULL,
    nilai_partisipasi   INT             NULL,
    nilai_sikap         INT             NULL,
    nilai_kontribusi    INT             NULL,
    catatan             TEXT            NULL,
    tgl_penilaian       TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_penilaian_pamong UNIQUE (id_anggota, id_pamong),
    CONSTRAINT fk_penilaian_pamong_anggota FOREIGN KEY (id_anggota)
        REFERENCES kelompok.anggota_kelompok (id_anggota),
    CONSTRAINT fk_penilaian_pamong_pamong FOREIGN KEY (id_pamong)
        REFERENCES kelompok.pamong_desa (id_pamong),
    CONSTRAINT ck_pamong_kehadiran CHECK (nilai_kehadiran IS NULL OR (nilai_kehadiran >= 1 AND nilai_kehadiran <= 5)),
    CONSTRAINT ck_pamong_partisipasi CHECK (nilai_partisipasi IS NULL OR (nilai_partisipasi >= 1 AND nilai_partisipasi <= 5)),
    CONSTRAINT ck_pamong_sikap CHECK (nilai_sikap IS NULL OR (nilai_sikap >= 1 AND nilai_sikap <= 5)),
    CONSTRAINT ck_pamong_kontribusi CHECK (nilai_kontribusi IS NULL OR (nilai_kontribusi >= 1 AND nilai_kontribusi <= 5))
);

COMMENT ON TABLE penilaian.penilaian_pamong IS 'Penilaian dari pamong desa terhadap anggota KKN (skala 1-5)';
COMMENT ON COLUMN penilaian.penilaian_pamong.nilai_kehadiran IS 'Nilai kehadiran dari pamong, skala 1-5';
COMMENT ON COLUMN penilaian.penilaian_pamong.nilai_partisipasi IS 'Nilai partisipasi dari pamong, skala 1-5';
COMMENT ON COLUMN penilaian.penilaian_pamong.nilai_sikap IS 'Nilai sikap dari pamong, skala 1-5';
COMMENT ON COLUMN penilaian.penilaian_pamong.nilai_kontribusi IS 'Nilai kontribusi dari pamong, skala 1-5';


-- ############################################################################
-- SCHEMA: dokumen — Modul Dokumen & Sertifikat
-- ############################################################################

-- ----------------------------------------------------------------------------
-- dokumen.dokumen_kkn — Dokumen-dokumen KKN
-- ----------------------------------------------------------------------------
CREATE TABLE dokumen.dokumen_kkn (
    id_dokumen          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_jenis_dokumen    UUID            NOT NULL,
    id_kelompok         UUID            NULL,
    id_anggota          UUID            NULL,
    nm_dokumen          VARCHAR(200)    NULL,
    nama_file_asli      VARCHAR(500)    NULL,
    path_file           VARCHAR(1000)   NOT NULL,       -- MinIO: siknila/dokumen/{context}/{id}/{filename}
    tipe_file           VARCHAR(100)    NULL,
    ukuran_byte         BIGINT          NULL,
    id_pengunggah       UUID            NOT NULL,       -- ref pdut: man_akses.pengguna
    keterangan          TEXT            NULL,
    tgl_upload          TIMESTAMP       NOT NULL DEFAULT NOW(),

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_dokumen_jenis FOREIGN KEY (id_jenis_dokumen)
        REFERENCES ref.jenis_dokumen (id_jenis_dokumen),
    CONSTRAINT fk_dokumen_kelompok FOREIGN KEY (id_kelompok)
        REFERENCES kelompok.kelompok_kkn (id_kelompok),
    CONSTRAINT fk_dokumen_anggota FOREIGN KEY (id_anggota)
        REFERENCES kelompok.anggota_kelompok (id_anggota)
);

COMMENT ON TABLE dokumen.dokumen_kkn IS 'Dokumen KKN yang diunggah ke MinIO (siknila/dokumen/{context}/{id}/{filename})';
COMMENT ON COLUMN dokumen.dokumen_kkn.id_pengunggah IS 'UUID pengunggah, referensi ke man_akses.pengguna di PDUT';
COMMENT ON COLUMN dokumen.dokumen_kkn.path_file IS 'Path file di MinIO bucket myunila-storage';
COMMENT ON COLUMN dokumen.dokumen_kkn.ukuran_byte IS 'Ukuran file dalam byte';

-- ----------------------------------------------------------------------------
-- dokumen.sertifikat — Sertifikat kelulusan KKN
-- ----------------------------------------------------------------------------
CREATE TABLE dokumen.sertifikat (
    id_sertifikat       UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_anggota          UUID            NOT NULL,
    id_periode_kkn      UUID            NOT NULL,
    nomor_sertifikat    VARCHAR(100)    NOT NULL,
    tgl_terbit          DATE            NULL,
    path_file           VARCHAR(1000)   NOT NULL,       -- MinIO: siknila/sertifikat/{id}/{filename}
    a_final             BOOLEAN         NOT NULL DEFAULT FALSE,
    id_penerbit         UUID            NOT NULL,       -- ref pdut: man_akses.pengguna

    -- audit columns
    id_creator          UUID            NULL,
    id_updater          UUID            NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    soft_delete         BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT uq_sertifikat_anggota UNIQUE (id_anggota),
    CONSTRAINT uq_sertifikat_nomor UNIQUE (nomor_sertifikat),
    CONSTRAINT fk_sertifikat_anggota FOREIGN KEY (id_anggota)
        REFERENCES kelompok.anggota_kelompok (id_anggota),
    CONSTRAINT fk_sertifikat_periode FOREIGN KEY (id_periode_kkn)
        REFERENCES ref.periode_kkn (id_periode_kkn)
);

COMMENT ON TABLE dokumen.sertifikat IS 'Sertifikat kelulusan KKN mahasiswa';
COMMENT ON COLUMN dokumen.sertifikat.nomor_sertifikat IS 'Nomor sertifikat unik';
COMMENT ON COLUMN dokumen.sertifikat.path_file IS 'Path file sertifikat di MinIO (siknila/sertifikat/{id}/{filename})';
COMMENT ON COLUMN dokumen.sertifikat.a_final IS 'Apakah sertifikat sudah final dan tidak dapat diubah';
COMMENT ON COLUMN dokumen.sertifikat.id_penerbit IS 'UUID penerbit sertifikat, referensi ke man_akses.pengguna di PDUT';


-- ############################################################################
-- SCHEMA: log — Audit Trail & Logging
-- ############################################################################

-- ----------------------------------------------------------------------------
-- log.jejak_audit — Jejak audit aktivitas pengguna
-- ----------------------------------------------------------------------------
CREATE TABLE log.jejak_audit (
    id_jejak            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pengguna         UUID            NULL,           -- ref pdut: man_akses.pengguna
    nm_pengguna         VARCHAR(200)    NULL,
    aksi                VARCHAR(50)     NOT NULL,       -- LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, EXPORT, dll
    modul               VARCHAR(100)    NULL,           -- nama modul/fitur
    deskripsi           TEXT            NULL,
    ip_address          VARCHAR(50)     NULL,
    user_agent          TEXT            NULL,
    data_sebelum        JSONB           NULL,
    data_sesudah        JSONB           NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE log.jejak_audit IS 'Jejak audit aktivitas pengguna di SIKNILA';
COMMENT ON COLUMN log.jejak_audit.aksi IS 'Jenis aksi: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, VIEW, EXPORT, dll';
COMMENT ON COLUMN log.jejak_audit.data_sebelum IS 'Snapshot data sebelum perubahan (JSONB)';
COMMENT ON COLUMN log.jejak_audit.data_sesudah IS 'Snapshot data sesudah perubahan (JSONB)';

-- ----------------------------------------------------------------------------
-- log.aktivitas_data — Log perubahan data otomatis via trigger
-- ----------------------------------------------------------------------------
CREATE TABLE log.aktivitas_data (
    id_aktivitas        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_tabel          VARCHAR(200)    NOT NULL,
    id_data             UUID            NULL,
    aksi                VARCHAR(10)     NOT NULL,       -- INSERT, UPDATE, DELETE
    data_lama           JSONB           NULL,
    data_baru           JSONB           NULL,
    id_pengguna         UUID            NULL,
    ip_address          VARCHAR(50)     NULL,
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE log.aktivitas_data IS 'Log perubahan data otomatis via trigger untuk seluruh tabel SIKNILA';
COMMENT ON COLUMN log.aktivitas_data.nama_tabel IS 'Nama tabel (schema.table) yang berubah';
COMMENT ON COLUMN log.aktivitas_data.id_data IS 'UUID primary key dari row yang berubah';
COMMENT ON COLUMN log.aktivitas_data.aksi IS 'Jenis operasi: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN log.aktivitas_data.data_lama IS 'Data sebelum perubahan (JSONB)';
COMMENT ON COLUMN log.aktivitas_data.data_baru IS 'Data sesudah perubahan (JSONB)';


-- ############################################################################
-- INDEXES
-- ############################################################################

-- ref.periode_kkn
CREATE INDEX idx_ref_periode_kkn_aktif ON ref.periode_kkn (a_aktif) WHERE soft_delete = FALSE;
CREATE INDEX idx_ref_periode_kkn_smt ON ref.periode_kkn (id_smt) WHERE soft_delete = FALSE;
CREATE INDEX idx_ref_periode_kkn_tahun ON ref.periode_kkn (tahun_akademik) WHERE soft_delete = FALSE;

-- ref.lokasi_kkn
CREATE INDEX idx_ref_lokasi_kkn_aktif ON ref.lokasi_kkn (a_aktif) WHERE soft_delete = FALSE;
CREATE INDEX idx_ref_lokasi_kkn_kabupaten ON ref.lokasi_kkn (nm_kabupaten) WHERE soft_delete = FALSE;
CREATE INDEX idx_ref_lokasi_kkn_kecamatan ON ref.lokasi_kkn (nm_kecamatan) WHERE soft_delete = FALSE;

-- ref.wilayah_kkn
CREATE INDEX idx_ref_wilayah_kkn_aktif ON ref.wilayah_kkn (a_aktif) WHERE soft_delete = FALSE;

-- ref.jenis_dokumen
CREATE INDEX idx_ref_jenis_dokumen_aktif ON ref.jenis_dokumen (urutan) WHERE soft_delete = FALSE;

-- ref.komponen_penilaian
CREATE INDEX idx_ref_komponen_penilaian_aktif ON ref.komponen_penilaian (a_aktif, urutan) WHERE soft_delete = FALSE;
CREATE INDEX idx_ref_komponen_penilaian_penilai ON ref.komponen_penilaian (penilai) WHERE soft_delete = FALSE;

-- ref.kriteria_pendaftaran
CREATE INDEX idx_ref_kriteria_pendaftaran_aktif ON ref.kriteria_pendaftaran (a_aktif) WHERE soft_delete = FALSE;

-- pendaftaran.registrasi_kkn
CREATE INDEX idx_pendaftaran_registrasi_periode ON pendaftaran.registrasi_kkn (id_periode_kkn) WHERE soft_delete = FALSE;
CREATE INDEX idx_pendaftaran_registrasi_pemohon ON pendaftaran.registrasi_kkn (id_pemohon) WHERE soft_delete = FALSE;
CREATE INDEX idx_pendaftaran_registrasi_status ON pendaftaran.registrasi_kkn (status) WHERE soft_delete = FALSE;
CREATE INDEX idx_pendaftaran_registrasi_wilayah1 ON pendaftaran.registrasi_kkn (pilihan_wilayah_1) WHERE soft_delete = FALSE;
CREATE INDEX idx_pendaftaran_registrasi_wilayah2 ON pendaftaran.registrasi_kkn (pilihan_wilayah_2) WHERE soft_delete = FALSE;

-- pendaftaran.data_pemohon
CREATE INDEX idx_pendaftaran_data_pemohon_mhs ON pendaftaran.data_pemohon (id_mahasiswa) WHERE soft_delete = FALSE;
CREATE INDEX idx_pendaftaran_data_pemohon_nim ON pendaftaran.data_pemohon (nim) WHERE soft_delete = FALSE;
CREATE INDEX idx_pendaftaran_data_pemohon_prodi ON pendaftaran.data_pemohon (id_prodi) WHERE soft_delete = FALSE;
CREATE INDEX idx_pendaftaran_data_pemohon_fakultas ON pendaftaran.data_pemohon (id_fakultas) WHERE soft_delete = FALSE;

-- pendaftaran.verifikasi_syarat
CREATE INDEX idx_pendaftaran_verifikasi_registrasi ON pendaftaran.verifikasi_syarat (id_registrasi);
CREATE INDEX idx_pendaftaran_verifikasi_kriteria ON pendaftaran.verifikasi_syarat (id_kriteria);
CREATE INDEX idx_pendaftaran_verifikasi_terpenuhi ON pendaftaran.verifikasi_syarat (a_terpenuhi);

-- kelompok.kelompok_kkn
CREATE INDEX idx_kelompok_kelompok_periode ON kelompok.kelompok_kkn (id_periode_kkn) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_kelompok_lokasi ON kelompok.kelompok_kkn (id_lokasi) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_kelompok_wilayah ON kelompok.kelompok_kkn (id_wilayah) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_kelompok_status ON kelompok.kelompok_kkn (status) WHERE soft_delete = FALSE;

-- kelompok.anggota_kelompok
CREATE INDEX idx_kelompok_anggota_kelompok ON kelompok.anggota_kelompok (id_kelompok) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_anggota_registrasi ON kelompok.anggota_kelompok (id_registrasi) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_anggota_mahasiswa ON kelompok.anggota_kelompok (id_mahasiswa) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_anggota_status ON kelompok.anggota_kelompok (status) WHERE soft_delete = FALSE;

-- kelompok.dpl_kelompok
CREATE INDEX idx_kelompok_dpl_kelompok ON kelompok.dpl_kelompok (id_kelompok) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_dpl_dosen ON kelompok.dpl_kelompok (id_dosen) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_dpl_aktif ON kelompok.dpl_kelompok (a_aktif) WHERE soft_delete = FALSE;

-- kelompok.pamong_desa
CREATE INDEX idx_kelompok_pamong_kelompok ON kelompok.pamong_desa (id_kelompok) WHERE soft_delete = FALSE;
CREATE INDEX idx_kelompok_pamong_aktif ON kelompok.pamong_desa (a_aktif) WHERE soft_delete = FALSE;

-- kegiatan.program_kerja
CREATE INDEX idx_kegiatan_proker_kelompok ON kegiatan.program_kerja (id_kelompok) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_proker_bidang ON kegiatan.program_kerja (bidang) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_proker_status ON kegiatan.program_kerja (status) WHERE soft_delete = FALSE;

-- kegiatan.logbook_harian
CREATE INDEX idx_kegiatan_logbook_anggota ON kegiatan.logbook_harian (id_anggota) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_logbook_tanggal ON kegiatan.logbook_harian (tgl_kegiatan) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_logbook_status ON kegiatan.logbook_harian (status) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_logbook_anggota_tgl ON kegiatan.logbook_harian (id_anggota, tgl_kegiatan) WHERE soft_delete = FALSE;

-- kegiatan.laporan_kelompok
CREATE INDEX idx_kegiatan_laporan_kelompok ON kegiatan.laporan_kelompok (id_kelompok) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_laporan_jenis ON kegiatan.laporan_kelompok (jenis_laporan) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_laporan_status ON kegiatan.laporan_kelompok (status) WHERE soft_delete = FALSE;

-- kegiatan.absensi
CREATE INDEX idx_kegiatan_absensi_anggota ON kegiatan.absensi (id_anggota);
CREATE INDEX idx_kegiatan_absensi_tanggal ON kegiatan.absensi (tgl_absensi);
CREATE INDEX idx_kegiatan_absensi_status ON kegiatan.absensi (status_hadir);

-- kegiatan.catatan_bimbingan
CREATE INDEX idx_kegiatan_bimbingan_kelompok ON kegiatan.catatan_bimbingan (id_kelompok) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_bimbingan_dpl ON kegiatan.catatan_bimbingan (id_dpl) WHERE soft_delete = FALSE;
CREATE INDEX idx_kegiatan_bimbingan_tanggal ON kegiatan.catatan_bimbingan (tgl_bimbingan) WHERE soft_delete = FALSE;

-- penilaian.nilai_mahasiswa
CREATE INDEX idx_penilaian_nilai_anggota ON penilaian.nilai_mahasiswa (id_anggota) WHERE soft_delete = FALSE;
CREATE INDEX idx_penilaian_nilai_komponen ON penilaian.nilai_mahasiswa (id_komponen) WHERE soft_delete = FALSE;
CREATE INDEX idx_penilaian_nilai_penilai ON penilaian.nilai_mahasiswa (id_penilai) WHERE soft_delete = FALSE;

-- penilaian.nilai_akhir
CREATE INDEX idx_penilaian_nilai_akhir_lulus ON penilaian.nilai_akhir (a_lulus) WHERE soft_delete = FALSE;
CREATE INDEX idx_penilaian_nilai_akhir_huruf ON penilaian.nilai_akhir (nilai_huruf) WHERE soft_delete = FALSE;

-- penilaian.penilaian_pamong
CREATE INDEX idx_penilaian_pamong_anggota ON penilaian.penilaian_pamong (id_anggota) WHERE soft_delete = FALSE;
CREATE INDEX idx_penilaian_pamong_pamong ON penilaian.penilaian_pamong (id_pamong) WHERE soft_delete = FALSE;

-- dokumen.dokumen_kkn
CREATE INDEX idx_dokumen_dokumen_jenis ON dokumen.dokumen_kkn (id_jenis_dokumen) WHERE soft_delete = FALSE;
CREATE INDEX idx_dokumen_dokumen_kelompok ON dokumen.dokumen_kkn (id_kelompok) WHERE soft_delete = FALSE;
CREATE INDEX idx_dokumen_dokumen_anggota ON dokumen.dokumen_kkn (id_anggota) WHERE soft_delete = FALSE;
CREATE INDEX idx_dokumen_dokumen_pengunggah ON dokumen.dokumen_kkn (id_pengunggah) WHERE soft_delete = FALSE;

-- dokumen.sertifikat
CREATE INDEX idx_dokumen_sertifikat_periode ON dokumen.sertifikat (id_periode_kkn) WHERE soft_delete = FALSE;
CREATE INDEX idx_dokumen_sertifikat_final ON dokumen.sertifikat (a_final) WHERE soft_delete = FALSE;

-- log.jejak_audit
CREATE INDEX idx_log_jejak_pengguna ON log.jejak_audit (id_pengguna);
CREATE INDEX idx_log_jejak_aksi ON log.jejak_audit (aksi);
CREATE INDEX idx_log_jejak_modul ON log.jejak_audit (modul);
CREATE INDEX idx_log_jejak_created ON log.jejak_audit (created_at);

-- log.aktivitas_data
CREATE INDEX idx_log_aktivitas_tabel ON log.aktivitas_data (nama_tabel);
CREATE INDEX idx_log_aktivitas_aksi ON log.aktivitas_data (aksi);
CREATE INDEX idx_log_aktivitas_pengguna ON log.aktivitas_data (id_pengguna);
CREATE INDEX idx_log_aktivitas_created ON log.aktivitas_data (created_at);
CREATE INDEX idx_log_aktivitas_id_data ON log.aktivitas_data (id_data);


-- ############################################################################
-- FUNCTIONS & TRIGGERS
-- ############################################################################

-- ----------------------------------------------------------------------------
-- Fungsi: trigger_set_updated_at()
-- Otomatis mengisi kolom updated_at saat UPDATE
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION trigger_set_updated_at() IS 'Trigger function: otomatis mengisi updated_at = NOW() pada setiap UPDATE';

-- ----------------------------------------------------------------------------
-- Fungsi: log.fn_catat_aktivitas_data()
-- Mencatat setiap perubahan data ke log.aktivitas_data
-- Menggunakan session context siknila.id_pengguna dan siknila.ip_address
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log.fn_catat_aktivitas_data()
RETURNS TRIGGER AS $$
DECLARE
    v_id_pengguna   UUID;
    v_ip_address    VARCHAR(50);
    v_id_data       UUID;
    v_aksi          VARCHAR(10);
    v_data_lama     JSONB;
    v_data_baru     JSONB;
BEGIN
    -- Ambil context session
    BEGIN
        v_id_pengguna := current_setting('siknila.id_pengguna', TRUE)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_id_pengguna := NULL;
    END;

    BEGIN
        v_ip_address := current_setting('siknila.ip_address', TRUE);
    EXCEPTION WHEN OTHERS THEN
        v_ip_address := NULL;
    END;

    -- Tentukan aksi dan data
    IF TG_OP = 'INSERT' THEN
        v_aksi := 'INSERT';
        v_data_lama := NULL;
        v_data_baru := to_jsonb(NEW);
        v_id_data := NEW.id_periode_kkn; -- fallback, akan di-override
    ELSIF TG_OP = 'UPDATE' THEN
        v_aksi := 'UPDATE';
        v_data_lama := to_jsonb(OLD);
        v_data_baru := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_aksi := 'DELETE';
        v_data_lama := to_jsonb(OLD);
        v_data_baru := NULL;
    END IF;

    -- Ambil PK UUID dari kolom pertama (konvensi: kolom pertama = PK)
    IF TG_OP = 'DELETE' THEN
        v_id_data := (to_jsonb(OLD) ->> (
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position LIMIT 1
        ))::UUID;
    ELSE
        v_id_data := (to_jsonb(NEW) ->> (
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = TG_TABLE_SCHEMA AND table_name = TG_TABLE_NAME
            ORDER BY ordinal_position LIMIT 1
        ))::UUID;
    END IF;

    -- Simpan ke log
    INSERT INTO log.aktivitas_data (
        nama_tabel, id_data, aksi, data_lama, data_baru, id_pengguna, ip_address
    ) VALUES (
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        v_id_data,
        v_aksi,
        v_data_lama,
        v_data_baru,
        v_id_pengguna,
        v_ip_address
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION log.fn_catat_aktivitas_data() IS 'Trigger function: mencatat perubahan data ke log.aktivitas_data dengan session context siknila.id_pengguna / siknila.ip_address';


-- ############################################################################
-- APPLY TRIGGERS — trigger_set_updated_at
-- Diterapkan ke semua tabel yang memiliki kolom updated_at
-- ############################################################################

-- ref schema
CREATE TRIGGER trg_periode_kkn_set_updated_at
    BEFORE UPDATE ON ref.periode_kkn
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_lokasi_kkn_set_updated_at
    BEFORE UPDATE ON ref.lokasi_kkn
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_wilayah_kkn_set_updated_at
    BEFORE UPDATE ON ref.wilayah_kkn
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_jenis_dokumen_set_updated_at
    BEFORE UPDATE ON ref.jenis_dokumen
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_komponen_penilaian_set_updated_at
    BEFORE UPDATE ON ref.komponen_penilaian
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_kriteria_pendaftaran_set_updated_at
    BEFORE UPDATE ON ref.kriteria_pendaftaran
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- pendaftaran schema
CREATE TRIGGER trg_registrasi_kkn_set_updated_at
    BEFORE UPDATE ON pendaftaran.registrasi_kkn
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_data_pemohon_set_updated_at
    BEFORE UPDATE ON pendaftaran.data_pemohon
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- pendaftaran.verifikasi_syarat: created_at only, no updated_at trigger

-- kelompok schema
CREATE TRIGGER trg_kelompok_kkn_set_updated_at
    BEFORE UPDATE ON kelompok.kelompok_kkn
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_anggota_kelompok_set_updated_at
    BEFORE UPDATE ON kelompok.anggota_kelompok
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_dpl_kelompok_set_updated_at
    BEFORE UPDATE ON kelompok.dpl_kelompok
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_pamong_desa_set_updated_at
    BEFORE UPDATE ON kelompok.pamong_desa
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- kegiatan schema
CREATE TRIGGER trg_program_kerja_set_updated_at
    BEFORE UPDATE ON kegiatan.program_kerja
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_logbook_harian_set_updated_at
    BEFORE UPDATE ON kegiatan.logbook_harian
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_laporan_kelompok_set_updated_at
    BEFORE UPDATE ON kegiatan.laporan_kelompok
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- kegiatan.absensi: created_at only, no updated_at trigger

CREATE TRIGGER trg_catatan_bimbingan_set_updated_at
    BEFORE UPDATE ON kegiatan.catatan_bimbingan
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- penilaian schema
CREATE TRIGGER trg_nilai_mahasiswa_set_updated_at
    BEFORE UPDATE ON penilaian.nilai_mahasiswa
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_nilai_akhir_set_updated_at
    BEFORE UPDATE ON penilaian.nilai_akhir
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_penilaian_pamong_set_updated_at
    BEFORE UPDATE ON penilaian.penilaian_pamong
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- dokumen schema
CREATE TRIGGER trg_dokumen_kkn_set_updated_at
    BEFORE UPDATE ON dokumen.dokumen_kkn
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER trg_sertifikat_set_updated_at
    BEFORE UPDATE ON dokumen.sertifikat
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();


-- ############################################################################
-- APPLY TRIGGERS — log.fn_catat_aktivitas_data
-- Diterapkan ke semua tabel (kecuali log schema sendiri)
-- ############################################################################

-- ref schema
CREATE TRIGGER trg_periode_kkn_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON ref.periode_kkn
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_lokasi_kkn_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON ref.lokasi_kkn
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_wilayah_kkn_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON ref.wilayah_kkn
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_jenis_dokumen_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON ref.jenis_dokumen
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_komponen_penilaian_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON ref.komponen_penilaian
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_kriteria_pendaftaran_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON ref.kriteria_pendaftaran
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

-- pendaftaran schema
CREATE TRIGGER trg_registrasi_kkn_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON pendaftaran.registrasi_kkn
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_data_pemohon_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON pendaftaran.data_pemohon
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_verifikasi_syarat_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON pendaftaran.verifikasi_syarat
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

-- kelompok schema
CREATE TRIGGER trg_kelompok_kkn_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kelompok.kelompok_kkn
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_anggota_kelompok_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kelompok.anggota_kelompok
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_dpl_kelompok_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kelompok.dpl_kelompok
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_pamong_desa_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kelompok.pamong_desa
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

-- kegiatan schema
CREATE TRIGGER trg_program_kerja_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kegiatan.program_kerja
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_logbook_harian_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kegiatan.logbook_harian
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_laporan_kelompok_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kegiatan.laporan_kelompok
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_absensi_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kegiatan.absensi
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_catatan_bimbingan_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON kegiatan.catatan_bimbingan
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

-- penilaian schema
CREATE TRIGGER trg_nilai_mahasiswa_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON penilaian.nilai_mahasiswa
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_nilai_akhir_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON penilaian.nilai_akhir
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_penilaian_pamong_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON penilaian.penilaian_pamong
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

-- dokumen schema
CREATE TRIGGER trg_dokumen_kkn_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON dokumen.dokumen_kkn
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();

CREATE TRIGGER trg_sertifikat_catat_aktivitas
    AFTER INSERT OR UPDATE OR DELETE ON dokumen.sertifikat
    FOR EACH ROW EXECUTE FUNCTION log.fn_catat_aktivitas_data();


-- ############################################################################
-- ARCHITECTURE DIAGRAM & STATISTICS
-- ############################################################################

/*
================================================================================
ARSITEKTUR DATABASE SIKNILA
Sistem Informasi Kuliah Kerja Nyata — Universitas Lampung
================================================================================

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE: siknila (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────── SCHEMA: ref (6 tabel) ──────────────────────────┐        │
│  │  periode_kkn          — Periode pelaksanaan KKN                │        │
│  │  lokasi_kkn           — Lokasi penempatan (desa/dusun)         │        │
│  │  wilayah_kkn          — Wilayah/zona pengelompokan             │        │
│  │  jenis_dokumen        — Jenis dokumen KKN                      │        │
│  │  komponen_penilaian   — Komponen & bobot penilaian             │        │
│  │  kriteria_pendaftaran — Syarat pendaftaran KKN                 │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                          │                                                  │
│                          ▼                                                  │
│  ┌─────────── SCHEMA: pendaftaran (3 tabel) ──────────────────────┐        │
│  │  registrasi_kkn    ←── periode_kkn, wilayah_kkn               │        │
│  │  data_pemohon      ←── registrasi_kkn                          │        │
│  │  verifikasi_syarat ←── registrasi_kkn, kriteria_pendaftaran   │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                          │                                                  │
│                          ▼                                                  │
│  ┌─────────── SCHEMA: kelompok (4 tabel) ─────────────────────────┐        │
│  │  kelompok_kkn     ←── periode_kkn, lokasi_kkn, wilayah_kkn   │        │
│  │  anggota_kelompok ←── kelompok_kkn, registrasi_kkn            │        │
│  │  dpl_kelompok     ←── kelompok_kkn                             │        │
│  │  pamong_desa      ←── kelompok_kkn                             │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                          │                                                  │
│              ┌───────────┼───────────┐                                      │
│              ▼           ▼           ▼                                      │
│  ┌──── SCHEMA: kegiatan (5 tabel) ────┐  ┌── SCHEMA: penilaian (3) ──┐    │
│  │  program_kerja   ←── kelompok_kkn  │  │  nilai_mahasiswa          │    │
│  │  logbook_harian  ←── anggota       │  │    ←── anggota, komponen  │    │
│  │  laporan_kelompok←── kelompok_kkn  │  │  nilai_akhir              │    │
│  │  absensi         ←── anggota       │  │    ←── anggota            │    │
│  │  catatan_bimbingan←── kelompok,dpl │  │  penilaian_pamong         │    │
│  └────────────────────────────────────┘  │    ←── anggota, pamong    │    │
│                                           └───────────────────────────┘    │
│                          │                                                  │
│                          ▼                                                  │
│  ┌─────────── SCHEMA: dokumen (2 tabel) ──────────────────────────┐        │
│  │  dokumen_kkn  ←── jenis_dokumen, kelompok_kkn, anggota        │        │
│  │  sertifikat   ←── anggota_kelompok, periode_kkn               │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  ┌─────────── SCHEMA: log (2 tabel) ─────────────────────────────┐        │
│  │  jejak_audit    — Audit trail aktivitas pengguna               │        │
│  │  aktivitas_data — Log perubahan data otomatis (via trigger)    │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  EXTERNAL REFERENCES (PDUT — SQL Server, Read-Only via FDW)                │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │  man_akses.pengguna       — Akun pengguna                     │        │
│  │  siakadu.peserta_didik    — Data mahasiswa                    │        │
│  │  siakadu.reg_pd           — Registrasi peserta didik          │        │
│  │  siakadu.semester         — Data semester                      │        │
│  │  siakadu.sms              — Satuan manajemen sumberdaya       │        │
│  │  siakadu.nilai_smt_mhs   — Nilai semester mahasiswa           │        │
│  │  keuangan.spp_mhs        — Status pembayaran SPP/UKT         │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                             │
│  OBJECT STORAGE (MinIO)                                                     │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │  Bucket: myunila-storage                                       │        │
│  │  Paths:  siknila/dokumen/{context}/{id}/{filename}            │        │
│  │          siknila/logbook/{id}/{filename}                       │        │
│  │          siknila/laporan/{id}/{filename}                       │        │
│  │          siknila/sertifikat/{id}/{filename}                    │        │
│  │          siknila/foto/{id}/{filename}                          │        │
│  │          siknila/bimbingan/{id}/{filename}                     │        │
│  └────────────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘

================================================================================
STATISTIK DATABASE
================================================================================

  Total Schema        : 7  (ref, pendaftaran, kelompok, kegiatan, penilaian,
                             dokumen, log)
  Total Tabel         : 25
    - ref              : 6  (periode_kkn, lokasi_kkn, wilayah_kkn,
                             jenis_dokumen, komponen_penilaian,
                             kriteria_pendaftaran)
    - pendaftaran      : 3  (registrasi_kkn, data_pemohon, verifikasi_syarat)
    - kelompok         : 4  (kelompok_kkn, anggota_kelompok, dpl_kelompok,
                             pamong_desa)
    - kegiatan         : 5  (program_kerja, logbook_harian, laporan_kelompok,
                             absensi, catatan_bimbingan)
    - penilaian        : 3  (nilai_mahasiswa, nilai_akhir, penilaian_pamong)
    - dokumen          : 2  (dokumen_kkn, sertifikat)
    - log              : 2  (jejak_audit, aktivitas_data)

  Total Foreign Keys  : 24
    - ref → (none, master tables)
    - pendaftaran      : 5  (periode, wilayah×2, registrasi, kriteria)
    - kelompok         : 5  (periode, lokasi, wilayah, kelompok, registrasi)
    - kegiatan         : 6  (kelompok×3, anggota×2, dpl)
    - penilaian        : 4  (anggota×3, komponen, pamong)
    - dokumen          : 4  (jenis, kelompok, anggota, periode)

  Total Indexes       : 68
    - ref              : 10
    - pendaftaran      : 12
    - kelompok         : 11
    - kegiatan         : 15
    - penilaian        : 7
    - dokumen          : 6
    - log              : 9
    (Sebagian besar partial index WHERE soft_delete = FALSE)

  Total Triggers      : 44
    - trigger_set_updated_at : 21  (semua tabel dengan updated_at)
    - fn_catat_aktivitas_data: 23  (semua tabel kecuali log schema)

  Functions           : 2
    - trigger_set_updated_at()
    - log.fn_catat_aktivitas_data()

  Session Context Variables:
    - siknila.id_pengguna  (UUID pengguna aktif)
    - siknila.ip_address   (IP address pengguna)

================================================================================
*/
