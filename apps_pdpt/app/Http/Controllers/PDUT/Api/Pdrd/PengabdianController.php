<?php

namespace App\Http\Controllers\PDUT\API\Pdrd;
use App\Http\Controllers\Controller;
use App\Models\PDUT\Dok\DokLitabmas;
use App\Models\PDUT\Dok\Dokumen;
use App\Models\PDUT\Pdrd\Litabmas;
use App\Models\PDUT\Pdrd\NonCaAnggotaLitabmas;
use App\Models\PDUT\Pdrd\PdAnggotaLitabmas;
use App\Models\PDUT\Pdrd\SdmAnggotaLitabmas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class PengabdianController extends Controller
{
    protected $request;
    protected $litabmas;
    protected $sdmLitabmas;
    protected $dokLitabmas;
    protected $dokumen;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->litabmas = new Litabmas();
        $this->sdmLitabmas = new SdmAnggotaLitabmas();
        $this->dokLitabmas = new DokLitabmas();
        $this->dokumen = new Dokumen();
    }
    public function getAllListPengabdian()
    {
        if (empty($sortBy)) {
            $sortBy = 'DESC';
        }
    
        $query = "
        SELECT TOP 50 
            lm.id_litabmas AS id_penelitian,
            lm.judul_litabmas AS judul_penelitian, 
            kb.nm_kel_bidang AS bidang_keilmuan,
                lm.id_thn_laks AS tahun_pelaksanaan,
                lm.lama_kegiatan AS lama_kegiatan,
                lm.create_date AS waktu_data_ditambahkan,
                lm.last_update AS terakhir_diubah
            FROM
                pdrd.litabmas AS lm WITH(NOLOCK)
                LEFT JOIN (
                    SELECT
                        DISTINCT id_litabmas
                    FROM
                        pdrd.sdm_anggota_litabmas
                    WHERE
                        id_katgiat IN (130201,130202,130203,130204,130401 ,130402,130403)
                        AND soft_delete = 0
                ) AS sal ON sal.id_litabmas = lm.id_litabmas
                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = lm.id_kel_bidang
                AND kb.expired_date IS NULL

        WHERE lm.soft_delete = 0
        
        ";
        $query = DB::select($query, ['sort_by' => $sortBy]);
        if (empty($query)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Not Found Data"
            ]);
        }

        $list_pengabdian = [];
        foreach ($query as $value) {
            $list_mahasiswa[] = [
                'id_penelitian' => $value->id_penelitian,
                'judul_penelitian' => $value->judul_penelitian,
                'bidang_keilmuan' => $value->bidang_keilmuan,
                'tahun_pelaksanaan' => $value->tahun_pelaksanaan,
                'lama_kegiatan' => $value->lama_kegiatan,
                'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
               'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
            ];
        }


        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data list Pengabdian',
            'data'  => $list_pengabdian
        ], 200);
    }

    public function getListPengabdianBySdmId()
    {

        if (empty($sdmId)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Empty Field sdmid"
            ]);
        }

        if (empty($sortBy)) {
            $sortBy = 'DESC';
        }
    
        $query = "
        SELECT
                TOP 50 litabmas.id_litabmas AS id_penelitian,
                litabmas.judul_litabmas AS judul_penelitian,
                kb.nm_kel_bidang AS bidang_keilmuan,,
                litabmas.create_date AS waktu_data_ditambahkan,
                litabmas.last_update AS terakhir_diubah
                CONCAT(
                    (litabmas.id_thn_laks - 1),
                    '/',
                    litabmas.id_thn_laks
                ) AS tahun_pelaksanaan,
                litabmas.lama_kegiatan AS lama_kegiatan
            FROM
                pdrd.litabmas AS litabmas
                JOIN pdrd.sdm_anggota_litabmas AS sal ON sal.id_litabmas = litabmas.id_litabmas
                AND sal.id_katgiat IN ('130201','130202','130203','130204','130401','130402','130403')
                AND sal.soft_delete = 0
                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = litabmas.id_kel_bidang
                AND kb.expired_date IS NULL
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_sdm = '" . $sdmId . "'
            WHERE
                litabmas.soft_delete = 0
            ORDER BY 
                litabmas.id_thn_laks " . $sortBy . "
        
        ";
        $query = DB::select($query);

        if (empty($query)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Not Found data for SDM id : $sdmId"
            ]);
        }


        $list_pengabdian = [];
        foreach ($query as $value) {
            $list_mahasiswa[] = [
                'id_penelitian' => $value->id_penelitian,
                'judul_penelitian' => $value->judul_penelitian,
                'bidang_keilmuan' => $value->bidang_keilmuan,
                'tahun_pelaksanaan' => $value->tahun_pelaksanaan,
                'lama_kegiatan' => $value->lama_kegiatan
            ];
        }


        return response()->json([
            'status' => TRUE,
            'message' => 'Berhasil mengambil data Pengabdian bySdmId',
            'data'  => $list_pengabdian
        ], 200);
    }

    public function getDetailPengabdianByPengabdianId()
    {
        $reformatGetDetailPengabdian = [];

        $pengabdianId = $this->request->input('pengabdianId');
        if (empty($pengabdianId)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Failed pengabdianId"
            ]);
        }

        try {    
            $query = "
            SELECT
                skim_kegiatan.nm_skim AS nama_skim,
                litabmas.id_thn_laks AS tahun_anggaran,
                litabmas.judul_litabmas AS judul_penelitian,
                lembaga_iptek.nm_lemb AS afiliasi,
                kb.nm_kel_bidang AS kelompok_bidang,
                litabmas.sk_tugas AS no_sk_penugasan,
                litabmas.tgl_sk_tugas AS tgl_sk_penugasan,
                litabmas.lama_kegiatan AS lama_kegiatan,
                litabmas.lokasi_kegiatan AS lokasi_kegiatan,
                litabmas.thn_laks_ke AS th_pelaksanaan,
                litabmas.dana_dikti AS dana_dikti,
                litabmas.dana_pt AS dana_pt,
                litabmas.dana_institusi_lain AS dana_il
            FROM
                pdrd.litabmas AS litabmas
                LEFT JOIN pdrd.lembaga_iptek AS lembaga_iptek ON lembaga_iptek.id_lemb_iptek = litabmas.id_lemb_iptek
                AND lembaga_iptek.soft_delete = 0
                LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = litabmas.id_kel_bidang
                AND kb.expired_date IS NULL
                LEFT JOIN ref.skim_kegiatan AS skim_kegiatan ON skim_kegiatan.id_skim = litabmas.id_skim
                AND skim_kegiatan.expired_date IS NULL
            WHERE
                litabmas.id_litabmas = '" . $pengabdianId . "'
                AND litabmas.soft_delete = 0
            
            ";

        $getDetailPengabdian = DB::select($query);
            foreach ($getDetailPengabdian as $value) {
                $reformatGetDetailPengabdian = [
                    'tahun_anggaran' => $value->tahun_anggaran,
                    'afiliasi' => $value->afiliasi,
                    'kelompok_bidang' => $value->kelompok_bidang,
                    'no_sk_penugasan' => $value->no_sk_penugasan,
                    'tgl_sk_penugasan' => $value->tgl_sk_penugasan,
                    'lama_kegiatan' => $value->lama_kegiatan,
                    'judul_penelitian' => $value->judul_penelitian,
                    'lokasi_kegiatan' => $value->lokasi_kegiatan,
                    'tahun_pelaksanaan' => $value->tahun_anggaran,
                    'dana_dikti' => $value->dana_dikti,
                    'data_pt' => $value->dana_pt,
                    'dana_institusi_lain' => $value->dana_il,
                ];

                $query = "
                SELECT
                    sdm.nm_sdm AS nama_dosen,
                    sal.peran_litabmas AS peran_dosen,
                    sal.stat_aktif AS keaktifan
                FROM
                    pdrd.sdm_anggota_litabmas AS sal
                    JOIN pdrd.sdm AS sdm ON sdm.id_sdm = sal.id_sdm
                    AND sdm.id_jns_sdm = 12
                    AND sdm.soft_delete = 0
                WHERE
                    sal.id_litabmas = '" . $pengabdianId . "'
                    AND sal.id_katgiat IN ('130201','130202','130203','130204','130401','130402','130403')
                    AND sal.soft_delete = 0
            ";
            $getDaftarAnggotaDosen = DB::select($query);
            $reformatGetDetailPengabdian = Arr::add($reformatGetDetailPengabdian, 'anggota_dosen', $getDaftarAnggotaDosen);

            $query = "
                SELECT
                    pd.nm_pd AS nama_mahasiswa,
                    pal.peran_litabmas AS peran_mahasiswa,
                    pal.stat_aktif AS keaktifan
                FROM
                    pdrd.pd_anggota_litabmas AS pal
                    JOIN pdrd.peserta_didik AS pd ON pd.id_pd = pal.id_pd
                    AND pd.soft_delete = 0
                WHERE
                    pal.id_litabmas = '" . $pengabdianId . "'
                    AND pal.soft_delete = 0
            ";
            $getDaftarAnggotaMahasiswa = DB::select($query);
            $reformatGetDetailPengabdian = Arr::add($reformatGetDetailPengabdian, 'anggota_mahasiswa', $getDaftarAnggotaMahasiswa);

            $query = "
                SELECT
                    nca.nm_orang AS nama_nonca,
                    nca_litabmas.peran_litabmas AS peran_nonca,
                    nca_litabmas.stat_aktif AS keaktifan
                FROM
                    pdrd.non_ca_anggota_litabmas AS nca_litabmas
                    JOIN pdrd.non_ca AS nca ON nca.id_orang = nca_litabmas.id_orang
                    AND nca.soft_delete = 0
                WHERE
                    nca_litabmas.id_litabmas = '" . $pengabdianId . "'
                    AND nca_litabmas.soft_delete = 0
            ";
            $getDaftarAnggotaNonCA = DB::select($query);
            $reformatGetDetailPengabdian = Arr::add($reformatGetDetailPengabdian, 'anggota_non_ca', $getDaftarAnggotaNonCA);

            $query = "
                SELECT
                    dok_dokumen.nm_dok AS nama_dok,
                    dok_dokumen.file_name AS nama_file,
                    dok_dokumen.media_type AS jenis_file,
                    dok_litabmas.create_date AS tanggal_upload,
                    refj_dokumen.nm_jns_dok AS jenis_dokumen
                FROM
                    pdrd.litabmas AS litabmas
                    JOIN dok.dok_litabmas AS dok_litabmas ON dok_litabmas.id_litabmas = litabmas.id_litabmas
                    AND dok_litabmas.soft_delete = 0
                    LEFT JOIN dok.dokumen AS dok_dokumen ON dok_dokumen.id_dok = dok_litabmas.id_dok
                    AND dok_dokumen.soft_delete = 0
                    LEFT JOIN ref.jenis_dokumen AS refj_dokumen ON refj_dokumen.id_jns_dok = dok_dokumen.id_jns_dok
                    AND refj_dokumen.expired_date IS NULL
                WHERE
                    litabmas.id_litabmas = '" . $pengabdianId . "'
                    AND litabmas.soft_delete = 0
            ";
            $getDaftarDokumenPengabdian = DB::select($query);
            $reformatGetDetailPengabdian = Arr::add($reformatGetDetailPengabdian, 'dokumen_penelitian', $getDaftarDokumenPengabdian);

            return response()->json([
                'status' => TRUE,
                'message' => 'success',
                'data'  => $reformatGetDetailPengabdian
            ], 200);
        } 
    }
        catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return response()->json([
                'status' => FALSE,
                'message' => "Detail Pengabdian Tidak Ditemukan atau Pengabdian Tidak Terdaftar"
            ]);
        }
    }
    
    public function store(Request $request)
    {
        $litabmasId = guid();
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';
        $kat_kegiatan = ['130201','130202','130203','130204','130401','130402','130403'];

        $judul_kegiatan = $this->request->input('judul_kegiatan');
        $afiliasi =  $this->request->input('afiliasi');
        $kel_bidang = $this->request->input('kel_bidang');
        $litabmas_sebelumnya = $this->request->input('litabmas_sebelumnya');
        $jenis_skim = $this->request->input('jenis_skim');
        $lokasi_kegiatan = $this->request->input('lokasi_kegiatan');
        $tahun_usulan = $this->request->input('tahun_usulan');
        $tahun_kegiatan = $this->request->input('tahun_kegiatan');
        $lama_kegiatan = $this->request->input('lama_kegiatan');
        $tahun_pelaksanaan = $this->request->input('tahun_pelaksanaan');
        $dana_dikti = $this->request->input('dana_dikti');
        $dana_pt = $this->request->input('dana_pt');
        $dana_institusi_lain = $this->request->input('dana_institusi_lain');

        $in_kind = $this->request->input('in_kind');
        if (empty($in_kind)) {
            $in_kind = NULL;
        }

        $no_sk_penugasan = $this->request->input('no_sk_penugasan');
        $tgl_sk_penugasan = $this->request->input('tgl_sk_penugasan');
        $mitra_litabmas = $this->request->input('mitra_litabmas');
        $dok_penelitian = $this->request->file('dok_penelitian');

        $anggota_dosen = $this->request->input('anggota_dosen');
        $peran_dosen = $this->request->input('peran_dosen');
        $status_dosen = $this->request->input('status_dosen');

        $anggota_mahasiswa = $this->request->input('anggota_mahasiswa');
        $peran_mahasiswa = $this->request->input('peran_mahasiswa');
        $status_mahasiswa = $this->request->input('status_mahasiswa');

        $id_non_ca = $this->request->input('id_non_ca');
        $peran_ca = $this->request->input('peran_ca');
        $status_ca = $this->request->input('status_ca');

        DB::transaction();
        try {
            $this->litabmasModel->create([
                'dana_dikti' => $dana_dikti,
                'dana_institusi_lain' => $dana_institusi_lain,
                'dana_pt' => $dana_pt,
                'id_creator' => $creatorId,
                'id_jns_lit' => NULL,
                'id_kel_bidang' => $kel_bidang,
                'id_lanjutan_litabmas' => $litabmas_sebelumnya,
                'id_lemb_iptek' => NULL,
                'id_litabmas' => $litabmasId,
                'id_skim' => $jenis_skim,
                'id_smi' => NULL,
                'id_thn_kegiatan' => $tahun_kegiatan,
                'id_thn_laks' => $tahun_pelaksanaan,
                'id_thn_usulan' => $tahun_usulan,
                'id_tse' => NULL,
                'id_updater' => $updateId,
                'in_kind' => $in_kind,
                'jns_litabmas' => 'M',
                'judul_litabmas' => $judul_kegiatan,
                'lama_kegiatan' => $lama_kegiatan,
                'lokasi_kegiatan' => $lokasi_kegiatan,
                'sk_tugas' => $no_sk_penugasan,
                'tgl_sk_tugas' => $tgl_sk_penugasan,
                'soft_delete' => 0,
                'stat_aktif' => 1,
                'thn_laks_ke' => $tahun_pelaksanaan,
                'soft_delete' => 0,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);


            if (!empty($anggota_dosen)) {
                foreach ($anggota_dosen as $key => $anggotaDosen) {
                    $this->sdmLitabmas->create([
                        'id_litabmas' => $litabmasId,
                        'id_sdm' => $idDosen,
                        'id_katgiat' => $kat_kegiatan,
                        'peran_litabmas' => $peran_dosen[$index],
                        'stat_aktif' => $status_dosen[$index],
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            if (!empty($anggota_mahasiswa)) {
                foreach ($anggota_mahasiswa as $index => $idMahasiswa) {
                    $dataMahasiswa = DB::select("
                        SELECT
                            TOP 1 
                            pd.nm_pd AS nama_mahasiswa,
                            reg_pd.nipd AS nipd
                        FROM
                            pdrd.peserta_didik AS pd
                            LEFT JOIN pdrd.reg_pd AS reg_pd ON reg_pd.id_pd = pd.id_pd
                            AND reg_pd.soft_delete = 0
                        WHERE
                            pd.id_pd = '" . $idMahasiswa . "'
                            AND pd.soft_delete = 0
                    ");

                    $this->pdLitabmas->create([
                        'id_pd_ang_litabmas' => guid(),
                        'id_litabmas' => $penelitian->id_litabmas,
                        'id_pd' => $idMahasiswa,
                        'peran_litabmas' => $peran_mahasiswa[$index],
                        'stat_aktif' => $status_mahasiswa[$index],
                        'nm_pd' => $dataMahasiswa[0]->nama_mahasiswa,
                        'nipd' => $dataMahasiswa[0]->nipd,
                        
                            'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            if (!empty($id_non_ca)) {
                foreach ($id_non_ca as $key => $idNonCa) {
                    $this->sdmLitabmas->create([
                        'id_creator' => $creatorId,
                        'id_katgiat' => $kat_kegiatan,
                        'id_litabmas' => $litabmasId,
                        'id_sdm' => $idNonCa,
                        'id_updater' => $updateId,
                        'peran_litabmas' => $peran_ca[$key],
                        'soft_delete' => 0,
                        'stat_aktif' => $status_ca[$key],
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Success Add Pengabdian',
            ], 200);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();
            return response()->json([
                'status' => FALSE,
                'message' => "Failed Add Pengabdian"
            ]);
        }
    }

    public function update(Request $request, $id)
    {
        $litabmasId = guid();
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';
        $kat_kegiatan = ['130201','130202','130203','130204','130401','130402','130403'];

        $judul_kegiatan = $this->request->input('judul_kegiatan');
        $afiliasi =  $this->request->input('afiliasi');
        $kel_bidang = $this->request->input('kel_bidang');
        $litabmas_sebelumnya = $this->request->input('litabmas_sebelumnya');
        $jenis_skim = $this->request->input('jenis_skim');
        $lokasi_kegiatan = $this->request->input('lokasi_kegiatan');
        $tahun_usulan = $this->request->input('tahun_usulan');
        $tahun_kegiatan = $this->request->input('tahun_kegiatan');
        $lama_kegiatan = $this->request->input('lama_kegiatan');
        $tahun_pelaksanaan = $this->request->input('tahun_pelaksanaan');
        $dana_dikti = $this->request->input('dana_dikti');
        $dana_pt = $this->request->input('dana_pt');
        $dana_institusi_lain = $this->request->input('dana_institusi_lain');

        $in_kind = $this->request->input('in_kind');
        if (empty($in_kind)) {
            $in_kind = NULL;
        }

        $no_sk_penugasan = $this->request->input('no_sk_penugasan');
        $tgl_sk_penugasan = $this->request->input('tgl_sk_penugasan');
        $mitra_litabmas = $this->request->input('mitra_litabmas');
        $dok_penelitian = $this->request->file('dok_penelitian');

        $anggota_dosen = $this->request->input('anggota_dosen');
        $peran_dosen = $this->request->input('peran_dosen');
        $status_dosen = $this->request->input('status_dosen');

        $anggota_mahasiswa = $this->request->input('anggota_mahasiswa');
        $peran_mahasiswa = $this->request->input('peran_mahasiswa');
        $status_mahasiswa = $this->request->input('status_mahasiswa');

        $id_non_ca = $this->request->input('id_non_ca');
        $peran_ca = $this->request->input('peran_ca');
        $status_ca = $this->request->input('status_ca');

        DB::transaction();
        try {
            $this->litabmasModel->update([
                'dana_dikti' => $dana_dikti,
                'dana_institusi_lain' => $dana_institusi_lain,
                'dana_pt' => $dana_pt,
                'id_creator' => $creatorId,
                'id_jns_lit' => NULL,
                'id_kel_bidang' => $kel_bidang,
                'id_lanjutan_litabmas' => $litabmas_sebelumnya,
                'id_lemb_iptek' => NULL,
                'id_litabmas' => $litabmasId,
                'id_skim' => $jenis_skim,
                'id_smi' => NULL,
                'id_thn_kegiatan' => $tahun_kegiatan,
                'id_thn_laks' => $tahun_pelaksanaan,
                'id_thn_usulan' => $tahun_usulan,
                'id_tse' => NULL,
                'id_updater' => $updateId,
                'in_kind' => $in_kind,
                'jns_litabmas' => 'M',
                'judul_litabmas' => $judul_kegiatan,
                'lama_kegiatan' => $lama_kegiatan,
                'lokasi_kegiatan' => $lokasi_kegiatan,
                'sk_tugas' => $no_sk_penugasan,
                'tgl_sk_tugas' => $tgl_sk_penugasan,
                'soft_delete' => 0,
                'stat_aktif' => 1,
                'thn_laks_ke' => $tahun_pelaksanaan,
            ]);


            if (!empty($anggota_dosen)) {
                foreach ($anggota_dosen as $key => $anggotaDosen) {
                    $this->sdmLitabmas->update([
                        'id_creator' => $creatorId,
                        'id_katgiat' => $kat_kegiatan,
                        'id_litabmas' => $litabmasId,
                        'id_sdm' => $anggotaDosen,
                        'id_updater' => $updateId,
                        'peran_litabmas' => $peran_dosen[$key],
                        'soft_delete' => 0,
                        'stat_aktif' => $status_dosen[$key],
                    ]);
                }
            }

            if (!empty($anggota_mahasiswa)) {
                foreach ($anggota_mahasiswa as $key => $anggotaMahasiswa) {
                    $this->sdmLitabmas->update([
                        'id_creator' => $creatorId,
                        'id_katgiat' => $kat_kegiatan,
                        'id_litabmas' => $litabmasId,
                        'id_sdm' => $anggotaMahasiswa,
                        'id_updater' => $updateId,
                        'peran_litabmas' => $peran_mahasiswa[$key],
                        'soft_delete' => 0,
                        'stat_aktif' => $status_mahasiswa[$key],
                    ]);
                }
            }

            if (!empty($id_non_ca)) {
                foreach ($id_non_ca as $key => $idNonCa) {
                    $this->sdmLitabmas->update([
                        'id_creator' => $creatorId,
                        'id_katgiat' => $kat_kegiatan,
                        'id_litabmas' => $litabmasId,
                        'id_sdm' => $idNonCa,
                        'id_updater' => $updateId,
                        'peran_litabmas' => $peran_ca[$key],
                        'soft_delete' => 0,
                        'stat_aktif' => $status_ca[$key],
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Success update Pengabdian',
            ], 200);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();
            return response()->json([
                'status' => FALSE,
                'message' => "Failed update Pengabdian"
            ]);
        }
    }
    public function delete(Request $request){
        $litabmasId = guid();
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';
        $kat_kegiatan = ['130201','130202','130203','130204','130401','130402','130403'];

        $judul_kegiatan = $this->request->input('judul_kegiatan');
        $afiliasi =  $this->request->input('afiliasi');
        $kel_bidang = $this->request->input('kel_bidang');
        $litabmas_sebelumnya = $this->request->input('litabmas_sebelumnya');
        $jenis_skim = $this->request->input('jenis_skim');
        $lokasi_kegiatan = $this->request->input('lokasi_kegiatan');
        $tahun_usulan = $this->request->input('tahun_usulan');
        $tahun_kegiatan = $this->request->input('tahun_kegiatan');
        $lama_kegiatan = $this->request->input('lama_kegiatan');
        $tahun_pelaksanaan = $this->request->input('tahun_pelaksanaan');
        $dana_dikti = $this->request->input('dana_dikti');
        $dana_pt = $this->request->input('dana_pt');
        $dana_institusi_lain = $this->request->input('dana_institusi_lain');

        $in_kind = $this->request->input('in_kind');
        if (empty($in_kind)) {
            $in_kind = NULL;
        }

        $no_sk_penugasan = $this->request->input('no_sk_penugasan');
        $tgl_sk_penugasan = $this->request->input('tgl_sk_penugasan');
        $mitra_litabmas = $this->request->input('mitra_litabmas');
        $dok_penelitian = $this->request->file('dok_penelitian');

        $anggota_dosen = $this->request->input('anggota_dosen');
        $peran_dosen = $this->request->input('peran_dosen');
        $status_dosen = $this->request->input('status_dosen');

        $anggota_mahasiswa = $this->request->input('anggota_mahasiswa');
        $peran_mahasiswa = $this->request->input('peran_mahasiswa');
        $status_mahasiswa = $this->request->input('status_mahasiswa');

        $id_non_ca = $this->request->input('id_non_ca');
        $peran_ca = $this->request->input('peran_ca');
        $status_ca = $this->request->input('status_ca');

        DB::transaction();
        try {
            $this->litabmasModel->delete([
                'dana_dikti' => $dana_dikti,
                'dana_institusi_lain' => $dana_institusi_lain,
                'dana_pt' => $dana_pt,
                'id_creator' => $creatorId,
                'id_jns_lit' => NULL,
                'id_kel_bidang' => $kel_bidang,
                'id_lanjutan_litabmas' => $litabmas_sebelumnya,
                'id_lemb_iptek' => NULL,
                'id_litabmas' => $litabmasId,
                'id_skim' => $jenis_skim,
                'id_smi' => NULL,
                'id_thn_kegiatan' => $tahun_kegiatan,
                'id_thn_laks' => $tahun_pelaksanaan,
                'id_thn_usulan' => $tahun_usulan,
                'id_tse' => NULL,
                'id_updater' => $updateId,
                'in_kind' => $in_kind,
                'jns_litabmas' => 'M',
                'judul_litabmas' => $judul_kegiatan,
                'lama_kegiatan' => $lama_kegiatan,
                'lokasi_kegiatan' => $lokasi_kegiatan,
                'sk_tugas' => $no_sk_penugasan,
                'tgl_sk_tugas' => $tgl_sk_penugasan,
                'soft_delete' => 0,
                'stat_aktif' => 1,
                'thn_laks_ke' => $tahun_pelaksanaan,
            ]);


            if (!empty($anggota_dosen)) {
                foreach ($anggota_dosen as $key => $anggotaDosen) {
                    $this->sdmLitabmas->delete([
                        'id_creator' => $creatorId,
                        'id_katgiat' => $kat_kegiatan,
                        'id_litabmas' => $litabmasId,
                        'id_sdm' => $anggotaDosen,
                        'id_updater' => $updateId,
                        'peran_litabmas' => $peran_dosen[$key],
                        'soft_delete' => 0,
                        'stat_aktif' => $status_dosen[$key],
                    ]);
                }
            }

            if (!empty($anggota_mahasiswa)) {
                foreach ($anggota_mahasiswa as $key => $anggotaMahasiswa) {
                    $this->sdmLitabmas->delete([
                        'id_creator' => $creatorId,
                        'id_katgiat' => $kat_kegiatan,
                        'id_litabmas' => $litabmasId,
                        'id_sdm' => $anggotaMahasiswa,
                        'id_updater' => $updateId,
                        'peran_litabmas' => $peran_mahasiswa[$key],
                        'soft_delete' => 0,
                        'stat_aktif' => $status_mahasiswa[$key],
                    ]);
                }
            }

            if (!empty($id_non_ca)) {
                foreach ($id_non_ca as $key => $idNonCa) {
                    $this->sdmLitabmas->delete([
                        'id_creator' => $creatorId,
                        'id_katgiat' => $kat_kegiatan,
                        'id_litabmas' => $litabmasId,
                        'id_sdm' => $idNonCa,
                        'id_updater' => $updateId,
                        'peran_litabmas' => $peran_ca[$key],
                        'soft_delete' => 0,
                        'stat_aktif' => $status_ca[$key],
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                'status' => true,
                'message' => 'Success Add Pengabdian',
            ], 200);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();
            return response()->json([
                'status' => FALSE,
                'message' => "Failed Add Pengabdian"
            ]);
        }
    }
}
