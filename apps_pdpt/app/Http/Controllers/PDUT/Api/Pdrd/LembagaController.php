<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\PDUT\Pdrd\AkreditasiProdi;
use App\Models\PDUT\Pdrd\ProfilProdi;
use App\Models\PDUT\Pdrd\ProfilPt;
use App\Models\PDUT\Pdrd\SatuanPendidikan;
use App\Models\PDUT\Pdrd\Sms;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class LembagaController extends Controller
{
    protected $request;
    protected $akreditasi_prodi;
    protected $profil_prodi;
    protected $sms;
    protected $profil_pt;
    protected $satuan_pendidikan;
    
    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->akreditasiprodi = new AkreditasiProdi();
        $this->profilprodi = new ProfilProdi();
        $this->sms = new Sms();
        $this->profilpt = new ProfilPt();
        $this->satuanpendidikan = new SatuanPendidikan();
    }


    public function detailProfilPt()
    {
        InputValidator([
            'id_sp' => 'required|uuid',
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sortby = "ASC";
        $sortby = $this->request->input('sortby');
        $id_sp = $this->request->input('id_sp');

        if (!empty($sortby)) {
            $sortby =$sortby;
        }

        try {
        $query = "SELECT
            sp.id_sp, 
            sp.nm_lemb, 
            ppt.visi,
            ppt.misi, 
            ppt.tujuan, 
            ppt.sasaran
        FROM 
            pdrd.profil_pt AS ppt WITH(NOLOCK)
        JOIN 
            pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = ppt.id_sp AND sp.soft_delete = 0
        WHERE 
            sp.soft_delete = 0 AND sp.id_sp = '" . $id_sp . "' ORDER BY sp.nm_lemb " .$sortby . " ";

        
        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $profilpt= DB::select($query);
        if(empty($profilpt)){
            return WrapResponse(['data' => null], 'tidak ada daftar profil perguruan tinggi yang ditampilkan', FALSE);
        }

        
            $data = [];
            foreach ($profilpt as $value) {
                $data[] = [
                'id_sp' => $value->id_sp,
                'nm_lemb' => $value->id_publikasi,
                'visi' => $value->visi,
                'misi' => $value->misi,
                'tujuan' => $value->tujuan,
                'sasaran' => $value->sasaran,
            ];
        }
        return WrapResponse(compact('data'), 'berhasil');
    } catch (Exception $e) {
        Log::error(__FUNCTION__ . '-' . $e->getMessage());
        return WrapResponse([], "gagal mendapatkan data profil perguruan tinggi", FALSE );
    }
}


    public function listAkreditasiPt(Request $request)
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

        $akreditasipt= DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT
            asp.id_akred_sp,
            asp.id_sp,
            asp.id_akred,
			sp.nm_lemb,
            nakred.nm_akred,
            asp.sk_akred_sp,
            asp.tgl_sk_akred_sp
        FROM pdrd.akred_sp AS asp WITH(NOLOCK)
        JOIN pdrd.satuan_pendidikan AS sp WITH(NOLOCK) ON sp.id_sp = asp.id_sp AND sp.soft_delete = 0
        LEFT JOIN ref.nilai_akred AS nakred WITH(NOLOCK) ON nakred.id_akred = asp.id_akred
        ORDER BY asp.id_sp ASC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        $data = [];
        foreach ($akreditasipt as $each_data) {
            $data[] = [
                'id_akred_sp' => $each_data->id_akred_sp,
                'id_sp' => $each_data->id_sp,
                'id_akred' => $each_data->id_akred,
                'nm_lemb' => $each_data->nm_lemb,
                'nm_akred' => $each_data->nm_akred,
                'sk_akred_sp' => $each_data->sk_akred_sp,
                'tgl_sk_akred_sp' => $each_data->tgl_sk_akred_sp,
            ];
        }
        return response()->json([
            'success' => true,
            'message' => 'Berhasil mendapatkan data',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }

    public function detailDaftarProdi(Request $request)
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

        $detail_prodi= DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT
            sms.id_sms,
            sms.nm_lemb,
            sms.kode_prodi,
            sms.stat_prodi,
            sms.sks_lulus
        FROM pdrd.sms AS sms WITH(NOLOCK)
        WHERE sms.soft_delete = 0
        ORDER BY sms.id_sms ASC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        $data = [];
        foreach ($detail_prodi as $each_data) {
            $data[] = [
                'id_sms' => $each_data->id_sms,
                'nm_lemb' => $each_data->nm_lemb,
                'kode_prodi' => $each_data->kode_prodi,
                'stat_prodi' => $each_data->stat_prodi,
                'sks_lulus' => $each_data->sks_lulus,
            ];
        }
        return response()->json([
            'success' => true,
            'message' => 'Berhasil mendapatkan data',
            'page' => $page,
            'count' => $count,
            'data'  => $data
        ], 200);
    }

    public function listProfilProdi(Request $request)
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

        $profilprodi = DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT
            sms.id_sms,
            akredpd.id_akreditasi_prodi,
            akredpd.sk_akreditasi_prodi,
            akredpd.tanggal_sk_akreditasi_prodi,
            sms.nm_lemb,
			akreditasi.nm_akred,
            lembak.nm_lemb,
            profilpd.visi,
            profilpd.misi,
            profilpd.tujuan,
            profilpd.sasaran,
            profilpd.kompetensi,
            profilpd.himp_alumni
        FROM pdrd.akreditasi_prodi AS akredpd WITH(NOLOCK)
        JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = akredpd.id_sms AND sms.soft_delete = 0
            LEFT JOIN pdrd.profil_prodi AS profilpd WITH(NOLOCK) ON profilpd.id_sms = akredpd.id_sms AND profilpd.soft_delete = 0
            LEFT JOIN ref.lembaga_akred AS lembak WITH(NOLOCK) ON lembak.id_lemb_akred = akredpd.id_lemb_akred AND lembak.expired_date IS NULL
            LEFT JOIN ref.nilai_akred AS akreditasi WITH(NOLOCK) ON akreditasi.id_akred = akredpd.id_akred AND akreditasi.expired_date IS NULL
        WHERE akredpd.soft_delete = 0
        ORDER BY akredpd.create_date DESC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $count]);

        $data = [];
        foreach ($profilprodi as $each_data) {
            $data[] = [
                'id_sms' => $each_data->id_sms,
                'id_akreditasi_prodi' => $each_data->id_akreditasi_prodi,
                'sk_akreditasi_prodi' => $each_data->sk_akreditasi_prodi,
                'tanggal_sk_akreditasi_prodi' => $each_data->tanggal_sk_akreditasi_prodi,
                'nm_lemb' => $each_data->nm_lemb,
                'nm_lemb' => $each_data->nm_lemb,
                'lembaga_akreditasi' => $each_data->himp_alumni,
                'visi' => $each_data->misi,
                'tujuan' => $each_data->sasaran,
                'kompetensi' => $each_data->kompetensi,
                'himp_alumni' => $each_data->himp_alumni

            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data Profil Prodi',
            'page' => $page,
            'count' => $count,
            'data'  => $profilprodi
        ], 200);
    }


    public function listProfilProdiById(Request $request)
    {

        $id = $request->id_sms;
        if (empty($id)) {
            return response()->json([
                'status' => FALSE,
                'message' => "id_sms kosong"
            ]);
        }

        $profilprodi = DB::select("SELECT
            sms.id_sms,
            akredpd.id_akreditasi_prodi,
            akredpd.sk_akreditasi_prodi,
            akredpd.tanggal_sk_akreditasi_prodi,
            sms.nm_lemb,
			akreditasi.nm_akred,
            lembak.nm_lemb,
            profilpd.visi,
            profilpd.misi,
            profilpd.tujuan,
            profilpd.sasaran,
            profilpd.kompetensi,
            profilpd.himp_alumni
        FROM pdrd.akreditasi_prodi AS akredpd WITH(NOLOCK)
        JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = akredpd.id_sms AND sms.soft_delete = 0
            LEFT JOIN pdrd.profil_prodi AS profilpd WITH(NOLOCK) ON profilpd.id_sms = akredpd.id_sms AND profilpd.soft_delete = 0
            LEFT JOIN ref.lembaga_akred AS lembak WITH(NOLOCK) ON lembak.id_lemb_akred = akredpd.id_lemb_akred AND lembak.expired_date IS NULL
            LEFT JOIN ref.nilai_akred AS akreditasi WITH(NOLOCK) ON akreditasi.id_akred = akredpd.id_akred AND akreditasi.expired_date IS NULL
        WHERE sms.soft_delete = 0 AND sms.id_sms = ? ", [$id]);

        $data = [];
        foreach ($profilprodi as $each_data) {
            $data[] = [
                'id_sms' => $each_data->id_sms,
                'id_akreditasi_prodi' => $each_data->id_akreditasi_prodi,
                'sk_akreditasi_prodi' => $each_data->sk_akreditasi_prodi,
                'tanggal_sk_akreditasi_prodi' => $each_data->tanggal_sk_akreditasi_prodi,
                'prodi' => $each_data->nm_lemb,
                'nm_akred' => $each_data->nm_akred,
                'nm_lemb' => $each_data->nm_lemb,
                'lembaga_akreditasi' => $each_data->himp_alumni,
                'visi' => $each_data->misi,
                'tujuan' => $each_data->sasaran,
                'kompetensi' => $each_data->kompetensi,
                'himp_alumni' => $each_data->himp_alumni

            ];
        }

        return WrapResponse(['data' => $data], 'Detail Profil Prodi By id_sms', TRUE);
    }

    public function update(Request $request)
    {
        $id_sms = $request->input('id_sms');
        InputValidator([
            'id_sms' => 'required|regex:/^[a-zA-Z0-9\-\(\)\s]+$/',
        ], [
            'id_sms.required' => 'field ini harus diisi',
            'id_sms.regex' => 'input harus berupa campuran alpa_numeric dan dash',
        ]);

        DB::beginTransaction();
        try {

            $profil_prodi = ProfilProdi::where('id_sms')->first();

            if (empty($profil_prodi)) {
                return WrapResponse([], "Data tidak ditemukan", FALSE);
            }

            $profil_prodi->update([
                'id_sms' => $request->id_sms,
                'desk_singkat' => $request->desk_singkat,
                'visi' => $request->visi,
                'misi' => $request->misi,
                'tujuan' => $request->tujuan,
                'sasaran' => $request->sasaran,
                'kompetensi' => $request->kompetensi,
                'capaian_belajar' => $request->capaian_belajar,
                'upaya_sebar' => $request->upaya_sebar,
                'keberlanjutan' => $request->keberlanjutan,
                'frek_kur' => $request->frek_kur,
                'laks_kur' => $request->laks_kur,
                'himp_alumni' => $request->himp_alumni,
                'id_updater' => guid(),
                'create_date' => currDateTime(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);

            $akreditasi_prodi = AkreditasiProdi::where('id_sms', $profil_prodi->id_sms)->first();
            $akreditasi_prodi->update([
                'id_lemb_akred' => $request->id_lemb_akred,
                'id_akred' => $request->id_akred,
                'sk_akreditasi_prodi' => $request->sk_akreditasi_prodi,
                'tanggal_sk_akreditasi_prodi' => $request->tanggal_sk_akreditasi_prodi,
                'tst_sk_akreditasi_prodi' => $request->tst_sk_akreditasi_prodi,
                'asal_data' => $request->asal_data,
                'id_updater' => guid(),
                'last_update' => currDateTime(),
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse([], 'sukses memperbaharui profil prodi - ' . $profil_prodi->id_sms);
        } catch (\Exception $e) {
            Log::error('Message ' . $e->getMessage() . ' - ' . $e->getLine());
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse([], "gagal memperbaharui profil prodi");
        }
    }

    public function listSms(Request $request)
    {

        $listdata = DB::SELECT("SELECT
                sms.id_sms,
                js.nm_jns_sms,
                sms.id_fak_unila,
                sms.id_jur_unila,
                sms.nm_lemb,
                sms.smt_mulai,
                sms.kode_prodi,
                sms.no_tel,
                sms.no_fax,
                sms.email,
                sms.tgl_berdiri,
                sms.sks_lulus,
                sms.gelar_lulusan,
                sms.stat_prodi,
                sms.create_date,
                sms.last_update,
                jp.nm_jenj_didik AS nm_jenj_didik,
                js.id_jns_sms AS id_jns_sms,
                wil.id_wil AS id_wil,
                sms.id_induk_sms AS id_induk_sms
            FROM
                pdrd.sms AS sms WITH(NOLOCK)
                LEFT JOIN ref.jenjang_pendidikan AS jp ON jp.id_jenj_didik = sms.id_jenj_didik
                AND jp.expired_date IS NULL
                JOIN ref.jenis_sms AS js ON js.id_jns_sms = sms.id_jns_sms
                AND js.expired_date IS NULL
                LEFT JOIN ref.wilayah AS wil ON wil.id_wil = sms.id_wil
                AND wil.expired_date IS NULL
                LEFT JOIN ref.jurusan AS jur ON jur.id_jur = sms.id_jur
                AND jur.expired_date IS NULL

            WHERE sms.soft_delete = 0 ");


            foreach ($listdata as $each_data) {
                $data[] = [
                    'id_sms' => $each_data->id_sms,
                    'nm_jns_sms' => $each_data->nm_jns_sms,
                    'nm_lemb' => $each_data->nm_lemb,
                    'id_fak_unila' => $each_data->id_fak_unila,
                    'id_jur_unila' => $each_data->id_jur_unila,
                    'kode_prodi' => $each_data->kode_prodi,
                    'no_tel' => $each_data->no_tel,
                    'no_fax' => $each_data->no_fax,
                    'email' => $each_data->email,
                    'tgl_berdiri' => $each_data->tgl_berdiri,
                    'sks_lulus' => $each_data->sks_lulus,
                    'gelar_lulusan' => $each_data->gelar_lulusan,
                    'stat_prodi' => $each_data->stat_prodi,
                    'nm_jenj_didik' => $each_data->nm_jenj_didik,
                    'id_jns_sms' => $each_data->id_jns_sms,
                    'id_wil' => $each_data->id_wil,
                    'id_induk_sms' => $each_data->id_induk_sms,
                    'waktu_data_ditambahkan' => $each_data->create_date,
                    'terakhir_diubah' => $each_data->last_update,
                ];
            }
           return response()->json([
            'success' => true,
            'message' => 'Berhasil mendapatkan data',
            'data'  => $data
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function updateProfilProdi(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            DB::update("UPDATE pdrd.akreditasi_prodi
                SET id_akreditasi_prodi = ?,
                SET id_sms = ?,
                SET id_lemb_akred = ?,
                SET id_akred = ?,
                SET sk_akreditasi_prodi = ?,
                SET tanggal_sk_akreditasi_prodi' = ?,
                SET isbn = ?,
                SET tgl_terbit = ?,
                SET sk_tugas = ?,
                SET tgl_sk_tugas = ?
            WHERE id_publikasi = ?", [
                $request->id_kat_capaian,
                $request->id_jns_pub,
                $request->id_litabmas,
                $request->judul,
                $request->penulis,
                $request->penerbit,
                $request->isbn,
                $request->tgl_terbit,
                $request->sk_tugas,
                $request->tgl_sk_tugas,
                $request->id_publikasi
            ]);

            DB::update("UPDATE pdrd.tulis_pub SET id_publikasi = ?, SET id_sdm = ?,
            SET id_pd = ?, SET id_orang = ?, SET urutan2 = ?, SET afiliasi = ?, SET peran_tulis = ?,
            SET jns_penulis = ?, SET nm_pd = ?, SET nipd = ? WHERE id_tulis_pub = ?", [
                $request->id_publikasi,
                $request->id_sdm,
                $request->id_pd,
                $request->id_orang,
                $request->urutan2,
                $request->afiliasi,
                $request->peran_tulis,
                $request->jns_penulis,
                $request->nm_pd,
                $request->nipd,
                $request->id_tulis_pub
            ]);

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Berhasil ubah data'
            ], 200);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Gagal ubah data'
            ], 400);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
