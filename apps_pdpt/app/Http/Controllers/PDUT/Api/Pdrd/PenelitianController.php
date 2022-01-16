<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Dok\DokLitabmas;
use App\Models\PDUT\Dok\Dokumen;
use App\Models\PDUT\Pdrd\Litabmas;
use App\Models\PDUT\Pdrd\NonCaAnggotaLitabmas;
use App\Models\PDUT\Pdrd\PdAnggotaLitabmas;
use App\Models\PDUT\Pdrd\SdmAnggotaLitabmas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Exception;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule as ValidationRule;

class PenelitianController extends Controller
{
    protected $request;
    protected $litabmas;
    protected $sdmLitabmas;
    protected $pdLitabmas;
    protected $nonCaLitabmas;
    protected $dokLitabmas;
    protected $dokumen;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->litabmas = new Litabmas();
        $this->sdmLitabmas = new SdmAnggotaLitabmas();
        $this->pdLitabmas = new PdAnggotaLitabmas();
        $this->nonCaLitabmas = new NonCaAnggotaLitabmas();
        $this->dokLitabmas = new DokLitabmas();
        $this->dokumen = new Dokumen();
    }

    public function getAllListPenelitian()
    {
        $validator = Validator::make($this->request->all(), [
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'DESC'])]
        ], [
            'sortby.alpha' => 'input penyortiran harus kata',
            'sortby.in' => 'input pernyortiran hanya ASC dan DESC'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => FALSE,
                'message' => 'request gagal',
                'error' => $validator->errors()
            ]);
        }

        $validateInput = $validator->validate();
        $sortBy = empty($validateInput['sortby']) ? "" : $validateInput['sortby'];
        if (empty($sortBy)) {
            $sortBy = 'DESC';
        }

        $query = "
            SELECT
                TOP 50 lm.id_litabmas AS id_penelitian,
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
                        id_katgiat = 121300
                        AND soft_delete = 0
                ) AS sal ON sal.id_litabmas = lm.id_litabmas
                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = lm.id_kel_bidang
                AND kb.expired_date IS NULL
            WHERE
                lm.soft_delete = 0
            ORDER BY lm.id_thn_laks " . $sortBy . "
        ";

        $query = DB::select($query);

        if (empty($query)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Not Found Data"
            ]);
        }

        $get_list_penelitian = [];
        foreach ($query as $value) {
            $get_list_penelitian[] = [
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
            'message' => 'success',
            'data'  => $get_list_penelitian
        ], 200);
    }

    public function getListPenelitianBySdmId()
    {
        $validator = Validator::make($this->request->all(), [
            'sdmid' => 'required|regex:/^[a-z0-9\-]+$/',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'DESC'])]
        ], [
            'sdmid.required' => 'field ini harus diisi',
            'sdmid.regex' => 'input harus berupa campuran alpa_numeric dan dash',
            'sortby.alpha' => 'input penyortiran harus kata',
            'sortby.in' => 'input pernyortiran hanya ASC dan DESC'
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => FALSE,
                'message' => 'request gagal',
                'error' => $validator->errors()
            ]);
        }

        $validateInput = $validator->validate();
        $sdmId = $validateInput['sdmid'];
        $sortBy = empty($validateInput['sortby']) ? "" : $validateInput['sortby'];
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
                kb.nm_kel_bidang AS bidang_keilmuan,
                CONCAT(
                    (litabmas.id_thn_laks - 1),
                    '/',
                    litabmas.id_thn_laks
                ) AS tahun_pelaksanaan,
                litabmas.lama_kegiatan AS lama_kegiatan,
                litabmas.create_date AS waktu_data_ditambahkan,
                litabmas.last_update AS terakhir_diubah
            FROM
                pdrd.litabmas AS litabmas
                JOIN pdrd.sdm_anggota_litabmas AS sal ON sal.id_litabmas = litabmas.id_litabmas
                AND sal.id_katgiat = 121300
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

        $get_list_penelitian = [];
        foreach ($query as $value) {
            $get_list_penelitian[] = [
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
            'status' => TRUE,
            'message' => 'success',
            'data'  => $get_list_penelitian
        ], 200);
    }

    public function getDetailPenelitianByPenelitianId()
    {
        $reformatGetDetailPenelitian = [];

        $validator = Validator::make($this->request->all(), [
            'penelitianid' => 'required|regex:/^[a-z0-9\-]+$/',
        ], [
            'penelitianid.required' => 'field ini harus diisi',
            'penelitianid.regex' => 'input harus berupa alpa_numeric dan dash',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => FALSE,
                'message' => 'request gagal',
                'error' => $validator->errors()
            ]);
        }

        $validateInput = $validator->validate();
        $penelitianId = $validateInput['penelitianid'];

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
                    litabmas.id_litabmas = '" . $penelitianId . "'
                    AND litabmas.soft_delete = 0
            ";
            $getDetailPenelitian = DB::select($query);
            foreach ($getDetailPenelitian as $value) {
                $reformatGetDetailPenelitian = [
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
            }

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
                    sal.id_litabmas = '" . $penelitianId . "'
                    AND sal.id_katgiat = 121300
                    AND sal.soft_delete = 0
            ";
            $getDaftarAnggotaDosen = DB::select($query);
            $reformatGetDetailPenelitian = Arr::add($reformatGetDetailPenelitian, 'anggota_dosen', $getDaftarAnggotaDosen);

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
                    pal.id_litabmas = '" . $penelitianId . "'
                    AND pal.soft_delete = 0
            ";
            $getDaftarAnggotaMahasiswa = DB::select($query);
            $reformatGetDetailPenelitian = Arr::add($reformatGetDetailPenelitian, 'anggota_mahasiswa', $getDaftarAnggotaMahasiswa);

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
                    nca_litabmas.id_litabmas = '" . $penelitianId . "'
                    AND nca_litabmas.soft_delete = 0
            ";
            $getDaftarAnggotaNonCA = DB::select($query);
            $reformatGetDetailPenelitian = Arr::add($reformatGetDetailPenelitian, 'anggota_non_ca', $getDaftarAnggotaNonCA);

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
                    litabmas.id_litabmas = '" . $penelitianId . "'
                    AND litabmas.soft_delete = 0
            ";
            $getDaftarDokumenPenelitian = DB::select($query);
            $reformatGetDetailPenelitian = Arr::add($reformatGetDetailPenelitian, 'dokumen_penelitian', $getDaftarDokumenPenelitian);

            return response()->json([
                'status' => TRUE,
                'message' => 'success',
                'data'  => $reformatGetDetailPenelitian
            ], 200);
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return response()->json([
                'status' => FALSE,
                'message' => "Detail Penelitian Tidak Ditemukan atau Penelitian Tidak Terdaftar"
            ]);
        }
    }

    public function storeNewPenelitian()
    {
        $litabmasId = guid();
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';
        $kat_kegiatan = 121300;

        $dok_tmp_path = storage_path('uploads');
        if (!File::isDirectory($dok_tmp_path)) {
            File::makeDirectory($dok_tmp_path, 0755, true, true);
        }

        $judul_kegiatan = $this->request->input('judul_kegiatan');
        $afiliasi =  $this->request->input('afiliasi');
        $kel_bidang = $this->request->input('kel_bidang');
        $litabmas_lanjutan = $this->request->input('litabmas_lanjutan');
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
        $nama_dok = $this->request->input('nama_dok');
        $keterangan_dok = $this->request->input('keterangan_dok');
        $jenis_dok = $this->request->input('jenis_dok');
        $url_dok = $this->request->input('url_dok');

        $anggota_dosen = $this->request->input('anggota_dosen');
        $peran_dosen = $this->request->input('peran_dosen');
        $status_dosen = $this->request->input('status_dosen');

        $anggota_mahasiswa = $this->request->input('anggota_mahasiswa');
        $peran_mahasiswa = $this->request->input('peran_mahasiswa');
        $status_mahasiswa = $this->request->input('status_mahasiswa');

        $anggota_non_ca = $this->request->input('anggota_non_ca');
        $peran_non_ca = $this->request->input('peran_non_ca');
        $status_non_ca = $this->request->input('status_non_ca');

        DB::beginTransaction();
        try {
            $penelitian = $this->litabmas->create([
                'dana_dikti' => $dana_dikti,
                'dana_institusi_lain' => $dana_institusi_lain,
                'dana_pt' => $dana_pt,
                'id_creator' => $creatorId,
                'id_jns_lit' => NULL,
                'id_kel_bidang' => $kel_bidang,
                'id_lanjutan_litabmas' => $litabmas_lanjutan,
                'id_lemb_iptek' => $afiliasi,
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
                'stat_aktif' => 1,
                'thn_laks_ke' => $tahun_pelaksanaan,
                'soft_delete' => 0,
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);

            if (!empty($dok_penelitian)) {
                foreach ($dok_penelitian as $index => $dok) {
                    $fileInfo = explode('.', $dok->getClientOriginalName());
                    $fileOriginalName = $fileInfo[0];
                    $fileExtension = $dok->getClientOriginalExtension();
                    $fileMime = $dok->getClientMimeType();
                    $fileName = str_replace(' ', '_', trim($nama_dok[$index])) . '.' . $fileExtension;
                    if ($dok->move($dok_tmp_path, $fileName)) {
                        $filePath = $dok_tmp_path . DIRECTORY_SEPARATOR . $fileName;
                        $openFile = fopen($filePath, 'r');
                        flock($openFile, LOCK_EX);
                        $fileContent = base64_encode(fread($openFile, filesize($filePath)));
                        flock($openFile, LOCK_UN);
                        fclose($openFile);

                        $dokumen = $this->dokumen->create([
                            'id_dok' => guid(),
                            'id_jns_dok' => $jenis_dok[$index],
                            'nm_dok' => $fileOriginalName,
                            'ket_dok' => $keterangan_dok[$index],
                            'wkt_unggah' => currDateTime(),
                            'url' => $url_dok[$index],
                            'media_type' => $fileMime,
                            'file_name' => $fileName,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                            'file_dok' => DB::raw("CONVERT(VARBINARY(MAX), '" . $fileContent . "')"),
                        ]);

                        $this->dokLitabmas->create([
                            'id_litabmas' => $penelitian->id_litabmas,
                            'id_dok' => $dokumen->id_dok,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime(),
                        ]);

                        @unlink($filePath);
                    } else {
                        return response()->json([
                            'status' => FALSE,
                            'message' => "gagal upload dokumen $fileName"
                        ]);
                    }
                }
            }

            if (!empty($anggota_dosen)) {
                foreach ($anggota_dosen as $index => $idDosen) {
                    $this->sdmLitabmas->create([
                        'id_litabmas' => $penelitian->id_litabmas,
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
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            if (!empty($anggota_non_ca)) {
                foreach ($anggota_non_ca as $index => $idNonCa) {
                    $this->nonCaLitabmas->create([
                        'id_litabmas' => $penelitian->id_litabmas,
                        'id_orang' => $idNonCa,
                        'peran_litabmas' => $peran_non_ca[$index],
                        'stat_aktif' => $status_non_ca[$index],
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            DB::commit();
            return response()->json([
                'status' => TRUE,
                'message' => 'sukses menambahkan penelitian - '. $penelitian->id_litabmas,
            ], 200);
        } catch (Exception $e) {
            Log::error($e->getMessage());
            DB::rollBack();
            return response()->json([
                'status' => FALSE,
                'message' => "gagal menambahkan penelitian - " . $e->getMessage()
            ]);
        }
    }

    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}
