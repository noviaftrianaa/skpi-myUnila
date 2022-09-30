<?php

namespace App\Http\Controllers\PDUT\Api\Iku;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Pdrd\RegPd;
use App\Models\PDUT\Temp_iku\Iku_2;
use Illuminate\Http\Request;
use DB;

use Illuminate\Http\Response;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;

use App\Services\JsonApiResponse as WrapResponse;
use App\Services\QueryPagination;

use Exception;
use Log;

class Iku2Controller extends Controller
{
    protected $request;
    protected $regPd;
    protected $iku2;
    protected $wrapResponse;

    public function __construct()
    {
        $this->sanitizeRequest();

        $this->regPd = new RegPd();
        $this->iku2 = new Iku_2();
        $this->wrapResponse = new WrapResponse;
    }

    public function tambah()
    {

        InputValidator([
            'id_thn_ajaran' => 'required|numeric',
            'id_reg_pd' => 'required|uuid',
            'id_smt' => 'required|numeric',
            'id_daftar_mbkm' => 'required|uuid',
            'id_jns_akt_mhs' => 'required|numeric',
            'nm_periode_mbkm' => 'required',
            'tgl_mulai' => 'required|date',
            'tgl_selesai' => 'required|date',
            'a_diluar_pt' => 'required|numeric',
            'id_mk_konversi' => 'required|uuid',
            'nip_ajar' => 'required|numeric',
            'kode_mk' => 'required',
            'nm_mk' => 'required',
            'sks_mk' => 'required'
        ]);

        $id_iku_2_mbkm = guid();
        $id_reg_pd = $this->request->input('id_reg_pd');
        $id_thn_ajaran = $this->request->input('id_thn_ajaran');
        $id_smt = $this->request->input('id_smt');
        $id_daftar_mbkm = $this->request->input('id_daftar_mbkm');
        $id_jns_akt_mhs = $this->request->input('id_jns_akt_mhs');
        $nm_periode_mbkm = $this->request->input('nm_periode_mbkm');
        $nm_penyelenggara = $this->request->input('nm_penyelenggara');
        $tgl_mulai = $this->request->input('tgl_mulai');
        $tgl_selesai = $this->request->input('tgl_selesai');
        $lokasi_mbkm = $this->request->input('lokasi_mbkm');
        $a_diluar_pt = $this->request->input('a_diluar_pt');
        $nidn_pembimbing = $this->request->input('nidn_pembimbing');
        $nm_pembimbing = $this->request->input('nm_pembimbing');
        $id_mk_konversi = $this->request->input('id_mk_konversi');
        $nip_ajar = $this->request->input('nip_ajar');
        $nm_ajar = $this->request->input('nm_ajar');
        $kode_mk = $this->request->input('kode_mk');
        $nm_mk = $this->request->input('nm_mk');
        $sks_mk = $this->request->input('sks_mk');
        $nilai_angka = $this->request->input('nilai_angka');
        $nilai_huruf = $this->request->input('nilai_huruf');
        $nilai_indeks = $this->request->input('nilai_indeks');

        $now = currDateTime();
        $id_creator = '26004417-6e92-463c-bf35-f741817121dc';
        $soft_delete = 0;

        $cek_mhs = $this->regPd->where('id_reg_pd', $id_reg_pd)->first();

        if (empty($cek_mhs)) {
            return WrapResponse(['data' => null], 'id_reg_pd tidak ada', FALSE);
        }

        DB::beginTransaction();
        try {
            $iku2 = $this->iku2->create([
                'id_iku_2_mbkm' => $id_iku_2_mbkm,
                'id_reg_pd' => $id_reg_pd,
                'id_thn_ajaran' => $id_thn_ajaran,
                'id_smt' => $id_smt,
                'id_daftar_mbkm' => $id_daftar_mbkm,
                'id_jns_akt_mhs' => $id_jns_akt_mhs,
                'nm_periode_mbkm' => $nm_periode_mbkm,
                'nm_penyelenggara' => $nm_penyelenggara,
                'tgl_mulai' => $tgl_mulai,
                'tgl_selesai' => $tgl_selesai,
                'lokasi_mbkm' => $lokasi_mbkm,
                'a_diluar_pt' => $a_diluar_pt,
                'nidn_pembimbing' => $nidn_pembimbing,
                'nm_pembimbing' => $nm_pembimbing,
                'id_mk_konversi' => $id_mk_konversi,
                'nip_ajar' => $nip_ajar,
                'nm_ajar' => $nm_ajar,
                'kode_mk' => $kode_mk,
                'nm_mk' => $nm_mk,
                'sks_mk' => $sks_mk,
                'nilai_angka' => $nilai_angka,
                'nilai_huruf' => $nilai_huruf,
                'nilai_indeks' => $nilai_indeks,
                'id_creator' => $id_creator,
                'create_date' => $now,
                'last_update' => $now,
                'last_sync' => $now,
                'soft_delete' => $soft_delete
            ]);


            DB::commit();
            return $this->wrapResponse->setStatusCode(Response::HTTP_ACCEPTED)->setMessage('sukses menambahkan iku2 - id_reg_pd : ' . $iku2->id_reg_pd)->render();
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return $this->wrapResponse->setMessage(static::QUERY_RESULT_EMPTY)->setError("iku 2 tidak ditemukan atau iku 2 tidak terdaftar")->render();
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return $this->wrapResponse->setMessage(static::INSERT_FAILED)->setError("gagal menambahkan iku 2")->render();
        }
    }
}
