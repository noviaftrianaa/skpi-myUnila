<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BukuAjarController extends Controller
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

        $buku_ajar = DB::select("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT tsbuku.id_tulis_buku_ajar, buku.id_buku_ajar, buku.judul_buku, buku.isbn, buku.tgl_terbit, buku.penerbit
        FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
        LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
        WHERE tsbuku.soft_delete = 0
        ORDER BY tsbuku.id_tulis_buku_ajar ASC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);
        
        foreach ($buku_ajar as $each_data) {
            $data[] = [
                'id_tulis_buku_ajar' => $each_data->id_tulis_buku_ajar,
                'id_buku_ajar' => $each_data->id_buku_ajar,
                'judul_buku' => $each_data->judul_buku,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'rubrik_bkd' => null
            ];
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Get all data Buku Ajar',
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

        $buku_ajar = DB::select("SELECT tsbuku.id_tulis_buku_ajar, buku.id_buku_ajar, buku.judul_buku, buku.isbn, buku.tgl_terbit, buku.penerbit
        FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
        LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
        WHERE tsbuku.soft_delete = 0 AND tsbuku.id_sdm = ? ", [$id]);
        
        foreach ($buku_ajar as $each_data) {
            $data[] = [
                'id_tulis_buku_ajar' => $each_data->id_tulis_buku_ajar,
                'id_buku_ajar' => $each_data->id_buku_ajar,
                'judul_buku' => $each_data->judul_buku,
                'isbn' => $each_data->isbn,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
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
        $id = $request->id_tulis_buku_ajar;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "Empty Field id_tulis_buku_ajar"
            ]);
        }

        $buku_ajar = DB::select("SELECT 
            tsbuku.id_tulis_buku_ajar, tsbuku.id_buku_ajar, jebaj.nm_jns_bhn_ajar,  kacaplu.nm_kat_capaian, lbms.judul_litabmas,
            buku.judul_buku, buku.tgl_terbit, buku.penerbit, buku.isbn, buku.sk_tugas, buku.tgl_sk_tugas 
            FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
            LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
            LEFT JOIN ref.jenis_bahan_ajar AS jebaj WITH(NOLOCK) ON jebaj.id_jns_bhn_ajar = buku.id_jns_bhn_ajar AND jebaj.expired_date IS NULL
            LEFT JOIN ref.kategori_capaian_luaran AS kacaplu WITH(NOLOCK) ON kacaplu.id_kat_capaian = buku.id_kat_capaian AND kacaplu.expired_date IS NULL
            LEFT JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = buku.id_litabmas AND lbms.soft_delete = 0
            WHERE tsbuku.soft_delete = 0 AND tsbuku.id_tulis_buku_ajar = ? ", [$id]);
        
        $buku_ajar_sdm = DB::select("SELECT 
            sdm.id_sdm, sdm.nm_sdm, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tsbuku.id_sdm
            WHERE tsbuku.id_buku_ajar = ? 
            ORDER BY tsbuku.urutan2 ASC", [$buku_ajar[0]->id_buku_ajar]);

        $buku_ajar_pd= DB::select("SELECT 
            pd.id_pd, pd.nm_pd, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tsbuku.id_pd
            WHERE tsbuku.id_buku_ajar = ? 
            ORDER BY tsbuku.urutan2 ASC", [$buku_ajar[0]->id_buku_ajar]);
        
        $buku_ajar_nonca= DB::select("SELECT 
            nonca.id_orang, nonca.nm_orang, tsbuku.urutan2, tsbuku.afiliasi, tsbuku.peran_tulis
            FROM pdrd.tulis_buku_ajar AS tsbuku
            JOIN pdrd.non_ca AS nonca ON nonca.id_orang = tsbuku.id_orang
            WHERE tsbuku.id_buku_ajar = ? 
            ORDER BY tsbuku.urutan2 ASC", [$buku_ajar[0]->id_buku_ajar]);

        foreach ($buku_ajar as $each_data) {
            $data[] = [
                'id_tulis_buku_ajar' => $each_data->id_tulis_buku_ajar,
                'id_buku_ajar' => $each_data->id_buku_ajar,
                'jenis_bahan_ajar' => $each_data->nm_jns_bhn_ajar,
                'kategori_capaian' => $each_data->nm_kat_capaian,
                'aktivitas_litabmas' => $each_data->judul_litabmas,
                'judul_bahan_ajar' => $each_data->judul_buku,
                'tanggal_terbit' => $each_data->tgl_terbit,
                'penerbit' => $each_data->penerbit,
                'isbn' => $each_data->isbn,
                'sk_penugasan_bukti' => $each_data->sk_tugas,
                'tgl_sk_penugasan_bukti' => $each_data->tgl_sk_tugas,
                'penulis_dosen' =>  $buku_ajar_sdm,
                'penulis_mahasiswa' =>  $buku_ajar_pd,
                'penulis_lain' =>  $buku_ajar_nonca
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
        $id_buku_ajar = guid();
        $id_tulis_buku_ajar = guid();
        $id_katgiat = 110801;

        DB::beginTransaction();
        try {
            DB::insert("INSERT INTO pdrd.buku_ajar (id_buku_ajar, id_kat_capaian, 
            id_jns_bhn_ajar, id_litabmas, judul_buku, penulis, penerbit, isbn, 
            tgl_terbit, sk_tugas, tgl_sk_tugas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [$id_buku_ajar, $request->id_kat_capaian, $request->id_jns_bhn_ajar, 
            $request->id_litabmas, $request->judul_buku, $request->penulis, $request->penerbit, 
            $request->isbn, $request->tgl_terbit, $request->sk_tugas, $request->tgl_sk_tugas]);

            DB::insert("INSERT INTO pdrd.tulis_buku_ajar (id_tulis_buku_ajar, id_katgiat, 
            id_buku_ajar, id_sdm, id_pd, id_orang, urutan2, afiliasi, peran_tulis, 
            jns_penulis, nm_pd, nipd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [$id_tulis_buku_ajar, $id_katgiat, $id_buku_ajar, $request->id_sdm, $request->id_pd, 
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

    public function update(Request $request)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.buku_ajar SET id_kat_capaian = ?, 
            SET id_jns_bhn_ajar = ?, SET id_litabmas = ?, SET judul_buku = ?, 
            SET penulis = ?, SET penerbit = ?, SET isbn = ?, SET tgl_terbit = ?, SET sk_tugas = ?, 
            SET tgl_sk_tugas = ? WHERE id_buku_ajar = ?", [$request->id_kat_capaian, 
            $request->id_jns_bhn_ajar, $request->id_litabmas, $request->judul_buku, 
            $request->penulis, $request->penerbit, $request->isbn, $request->tgl_terbit, 
            $request->sk_tugas, $request->tgl_sk_tugas, $request->id_buku_ajar]);
    
            DB::update("UPDATE pdrd.tulis_buku_ajar SET id_buku_ajar = ?, SET id_sdm = ?, 
            SET id_pd = ?, SET id_orang = ?, SET urutan2 = ?, SET afiliasi = ?, SET peran_tulis = ?,
            SET jns_penulis = ?, SET nm_pd = ?, SET nipd = ? WHERE id_tulis_buku_ajar = ?",[$request->id_buku_ajar, 
            $request->id_sdm, $request->id_pd, $request->id_orang, $request->urutan2, $request->afiliasi, 
            $request->peran_tulis, $request->jns_penulis, $request->nm_pd, $request->nipd, $request->id_tulis_buku_ajar]);

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

    public function delete(Request $request)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.buku_ajar SET soft_delete = 1 WHERE id_buku_ajar = ?", [$request->id_buku_ajar]);
            DB::update("UPDATE pdrd.tulis_buku_ajar SET soft_delete = 1 WHERE id_buku_ajar = ?", [$request->id_buku_ajar]);
            // DB::update("UPDATE pdrd.tulis_buku_ajar SET soft_delete = 1 WHERE id_tulis_buku_ajar = ?", [$request->id_tulis_buku_ajar]);
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
