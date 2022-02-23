<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Dok\DokLitabmas;
use App\Models\PDUT\Dok\Dokumen;
use App\Models\PDUT\Pdrd\Litabmas;
use App\Models\PDUT\Pdrd\NonCaAnggotaLitabmas;
use App\Models\PDUT\Pdrd\PdAnggotaLitabmas;
use App\Models\PDUT\Pdrd\SdmAnggotaLitabmas;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\File;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Response;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;

use App\Traits\ApiTrait;
use App\Transformers\PenelitianTransformer;

use Exception;

class PenelitianController extends Controller
{
	use ApiTrait;

    protected $request;
    protected $litabmas;
    protected $sdmLitabmas;
    protected $pdLitabmas;
    protected $nonCaLitabmas;
    protected $dokLitabmas;
    protected $dokumen;

    protected $wrapResponse;

    public function __construct(Request $request)
    {
        $this->setRequest($request);
        $this->sanitizeRequest();

        $this->litabmas = new Litabmas();
        $this->sdmLitabmas = new SdmAnggotaLitabmas();
        $this->pdLitabmas = new PdAnggotaLitabmas();
        $this->nonCaLitabmas = new NonCaAnggotaLitabmas();
        $this->dokLitabmas = new DokLitabmas();
        $this->dokumen = new Dokumen();

        $this->wrapResponse = new WrapResponse;
    }

