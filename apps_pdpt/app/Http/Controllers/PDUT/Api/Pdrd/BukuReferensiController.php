<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;



class BukuReferensiController extends Controller
{
    /**
     * @OA\Get(
     *      path="/buku_referensi/list",
     *      tags={"Buku Referensi"},
     *      summary="Mendapatkan Daftar Buku Referensi",
     *      description="Menampilkan Daftar Buku Referensi",
     *      operationId="getBukuReferensi",
     *      @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     * )
     */
    public function list(Request $request)
    {
        $page = 1;
        $count = 10;
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

        $buku_referensi= DB::SELECT("
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
        ORDER BY tspub.create_date DESC
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

    /**
     * @OA\Get(
     *      path="/buku_referensi/list_id",
     *      tags={"Buku Referensi"},
     *      summary="Mendapatkan Daftar Buku Referensi Berdasarkan ID",
     *      description="Menampilkan Daftar Buku Referensi Berdasarkan ID",
     *      operationId="getBukuReferensiById",
     *     @OA\Parameter(
     *          name="page",
     *          description="",
     *          example="1",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="count",
     *          description="",
     *          example="25",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="number"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="sortby",
     *          description="",
     *          example="DESC",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
     *     @OA\Parameter(
     *          name="id_sdm",
     *          description="",
     *          example="1816B0CE-8C9F-4DF9-91AA-002A69F6BED0",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     * )
     */
    public function listById(Request $request)
    {
        $page = 1;
        $count = 10;
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

        $id = $request->id_sdm;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "id_sdm kosong"
            ]);
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
        ORDER BY tspub.create_date DESC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY", [$page, $count, $id]);
        
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

    /**
     * @OA\Get(
     *      path="/buku_referensi/detail",
     *      tags={"Buku Referensi"},
     *      summary="Dapatkan Detail Buku Referensi",
     *      description="Menampilkan Detail Buku Referensi",
     *      operationId="getDetailBukuReferensi",
     *    @OA\Parameter(
     *          name="id_tulis_pub",
     *          description="",
     *          example="50414BE3-25D9-492C-B7A0-0017A74245BB",
     *          required=false,
     *          in="query",
     *          @OA\Schema(
     *              type="string"
     *          )
     *     ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     * )
     */
    public function detail(Request $request)
    {
        $id = $request->id_tulis_pub;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "id_tulis_pub kosong"
            ]);
        }

        $buku_referensi = DB::select("SELECT 
            tspub.id_tulis_pub, 
            tspub.id_publikasi, 
            jepub.nm_jns_pub,  
            kacaplu.nm_kat_capaian, 
            lbms.judul_litabmas,
            pub.judul, 
            pub.tgl_terbit, 
            pub.penerbit, 
            pub.isbn
            FROM pdrd.tulis_pub AS tspub WITH(NOLOCK)
            LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
            LEFT JOIN ref.jenis_publikasi AS jepub WITH(NOLOCK) ON jepub.id_jns_pub = pub.id_jns_pub AND jepub.expired_date IS NULL
            LEFT JOIN ref.kategori_capaian_luaran AS kacaplu WITH(NOLOCK) ON kacaplu.id_kat_capaian = pub.id_kat_capaian AND kacaplu.expired_date IS NULL
            LEFT JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = pub.id_litabmas AND lbms.soft_delete = 0
            WHERE tspub.soft_delete = 0 AND tspub.id_tulis_pub = ? ", [$id]);
        
        $buku_referensi_sdm = DB::select("SELECT 
            sdm.id_sdm, 
            sdm.nm_sdm, 
            tspub.urutan2, 
            tspub.afiliasi, 
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tspub.id_sdm
            WHERE tspub.id_publikasi = ? 
            ORDER BY tspub.urutan2 ASC", [$buku_referensi[0]->id_publikas]);

        $buku_referensi_pd= DB::select("SELECT 
            pd.id_pd, 
            pd.nm_pd, 
            tspub.urutan2, 
            tspub.afiliasi, 
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tspub.id_pd
            WHERE tspub.id_publikasi = ? 
            ORDER BY tspub.urutan2 ASC", [$buku_referensi[0]->id_publikasi]);
        
        $buku_referensi_nonca= DB::select("SELECT 
            nonca.id_orang, 
            nonca.nm_orang, 
            tspub.urutan2, 
            tspub.afiliasi, 
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.non_ca AS nonca ON nonca.id_orang = tspub.id_orang
            WHERE tspub.id_publikasi = ? 
            ORDER BY tspub.urutan2 ASC", [$buku_referensi[0]->id_publikasi]);

            $data = [];
        foreach ($buku_referensi as $each_data) {
            $data[] = [
                'id_tulis_pub' => $each_data->id_tulis_pub,
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

        return WrapResponse(['data' => $data], 'Detail Buku Referensi By id_publikasi', TRUE);
    }

     /**
     * @OA\Post(
     *      path="/buku_referensi/add",
     *      operationId="addBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Tambah Buku Referensi",
     *      description="Menambah Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menambah Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_litabmas", "judul", "penerbit", "tgl_terbit"},
     *          @OA\Property(property="id_litabmas", type="string", format="text", example="bb96579f-e5d4-40d2-81b3-f4886aa32a10"),
     *          @OA\Property(property="judul", type="string", format="text", example="Judul Buku Referensi"),
     *          @OA\Property(property="penerbit", type="string", format="text", example="Penerbit"),
     *          @OA\Property(property="isbn", type="string", format="text", example="1"),
     *          @OA\Property(property="tgl_terbit", type="date", format="date", example="2022-01-25"),
     *
     *                 @OA\Property(
     *                     property="id_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="9c466255-68e3-4476-97a4-a42ced793203"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *
     *                 @OA\Property(
     *                     property="id_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="faae58b0-d2b2-4b88-9966-0000458f9fce"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="nm_pd_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Nama Mahasiswa"),
     *                 ),
     *                 @OA\Property(
     *                     property="nipd_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     nullable="true",
     *                     @OA\Items(type="string", format="string", example="null"),
     *                 ),
     *
     *                 @OA\Property(
     *                     property="id_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="9878daeb-7c52-41be-afa0-28bd6f6c6ddg"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function add(Request $request)
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
                        guid(), $id_katgiat, $id_publikasi, $request->id_dosen[$index], NULL,
                        NULL, $request->urutan_dosen[$index], $request->afiliasi_dosen[$index], $request->peran_tulis_dosen[$index],
                        $request->jns_penulis_dosen[$index], NULL,  NULL, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
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
                        guid(), $id_katgiat, $id_publikasi, $request->id_dosen[$index], NULL,
                        NULL, $request->urutan_dosen[$index], $request->afiliasi_dosen[$index], $request->peran_tulis_dosen[$index],
                        $request->jns_penulis_dosen[$index], NULL,  NULL, currDateTime(), $creatorId, currDateTime(), $updateId, 0, currDateTime()
                    ]
                );
            }
        }

        DB::commit();
        return WrapResponse(['id_publikasi' => $id_publikasi], 'Buku Referensi Berhasil Ditambahkan', TRUE);
    } catch (\Exception $e) {
        DB::rollback();
        return WrapResponse(['id_publikasi' => $id_publikasi], 'Buku Referensi Gagal Ditambahkan', FALSE);
    }
}

    
 /**
     * @OA\Put (
     *      path="/buku_referensi/update",
     *      operationId="updateBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Ubah Buku Referensi",
     *      description="Mengubah Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Mengubah Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_publikasi", "id_litabmas", "judul", "penerbit", "tgl_terbit"},
     *          @OA\Property(property="id_publikasi", type="string", format="text", example="1"),
     *          @OA\Property(property="id_litabmas", type="string", format="text", example="1"),
     *          @OA\Property(property="judul", type="string", format="text", example="Judul Buku"),
     *          @OA\Property(property="penerbit", type="string", format="text", example="Penerbit"),
     *          @OA\Property(property="isbn", type="string", format="text", example="1"),
     *          @OA\Property(property="tgl_terbit", type="date", format="date", example="2022-01-25"),
     * 
     *                  @OA\Property(
     *                     property="id_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="9c466255-68e3-4476-97a4-a42ced793202"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_dosen",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *
     *                 @OA\Property(
     *                     property="id_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="faae58b0-d2b2-4b88-9966-0000458f9fcd"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="nm_pd_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Nama Mahasiswa"),
     *                 ),
     *                 @OA\Property(
     *                     property="nipd_mahasiswa",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     nullable="true",
     *                     @OA\Items(type="string", format="string", example="null"),
     *                 ),
     *
     *                 @OA\Property(
     *                     property="id_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="9878daeb-7c52-41be-afa0-28bd6f6c6ddf"),
     *                 ),
     *                  @OA\Property(
     *                     property="urutan_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *                 @OA\Property(
     *                     property="afiliasi_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="Universitas Lampung"),
     *                 ),
     *                 @OA\Property(
     *                     property="peran_tulis_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="A"),
     *                 ),
     *                 @OA\Property(
     *                     property="jns_penulis_orang",
     *                     type="array",
     *                     collectionFormat="multi",
     *                     @OA\Items(type="string", format="string", example="1"),
     *                 ),
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
  
    public function update(Request $request)
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
                            $id_katgiat, $request->id_dosen[$index], $request->urutan_dosen[$index], $request->afiliasi_dosen[$index],
                            $request->peran_tulis_dosen[$index], $request->jns_penulis_dosen[$index], currDateTime(), $id_updater,
                            $request->id_publikasi, $request->id_dosen[$index]
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
                                $id_katgiat, $request->id_dosen[$index], $request->urutan_dosen[$index], $request->afiliasi_dosen[$index],
                                $request->peran_tulis_dosen[$index], $request->jns_penulis_dosen[$index], currDateTime(), $id_updater,
                                $request->id_publikasi, $request->id_dosen[$index]
                            ]
                    );
                }
            }
            DB::commit();
            return WrapResponse(['id_publikasi' => $request->id_publikasi], 'Buku Referensi Berhasil Diubah', TRUE);
        } catch (\Exception $e) {
            DB::rollback();
            return WrapResponse(['id_publikasi' => $request->id_publikasi], 'Buku Referensi Gagal Diubah', FALSE);
        }
    }

    /**
     * @OA\Delete (
     *      path="/buku_referensi/delete",
     *      operationId="deleteBukuReferensi",
     *      tags={"Buku Referensi"},
     *      summary="Hapus Buku Referensi",
     *      description="Menghapus Buku Referensi",
     *      @OA\RequestBody(
     *      required=true,
     *      description="Menghapus Buku Referensi",
     *      @OA\JsonContent(
     *          required={"id_publikasi"},
     *          @OA\Property(property="id_publikasi", type="string", format="text", example="1")
     *          ),
     *      ),
     *      @OA\Response(
     *          response=200,
     *          description="Successful operation",
     *       ),
     *      @OA\Response(
     *          response=401,
     *          description="Unauthenticated",
     *      ),
     *      @OA\Response(
     *          response=403,
     *          description="Forbidden"
     *      ),
     *      security={{"bearer_token":{}}}
     *     )
     */
    public function delete(Request $request)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.publikasi SET soft_delete = 1 WHERE id_publikasi = ?", [$request->id_publikasi]);
            DB::update("UPDATE pdrd.tulis_pub SET soft_delete = 1 WHERE id_publikasi = ?", [$request->id_publikasi]);
           
            DB::commit();
            return WrapResponse(['id_publikasi' => $request->id_publikasi], 'Buku Ajar Berhasil Dihapus', FALSE);
        } catch (\Exception $e) {
            DB::rollback();
            return WrapResponse(['id_publikasi' => $request->id_publikasi], 'Buku Ajar Gagal Dihapus', FALSE);
        }
    }
}