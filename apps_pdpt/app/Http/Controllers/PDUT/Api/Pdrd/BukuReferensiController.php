<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;


class BukuReferensiController extends Controller
{
    public function list(Request $request)
    {
        $page = 1; $count = 10;
        if(!empty($request->page)) {
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
            pub.id_publikasi, 
            pub.judul, 
            pub.isbn, 
            pub.tgl_terbit, 
            pub.penerbit,
			katgiat.nm_kat
        FROM pdrd.tulis_pub AS tspub WITH(NOLOCK)
        LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
        LEFT JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON katgiat.id_katgiat = tspub.id_katgiat AND pub.soft_delete = 0
        WHERE tspub.soft_delete = 0
        ORDER BY tspub.id_tulis_pub ASC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        $data = [];
        foreach ($buku_referensi as $each_data) {
            $data[] = [
                'id_tulis_pub' => $each_data->id_tulis_pub,
                'id_publikasi' => $each_data->id_publikasi,
                'judul' => $each_data->judul,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'kategori_kegiatan' => $each_data->nm_kat,
                'rubrik_bkd' => null
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Get all data',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }

    public function listById(Request $request)
    {
        $id = $request->id_sdm;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Empty Field id_sdm"
            ]);
        }

        $buku_referensi = DB::select("SELECT tspub.id_tulis_pub, pub.id_publikasi, pub.judul, pub.isbn, pub.tgl_terbit, pub.penerbit, katgiat.nm_kat
        FROM pdrd.tulis_pub AS tspub WITH(NOLOCK)
        LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
        LEFT JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON katgiat.id_katgiat = tspub.id_katgiat AND pub.soft_delete = 0
        WHERE tspub.soft_delete = 0 ",[$id]);
        
        foreach ($buku_referensi as $each_data) {
            $data[] = [
                'id_tulis_pub' => $each_data->id_tulis_pub,
                'id_publikasi' => $each_data->id_publikasi,
                'judul' => $each_data->judul,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'kategori_kegiatan' => $each_data->nm_kat,
                'rubrik_bkd' => null
            ];
        }
        
        return response()->json([
            'success' => true,
            'message' => 'get list id successfully',
            'data'  => $data
        ], 200);
    }

    public function detail(Request $request)
    {
        $id = $request->id_tulis_pub;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Empty Field id_tulis_buku_referensi"
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

        return response()->json([
            'success' => true,
            'message' => 'get detail successfully',
            'data'  => $data
        ], 200);
    }

   
    public function add(Request $request)
    {
        $id_publikasi = guid();
        $id_tulis_pub = guid();
        $id_katgiat = 120102;

        DB::beginTransaction();
        try {
            DB::insert("INSERT INTO pdrd.publikasi (id_publikasi, id_kat_capaian, 
            id_jns_pub, id_litabmas, judul, penerbit, isbn, tgl_terbit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [$id_publikasi, $request->id_kat_capaian, $request->id_jns_pub, 
            $request->id_litabmas, $request->judul, $request->penerbit, 
            $request->isbn, $request->tgl_terbit]);

            DB::insert("INSERT INTO pdrd.tulis_pub (id_tulis_pub, id_katgiat, 
            id_publikasi, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis, 
            jns_penulis, nm_pd, nipd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [$id_tulis_pub, $id_katgiat, $id_publikasi, $request->id_sdm, $request->id_pd, 
            $request->id_orang, $request->urutan2, $request->afiliasi, $request->peran_tulis, 
            $request->jns_penulis, $request->nm_pd, $request->nipd]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'add data successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'failed add data'
            ], 400);
        }
    }


    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.publikasi SET id_kat_capaian = ?, 
            SET id_jns_pub = ?, SET id_litabmas = ?, SET judul = ?, 
            SET penerbit = ?, SET isbn = ?, SET tgl_terbit = ?,
           WHERE id_publikasi = ?", [$request->id_kat_capaian, 
            $request->id_jns_pub, $request->id_litabmas, $request->judul, 
            $request->penerbit, $request->isbn, $request->tgl_terbit, 
            $request->id_publikasi]);
    
            DB::update("UPDATE pdrd.tulis_pub SET id_publikasi = ?, SET id_sdm = ?, 
            SET id_pd = ?, SET id_orang = ?, SET urutan2 = ?, SET afiliasi = ?, SET peran_tulis = ?,
            SET jns_penulis = ?, SET nm_pd = ?, SET nipd = ? WHERE id_tulis_pub = ?",[$request->id_publikasi, 
            $request->id_sdm, $request->id_pd, $request->id_orang, $request->urutan2, $request->afiliasi, 
            $request->peran_tulis, $request->jns_penulis, $request->nm_pd, $request->nipd, $request->id_tulis_pub]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'updated data successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'failed updated data'
            ], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function delete(Request $request)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.publikasi SET soft_delete = 1 WHERE id_publikasi = ?", [$request->id_publikasi]);
            DB::update("UPDATE pdrd.tulis_pub SET soft_delete = 1 WHERE id_publikasi = ?", [$request->id_publikasi]);
           
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'deleted data successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'failed deleted data'
            ], 400);
        }
    }
}