    public function list()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'count' => 'numeric'
        ]);

        $sortby = $this->request->input('sortby');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }

        $query = "
            SELECT
                lm.id_litabmas AS id_penelitian,
                lm.judul_litabmas AS judul_penelitian,
                kb.nm_kel_bidang AS bidang_keilmuan,
                lm.id_thn_laks AS tahun_pelaksanaan,
                lm.lama_kegiatan AS lama_kegiatan,
                lm.create_date AS waktu_data_ditambahkan,
                lm.last_update AS terakhir_diubah
            FROM
                pdrd.litabmas AS lm
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
            ORDER BY lm.id_thn_laks " . $sortby . "
        ";

        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError(['query' => 'tidak ada daftar penelitian yang ditampilkan'])
                ->render();
        }

        return $this->wrapResponse
            ->setTransformer(new PenelitianTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->withPagination($result->pagination())
            ->render($result->query());
    }

    public function listById()
    {
        InputValidator([
            'sdmid' => 'required|uuid',
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sdmId = $this->request->input('sdmid');
        $sortBy = $this->request->input('sortby');
        if (empty($sortBy)) {
            $sortBy = 'DESC';
        }

        $query = "
            SELECT
                litabmas.id_litabmas AS id_penelitian,
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
                pdrd.litabmas AS litabmas WITH(NOLOCK)
                JOIN pdrd.sdm_anggota_litabmas AS sal WITH(NOLOCK) ON sal.id_litabmas = litabmas.id_litabmas
                AND sal.id_katgiat = 121300
                AND sal.soft_delete = 0
                JOIN ref.kelompok_bidang AS kb WITH(NOLOCK) ON kb.id_kel_bidang = litabmas.id_kel_bidang
                AND kb.expired_date IS NULL
                JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = sal.id_sdm
                AND sdm.soft_delete = 0
                AND sdm.id_sdm = '" . $sdmId . "'
            WHERE
                litabmas.soft_delete = 0
            ORDER BY
                litabmas.id_thn_laks " . $sortBy . "
        ";

        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError(['query' => 'tidak ada daftar penelitian yang ditampilkan'])
                ->render();
        }

        return $this->wrapResponse
            ->setTransformer(new PenelitianTransformer, __FUNCTION__)
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->withPagination($result->pagination())
            ->render($result->query());
    }

    public function getDetailPenelitianByPenelitianId($id)
    {
        $reformatGetDetailPenelitian = [];

        request()->merge(['penelitianid' => $id]);
        InputValidator([
            'penelitianid' => 'required|uuid',
        ], [
            'penelitianid.required' => 'field penelitianid ini harus diisi',
            'penelitianid.uuid' => 'input penelitian id harus berupa uuid yang valid',
        ]);

        $penelitianId = $this->request->input('penelitianid');

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
                    pdrd.litabmas AS litabmas WITH(NOLOCK)
                    LEFT JOIN pdrd.lembaga_iptek AS lembaga_iptek WITH(NOLOCK) ON lembaga_iptek.id_lemb_iptek = litabmas.id_lemb_iptek
                    AND lembaga_iptek.soft_delete = 0
                    LEFT JOIN ref.kelompok_bidang AS kb WITH(NOLOCK) ON kb.id_kel_bidang = litabmas.id_kel_bidang
                    AND kb.expired_date IS NULL
                    LEFT JOIN ref.skim_kegiatan AS skim_kegiatan WITH(NOLOCK) ON skim_kegiatan.id_skim = litabmas.id_skim
                    AND skim_kegiatan.expired_date IS NULL
                WHERE
                    litabmas.id_litabmas = ?
                    AND litabmas.soft_delete = 0
            ";
            $getDetailPenelitian = DB::select($query, [$penelitianId]);
            if (empty($getDetailPenelitian)) {
                return $this->wrapResponse
                    ->setMessage(static::QUERY_RESULT_EMPTY)
                    ->setError(['query' => "penelitian $penelitianId tidak ditemukan"])
                    ->render();
            }

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
                    sal.id_sdm AS id_anggota_dosen,
                    sdm.nm_sdm AS nama_dosen,
                    sal.peran_litabmas AS peran_dosen,
                    sal.stat_aktif AS keaktifan
                FROM
                    pdrd.sdm_anggota_litabmas AS sal WITH(NOLOCK)
                    JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = sal.id_sdm
                    AND sdm.id_jns_sdm = 12
                    AND sdm.soft_delete = 0
                WHERE
                    sal.id_litabmas = ?
                    AND sal.id_katgiat = 121300
                    AND sal.soft_delete = 0
            ";
            $getDaftarAnggotaDosen = DB::select($query, [$penelitianId]);
            $reformatGetDetailPenelitian = Arr::add($reformatGetDetailPenelitian, 'anggota_dosen', $getDaftarAnggotaDosen);

            $query = "
                SELECT
                    pal.id_pd_ang_litabmas AS id_anggota_mahasiswa,
                    pd.nm_pd AS nama_mahasiswa,
                    pal.peran_litabmas AS peran_mahasiswa,
                    pal.stat_aktif AS keaktifan
                FROM
                    pdrd.pd_anggota_litabmas AS pal WITH(NOLOCK)
                    JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = pal.id_pd
                    AND pd.soft_delete = 0
                WHERE
                    pal.id_litabmas = ?
                    AND pal.soft_delete = 0
            ";
            $getDaftarAnggotaMahasiswa = DB::select($query, [$penelitianId]);
            $reformatGetDetailPenelitian = Arr::add($reformatGetDetailPenelitian, 'anggota_mahasiswa', $getDaftarAnggotaMahasiswa);

            $query = "
                SELECT
                    nca_litabmas.id_orang AS id_anggota_nonca,
                    nca.nm_orang AS nama_nonca,
                    nca_litabmas.peran_litabmas AS peran_nonca,
                    nca_litabmas.stat_aktif AS keaktifan
                FROM
                    pdrd.non_ca_anggota_litabmas AS nca_litabmas WITH(NOLOCK)
                    JOIN pdrd.non_ca AS nca WITH(NOLOCK) ON nca.id_orang = nca_litabmas.id_orang
                    AND nca.soft_delete = 0
                WHERE
                    nca_litabmas.id_litabmas = ?
                    AND nca_litabmas.soft_delete = 0
            ";
            $getDaftarAnggotaNonCA = DB::select($query, [$penelitianId]);
            $reformatGetDetailPenelitian = Arr::add($reformatGetDetailPenelitian, 'anggota_non_ca', $getDaftarAnggotaNonCA);

            $query = "
                SELECT
                    dok_dokumen.id_dok AS id_dokumen,
                    dok_dokumen.nm_dok AS nama_dok,
                    dok_dokumen.file_name AS nama_file,
                    dok_dokumen.media_type AS jenis_file,
                    dok_litabmas.create_date AS tanggal_upload,
                    refj_dokumen.nm_jns_dok AS jenis_dokumen
                FROM
                    pdrd.litabmas AS litabmas WITH(NOLOCK)
                    JOIN dok.dok_litabmas AS dok_litabmas WITH(NOLOCK) ON dok_litabmas.id_litabmas = litabmas.id_litabmas
                    AND dok_litabmas.soft_delete = 0
                    LEFT JOIN dok.dokumen AS dok_dokumen WITH(NOLOCK) ON dok_dokumen.id_dok = dok_litabmas.id_dok
                    AND dok_dokumen.soft_delete = 0
                    LEFT JOIN ref.jenis_dokumen AS refj_dokumen WITH(NOLOCK) ON refj_dokumen.id_jns_dok = dok_dokumen.id_jns_dok
                    AND refj_dokumen.expired_date IS NULL
                WHERE
                    litabmas.id_litabmas = ?
                    AND litabmas.soft_delete = 0
            ";
            $getDaftarDokumenPenelitian = DB::select($query, [$penelitianId]);
            $reformatGetDetailPenelitian = Arr::add($reformatGetDetailPenelitian, 'dokumen_penelitian', $getDaftarDokumenPenelitian);

            $data = $reformatGetDetailPenelitian;

            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->render($data);
        } catch (Exception $e) {
            Log::error(__FUNCTION__ . ' - ' . $e->getMessage());
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError(['query' => "detail penelitian $penelitianId tidak ditemukan atau penelitian tidak terdaftar"])
                ->render();
        }
    }

    public function storeNewPenelitian()
    {
        InputValidator([
            'judul_kegiatan' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'afiliasi' => 'required|uuid',
            'kel_bidang' => 'nullable|uuid',
            'litabmas_lanjutan' => 'nullable|uuid',
            'jenis_skim' => 'nullable|uuid',
            'lokasi_kegiatan' => 'nullable|string',
            'tahun_usulan' => 'required|date_format:Y',
            'tahun_pelaksanaan' => 'required|date_format:Y',
            'tahun_kegiatan' => 'required|date_format:Y',
            'lama_kegiatan' => 'required|numeric|min:1|max:10',
            'dana_dikti' => 'required|numeric|gte:0',
            'dana_pt' => 'required|numeric|gte:0',
            'dana_institusi_lain' => 'required|numeric|gte:0',
            'in_kind' => 'nullable|uuid',
            'no_sk_penugasan' => 'nullable|regex:/^[A-Z0-9\/\.]+$/',
            'tgl_sk_penugasan' => 'nullable|date_format:Y-m-d',
            'dok_penelitian.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,txt|max:2048',
            'nama_dok.*' => 'required_with:dok_penelitian|string',
            'keterangan_dok.*' => 'required_with:dok_penelitian|string',
            'jenis_dok.*' => 'nullable|numeric',
            'url_dok.*' => 'nullable|url',
            'anggota_dosen.*' => 'nullable|uuid',
            'peran_dosen.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_dosen.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            'anggota_mahasiswa.*' => 'nullable|uuid',
            'peran_mahasiswa.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_mahasiswa.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            'anggota_non_ca.*' => 'nullable|uuid',
            'peran_non_ca.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_non_ca.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])]
        ]);

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
        $no_sk_penugasan = $this->request->input('no_sk_penugasan');
        $tgl_sk_penugasan = $this->request->input('tgl_sk_penugasan');

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
                    if (is_null($dok)) break;

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
                        return $this->wrapResponse->setMessage(static::FAILED_UPLOAD)->setError(['upload' => "gagal upload dokumen"])->render();
                    }
                }
            }

            if (!empty($anggota_dosen)) {
                foreach ($anggota_dosen as $index => $idDosen) {
                    if (is_null($idDosen)) break;

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
                    if (is_null($idMahasiswa)) break;

                    $dataMahasiswa = DB::select("
                        SELECT
                            TOP 1
                            pd.nm_pd AS nama_mahasiswa,
                            reg_pd.nipd AS nipd
                        FROM
                            pdrd.peserta_didik AS pd WITH(NOLOCK)
                            LEFT JOIN pdrd.reg_pd AS reg_pd WITH(NOLOCK) ON reg_pd.id_pd = pd.id_pd
                            AND reg_pd.soft_delete = 0
                        WHERE
                            pd.id_pd = ?
                            AND pd.soft_delete = 0
                    ", [$idMahasiswa]);

                    if (empty($dataMahasiswa)) {
                        return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError(['query' => "tidak ditemukan data mahasiswa"])->render();
                    }

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
                    if (is_null($idNonCa)) break;

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
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('sukses menambahkan penelitian - ' . $penelitian->id_litabmas)->render();
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError(['query' => "penelitian tidak ditemukan atau penelitian tidak terdaftar"])->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::INSERT_FAILED)->setError(['query' => "gagal menambahkan penelitian"])->render();
        }
    }

    public function updatePenelitian()
    {
        InputValidator([
            'id_penelitian' => 'required|uuid',
            'judul_kegiatan' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
            'afiliasi' => 'required|uuid',
            'kel_bidang' => 'uuid',
            'litabmas_lanjutan' => 'nullable|uuid',
            'jenis_skim' => 'nullable|uuid',
            'lokasi_kegiatan' => 'string',
            'tahun_usulan' => 'required|date_format:Y',
            'tahun_pelaksanaan' => 'required|date_format:Y',
            'tahun_kegiatan' => 'required|date_format:Y',
            'lama_kegiatan' => 'required|numeric|min:1|max:10',
            'dana_dikti' => 'required|numeric|gte:0',
            'dana_pt' => 'required|numeric|gte:0',
            'dana_institusi_lain' => 'required|numeric|gte:0',
            'in_kind' => 'nullable|uuid',
            'no_sk_penugasan' => 'regex:/^[A-Z0-9\/\.]+$/',
            'tgl_sk_penugasan' => 'date_format:Y-m-d',
            'dok_penelitian.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,txt|max:2048',
            'nama_dok.*' => 'nullable|string',
            'keterangan_dok.*' => 'required_with:dok_penelitian.*|nullable|string',
            'jenis_dok.*' => 'nullable|numeric',
            'url_dok.*' => 'nullable|url',
            'anggota_dosen.*' => 'nullable|uuid',
            'peran_dosen.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_dosen.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            'pd_litabmas_mahasiswa_id.*' => 'nullable|uuid',
            'anggota_mahasiswa.*' => 'nullable|uuid',
            'peran_mahasiswa.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_mahasiswa.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            'anggota_non_ca.*' => 'nullable|uuid',
            'peran_non_ca.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
            'status_non_ca.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])]
        ]);

        $litabmasId = $this->request->input('id_penelitian');
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

        $no_sk_penugasan = $this->request->input('no_sk_penugasan');
        $tgl_sk_penugasan = $this->request->input('tgl_sk_penugasan');

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
            $penelitian = $this->litabmas->where('id_litabmas', $litabmasId)->first();
            if (!$penelitian) {
                return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError(['query' => 'penelitian tidak ditemukan atau penelitian tidak terdaftar']);
            }

            $penelitian->update([
                'id_litabmas' => $litabmasId,
                'id_lemb_iptek' => $afiliasi,
                'judul_litabmas' => $judul_kegiatan,
                'lama_kegiatan' => $lama_kegiatan,
                'thn_laks_ke' => $tahun_pelaksanaan,
                'dana_dikti' => $dana_dikti,
                'dana_pt' => $dana_pt,
                'dana_institusi_lain' => $dana_institusi_lain,
                'in_kind' => $in_kind,
                'stat_aktif' => 1,
                'jns_litabmas' => 'M',
                'sk_tugas' => $no_sk_penugasan,
                'tgl_sk_tugas' => $tgl_sk_penugasan,
                'lokasi_kegiatan' => $lokasi_kegiatan,
                'id_skim' => $jenis_skim,
                'id_thn_usulan' => $tahun_usulan,
                'id_thn_kegiatan' => $tahun_kegiatan,
                'id_thn_laks' => $tahun_pelaksanaan,
                'id_lanjutan_litabmas' => $litabmas_lanjutan,
                'id_kel_bidang' => $kel_bidang,
                'id_tse' => NULL,
                'id_smi' => NULL,
                'id_jns_lit' => NULL,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
            ]);

            if (!empty($dok_penelitian)) {
                foreach ($dok_penelitian as $index => $dok) {
                    if (is_null($dok)) break;

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
                            'id_litabmas' => $litabmasId,
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
                        return $this->wrapResponse->setMessage(static::FAILED_UPLOAD)->setMessage(['upload' => 'gagal upload dokumen']);
                    }
                }
            }

            if (!empty($anggota_dosen)) {
                foreach ($anggota_dosen as $index => $idDosen) {
                    if (is_null($idDosen)) break;

                    $anggota_dosen = $this->sdmLitabmas->where('id_litabmas', $litabmasId)->where('id_sdm', $idDosen)->exists();
                    if (!$anggota_dosen) {
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
                    } else {
                        $anggota_dosen->update([
                            'id_litabmas' => $litabmasId,
                            'id_sdm' => $idDosen,
                            'id_katgiat' => $kat_kegiatan,
                            'peran_litabmas' => $peran_dosen[$index],
                            'stat_aktif' => $status_dosen[$index],
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                        ]);
                    }
                }
            }

            if (!empty($anggota_mahasiswa)) {
                foreach ($anggota_mahasiswa as $index => $idMahasiswa) {
                    if (is_null($idMahasiswa)) break;

                    $anggota_mahasiswa = $this->pdLitabmas->where('id_litabmas', $litabmasId)->where('id_pd', $idMahasiswa)->exists();
                    if (!$anggota_mahasiswa) {
                        $dataMahasiswa = DB::select("
                            SELECT
                                TOP 1
                                pd.nm_pd AS nama_mahasiswa,
                                reg_pd.nipd AS nipd
                            FROM
                                pdrd.peserta_didik AS pd WITH(NOLOCK)
                                LEFT JOIN pdrd.reg_pd AS reg_pd WITH(NOLOCK) ON reg_pd.id_pd = pd.id_pd
                                AND reg_pd.soft_delete = 0
                            WHERE
                                pd.id_pd = ?
                                AND pd.soft_delete = 0
                        ", [$idMahasiswa]);

                        if (empty($dataMahasiswa)) {
                            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError(['query' => 'tidak ditemukan data mahasiswa anggota penelitian']);
                        }

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
                    } else {
                        $dataMahasiswa = DB::select("
                            SELECT
                                TOP 1
                                pd.nm_pd AS nama_mahasiswa,
                                reg_pd.nipd AS nipd
                            FROM
                                pdrd.peserta_didik AS pd WITH(NOLOCK)
                                LEFT JOIN pdrd.reg_pd AS reg_pd WITH(NOLOCK) ON reg_pd.id_pd = pd.id_pd
                                AND reg_pd.soft_delete = 0
                            WHERE
                                pd.id_pd = ?
                                AND pd.soft_delete = 0
                        ", [$idMahasiswa]);

                        if (empty($dataMahasiswa)) {
                            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError(['query' => 'tidak ditemukan data mahasiswa anggota penelitian']);
                        }

                        $anggota_mahasiswa->update([
                            'id_litabmas' => $litabmasId,
                            'id_pd' => $idMahasiswa,
                            'peran_litabmas' => $peran_mahasiswa[$index],
                            'stat_aktif' => $status_mahasiswa[$index],
                            'nm_pd' => $dataMahasiswa[0]->nama_mahasiswa,
                            'nipd' => $dataMahasiswa[0]->nipd,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                        ]);
                    }
                }
            }

            if (!empty($anggota_non_ca)) {
                foreach ($anggota_non_ca as $index => $idNonCa) {
                    if (is_null($idNonCa)) break;

                    $anggota_non_ca = $this->nonCaLitabmas->where('id_litabmas', $litabmasId)->where('id_orang', $idNonCa)->exists();
                    if (!$anggota_non_ca) {
                        $this->nonCaLitabmas->create([
                            'id_litabmas' => $litabmasId,
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
                    } else {
                        $anggota_non_ca->update([
                            'id_litabmas' => $litabmasId,
                            'id_orang' => $idNonCa,
                            'peran_litabmas' => $peran_non_ca[$index],
                            'stat_aktif' => $status_non_ca[$index],
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                        ]);
                    }
                }
            }

            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('sukses mengupdate penelitian - ' . $litabmasId)->render();
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError(['query' => 'penelitian tidak ditemukan atau penelitian tidak terdaftar']);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('error on Function ' . __FUNCTION__ . ' with ' . $e->getMessage() . ' on ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::UPDATE_FAILED)->setError(['query' => "gagal mengupdate penelitian $litabmasId"]);
        }
    }

    public function deletePenelitian()
    {
        InputValidator([
            'penelitianid' => 'required|uuid',
        ], [
            'penelitianid.required' => 'field penelitianid ini harus diisi',
            'penelitianid.uuid' => 'input penelitianid harus berupa uuid yang valid',
        ]);

        $penelitianId = $this->request->input('penelitianid');

        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.litabmas SET soft_delete = 1 WHERE id_litabmas = $penelitianId");
            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('berhasial menghapus data penelitian - ' . $penelitianId)->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error on ' . $e->getMessage() . ' in line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::DELETE_FAILED)->setError(['query' => "gagal menghapus penelitian $penelitianId"]);
        }
    }
}
