<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use App\Models\PDUT\Keuangan\SppMhs;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;
use Illuminate\Support\Facades\Log;

class KeuanganUktMhsController extends Controller
{
    protected $request;
    protected $sppmhs;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->sppmhs = new SppMhs();
    }

    public function daftar(){
        InputValidator([
            'page' => 'required|integer',
            'limit' => 'required|integer',
            'sort' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])],
        ]);

        $sort = 'ASC';
        $sort = $this->request->input('sort');
        if (!empty($sort)) {
            $sort = $sort;
        }

        try {
            $query = "SELECT
            spp.id_spp_mhs,
            spp.tgl_bayar,
            spp.nominal,
            spp.kode_pembayaran,
            spp.nomor_pin,
            spp.kode_akses,
            spp.bill_ref,
            spp.flag_by,
            spp.ket,
            kls.nm_kelas_ukt,
            kls.nominal_ukt,
            smt.nm_smt,
            pd.nm_pd,
            reg.nipd,
            sms.nm_lemb
            FROM keuangan.spp_mhs AS spp WITH(NOLOCK)
            LEFT JOIN keuangan.kelas_ukt AS kls WITH(NOLOCK) ON spp.id_kelas_ukt = kls.id_kelas_ukt AND kls.soft_delete = 0
            LEFT JOIN ref.semester AS smt WITH(NOLOCK) ON spp.id_smt = smt.id_smt AND smt.expired_date IS NULL
            LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON spp.id_reg_pd = reg.id_reg_pd AND reg.soft_delete = 0
            LEFT JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON reg.id_pd = pd.id_pd AND pd.soft_delete = 0
            LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON reg.id_sms = sms.id_sms AND sms.soft_delete = 0
            WHERE spp.soft_delete = 0
            ORDER BY pd.nm_pd " . $sort . " ";

            $pagination = CustomPagination($query);
            $query = $pagination['query'];

            $uktmhs = DB::select($query);
            if (empty($uktmhs)) {
                return WrapResponse(['data' => null], 'tidak ada daftar ukt mahasiswa yang ditampilkan', FALSE);
            }

            $data = [];
            foreach ($uktmhs as $value) {
                $data[] = [
                    'id_spp_mhs' => $value->id_spp_mhs,
                    'nama_mahasiswa' => $value->nm_pd,
                    'npm' => $value->nipd,
                    'program_studi' => $value->nm_lemb,
                    'kelas_ukt' => $value->nm_kelas_ukt,
                    'nominal_kelas_ukt' => $value->nominal_ukt,
                    'semester' => $value->nm_smt,
                    'tgl_bayar' => $value->tgl_bayar,
                    'nominal' => $value->nominal,
                    'kode_pembayaran' => $value->kode_pembayaran,
                    'nomor_pin' => $value->nomor_pin,
                    'kode_akses' => $value->kode_akses,
                    'bill_ref' => $value->bill_ref,
                    'flag_by' => $value->flag_by,
                    'keterangan' => $value->ket
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse([], $th->getMessage(), FALSE);
        }
        return WrapResponse(['data' => $data], 'berhasil menampilkan daftar ukt mahasiswa', TRUE);
    }

    public function daftar_id()
    {
        InputValidator([
            'npm' => 'required|numeric',
        ]);

        $npm = $this->request->input('npm');

        try {
            $query = "SELECT
            spp.id_spp_mhs,
            spp.tgl_bayar,
            spp.nominal,
            spp.kode_pembayaran,
            spp.nomor_pin,
            spp.kode_akses,
            spp.bill_ref,
            spp.flag_by,
            spp.ket,
            kls.nm_kelas_ukt,
            kls.nominal_ukt,
            smt.nm_smt,
            pd.nm_pd,
            reg.nipd,
            sms.nm_lemb
            FROM keuangan.spp_mhs AS spp WITH(NOLOCK)
            LEFT JOIN keuangan.kelas_ukt AS kls WITH(NOLOCK) ON spp.id_kelas_ukt = kls.id_kelas_ukt AND kls.soft_delete = 0
            LEFT JOIN ref.semester AS smt WITH(NOLOCK) ON spp.id_smt = smt.id_smt AND smt.expired_date IS NULL
            LEFT JOIN pdrd.reg_pd AS reg WITH(NOLOCK) ON spp.id_reg_pd = reg.id_reg_pd AND reg.soft_delete = 0
            LEFT JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON reg.id_pd = pd.id_pd AND pd.soft_delete = 0
            LEFT JOIN pdrd.sms AS sms WITH(NOLOCK) ON reg.id_sms = sms.id_sms AND sms.soft_delete = 0
            WHERE spp.soft_delete = 0 AND reg.nipd = " . $npm . " ";

            $uktmhs = DB::select($query);
            if (empty($uktmhs)){
                return WrapResponse(array('data' => array('npm' => $npm)), 'tidak ada daftar ukt mahasiswa yang ditampilkan berdasarkan npm', FALSE);
            }

            $data = [];
            foreach ($uktmhs as $value) {
                $data[] = [
                    'id_spp_mhs' => $value->id_spp_mhs,
                    'nama_mahasiswa' => $value->nm_pd,
                    'npm' => $value->nipd,
                    'program_studi' => $value->nm_lemb,
                    'kelas_ukt' => $value->nm_kelas_ukt,
                    'nominal_kelas_ukt' => $value->nominal_ukt,
                    'semester' => $value->nm_smt,
                    'tgl_bayar' => $value->tgl_bayar,
                    'nominal' => $value->nominal,
                    'kode_pembayaran' => $value->kode_pembayaran,
                    'nomor_pin' => $value->nomor_pin,
                    'kode_akses' => $value->kode_akses,
                    'bill_ref' => $value->bill_ref,
                    'flag_by' => $value->flag_by,
                    'keterangan' => $value->ket
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(array('data' => array('npm' => $npm)), 'gagal  menampilkan daftar ukt mahasiswa berdasarkan npm', FALSE);
        }
        return WrapResponse(['data' => $data], 'berhasil menampilkan daftar ukt mahasiswa berdasarkan npm', TRUE);
    }

    public function tambah()
    {
        InputValidator([
            'id_kelas_ukt' => 'required|uuid',
            'id_smt' => 'required|numeric',
            'id_reg_pd' => 'required|uuid',
            'tgl_bayar' => 'required|date',
            'nominal' => 'required|numeric',
            'kode_pembayaran' => 'required|string',
            'nomor_pin' => 'required|string',
            'kode_akses' => 'required|string',
            'bill_ref' => 'required|string',
            'flag_by' => 'required|string',
            'ket' => 'required|string'
        ]);

        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_spp_mhs = guid();
        $id_kelas_ukt = $this->request->input('id_kelas_ukt');
        $id_smt = $this->request->input('id_smt');
        $id_reg_pd = $this->request->input('id_reg_pd');
        $tgl_bayar = $this->request->input('tgl_bayar');
        $nominal = $this->request->input('nominal');
        $kode_pembayaran = $this->request->input('kode_pembayaran');
        $nomor_pin = $this->request->input('nomor_pin');
        $kode_akses = $this->request->input('kode_akses');
        $bill_ref = $this->request->input('bill_ref');
        $flag_by = $this->request->input('flag_by');
        $ket = $this->request->input('ket');

        DB::beginTransaction();
        try {
            $this->sppmhs->create([
                'id_spp_mhs' => $id_spp_mhs,
                'id_kelas_ukt' => $id_kelas_ukt,
                'id_smt' => $id_smt,
                'id_reg_pd' => $id_reg_pd,
                'tgl_bayar' => $tgl_bayar,
                'nominal' => $nominal,
                'kode_pembayaran' => $kode_pembayaran,
                'nomor_pin' => $nomor_pin,
                'kode_akses' => $kode_akses,
                'bill_ref' => $bill_ref,
                'flag_by' => $flag_by,
                'ket' => $ket,
                'soft_delete' => 0,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'last_sync' => currDateTime(),
            ]);
            DB::commit();
            return WrapResponse(array('data' => array('id_spp_mhs' => $id_spp_mhs)), 'sukses menambahkan ukt mahasiswa', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(array('data' => array('id_spp_mhs' => $id_spp_mhs)), 'ukt mahasiswa tidak bisa ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan ukt mahasiwa', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_spp_mhs' => 'required|uuid',
            'id_kelas_ukt' => 'required|uuid',
            'id_smt' => 'required|numeric',
            'id_reg_pd' => 'required|uuid',
            'tgl_bayar' => 'required|date',
            'nominal' => 'required|numeric',
            'kode_pembayaran' => 'required|string',
            'nomor_pin' => 'required|string',
            'kode_akses' => 'required|string',
            'bill_ref' => 'required|string',
            'flag_by' => 'required|string',
            'ket' => 'required|string'
        ]);

        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_spp_mhs = $this->request->input('id_spp_mhs');
        $id_kelas_ukt = $this->request->input('id_kelas_ukt');
        $id_smt = $this->request->input('id_smt');
        $id_reg_pd = $this->request->input('id_reg_pd');
        $tgl_bayar = $this->request->input('tgl_bayar');
        $nominal = $this->request->input('nominal');
        $kode_pembayaran = $this->request->input('kode_pembayaran');
        $nomor_pin = $this->request->input('nomor_pin');
        $kode_akses = $this->request->input('kode_akses');
        $bill_ref = $this->request->input('bill_ref');
        $flag_by = $this->request->input('flag_by');
        $ket = $this->request->input('ket');

        DB::beginTransaction();
        try {
            $uktmhs = $this->sppmhs->where('id_spp_mhs', $id_spp_mhs)->first();
            if (!$uktmhs) return WrapResponse(['data' => null], 'daftar ukt mahasiswa tidak ditemukan atau tidak terdaftar', FALSE);

            $uktmhs->update([
                'id_kelas_ukt' => $id_kelas_ukt,
                'id_smt' => $id_smt,
                'id_reg_pd' => $id_reg_pd,
                'tgl_bayar' => $tgl_bayar,
                'nominal' => $nominal,
                'kode_pembayaran' => $kode_pembayaran,
                'nomor_pin' => $nomor_pin,
                'kode_akses' => $kode_akses,
                'bill_ref' => $bill_ref,
                'flag_by' => $flag_by,
                'ket' => $ket,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(['data' => null], 'sukses mengubah ukt mahasiswa', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'ukt mahasiswa tidak bisa diubah', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal mengubah ukt mahasiwa', FALSE);
        }
    }

    public function hapus()
    {
        InputValidator([
            'id_spp_mhs' => 'required|uuid'
        ]);

        $creatorId = $updateId = 'fd323761-9f6c-4c75-9ec8-391ab00b63ba';
        $id_spp_mhs = $this->request->input('id_spp_mhs');

        DB::beginTransaction();
        try {
            $uktmhs = $this->sppmhs->where('id_spp_mhs', $id_spp_mhs)->first();
            if (!$uktmhs) return WrapResponse(['data' => null], 'daftar ukt mahasiswa tidak ditemukan atau tidak terdaftar', FALSE);

            $uktmhs->update([
                'soft_delete' => 1,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'last_sync' => currDateTime(),
            ]);

            DB::commit();
            return WrapResponse(['data' => null], 'sukses menghapus ukt mahasiswa', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'ukt mahasiswa tidak bisa dihapus', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menghapus ukt mahasiwa', FALSE);
        }
    }
}
