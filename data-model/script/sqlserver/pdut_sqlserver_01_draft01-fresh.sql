/*==============================================================*/
/* DBMS name:      Microsoft SQL Server 2014                    */
/* Created on:     03/01/2022 02:15:59                          */
/*==============================================================*/


/*==============================================================*/
/* User: keuangan                                               */
/*==============================================================*/
create schema keuangan
go

/*==============================================================*/
/* User: dok                                                    */
/*==============================================================*/
create schema dok
go

/*==============================================================*/
/* User: kerjasama                                              */
/*==============================================================*/
create schema kerjasama
go

/*==============================================================*/
/* User: man_akses                                              */
/*==============================================================*/
create schema man_akses
go

/*==============================================================*/
/* User: pdrd                                                   */
/*==============================================================*/
create schema pdrd
go

/*==============================================================*/
/* User: ref                                                    */
/*==============================================================*/
create schema ref
go

/*==============================================================*/
/* User: sarpras                                                */
/*==============================================================*/
create schema sarpras
go

/*==============================================================*/
/* User: tracer                                                 */
/*==============================================================*/
create schema tracer
go

/*==============================================================*/
/* Table: agama                                                 */
/*==============================================================*/
create table ref.agama (
   id_agama             smallint             not null,
   nm_agama             varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_agama primary key (id_agama)
)
go

/*==============================================================*/
/* Table: akred_sp                                              */
/*==============================================================*/
create table pdrd.akred_sp (
   id_akred_sp          uniqueidentifier     not null,
   id_lemb_akred        char(5)              not null,
   id_sp                uniqueidentifier     not null,
   id_akred             numeric(1)           not null,
   sk_akred_sp          varchar(80)          not null,
   tgl_sk_akred_sp      date                 not null,
   tst_sk_akred_sp      date                 not null,
   asal_data            char(1)              not null default '9'
      constraint ckc_asal_data_akred_sp check (asal_data in ('1','2','3','4','5','6','9','7','8')),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_akred_sp check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_akred_sp primary key (id_akred_sp)
)
go

/*==============================================================*/
/* Table: akreditasi_prodi                                      */
/*==============================================================*/
create table pdrd.akreditasi_prodi (
   id_akreditasi_prodi  uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_lemb_akred        char(5)              not null,
   id_akred             numeric(1)           not null,
   sk_akreditasi_prodi  varchar(80)          not null,
   tanggal_sk_akreditasi_prodi date                 not null,
   tst_sk_akreditasi_prodi date                 not null,
   asal_data            char(1)              not null default '9'
      constraint ckc_asal_data_akredita check (asal_data in ('1','2','3','4','5','6','9','7','8')),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_akredita check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_akreditasi_prodi primary key (id_akreditasi_prodi)
)
go

/*==============================================================*/
/* Table: akt_ajar_dosen                                        */
/*==============================================================*/
create table pdrd.akt_ajar_dosen (
   id_ajar              uniqueidentifier     not null,
   id_reg_ptk           uniqueidentifier     not null,
   id_subst             uniqueidentifier     null,
   id_katgiat           int                  not null,
   id_jns_eval          smallint             not null,
   id_kls               uniqueidentifier     not null,
   sks_subst_tot        numeric(5,2)         not null,
   sks_tm_subst         numeric(5,2)         not null,
   sks_prak_subst       numeric(5,2)         not null,
   sks_prak_lap_subst   numeric(5,2)         not null,
   sks_sim_subst        numeric(5,2)         not null,
   jml_tm_renc          numeric(2)           not null,
   jml_tm_real          numeric(2)           null,
   jml_mhs              smallint             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_akt_ajar check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_akt_ajar_dosen primary key (id_ajar)
)
go

