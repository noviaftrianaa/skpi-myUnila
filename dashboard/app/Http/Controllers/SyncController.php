<?php

namespace App\Http\Controllers;

use App\Http\Controllers\SyncTrait;
use App\Models\Sync\KelompokTabelAplikasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class SyncController extends Controller
{
    public function index()
    {
        $data = KelompokTabelAplikasi::whereNull("expired_date")
            ->where("level", 0)
            ->orderBy("enpoint", "ASC")
            ->get();
        return view("content.main.sync.index", compact("data"));
    }

    public function create()
    {
        return view("_partials.__partial.form.create", [
            "judul_halaman" => "Tambah Sync Grup MyUNILA",
            "route" => "sinkronisasi.simpan",
            "backLink" => "sinkronisasi",
            "form" => "content.main.sync.create",
        ]);
    }

    public function store(Request $request)
    {
        $input = $request->all();
        $input["level"] = 0;
        $data = new KelompokTabelAplikasi();
        $data->fill($data->prepare($input));
        $data->save();

        alert()
            ->success("Berhasil menyimpan data")
            ->persistent("OK");
        return redirect()->route("sinkronisasi");
    }

    public function show($id)
    {
        $id_kel_table_app = Crypt::decrypt($id);
        $data = KelompokTabelAplikasi::find($id_kel_table_app);
        $data_tabel = DB::SELECT(
            "
            SELECT
                kta.id_kel_table_app,
                kta.enpoint,
                kta.url,
                kta.method,
                ta.skema_tbl,
                ta.nm_tbl,
                ta.tabel_alias,
                ta.kode_primary,
                ta.sync_type,
                ta.sync_seq,
                lta.waktu_mulai,
                lta.keterangan,
                lta.waktu_mulai_sync,
                lta.waktu_selesai_sync
            FROM man_akses.kelompok_tabel_aplikasi AS kta
            JOIN man_akses.table_aplikasi AS ta ON ta.id_table_app=kta.id_table_app AND ta.expired_date IS NULL
                AND ta.a_table_aktif=1
            LEFT JOIN logger.log_table_app AS lta ON lta.id_table_app=ta.id_table_app
                AND lta.id_aplikasi='" .
                env("app_id") .
                "'
            WHERE kta.expired_date IS NULL
            AND kta.id_induk_kel_table_app='" .
                $data->id_kel_table_app .
                "'
            ORDER BY ta.sync_type ASC, ta.sync_seq DESC
        "
        );
        return view("content.main.sync.detail", compact("data", "data_tabel"));
    }

    public function edit($id)
    {
        $id_kel_table_app = Crypt::decrypt($id);
        $data = KelompokTabelAplikasi::find($id_kel_table_app);
        return view("_partials.__partial.form.edit", [
            "judul_halaman" => "Ubah data Sync Grup MyUNILA",
            "id" => $data->id_kel_table_app,
            "data" => $data,
            "route" => "sinkronisasi.update",
            "backLink" => "sinkronisasi",
            "form" => "content.main.sync.edit",
        ]);
    }

    public function update(Request $request, $id)
    {
        $id_kel_table_app = Crypt::decrypt($id);
        $input = $request->all();
        $data = KelompokTabelAplikasi::find($id_kel_table_app);
        $data->fill($data->prepare($input));
        $data->save();

        alert()
            ->success("Berhasil mengubah data")
            ->persistent("OK");
        return redirect()->route("sinkronisasi");
    }
}
