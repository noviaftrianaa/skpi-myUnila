<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;


class BukuReferensiController extends Controller
{

    public function daftar(Request $request)
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'page.numeric'  => 'input page hanya berupa angka',
            'page.min'      => 'input count hanya berupa angka minimal 1',
            'count.numeric' => 'input count hanya berupa angka',
            'count.min'     => 'input count hanya berupa angka minimal 1',
            'count.max'     => 'input count hanya berupa angka tidak boleh lebih dari 50',
            'sortby.alpha'  => 'input sortby penyortiran tidak sesuai',
            'sortby.in'     => 'input sortby penyortiran hanya ASC,asc atau DESC,desc'
        ]);

        $page = 1;
        $count = 10;
        $sortby = "ASC";

        if (!empty($request->sortby)) {
            $sortby = $request->sortby;
        }
        if (!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count;
            }
        }

        $buku_referensi = DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT
            tspub.id_tulis_pub,
            tspub.create_date,
            tspub.last_update,
            pub.id_publikasi,
            pub.judul,
            pub.isbn,
            pub.tgl_terbit,
            pub.penerbit
        FROM pdrd.tulis_pub AS tspub WITH(NOLOCK)
        LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
        WHERE tspub.soft_delete = 0
        ORDER BY tspub.create_date " . $sortby . "
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ",  [$page, $count]);

        $data = [];
        foreach ($buku_referensi as $each_data) {
            $data[] = [
                'id_tulis_pub' => $each_data->id_tulis_pub,
                'id_publikasi' => $each_data->id_publikasi,
                'judul' => $each_data->judul,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update
            ];
        }

        return WrapResponse(['page' => $page, 'count' => $count, 'data' => $data], 'Daftar Buku Referensi', TRUE);
    }


    public function daftar_id(Request $request)
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ], [
            'page.numeric'  => 'input page hanya berupa angka',
            'page.min'      => 'input count hanya berupa angka minimal 1',
            'count.numeric' => 'input count hanya berupa angka',
            'count.min'     => 'input count hanya berupa angka minimal 1',
            'count.max'     => 'input count hanya berupa angka tidak boleh lebih dari 50',
            'sortby.alpha'  => 'input sortby penyortiran tidak sesuai',
            'sortby.in'     => 'input sortby penyortiran hanya ASC,asc atau DESC,desc',
            'id_sdm.required'  => 'input id_sdm harus diisi',
            'id_sdm.uuid'  => 'input id_sdm harus berupa UUID yang valid'
        ]);

        $page = 1;
        $count = 10;
        $sortby = "ASC";

        if (!empty($request->sortby)) {
            $sortby = $request->sortby;
        }
        if (!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->count)) {
            if ($request->count > 50) {
                $count = 50;
            } else {
                $count = $request->count;
            }
        }

        $buku_referensi = DB::select("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT
        tspub.id_tulis_pub,
        tspub.create_date,
        tspub.last_update,
        pub.id_publikasi,
        pub.judul,
        pub.isbn,
        pub.tgl_terbit,
        pub.penerbit
        FROM pdrd.tulis_pub AS tspub WITH(NOLOCK)
        LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
        WHERE tspub.soft_delete = 0 AND tspub.id_sdm = ?
        ORDER BY tspub.create_date " . $sortby . "
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY", [$page, $count, $request->id_sdm]);

        $data = [];
        foreach ($buku_referensi as $each_data) {
            $data[] = [
                'id_tulis_pub' => $each_data->id_tulis_pub,
                'id_publikasi' => $each_data->id_publikasi,
                'judul' => $each_data->judul,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'waktu_data_ditambahkan' => $each_data->create_date,
                'terakhir_diubah' => $each_data->last_update
            ];
        }

        return WrapResponse(['page' => $page, 'count' => $count, 'data' => $data], 'Daftar Buku Referensi berdasarkan id_sdm', TRUE);
    }


    public function detail(Request $request)
    {
        InputValidator([
            'id_publikasi' => 'required|uuid'
        ], [
            'id_publikasi.required'  => 'input id_publikasi harus diisi',
            'id_publikasi.uuid'  => 'input id_publikasi harus berupa UUID yang valid'
        ]);

        try {
            $buku_referensi = DB::select("SELECT TOP 1
            pub.id_publikasi, pub.judul, pub.isbn, jepub.nm_jns_pub,pub.penerbit,
           pub.tgl_terbit, lbms.judul_litabmas, kacaplu.nm_kat_capaian
            FROM pdrd.publikasi AS pub WITH(NOLOCK)
            LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
            LEFT JOIN ref.jenis_publikasi AS jepub WITH(NOLOCK) ON jepub.id_jns_pub = pub.id_jns_pub AND jepub.expired_date IS NULL
            LEFT JOIN ref.kategori_capaian_luaran AS kacaplu WITH(NOLOCK) ON kacaplu.id_kat_capaian = pub.id_kat_capaian AND kacaplu.expired_date IS NULL
            LEFT JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = pub.id_litabmas AND lbms.soft_delete = 0
            WHERE pub.soft_delete = 0 AND pub.id_publikasi = ? ", [$request->id_publikasi]);

            $buku_referensi_sdm = DB::select("SELECT
            sdm.id_sdm,
            sdm.nm_sdm,
            tspub.urutan2,
            tspub.afiliasi,
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tspub.id_sdm
            WHERE tspub.id_publikasi = ?
            ORDER BY tspub.urutan2 ASC", [$request->id_publikasi]);

            $buku_referensi_pd = DB::select("SELECT
            pd.id_pd,
            pd.nm_pd,
            tspub.urutan2,
            tspub.afiliasi,
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tspub.id_pd
            WHERE tspub.id_publikasi = ?
            ORDER BY tspub.urutan2 ASC", [$request->id_publikasi]);

            $buku_referensi_nonca = DB::select("SELECT
            nonca.id_orang,
            nonca.nm_orang,
            tspub.urutan2,
            tspub.afiliasi,
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.non_ca AS nonca ON nonca.id_orang = tspub.id_orang
            WHERE tspub.id_publikasi = ?
            ORDER BY tspub.urutan2 ASC", [$request->id_publikasi]);

            $data = [];
            foreach ($buku_referensi as $each_data) {
                $data[] = [
                    'id_publikasi' => $each_data->id_publikasi,
                    'jenis_publikasi' => $each_data->nm_jns_pub,
                    'kategori_capaian' => $each_data->nm_kat_capaian,
                    'aktivitas_litabmas' => $each_data->judul_litabmas,
                    'judul' => $each_data->judul,
                    'tanggal_terbit' => $each_data->tgl_terbit,
                    'penerbit' => $each_data->penerbit,
                    'isbn' => $each_data->isbn,
                    'penulis_dosen' =>  $buku_referensi_sdm,
                    'penulis_mahasiswa' =>  $buku_referensi_pd,
                    'penulis_lain' =>  $buku_referensi_nonca
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'Tidak Dapat Menampilkan Detail Buku Referensi', FALSE);
        }
        return WrapResponse(['data' => $data], 'Detail Buku Referensi', TRUE);
    }


    public function tambah(Request $request)
    {
        $id_publikasi = guid();
        $id_katgiat = 120102;
        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_jns_pub = 1;
        $id_kat_capaian = 5;

        DB::beginTransaction();
        try {
            $buku = DB::insert(
                "INSERT INTO pdrd.publikasi (id_publikasi, id_kat_capaian,
                id_jns_pub, id_litabmas, judul, penerbit, isbn, tgl_terbit, create_date, id_creator, last_update,
                id_updater, soft_delete, last_sync)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    $id_publikasi, $id_kat_capaian, $id_jns_pub,
                    $request->id_litabmas, $request->judul, $request->penerbit,
                    $request->isbn, $request->tgl_terbit, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                ]
            );

            if (!empty($request->id_dosen)) {
                foreach ($request->id_dosen as $index => $id_dosen) {
                    if (is_null($id_dosen)) break;
                    $dosen = DB::insert(
                        "INSERT INTO pdrd.tulis_pub (id_tulis_pub, id_katgiat,
                id_publikasi, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis,
                jns_penulis, nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            guid(), $id_katgiat, $id_publikasi, $request->id_dosen[$index], NULL,
                            NULL, $request->urutan_dosen[$index], $request->afiliasi_dosen[$index], $request->peran_tulis_dosen[$index],
                            $request->jns_penulis_dosen[$index], NULL,  NULL, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                        ]
                    );
                }
            }

            if (!empty($request->id_mahasiswa)) {
                foreach ($request->id_mahasiswa as $index => $id_mahasiswa) {
                    if (is_null($id_mahasiswa)) break;
                    $mahasiswa = DB::insert(
                        "INSERT INTO pdrd.tulis_pub (id_tulis_pub, id_katgiat,
                    id_publikasi, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis,
                    jns_penulis, nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            guid(), $id_katgiat, $id_publikasi, $request->id_mahasiswa[$index], NULL,
                            NULL, $request->urutan_mahasiswa[$index], $request->afiliasi_mahasiswa[$index], $request->peran_tulis_mahasiswa[$index],
                            $request->jns_penulis_mahasiswa[$index], NULL,  NULL, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                        ]
                    );
                }
            }

            if (!empty($request->id_orang)) {
                foreach ($request->id_orang as $index => $id_orang) {
                    if (is_null($id_orang)) break;
                    $orang = DB::insert(
                        "INSERT INTO pdrd.tulis_pub (id_tulis_pub, id_katgiat,
                    id_publikasi, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis,
                    jns_penulis, nm_pd, nipd, create_date, id_creator, last_update, id_updater, soft_delete, last_sync)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                            guid(), $id_katgiat, $id_publikasi, $request->id_orang[$index], NULL,
                            NULL, $request->urutan_orang[$index], $request->afiliasi_orang[$index], $request->peran_tulis_orang[$index],
                            $request->jns_penulis_orang[$index], NULL,  NULL, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                        ]
                    );
                }
            }

            DB::commit();
            return WrapResponse(array('data' => array('id_publikasi' => $id_publikasi)), 'Buku Referensi Berhasil Ditambahkan', TRUE);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'Buku Referensi Gagal Ditambahkan', FALSE);
        }
    }




    public function ubah(Request $request)
    {
        $id_updater = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_katgiat = 120102;
        $id_jns_pub = 1;
        $id_kat_capaian = 5;

        DB::beginTransaction();
        try {
            $buku = DB::update("UPDATE pdrd.publikasi SET id_kat_capaian = ?,
             id_jns_pub = ?, id_litabmas = ?, judul = ?, penerbit = ?, isbn = ?,
             tgl_terbit = ?, last_update = ?, id_updater = ? WHERE id_publikasi = ?", [
                $id_kat_capaian, $id_jns_pub, $request->id_litabmas, $request->judul,
                $request->penerbit, $request->isbn, $request->tgl_terbit,
                currDateTime(), $id_updater, $request->id_publikasi
            ]);
            if (!empty($request->id_dosen)) {
                foreach ($request->id_dosen as $index => $id_dosen) {
                    if (is_null($id_dosen)) break;
                    $dosen = DB::insert(
                        "UPDATE pdrd.tulis_pub SET  id_katgiat = ?,
                    id_sdm = ?, id_pd = NULL, id_orang = NULL, urutan2 = ?, afiliasi = ?, peran_tulis = ?,
                    jns_penulis = ?, nm_pd = NULL, nipd = NULL, last_update = ?, id_updater= ?, soft_delete = 0
                    WHERE id_publikasi = ? AND id_sdm =  ?",
                        [
                            $id_katgiat, $request->id_dosen[$index], $request->urutan_dosen[$index], $request->afiliasi_dosen[$index],
                            $request->peran_tulis_dosen[$index], $request->jns_penulis_dosen[$index], currDateTime(), $id_updater,
                            $request->id_publikasi, $request->id_dosen[$index]
                        ]
                    );
                }
            }
            if (!empty($request->id_mahasiswa)) {
                foreach ($request->id_mahasiswa as $index => $id_mahasiswa) {
                    if (is_null($id_mahasiswa)) break;
                    $mahasiswa = DB::insert(
                        "UPDATE pdrd.tulis_pub SET  id_katgiat = ?,
                    id_sdm = ?, id_pd = NULL, id_orang = NULL, urutan2 = ?, afiliasi = ?, peran_tulis = ?,
                    jns_penulis = ?, nm_pd = NULL, nipd = NULL, last_update = ?, id_updater= ?, soft_delete = 0
                    WHERE id_publikasi = ? AND id_sdm =  ?",
                        [
                            $id_katgiat, $request->id_mahasiswa[$index], $request->urutan_mahasiswa[$index], $request->afiliasi_mahasiswa[$index],
                            $request->peran_tulis_mahasiswa[$index], $request->jns_penulis_mahasiswa[$index], currDateTime(), $id_updater,
                            $request->id_publikasi, $request->id_mahasiswa[$index]
                        ]
                    );
                }
            }
            if (!empty($request->id_orang)) {
                foreach ($request->id_orang as $index => $id_orang) {
                    if (is_null($id_orang)) break;
                    $orang = DB::insert(
                        "UPDATE pdrd.tulis_pub SET  id_katgiat = ?,
                        id_sdm = ?, id_pd = NULL, id_orang = NULL, urutan2 = ?, afiliasi = ?, peran_tulis = ?,
                        jns_penulis = ?, nm_pd = NULL, nipd = NULL, last_update = ?, id_updater= ?, soft_delete = 0
                        WHERE id_publikasi = ? AND id_sdm =  ?",
                        [
                            $id_katgiat, $request->id_orang[$index], $request->urutan_orang[$index], $request->afiliasi_orang[$index],
                            $request->peran_tulis_orang[$index], $request->jns_penulis_orang[$index], currDateTime(), $id_updater,
                            $request->id_publikasi, $request->id_orang[$index]
                        ]
                    );
                }
            }
            DB::commit();
            return WrapResponse(array('data' => array('id_publikasi' => $request->id_publikasi)), 'Buku Referensi Berhasil Diubah', TRUE);
        } catch (\Exception $e) {
            DB::rollback();
            return WrapResponse(['data' => null], 'Buku Referensi Gagal Diubah', FALSE);
        }
    }


    public function hapus(Request $request)
    {
        InputValidator([
            'id_publikasi' => 'required|uuid'
        ], [
            'id_publikasi.required'  => 'input id_publikasi harus diisi',
            'id_publikasi.uuid'  => 'input id_publikasi harus berupa UUID yang valid'
        ]);

        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.publikasi SET soft_delete = 1 WHERE id_publikasi = ?", [$request->id_publikasi]);
            DB::update("UPDATE pdrd.tulis_pub SET soft_delete = 1 WHERE id_publikasi = ?", [$request->id_publikasi]);

            DB::commit();
            return WrapResponse(array('data' => array('id_publikasi' => $request->id_publikasi)), 'Buku Referensi Berhasil Dihapus', FALSE);
        } catch (\Exception $e) {
            DB::rollback();
            return WrapResponse(['data' => null], 'Buku Referensi Gagal Dihapus', FALSE);
        }
    }
}
