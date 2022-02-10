<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\Publikasi;
use App\Models\PDUT\Pdrd\TulisPub;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PublikasiController extends Controller
{
    protected $request;
    protected $publikasi;
    protected $tulisPublikasi;
    protected $mappingIdKatgiat = [];
    protected $mappingJenisPenulis = [];

    const DOSEN = 'dosen';
    const TENDIK = 'tendik';
    const PESERTA_DIDIK = 'pd';

    public function __construct(Request $request)
    {
        $this->request = $request;

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

        $this->mappingIdKatgiat = Cache::rememberForever('mappingIdKatgiat', function() use ($mappingIdKatgiat) {
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
    }

    public function getAllListPublikasi()
    {
        InputValidator([
            'sortby' => [
                'alpha',
                ValidationRule::in(['ASC', 'DESC', 'asc', 'desc'])
            ],
            'page' => 'numeric',
            'count' => 'numeric'
        ]);

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
            JOIN ref.jenis_publikasi AS jpub ON jpub.id_jns_pub = pub.id_jns_pub
            ORDER BY
                pub.create_date DESC
        ";

        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $query = DB::select($query);
        if (empty($query)) {
            return WrapResponse([], 'tidak ditemukan publikasi', FALSE);
        }

        $data = [];
        foreach ($query as $value) {
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

        return WrapResponse([
            'page' => $pagination['page'],
            'count' => $pagination['count'],
            'data' => $data
        ], 'sukses');
    }

    public function getListPublikasiById()
    {
        $id = $this->request->input('id');
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
                sdm.id_sdm = '" . $id . "'
        ";

        $check_id_is_sdm = DB::select($check_id_is_sdm);
        if (empty($check_id_is_sdm)) {
            $check_id_is_pd = "
                SELECT 
                    TOP 1 pd.id_pd 
                FROM 
                    pdrd.peserta_didik AS pd 
                WHERE 
                    pd.id_pd = '" . $id . "'
            ";
            $check_id_is_pd = DB::select($check_id_is_pd);
            if (!empty($check_id_is_pd)) {
                $selectedIdProcess = self::PESERTA_DIDIK;
            } else {
                return WrapResponse([], 'tidak ditemukan publikasi', FALSE);
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
                publikasi.judul AS judul,
                kk.nm_kat AS kategori_kegiatan,
                publikasi.quartile,
                kb.nm_kel_bidang AS bidang_keilmuan,
                jp.nm_jns_pub AS jenis_publikasi,
                publikasi.tgl_terbit AS tanggal_terbit,
                publikasi.create_date AS waktu_data_ditambahkan,
                publikasi.last_update AS terakhir_diubah
            FROM
                pdrd.publikasi AS publikasi
                JOIN pdrd.tulis_pub AS tls_publikasi ON tls_publikasi.id_publikasi = publikasi.id_publikasi
                AND tls_publikasi.soft_delete = 0
        ";

        if (isset($selectedIdProcess) && ($selectedIdProcess == self::DOSEN || $selectedIdProcess == self::TENDIK)) {
            $query .= "AND tls_publikasi.id_sdm = '" . $id . "'";
        } else {
            $query .= "AND tls_publikasi.id_pd = '" . $id . "'";
        }

        $query .= "
            JOIN ref.kategori_kegiatan AS kk ON kk.id_katgiat = tls_publikasi.id_katgiat
                AND kk.id_katgiat IN (" . $this->mappingIdKatgiat . ")
                AND kk.expired_date IS NOT NULL
                JOIN ref.jenis_publikasi AS jp ON jp.id_jns_pub = publikasi.id_jns_pub
                AND jp.expired_date IS NOT NULL
                JOIN ref.media_publikasi AS mp ON mp.id_media_pub = publikasi.id_media_pub
                AND mp.expired_date IS NOT NULL
                JOIN pdrd.map_publikasi_bidang AS mpb ON mpb.id_publikasi = publikasi.id_publikasi
                AND mpb.soft_delete = 0
                JOIN ref.kelompok_bidang AS kb ON kb.id_kel_bidang = mpb.id_kel_bidang
                AND kb.expired_date IS NOT NULL
            WHERE
                tls_publikasi.soft_delete = 0
            ORDER BY publikasi.tgl_terbit $sortby
        ";

        return 

        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $query = DB::select($query);
        if (empty($query)) {
            return WrapResponse([], "tidak ditemukan data publikasi dari id $id", FALSE);
        }

        $data = [];
        foreach ($query as $value) {
            $data[] = [
                'id' => $value->judul,
                'judul' => $value->kategori_kegiatan,
                'quartile' => $value->quartile,
                'bidang_keilmuan' => $value->bidang_keilmuan,
                'jenis_publikasi' => $value->jenis_publikasi,
                'tanggal_terbit' => $value->tanggal_terbit,
                'asal_data' => ($value->asal_data == 0) ? 'SISTER' : 'SINTA',
                'waktu_data_ditambahkan' => $value->waktu_data_ditambahkan,
                'terakhir_diubah' => $value->terakhir_diubah
            ];
        }

        return WrapResponse([
            'page' => $pagination['page'],
            'count' => $pagination['count'],
            'data' => $data
        ], 'sukses');
    }

    public function storeNewPublikasi()
    {
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
