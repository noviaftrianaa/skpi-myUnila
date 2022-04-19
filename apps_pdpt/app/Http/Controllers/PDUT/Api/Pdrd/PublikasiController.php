<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\Publikasi;
use App\Models\PDUT\Pdrd\TulisPub;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\Rule as ValidationRule;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;

use App\Traits\ApiTrait;
use Arr;
use Exception;

class PublikasiController extends Controller
{
    use ApiTrait;

    protected $request;
    protected $publikasi;
    protected $tulisPublikasi;
    protected $mappingIdKatgiat = [];
    protected $mappingJenisPenulis = [];
    protected $wrapResponse;

    const DOSEN = 'dosen';
    const TENDIK = 'tendik';
    const PESERTA_DIDIK = 'pd';

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->mappingIdKatgiat = '';

        $mappingIdKatgiat = [
            120101, 120102, 120103,
            120104, 120105, 120106,
            120107, 120108, 120109,
            120110, 120111, 120112,
            120901, 120902, 120903,
            120904, 120905, 120906,
            120907, 120908, 120909,
            120910, 120911, 120113,
            120114, 120115, 120116,
            120117, 120118, 120119,
            120120, 120121, 120122,
            120200, 120300, 121300,
            130500, 130600
        ];

        $this->mappingIdKatgiat = Cache::rememberForever('mappingIdKatgiat', function () use ($mappingIdKatgiat) {
            foreach ($mappingIdKatgiat as $idKatgiat) {
                $this->mappingIdKatgiat .= "'" . $idKatgiat . "',";
            }
            return $this->mappingIdKatgiat = rtrim($this->mappingIdKatgiat, ',');
        });

        $this->mappingJenisPenulis = [
            'A' => 'Penulis',
            'B' => 'Editor',
            'C' => 'Penerjemahan',
            'D' => 'Penemu/Inventor'
        ];