/*==============================================================*/
/* Table: akt_mhs                                               */
/*==============================================================*/
create table pdrd.akt_mhs (
   id_akt_mhs           uniqueidentifier     not null,
   id_jns_akt_mhs       numeric(2)           not null,
   id_sms               uniqueidentifier     not null,
   id_smt               char(5)              not null,
   judul_akt_mhs        varchar(500)         not null,
   lokasi_kegiatan      varchar(80)          null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   ket_akt              text                 null,
   a_komunal            numeric(1)           not null default 0
      constraint ckc_a_komunal_akt_mhs check (a_komunal between 0 and 1 and a_komunal in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_akt_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_akt_mhs primary key (id_akt_mhs)
)
go

/*==============================================================*/
/* Table: alat                                                  */
/*==============================================================*/
create table sarpras.alat (
   id_alat              uniqueidentifier     not null,
   id_jns_sarana        int                  not null,
   id_hapus_buku        char(1)              null,
   id_sdm               uniqueidentifier     null,
   id_sms               uniqueidentifier     not null,
   id_stat_milik_sarpras numeric(1)           not null,
   kd_kl                char(3)              not null,
   kd_satker            varchar(20)          not null,
   kd_brg               varchar(10)          not null,
   nup                  int                  not null,
   kode_eselon1         varchar(2)           null,
   nama_eselon1         varchar(255)         null,
   kode_sub_satker      varchar(3)           null,
   nama_sub_satker      varchar(255)         null,
   panjang              float                null,
   lebar                float                null,
   luas                 float                null,
   alamat               varchar(255)         null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   bmn_satker           varchar(20)          null,
   bmn_kd_barang        varchar(10)          null,
   bmn_nup              numeric(3)           null,
   nm_prasarana         varchar(100)         not null,
   spesifikasi          varchar(300)         null,
   tgl_perolehan        date                 null,
   thn_produksi         numeric(4)           null,
   nilai_perolehan      numeric(20,2)        null,
   nilai_buku           numeric(20,2)        null,
   merk                 varchar(255)         null,
   kd_kab_kota          varchar(3)           null,
   nm_kab_kota          varchar(255)         null,
   kd_prov              varchar(3)           null,
   nm_prov              varchar(255)         null,
   penggunaan           varchar(255)         null,
   kondisi              varchar(255)         null,
   no_dok_kepemilikan   varchar(255)         null,
   dok_kepemilikan      varchar(255)         null,
   jns_dok_kepemilikan  varchar(255)         null,
   tgl_hapus_buku       date                 null,
   asal_data            char(1)              null default '9'
      constraint ckc_asal_data_alat check (asal_data is null or (asal_data in ('1','2','3','4','5','6','9','7','8'))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_alat check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_alat primary key (id_alat)
)
go

/*==============================================================*/
/* Table: alat_long                                             */
/*==============================================================*/
create table sarpras.alat_long (
   id_alat              uniqueidentifier     not null,
   id_smt               char(5)              not null,
   jml_laik             int                  not null,
   jml_tidak_laik       int                  not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_alat_lon check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_alat_long primary key (id_alat, id_smt)
)
go

/*==============================================================*/
/* Table: alat_transportasi                                     */
/*==============================================================*/
create table sarpras.alat_transportasi (
   id_alat_transport    numeric(2)           not null,
   nm_alat_transport    varchar(60)          not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_alat_tra check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_alat_transportasi primary key (id_alat_transport)
)
go

/*==============================================================*/
/* Table: anak                                                  */
/*==============================================================*/
create table pdrd.anak (
   id_anak              uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           null,
   id_sdm               uniqueidentifier     not null,
   id_stat_anak         numeric(1)           not null,
   nisn                 char(10)             null,
   nm_anak              varchar(100)         not null,
   jk                   char(1)              not null 
      constraint ckc_jk_anak check (jk in ('L','P','*')),
   tmpt_lahir           varchar(32)          null,
   tgl_lahir            date                 not null,
   thn_masuk            numeric(4)           null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_anak check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_anak primary key (id_anak)
)
go

/*==============================================================*/
/* Table: anggota_aktivitas_mahasiswa                           */
/*==============================================================*/
create table pdrd.anggota_aktivitas_mahasiswa (
   id_ang_akt_mhs       uniqueidentifier     not null,
   id_akt_mhs           uniqueidentifier     not null,
   id_reg_pd            uniqueidentifier     not null,
   nm_pd                varchar(120)         not null,
   nipd                 varchar(24)          not null,
   jns_peran_mhs        char(1)              not null default '3'
      constraint ckc_jns_peran_mhs_anggota_ check (jns_peran_mhs in ('1','2','3')),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_ang_akt_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_anggota_aktivitas_mahasiswa primary key (id_ang_akt_mhs)
)
go

/*==============================================================*/
/* Table: anggota_orgprof                                       */
/*==============================================================*/
create table pdrd.anggota_orgprof (
   id_ang_orgprof       uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   nm_org               varchar(100)         not null,
   peran                varchar(30)          not null,
   mulai_anggota        date                 not null,
   selesai_anggota      date                 null,
   instansi_profesi     varchar(100)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_ang_org check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_anggota_orgprof primary key (id_ang_orgprof)
)
go

/*==============================================================*/
/* Table: anggota_panitia                                       */
/*==============================================================*/
create table pdrd.anggota_panitia (
   id_ang_panitia       uniqueidentifier     not null,
   id_panitia           uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   peran                varchar(30)          not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_ang_panitia check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_anggota_panitia primary key (id_ang_panitia)
)
go

/*==============================================================*/
/* Table: angkutan                                              */
/*==============================================================*/
create table sarpras.angkutan (
   id_angkutan          uniqueidentifier     not null,
   id_jns_sarana        int                  not null,
   id_hapus_buku        char(1)              null,
   id_sdm               uniqueidentifier     null,
   id_sms               uniqueidentifier     not null,
   id_stat_milik_sarpras numeric(1)           not null,
   kd_kl                char(3)              not null,
   kd_satker            varchar(20)          not null,
   kd_brg               varchar(10)          not null,
   nup                  int                  not null,
   kode_eselon1         varchar(2)           null,
   nama_eselon1         varchar(255)         null,
   kode_sub_satker      varchar(3)           null,
   nama_sub_satker      varchar(255)         null,
   panjang              float                null,
   lebar                float                null,
   luas                 float                null,
   sar_alamat           varchar(255)         null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   bmn_satker           varchar(20)          null,
   bmn_kd_barang        varchar(10)          null,
   bmn_nup              numeric(3)           null,
   nm_prasarana         varchar(100)         not null,
   spesifikasi          varchar(300)         null,
   tgl_perolehan        date                 null,
   thn_produksi         numeric(4)           null,
   nilai_perolehan      numeric(20,2)        null,
   nilai_buku           numeric(20,2)        null,
   sar_merk             varchar(255)         null,
   kd_kab_kota          varchar(3)           null,
   nm_kab_kota          varchar(255)         null,
   kd_prov              varchar(3)           null,
   nm_prov              varchar(255)         null,
   penggunaan           varchar(255)         null,
   kondisi              varchar(255)         null,
   no_dok_kepemilikan   varchar(255)         null,
   dok_kepemilikan      varchar(255)         null,
   jns_dok_kepemilikan  varchar(255)         null,
   tgl_hapus_buku       date                 null,
   asal_data            char(1)              null default '9'
      constraint ckc_asal_data_angkutan check (asal_data is null or (asal_data in ('1','2','3','4','5','6','9','7','8'))),
   merk                 varchar(255)         null,
   no_polisi            varchar(255)         null,
   no_bkpb              varchar(255)         null,
   alamat               varchar(255)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_angkutan check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_angkutan primary key (id_angkutan)
)
go

/*==============================================================*/
/* Table: aplikasi                                              */
/*==============================================================*/
create table man_akses.aplikasi (
   id_aplikasi          uniqueidentifier     not null,
   id_organisasi        uniqueidentifier     null,
   nm_aplikasi          varchar(100)         not null,
   ket_aplikasi         varchar(500)         null,
   token_aplikasi       varchar(1000)        null,
   app_key              varchar(500)         null,
   url                  varchar(256)         null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_aplikasi primary key (id_aplikasi)
)
go

/*==============================================================*/
/* Table: bangunan                                              */
/*==============================================================*/
create table sarpras.bangunan (
   id_bangunan          uniqueidentifier     not null,
   id_stat_milik_sarpras numeric(1)           not null,
   id_sms               uniqueidentifier     not null,
   id_jns_prasarana     int                  not null,
   kd_satuan            char(1)              not null,
   id_hapus_buku        char(1)              null,
   id_tanah             uniqueidentifier     null,
   kd_kl                char(3)              not null,
   kd_satker            varchar(20)          not null,
   kd_brg               varchar(10)          not null,
   nup                  int                  not null,
   kode_eselon1         varchar(2)           null,
   nama_eselon1         varchar(255)         null,
   kode_sub_satker      varchar(3)           null,
   nama_sub_satker      varchar(255)         null,
   panjang              float                null,
   lebar                float                null,
   luas                 float                null,
   alamat               varchar(255)         null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   bmn_satker           varchar(20)          null,
   bmn_kd_barang        varchar(10)          null,
   bmn_nup              numeric(3)           null,
   nm_prasarana         varchar(100)         not null,
   spesifikasi          varchar(300)         null,
   tgl_perolehan        date                 null,
   thn_produksi         numeric(4)           null,
   nilai_perolehan      numeric(20,2)        null,
   nilai_buku           numeric(20,2)        null,
   merk                 varchar(255)         null,
   kd_kab_kota          varchar(3)           null,
   nm_kab_kota          varchar(255)         null,
   kd_prov              varchar(3)           null,
   nm_prov              varchar(255)         null,
   penggunaan           varchar(255)         null,
   kondisi              varchar(255)         null,
   no_dok_kepemilikan   varchar(255)         null,
   dok_kepemilikan      varchar(255)         null,
   jns_dok_kepemilikan  varchar(255)         null,
   tgl_hapus_buku       date                 null,
   asal_data            char(1)              null default '9'
      constraint ckc_asal_data_bangunan check (asal_data is null or (asal_data in ('1','2','3','4','5','6','9','7','8'))),
   ket_bangunan         varchar(250)         null,
   kd_satker_tanah      varchar(250)         null,
   nm_satker_tanah      varchar(250)         null,
   kd_brg_tanah         varchar(250)         null,
   nm_brg_tanah         varchar(250)         null,
   nup_brg_tanah        varchar(250)         null,
   tgl_sk_pemakai       date                 null,
   kapasitas            numeric(5)           null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_bangunan check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_bangunan primary key (id_bangunan)
)
go

/*==============================================================*/
/* Table: beasiswa_sdm                                          */
/*==============================================================*/
create table beasiswa_sdm (
   id_beasiswa_sdm      uniqueidentifier     not null,
   id_jns_beasiswa      int                  not null,
   id_sdm               uniqueidentifier     not null,
   id_sms               uniqueidentifier     null,
   ket                  varchar(250)         not null,
   thn_mulai            numeric(4)           not null,
   thn_akhir            numeric(4)           null,
   a_msh_terima         numeric(1)           not null default 0
      constraint ckc_a_msh_terima_beasiswa check (a_msh_terima between 0 and 1 and a_msh_terima in (0,1)),
   constraint pk_beasiswa_sdm primary key (id_beasiswa_sdm)
)
go

/*==============================================================*/
/* Table: bentuk_pendidikan                                     */
/*==============================================================*/
create table ref.bentuk_pendidikan (
   id_bp                smallint             not null,
   nm_bp                varchar(50)          not null,
   a_jenj_paud          numeric(1)           not null default 0
      constraint ckc_a_jenj_paud_bentuk_p check (a_jenj_paud between 0 and 1 and a_jenj_paud in (0,1)),
   a_jenj_tk            numeric(1)           not null default 0
      constraint ckc_a_jenj_tk_bentuk_p check (a_jenj_tk between 0 and 1 and a_jenj_tk in (0,1)),
   a_jenj_sd            numeric(1)           not null default 0
      constraint ckc_a_jenj_sd_bentuk_p check (a_jenj_sd between 0 and 1 and a_jenj_sd in (0,1)),
   a_jenj_smp           numeric(1)           not null default 0
      constraint ckc_a_jenj_smp_bentuk_p check (a_jenj_smp between 0 and 1 and a_jenj_smp in (0,1)),
   a_jenj_sma           numeric(1)           not null default 0
      constraint ckc_a_jenj_sma_bentuk_p check (a_jenj_sma between 0 and 1 and a_jenj_sma in (0,1)),
   a_jenj_tinggi        numeric(1)           not null default 0
      constraint ckc_a_jenj_tinggi_bentuk_p check (a_jenj_tinggi between 0 and 1 and a_jenj_tinggi in (0,1)),
   dir_bina             varchar(40)          null,
   a_aktif              numeric(1)           not null default 0
      constraint ckc_a_aktif_bentuk_p check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bentuk_pendidikan primary key (id_bp)
)
go

/*==============================================================*/
/* Table: biaya_operasional                                     */
/*==============================================================*/
create table keuangan.biaya_operasional (
   id_bo                uniqueidentifier     not null,
   id_tahun_anggaran    numeric(4)           not null,
   id_jns_keuangan      int                  not null,
   id_sms               uniqueidentifier     null,
   sumber               varchar(200)         not null,
   total_biaya          numeric(16,2)        not null,
   tgl_operasional      date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_biaya_op check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_biaya_operasional primary key (id_bo)
)
go

/*==============================================================*/
/* Table: bidang_studi                                          */
/*==============================================================*/
create table ref.bidang_studi (
   id_bid_studi         int                  not null,
   id_induk_bidang_studi int                  null,
   kode_bid_studi       varchar(22)          null,
   nm_bid_studi         varchar(100)         not null,
   a_kel                numeric(1)           not null default 0
      constraint ckc_a_kel_bidang_s check (a_kel between 0 and 1 and a_kel in (0,1)),
   a_jenj_paud          numeric(1)           not null default 0
      constraint ckc_a_jenj_paud_bidang_s check (a_jenj_paud between 0 and 1 and a_jenj_paud in (0,1)),
   a_jenj_tk            numeric(1)           not null default 0
      constraint ckc_a_jenj_tk_bidang_s check (a_jenj_tk between 0 and 1 and a_jenj_tk in (0,1)),
   a_jenj_sd            numeric(1)           not null default 0
      constraint ckc_a_jenj_sd_bidang_s check (a_jenj_sd between 0 and 1 and a_jenj_sd in (0,1)),
   a_jenj_smp           numeric(1)           not null default 0
      constraint ckc_a_jenj_smp_bidang_s check (a_jenj_smp between 0 and 1 and a_jenj_smp in (0,1)),
   a_jenj_sma           numeric(1)           not null default 0
      constraint ckc_a_jenj_sma_bidang_s check (a_jenj_sma between 0 and 1 and a_jenj_sma in (0,1)),
   a_jenj_tinggi        numeric(1)           not null default 0
      constraint ckc_a_jenj_tinggi_bidang_s check (a_jenj_tinggi between 0 and 1 and a_jenj_tinggi in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bidang_studi primary key (id_bid_studi)
)
go

/*==============================================================*/
/* Table: bidang_usaha                                          */
/*==============================================================*/
create table ref.bidang_usaha (
   id_bu                char(10)             not null,
   nm_bu                varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_bidang_usaha primary key (id_bu)
)
go

/*==============================================================*/
/* Table: bimbing_dosen                                         */
/*==============================================================*/
create table pdrd.bimbing_dosen (
   id_bimb_dosen        uniqueidentifier     not null,
   tgl_mulai            date                 not null,
   tgl_selesai          date                 not null,
   bid_ahli_pembimbing  varchar(50)          null,
   bid_ahli_bimbingan   varchar(50)          null,
   desk_kegiatan        text                 null,
   jns_bimbing          char(1)              not null 
      constraint ckc_jns_bimbing_bimbing_ check (jns_bimbing in ('R','C')),
   sk_tugas             varchar(80)          not null,
   tgl_sk_tugas         date                 not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_bimb_dosen check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_bimbing_dosen primary key (id_bimb_dosen)
)
go

/*==============================================================*/
/* Table: bimbing_mhs                                           */
/*==============================================================*/
create table pdrd.bimbing_mhs (
   id_bimb_mhs          uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_akt_mhs           uniqueidentifier     not null,
   urutan_promotor      numeric(1)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_bimb_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_bimbing_mhs primary key (id_bimb_mhs)
)
go

/*==============================================================*/
/* Table: buku_ajar                                             */
/*==============================================================*/
create table pdrd.buku_ajar (
   id_buku_ajar         uniqueidentifier     not null,
   id_kat_capaian       numeric(3)           null,
   id_jns_bhn_ajar      int                  not null,
   id_litabmas          uniqueidentifier     null,
   judul_buku           varchar(500)         not null,
   penulis              varchar(256)         null,
   penerbit             varchar(100)         not null,
   isbn                 varchar(20)          null,
   tgl_terbit           date                 null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_buku_aja check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_buku_ajar primary key (id_buku_ajar)
)
go

/*==============================================================*/
/* Table: dbr                                                   */
/*==============================================================*/
create table sarpras.dbr (
   id_ruang             uniqueidentifier     not null,
   id_alat              uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dbr check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dbr primary key (id_ruang, id_alat)
)
go

/*==============================================================*/
/* Table: detasering                                            */
/*==============================================================*/
create table pdrd.detasering (
   id_detasering        uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_sp_sumber         uniqueidentifier     not null,
   id_sp_sasaran        uniqueidentifier     not null,
   tgl_mulai            date                 null,
   tgl_selesai          date                 null,
   bid_tgs              varchar(100)         null,
   desk_keg             text                 null,
   metode_laks          varchar(30)          null,
   sk_tugas             varchar(80)          not null,
   tgl_sk_tugas         date                 not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_detaseri check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_detasering primary key (id_detasering)
)
go

/*==============================================================*/
/* Table: diklat                                                */
/*==============================================================*/
create table pdrd.diklat (
   id_diklat            uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_kel_bidang        uniqueidentifier     null,
   id_jns_diklat        int                  not null,
   nm_diklat            varchar(160)         not null,
   penyelenggara        varchar(100)         null,
   thn                  numeric(4)           not null,
   peran                varchar(30)          null,
   tkt                  numeric(2)           null,
   jml_jam              numeric(4)           null,
   no_sert              varchar(80)          null,
   tgl_sert             date                 null,
   tempat               varchar(20)          null,
   tgl_mulai            date                 null,
   tgl_selesai          date                 null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_diklat check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_diklat primary key (id_diklat)
)
go

/*==============================================================*/
/* Table: dok_akt_mhs                                           */
/*==============================================================*/
create table dok.dok_akt_mhs (
   id_akt_mhs           uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_akt_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_akt_mhs primary key (id_akt_mhs, id_dok)
)
go

/*==============================================================*/
/* Table: dok_ang_orgprof                                       */
/*==============================================================*/
create table dok.dok_ang_orgprof (
   id_ang_orgprof       uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_ang_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_ang_orgprof primary key (id_ang_orgprof, id_dok)
)
go

/*==============================================================*/
/* Table: dok_bhn_ajar                                          */
/*==============================================================*/
create table dok.dok_bhn_ajar (
   id_buku_ajar         uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_bhn_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_bhn_ajar primary key (id_buku_ajar, id_dok)
)
go

/*==============================================================*/
/* Table: dok_bimbing_dosen                                     */
/*==============================================================*/
create table dok.dok_bimbing_dosen (
   id_bimb_dosen        uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_bimb check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_bimbing_dosen primary key (id_bimb_dosen, id_dok)
)
go

/*==============================================================*/
/* Table: dok_detasering                                        */
/*==============================================================*/
create table dok.dok_detasering (
   id_detasering        uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_deta check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_detasering primary key (id_detasering, id_dok)
)
go

/*==============================================================*/
/* Table: dok_diklat                                            */
/*==============================================================*/
create table dok.dok_diklat (
   id_diklat            uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_dikl check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_diklat primary key (id_diklat, id_dok)
)
go

/*==============================================================*/
/* Table: dok_inpassing                                         */
/*==============================================================*/
create table dok.dok_inpassing (
   id_inpassing         uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_inpa check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_inpassing primary key (id_inpassing, id_dok)
)
go

/*==============================================================*/
/* Table: dok_jabstruk                                          */
/*==============================================================*/
create table dok.dok_jabstruk (
   id_rwy_jabstruk      uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_jabs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_jabstruk primary key (id_rwy_jabstruk, id_dok)
)
go

/*==============================================================*/
/* Table: dok_laporan_studi                                     */
/*==============================================================*/
create table dok.dok_laporan_studi (
   id_lap_studi         uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_lapo check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_laporan_studi primary key (id_lap_studi, id_dok)
)
go

/*==============================================================*/
/* Table: dok_litabmas                                          */
/*==============================================================*/
create table dok.dok_litabmas (
   id_litabmas          uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_lita check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_litabmas primary key (id_litabmas, id_dok)
)
go

/*==============================================================*/
/* Table: dok_nilai_tes                                         */
/*==============================================================*/
create table dok.dok_nilai_tes (
   id_nilai_tes         uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_nila check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_nilai_tes primary key (id_nilai_tes, id_dok)
)
go

/*==============================================================*/
/* Table: dok_panitia                                           */
/*==============================================================*/
create table dok.dok_panitia (
   id_panitia           uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_pani check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_panitia primary key (id_panitia, id_dok)
)
go

/*==============================================================*/
/* Table: dok_pembicara                                         */
/*==============================================================*/
create table dok.dok_pembicara (
   id_dok               uniqueidentifier     not null,
   id_pembicara         uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_pemb check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_pembicara primary key (id_dok, id_pembicara)
)
go

/*==============================================================*/
/* Table: dok_pengelola_jurnal                                  */
/*==============================================================*/
create table dok.dok_pengelola_jurnal (
   id_dok               uniqueidentifier     not null,
   id_kelola_jurnal     uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_peng check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_pengelola_jurnal primary key (id_dok, id_kelola_jurnal)
)
go

/*==============================================================*/
/* Table: dok_penghargaan                                       */
/*==============================================================*/
create table dok.dok_penghargaan (
   id_penghargaan       uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_dok_penghargaan check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_penghargaan primary key (id_penghargaan, id_dok)
)
go

/*==============================================================*/
/* Table: dok_pub                                               */
/*==============================================================*/
create table dok.dok_pub (
   id_publikasi         uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_pub check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_pub primary key (id_publikasi, id_dok)
)
go

/*==============================================================*/
/* Table: dok_rwy_didik                                         */
/*==============================================================*/
create table dok.dok_rwy_didik (
   id_rwy_didik_formal  uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_dok_rwy_didik check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_rwy_didik primary key (id_rwy_didik_formal, id_dok)
)
go

/*==============================================================*/
/* Table: dok_rwy_kepangkatan                                   */
/*==============================================================*/
create table dok.dok_rwy_kepangkatan (
   id_rwy_pangkat       uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_dok_rwy_pangkat check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_rwy_kepangkatan primary key (id_rwy_pangkat, id_dok)
)
go

/*==============================================================*/
/* Table: dok_rwy_pekerjaan                                     */
/*==============================================================*/
create table dok.dok_rwy_pekerjaan (
   id_rwy_kerja         uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_rwy_2 check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_rwy_pekerjaan primary key (id_rwy_kerja, id_dok)
)
go

/*==============================================================*/
/* Table: dok_rwy_sertifikasi                                   */
/*==============================================================*/
create table dok.dok_rwy_sertifikasi (
   id_rwy_sert          uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_dok_rwy_sert check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_rwy_sertifikasi primary key (id_rwy_sert, id_dok)
)
go

/*==============================================================*/
/* Table: dok_tugtam                                            */
/*==============================================================*/
create table dok.dok_tugtam (
   id_tgs_tambah        uniqueidentifier     not null,
   id_dok               uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_tugt check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_tugtam primary key (id_tgs_tambah, id_dok)
)
go

/*==============================================================*/
/* Table: dok_visit_scientist                                   */
/*==============================================================*/
create table dok.dok_visit_scientist (
   id_dok               uniqueidentifier     not null,
   id_visit             uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dok_visi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dok_visit_scientist primary key (id_dok, id_visit)
)
go

/*==============================================================*/
/* Table: dokumen                                               */
/*==============================================================*/
create table dok.dokumen (
   id_dok               uniqueidentifier     not null,
   id_jns_dok           int                  not null,
   nm_dok               varchar(60)          not null,
   ket_dok              varchar(200)         null,
   file_dok             varbinary(max)       null,
   wkt_unggah           datetime             not null,
   url                  varchar(256)         null,
   media_type           varchar(250)         null,
   file_name            varchar(500)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dokumen check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dokumen primary key (id_dok)
)
go

/*==============================================================*/
/* Table: dudi                                                  */
/*==============================================================*/
create table pdrd.dudi (
   id_dudi              uniqueidentifier     not null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   nm_lemb              varchar(100)         not null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   npwp                 char(15)             null,
   nm_wp                varchar(100)         null,
   kip                  char(9)              null,
   alamat_kanpus        varchar(255)         null,
   email_kanpus         varchar(60)          null,
   telp_kanpus          varchar(20)          null,
   website_kanpus       varchar(256)         null,
   fax_kanpus           varchar(20)          null,
   jml_tmpt_tidur       int                  null,
   jml_pasien_rawat_inap int                  null,
   jml_pasien_rawat_jln int                  null,
   variasi_kasus        varchar(1000)        null,
   id_wil               char(8)              not null,
   id_bu                char(10)             not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_dudi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_dudi primary key (id_dudi)
)
go

/*==============================================================*/
/* Table: foto_peserta_didik                                    */
/*==============================================================*/
create table dok.foto_peserta_didik (
   id_foto_pd           uniqueidentifier     not null,
   id_blob              uniqueidentifier     not null,
   id_pd                uniqueidentifier     not null,
   wkt_unggah           datetime             not null,
   a_tampil             numeric(1)           not null default 0
      constraint ckc_a_tampil_foto_pes check (a_tampil between 0 and 1 and a_tampil in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_foto_pes check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_foto_peserta_didik primary key (id_foto_pd)
)
go

/*==============================================================*/
/* Table: fungsi_lab                                            */
/*==============================================================*/
create table ref.fungsi_lab (
   id_fungsi_lab        char(1)              not null,
   nm_fungsi_lab        varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_fungsi_lab primary key (id_fungsi_lab)
)
go

/*==============================================================*/
/* Table: gelar_akademik                                        */
/*==============================================================*/
create table ref.gelar_akademik (
   id_gelar_akad        int                  not null,
   singkat_gelar        varchar(20)          not null,
   nm_gelar_akad        varchar(80)          not null,
   posisi_gelar         numeric(1)           not null 
      constraint ckc_posisi_gelar_gelar_ak check (posisi_gelar in (1,2)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_gelar_akademik primary key (id_gelar_akad)
)
go

/*==============================================================*/
/* Table: hasil_tracer_atasan                                   */
/*==============================================================*/
create table tracer.hasil_tracer_atasan (
   id_hasil_tracer_atasan uniqueidentifier     not null,
   id_hasil_tracer_study uniqueidentifier     not null,
   id_negara            char(2)              null,
   id_wil               char(8)              null,
   email_atasan         varchar(60)          null,
   nm_atasan            varchar(100)         null,
   jabatan_atasan       varchar(200)         null,
   nm_tmpt_bekerja      varchar(200)         null,
   bidang_tempat_bekerja varchar(200)         null,
   saran                text                 null,
   harapan              text                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_hasil_ts_atasan check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_hasil_tracer_atasan primary key (id_hasil_tracer_atasan)
)
go

/*==============================================================*/
/* Table: hasil_tracer_study                                    */
/*==============================================================*/
create table tracer.hasil_tracer_study (
   id_hasil_tracer_study uniqueidentifier     not null,
   id_thn_ajaran        numeric(4)           not null,
   id_wil               char(8)              null,
   id_reg_pd            uniqueidentifier     not null,
   id_smt               char(5)              null,
   wkt_pengisian        datetime             not null,
   wkt_tunggu           numeric(4)           null,
   status_lulusan       numeric(1)           not null,
   jns_tmpt_bekerja     varchar(40)          null,
   nm_tmpt_bekerja      varchar(200)         null,
   income_per_bln       numeric(16,2)        null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_hasil_ts check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_hasil_tracer_study primary key (id_hasil_tracer_study)
)
go

/*==============================================================*/
/* Table: ikatan_kerja_sdm                                      */
/*==============================================================*/
create table ref.ikatan_kerja_sdm (
   id_ikatan_kerja      char(1)              not null,
   nm_ikatan_kerja      varchar(50)          not null,
   ket_ikatan_kerja     varchar(150)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_ikatan_kerja_sdm primary key (id_ikatan_kerja)
)
go

/*==============================================================*/
/* Table: inpassing                                             */
/*==============================================================*/
create table pdrd.inpassing (
   id_inpassing         uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_pangkat_gol       numeric(2)           not null,
   sk_inpassing         varchar(80)          not null,
   tgl_sk_inpassing     date                 null,
   tmt_sk_inpassing     date                 not null,
   angka_kredit         numeric(7,2)         not null default 0,
   masa_kerja_thn       numeric(2)           not null,
   masa_kerja_bln       numeric(2)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_inpassin check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_inpassing primary key (id_inpassing)
)
go

/*==============================================================*/
/* Table: jab_tgs                                               */
/*==============================================================*/
create table ref.jab_tgs (
   id_jab_tgs           numeric(5)           not null,
   id_kel_prof          numeric(5)           not null,
   nm_jab_tgs           varchar(50)          not null,
   a_jab_utama_sek      numeric(1)           not null default 0
      constraint ckc_a_jab_utama_sek_jab_tgs check (a_jab_utama_sek between 0 and 1 and a_jab_utama_sek in (0,1)),
   a_jab_utama_pt       numeric(1)           not null default 0
      constraint ckc_a_jab_utama_pt_jab_tgs check (a_jab_utama_pt between 0 and 1 and a_jab_utama_pt in (0,1)),
   a_jab_utama_lpnk     numeric(1)           not null default 0
      constraint ckc_a_jab_utama_lpnk_jab_tgs check (a_jab_utama_lpnk between 0 and 1 and a_jab_utama_lpnk in (0,1)),
   a_jab_utama_lpk      numeric(1)           not null default 0
      constraint ckc_a_jab_utama_lpk_jab_tgs check (a_jab_utama_lpk between 0 and 1 and a_jab_utama_lpk in (0,1)),
   jml_jam_diakui       numeric(2)           null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jab_tgs primary key (id_jab_tgs)
)
go

/*==============================================================*/
/* Table: jabfung                                               */
/*==============================================================*/
create table ref.jabfung (
   id_jabfung           numeric(5)           not null,
   id_kel_prof          numeric(5)           not null,
   nm_jabfung           varchar(50)          not null,
   angka_kredit         numeric(7,2)         null default 0,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jabfung primary key (id_jabfung)
)
go

/*==============================================================*/
/* Table: jalur_daftar                                          */
/*==============================================================*/
create table ref.jalur_daftar (
   id_jalur_daftar      numeric              identity,
   nm_jalur_daftar      varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jalur_daftar primary key (id_jalur_daftar)
)
go

/*==============================================================*/
/* Table: jenis_akt_mhs                                         */
/*==============================================================*/
create table ref.jenis_akt_mhs (
   id_jns_akt_mhs       numeric(2)           not null,
   nm_jns_akt_mhs       varchar(50)          not null,
   ket_jns_akt_mhs      varchar(100)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_akt_mhs primary key (id_jns_akt_mhs)
)
go

/*==============================================================*/
/* Table: jenis_bahan_ajar                                      */
/*==============================================================*/
create table ref.jenis_bahan_ajar (
   id_jns_bhn_ajar      int                  not null,
   nm_jns_bhn_ajar      varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_bahan_ajar primary key (id_jns_bhn_ajar)
)
go

/*==============================================================*/
/* Table: jenis_beasiswa                                        */
/*==============================================================*/
create table ref.jenis_beasiswa (
   id_jns_beasiswa      int                  not null,
   id_sumber_dana       numeric(4)           not null,
   nm_jns_beasiswa      varchar(50)          not null,
   u_pd                 numeric(1)           not null default 0
      constraint ckc_u_pd_jenis_be check (u_pd between 0 and 1 and u_pd in (0,1)),
   u_ptk                numeric(1)           not null default 0
      constraint ckc_u_ptk_jenis_be check (u_ptk between 0 and 1 and u_ptk in (0,1)),
   u_non_ca             numeric(1)           not null default 0
      constraint ckc_u_non_ca_jenis_be check (u_non_ca between 0 and 1 and u_non_ca in (0,1)),
   kat_beasiswa         numeric(1)           null 
      constraint ckc_kat_beasiswa_jenis_be check (kat_beasiswa is null or (kat_beasiswa in (1,2,3))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_beasiswa primary key (id_jns_beasiswa)
)
go

/*==============================================================*/
/* Table: jenis_diklat                                          */
/*==============================================================*/
create table ref.jenis_diklat (
   id_jns_diklat        int                  not null,
   nm_jns_diklat        varchar(50)          not null,
   u_guru               numeric(1)           not null default 0
      constraint ckc_u_guru_jenis_di check (u_guru between 0 and 1 and u_guru in (0,1)),
   u_dosen              numeric(1)           not null default 0
      constraint ckc_u_dosen_jenis_di check (u_dosen between 0 and 1 and u_dosen in (0,1)),
   u_tendik             numeric(1)           not null default 0
      constraint ckc_u_tendik_jenis_di check (u_tendik between 0 and 1 and u_tendik in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_diklat primary key (id_jns_diklat)
)
go

/*==============================================================*/
/* Table: jenis_dokumen                                         */
/*==============================================================*/
create table ref.jenis_dokumen (
   id_jns_dok           int                  not null,
   nm_jns_dok           varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_dokumen primary key (id_jns_dok)
)
go

/*==============================================================*/
/* Table: jenis_evaluasi                                        */
/*==============================================================*/
create table ref.jenis_evaluasi (
   id_jns_eval          smallint             not null,
   nm_jns_eval          varchar(50)          not null,
   ket_jns_eval         varchar(100)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_evaluasi primary key (id_jns_eval)
)
go

/*==============================================================*/
/* Table: jenis_hapus_buku                                      */
/*==============================================================*/
create table ref.jenis_hapus_buku (
   id_hapus_buku        char(1)              not null,
   ket_hapus_buku       varchar(80)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_hapus_buku primary key (id_hapus_buku)
)
go

/*==============================================================*/
/* Table: jenis_keluar                                          */
/*==============================================================*/
create table ref.jenis_keluar (
   id_jns_keluar        char(1)              not null,
   ket_keluar           varchar(40)          not null,
   a_pd                 numeric(1)           not null default 0
      constraint ckc_a_pd_jenis_ke check (a_pd between 0 and 1 and a_pd in (0,1)),
   a_ptk                numeric(1)           not null default 0
      constraint ckc_a_ptk_jenis_ke check (a_ptk between 0 and 1 and a_ptk in (0,1)),
   a_sdm_iptek          numeric(1)           not null default 0
      constraint ckc_a_sdm_iptek_jenis_ke check (a_sdm_iptek between 0 and 1 and a_sdm_iptek in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_keluar primary key (id_jns_keluar)
)
go

/*==============================================================*/
/* Table: jenis_kepanitiaan                                     */
/*==============================================================*/
create table ref.jenis_kepanitiaan (
   id_jns_panitia       int                  not null,
   nm_jns_panitia       varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_kepanitiaan primary key (id_jns_panitia)
)
go

/*==============================================================*/
/* Table: jenis_kesejahteraan                                   */
/*==============================================================*/
create table ref.jenis_kesejahteraan (
   id_jns_sejahtera     int                  not null,
   nm_jns_sejahtera     varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_kesejahteraan primary key (id_jns_sejahtera)
)
go

/*==============================================================*/
/* Table: jenis_keuangan                                        */
/*==============================================================*/
create table ref.jenis_keuangan (
   id_jns_keuangan      int                  not null,
   nm_jns_keuangan      varchar(100)         not null,
   a_pengeluaran        numeric(1)           not null default 0
      constraint ckc_a_pengeluaran_jenis_ke check (a_pengeluaran between 0 and 1 and a_pengeluaran in (0,1)),
   a_pemasukan          numeric(1)           not null default 0
      constraint ckc_a_pemasukan_jenis_ke check (a_pemasukan between 0 and 1 and a_pemasukan in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_keuangan primary key (id_jns_keuangan)
)
go

/*==============================================================*/
/* Table: jenis_lembaga                                         */
/*==============================================================*/
create table ref.jenis_lembaga (
   id_jns_lemb          numeric(5)           not null,
   nm_jns_lemb          varchar(100)         not null,
   a_sp                 numeric(1)           not null default 0
      constraint ckc_a_sp_jenis_le check (a_sp between 0 and 1 and a_sp in (0,1)),
   a_lemb_akred         numeric(1)           not null default 0
      constraint ckc_a_lemb_akred_jenis_le check (a_lemb_akred between 0 and 1 and a_lemb_akred in (0,1)),
   a_pengelola_pendidikan numeric(1)           not null default 0
      constraint ckc_a_pengelola_pendi_jenis_le check (a_pengelola_pendidikan between 0 and 1 and a_pengelola_pendidikan in (0,1)),
   a_sms                numeric(1)           not null default 0
      constraint ckc_a_sms_jenis_le check (a_sms between 0 and 1 and a_sms in (0,1)),
   a_tmpt_pengawas      numeric(1)           not null default 0
      constraint ckc_a_tmpt_pengawas_jenis_le check (a_tmpt_pengawas between 0 and 1 and a_tmpt_pengawas in (0,1)),
   a_lemb_iptek         numeric(1)           not null default 0
      constraint ckc_a_lemb_iptek_jenis_le check (a_lemb_iptek between 0 and 1 and a_lemb_iptek in (0,1)),
   a_smi                numeric(1)           not null default 0
      constraint ckc_a_smi_jenis_le check (a_smi between 0 and 1 and a_smi in (0,1)),
   sort                 int                  null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_lembaga primary key (id_jns_lemb)
)
go

/*==============================================================*/
/* Table: jenis_pendaftaran                                     */
/*==============================================================*/
create table ref.jenis_pendaftaran (
   id_jns_daftar        numeric(2)           not null,
   nm_jns_daftar        varchar(60)          not null,
   u_daftar_sekolah     numeric(1)           not null default 0
      constraint ckc_u_daftar_sekolah_jenis_pe check (u_daftar_sekolah between 0 and 1 and u_daftar_sekolah in (0,1)),
   u_daftar_rombel      numeric(1)           not null default 0
      constraint ckc_u_daftar_rombel_jenis_pe check (u_daftar_rombel between 0 and 1 and u_daftar_rombel in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_pendaftaran primary key (id_jns_daftar)
)
go

/*==============================================================*/
/* Table: jenis_penelitian                                      */
/*==============================================================*/
create table ref.jenis_penelitian (
   id_jns_lit           numeric(4)           not null,
   nm_jns_lit           varchar(100)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_penelitian primary key (id_jns_lit)
)
go

/*==============================================================*/
/* Table: jenis_penghargaan                                     */
/*==============================================================*/
create table ref.jenis_penghargaan (
   id_jns_penghargaan   int                  not null,
   nm_jns_penghargaan   varchar(160)         not null,
   u_sdm                numeric(1)           null default 0
      constraint ckc_u_sdm_jenis_pe check (u_sdm is null or (u_sdm between 0 and 1 and u_sdm in (0,1))),
   u_lembaga            numeric(1)           null default 0
      constraint ckc_u_lembaga_jenis_pe check (u_lembaga is null or (u_lembaga between 0 and 1 and u_lembaga in (0,1))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_penghargaan primary key (id_jns_penghargaan)
)
go

/*==============================================================*/
/* Table: jenis_prasarana                                       */
/*==============================================================*/
create table ref.jenis_prasarana (
   id_jns_prasarana     int                  not null,
   nm_jns_prasarana     varchar(250)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_prasarana primary key (id_jns_prasarana)
)
go

/*==============================================================*/
/* Table: jenis_prestasi                                        */
/*==============================================================*/
create table ref.jenis_prestasi (
   id_jenis_prestasi    int                  not null,
   nm_jenis_prestasi    varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_prestasi primary key (id_jenis_prestasi)
)
go

/*==============================================================*/
/* Table: jenis_publikasi                                       */
/*==============================================================*/
create table ref.jenis_publikasi (
   id_jns_pub           int                  not null,
   nm_jns_pub           varchar(100)         not null,
   a_pub_prestasi       numeric(1)           null default 0
      constraint ckc_a_pub_prestasi_jenis_pu check (a_pub_prestasi is null or (a_pub_prestasi between 0 and 1 and a_pub_prestasi in (0,1))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_publikasi primary key (id_jns_pub)
)
go

/*==============================================================*/
/* Table: jenis_sarana                                          */
/*==============================================================*/
create table ref.jenis_sarana (
   id_jns_sarana        int                  not null,
   nm_jns_sarana        varchar(60)          not null,
   kel                  varchar(50)          null,
   a_penempatan         numeric(1)           not null default 0
      constraint ckc_a_penempatan_jenis_sa check (a_penempatan between 0 and 1 and a_penempatan in (0,1)),
   ket                  varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_sarana primary key (id_jns_sarana)
)
go

/*==============================================================*/
/* Table: jenis_sdm                                             */
/*==============================================================*/
create table ref.jenis_sdm (
   id_jns_sdm           numeric(2)           not null,
   nm_jns_sdm           varchar(50)          not null,
   a_guru_kelas         numeric(1)           not null default 0
      constraint ckc_a_guru_kelas_jenis_sd check (a_guru_kelas between 0 and 1 and a_guru_kelas in (0,1)),
   a_guru_mapel         numeric(1)           not null default 0
      constraint ckc_a_guru_mapel_jenis_sd check (a_guru_mapel between 0 and 1 and a_guru_mapel in (0,1)),
   a_guru_bk            numeric(1)           not null default 0
      constraint ckc_a_guru_bk_jenis_sd check (a_guru_bk between 0 and 1 and a_guru_bk in (0,1)),
   a_guru_inklusi       numeric(1)           not null default 0
      constraint ckc_a_guru_inklusi_jenis_sd check (a_guru_inklusi between 0 and 1 and a_guru_inklusi in (0,1)),
   a_pengawas_sp        numeric(1)           not null default 0
      constraint ckc_a_pengawas_sp_jenis_sd check (a_pengawas_sp between 0 and 1 and a_pengawas_sp in (0,1)),
   a_pengawas_plb       numeric(1)           not null default 0
      constraint ckc_a_pengawas_plb_jenis_sd check (a_pengawas_plb between 0 and 1 and a_pengawas_plb in (0,1)),
   a_pengawas_mapel     numeric(1)           not null default 0
      constraint ckc_a_pengawas_mapel_jenis_sd check (a_pengawas_mapel between 0 and 1 and a_pengawas_mapel in (0,1)),
   a_pengawas_bid       numeric(1)           not null default 0
      constraint ckc_a_pengawas_bid_jenis_sd check (a_pengawas_bid between 0 and 1 and a_pengawas_bid in (0,1)),
   a_tas                numeric(1)           not null default 0
      constraint ckc_a_tas_jenis_sd check (a_tas between 0 and 1 and a_tas in (0,1)),
   a_formal             numeric(1)           not null default 0
      constraint ckc_a_formal_jenis_sd check (a_formal between 0 and 1 and a_formal in (0,1)),
   a_dosen              numeric(1)           not null default 0
      constraint ckc_a_dosen_jenis_sd check (a_dosen between 0 and 1 and a_dosen in (0,1)),
   a_peneliti           numeric(1)           not null default 0
      constraint ckc_a_peneliti_jenis_sd check (a_peneliti between 0 and 1 and a_peneliti in (0,1)),
   a_perekayasa         numeric(1)           not null default 0
      constraint ckc_a_perekayasa_jenis_sd check (a_perekayasa between 0 and 1 and a_perekayasa in (0,1)),
   a_pranata_1          numeric(1)           not null default 0
      constraint ckc_a_pranata_1_jenis_sd check (a_pranata_1 between 0 and 1 and a_pranata_1 in (0,1)),
   a_pranata_2          numeric(1)           not null default 0
      constraint ckc_a_pranata_2_jenis_sd check (a_pranata_2 between 0 and 1 and a_pranata_2 in (0,1)),
   a_pranata_3          numeric(1)           not null default 0
      constraint ckc_a_pranata_3_jenis_sd check (a_pranata_3 between 0 and 1 and a_pranata_3 in (0,1)),
   a_pranata_4          numeric(1)           not null default 0
      constraint ckc_a_pranata_4_jenis_sd check (a_pranata_4 between 0 and 1 and a_pranata_4 in (0,1)),
   a_pranata_5          numeric(1)           not null default 0
      constraint ckc_a_pranata_5_jenis_sd check (a_pranata_5 between 0 and 1 and a_pranata_5 in (0,1)),
   a_pranata_6          numeric(1)           not null default 0
      constraint ckc_a_pranata_6_jenis_sd check (a_pranata_6 between 0 and 1 and a_pranata_6 in (0,1)),
   a_pranata_7          numeric(1)           not null default 0
      constraint ckc_a_pranata_7_jenis_sd check (a_pranata_7 between 0 and 1 and a_pranata_7 in (0,1)),
   a_pranata_8          numeric(1)           not null default 0
      constraint ckc_a_pranata_8_jenis_sd check (a_pranata_8 between 0 and 1 and a_pranata_8 in (0,1)),
   a_pranata_9          numeric(1)           not null default 0
      constraint ckc_a_pranata_9_jenis_sd check (a_pranata_9 between 0 and 1 and a_pranata_9 in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_sdm primary key (id_jns_sdm)
)
go

/*==============================================================*/
/* Table: jenis_sert                                            */
/*==============================================================*/
create table ref.jenis_sert (
   id_jns_sert          numeric(3)           not null,
   nm_jns_sert          varchar(50)          not null,
   u_prof_guru          numeric(1)           not null default 0
      constraint ckc_u_prof_guru_jenis_se check (u_prof_guru between 0 and 1 and u_prof_guru in (0,1)),
   u_kepsek             numeric(1)           not null default 0
      constraint ckc_u_kepsek_jenis_se check (u_kepsek between 0 and 1 and u_kepsek in (0,1)),
   u_laboran            numeric(1)           not null default 0
      constraint ckc_u_laboran_jenis_se check (u_laboran between 0 and 1 and u_laboran in (0,1)),
   u_prof_dosen         numeric(1)           not null default 0
      constraint ckc_u_prof_dosen_jenis_se check (u_prof_dosen between 0 and 1 and u_prof_dosen in (0,1)),
   u_lembaga            numeric(1)           null default 0
      constraint ckc_u_lembaga_jenis_se check (u_lembaga is null or (u_lembaga between 0 and 1 and u_lembaga in (0,1))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_sert primary key (id_jns_sert)
)
go

/*==============================================================*/
/* Table: jenis_sms                                             */
/*==============================================================*/
create table ref.jenis_sms (
   id_jns_sms           numeric(2)           not null,
   nm_jns_sms           varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_sms primary key (id_jns_sms)
)
go

/*==============================================================*/
/* Table: jenis_subst                                           */
/*==============================================================*/
create table ref.jenis_subst (
   id_jns_subst         char(5)              not null,
   nm_jns_subst         varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_subst primary key (id_jns_subst)
)
go

/*==============================================================*/
/* Table: jenis_tes                                             */
/*==============================================================*/
create table ref.jenis_tes (
   id_jns_tes           numeric(3)           not null,
   nm_jns_tes           varchar(50)          not null,
   ket                  varchar(250)         null,
   nilai_maks           numeric(6,2)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_tes primary key (id_jns_tes)
)
go

/*==============================================================*/
/* Table: jenis_tinggal                                         */
/*==============================================================*/
create table ref.jenis_tinggal (
   id_jns_tinggal       numeric(2)           not null,
   nm_jns_tinggal       varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_tinggal primary key (id_jns_tinggal)
)
go

/*==============================================================*/
/* Table: jenis_tunjangan                                       */
/*==============================================================*/
create table ref.jenis_tunjangan (
   id_jns_tunj          int                  not null,
   nm_jns_tunj          varchar(50)          null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenis_tunjangan primary key (id_jns_tunj)
)
go

/*==============================================================*/
/* Table: jenjang_pendidikan                                    */
/*==============================================================*/
create table ref.jenjang_pendidikan (
   id_jenj_didik        numeric(2)           not null,
   nm_jenj_didik        varchar(50)          not null,
   u_jenj_lemb          numeric(1)           not null default 0
      constraint ckc_u_jenj_lemb_jenjang_ check (u_jenj_lemb between 0 and 1 and u_jenj_lemb in (0,1)),
   u_jenj_org           numeric(1)           not null default 0
      constraint ckc_u_jenj_org_jenjang_ check (u_jenj_org between 0 and 1 and u_jenj_org in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jenjang_pendidikan primary key (id_jenj_didik)
)
go

/*==============================================================*/
/* Table: jurusan                                               */
/*==============================================================*/
create table ref.jurusan (
   id_jur               varchar(25)          not null,
   nm_jur               varchar(100)         not null,
   nm_intl_jur          varchar(100)         null,
   u_sma                numeric(1)           not null default 0
      constraint ckc_u_sma_jurusan check (u_sma between 0 and 1 and u_sma in (0,1)),
   u_smk                numeric(1)           not null default 0
      constraint ckc_u_smk_jurusan check (u_smk between 0 and 1 and u_smk in (0,1)),
   u_pt                 numeric(1)           not null default 0
      constraint ckc_u_pt_jurusan check (u_pt between 0 and 1 and u_pt in (0,1)),
   u_slb                numeric(1)           not null default 0
      constraint ckc_u_slb_jurusan check (u_slb between 0 and 1 and u_slb in (0,1)),
   id_induk_jurusan     varchar(25)          null,
   id_jenj_didik        numeric(2)           not null,
   id_kel_bidang        uniqueidentifier     not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_jurusan primary key (id_jur)
)
go

/*==============================================================*/
/* Table: kategori_capaian_luaran                               */
/*==============================================================*/
create table ref.kategori_capaian_luaran (
   id_kat_capaian       numeric(3)           not null,
   nm_kat_capaian       varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kategori_capaian_luaran primary key (id_kat_capaian)
)
go

/*==============================================================*/
/* Table: kategori_kegiatan                                     */
/*==============================================================*/
create table ref.kategori_kegiatan (
   id_katgiat           int                  not null,
   id_induk_katgiat     int                  null,
   id_jns_sdm           numeric(2)           not null,
   kode_kat_pak         varchar(16)          null,
   kode_kat_bkd         varchar(16)          null,
   nm_kat               varchar(300)         not null,
   kat_unsur            char(1)              null,
   teks_judul           varchar(30)          null,
   teks_sk              varchar(30)          null,
   teks_tgl_sk          varchar(30)          null,
   teks_lokasi          varchar(30)          null,
   level_kat            numeric(1)           not null 
      constraint ckc_level_kat_kategori check (level_kat in (1,2,3)),
   sks_bkd              numeric(7,2)         null,
   ak                   numeric(7,2)         null,
   ak_maks              numeric(7,2)         null,
   satuan_nilai         char(1)              null default '2'
      constraint ckc_satuan_nilai_kategori check (satuan_nilai is null or (satuan_nilai in ('1','2','3','4','5','6'))),
   ket                  varchar(250)         null,
   a_aktif              numeric(1)           not null default 0
      constraint ckc_a_aktif_kategori check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   a_anak_bimb          numeric(1)           not null default 0
      constraint ckc_a_anak_bimb_kategori check (a_anak_bimb between 0 and 1 and a_anak_bimb in (0,1)),
   a_judul              numeric(1)           not null default 0
      constraint ckc_a_judul_kategori check (a_judul between 0 and 1 and a_judul in (0,1)),
   a_sk                 numeric(1)           not null default 0
      constraint ckc_a_sk_kategori check (a_sk between 0 and 1 and a_sk in (0,1)),
   a_peer_review        numeric(1)           not null default 0
      constraint ckc_a_peer_review_kategori check (a_peer_review between 0 and 1 and a_peer_review in (0,1)),
   acuan_waktu          char(1)              not null 
      constraint ckc_acuan_waktu_kategori check (acuan_waktu in ('1','2','3','4')),
   u_bkd                numeric(1)           not null default 0
      constraint ckc_u_bkd_kategori check (u_bkd between 0 and 1 and u_bkd in (0,1)),
   u_pak                numeric(1)           not null default 0
      constraint ckc_u_pak_kategori check (u_pak between 0 and 1 and u_pak in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kategori_kegiatan primary key (id_katgiat)
)
go

/*==============================================================*/
/* Table: kbli                                                  */
/*==============================================================*/
create table ref.kbli (
   id_kbli              numeric(7)           not null,
   id_induk_kbli        numeric(7)           null,
   kategori             varchar(2)           not null,
   kode                 varchar(5)           not null,
   judul                varchar(200)         not null,
   lv_kbli              numeric(2)           not null default 1,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kbli primary key (id_kbli)
)
go

/*==============================================================*/
/* Table: keahlian_lab                                          */
/*==============================================================*/
create table ref.keahlian_lab (
   id_keahlian_lab      smallint             not null,
   nm_keahlian_lab      varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_keahlian_lab primary key (id_keahlian_lab)
)
go

/*==============================================================*/
/* Table: keaktifan_ptk                                         */
/*==============================================================*/
create table pdrd.keaktifan_ptk (
   id_reg_ptk           uniqueidentifier     not null,
   id_thn_ajaran        numeric(4)           not null,
   a_sp_homebase        numeric(1)           not null default 0
      constraint ckc_a_sp_homebase_keaktifa check (a_sp_homebase between 0 and 1 and a_sp_homebase in (0,1)),
   a_aktif_bln_1        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_1_keaktifa check (a_aktif_bln_1 between 0 and 1 and a_aktif_bln_1 in (0,1)),
   a_aktif_bln_2        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_2_keaktifa check (a_aktif_bln_2 between 0 and 1 and a_aktif_bln_2 in (0,1)),
   a_aktif_bln_3        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_3_keaktifa check (a_aktif_bln_3 between 0 and 1 and a_aktif_bln_3 in (0,1)),
   a_aktif_bln_4        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_4_keaktifa check (a_aktif_bln_4 between 0 and 1 and a_aktif_bln_4 in (0,1)),
   a_aktif_bln_5        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_5_keaktifa check (a_aktif_bln_5 between 0 and 1 and a_aktif_bln_5 in (0,1)),
   a_aktif_bln_6        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_6_keaktifa check (a_aktif_bln_6 between 0 and 1 and a_aktif_bln_6 in (0,1)),
   a_aktif_bln_7        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_7_keaktifa check (a_aktif_bln_7 between 0 and 1 and a_aktif_bln_7 in (0,1)),
   a_aktif_bln_8        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_8_keaktifa check (a_aktif_bln_8 between 0 and 1 and a_aktif_bln_8 in (0,1)),
   a_aktif_bln_9        numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_9_keaktifa check (a_aktif_bln_9 between 0 and 1 and a_aktif_bln_9 in (0,1)),
   a_aktif_bln_10       numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_10_keaktifa check (a_aktif_bln_10 between 0 and 1 and a_aktif_bln_10 in (0,1)),
   a_aktif_bln_11       numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_11_keaktifa check (a_aktif_bln_11 between 0 and 1 and a_aktif_bln_11 in (0,1)),
   a_aktif_bln_12       numeric(1)           not null default 0
      constraint ckc_a_aktif_bln_12_keaktifa check (a_aktif_bln_12 between 0 and 1 and a_aktif_bln_12 in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_keaktifa check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_keaktifan_ptk primary key (id_reg_ptk, id_thn_ajaran)
)
go

/*==============================================================*/
/* Table: kebutuhan_khusus                                      */
/*==============================================================*/
create table ref.kebutuhan_khusus (
   id_kk                int                  not null,
   nm_kk                varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kebutuhan_khusus primary key (id_kk)
)
go

/*==============================================================*/
/* Table: kelas_kuliah                                          */
/*==============================================================*/
create table pdrd.kelas_kuliah (
   id_kls               uniqueidentifier     not null,
   id_smt               char(5)              not null,
   id_sms               uniqueidentifier     not null,
   id_mk                uniqueidentifier     not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   nm_kls               varchar(5)           not null,
   bahasan_case         varchar(200)         null,
   a_selenggara_pditt   numeric(1)           not null default 0
      constraint ckc_a_selenggara_pdit_kelas_ku check (a_selenggara_pditt between 0 and 1 and a_selenggara_pditt in (0,1)),
   a_pengguna_pditt     numeric(1)           not null default 0
      constraint ckc_a_pengguna_pditt_kelas_ku check (a_pengguna_pditt between 0 and 1 and a_pengguna_pditt in (0,1)),
   kuota_pditt          numeric(4)           not null default 0,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kelas_ku check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kelas_kuliah primary key (id_kls)
)
go

/*==============================================================*/
/* Table: kelompok_bidang                                       */
/*==============================================================*/
create table ref.kelompok_bidang (
   id_kel_bidang        uniqueidentifier     not null,
   kode_kel_bidang      varchar(20)          not null,
   nm_kel_bidang        varchar(120)         not null,
   u_sma                numeric(1)           not null default 0
      constraint ckc_u_sma_kelompok check (u_sma between 0 and 1 and u_sma in (0,1)),
   u_smk                numeric(1)           not null default 0
      constraint ckc_u_smk_kelompok check (u_smk between 0 and 1 and u_smk in (0,1)),
   u_pt                 numeric(1)           not null default 0
      constraint ckc_u_pt_kelompok check (u_pt between 0 and 1 and u_pt in (0,1)),
   u_iptek              numeric(1)           not null default 0
      constraint ckc_u_iptek_kelompok check (u_iptek between 0 and 1 and u_iptek in (0,1)),
   u_kepakaran          numeric(1)           not null default 0
      constraint ckc_u_kepakaran_kelompok check (u_kepakaran between 0 and 1 and u_kepakaran in (0,1)),
   kat_kel              varchar(3)           null,
   ket_kel_bidang       varchar(200)         null,
   a_leaf_node          numeric(1)           not null default 0
      constraint ckc_a_leaf_node_kelompok check (a_leaf_node between 0 and 1 and a_leaf_node in (0,1)),
   id_induk_bidang      uniqueidentifier     null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kelompok_bidang primary key (id_kel_bidang)
)
go

/*==============================================================*/
/* Table: kelompok_profesi                                      */
/*==============================================================*/
create table ref.kelompok_profesi (
   id_kel_prof          numeric(5)           not null,
   nm_kel_prof          varchar(50)          not null,
   ket_kel_prof         varchar(250)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kelompok_profesi primary key (id_kel_prof)
)
go

/*==============================================================*/
/* Table: kelompok_usaha                                        */
/*==============================================================*/
create table ref.kelompok_usaha (
   id_kel_usaha         char(8)              not null,
   nm_kel_usaha         varchar(60)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_kelompok_usaha primary key (id_kel_usaha)
)
go

/*==============================================================*/
/* Table: kepanitiaan                                           */
/*==============================================================*/
create table pdrd.kepanitiaan (
   id_panitia           uniqueidentifier     not null,
   id_jns_panitia       int                  not null,
   nm_panitia           varchar(80)          not null,
   instansi             varchar(100)         not null,
   tkt_panitia          char(1)              not null 
      constraint ckc_tkt_panitia_kepaniti check (tkt_panitia in ('L','D','N','I')),
   sk_tugas             varchar(80)          not null,
   tmt_sk_tugas         date                 not null,
   tst_sk_tugas         date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kepaniti check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kepanitiaan primary key (id_panitia)
)
go

/*==============================================================*/
/* Table: kesejahteraan                                         */
/*==============================================================*/
create table pdrd.kesejahteraan (
   id_kesejahteraan     uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_jns_sejahtera     int                  not null,
   nm_kesejahteraan     varchar(50)          not null,
   penyelenggara        varchar(100)         not null,
   dari_thn             numeric(4)           not null,
   sampai_thn           numeric(4)           null,
   stat                 int                  null,
   no_peserta           varchar(16)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kesejaht check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kesejahteraan primary key (id_kesejahteraan)
)
go

/*==============================================================*/
/* Table: kuliah_mhs                                            */
/*==============================================================*/
create table pdrd.kuliah_mhs (
   id_reg_pd            uniqueidentifier     not null,
   id_smt               char(5)              not null,
   id_stat_mhs          char(1)              not null,
   ips                  numeric(7,4)         null,
   sks_semester         numeric(5,2)         null,
   ipk                  numeric(5,2)         null,
   total_sks            numeric(5,2)         null,
   biaya_smt            numeric(16,2)        null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kuliah_m check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kuliah_mhs primary key (id_reg_pd, id_smt)
)
go

/*==============================================================*/
/* Table: kurikulum_sp                                          */
/*==============================================================*/
create table pdrd.kurikulum_sp (
   id_kurikulum_sp      uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           not null,
   nm_kurikulum_sp      varchar(100)         not null,
   jmlh_smt_normal      numeric(2)           null,
   a_digunakan          numeric(1)           not null default 0
      constraint ckc_a_digunakan_kurikulu check (a_digunakan between 0 and 1 and a_digunakan in (0,1)),
   jmlh_sks_lulus       numeric(5,2)         null,
   jmlh_sks_wajib       numeric(5,2)         null,
   jmlh_sks_pilihan     numeric(5,2)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_kurikulu check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_kurikulum_sp primary key (id_kurikulum_sp)
)
go

/*==============================================================*/
/* Table: laporan_studi                                         */
/*==============================================================*/
create table pdrd.laporan_studi (
   id_lap_studi         uniqueidentifier     not null,
   smt                  numeric(2)           not null,
   domisili             varchar(200)         null,
   sks_semester         numeric(5,2)         null,
   ips                  numeric(7,4)         null,
   sks_kumulatif        numeric(3)           null,
   ipk                  numeric(5,2)         null,
   hambatan             text                 null,
   solusi               text                 null,
   kemajuan_riset       text                 null,
   stat_kemajuan        int                  null 
      constraint ckc_stat_kemajuan_laporan_ check (stat_kemajuan is null or (stat_kemajuan in (1,2,3,4))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_laporan_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_laporan_studi primary key (id_lap_studi)
)
go

/*==============================================================*/
/* Table: large_object                                          */
/*==============================================================*/
create table dok.large_object (
   id_blob              uniqueidentifier     not null,
   blob_content         varbinary(max)       not null,
   file_name            varchar(500)         null,
   mime_type            varchar(100)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_large_ob check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_large_object primary key (id_blob)
)
go

/*==============================================================*/
/* Table: lembaga_akred                                         */
/*==============================================================*/
create table ref.lembaga_akred (
   id_lemb_akred        char(5)              not null,
   nm_lemb              varchar(100)         not null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   tgl_mulai_beroperasi date                 not null,
   ket                  varchar(250)         null,
   target_akred         char(1)              not null default 'P'
      constraint ckc_target_akred_lembaga_ check (target_akred in ('P','K') and target_akred = upper(target_akred)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_lembaga_akred primary key (id_lemb_akred)
)
go

/*==============================================================*/
/* Table: lembaga_iptek                                         */
/*==============================================================*/
create table pdrd.lembaga_iptek (
   id_lemb_iptek        uniqueidentifier     not null,
   nm_lemb              varchar(100)         not null,
   nrli                 char(20)             null,
   hub_lemb_iptek       char(1)              not null 
      constraint ckc_hub_lemb_iptek_lembaga_ check (hub_lemb_iptek in ('1','2','3','9')),
   nm_singkat           varchar(20)          null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_lemb_iptek check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_lembaga_iptek primary key (id_lemb_iptek)
)
go

/*==============================================================*/
/* Table: lembaga_non_sp                                        */
/*==============================================================*/
create table pdrd.lembaga_non_sp (
   id_lemb_non_sp       uniqueidentifier     not null,
   nm_lemb              varchar(100)         not null,
   singkatan            varchar(50)          null,
   deskripsi            varchar(100)         null,
   level_lemb           numeric(2)           not null,
   tgl_mulai_efektif    date                 null,
   tgl_akhir_efektif    date                 null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   id_jns_lemb          numeric(5)           not null,
   id_wil               char(8)              not null,
   id_induk_lemb_non_sp uniqueidentifier     null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_lemb_non_sp check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_lembaga_non_sp primary key (id_lemb_non_sp)
)
go

/*==============================================================*/
/* Table: lembaga_pengangkat                                    */
/*==============================================================*/
create table ref.lembaga_pengangkat (
   id_lemb_angkat       numeric(2)           not null,
   nm_lemb_angkat       varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_lembaga_pengangkat primary key (id_lemb_angkat)
)
go

/*==============================================================*/
/* Table: level_wilayah                                         */
/*==============================================================*/
create table ref.level_wilayah (
   id_level_wil         smallint             not null,
   nm_level_wilayah     varchar(50)          null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_level_wilayah primary key (id_level_wil)
)
go

/*==============================================================*/
/* Table: litabmas                                              */
/*==============================================================*/
create table pdrd.litabmas (
   id_litabmas          uniqueidentifier     not null,
   id_lemb_iptek        uniqueidentifier     not null,
   judul_litabmas       varchar(500)         not null,
   lama_kegiatan        smallint             not null,
   thn_laks_ke          smallint             not null,
   dana_dikti           numeric(16,2)        not null,
   dana_pt              numeric(16,2)        not null,
   dana_institusi_lain  numeric(16,2)        not null,
   in_kind              text                 null,
   stat_aktif           numeric(1)           not null default 0
      constraint ckc_stat_aktif_litabmas check (stat_aktif between 0 and 1 and stat_aktif in (0,1)),
   jns_litabmas         char(1)              null 
      constraint ckc_jns_litabmas_litabmas check (jns_litabmas is null or (jns_litabmas in ('L','M','X'))),
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   lokasi_kegiatan      varchar(80)          null,
   id_skim              uniqueidentifier     null,
   id_thn_usulan        numeric(4)           not null,
   id_thn_kegiatan      numeric(4)           not null,
   id_thn_laks          numeric(4)           not null,
   id_lanjutan_litabmas uniqueidentifier     null,
   id_kel_bidang        uniqueidentifier     null,
   id_tse               numeric(5)           null,
   id_smi               uniqueidentifier     null,
   id_jns_lit           numeric(4)           null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_litabmas check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_litabmas primary key (id_litabmas)
)
go

/*==============================================================*/
/* Table: map_abmas_tse                                         */
/*==============================================================*/
create table pdrd.map_abmas_tse (
   id_tse               numeric(5)           not null,
   id_litabmas          uniqueidentifier     not null,
   urutan3              numeric(2)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_map_abma check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_map_abmas_tse primary key (id_tse, id_litabmas, urutan3)
)
go

/*==============================================================*/
/* Table: map_litabmas_bidang                                   */
/*==============================================================*/
create table pdrd.map_litabmas_bidang (
   id_kel_bidang        uniqueidentifier     not null,
   id_litabmas          uniqueidentifier     not null,
   urutan2              int                  not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_map_lita check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_map_litabmas_bidang primary key (id_kel_bidang, id_litabmas, urutan2)
)
go

/*==============================================================*/
/* Table: map_publikasi_bidang                                  */
/*==============================================================*/
create table pdrd.map_publikasi_bidang (
   id_kel_bidang        uniqueidentifier     not null,
   id_publikasi         uniqueidentifier     not null,
   urutan               numeric(2)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_map_publ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_map_publikasi_bidang primary key (id_kel_bidang, id_publikasi, urutan)
)
go

/*==============================================================*/
/* Table: matkul                                                */
/*==============================================================*/
create table pdrd.matkul (
   id_mk                uniqueidentifier     not null,
   id_sms               uniqueidentifier     null,
   id_jenj_didik        numeric(2)           not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   kode_mk              varchar(20)          not null,
   nm_mk                varchar(120)         null,
   jns_mk               char(1)              null,
   kel_mk               char(1)              null,
   metode_pelaksanaan_kuliah varchar(50)          null,
   a_sap                numeric(1)           null default 0
      constraint ckc_a_sap_matkul check (a_sap is null or (a_sap between 0 and 1 and a_sap in (0,1))),
   a_silabus            numeric(1)           null default 0
      constraint ckc_a_silabus_matkul check (a_silabus is null or (a_silabus between 0 and 1 and a_silabus in (0,1))),
   a_bahan_ajar         numeric(1)           null default 0
      constraint ckc_a_bahan_ajar_matkul check (a_bahan_ajar is null or (a_bahan_ajar between 0 and 1 and a_bahan_ajar in (0,1))),
   acara_prak           numeric(1)           null,
   a_diktat             numeric(1)           null default 0
      constraint ckc_a_diktat_matkul check (a_diktat is null or (a_diktat between 0 and 1 and a_diktat in (0,1))),
   tgl_mulai_efektif    date                 null,
   tgl_akhir_efektif    date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_matkul check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_matkul primary key (id_mk)
)
go

/*==============================================================*/
/* Table: matkul_kurikulum                                      */
/*==============================================================*/
create table pdrd.matkul_kurikulum (
   id_kurikulum_sp      uniqueidentifier     not null,
   id_mk                uniqueidentifier     not null,
   smt                  numeric(2)           null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   a_wajib              numeric(1)           null default 0
      constraint ckc_a_wajib_matkul_k check (a_wajib is null or (a_wajib between 0 and 1 and a_wajib in (0,1))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_matkul_k check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_matkul_kurikulum primary key (id_kurikulum_sp)
)
go

/*==============================================================*/
/* Table: media_publikasi                                       */
/*==============================================================*/
create table ref.media_publikasi (
   id_media_pub         uniqueidentifier     not null,
   nm_media_pub         varchar(120)         not null,
   bentuk_media_pub     char(1)              null 
      constraint ckc_bentuk_media_pub_media_pu check (bentuk_media_pub is null or (bentuk_media_pub in ('C','E'))),
   grade_sinta          char(1)              null,
   jns_penerbit         char(1)              null 
      constraint ckc_jns_penerbit_media_pu check (jns_penerbit is null or (jns_penerbit in ('P','L'))),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_media_publikasi primary key (id_media_pub)
)
go

/*==============================================================*/
/* Table: menu                                                  */
/*==============================================================*/
create table man_akses.menu (
   id_menu              uniqueidentifier     not null,
   nm_menu              varchar(100)         not null,
   nm_file              varchar(100)         null,
   urutan_menu          smallint             not null,
   a_aktif              numeric(1)           not null default 0
      constraint ckc_a_aktif_menu check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   a_tampil             numeric(1)           not null default 0
      constraint ckc_a_tampil_menu check (a_tampil between 0 and 1 and a_tampil in (0,1)),
   icon                 varchar(100)         null,
   level_menu           numeric(3)           null,
   id_aplikasi          uniqueidentifier     not null,
   id_group_menu        uniqueidentifier     null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_menu primary key (id_menu)
)
go

/*==============================================================*/
/* Table: menu_role                                             */
/*==============================================================*/
create table man_akses.menu_role (
   id_peran             int                  not null,
   id_menu              uniqueidentifier     not null,
   akses_menu           varchar(50)          null,
   a_boleh_insert       numeric(1)           null default 0
      constraint ckc_a_boleh_insert_menu_rol check (a_boleh_insert is null or (a_boleh_insert between 0 and 1 and a_boleh_insert in (0,1))),
   a_boleh_show         numeric(1)           null default 0
      constraint ckc_a_boleh_show_menu_rol check (a_boleh_show is null or (a_boleh_show between 0 and 1 and a_boleh_show in (0,1))),
   a_boleh_delete       numeric(1)           null default 0
      constraint ckc_a_boleh_delete_menu_rol check (a_boleh_delete is null or (a_boleh_delete between 0 and 1 and a_boleh_delete in (0,1))),
   a_boleh_update       numeric(1)           null default 0
      constraint ckc_a_boleh_update_menu_rol check (a_boleh_update is null or (a_boleh_update between 0 and 1 and a_boleh_update in (0,1))),
   a_boleh_sanggah      numeric(1)           null default 0
      constraint ckc_a_boleh_sanggah_menu_rol check (a_boleh_sanggah is null or (a_boleh_sanggah between 0 and 1 and a_boleh_sanggah in (0,1))),
   approval_menu        numeric(1)           not null default 0
      constraint ckc_approval_menu_menu_rol check (approval_menu between 0 and 1 and approval_menu in (0,1)),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_menu_rol check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   id_updater           uniqueidentifier     not null
)
go

/*==============================================================*/
/* Table: mitra_litabmas                                        */
/*==============================================================*/
create table pdrd.mitra_litabmas (
   id_dudi              uniqueidentifier     not null,
   id_litabmas          uniqueidentifier     not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_mitra_li check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_mitra_litabmas primary key (id_dudi, id_litabmas)
)
go

/*==============================================================*/
/* Table: mou                                                   */
/*==============================================================*/
create table kerjasama.mou (
   id_mou               uniqueidentifier     not null,
   id_sp                uniqueidentifier     not null,
   id_dudi              uniqueidentifier     null,
   sk_mou               varchar(80)          not null,
   judul_mou            varchar(500)         not null,
   uraian_mou           varchar(500)         null,
   tgl_mulai            date                 not null,
   tgl_selesai          date                 not null,
   nm_dudi              varchar(100)         not null,
   npwp_dudi            char(20)             null,
   nm_bu                varchar(50)          not null,
   tel_kantor           varchar(20)          null,
   fax                  varchar(20)          null,
   cp                   varchar(100)         null,
   tel_cp               varchar(20)          null,
   jab_cp               varchar(40)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_mou check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_mou primary key (id_mou)
)
go

/*==============================================================*/
/* Table: negara                                                */
/*==============================================================*/
create table ref.negara (
   id_negara            char(2)              not null,
   nm_negara            varchar(50)          not null,
   a_ln                 numeric(1)           not null default 0
      constraint ckc_a_ln_negara check (a_ln between 0 and 1 and a_ln in (0,1)),
   benua                numeric(1)           not null 
      constraint ckc_benua_negara check (benua in (1,2,3,4,5,6)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_negara primary key (id_negara)
)
go

/*==============================================================*/
/* Table: nilai_akred                                           */
/*==============================================================*/
create table ref.nilai_akred (
   id_akred             numeric(1)           not null,
   nm_akred             varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_nilai_akred primary key (id_akred)
)
go

/*==============================================================*/
/* Table: nilai_smt_mhs                                         */
/*==============================================================*/
create table pdrd.nilai_smt_mhs (
   id_reg_ptk           uniqueidentifier     not null,
   id_kls               uniqueidentifier     not null,
   nilai_angka          numeric(4,1)         null,
   nilai_huruf          char(3)              null,
   nilai_indeks         numeric(4,2)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_nilai_sm check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_nilai_smt_mhs primary key (id_reg_ptk, id_kls)
)
go

/*==============================================================*/
/* Table: nilai_tes                                             */
/*==============================================================*/
create table pdrd.nilai_tes (
   id_nilai_tes         uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_jns_tes           numeric(3)           not null,
   nm_nilai_tes         varchar(50)          not null,
   penyelenggara        varchar(100)         not null,
   thn                  numeric(4)           not null,
   skor                 numeric(6,2)         not null,
   tgl_tes              date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_nilai_te check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_nilai_tes primary key (id_nilai_tes)
)
go

/*==============================================================*/
/* Table: non_ca                                                */
/*==============================================================*/
create table pdrd.non_ca (
   id_orang             uniqueidentifier     not null,
   id_negara            char(2)              not null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   nm_orang             varchar(100)         not null,
   jk                   char(1)              not null 
      constraint ckc_jk_non_ca check (jk in ('L','P','*')),
   nik                  char(20)             null,
   tmpt_lahir           varchar(32)          null,
   tgl_lahir            date                 not null,
   no_tel_rmh           varchar(20)          null,
   no_hp                varchar(20)          null,
   email                varchar(60)          null,
   npwp                 char(15)             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_non_ca check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_non_ca primary key (id_orang)
)
go

/*==============================================================*/
/* Table: non_ca_anggota_litabmas                               */
/*==============================================================*/
create table pdrd.non_ca_anggota_litabmas (
   id_litabmas          uniqueidentifier     not null,
   id_orang             uniqueidentifier     not null,
   peran_litabmas       char(1)              not null 
      constraint ckc_peran_litabmas_non_ca_a check (peran_litabmas in ('A','K')),
   stat_aktif           numeric(1)           not null default 0
      constraint ckc_stat_aktif_non_ca_a check (stat_aktif between 0 and 1 and stat_aktif in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_non_ca_a check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_non_ca_anggota_litabmas primary key (id_litabmas, id_orang)
)
go

/*==============================================================*/
/* Table: pangkat_golongan                                      */
/*==============================================================*/
create table ref.pangkat_golongan (
   id_pangkat_gol       numeric(2)           not null,
   kode_gol             varchar(5)           not null,
   nm_pangkat           varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_pangkat_golongan primary key (id_pangkat_gol)
)
go

/*==============================================================*/
/* Table: pd_anggota_litabmas                                   */
/*==============================================================*/
create table pdrd.pd_anggota_litabmas (
   id_pd_ang_litabmas   uniqueidentifier     not null,
   id_litabmas          uniqueidentifier     not null,
   id_pd                uniqueidentifier     not null,
   peran_litabmas       char(1)              not null 
      constraint ckc_peran_litabmas_pd_anggo check (peran_litabmas in ('A','K')),
   stat_aktif           numeric(1)           not null default 0
      constraint ckc_stat_aktif_pd_anggo check (stat_aktif between 0 and 1 and stat_aktif in (0,1)),
   nm_pd                varchar(120)         null,
   nipd                 varchar(24)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pd_anggo check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_pd_anggota_litabmas primary key (id_pd_ang_litabmas)
)
go

/*==============================================================*/
/* Table: pekerjaan                                             */
/*==============================================================*/
create table ref.pekerjaan (
   id_pekerjaan         int                  not null,
   nm_pekerjaan         varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_pekerjaan primary key (id_pekerjaan)
)
go

/*==============================================================*/
/* Table: pembiayaan                                            */
/*==============================================================*/
create table ref.pembiayaan (
   id_pembiayaan        numeric(2)           not null,
   nm_pembiayaan        varchar(40)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_pembiayaan primary key (id_pembiayaan)
)
go

/*==============================================================*/
/* Table: pembicara                                             */
/*==============================================================*/
create table pdrd.pembicara (
   id_pembicara         uniqueidentifier     not null,
   id_kat_capaian       numeric(3)           null,
   id_sdm               uniqueidentifier     not null,
   id_litabmas          uniqueidentifier     null,
   judul_makalah        varchar(500)         not null,
   nm_temu_ilmiah       varchar(160)         not null,
   kat_bicara           char(1)              not null 
      constraint ckc_kat_bicara_pembicar check (kat_bicara in ('1','2','3')),
   penyelenggara        varchar(100)         not null,
   tgl_laks             date                 null,
   bahasa               varchar(20)          null,
   tkt_temu             char(1)              null 
      constraint ckc_tkt_temu_pembicar check (tkt_temu is null or (tkt_temu in ('L','D','N','I','X'))),
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   id_afiliasi          uniqueidentifier     null,
   jns_afiliasi         char(1)              null 
      constraint ckc_jns_afiliasi_pembicar check (jns_afiliasi is null or (jns_afiliasi in ('I','S'))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pembicar check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_pembicara primary key (id_pembicara)
)
go

/*==============================================================*/
/* Table: pengelola_jurnal                                      */
/*==============================================================*/
create table pdrd.pengelola_jurnal (
   id_kelola_jurnal     uniqueidentifier     not null,
   id_media_pub         uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   peran                varchar(30)          not null,
   sk_tugas             varchar(80)          not null,
   tmt_sk_tugas         date                 not null,
   tst_sk_tugas         date                 null,
   a_aktif              numeric(1)           not null default 0
      constraint ckc_a_aktif_pengelol check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pengelol check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_pengelola_jurnal primary key (id_kelola_jurnal)
)
go

/*==============================================================*/
/* Table: pengguna                                              */
/*==============================================================*/
create table man_akses.pengguna (
   id_pengguna          uniqueidentifier     not null,
   username             varchar(60)          not null,
   password             varchar(50)          not null,
   nm_pengguna          varchar(200)         null,
   tempat_lahir         varchar(60)          null,
   tgl_lahir            date                 null,
   jenis_kelamin        char(1)              not null 
      constraint ckc_jenis_kelamin_pengguna check (jenis_kelamin in ('L','P','*')),
   alamat               varchar(255)         null,
   no_tel               varchar(20)          null,
   no_hp                varchar(20)          null,
   approval_pengguna    numeric(1)           not null default 0
      constraint ckc_approval_pengguna_pengguna check (approval_pengguna between 0 and 1 and approval_pengguna in (0,1)),
   a_aktif              numeric(1)           not null default 0
      constraint ckc_a_aktif_pengguna check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   tgl_ganti_pwd        date                 null,
   id_sdm_pengguna      uniqueidentifier     null,
   id_pd_pengguna       uniqueidentifier     null,
   id_calon_pd_pengguna uniqueidentifier     null,
   token_reg            varchar(100)         null,
   jabatan              varchar(80)          null,
   provider             varchar(500)         null,
   disable              numeric(1)           not null default 0
      constraint ckc_disable_pengguna check (disable between 0 and 1 and disable in (0,1)),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pengguna check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   id_updater           uniqueidentifier     not null,
   constraint pk_pengguna primary key (id_pengguna)
)
go

/*==============================================================*/
/* Table: penghargaan                                           */
/*==============================================================*/
create table pdrd.penghargaan (
   id_penghargaan       uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_jns_penghargaan   int                  not null,
   id_tkt_penghargaan   int                  not null,
   nm_penghargaan       varchar(160)         not null,
   tgl_penghargaan      date                 null,
   thn_penghargaan      numeric(4)           not null,
   instansi             varchar(100)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pengharg check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_penghargaan primary key (id_penghargaan)
)
go

/*==============================================================*/
/* Table: penghasilan                                           */
/*==============================================================*/
create table ref.penghasilan (
   id_penghasilan       int                  not null,
   nm_penghasilan       varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_penghasilan primary key (id_penghasilan)
)
go

/*==============================================================*/
/* Table: peran                                                 */
/*==============================================================*/
create table man_akses.peran (
   id_peran             int                  not null,
   nm_peran             varchar(50)          not null,
   a_perlu_sk           numeric(1)           not null default 0
      constraint ckc_a_perlu_sk_peran check (a_perlu_sk between 0 and 1 and a_perlu_sk in (0,1)),
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_peran primary key (id_peran)
)
go

/*==============================================================*/
/* Table: peserta_didik                                         */
/*==============================================================*/
create table pdrd.peserta_didik (
   id_pd                uniqueidentifier     not null,
   nm_pd                varchar(120)         not null,
   jk                   char(1)              null 
      constraint ckc_jk_peserta_ check (jk is null or (jk in ('L','P','*'))),
   nisn                 char(10)             null,
   nik                  char(20)             null,
   tmpt_lahir           varchar(32)          not null,
   tgl_lahir            date                 null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   tlpn_rumah           varchar(20)          null,
   tlpn_hp              varchar(20)          null,
   nm_wali              varchar(100)         null,
   tgl_lahir_wali       date                 null,
   id_pendidikan_wali   numeric(2)           null,
   id_pekerjaan_wali    int                  null,
   id_penghasilan_wali  int                  null,
   nm_ayah              varchar(100)         null,
   tgl_lahir_ayah       date                 null,
   nik_ayah             char(20)             null,
   id_pendidikan_ayah   numeric(2)           null,
   id_pekerjaan_ayah    int                  null,
   id_penghasilan_ayah  int                  null,
   id_kk_ayah           int                  null,
   nm_ibu_kandung       varchar(100)         null,
   tgl_lahir_ibu        date                 null,
   nik_ibu              char(20)             null,
   id_pendidikan_ibu    numeric(2)           null,
   id_pekerjaan_ibu     int                  null,
   id_penghasilan_ibu   int                  null,
   id_kk_ibu            int                  null,
   a_terima_kps         numeric(1)           not null default 0
      constraint ckc_a_terima_kps_peserta_ check (a_terima_kps between 0 and 1 and a_terima_kps in (0,1)),
   no_kps               varchar(40)          null,
   id_kk                int                  null,
   id_kewarganegaraan   char(2)              not null,
   id_agama             smallint             not null,
   id_blob              uniqueidentifier     null,
   id_jns_tinggal       numeric(2)           null,
   id_stat_mhs          char(1)              not null,
   id_alat_transport    numeric(2)           null,
   id_wil               char(8)              null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_peserta_ check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_peserta_didik primary key (id_pd)
)
go

/*==============================================================*/
/* Table: pj_aplikasi                                           */
/*==============================================================*/
create table man_akses.pj_aplikasi (
   id_pj_aplikasi       uniqueidentifier     not null,
   id_pengguna          uniqueidentifier     not null,
   id_aplikasi          uniqueidentifier     not null,
   nm_pj                varchar(100)         not null,
   jabatan_pj           varchar(100)         not null,
   no_hp                varchar(20)          not null,
   email                varchar(60)          not null,
   a_masih              numeric(1)           not null default 0
      constraint ckc_a_masih_pj_aplik check (a_masih between 0 and 1 and a_masih in (0,1)),
   wkt_selesai          datetime             null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_pj_aplik check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   id_updater           uniqueidentifier     not null,
   constraint pk_pj_aplikasi primary key (id_pj_aplikasi)
)
go

/*==============================================================*/
/* Table: prestasi                                              */
/*==============================================================*/
create table pdrd.prestasi (
   id_prestasi          uniqueidentifier     not null,
   id_jenis_prestasi    int                  not null,
   nm_prestasi          varchar(160)         not null,
   thn_prestasi         numeric(4)           not null,
   penyelenggara        varchar(100)         null,
   peringkat            numeric(1)           null,
   id_sp                uniqueidentifier     not null,
   id_pd                uniqueidentifier     not null,
   id_tkt_prestasi      int                  not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_prestasi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_prestasi primary key (id_prestasi)
)
go

/*==============================================================*/
/* Table: profil_prodi                                          */
/*==============================================================*/
create table pdrd.profil_prodi (
   id_thn_ajaran        numeric(4)           not null,
   id_sms               uniqueidentifier     not null,
   desk_singkat         text                 null,
   visi                 text                 null,
   misi                 text                 null,
   tujuan               text                 null,
   sasaran              text                 null,
   kompetensi           text                 null,
   capaian_belajar      text                 null,
   upaya_sebar          text                 null,
   keberlanjutan        text                 null,
   frek_kur             char(1)              null,
   laks_kur             char(1)              null,
   himp_alumni          text                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_profil_prodi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null
)
go

/*==============================================================*/
/* Table: profil_pt                                             */
/*==============================================================*/
create table pdrd.profil_pt (
   id_sp                uniqueidentifier     not null,
   id_thn_ajaran        numeric(4)           not null,
   desk_singkat         text                 null,
   visi                 text                 null,
   misi                 text                 null,
   tujuan               text                 null,
   sasaran              text                 null,
   seleksi_terima       text                 null,
   pola_pimpin          text                 null,
   sistem_kelola        text                 null,
   sistem_jamin_mutu    text                 null,
   alasan_transfer_mhs  text                 null,
   peran_ajar           text                 null,
   peran_susun_kur      text                 null,
   peran_suasana_akad   text                 null,
   manfaat_tik          text                 null,
   sebar_info           text                 null,
   renc_kembang_si      text                 null,
   eval_lulusan         text                 null,
   mekanisme_eval_lulusan text                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_delete_profil_pt check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null
)
go

/*==============================================================*/
/* Table: publikasi                                             */
/*==============================================================*/
create table pdrd.publikasi (
   id_publikasi         uniqueidentifier     not null,
   id_jns_pub           int                  not null,
   judul                varchar(200)         not null,
   judul_chapter        varchar(500)         null,
   judul_asli           varchar(500)         null,
   abstrak              text                 null,
   nama_jurnal          varchar(100)         null,
   laman_jurnal         varchar(1000)        null,
   tgl_terbit           date                 null,
   edisi                varchar(15)          null,
   impact_jurnal        numeric(5,2)         null,
   vol                  numeric(5)           null,
   no                   numeric(3)           null,
   hal                  varchar(15)          null,
   jml_hal              int                  null,
   penerbit             varchar(100)         null,
   kota                 varchar(20)          null,
   a_seminar            numeric(1)           null default 0
      constraint ckc_a_seminar_publikas check (a_seminar is null or (a_seminar between 0 and 1 and a_seminar in (0,1))),
   a_prosiding          numeric(1)           null default 0
      constraint ckc_a_prosiding_publikas check (a_prosiding is null or (a_prosiding between 0 and 1 and a_prosiding in (0,1))),
   dimensi              varchar(25)          null,
   bahasa               varchar(20)          null,
   no_paten             varchar(100)         null,
   pemberi_paten        varchar(60)          null,
   doi                  varchar(100)         null,
   isbn                 varchar(20)          null,
   issn                 varchar(9)           null,
   e_issn               varchar(9)           null,
   url                  varchar(256)         null,
   ket                  varchar(250)         null,
   pengguna_produk_jasa char(500)            null,
   a_komersialisasi     numeric(1)           not null default 0
      constraint ckc_a_komersialisasi_publikas check (a_komersialisasi between 0 and 1 and a_komersialisasi in (0,1)),
   stat_impor_sinta     numeric(1)           null,
   quartile             numeric(1)           null,
   id_kat_capaian       numeric(3)           null,
   id_media_pub         uniqueidentifier     null,
   id_litabmas          uniqueidentifier     null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_publikas check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_publikasi primary key (id_publikasi)
)
go

/*==============================================================*/
/* Table: reg_pd                                                */
/*==============================================================*/
create table pdrd.reg_pd (
   id_reg_pd            uniqueidentifier     not null,
   id_sp                uniqueidentifier     null,
   id_sms               uniqueidentifier     null,
   id_pd                uniqueidentifier     not null,
   id_jns_daftar        numeric(2)           not null,
   id_jalur_daftar      numeric              not null,
   id_pembiayaan        numeric(2)           not null,
   id_smt               char(5)              null,
   tgl_masuk_sp         date                 not null,
   nipd                 varchar(24)          not null,
   id_semester_masuk    char(5)              not null,
   id_sp_asal           uniqueidentifier     not null,
   nm_pt_asal           varchar(100)         null,
   id_prodi_asal        uniqueidentifier     null,
   nm_prodi_asal        varchar(100)         null,
   id_jns_keluar        char(1)              null,
   tgl_keluar           date                 null,
   ket                  varchar(250)         null,
   skhun                char(20)             null,
   no_peserta_ujian     char(20)             null,
   no_seri_ijazah       varchar(80)          null,
   asal_data_ijazah     char(1)              not null default '0',
   bidang_mayor         varchar(100)         null,
   bidang_minor         varchar(100)         null,
   sks_diakui           numeric(3)           null,
   jalur_skripsi        numeric(1)           null,
   judul_skripsi        varchar(500)         null,
   bln_awal_bimbingan   date                 null,
   bln_akhir_bimbingan  date                 null,
   sk_yudisium          varchar(80)          null,
   tgl_sk_yudisium      date                 null,
   ipk                  numeric(5,2)         null,
   sert_prof            varchar(80)          null,
   a_pindah_mhs_asing   numeric(1)           null default 0
      constraint ckc_a_pindah_mhs_asin_reg_pd check (a_pindah_mhs_asing is null or (a_pindah_mhs_asing between 0 and 1 and a_pindah_mhs_asing in (0,1))),
   biaya_masuk_kuliah   numeric(16,2)        null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_reg_pd check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_reg_pd primary key (id_reg_pd)
)
go

/*==============================================================*/
/* Table: reg_ptk                                               */
/*==============================================================*/
create table pdrd.reg_ptk (
   id_reg_ptk           uniqueidentifier     not null,
   id_jns_keluar        char(1)              null,
   id_sdm               uniqueidentifier     null,
   id_sp                uniqueidentifier     not null,
   id_stat_pegawai      smallint             not null,
   id_ikatan_kerja      char(1)              not null,
   id_sms               uniqueidentifier     null,
   no_srt_tgs           varchar(80)          not null,
   tgl_srt_tgs          date                 not null,
   tmt_srt_tgs          date                 not null,
   tgl_ptk_keluar       date                 null,
   nidn                 char(10)             null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_reg_ptk check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_reg_ptk primary key (id_reg_ptk)
)
go

/*==============================================================*/
/* Table: role_pengguna                                         */
/*==============================================================*/
create table man_akses.role_pengguna (
   id_role_pengguna     uniqueidentifier     not null,
   id_pengguna          uniqueidentifier     not null,
   id_organisasi        uniqueidentifier     not null,
   id_peran             int                  not null,
   sk_penugasan         varchar(80)          null,
   tgl_sk_penugasan     date                 null,
   approval_peran       numeric(1)           not null default 0
      constraint ckc_approval_peran_role_pen check (approval_peran between 0 and 1 and approval_peran in (0,1)),
   tgl_kadarluasa       date                 null,
   last_active          datetime             null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_role_pen check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   id_updater           uniqueidentifier     not null,
   constraint pk_role_pengguna primary key (id_role_pengguna)
)
go

/*==============================================================*/
/* Table: ruang                                                 */
/*==============================================================*/
create table sarpras.ruang (
   id_ruang             uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   kd_satuan            char(1)              not null,
   kode_ruang           varchar(10)          not null,
   nama_ruang           varchar(100)         not null,
   lantai               numeric(3)           not null,
   kapasitas            numeric(5)           null,
   luas                 float                null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_ruang check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_ruang primary key (id_ruang)
)
go

/*==============================================================*/
/* Table: rwy_didik_nonformal                                   */
/*==============================================================*/
create table pdrd.rwy_didik_nonformal (
   id_rwy_didik_nonformal uniqueidentifier     not null,
   id_sms               uniqueidentifier     not null,
   id_rwy_didik_formal  uniqueidentifier     not null,
   no_sk_setara         varchar(80)          not null,
   tgl_sk_setara        date                 not null,
   tmt_sk_setara        date                 not null,
   level_kkni           int                  not null,
   nm_prodi_penyetara   varchar(100)         not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_didi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_didik_nonformal primary key (id_rwy_didik_nonformal)
)
go

/*==============================================================*/
/* Table: rwy_fungsional                                        */
/*==============================================================*/
create table pdrd.rwy_fungsional (
   id_rwy_jabfung       uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_kel_bidang        uniqueidentifier     null,
   id_jabfung           numeric(5)           not null,
   sk_jabfung           varchar(80)          not null,
   tmt_sk_jabfung       date                 not null,
   angka_kredit         numeric(7,2)         null default 0,
   lebih_ajar           numeric(7,2)         null,
   lebih_lit            numeric(7,2)         null,
   lebih_pengmas        numeric(7,2)         null,
   lebih_tunjang        numeric(7,2)         null,
   bidang_ilmu          varchar(200)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_fung check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_fungsional primary key (id_rwy_jabfung)
)
go

/*==============================================================*/
/* Table: rwy_kepangkatan                                       */
/*==============================================================*/
create table pdrd.rwy_kepangkatan (
   id_rwy_pangkat       uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_pangkat_gol       numeric(2)           not null,
   sk_pangkat           varchar(80)          not null,
   tgl_sk_pangkat       date                 not null,
   tmt_sk_pangkat       date                 not null,
   masa_kerja_gol_thn   numeric(2)           not null,
   masa_kerja_gol_bln   numeric(2)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_kepa check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_kepangkatan primary key (id_rwy_pangkat)
)
go

/*==============================================================*/
/* Table: rwy_pekerjaan                                         */
/*==============================================================*/
create table pdrd.rwy_pekerjaan (
   id_rwy_kerja         uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_dudi              uniqueidentifier     null,
   id_pekerjaan         int                  not null,
   id_kbli              numeric(7)           null,
   nm_jabatan           varchar(150)         not null,
   deskripsi_kerja      varchar(500)         null,
   instansi             varchar(100)         null,
   divisi               varchar(100)         null,
   mulai_bekerja        date                 not null,
   selesai_bekerja      date                 null,
   a_ln                 numeric(1)           not null default 0
      constraint ckc_a_ln_rwy_peke check (a_ln between 0 and 1 and a_ln in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_peke check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_pekerjaan primary key (id_rwy_kerja)
)
go

/*==============================================================*/
/* Table: rwy_pend_formal                                       */
/*==============================================================*/
create table pdrd.rwy_pend_formal (
   id_rwy_didik_formal  uniqueidentifier     not null,
   id_sms               uniqueidentifier     null,
   id_sdm               uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           not null,
   id_bid_studi         int                  not null,
   id_gelar_akad        int                  null,
   nm_sp_formal         varchar(100)         not null,
   fak                  varchar(100)         null,
   a_kependidikan       numeric(1)           not null default 0
      constraint ckc_a_kependidikan_rwy_pend check (a_kependidikan between 0 and 1 and a_kependidikan in (0,1)),
   thn_masuk            numeric(4)           not null,
   thn_lulus            numeric(4)           null,
   nipd                 varchar(24)          not null,
   stat_kul             char(1)              not null,
   smt                  numeric(2)           null,
   sks_lulus            numeric(3)           not null,
   ipk                  numeric(5,2)         not null,
   sk_setara            varchar(80)          null,
   tgl_sk_setara        date                 null,
   no_ijazah            varchar(80)          null,
   judul_tesis          varchar(500)         null,
   tgl_lulus            date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_pend check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_pend_formal primary key (id_rwy_didik_formal)
)
go

/*==============================================================*/
/* Table: rwy_sertifikasi                                       */
/*==============================================================*/
create table pdrd.rwy_sertifikasi (
   id_rwy_sert          uniqueidentifier     not null,
   id_jns_sert          numeric(3)           not null,
   id_bid_studi         int                  not null,
   id_sdm               uniqueidentifier     not null,
   thn_sert             numeric(4)           not null,
   sk_sert              varchar(80)          not null,
   nrg                  varchar(15)          null,
   no_peserta           varchar(16)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_sert check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_sertifikasi primary key (id_rwy_sert)
)
go

/*==============================================================*/
/* Table: rwy_struktural                                        */
/*==============================================================*/
create table pdrd.rwy_struktural (
   id_rwy_jabstruk      uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_jab_tgs           numeric(5)           not null,
   sk_jabstruk          varchar(80)          not null,
   tmt_sk_jabstruk      date                 not null,
   tst_sk_jabstruk      date                 null,
   lokasi_tugas         varchar(80)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_rwy_stru check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_rwy_struktural primary key (id_rwy_jabstruk)
)
go

/*==============================================================*/
/* Table: satuan                                                */
/*==============================================================*/
create table ref.satuan (
   kd_satuan            char(1)              not null,
   nm_satuan            varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_satuan primary key (kd_satuan)
)
go

/*==============================================================*/
/* Table: satuan_pendidikan                                     */
/*==============================================================*/
create table pdrd.satuan_pendidikan (
   id_sp                uniqueidentifier     not null,
   nm_lemb              varchar(100)         not null,
   nss                  char(12)             null,
   npsn                 char(8)              null,
   nm_singkat           varchar(20)          null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   stat_sp              char(1)              not null,
   sk_pendirian_sp      varchar(80)          null,
   tgl_sk_pendirian_sp  date                 null,
   tgl_berdiri          date                 null,
   sk_izin_operasi      varchar(80)          null,
   tgl_sk_izin_operasi  date                 null,
   no_rek               varchar(20)          null,
   nm_bank              varchar(100)         null,
   unit_cabang          varchar(60)          null,
   nm_rek               varchar(50)          null,
   a_mbs                numeric(1)           not null default 0
      constraint ckc_a_mbs_satuan_p check (a_mbs between 0 and 1 and a_mbs in (0,1)),
   luas_tanah_milik     numeric(7)           not null,
   luas_tanah_bukan_milik numeric(7)           not null,
   a_lptk               numeric(1)           not null default 0
      constraint ckc_a_lptk_satuan_p check (a_lptk between 0 and 1 and a_lptk in (0,1)),
   kode_reg             bigint               null,
   npwp                 char(15)             null,
   nm_wp                varchar(100)         null,
   flag                 char(1)              null,
   id_pembina           uniqueidentifier     not null,
   id_blob              uniqueidentifier     null,
   id_stat_milik        numeric(1)           not null,
   id_wil               char(8)              not null,
   id_bp                smallint             not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_satuan_p check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_satuan_pendidikan primary key (id_sp)
)
go

/*==============================================================*/
/* Table: sdm                                                   */
/*==============================================================*/
create table pdrd.sdm (
   id_sdm               uniqueidentifier     not null,
   nm_sdm               varchar(100)         not null,
   jk                   char(1)              not null 
      constraint ckc_jk_sdm check (jk in ('L','P','*')),
   tmpt_lahir           varchar(32)          not null,
   tgl_lahir            date                 not null,
   nik                  char(20)             not null,
   niy_nigk             varchar(30)          null,
   nuptk                char(16)             null,
   nidn                 char(10)             null,
   nsdmi                char(12)             null,
   stat_kawin           numeric(1)           not null,
   no_tel_rmh           varchar(20)          null,
   no_hp                varchar(20)          null,
   email                varchar(60)          null,
   nip                  varchar(18)          null,
   tmt_pns              date                 null,
   nm_suami_istri       varchar(100)         null,
   nip_suami_istri      char(18)             null,
   sk_cpns              varchar(80)          null,
   tgl_sk_cpns          date                 null,
   sk_angkat            varchar(80)          null,
   tmt_sk_angkat        date                 null,
   npwp                 char(15)             null,
   nm_wp                varchar(100)         null,
   stat_data            int                  null,
   akta_ijin_ajar       char(1)              null,
   nira                 char(30)             null,
   kewarganegaraan      char(2)              not null,
   id_jns_sdm           numeric(2)           not null,
   id_wil               char(8)              not null,
   id_stat_aktif        numeric(2)           not null,
   id_agama             smallint             not null,
   id_keahlian_lab      smallint             null,
   id_pekerjaan_suami_istri int                  not null,
   id_lemb_angkat       numeric(2)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_sdm check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_sdm primary key (id_sdm)
)
go

/*==============================================================*/
/* Table: sdm_anggota_litabmas                                  */
/*==============================================================*/
create table pdrd.sdm_anggota_litabmas (
   id_litabmas          uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   peran_litabmas       char(1)              not null 
      constraint ckc_peran_litabmas_sdm_angg check (peran_litabmas in ('A','K')),
   stat_aktif           numeric(1)           not null default 0
      constraint ckc_stat_aktif_sdm_angg check (stat_aktif between 0 and 1 and stat_aktif in (0,1)),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_sdm_angg check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_sdm_anggota_litabmas primary key (id_litabmas, id_sdm)
)
go

/*==============================================================*/
/* Table: semester                                              */
/*==============================================================*/
create table ref.semester (
   id_smt               char(5)              not null,
   id_thn_ajaran        numeric(4)           not null,
   nm_smt               varchar(50)          not null,
   smt                  numeric(2)           not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_semester primary key (id_smt)
)
go

/*==============================================================*/
/* Table: skim_kegiatan                                         */
/*==============================================================*/
create table ref.skim_kegiatan (
   id_skim              uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           null,
   nm_skim              varchar(80)          not null,
   nm_singkat_skim      varchar(40)          null,
   kd_skim              varchar(20)          null,
   tst_skim             date                 null,
   jml_min_personil     smallint             not null default 1
      constraint ckc_jml_min_personil_skim_keg check (jml_min_personil >= 1),
   jml_maks_personil    smallint             not null default 1,
   jml_maks_keikutsertaan smallint             null default 2,
   jml_maks_sbg_ketua   smallint             null default 1,
   dana_min_thn_berjalan numeric(16,2)        null,
   dana_maks_thn_berjalan numeric(16,2)        not null,
   ket_skim             varchar(512)         null,
   deviasi_nilai        float                not null,
   passing_grade        float                not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_skim_kegiatan primary key (id_skim)
)
go

/*==============================================================*/
/* Table: smi                                                   */
/*==============================================================*/
create table pdrd.smi (
   id_smi               uniqueidentifier     not null,
   singkatan            varchar(50)          null,
   kode_smi             varchar(20)          null,
   tgl_berdiri          date                 null,
   sk_selenggara        varchar(80)          null,
   tgl_sk_selenggara    date                 null,
   tmt_sk_selenggara    date                 null,
   tst_sk_selenggara    date                 null,
   habis_masa_laku      date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_smi check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_smi primary key (id_smi)
)
go

/*==============================================================*/
/* Table: sms                                                   */
/*==============================================================*/
create table pdrd.sms (
   id_sms               uniqueidentifier     not null,
   nm_lemb              varchar(100)         not null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   smt_mulai            char(5)              null,
   a_selenggara_subst   numeric(1)           not null default 0
      constraint ckc_a_selenggara_subs_sms check (a_selenggara_subst between 0 and 1 and a_selenggara_subst in (0,1)),
   kode_prodi           varchar(10)          null,
   nm_prodi_english     varchar(100)         null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          null,
   kode_pos             char(5)              null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   singkatan            varchar(50)          null,
   tgl_berdiri          date                 null,
   sk_selenggara        varchar(80)          null,
   tgl_sk_selenggara    date                 null,
   tmt_sk_selenggara    date                 null,
   tst_sk_selenggara    date                 null,
   kpst_pd              numeric(5)           null,
   sks_lulus            numeric(3)           null,
   gelar_lulusan        varchar(10)          null,
   stat_prodi           char(1)              null default 'A'
      constraint ckc_stat_prodi_sms check (stat_prodi is null or (stat_prodi in ('A','B','K','N','H'))),
   polesei_nilai        char(1)              null default 'B'
      constraint ckc_polesei_nilai_sms check (polesei_nilai is null or (polesei_nilai in ('B','T'))),
   a_kependidikan       numeric(1)           null default 0
      constraint ckc_a_kependidikan_sms check (a_kependidikan is null or (a_kependidikan between 0 and 1 and a_kependidikan in (0,1))),
   sistem_ajar          numeric(1)           null,
   a_pjj                numeric(1)           null default 0
      constraint ckc_a_pjj_sms check (a_pjj is null or (a_pjj between 0 and 1 and a_pjj in (0,1))),
   a_psdku              numeric(1)           null default 0
      constraint ckc_a_psdku_sms check (a_psdku is null or (a_psdku between 0 and 1 and a_psdku in (0,1))),
   luas_lab             numeric(5)           null,
   kapasitas_prak_satu_shift numeric(4)           null,
   jml_mhs_pengguna     numeric(6)           null,
   jml_jam_penggunaan   numeric(5)           null,
   jml_prodi_pengguna   numeric(3)           null,
   jml_modul_prak_sendiri numeric(4)           null,
   jml_modul_prak_lain  numeric(4)           null,
   fungsi_selain_prak   char(1)              null,
   penggunaan_lab       char(1)              null,
   a_pkl                numeric(1)           null default 0
      constraint ckc_a_pkl_sms check (a_pkl is null or (a_pkl between 0 and 1 and a_pkl in (0,1))),
   id_sp                uniqueidentifier     not null,
   id_jenj_didik        numeric(2)           not null,
   id_jns_sms           numeric(2)           not null,
   id_fungsi_lab        char(1)              not null,
   id_kel_usaha         char(8)              not null,
   id_blob              uniqueidentifier     null,
   id_wil               char(8)              not null,
   id_jur               varchar(25)          null,
   id_induk_sms         uniqueidentifier     null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_sms check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_sms primary key (id_sms)
)
go

/*==============================================================*/
/* Table: sms_kerjasama                                         */
/*==============================================================*/
create table kerjasama.sms_kerjasama (
   id_sms_kerjasama     uniqueidentifier     not null,
   id_sumber_dana       numeric(4)           null,
   id_sms               uniqueidentifier     not null,
   id_mou               uniqueidentifier     not null,
   hsl_prod_brg         varchar(200)         null,
   hsl_prod_jasa        varchar(200)         null,
   omzet_barang_per_bulan numeric(16,2)        null,
   omzet_jasa_per_bulan numeric(16,2)        null,
   prestasi_penghargaan varchar(200)         null,
   pangsa_psr_brg       varchar(200)         null,
   pangsa_psr_jasa      varchar(200)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_sms_kerj check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_sms_kerjasama primary key (id_sms_kerjasama)
)
go

/*==============================================================*/
/* Table: status_anak                                           */
/*==============================================================*/
create table ref.status_anak (
   id_stat_anak         numeric(1)           not null,
   nm_stat_anak         varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_anak primary key (id_stat_anak)
)
go

/*==============================================================*/
/* Table: status_keaktifan_pegawai                              */
/*==============================================================*/
create table ref.status_keaktifan_pegawai (
   id_stat_aktif        numeric(2)           not null,
   nm_stat_aktif        varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_keaktifan_pegawai primary key (id_stat_aktif)
)
go

/*==============================================================*/
/* Table: status_kepegawaian                                    */
/*==============================================================*/
create table ref.status_kepegawaian (
   id_stat_pegawai      smallint             not null,
   nm_stat_pegawai      varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_kepegawaian primary key (id_stat_pegawai)
)
go

/*==============================================================*/
/* Table: status_kepemilikan                                    */
/*==============================================================*/
create table ref.status_kepemilikan (
   id_stat_milik        numeric(1)           not null,
   nm_stat_milik        varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_kepemilikan primary key (id_stat_milik)
)
go

/*==============================================================*/
/* Table: status_mahasiswa                                      */
/*==============================================================*/
create table ref.status_mahasiswa (
   id_stat_mhs          char(1)              not null,
   nm_stat_mhs          varchar(30)          not null,
   ket_stat_mhs         varchar(100)         null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_mahasiswa primary key (id_stat_mhs)
)
go

/*==============================================================*/
/* Table: status_milik_sarpras                                  */
/*==============================================================*/
create table ref.status_milik_sarpras (
   id_stat_milik_sarpras numeric(1)           not null,
   nm_stat_milik_sarpras varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_status_milik_sarpras primary key (id_stat_milik_sarpras)
)
go

/*==============================================================*/
/* Table: substansi_kuliah                                      */
/*==============================================================*/
create table pdrd.substansi_kuliah (
   id_subst             uniqueidentifier     not null,
   id_jns_subst         char(5)              not null,
   nm_subst             varchar(50)          not null,
   sks_mk               numeric(5,2)         null,
   sks_tm               numeric(5,2)         null,
   sks_prak             numeric(5,2)         null,
   sks_prak_lap         numeric(5,2)         null,
   sks_sim              numeric(5,2)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_substans check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_substansi_kuliah primary key (id_subst)
)
go

/*==============================================================*/
/* Table: sumber_dana                                           */
/*==============================================================*/
create table ref.sumber_dana (
   id_sumber_dana       numeric(4)           not null,
   nm_sumber_dana       varchar(80)          not null,
   u_blockgrant         numeric(1)           not null default 0
      constraint ckc_u_blockgrant_sumber_d check (u_blockgrant between 0 and 1 and u_blockgrant in (0,1)),
   u_beasiswa           numeric(1)           not null default 0
      constraint ckc_u_beasiswa_sumber_d check (u_beasiswa between 0 and 1 and u_beasiswa in (0,1)),
   u_lit                numeric(1)           not null default 0
      constraint ckc_u_lit_sumber_d check (u_lit between 0 and 1 and u_lit in (0,1)),
   u_unit_usaha         numeric(1)           not null default 0
      constraint ckc_u_unit_usaha_sumber_d check (u_unit_usaha between 0 and 1 and u_unit_usaha in (0,1)),
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_sumber_dana primary key (id_sumber_dana)
)
go

/*==============================================================*/
/* Table: tahun_ajaran                                          */
/*==============================================================*/
create table ref.tahun_ajaran (
   id_thn_ajaran        numeric(4)           not null,
   nm_thn_ajaran        varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tahun_ajaran primary key (id_thn_ajaran)
)
go

/*==============================================================*/
/* Table: tahun_anggaran                                        */
/*==============================================================*/
create table ref.tahun_anggaran (
   id_tahun_anggaran    numeric(4)           not null,
   nm_tahun_anggaran    varchar(50)          not null,
   a_periode_aktif      numeric(1)           not null default 0
      constraint ckc_a_periode_aktif_tahun_an check (a_periode_aktif between 0 and 1 and a_periode_aktif in (0,1)),
   tgl_mulai            date                 not null,
   tgl_selesai          date                 not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tahun_anggaran primary key (id_tahun_anggaran)
)
go

/*==============================================================*/
/* Table: tanah                                                 */
/*==============================================================*/
create table sarpras.tanah (
   id_tanah             uniqueidentifier     not null,
   id_stat_milik_sarpras numeric(1)           not null,
   id_sms               uniqueidentifier     not null,
   id_jns_prasarana     int                  not null,
   id_hapus_buku        char(1)              null,
   kd_kl                char(3)              not null,
   kd_satker            varchar(20)          not null,
   kd_brg               varchar(10)          not null,
   nup                  int                  not null,
   kode_eselon1         varchar(2)           null,
   nama_eselon1         varchar(255)         null,
   kode_sub_satker      varchar(3)           null,
   nama_sub_satker      varchar(255)         null,
   panjang              float                null,
   lebar                float                null,
   luas                 float                null,
   alamat               varchar(255)         null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   bmn_satker           varchar(20)          null,
   bmn_kd_barang        varchar(10)          null,
   bmn_nup              numeric(3)           null,
   nm_prasarana         varchar(100)         not null,
   spesifikasi          varchar(300)         null,
   tgl_perolehan        date                 null,
   thn_produksi         numeric(4)           null,
   nilai_perolehan      numeric(20,2)        null,
   nilai_buku           numeric(20,2)        null,
   merk                 varchar(255)         null,
   kd_kab_kota          varchar(3)           null,
   nm_kab_kota          varchar(255)         null,
   kd_prov              varchar(3)           null,
   nm_prov              varchar(255)         null,
   penggunaan           varchar(255)         null,
   kondisi              varchar(255)         null,
   no_dok_kepemilikan   varchar(255)         null,
   dok_kepemilikan      varchar(255)         null,
   jns_dok_kepemilikan  varchar(255)         null,
   tgl_hapus_buku       date                 null,
   asal_data            char(1)              null default '9'
      constraint ckc_asal_data_tanah check (asal_data is null or (asal_data in ('1','2','3','4','5','6','9','7','8'))),
   tgl_mutasi_keluar    date                 null,
   batas                varchar(1)           null,
   ket_tanah            varchar(255)         null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tanah check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tanah primary key (id_tanah)
)
go

/*==============================================================*/
/* Table: tingkat_penghargaan                                   */
/*==============================================================*/
create table ref.tingkat_penghargaan (
   id_tkt_penghargaan   int                  not null,
   nm_tkt_penghargaan   varchar(50)          not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tingkat_penghargaan primary key (id_tkt_penghargaan)
)
go

/*==============================================================*/
/* Table: tingkat_prestasi                                      */
/*==============================================================*/
create table ref.tingkat_prestasi (
   id_tkt_prestasi      int                  not null,
   nm_tkt_prestasi      varchar(100)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tingkat_prestasi primary key (id_tkt_prestasi)
)
go

/*==============================================================*/
/* Table: tse                                                   */
/*==============================================================*/
create table ref.tse (
   id_tse               numeric(5)           not null,
   kode_tse             varchar(20)          not null,
   nm_tse               varchar(120)         not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_tse primary key (id_tse)
)
go

/*==============================================================*/
/* Table: tugas_belajar                                         */
/*==============================================================*/
create table pdrd.tugas_belajar (
   id_tb                uniqueidentifier     not null,
   id_sp                uniqueidentifier     null,
   id_jenj_didik        numeric(2)           not null,
   id_sdm               uniqueidentifier     not null,
   nm_prodi             varchar(100)         not null,
   tgl_mulai_tb         date                 not null,
   domisili             varchar(200)         not null,
   sk_tb                varchar(80)          null,
   tgl_sk_tb            date                 null,
   pembiayaan           varchar(150)         null,
   tgl_lulus            date                 null,
   id_negara            char(2)              not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tugas_be check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tugas_belajar primary key (id_tb)
)
go

/*==============================================================*/
/* Table: tugas_tambahan                                        */
/*==============================================================*/
create table pdrd.tugas_tambahan (
   id_tgs_tambah        uniqueidentifier     not null,
   id_jab_tgs           numeric(5)           not null,
   id_sdm               uniqueidentifier     not null,
   id_sms               uniqueidentifier     null,
   id_sp                uniqueidentifier     not null,
   jml_jam              numeric(4)           not null,
   sk_tugas_tambah      varchar(80)          not null,
   tmt_sk_tambah        date                 not null,
   tst_sk_tambah        date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tugas_ta check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tugas_tambahan primary key (id_tgs_tambah)
)
go

/*==============================================================*/
/* Table: tulis_buku_ajar                                       */
/*==============================================================*/
create table pdrd.tulis_buku_ajar (
   id_tulis_buku_ajar   uniqueidentifier     not null,
   id_buku_ajar         uniqueidentifier     not null,
   urutan2              int                  not null,
   afiliasi             varchar(200)         null,
   peran_tulis          char(1)              not null default 'A'
      constraint ckc_peran_tulis_tulis_bu check (peran_tulis in ('A','B','C','D')),
   jns_penulis          char(1)              not null default '1'
      constraint ckc_jns_penulis_tulis_bu check (jns_penulis in ('1','2','3')),
   nm_pd                varchar(120)         null,
   nipd                 varchar(24)          null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tulis_bu check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tulis_buku_ajar primary key (id_tulis_buku_ajar)
)
go

/*==============================================================*/
/* Table: tulis_pub                                             */
/*==============================================================*/
create table pdrd.tulis_pub (
   id_tulis_pub         uniqueidentifier     not null,
   id_publikasi         uniqueidentifier     not null,
   urutan2              int                  not null,
   afiliasi             varchar(200)         null,
   peran_tulis          char(1)              not null default 'A'
      constraint ckc_peran_tulis_tulis_pu check (peran_tulis in ('A','B','C','D')),
   jns_penulis          char(1)              not null default '1'
      constraint ckc_jns_penulis_tulis_pu check (jns_penulis in ('1','2','3')),
   a_corr_author        numeric(1)           not null default 0
      constraint ckc_a_corr_author_tulis_pu check (a_corr_author between 0 and 1 and a_corr_author in (0,1)),
   nm_pd                varchar(120)         null,
   nipd                 varchar(24)          null,
   id_afiliasi          uniqueidentifier     null,
   jns_afiliasi         char(1)              null 
      constraint ckc_jns_afiliasi_tulis_pu check (jns_afiliasi is null or (jns_afiliasi in ('I','S'))),
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tulis_pu check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tulis_pub primary key (id_tulis_pub)
)
go

/*==============================================================*/
/* Table: tunjangan                                             */
/*==============================================================*/
create table pdrd.tunjangan (
   id_tunj              uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_jns_tunj          int                  null,
   nm_tunj              varchar(50)          not null,
   instansi             varchar(100)         null,
   sumber_dana          varchar(30)          null,
   dari_thn             numeric(4)           not null,
   sampai_thn           numeric(4)           null,
   nominal              numeric(16,2)        not null,
   stat                 int                  null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_tunjanga check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_tunjangan primary key (id_tunj)
)
go

/*==============================================================*/
/* Table: uji_mhs                                               */
/*==============================================================*/
create table pdrd.uji_mhs (
   id_uji_mhs           uniqueidentifier     not null,
   id_sdm               uniqueidentifier     not null,
   id_akt_mhs           uniqueidentifier     not null,
   urutan_uji           numeric(1)           not null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_uji_mhs check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_uji_mhs primary key (id_uji_mhs)
)
go

/*==============================================================*/
/* Table: unit_organisasi                                       */
/*==============================================================*/
create table man_akses.unit_organisasi (
   id_organisasi        uniqueidentifier     not null,
   nm_lemb              varchar(100)         not null,
   jln                  varchar(255)         null,
   rt                   numeric(3)           null,
   rw                   numeric(3)           null,
   nm_dsn               varchar(60)          null,
   ds_kel               varchar(60)          not null,
   kode_pos             char(5)              null,
   lintang              numeric(11,7)        null,
   bujur                numeric(11,7)        null,
   no_tel               varchar(20)          null,
   no_fax               varchar(20)          null,
   email                varchar(60)          null,
   website              varchar(256)         null,
   kd_kl                char(3)              null,
   kd_satker            varchar(20)          null,
   level_organisasi     numeric(3)           null,
   id_lembaga_asal      uniqueidentifier     not null,
   a_aktif              numeric(1)           not null default 0
      constraint ckc_a_aktif_unit_org check (a_aktif between 0 and 1 and a_aktif in (0,1)),
   id_jns_lemb          numeric(5)           not null,
   id_induk_organisasi  uniqueidentifier     null,
   id_wil               char(8)              not null,
   tgl_create           datetime             not null,
   last_update          datetime             not null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_unit_org check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   id_updater           uniqueidentifier     not null,
   constraint pk_unit_organisasi primary key (id_organisasi)
)
go

/*==============================================================*/
/* Table: visiting_scientist                                    */
/*==============================================================*/
create table pdrd.visiting_scientist (
   id_visit             uniqueidentifier     not null,
   id_sdm               uniqueidentifier     null,
   id_sp                uniqueidentifier     null,
   id_litabmas          uniqueidentifier     null,
   id_kat_capaian       numeric(3)           null,
   pt_pengundang        varchar(100)         null,
   lama_kegiatan        smallint             not null,
   kegiatan_penting     text                 null,
   tgl_laks             date                 null,
   sk_tugas             varchar(80)          null,
   tgl_sk_tugas         date                 null,
   create_date          datetime             not null,
   id_creator           uniqueidentifier     not null,
   last_update          datetime             not null,
   id_updater           uniqueidentifier     null,
   soft_delete          numeric(1)           not null default 0
      constraint ckc_soft_delete_visiting check (soft_delete between 0 and 1 and soft_delete in (0,1)),
   last_sync            datetime             not null,
   constraint pk_visiting_scientist primary key (id_visit)
)
go

/*==============================================================*/
/* Table: wilayah                                               */
/*==============================================================*/
create table ref.wilayah (
   id_wil               char(8)              not null,
   id_negara            char(2)              not null,
   nm_wil               varchar(60)          null,
   asal_wil             char(8)              null,
   kode_bps             char(7)              null,
   kode_dagri           char(7)              null,
   kode_keu             varchar(10)          null,
   id_induk_wilayah     char(8)              null,
   id_level_wil         smallint             not null,
   create_date          datetime             not null,
   last_update          datetime             not null,
   expired_date         datetime             null,
   last_sync            datetime             not null,
   constraint pk_wilayah primary key (id_wil)
)
go

alter table pdrd.akred_sp
   add constraint fk_akred_sp_akred_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.akred_sp
   add constraint fk_akred_sp_akred_sp__lembaga_ foreign key (id_lemb_akred)
      references ref.lembaga_akred (id_lemb_akred)
go

alter table pdrd.akred_sp
   add constraint fk_akred_sp_sp_akred__nilai_ak foreign key (id_akred)
      references ref.nilai_akred (id_akred)
go

alter table pdrd.akreditasi_prodi
   add constraint fk_akredita_akreditas_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.akreditasi_prodi
   add constraint fk_akredita_lemb_akre_lembaga_ foreign key (id_lemb_akred)
      references ref.lembaga_akred (id_lemb_akred)
go

alter table pdrd.akreditasi_prodi
   add constraint fk_akredita_nilai_akr_nilai_ak foreign key (id_akred)
      references ref.nilai_akred (id_akred)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_katgiat_a_kategori foreign key (id_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_mengajar__substans foreign key (id_subst)
      references pdrd.substansi_kuliah (id_subst)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_pengajara_jenis_ev foreign key (id_jns_eval)
      references ref.jenis_evaluasi (id_jns_eval)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_pengambil_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table pdrd.akt_ajar_dosen
   add constraint fk_akt_ajar_ptk_penga_reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_jenis_akt_jenis_ak foreign key (id_jns_akt_mhs)
      references ref.jenis_akt_mhs (id_jns_akt_mhs)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_prodi_akt_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.akt_mhs
   add constraint fk_akt_mhs_smt_akt_m_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table sarpras.alat
   add constraint fk_alat_alat_mili_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.alat
   add constraint fk_alat_alat_ptk2_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table sarpras.alat
   add constraint fk_alat_hapus_buk_jenis_ha foreign key (id_hapus_buku)
      references ref.jenis_hapus_buku (id_hapus_buku)
go

alter table sarpras.alat
   add constraint fk_alat_jenis_sar_jenis_sa foreign key (id_jns_sarana)
      references ref.jenis_sarana (id_jns_sarana)
go

alter table sarpras.alat
   add constraint fk_alat_status_mi_status_m foreign key (id_stat_milik_sarpras)
      references ref.status_milik_sarpras (id_stat_milik_sarpras)
go

alter table sarpras.alat_long
   add constraint fk_alat_lon_alat_long_alat foreign key (id_alat)
      references sarpras.alat (id_alat)
go

alter table sarpras.alat_long
   add constraint fk_alat_lon_smt_pemak_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.anak
   add constraint fk_anak_anak_sdm_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anak
   add constraint fk_anak_anak_stat_status_a foreign key (id_stat_anak)
      references ref.status_anak (id_stat_anak)
go

alter table pdrd.anak
   add constraint fk_anak_jenjang_a_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.anggota_aktivitas_mahasiswa
   add constraint fk_anggota__akt_mhs_a_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.anggota_aktivitas_mahasiswa
   add constraint fk_anggota__reg_ang_a_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table pdrd.anggota_orgprof
   add constraint fk_anggota__orgprof_p_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.anggota_panitia
   add constraint fk_anggota__anggota_p_kepaniti foreign key (id_panitia)
      references pdrd.kepanitiaan (id_panitia)
go

alter table pdrd.anggota_panitia
   add constraint fk_anggota__panitia_p_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_alat_mili_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_alat_ptk_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_hapus_buk_jenis_ha foreign key (id_hapus_buku)
      references ref.jenis_hapus_buku (id_hapus_buku)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_jenis_sar_jenis_sa foreign key (id_jns_sarana)
      references ref.jenis_sarana (id_jns_sarana)
go

alter table sarpras.angkutan
   add constraint fk_angkutan_status_mi_status_m foreign key (id_stat_milik_sarpras)
      references ref.status_milik_sarpras (id_stat_milik_sarpras)
go

alter table man_akses.aplikasi
   add constraint fk_aplikasi_unit_pemi_unit_org foreign key (id_organisasi)
      references man_akses.unit_organisasi (id_organisasi)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_hapus_buk_jenis_ha foreign key (id_hapus_buku)
      references ref.jenis_hapus_buku (id_hapus_buku)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_jns_prasa_jenis_pr foreign key (id_jns_prasarana)
      references ref.jenis_prasarana (id_jns_prasarana)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_satuan_ba_satuan foreign key (kd_satuan)
      references ref.satuan (kd_satuan)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_status_mi_status_m foreign key (id_stat_milik_sarpras)
      references ref.status_milik_sarpras (id_stat_milik_sarpras)
go

alter table sarpras.bangunan
   add constraint fk_bangunan_tanah_ban_tanah foreign key (id_tanah)
      references sarpras.tanah (id_tanah)
go

alter table beasiswa_sdm
   add constraint fk_beasiswa_beasiswa__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table beasiswa_sdm
   add constraint fk_beasiswa_beasiswa__jenis_be foreign key (id_jns_beasiswa)
      references ref.jenis_beasiswa (id_jns_beasiswa)
go

alter table beasiswa_sdm
   add constraint fk_beasiswa_studi_sms_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_jenis_bia_jenis_ke foreign key (id_jns_keuangan)
      references ref.jenis_keuangan (id_jns_keuangan)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_sms_opera_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table keuangan.biaya_operasional
   add constraint fk_biaya_op_thn_angga_tahun_an foreign key (id_tahun_anggaran)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table ref.bidang_studi
   add constraint fk_bidang_s_kelompok_bidang_s foreign key (id_induk_bidang_studi)
      references ref.bidang_studi (id_bid_studi)
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__aktmhs_bi_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.bimbing_mhs
   add constraint fk_bimbing__dosen_pem_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.buku_ajar
   add constraint fk_buku_aja_capaian_b_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.buku_ajar
   add constraint fk_buku_aja_jenis_buk_jenis_ba foreign key (id_jns_bhn_ajar)
      references ref.jenis_bahan_ajar (id_jns_bhn_ajar)
go

alter table pdrd.buku_ajar
   add constraint fk_buku_aja_luaran_bu_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table sarpras.dbr
   add constraint fk_dbr_detail_al_alat foreign key (id_alat)
      references sarpras.alat (id_alat)
go

alter table sarpras.dbr
   add constraint fk_dbr_ruang_det_ruang foreign key (id_ruang)
      references sarpras.ruang (id_ruang)
go

alter table pdrd.detasering
   add constraint fk_detaseri_pt_sas_de_satuan_p foreign key (id_sp_sasaran)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.detasering
   add constraint fk_detaseri_pt_sum_de_satuan_p foreign key (id_sp_sumber)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.detasering
   add constraint fk_detaseri_ptk_detas_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_je_jenis_di foreign key (id_jns_diklat)
      references ref.jenis_diklat (id_jns_diklat)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_ke_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.diklat
   add constraint fk_diklat_diklat_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table dok.dok_akt_mhs
   add constraint fk_dok_akt__akt_mhs_d_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table dok.dok_akt_mhs
   add constraint fk_dok_akt__dok_akt_m_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_ang_orgprof
   add constraint fk_dok_ang__angorgpro_anggota_ foreign key (id_ang_orgprof)
      references pdrd.anggota_orgprof (id_ang_orgprof)
go

alter table dok.dok_ang_orgprof
   add constraint fk_dok_ang__dok_angor_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_bhn_ajar
   add constraint fk_dok_bhn__bhn_ajar__buku_aja foreign key (id_buku_ajar)
      references pdrd.buku_ajar (id_buku_ajar)
go

alter table dok.dok_bhn_ajar
   add constraint fk_dok_bhn__dok_bhn_a_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_bimbing_dosen
   add constraint fk_dok_bimb_bimb_dos__bimbing_ foreign key (id_bimb_dosen)
      references pdrd.bimbing_dosen (id_bimb_dosen)
go

alter table dok.dok_bimbing_dosen
   add constraint fk_dok_bimb_dok_bimb__dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_detasering
   add constraint fk_dok_deta_detas_dok_detaseri foreign key (id_detasering)
      references pdrd.detasering (id_detasering)
go

alter table dok.dok_detasering
   add constraint fk_dok_deta_dok_detas_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_diklat
   add constraint fk_dok_dikl_diklat_do_diklat foreign key (id_diklat)
      references pdrd.diklat (id_diklat)
go

alter table dok.dok_diklat
   add constraint fk_dok_dikl_dok_dikla_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_inpassing
   add constraint fk_dok_inpa_dok_inpas_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_inpassing
   add constraint fk_dok_inpa_inpassing_inpassin foreign key (id_inpassing)
      references pdrd.inpassing (id_inpassing)
go

alter table dok.dok_jabstruk
   add constraint fk_dok_jabs_dok_jabst_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_jabstruk
   add constraint fk_dok_jabs_jabstruk__rwy_stru foreign key (id_rwy_jabstruk)
      references pdrd.rwy_struktural (id_rwy_jabstruk)
go

alter table dok.dok_laporan_studi
   add constraint fk_dok_lapo_dok_lap_s_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_laporan_studi
   add constraint fk_dok_lapo_lap_studi_laporan_ foreign key (id_lap_studi)
      references pdrd.laporan_studi (id_lap_studi)
go

alter table dok.dok_litabmas
   add constraint fk_dok_lita_dok_litab_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_litabmas
   add constraint fk_dok_lita_litabmas__litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table dok.dok_nilai_tes
   add constraint fk_dok_nila_dok_nilai_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_nilai_tes
   add constraint fk_dok_nila_nilaites__nilai_te foreign key (id_nilai_tes)
      references pdrd.nilai_tes (id_nilai_tes)
go

alter table dok.dok_panitia
   add constraint fk_dok_pani_dok_panit_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_panitia
   add constraint fk_dok_pani_panitia_d_kepaniti foreign key (id_panitia)
      references pdrd.kepanitiaan (id_panitia)
go

alter table dok.dok_pembicara
   add constraint fk_dok_pemb_dok_pembi_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_pembicara
   add constraint fk_dok_pemb_pembicara_pembicar foreign key (id_pembicara)
      references pdrd.pembicara (id_pembicara)
go

alter table dok.dok_pengelola_jurnal
   add constraint fk_dok_peng_dok_kelol_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_pengelola_jurnal
   add constraint fk_dok_peng_kelolajur_pengelol foreign key (id_kelola_jurnal)
      references pdrd.pengelola_jurnal (id_kelola_jurnal)
go

alter table dok.dok_penghargaan
   add constraint fk_dok_peng_dok_pengh_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_penghargaan
   add constraint fk_dok_peng_pengharga_pengharg foreign key (id_penghargaan)
      references pdrd.penghargaan (id_penghargaan)
go

alter table dok.dok_pub
   add constraint fk_dok_pub_dok_pub_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_pub
   add constraint fk_dok_pub_pub_dok_publikas foreign key (id_publikasi)
      references pdrd.publikasi (id_publikasi)
go

alter table dok.dok_rwy_didik
   add constraint fk_dok_rwy__didik_dok_rwy_pend foreign key (id_rwy_didik_formal)
      references pdrd.rwy_pend_formal (id_rwy_didik_formal)
go

alter table dok.dok_rwy_didik
   add constraint fk_dok_rwy__dok_didik_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_rwy_kepangkatan
   add constraint fk_dok_rwy__dok_rwy_p_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_rwy_kepangkatan
   add constraint fk_dok_rwy__rwy_pangk_rwy_kepa foreign key (id_rwy_pangkat)
      references pdrd.rwy_kepangkatan (id_rwy_pangkat)
go

alter table dok.dok_rwy_pekerjaan
   add constraint fk_dok_rwy__dok_rwy_k_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_rwy_pekerjaan
   add constraint fk_dok_rwy__rwy_kerja_rwy_peke foreign key (id_rwy_kerja)
      references pdrd.rwy_pekerjaan (id_rwy_kerja)
go

alter table dok.dok_rwy_sertifikasi
   add constraint fk_dok_rwy__dok_rwy_s_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_rwy_sertifikasi
   add constraint fk_dok_rwy__rwy_sert__rwy_sert foreign key (id_rwy_sert)
      references pdrd.rwy_sertifikasi (id_rwy_sert)
go

alter table dok.dok_tugtam
   add constraint fk_dok_tugt_dok_tugta_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_tugtam
   add constraint fk_dok_tugt_tugtam_do_tugas_ta foreign key (id_tgs_tambah)
      references pdrd.tugas_tambahan (id_tgs_tambah)
go

alter table dok.dok_visit_scientist
   add constraint fk_dok_visi_dok_visit_dokumen foreign key (id_dok)
      references dok.dokumen (id_dok)
go

alter table dok.dok_visit_scientist
   add constraint fk_dok_visi_visiting__visiting foreign key (id_visit)
      references pdrd.visiting_scientist (id_visit)
go

alter table dok.dokumen
   add constraint fk_dokumen_jenis_dok_jenis_do foreign key (id_jns_dok)
      references ref.jenis_dokumen (id_jns_dok)
go

alter table pdrd.dudi
   add constraint fk_dudi_dudi_bu_bidang_u foreign key (id_bu)
      references ref.bidang_usaha (id_bu)
go

alter table pdrd.dudi
   add constraint fk_dudi_wil_dudi_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table dok.foto_peserta_didik
   add constraint fk_foto_pes_pemilik_f_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table dok.foto_peserta_didik
   add constraint fk_foto_pes_rincian_f_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table tracer.hasil_tracer_atasan
   add constraint fk_hasil_tr_hasil_ata_hasil_tr foreign key (id_hasil_tracer_study)
      references tracer.hasil_tracer_study (id_hasil_tracer_study)
go

alter table tracer.hasil_tracer_atasan
   add constraint fk_hasil_tr_negara_at_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

alter table tracer.hasil_tracer_atasan
   add constraint fk_hasil_tr_prov_atas_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_lingkup_w_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_reg_pd_ha_reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_smt_mengi_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table tracer.hasil_tracer_study
   add constraint fk_hasil_tr_tahun_men_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.inpassing
   add constraint fk_inpassin_inpassing_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
         on update cascade on delete cascade
go

alter table pdrd.inpassing
   add constraint fk_inpassin_inpassing_pangkat_ foreign key (id_pangkat_gol)
      references ref.pangkat_golongan (id_pangkat_gol)
go

alter table ref.jab_tgs
   add constraint fk_jab_tgs_tugtam_pr_kelompok foreign key (id_kel_prof)
      references ref.kelompok_profesi (id_kel_prof)
go

alter table ref.jabfung
   add constraint fk_jabfung_jabfung_p_kelompok foreign key (id_kel_prof)
      references ref.kelompok_profesi (id_kel_prof)
go

alter table ref.jenis_beasiswa
   add constraint fk_jenis_be_sumber_be_sumber_d foreign key (id_sumber_dana)
      references ref.sumber_dana (id_sumber_dana)
go

alter table ref.jurusan
   add constraint fk_jurusan_bid_jur_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table ref.jurusan
   add constraint fk_jurusan_induk_pro_jurusan foreign key (id_induk_jurusan)
      references ref.jurusan (id_jur)
go

alter table ref.jurusan
   add constraint fk_jurusan_jur_std_j_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table ref.kategori_kegiatan
   add constraint fk_kategori_induk_kat_kategori foreign key (id_induk_katgiat)
      references ref.kategori_kegiatan (id_katgiat)
go

alter table ref.kategori_kegiatan
   add constraint fk_kategori_katgiat_s_jenis_sd foreign key (id_jns_sdm)
      references ref.jenis_sdm (id_jns_sdm)
go

alter table ref.kbli
   add constraint fk_kbli_induk_kbl_kbli foreign key (id_induk_kbli)
      references ref.kbli (id_kbli)
go

alter table pdrd.keaktifan_ptk
   add constraint fk_keaktifa_long_reg__reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
go

alter table pdrd.keaktifan_ptk
   add constraint fk_keaktifa_tahun_kea_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_kelas_mat_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_prodi_kel_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.kelas_kuliah
   add constraint fk_kelas_ku_smt_kelas_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table ref.kelompok_bidang
   add constraint fk_kelompok_induk_kel_kelompok foreign key (id_induk_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.kepanitiaan
   add constraint fk_kepaniti_jenis_pan_jenis_ke foreign key (id_jns_panitia)
      references ref.jenis_kepanitiaan (id_jns_panitia)
go

alter table pdrd.kesejahteraan
   add constraint fk_kesejaht_kesejahte_jenis_ke foreign key (id_jns_sejahtera)
      references ref.jenis_kesejahteraan (id_jns_sejahtera)
go

alter table pdrd.kesejahteraan
   add constraint fk_kesejaht_kesejahte_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_keaktifan_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_register__reg_pd foreign key (id_reg_pd)
      references pdrd.reg_pd (id_reg_pd)
go

alter table pdrd.kuliah_mhs
   add constraint fk_kuliah_m_status_mh_status_m foreign key (id_stat_mhs)
      references ref.status_mahasiswa (id_stat_mhs)
go

alter table pdrd.kurikulum_sp
   add constraint fk_kurikulu_jenjang_k_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.lembaga_non_sp
   add constraint fk_lembaga__induk_lem_lembaga_ foreign key (id_induk_lemb_non_sp)
      references pdrd.lembaga_non_sp (id_lemb_non_sp)
go

alter table pdrd.lembaga_non_sp
   add constraint fk_lembaga__jenis_lem_jenis_le foreign key (id_jns_lemb)
      references ref.jenis_lembaga (id_jns_lemb)
go

alter table pdrd.lembaga_non_sp
   add constraint fk_lembaga__wilayah_l_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_jenis_pen_jenis_pe foreign key (id_jns_lit)
      references ref.jenis_penelitian (id_jns_lit)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_lanjutan__litabmas foreign key (id_lanjutan_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_lemb_peng_lembaga_ foreign key (id_lemb_iptek)
      references pdrd.lembaga_iptek (id_lemb_iptek)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_litabmas__smi foreign key (id_smi)
      references pdrd.smi (id_smi)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_rumpun_il_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_skim_kegi_skim_keg foreign key (id_skim)
      references ref.skim_kegiatan (id_skim)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_tahun_keg_tahun_an foreign key (id_thn_kegiatan)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_tahun_pel_tahun_an foreign key (id_thn_laks)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_tahun_usu_tahun_an foreign key (id_thn_usulan)
      references ref.tahun_anggaran (id_tahun_anggaran)
go

alter table pdrd.litabmas
   add constraint fk_litabmas_tse_litab_tse foreign key (id_tse)
      references ref.tse (id_tse)
go

alter table pdrd.map_abmas_tse
   add constraint fk_map_abma_abmas_tse_tse foreign key (id_tse)
      references ref.tse (id_tse)
go

alter table pdrd.map_abmas_tse
   add constraint fk_map_abma_tse_abmas_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.map_litabmas_bidang
   add constraint fk_map_lita_bidang_li_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.map_litabmas_bidang
   add constraint fk_map_lita_litabmas__kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.map_publikasi_bidang
   add constraint fk_map_publ_pub_bidan_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.map_publikasi_bidang
   add constraint fk_map_publ_pub_bidan_publikas foreign key (id_publikasi)
      references pdrd.publikasi (id_publikasi)
go

alter table pdrd.matkul
   add constraint fk_matkul_jenjang_p_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.matkul
   add constraint fk_matkul_prodi_mat_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.matkul_kurikulum
   add constraint fk_matkul_k_detail_ma_matkul foreign key (id_mk)
      references pdrd.matkul (id_mk)
go

alter table man_akses.menu
   add constraint fk_menu_group_men_menu foreign key (id_group_menu)
      references man_akses.menu (id_menu)
go

alter table man_akses.menu
   add constraint fk_menu_menu_apli_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table man_akses.menu_role
   add constraint fk_menu_rol_akses_men_menu foreign key (id_menu)
      references man_akses.menu (id_menu)
go

alter table man_akses.menu_role
   add constraint fk_menu_rol_akses_men_peran foreign key (id_peran)
      references man_akses.peran (id_peran)
go

alter table pdrd.mitra_litabmas
   add constraint fk_mitra_li_mitra_akt_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.mitra_litabmas
   add constraint fk_mitra_li_mitra_dud_dudi foreign key (id_dudi)
      references pdrd.dudi (id_dudi)
go

alter table kerjasama.mou
   add constraint fk_mou_mou_antar_dudi foreign key (id_dudi)
      references pdrd.dudi (id_dudi)
go

alter table kerjasama.mou
   add constraint fk_mou_mou_antar_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.nilai_smt_mhs
   add constraint fk_nilai_sm_kls_nilai_kelas_ku foreign key (id_kls)
      references pdrd.kelas_kuliah (id_kls)
go

alter table pdrd.nilai_smt_mhs
   add constraint fk_nilai_sm_reg_nilai_reg_ptk foreign key (id_reg_ptk)
      references pdrd.reg_ptk (id_reg_ptk)
go

alter table pdrd.nilai_tes
   add constraint fk_nilai_te_nilai_tes_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.nilai_tes
   add constraint fk_nilai_te_test_jeni_jenis_te foreign key (id_jns_tes)
      references ref.jenis_tes (id_jns_tes)
go

alter table pdrd.non_ca
   add constraint fk_non_ca_kewargane_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

alter table pdrd.non_ca_anggota_litabmas
   add constraint fk_non_ca_a_ang_litab_non_ca foreign key (id_orang)
      references pdrd.non_ca (id_orang)
go

alter table pdrd.non_ca_anggota_litabmas
   add constraint fk_non_ca_a_nonca_ang_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.pd_anggota_litabmas
   add constraint fk_pd_anggo_ang_litab_peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.pd_anggota_litabmas
   add constraint fk_pd_anggo_mhs_anggo_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_capaian_p_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_luaran_pe_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.pembicara
   add constraint fk_pembicar_pembicata_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_jurnal_ke_media_pu foreign key (id_media_pub)
      references ref.media_publikasi (id_media_pub)
go

alter table pdrd.pengelola_jurnal
   add constraint fk_pengelol_kelola_ju_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_pengharga_jenis_pe foreign key (id_jns_penghargaan)
      references ref.jenis_penghargaan (id_jns_penghargaan)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_pengharga_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.penghargaan
   add constraint fk_pengharg_pengharga_tingkat_ foreign key (id_tkt_penghargaan)
      references ref.tingkat_penghargaan (id_tkt_penghargaan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__agama_pd_agama foreign key (id_agama)
      references ref.agama (id_agama)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__alat_tran_alat_tra foreign key (id_alat_transport)
      references sarpras.alat_transportasi (id_alat_transport)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__foto_pd_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__jenis_tin_jenis_ti foreign key (id_jns_tinggal)
      references ref.jenis_tinggal (id_jns_tinggal)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__kebutuhan_kebutuha foreign key (id_kk_ayah)
      references ref.kebutuhan_khusus (id_kk)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta_kk_ibu foreign key (id_kk_ibu)
      references ref.kebutuhan_khusus (id_kk)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta_kk_pd foreign key (id_kk)
      references ref.kebutuhan_khusus (id_kk)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__kewargane_negara foreign key (id_kewarganegaraan)
      references ref.negara (id_negara)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pekerjaan_pekerjaa foreign key (id_pekerjaan_ayah)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pekerjaan_ibu foreign key (id_pekerjaan_ibu)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pekerjaan_wali foreign key (id_pekerjaan_wali)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pendidika_ayah foreign key (id_pendidikan_ayah)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pendidikan_ibu foreign key (id_pendidikan_ibu)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__pendidika_wali foreign key (id_pendidikan_wali)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__penghasil_ayah foreign key (id_penghasilan_ayah)
      references ref.penghasilan (id_penghasilan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__penghasil_ibu foreign key (id_penghasilan_ibu)
      references ref.penghasilan (id_penghasilan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__penghasil_wali foreign key (id_penghasilan_wali)
      references ref.penghasilan (id_penghasilan)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__provinsi__wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.peserta_didik
   add constraint fk_peserta__status_ke_status_m foreign key (id_stat_mhs)
      references ref.status_mahasiswa (id_stat_mhs)
go

alter table man_akses.pj_aplikasi
   add constraint fk_pj_aplik_akun_pj_a_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table man_akses.pj_aplikasi
   add constraint fk_pj_aplik_list_pj_a_aplikasi foreign key (id_aplikasi)
      references man_akses.aplikasi (id_aplikasi)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__jenis_pr foreign key (id_jenis_prestasi)
      references ref.jenis_prestasi (id_jenis_prestasi)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.prestasi
   add constraint fk_prestasi_prestasi__tingkat_ foreign key (id_tkt_prestasi)
      references ref.tingkat_prestasi (id_tkt_prestasi)
go

alter table pdrd.profil_prodi
   add constraint fk_profil_p_profil_pr_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.profil_prodi
   add constraint fk_ta_profil_prodi foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.profil_pt
   add constraint fk_profil_p_profil_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.profil_pt
   add constraint fk_ta_profil_pt foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table pdrd.publikasi
   add constraint fk_publikas_capaian_p_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.publikasi
   add constraint fk_publikas_jenis_pub_jenis_pu foreign key (id_jns_pub)
      references ref.jenis_publikasi (id_jns_pub)
go

alter table pdrd.publikasi
   add constraint fk_publikas_luaran_pu_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.publikasi
   add constraint fk_publikas_pub_media_media_pu foreign key (id_media_pub)
      references ref.media_publikasi (id_media_pub)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_alasan_ke_jenis_ke foreign key (id_jns_keluar)
      references ref.jenis_keluar (id_jns_keluar)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_biaya_reg_pembiaya foreign key (id_pembiayaan)
      references ref.pembiayaan (id_pembiayaan)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_jalur_daf_jalur_da foreign key (id_jalur_daftar)
      references ref.jalur_daftar (id_jalur_daftar)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_jenis_daf_jenis_pe foreign key (id_jns_daftar)
      references ref.jenis_pendaftaran (id_jns_daftar)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_prodi_pd_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_pt_asal_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_pt_pd_satuan_p foreign key (id_sp_asal)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_register__peserta_ foreign key (id_pd)
      references pdrd.peserta_didik (id_pd)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_semester__semester foreign key (id_semester_masuk)
      references ref.semester (id_smt)
go

alter table pdrd.reg_pd
   add constraint fk_reg_pd_smt_yudis_semester foreign key (id_smt)
      references ref.semester (id_smt)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_ikata_ikatan_k foreign key (id_ikatan_kerja)
      references ref.ikatan_kerja_sdm (id_ikatan_kerja)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_kelua_jenis_ke foreign key (id_jns_keluar)
      references ref.jenis_keluar (id_jns_keluar)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_terda_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_ptk_terda_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_reg_dosen_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.reg_ptk
   add constraint fk_reg_ptk_statpeg_p_status_k foreign key (id_stat_pegawai)
      references ref.status_kepegawaian (id_stat_pegawai)
go

alter table man_akses.role_pengguna
   add constraint fk_role_pen_akses_pen_peran foreign key (id_peran)
      references man_akses.peran (id_peran)
go

alter table man_akses.role_pengguna
   add constraint fk_role_pen_peran_pen_pengguna foreign key (id_pengguna)
      references man_akses.pengguna (id_pengguna)
go

alter table man_akses.role_pengguna
   add constraint fk_role_pen_unit_peng_unit_org foreign key (id_organisasi)
      references man_akses.unit_organisasi (id_organisasi)
go

alter table sarpras.ruang
   add constraint fk_ruang_satuan_ru_satuan foreign key (kd_satuan)
      references ref.satuan (kd_satuan)
go

alter table sarpras.ruang
   add constraint fk_ruang_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rwy_didik_nonformal
   add constraint fk_rwy_didi_prodi_pen_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rwy_didik_nonformal
   add constraint fk_rwy_didi_rwy_didik_rwy_pend foreign key (id_rwy_didik_formal)
      references pdrd.rwy_pend_formal (id_rwy_didik_formal)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_jab_fung__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_jabfung_b_kelompok foreign key (id_kel_bidang)
      references ref.kelompok_bidang (id_kel_bidang)
go

alter table pdrd.rwy_fungsional
   add constraint fk_rwy_fung_rwyt_fung_jabfung foreign key (id_jabfung)
      references ref.jabfung (id_jabfung)
go

alter table pdrd.rwy_kepangkatan
   add constraint fk_rwy_kepa_riwayat_p_pangkat_ foreign key (id_pangkat_gol)
      references ref.pangkat_golongan (id_pangkat_gol)
go

alter table pdrd.rwy_kepangkatan
   add constraint fk_rwy_kepa_rwy_pangk_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_pekerjaan
   add constraint fk_rwy_peke_dudi_inst_dudi foreign key (id_dudi)
      references pdrd.dudi (id_dudi)
go

alter table pdrd.rwy_pekerjaan
   add constraint fk_rwy_peke_pekerjaan_pekerjaa foreign key (id_pekerjaan)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.rwy_pekerjaan
   add constraint fk_rwy_peke_rwy_peker_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_pekerjaan
   add constraint fk_rwy_peke_sektor_pe_kbli foreign key (id_kbli)
      references ref.kbli (id_kbli)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_ptk_rwyt__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_riwayat_g_gelar_ak foreign key (id_gelar_akad)
      references ref.gelar_akademik (id_gelar_akad)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_rwyt_pend_bidang_s foreign key (id_bid_studi)
      references ref.bidang_studi (id_bid_studi)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_rwyt_pend_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.rwy_pend_formal
   add constraint fk_rwy_pend_rwyt_pend_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_sertifikasi
   add constraint fk_rwy_sert_riwayat_s_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
         on update cascade on delete cascade
go

alter table pdrd.rwy_sertifikasi
   add constraint fk_rwy_sert_rwyt_bida_bidang_s foreign key (id_bid_studi)
      references ref.bidang_studi (id_bid_studi)
go

alter table pdrd.rwy_sertifikasi
   add constraint fk_rwy_sert_rwyt_sert_jenis_se foreign key (id_jns_sert)
      references ref.jenis_sert (id_jns_sert)
go

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_jab_stru__sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.rwy_struktural
   add constraint fk_rwy_stru_rwyt_jab_jab_tgs foreign key (id_jab_tgs)
      references ref.jab_tgs (id_jab_tgs)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_logo_sp_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_pembina_s_lembaga_ foreign key (id_pembina)
      references pdrd.lembaga_non_sp (id_lemb_non_sp)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_sp_bentuk_bentuk_p foreign key (id_bp)
      references ref.bentuk_pendidikan (id_bp)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_sp_milik_status_k foreign key (id_stat_milik)
      references ref.status_kepemilikan (id_stat_milik)
go

alter table pdrd.satuan_pendidikan
   add constraint fk_satuan_p_wilayah_s_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.sdm
   add constraint fk_sdm_agama_sdm_agama foreign key (id_agama)
      references ref.agama (id_agama)
go

alter table pdrd.sdm
   add constraint fk_sdm_keahlian__keahlian foreign key (id_keahlian_lab)
      references ref.keahlian_lab (id_keahlian_lab)
go

alter table pdrd.sdm
   add constraint fk_sdm_kewargane_negara foreign key (kewarganegaraan)
      references ref.negara (id_negara)
go

alter table pdrd.sdm
   add constraint fk_sdm_lemb_peng_lembaga_ foreign key (id_lemb_angkat)
      references ref.lembaga_pengangkat (id_lemb_angkat)
go

alter table pdrd.sdm
   add constraint fk_sdm_pekerjaan_pekerjaa foreign key (id_pekerjaan_suami_istri)
      references ref.pekerjaan (id_pekerjaan)
go

alter table pdrd.sdm
   add constraint fk_sdm_ptk_jenis_jenis_sd foreign key (id_jns_sdm)
      references ref.jenis_sdm (id_jns_sdm)
go

alter table pdrd.sdm
   add constraint fk_sdm_ptk_kecam_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.sdm
   add constraint fk_sdm_stataktif_status_k foreign key (id_stat_aktif)
      references ref.status_keaktifan_pegawai (id_stat_aktif)
go

alter table pdrd.sdm_anggota_litabmas
   add constraint fk_sdm_angg_ang_litab_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.sdm_anggota_litabmas
   add constraint fk_sdm_angg_dosen_ang_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table ref.semester
   add constraint fk_semester_ta_semest_tahun_aj foreign key (id_thn_ajaran)
      references ref.tahun_ajaran (id_thn_ajaran)
go

alter table ref.skim_kegiatan
   add constraint fk_skim_keg_jenj_pend_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.sms
   add constraint fk_sms_fungsi_la_fungsi_l foreign key (id_fungsi_lab)
      references ref.fungsi_lab (id_fungsi_lab)
go

alter table pdrd.sms
   add constraint fk_sms_induk_sms_sms foreign key (id_induk_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.sms
   add constraint fk_sms_jursp_jur_jurusan foreign key (id_jur)
      references ref.jurusan (id_jur)
go

alter table pdrd.sms
   add constraint fk_sms_kelompok__kelompok foreign key (id_kel_usaha)
      references ref.kelompok_usaha (id_kel_usaha)
go

alter table pdrd.sms
   add constraint fk_sms_logo_sms_large_ob foreign key (id_blob)
      references dok.large_object (id_blob)
go

alter table pdrd.sms
   add constraint fk_sms_progstudi_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.sms
   add constraint fk_sms_sms_jenis_jenis_sm foreign key (id_jns_sms)
      references ref.jenis_sms (id_jns_sms)
go

alter table pdrd.sms
   add constraint fk_sms_sms_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.sms
   add constraint fk_sms_wilayah_s_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_mou_kerja_mou foreign key (id_mou)
      references kerjasama.mou (id_mou)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_sms_yang__sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table kerjasama.sms_kerjasama
   add constraint fk_sms_kerj_sumber_da_sumber_d foreign key (id_sumber_dana)
      references ref.sumber_dana (id_sumber_dana)
go

alter table pdrd.substansi_kuliah
   add constraint fk_substans_substansi_jenis_su foreign key (id_jns_subst)
      references ref.jenis_subst (id_jns_subst)
go

alter table sarpras.tanah
   add constraint fk_tanah_hapus_buk_jenis_ha foreign key (id_hapus_buku)
      references ref.jenis_hapus_buku (id_hapus_buku)
go

alter table sarpras.tanah
   add constraint fk_tanah_jns_prasa_jenis_pr foreign key (id_jns_prasarana)
      references ref.jenis_prasarana (id_jns_prasarana)
go

alter table sarpras.tanah
   add constraint fk_tanah_sms_pemil_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table sarpras.tanah
   add constraint fk_tanah_status_mi_status_m foreign key (id_stat_milik_sarpras)
      references ref.status_milik_sarpras (id_stat_milik_sarpras)
go

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tb_jenjan_jenjang_ foreign key (id_jenj_didik)
      references ref.jenjang_pendidikan (id_jenj_didik)
go

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tb_negara_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tb_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.tugas_belajar
   add constraint fk_tugas_be_tugas_bel_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_jabatan_p_sms foreign key (id_sms)
      references pdrd.sms (id_sms)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tug_tamba_jab_tgs foreign key (id_jab_tgs)
      references ref.jab_tgs (id_jab_tgs)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tugtam_pt_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.tugas_tambahan
   add constraint fk_tugas_ta_tugtam_sp_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.tulis_buku_ajar
   add constraint fk_tulis_bu_buku_ajar_buku_aja foreign key (id_buku_ajar)
      references pdrd.buku_ajar (id_buku_ajar)
go

alter table pdrd.tulis_pub
   add constraint fk_tulis_pu_penulis_p_publikas foreign key (id_publikasi)
      references pdrd.publikasi (id_publikasi)
go

alter table pdrd.tunjangan
   add constraint fk_tunjanga_tunjangan_jenis_tu foreign key (id_jns_tunj)
      references ref.jenis_tunjangan (id_jns_tunj)
go

alter table pdrd.tunjangan
   add constraint fk_tunjanga_tunjangan_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table pdrd.uji_mhs
   add constraint fk_uji_mhs_aktmhs_uj_akt_mhs foreign key (id_akt_mhs)
      references pdrd.akt_mhs (id_akt_mhs)
go

alter table pdrd.uji_mhs
   add constraint fk_uji_mhs_dosen_pen_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table man_akses.unit_organisasi
   add constraint fk_unit_org_induk_org_unit_org foreign key (id_induk_organisasi)
      references man_akses.unit_organisasi (id_organisasi)
go

alter table man_akses.unit_organisasi
   add constraint fk_unit_org_jenis_org_jenis_le foreign key (id_jns_lemb)
      references ref.jenis_lembaga (id_jns_lemb)
go

alter table man_akses.unit_organisasi
   add constraint fk_unit_org_wilayah_o_wilayah foreign key (id_wil)
      references ref.wilayah (id_wil)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_capaian_v_kategori foreign key (id_kat_capaian)
      references ref.kategori_capaian_luaran (id_kat_capaian)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_luaran_vi_litabmas foreign key (id_litabmas)
      references pdrd.litabmas (id_litabmas)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_pengundan_satuan_p foreign key (id_sp)
      references pdrd.satuan_pendidikan (id_sp)
go

alter table pdrd.visiting_scientist
   add constraint fk_visiting_ptk_visit_sdm foreign key (id_sdm)
      references pdrd.sdm (id_sdm)
go

alter table ref.wilayah
   add constraint fk_wilayah_induk_wil_wilayah foreign key (id_induk_wilayah)
      references ref.wilayah (id_wil)
go

alter table ref.wilayah
   add constraint fk_wilayah_level_wil_level_wi foreign key (id_level_wil)
      references ref.level_wilayah (id_level_wil)
go

alter table ref.wilayah
   add constraint fk_wilayah_wilayah_n_negara foreign key (id_negara)
      references ref.negara (id_negara)
go

