<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\BukuAjar;
use App\Models\PDUT\Pdrd\TulisBukuAjar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule as ValidationRule;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class BukuAjarController extends Controller
{
    protected $request;
    protected $buku_ajar;
    protected $tulis_buku_ajar;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->buku_ajar = new BukuAjar();
        $this->tulis_buku_ajar = new TulisBukuAjar();
    }

    public function daftar()
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sortby = "ASC";
        $sortby = $this->request->input('sortby');

        if (!empty($sortby)) {
            $sortby = $sortby;
        }

        try {
            $query = "SELECT
                buku.id_buku_ajar,
                buku.judul_buku,
                buku.isbn,
                buku.tgl_terbit,
                buku.penerbit,
                buku.create_date,
                buku.last_update
            FROM
                pdrd.buku_ajar AS buku WITH(NOLOCK)
            WHERE
                buku.soft_delete = 0
            ORDER BY
                buku.judul_buku " . $sortby . " ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $bukus = DB::select($query);
            if (empty($bukus)) {
                return WrapResponse(['data' => null], 'tidak ada daftar buku ajar yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($bukus as $value) {
                $data[] = [
                    'id_buku_ajar' => $value->id_buku_ajar,
                    'judul_buku' => $value->judul_buku,
                    'isbn' => $value->isbn,
                    'tanggal_terbit' => $value->tgl_terbit,
                    'penerbit' => $value->penerbit,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar buku ajar', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar buku ajar', TRUE);
    }

    public function daftar_id()
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sortby = "ASC";
        $sortby = $this->request->input('sortby');
        $id_sdm = $this->request->input('id_sdm');

        if (!empty($sortby)) {
            $sortby = $sortby;
        }

        try {
            $query = "SELECT
                tsbuku.id_sdm,
                buku.id_buku_ajar,
                buku.judul_buku,
                buku.isbn,
                buku.tgl_terbit,
                buku.penerbit,
                buku.create_date,
                buku.last_update
            FROM
                pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
            LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
            WHERE tsbuku.soft_delete = 0 AND tsbuku.id_sdm = '" . $id_sdm . "' ORDER BY buku.judul_buku " . $sortby . " ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $bukus = DB::select($query);
            if (empty($bukus)) {
                return WrapResponse(['data' => null], 'tidak ada daftar buku ajar yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($bukus as $value) {
                $data[] = [
                    'id_sdm' => $value->id_sdm,
                    'id_buku_ajar' => $value->id_buku_ajar,
                    'judul_buku' => $value->judul_buku,
                    'isbn' => $value->isbn,
                    'tanggal_terbit' => $value->tgl_terbit,
                    'penerbit' => $value->penerbit,
                    'waktu_data_ditambahkan' => $value->create_date,
                    'terakhir_diubah' => $value->last_update
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'gagal mendapatkan daftar buku ajar', FALSE);
        }
        return WrapResponse(['data' => $data], 'daftar buku ajar', TRUE);
    }

    public function detail()
    {
        InputValidator([
            'id_buku_ajar' => 'required|uuid'
        ]);

        $id_buku_ajar = $this->request->input('id_buku_ajar');

        try {
            $buku_ajar = DB::select("SELECT TOP 1
            buku.id_buku_ajar, buku.judul_buku, buku.isbn, jnbajr.nm_jns_bhn_ajar, buku.penerbit,
            buku.tgl_terbit, buku.sk_tugas, buku.tgl_sk_tugas, lbms.judul_litabmas, kacap.nm_kat_capaian
            FROM pdrd.buku_ajar AS buku WITH(NOLOCK)
            LEFT JOIN ref.jenis_bahan_ajar AS jnbajr WITH(NOLOCK) ON jnbajr.id_jns_bhn_ajar = buku.id_jns_bhn_ajar AND jnbajr.expired_date IS NULL
            LEFT JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = buku.id_litabmas AND lbms.soft_delete = 0
            LEFT JOIN ref.kategori_capaian_luaran AS kacap WITH(NOLOCK) ON kacap.id_kat_capaian = buku.id_kat_capaian AND kacap.expired_date IS NULL
            WHERE buku.soft_delete = 0 AND buku.id_buku_ajar = ?", [$id_buku_ajar]);

            if (empty($buku_ajar)) {
                return WrapResponse(array('data' => array('id_buku_ajar' => $id_buku_ajar)), 'detail buku ajar tidak ditemukan', TRUE);
            }

            $buku_ajar_sdm = DB::select("SELECT
            sdm.id_sdm, sdm.nm_sdm, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tsbuku.id_sdm
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$id_buku_ajar]);

            if (empty($buku_ajar_sdm)) {
                $buku_ajar_sdm = [];
            }

            $buku_ajar_pd = DB::select("SELECT
            pd.id_pd, pd.nm_pd, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tsbuku.id_pd
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$id_buku_ajar]);

            if (empty($buku_ajar_pd)) {
                $buku_ajar_pd = [];
            }

            $buku_ajar_nonca = DB::select("SELECT
            nonca.id_orang, nonca.nm_orang, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.non_ca AS nonca ON nonca.id_orang = tsbuku.id_orang
            WHERE tsbuku.id_buku_ajar = ?
            ORDER BY tsbuku.urutan2 ASC", [$id_buku_ajar]);

            if (empty($buku_ajar_nonca)) {
                $buku_ajar_nonca = [];
            }

            $buku_ajar_dok = DB::select("SELECT
            dok_dokumen.nm_dok AS nama_dok,
            dok_dokumen.file_name AS nama_file,
            dok_dokumen.media_type AS jenis_file,
            dok_bhn_ajar.create_date AS tanggal_upload,
            refj_dokumen.nm_jns_dok AS jenis_dokumen
            FROM pdrd.buku_ajar AS buku
            JOIN dok.dok_bhn_ajar AS dok_bhn_ajar ON dok_bhn_ajar.id_buku_ajar = buku.id_buku_ajar
            AND dok_bhn_ajar.soft_delete = 0
            LEFT JOIN dok.dokumen AS dok_dokumen ON dok_dokumen.id_dok = dok_bhn_ajar.id_dok
            AND dok_dokumen.soft_delete = 0
            LEFT JOIN ref.jenis_dokumen AS refj_dokumen ON refj_dokumen.id_jns_dok = dok_dokumen.id_jns_dok
            AND refj_dokumen.expired_date IS NULL
            WHERE buku.id_buku_ajar = ? AND buku.soft_delete = 0", [$id_buku_ajar]);

            if (empty($buku_ajar_dok)) {
                $buku_ajar_dok = [];
            }

            foreach ($buku_ajar as $each_data) {
                $data[] = [
                    'id_buku_ajar' => $each_data->id_buku_ajar,
                    'judul' => $each_data->judul_buku,
                    'isbn' => $each_data->isbn,
                    'nama_jenis' => $each_data->nm_jns_bhn_ajar,
                    'nama_penerbit' => $each_data->penerbit,
                    'tanggal_terbit' => $each_data->tgl_terbit,
                    'sk_penugasan' => $each_data->sk_tugas,
                    'tanggal_sk_penugasan' => $each_data->tgl_sk_tugas,
                    'judul_litabmas' => $each_data->judul_litabmas,
                    'kategori_capaian_luaran' => $each_data->nm_kat_capaian,
                    'penulis_dosen' =>  $buku_ajar_sdm,
                    'penulis_mahasiswa' =>  $buku_ajar_pd,
                    'penulis_lain' =>  $buku_ajar_nonca,
                    'dokumen' =>  $buku_ajar_dok
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'Tidak Dapat Menampilkan Detail Buku Ajar', FALSE);
        }
        return WrapResponse(['data' => $data], 'Detail Buku Ajar', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'id_litabmas' => 'required|uuid',
            'judul_buku' => 'required',
            'penulis' => 'required',
            'penerbit' => 'required',
            'isbn' => 'required',
            'tgl_terbit' => 'required|date',
            'sk_tugas' => 'required',
            'tgl_sk_tugas' => 'required|date',
            'urutan_dosen.*' => 'nullable|numeric',
            'afiliasi_dosen.*' => 'nullable',
            'peran_tulis_dosen.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_dosen.*' => 'nullable|numeric',
            'urutan_mahasiswa.*' => 'nullable|numeric',
            'afiliasi_mahasiswa.*' => 'nullable',
            'peran_tulis_mahasiswa.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_mahasiswa.*' => 'nullable|numeric',
            'nm_pd_mahasiswa.*' => 'nullable',
            'nipd_mahasiswa.*' => 'nullable',
            'urutan_orang.*' => 'nullable|numeric',
            'afiliasi_orang.*' => 'nullable',
            'peran_tulis_orang.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_orang.*' => 'nullable|numeric'
        ]);

        $id_buku_ajar = guid();
        $id_katgiat = 110801;
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_jns_bhn_ajar = 1;
        $id_kat_capaian = 5;

        $id_litabmas = $this->request->input('id_litabmas');
        $judul_buku = $this->request->input('judul_buku');
        $penulis = $this->request->input('penulis');
        $penerbit = $this->request->input('penerbit');
        $isbn = $this->request->input('isbn');
        $tgl_terbit = $this->request->input('tgl_terbit');
        $sk_tugas = $this->request->input('sk_tugas');
        $tgl_sk_tugas = $this->request->input('tgl_sk_tugas');

        $id_dosen = $this->request->input('id_dosen');
        $urutan_dosen = $this->request->input('urutan_dosen');
        $afiliasi_dosen = $this->request->input('afiliasi_dosen');
        $peran_tulis_dosen = $this->request->input('peran_tulis_dosen');
        $jns_penulis_dosen = $this->request->input('jns_penulis_dosen');

        $id_mahasiswa = $this->request->input('id_mahasiswa');
        $urutan_mahasiswa = $this->request->input('urutan_mahasiswa');
        $afiliasi_mahasiswa = $this->request->input('afiliasi_mahasiswa');
        $peran_tulis_mahasiswa = $this->request->input('peran_tulis_mahasiswa');
        $jns_penulis_mahasiswa = $this->request->input('jns_penulis_mahasiswa');
        $nm_pd_mahasiswa = $this->request->input('nm_pd_mahasiswa');
        $nipd_mahasiswa = $this->request->input('nipd_mahasiswa');

        $id_orang = $this->request->input('id_orang');
        $urutan_orang = $this->request->input('urutan_orang');
        $afiliasi_orang = $this->request->input('afiliasi_orang');
        $peran_tulis_orang = $this->request->input('peran_tulis_orang');
        $jns_penulis_orang = $this->request->input('jns_penulis_orang');

        DB::beginTransaction();
        try {
            $this->buku_ajar->create([
                'id_buku_ajar' => $id_buku_ajar,
                'id_kat_capaian' => $id_kat_capaian,
                'id_jns_bhn_ajar' => $id_jns_bhn_ajar,
                'id_litabmas' => $id_litabmas,
                'judul_buku' => $judul_buku,
                'penulis' => $penulis,
                'penerbit' => $penerbit,
                'isbn' => $isbn,
                'tgl_terbit' => $tgl_terbit,
                'sk_tugas' => $sk_tugas,
                'tgl_sk_tugas' => $tgl_sk_tugas,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
            ]);

            if (!empty($id_dosen)) {
                foreach ($id_dosen as $index => $iddsn) {
                    if (is_null($iddsn)) break;
                    $this->tulis_buku_ajar->create([
                        'id_tulis_buku_ajar' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_buku_ajar' => $id_buku_ajar,
                        'id_sdm' => $iddsn,
                        'id_pd' => NULL,
                        'id_orang' => NULL,
                        'urutan2' => $urutan_dosen[$index],
                        'afiliasi' => $afiliasi_dosen[$index],
                        'peran_tulis' => $peran_tulis_dosen[$index],
                        'jns_penulis' => $jns_penulis_dosen[$index],
                        'nm_pd' => NULL,
                        'nipd' => NULL,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }

            if (!empty($id_mahasiswa)) {
                foreach ($id_mahasiswa as $index => $idmhs) {
                    if (is_null($idmhs)) break;
                    $this->tulis_buku_ajar->create([
                        'id_tulis_buku_ajar' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_buku_ajar' => $id_buku_ajar,
                        'id_sdm' => NULL,
                        'id_pd' => $idmhs,
                        'id_orang' => NULL,
                        'urutan2' => $urutan_mahasiswa[$index],
                        'afiliasi' => $afiliasi_mahasiswa[$index],
                        'peran_tulis' => $peran_tulis_mahasiswa[$index],
                        'jns_penulis' => $jns_penulis_mahasiswa[$index],
                        'nm_pd' => $nm_pd_mahasiswa[$index],
                        'nipd' => $nipd_mahasiswa[$index],
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }

            if (!empty($id_orang)) {
                foreach ($id_orang as $index => $idorg) {
                    if (is_null($idorg)) break;
                    $this->tulis_buku_ajar->create([
                        'id_tulis_buku_ajar' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_buku_ajar' => $id_buku_ajar,
                        'id_sdm' => NULL,
                        'id_pd' => NULL,
                        'id_orang' => $id_orang[$index],
                        'urutan2' => $urutan_orang[$index],
                        'afiliasi' => $afiliasi_orang[$index],
                        'peran_tulis' => $peran_tulis_orang[$index],
                        'jns_penulis' => $jns_penulis_orang[$index],
                        'nm_pd' => NULL,
                        'nipd' => NULL,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }

            DB::commit();
            return WrapResponse(array('data' => array('id_buku_ajar' => $id_buku_ajar)), 'sukses menambahkan buku ajar', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'buku ajar tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan buku ajar', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_buku_ajar' => 'required|uuid',
            'id_litabmas' => 'required|uuid',
            'judul_buku' => 'required',
            'penulis' => 'required',
            'penerbit' => 'required',
            'isbn' => 'required',
            'tgl_terbit' => 'required|date',
            'sk_tugas' => 'required',
            'tgl_sk_tugas' => 'required|date',
            'urutan_dosen.*' => 'nullable|numeric',
            'afiliasi_dosen.*' => 'nullable',
            'peran_tulis_dosen.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_dosen.*' => 'nullable|numeric',
            'urutan_mahasiswa.*' => 'nullable|numeric',
            'afiliasi_mahasiswa.*' => 'nullable',
            'peran_tulis_mahasiswa.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_mahasiswa.*' => 'nullable|numeric',
            'nm_pd_mahasiswa.*' => 'nullable',
            'nipd_mahasiswa.*' => 'nullable',
            'urutan_orang.*' => 'nullable|numeric',
            'afiliasi_orang.*' => 'nullable',
            'peran_tulis_orang.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_orang.*' => 'nullable|numeric'
        ]);

        $id_katgiat = 110801;
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';

        $id_buku_ajar = $this->request->input('id_buku_ajar');
        $id_litabmas = $this->request->input('id_litabmas');
        $judul_buku = $this->request->input('judul_buku');
        $penulis = $this->request->input('penulis');
        $penerbit = $this->request->input('penerbit');
        $isbn = $this->request->input('isbn');
        $tgl_terbit = $this->request->input('tgl_terbit');
        $sk_tugas = $this->request->input('sk_tugas');
        $tgl_sk_tugas = $this->request->input('tgl_sk_tugas');

        $id_dosen = $this->request->input('id_dosen');
        $urutan_dosen = $this->request->input('urutan_dosen');
        $afiliasi_dosen = $this->request->input('afiliasi_dosen');
        $peran_tulis_dosen = $this->request->input('peran_tulis_dosen');
        $jns_penulis_dosen = $this->request->input('jns_penulis_dosen');

        $id_mahasiswa = $this->request->input('id_mahasiswa');
        $urutan_mahasiswa = $this->request->input('urutan_mahasiswa');
        $afiliasi_mahasiswa = $this->request->input('afiliasi_mahasiswa');
        $peran_tulis_mahasiswa = $this->request->input('peran_tulis_mahasiswa');
        $jns_penulis_mahasiswa = $this->request->input('jns_penulis_mahasiswa');
        $nm_pd_mahasiswa = $this->request->input('nm_pd_mahasiswa');
        $nipd_mahasiswa = $this->request->input('nipd_mahasiswa');

        $id_orang = $this->request->input('id_orang');
        $urutan_orang = $this->request->input('urutan_orang');
        $afiliasi_orang = $this->request->input('afiliasi_orang');
        $peran_tulis_orang = $this->request->input('peran_tulis_orang');
        $jns_penulis_orang = $this->request->input('jns_penulis_orang');

        DB::beginTransaction();
        try {
            $buku_ajar = $this->buku_ajar->where('id_buku_ajar', $id_buku_ajar)->first();
            if (!$buku_ajar) return WrapResponse(['data' => null], 'buku ajar tidak ditemukan atau tidak terdaftar', FALSE);

            $buku_ajar->update([
                'id_litabmas' => $id_litabmas,
                'judul_buku' => $judul_buku,
                'penulis' => $penulis,
                'penerbit' => $penerbit,
                'isbn' => $isbn,
                'tgl_terbit' => $tgl_terbit,
                'sk_tugas' => $sk_tugas,
                'tgl_sk_tugas' => $tgl_sk_tugas,
                'last_update' => currDateTime(),
                'id_updater' => $updateId
            ]);

            $penulis_x = $this->tulis_buku_ajar->where('id_buku_ajar', $id_buku_ajar)->delete();
            if ($penulis_x) :

                if (!empty($id_dosen)) {
                    foreach ($id_dosen as $index => $iddsn) {
                        if (is_null($iddsn)) break;
                        $this->tulis_buku_ajar->create([
                            'id_tulis_buku_ajar' => guid(),
                            'id_katgiat' => $id_katgiat,
                            'id_buku_ajar' => $id_buku_ajar,
                            'id_sdm' => $iddsn,
                            'id_pd' => NULL,
                            'id_orang' => NULL,
                            'urutan2' => $urutan_dosen[$index],
                            'afiliasi' => $afiliasi_dosen[$index],
                            'peran_tulis' => $peran_tulis_dosen[$index],
                            'jns_penulis' => $jns_penulis_dosen[$index],
                            'nm_pd' => NULL,
                            'nipd' => NULL,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime()
                        ]);
                    }
                }

                if (!empty($id_mahasiswa)) {
                    foreach ($id_mahasiswa as $index => $idmhs) {
                        if (is_null($idmhs)) break;
                        $this->tulis_buku_ajar->create([
                            'id_tulis_buku_ajar' => guid(),
                            'id_katgiat' => $id_katgiat,
                            'id_buku_ajar' => $id_buku_ajar,
                            'id_sdm' => NULL,
                            'id_pd' => $idmhs,
                            'id_orang' => NULL,
                            'urutan2' => $urutan_mahasiswa[$index],
                            'afiliasi' => $afiliasi_mahasiswa[$index],
                            'peran_tulis' => $peran_tulis_mahasiswa[$index],
                            'jns_penulis' => $jns_penulis_mahasiswa[$index],
                            'nm_pd' => $nm_pd_mahasiswa[$index],
                            'nipd' => $nipd_mahasiswa[$index],
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime()
                        ]);
                    }
                }

                if (!empty($id_orang)) {
                    foreach ($id_orang as $index => $idorg) {
                        if (is_null($idorg)) break;
                        $this->tulis_buku_ajar->create([
                            'id_tulis_buku_ajar' => guid(),
                            'id_katgiat' => $id_katgiat,
                            'id_buku_ajar' => $id_buku_ajar,
                            'id_sdm' => NULL,
                            'id_pd' => NULL,
                            'id_orang' => $id_orang[$index],
                            'urutan2' => $urutan_orang[$index],
                            'afiliasi' => $afiliasi_orang[$index],
                            'peran_tulis' => $peran_tulis_orang[$index],
                            'jns_penulis' => $jns_penulis_orang[$index],
                            'nm_pd' => NULL,
                            'nipd' => NULL,
                            'create_date' => currDateTime(),
                            'id_creator' => $creatorId,
                            'last_update' => currDateTime(),
                            'id_updater' => $updateId,
                            'soft_delete' => 0,
                            'last_sync' => currDateTime()
                        ]);
                    }
                }
            endif;

            DB::commit();
            return WrapResponse(array('data' => array('id_buku_ajar' => $id_buku_ajar)), 'sukses mengubah buku ajar', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'buku ajar tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah buku ajar', FALSE);
        }
    }

    public function hapus()
    {
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_buku_ajar = $this->request->input('id_buku_ajar');

        InputValidator([
            'id_buku_ajar' => 'required|uuid',
        ]);

        DB::beginTransaction();
        try {
            $this->buku_ajar->where('id_buku_ajar', $id_buku_ajar)->update([
                'soft_delete' => 1,
                'last_update' => currDateTime(),
                'id_updater' => $updateId
            ]);
            $this->tulis_buku_ajar->where('id_buku_ajar', $id_buku_ajar)->update([
                'soft_delete' => 1,
                'last_update' => currDateTime(),
                'id_updater' => $updateId
            ]);
            DB::commit();
            return WrapResponse(array('data' => array('id_buku_ajar' => $id_buku_ajar)), 'berhasil menghapus data buku ajar', TRUE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error on ' . $e->getMessage() . ' in line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus data buku ajar', FALSE);
        }
    }
}