        $this->publikasi = new Publikasi();
        $this->tulisPublikasi = new TulisPub();
        $this->wrapResponse = new WrapResponse;
    }

    public function daftar()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'type' => 'numeric',
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
        ]);

        $sortby = $this->request->input('sortby');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }

        $query = "
            SELECT
                pub.id_Publikasi AS id,
                pub.judul,
                tpub.nm_kat AS kategori_kegiatan,
                jpub.nm_jns_pub AS jenis_publikasi,
                pub.quartile,
                pub.tgl_terbit,
                pub.stat_impor_sinta,
                pub.create_date AS waktu_data_ditambahkan,
                pub.last_update AS terakhir_diubah
            FROM
                pdrd.publikasi AS pub
            JOIN (
                SELECT
                    DISTINCT id_publikasi,
                    kk.*
                from
                    pdrd.tulis_pub AS tp
                    JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat = tp.id_katgiat
                where
                    tp.id_katgiat IN (" . $this->mappingIdKatgiat . ")
                    AND tp.soft_delete = 0
            ) AS tpub ON tpub.id_publikasi = pub.id_publikasi
            JOIN ref.jenis_publikasi AS jpub ON jpub.id_jns_pub = pub.id_jns_pub";

        if (!empty($this->request->input('type'))) {
            $query .= "
                WHERE
                    pub.id_jns_pub = " . $this->request->input('type') . "
            ";
        }

        $query .= "
            ORDER BY pub.create_date " . $sortby . "
        ";

        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar publikasi yang ditampilkan')
                ->render();
        }

        $data = [];
        foreach ($result->query() as $value) {
            $data[] = [
                'id' => $value->id,
                'judul' => $value->judul,
                'kategori_kegiatan' => $value->kategori_kegiatan,
                'jenis_publikasi' => $value->jenis_publikasi,
                'quartile' => $value->quartile,
                'tanggal_terbit' => $value->tgl_terbit,
                'asal_data' => (!is_null($value->stat_impor_sinta)) ? 'SISTER' : 'SINTA',
                'waktu_data_ditambahkan' => $value->waktu_data_ditambahkan,
                'terakhir_diubah' => $value->terakhir_diubah
            ];
        }

        return $this->wrapResponse
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->withSimplePagination()
            ->render($data);
    }

    public function daftar_id()
    {
        InputValidator([
            'sdmid' => 'required|uuid',
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sdmid = $this->request->input('sdmid');
        $sortby = $this->request->input('sortby');
        if (empty($sortby)) {
            $sortby = 'DESC';
        }

        $check_id_is_sdm = "
            SELECT
                TOP 1 sdm.nm_sdm,
                sdm.id_jns_sdm
            FROM
                pdrd.sdm AS sdm
            WHERE
                sdm.id_sdm = '" . $sdmid . "'
        ";
        $check_id_is_sdm = DB::select($check_id_is_sdm);

        if (empty($check_id_is_sdm)) {
            $check_id_is_pd = "
                SELECT 
                    TOP 1 pd.id_pd 
                FROM 
                    pdrd.peserta_didik AS pd 
                WHERE 
                    pd.id_pd = '" . $sdmid . "'
            ";
            $check_id_is_pd = DB::select($check_id_is_pd);
            if (!empty($check_id_is_pd)) {
                $selectedIdProcess = self::PESERTA_DIDIK;
            } else {
                return $this->wrapResponse
                    ->setMessage(static::QUERY_RESULT_EMPTY)
                    ->setError('id penulis tidak valid')
                    ->render();
            }
        } else {
            if ($check_id_is_sdm && $check_id_is_sdm[0]->id_jns_sdm == 12) {
                $selectedIdProcess = self::DOSEN;
            } elseif ($check_id_is_sdm && $check_id_is_sdm[0]->id_jns_sdm == 13) {
                $selectedIdProcess = self::TENDIK;
            }
        }

        $query = "
            SELECT
                publikasi.id_publikasi AS id,
                tls_publikasi.id_sdm AS id_sdm,
                publikasi.judul AS judul,
                publikasi.quartile,
                kb.nm_kel_bidang AS bidang_keilmuan,
                jp.nm_jns_pub AS jenis_publikasi,
                publikasi.tgl_terbit AS tanggal_terbit,
                publikasi.create_date AS waktu_data_ditambahkan,
                publikasi.last_update AS terakhir_diubah
            FROM
                pdrd.tulis_pub AS tls_publikasi
                LEFT JOIN pdrd.publikasi AS publikasi ON publikasi.id_publikasi = tls_publikasi.id_publikasi
                LEFT JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat = tls_publikasi.id_katgiat
                    AND kk.id_katgiat IN (" . $this->mappingIdKatgiat . ")
                    AND kk.expired_date IS NULL
                LEFT JOIN ref.jenis_publikasi AS jp ON jp.id_jns_pub = publikasi.id_jns_pub
                    AND jp.expired_date IS NULL
                LEFT JOIN ref.media_publikasi AS mp ON mp.id_media_pub = publikasi.id_media_pub
                    AND mp.expired_date IS NULL
                LEFT JOIN pdrd.map_publikasi_bidang AS mpb ON mpb.id_publikasi = publikasi.id_publikasi
                    AND mpb.soft_delete = 0
                LEFT JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = mpb.id_kel_bidang
                    AND kb.expired_date IS NULL
                WHERE
                    tls_publikasi.soft_delete = 0
        ";

        if (isset($selectedIdProcess) && ($selectedIdProcess == self::DOSEN || $selectedIdProcess == self::TENDIK)) {
            $query .= " AND tls_publikasi.id_sdm = '" . $sdmid . "'";
        } else {
            $query .= " AND tls_publikasi.id_pd = '" . $sdmid . "'";
        }

        $query .= "
            ORDER BY publikasi.tgl_terbit $sortby
        ";

        $result = new QueryPagination($query);
        if (empty($result->query())) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError('tidak ada daftar publikasi yang ditampilkan')
                ->render();
        }

        $data = [];
        foreach ($result->query() as $value) {
            $data[] = [
                'id' => $value->id,
                'judul' => $value->judul,
                'quartile' => $value->quartile,
                'bidang_keilmuan' => $value->bidang_keilmuan,
                'jenis_publikasi' => $value->jenis_publikasi,
                'tanggal_terbit' => $value->tanggal_terbit,
                'waktu_data_ditambahkan' => $value->waktu_data_ditambahkan,
                'terakhir_diubah' => $value->terakhir_diubah
            ];
        }

        return $this->wrapResponse
            ->setStatusCode(Response::HTTP_ACCEPTED)
            ->withSimplePagination()
            ->render($data);
    }

    public function detail()
    {
        InputValidator([
            'publikasiid' => 'required|uuid',
        ],  [
            'publikasiid.required' => 'field publikasiid ini harus diisi',
            'publikasiid.uuid' => 'input publikasi id harus berupa uuid yang valid',
        ]);

        $reformatDetailPublikasi = [];
        $publikasiId = $this->request->input('publikasiid');

        $query = "
            SELECT
                pub.id_publikasi,
                pub.judul,
                pub.nama_jurnal,
                jpub.nm_jns_pub,
                pub.tgl_terbit,
                pub.penerbit,
                pub.url,
                kcl.nm_kat_capaian,
                pub.a_komersialisasi,
                litabmas.judul_litabmas,
                jmp.nm_jns_media
            FROM
                pdrd.publikasi AS pub
                LEFT JOIN pdrd.litabmas AS litabmas ON litabmas.id_litabmas = pub.id_litabmas
                LEFT JOIN ref.jenis_publikasi AS jpub ON jpub.id_jns_pub = pub.id_jns_pub
                LEFT JOIN ref.kategori_capaian_luaran AS kcl ON kcl.id_kat_capaian = pub.id_kat_capaian
                LEFT JOIN ref.media_publikasi AS mp ON mp.id_media_pub = pub.id_media_pub
                LEFT JOIN ref.jenis_media_pub AS jmp ON jmp.id_jns_media = mp.id_jns_media
            WHERE
                pub.id_publikasi = ?
                AND pub.soft_delete = 0
        ";

        $getDetailPublikasi = DB::select($query, [$publikasiId]);
        if (empty($getDetailPublikasi)) {
            return $this->wrapResponse
                ->setMessage(static::QUERY_RESULT_EMPTY)
                ->setError("publikasi $publikasiId tidak ditemukan")
                ->render();
        }

        $reformatDetailPublikasi = collect($getDetailPublikasi[0])->toArray();

        $query = "
            SELECT
                sdm.id_sdm AS id,
                sdm.nm_sdm,
                tpub.urutan,
                tpub.afiliasi,
                tpub.peran_tulis
            FROM
                pdrd.tulis_pub AS tpub
                JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tpub.id_sdm
            WHERE
                tpub.id_publikasi = ?
        ";

        $getDaftarAnggotaDosen = DB::select($query, [$publikasiId]);
        $reformatDetailPublikasi = Arr::add($reformatDetailPublikasi, 'anggota_dosen', $getDaftarAnggotaDosen);

        $query = "
            SELECT
                pd.id_pd AS id,
                pd.nm_pd,
                tpub.urutan,
                tpub.afiliasi,
                tpub.peran_tulis
            FROM
                pdrd.tulis_pub AS tpub
                JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tpub.id_pd
            WHERE
                tpub.id_publikasi = ?
        ";

        $getDaftarAnggotaMahasiswa = DB::select($query, [$publikasiId]);
        $reformatDetailPublikasi = Arr::add($reformatDetailPublikasi, 'aggota_mahasiswa', $getDaftarAnggotaMahasiswa);

        $query = "
            SELECT
                nca.id_orang AS id,
                nca.nm_orang,
                tpub.urutan,
                tpub.afiliasi,
                tpub.peran_tulis
            FROM
                pdrd.tulis_pub AS tpub
                JOIN pdrd.non_ca AS nca ON nca.id_orang = tpub.id_orang
            WHERE
                tpub.id_publikasi = ?
        ";

        $getDaftarAnggotaNonCa = DB::select($query, [$publikasiId]);
        $reformatDetailPublikasi = Arr::add($reformatDetailPublikasi, 'aggota_nonCa', $getDaftarAnggotaNonCa);

        $data = $reformatDetailPublikasi;

        $query = "
        SELECT
            dok.id_dok AS id_dokumen,
            dok.nm_dok AS nama_dokumen,
            dok.file_name AS name_file,
            dok.media_type AS jenis_file,
            dok_pub.create_date AS tanggal_upload,
            j_dok.nm_jns_dok AS jenis_dokumen
        FROM
            pdrd.publikasi AS pub
            JOIN dok.dok_pub AS dok_pub ON dok_pub.id_publikasi = pub.id_publikasi
            AND dok_pub.soft_delete = 0
            LEFT JOIN dok.dokumen AS dok ON dok.id_dok = dok_pub.id_dok
            AND dok.soft_delete = 0
            LEFT JOIN ref.jenis_dokumen AS j_dok ON j_dok.id_jns_dok = dok.id_jns_dok
            AND j_dok.expired_date IS NULL
        WHERE
            pub.id_publikasi = ?
            AND pub.soft_delete = 0"
        ;

        $getDaftarDokumenPublikasi = DB::select($query, [$publikasiId]);
        $reformatDetailPublikasi = Arr::add($reformatDetailPublikasi, 'dokumen_penelitian', $getDaftarDokumenPublikasi);

        $data = $reformatDetailPublikasi;

        return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->render($data);
    }

    public function tambah()
    {
        // InputValidator([
        //     'judul' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        //     'id_katgiat' => 'required|uuid',
        //     'id_jenis_publikasi' => 'nullable|uuid',
        //     'id_kategori_capaian' => 'nullable|uuid',
        //     'id_litabmas' => 'nullable|uuid',
        //     'nama_jurnal' => 'nullable|string',
        //     'edisi' => 'required|date_format:Y',
        //     'judul_chapter' => 'required|date_format:Y',
        //     'jumlah_halaman' => 'required|date_format:Y',
        //     'penerbit' => 'required|numeric|min:1|max:10',
        //     'bahasa' => 'required|numeric|gte:0',
        //     'isbn' => 'required|numeric|gte:0',
        //     'keterangan' => 'required|numeric|gte:0',
        //     'laman_jurnal' => 'nullable|uuid',
        //     'volume' => 'nullable|regex:/^[A-Z0-9\/\.]+$/',
        //     'nomor' => 'nullable|date_format:Y-m-d',
        //     'doi' => 'nullable|date_format:Y-m-d',
        //     'issn' => 'nullable|date_format:Y-m-d',
        //     'judul_asli' => 'nullable|date_format:Y-m-d',
        //     'kota_penyelenggara' => 'nullable|date_format:Y-m-d',
        //     'a_seminar' => 'nullable|date_format:Y-m-d',
        //     'a_prosiding' => 'nullable|date_format:Y-m-d',
        //     'a_issn' => 'nullable|date_format:Y-m-d',
        //     'tgl_terbit' => 'nullable|date_format:Y-m-d',
            
        //     'dok_penelitian.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx,xls,xlsx,txt|max:2048',
        //     'nama_dok.*' => 'required_with:dok_penelitian|string',
        //     'keterangan_dok.*' => 'required_with:dok_penelitian|string',
        //     'jenis_dok.*' => 'nullable|numeric',
        //     'url_dok.*' => 'nullable|url',

        //     'penulis_dosen.*' => 'nullable|uuid',
        //     'urutan_dosen.*' => 'nullable|uuid',
        //     'afiliasi_dosen.*' => 'nullable|uuid',
        //     'peran_dosen.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
        //     'dsn_a_corresponding_author.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
           
        //     'penulis_mahasiswa.*' => 'nullable|uuid',
        //     'urutan_mahasiswa.*' => 'nullable|uuid',
        //     'afiliasi_mahasiswa.*' => 'nullable|uuid',
        //     'peran_mahasiswa.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
        //     'mhs_a_corresponding_author.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])],
            
        //     'penulis_non_ca.*' => 'nullable|uuid',
        //     'urutan_non_ca.*' => 'nullable|uuid',
        //     'afiliasi_non_ca.*' => 'nullable|uuid',
        //     'peran_non_ca.*' => ['alpha', 'nullable', ValidationRule::in(['A', 'K'])],
        //     'non_ca_a_corresponding_author.*' => ['numeric', 'nullable', ValidationRule::in(['0', '1'])]
        // ]);

        $publikasiId = guid();
        $creatorId = $updateId = 'bc62ca9c-4e6e-4462-89b6-ff246512734f';

        $judul = $this->request->input('judul');
        $id_katgiat = $this->request->input('id_katgiat');
        $id_jenis_publikasi = $this->request->input('id_jenis_publikasi');
        $id_kategori_capaian = $this->request->input('id_kategori_capaian');
        $id_litabmas = $this->request->input('id_litabmas');
        $nama_jurnal = $this->request->input('nama_jurnal');
        $edisi = $this->request->input('edisi');
        $judul_chapter = $this->request->input('judul_chapter');
        $jumlah_halaman = $this->request->input('jumlah_halaman');
        $penerbit = $this->request->input('penerbit');
        $bahasa = $this->request->input('bahasa');
        $isbn = $this->request->input('isbn');
        $keterangan = $this->request->input('keterangan');
        $laman_jurnal = $this->request->input('laman_jurnal');
        $volume = $this->request->input('volume');
        $nomor = $this->request->input('nomor');
        $doi = $this->request->input('doi');
        $issn = $this->request->input('issn');
        $judul_asli = $this->request->input('judul_asli');
        $kota_penyelenggara = $this->request->input('kota_penyelenggara');
        $a_seminar = $this->request->input('a_seminar');
        $a_prosiding = $this->request->input('a_prosiding');
        $e_issn = $this->request->input('e_issn');
        $tgl_terbit = $this->request->input('tgl_terbit');

        $penulis_dosen = $this->request->input('penulis_dosen');
        $urutan_dosen = $this->request->input('urutan_dosen');
        $afiliasi_dosen = $this->request->input('afiliasi_dosen');
        $peran_dosen = $this->request->input('peran_dosen');
        $dsn_a_corresponding_author = $this->request->input('dsn_a_corresponding_author');

        $penulis_mahasiswa = $this->request->input('penulis_mahasiswa');
        $urutan_mahasiswa = $this->request->input('urutan_mahasiswa');
        $afiliasi_mahasiswa = $this->request->input('afiliasi_mahasiswa');
        $peran_tulis_mahasiswa = $this->request->input('peran_tulis_mahasiswa');
        $mhs_a_corresponding_author = $this->request->input('dsn_a_corresponding_author');

        $penulis_non_ca = $this->request->input('penulis_non_ca');
        $urutan_non_ca = $this->request->input('urutan_non_ca');
        $afiliasi_non_ca = $this->request->input('afiliasi_non_ca');
        $peran_tulis_non_ca = $this->request->input('peran_tulis_non_ca');
        $non_ca_a_corresponding_author = $this->request->input('non_ca_a_corresponding_author');

        DB::beginTransaction();
        try {
            $publikasi = $this->publikasi->create([
                'id_publikasi' => $publikasiId,
                'id_jns_pub' => $id_jenis_publikasi,
                'judul' => $judul,
                'judul_chapter' => $judul_chapter,
                'judul_asli' => $judul_asli,
                'abstrak' => NULL,
                'nama_jurnal' => $nama_jurnal,
                'laman_jurnal' => $laman_jurnal,
                'tgl_terbit' => $tgl_terbit,
                'edisi' => $edisi,
                'impact_jurnal' => NULL,
                'vol' => $volume,
                'no' => $nomor,
                'hal' => NULL,
                'jml_hal' => $jumlah_halaman,
                'penerbit' => $penerbit,
                'kota' => $kota_penyelenggara,
                'a_seminar' => $a_seminar,
                'a_prosiding' => $a_prosiding,
                'dimensi' => NULL,
                'bahasa' => $bahasa,
                'no_paten' => NULL,
                'pemberi_paten' => NULL,
                'doi' => $doi,
                'isbn' => $isbn,
                'issn' => $issn,
                'e_issn' => $e_issn,
                'url' => NULL,
                'ket' => $keterangan,
                'pengguna_produk_jasa' => NULL,
                'a_komersialisasi' => 0,
                'stat_impor_sinta' => 0,
                'quartile' => NULL,
                'id_kat_capaian' => $id_kategori_capaian,
                'id_media_pub' => NULL,
                'id_litabmas' => $id_litabmas,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
            ]);

            if (!empty($penulis_dosen)) {
                foreach ($penulis_dosen as $index => $iddsn) {
                    if (is_null($iddsn)) break;

                    $reformatJenisPenulisDsn = 1;

                    $this->tulisPublikasi->create([
                        'id_tulis_pub' => guid(),
                        'id_publikasi' => $publikasi->id_publikasi,
                        'id_sdm' => $iddsn,
                        'id_katgiat' => $id_katgiat,
                        'id_pd' => NULL,
                        'id_orang' => NULL,
                        'urutan' => $urutan_dosen[$index],
                        'afiliasi' => $afiliasi_dosen[$index],
                        'peran_tulis' => $peran_dosen[$index],
                        'jns_penulis' => $reformatJenisPenulisDsn,
                        'a_corr_author' => $dsn_a_corresponding_author[$index],
                        'nm_pd' => NULL,
                        'nipd' => NULL,
                        'id_afiliasi' => NULL,
                        'jns_afiliasi' => NULL,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            if (!empty($penulis_mahasiswa)) {
                foreach ($penulis_mahasiswa as $index => $idmhs) {
                    if (is_null($idmhs)) break;

                    $reformatJenisPenulisMhs = 1;
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
                    ", [$idmhs]);

                    if (empty($dataMahasiswa)) {
                        return WrapResponse([], 'tidak ditemukan data mahasiswa anggota publikasi', FALSE);
                    }

                    $this->tulisPublikasi->create([
                        'id_tulis_pub' => guid(),
                        'id_publikasi' => $publikasi->id_publikasi,
                        'id_sdm' => NULL,
                        'id_katgiat' => $id_katgiat,
                        'id_pd' => $idmhs,
                        'id_orang' => NULL,
                        'urutan' => $urutan_mahasiswa[$index],
                        'afiliasi' => $afiliasi_mahasiswa[$index],
                        'peran_tulis' => $peran_tulis_mahasiswa[$index],
                        'jns_penulis' => $reformatJenisPenulisMhs,
                        'a_corr_author' => $mhs_a_corresponding_author[$index],
                        'nm_pd' => $dataMahasiswa[0]->nama_mahasiswa,
                        'nipd' => $dataMahasiswa[0]->nipd,
                        'id_afiliasi' => NULL,
                        'jns_afiliasi' => NULL,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime(),
                    ]);
                }
            }

            if (!empty($penulis_non_ca)) {
                foreach ($penulis_non_ca as $index => $idNonCa) {
                    if (is_null($idNonCa)) break;

                    $reformatJenisPenulisNonCa = 1;

                    $this->tulisPublikasi->create([
                        'id_tulis_pub' => guid(),
                        'id_publikasi' => $publikasi->id_publikasi,
                        'id_sdm' => NULL,
                        'id_katgiat' => $id_katgiat,
                        'id_pd' => NULL,
                        'id_orang' => $idNonCa,
                        'urutan' => $urutan_non_ca[$index],
                        'afiliasi' => $afiliasi_non_ca[$index],
                        'peran_tulis' => $peran_tulis_non_ca[$index],
                        'jns_penulis' => $reformatJenisPenulisNonCa,
                        'a_corr_author' => $non_ca_a_corresponding_author[$index],
                        'nm_pd' => NULL,
                        'nipd' => NULL,
                        'id_afiliasi' => NULL,
                        'jns_afiliasi' => NULL,
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
            return WrapResponse(['id' => $publikasi->id_publikasi], 'sukses');
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse([], 'gagal menambahkan publikasi', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal menambahkan publikasi", FALSE);
        }
    }
}
