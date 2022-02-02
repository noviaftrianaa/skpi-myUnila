<?php

namespace App\Http\Controllers;

use App\Models\PDUT\Dok\Dokumen;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait DokumenTrait
{
    public function simpan_dokumen(Request $request)
    {
        $file         = $request->dokumen['file'];
        $id_jenis     = $request->dokumen['id_jns_dok'];
        $nama_dokumen = $request->dokumen['nama'];
        $ket_dokumen  = $request->dokumen['keterangan'];
        $url_dokumen  = $request->dokumen['url'];
        $id_pengguna  = $request->dokumen['id_pengguna'];

        if(is_null($file) == true) {
            return ['a_sukses_upload'=>0,'id_dok'=>null,'ket'=>'Tidak ada file yang diunggah'];;
        }
        if(is_null($id_jenis) == true) {
            return ['a_sukses_upload'=>0,'id_dok'=>null,'ket'=>'Jenis dokumen kosong'];;
        }

        $nama    = $nama_dokumen;
        $id_jns  = $id_jenis;
        $ket_dok = $ket_dokumen;
        $url_dok = $url_dokumen;
        $ext     = $file->getClientOriginalExtension();
        $id_dok  = guid();

        if($ext=='pdf' || $ext=='doc' || $ext=='docx' || $ext=='xls' || $ext=='xlsx' || $ext=='txt' || $ext=='jpg' || $ext=='png' || $ext=='jpeg' || $ext=='JPG' || $ext=='JPEG' || $ext=='PNG') {
            $size = $file->getClientSize();
            if ($size <= 1000000) {
                $mime = $file->getClientMimeType();
                $nama_asli = $file->getClientOriginalName();
                $bytea = base64_encode(file_get_contents($file->getPathName(), FILE_BINARY));
                try {
                    $yo = \DB::SELECT(DB::RAW("
                        INSERT INTO dok.dokumen (
                            [id_dok],
                            [id_jns_dok],
                            [nm_dok],
                            [ket_dok],
                            [file_dok],
                            [wkt_unggah],
                            [url],
                            [media_type],
                            [file_name],
                            [create_date],
                            [id_creator],
                            [last_update],
                            [id_updater],
                            [soft_delete],
                            [last_sync]
                        ) VALUES (
                            '".$id_dok."',
                            '".$id_jns."',
                            '".$nama."',
                            '".$ket_dok."',
                            CAST ('".$bytea."' AS VARBINARY(MAX)),
                            GETDATE(),
                            '".$url_dok."',
                            '".$mime."',
                            '".$nama_asli."',
                            GETDATE(),
                            '".$id_pengguna."',
                            GETDATE(),
                            '".$id_pengguna."',
                            '0',
                            GETDATE()
                        ) ")
                    );
                } catch (\Illuminate\Database\QueryException $ex) {
                    $cek    = strpos($ex->getMessage(), "The active result for the query contains no fields");
                    if($cek != false) {
                        return ['a_sukses_upload' => 1, 'id_dok' => $id_dok, 'ket' => null];
                    } else {
                        return ['a_sukses_upload' => 0, 'id_dok' => null, 'ket' => 'File gagal disimpan.'];
                    }
                }
            } else {
                return ['a_sukses_upload' => 0, 'id_dok' => null, 'ket' => 'File melebihi 1MB'];
            }
        } else {
            return ['a_sukses_upload' => 0, 'id_dok' => null, 'ket' => 'Ekstensi file yang anda unggah tidak sesuai dengan ketentuan'];
        }
    }

    public function simpan_large_object(Request $request)
    {
        //
    }
}
