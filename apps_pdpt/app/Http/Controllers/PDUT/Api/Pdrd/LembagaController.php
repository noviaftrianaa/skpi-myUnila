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
            'limit'    => 'numeric|min:1|max:50',
            'sort_by' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sortby = "ASC";
        $sortby = $this->request->input('sort_by');
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
        return WrapResponse([], "gagal mendapa tkan data profil perguruan tinggi", FALSE );
    }
}


    public function listAkreditasiPt(Request $request)
    {
        $page = 1; $limit = 10;
        if(!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->limit)) {
            if ($request->limit > 50) {
                $limit = 50;
            } else {
                $limit = $request->limit;
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
        ", [$page, $limit]);

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
            'limit' => $limit,
            'data'  => $data
        ], 200);
    }

    public function detailDaftarProdi(Request $request)
    {
        $page = 1; $limit = 10;
        if(!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->limit)) {
            if ($request->limit > 50) {
                $limit = 50;
            } else {
                $limit = $request->limit;
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
        ", [$page, $limit]);

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
            'limit' => $limit,
            'data'  => $data
        ], 200);
    }

    public function listProfilProdi(Request $request)
    {
        $page = 1; $limit = 10;
        if(!empty($request->page)) {
            $page = $request->page;
        }
        if (!empty($request->limit)) {
            if ($request->limit > 50) {
                $limit = 50;
            } else {
                $limit = $request->limit;
            }
        }

        $profilprodi = DB::SELECT("
        DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= ?
        SET @RowsOfPage= ?
        SELECT
            sms.id_sms,
            sms.nm_lemb AS nm_prodi,
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
            profilpd.himp_alumni,
            lembak.nm_lemb
        FROM pdrd.akreditasi_prodi AS akredpd WITH(NOLOCK)
        JOIN pdrd.sms AS sms WITH(NOLOCK) ON sms.id_sms = akredpd.id_sms AND sms.soft_delete = 0
            LEFT JOIN pdrd.profil_prodi AS profilpd WITH(NOLOCK) ON profilpd.id_sms = akredpd.id_sms AND profilpd.soft_delete = 0
            LEFT JOIN ref.lembaga_akred AS lembak WITH(NOLOCK) ON lembak.id_lemb_akred = akredpd.id_lemb_akred AND lembak.expired_date IS NULL
            LEFT JOIN ref.nilai_akred AS akreditasi WITH(NOLOCK) ON akreditasi.id_akred = akredpd.id_akred AND akreditasi.expired_date IS NULL
        WHERE akredpd.soft_delete = 0
        ORDER BY akredpd.create_date DESC
        OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY
        ", [$page, $limit]);

        $data = [];
        foreach ($profilprodi as $each_data) {
            $data[] = [
                'id_sms' => $each_data->id_sms,
                'nm_prodi' => $each_data->nm_prodi,
                'id_akreditasi_prodi' => $each_data->id_akreditasi_prodi,
                'sk_akreditasi_prodi' => $each_data->sk_akreditasi_prodi,
                'tanggal_sk_akreditasi_prodi' => $each_data->tanggal_sk_akreditasi_prodi,
                'nm_lemb' => $each_data->nm_lemb,
                'lembaga_akreditasi' => $each_data->nm_lemb,
                'visi' => $each_data->misi,
                'tujuan' => $each_data->tujuan,
                'sasaran' => $each_data->sasaran,
                'kompetensi' => $each_data->kompetensi,
                'himp_alumni' => $each_data->himp_alumni

            ];
        }

        return response()->json([
            'status' => true,
            'message' => 'Berhasil mengambil data Profil Prodi',
            'page' => $page,
            'limit' => $limit,
            'data'  => $profilprodi
        ], 200);
    }

    public function ubah()
    {
        InputValidator([
           'id_sms' => 'required|uuid',
           'id_akreditasi_prodi' => 'required|uuid',
           'sk_akreditasi_prodi' => 'required|string',
           'tanggal_sk_akreditasi_prodi' => 'nullable|date_format:Y-m-d',
           'nm_lemb' => 'required|string',
           'lembaga_akreditasi' => 'required|string',
           'visi' => 'nullable|text',
           'tujuan' => 'nullable|text',
           'sasaran' => 'nullable|text',
           'kompetensi' => 'nullable|text',
           'himp_alumni' => 'nullable|text',
        ]);


        $id_sms = $this->request->input('id_sms');
        $id_akreditasi_prodi = $this->request->input('id_akreditasi_prodi');
        $sk_akreditasi_prodi = $this->request->input('sk_akreditasi_prodi');
        $tanggal_sk_akreditasi_prodi = $this->request->input('tanggal_sk_akreditasi_prod');
        $nm_lemb = $this->request->input('nm_lemb');
        $lembaga_akreditasi = $this->request->input('lembaga_akreditasi');
        $visi = $this->request->input('visi');
        $misi = $this->request->input('misi');
        $tujuan = $this->request->input-('tujuan');
        $sasaran = $this->request->input-('sasaran');
        $kompetensi = $this->request->input('kompetensi');
        $himp_alumni = $this->request->input('himp_alumni');

        $last_update = currDateTime();
        $id_updater = '26004417-6e92-463c-bf35-f741817121dc';

        $last_sync = currDateTime();

       DB::beginTransaction();
       try{
        $profil_prodi = $this->profilprodi->where('id_sms', $id_sms)->first();
       if (!$profil_prodi) return WrapResponse(['data' => null], 'id_sms tidak ditemukan', FALSE);

            $profil_prodi->update([
                'id_sms' => $id_sms,
                'id_akreditasi_prodi' => $id_akreditasi_prodi,
                'sk_akreditasi_prodi' => $sk_akreditasi_prodi,
                'tanggal_sk_akreditasi_prodi' => $tanggal_sk_akreditasi_prodi,
                'nm_lemb' => $nm_lemb,
                'lembaga_akreditasi' => $lembaga_akreditasi,
                'visi' => $visi,
                'misi' => $misi,
                'tujuan' => $tujuan,
                'sasaran' => $sasaran,
                'kompetensi' => $kompetensi,
                'himp_alumni' => $himp_alumni,
                'id_updater' => $id_updater,
                'last_update' => $last_update,
                'last_sync' => $last_sync,
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_sms' => $id_sms)), 'sukses mengubah profil prodi', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'profil prodi tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah profil prodi', FALSE);
        }
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



    public function listLembaga(Request $request)
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
