<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BukuAjarController extends Controller
{
    public function list(Request $request)
    {
        $buku_ajar = DB::select("SELECT tsbuku.id_tulis_buku_ajar, buku.id_buku_ajar, buku.judul_buku, buku.isbn, buku.tgl_terbit, buku.penerbit
        FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
        LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
        WHERE tsbuku.soft_delete = 0");

        return response()->json([
            'success' => true,
            'message' => 'get list all successfully',
            'data'  => $buku_ajar
        ], 200);
    }
    
    public function listById(Request $request)
    {
        $buku_ajar = DB::select("SELECT tsbuku.id_tulis_buku_ajar, buku.id_buku_ajar, buku.judul_buku, buku.isbn, buku.tgl_terbit, buku.penerbit
        FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
        LEFT JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
        WHERE tsbuku.soft_delete = 0 AND tsbuku.id_sdm = ? ", [$request->id_sdm]);

        return response()->json([
            'success' => true,
            'message' => 'get list id successfully',
            'data'  => $buku_ajar
        ], 200);
    }

    public function detail(Request $request)
    {
        $buku_ajar = DB::select("SELECT * FROM pdrd.tulis_buku_ajar AS tsbuku WITH(NOLOCK)
        JOIN ref.kategori_kegiatan AS katgiat WITH(NOLOCK) ON katgiat.id_katgiat = tsbuku.id_katgiat AND katgiat.id_induk_katgiat = katgiat.id_katgiat AND katgiat.expired_date IS NULL
        JOIN pdrd.buku_ajar AS buku WITH(NOLOCK) ON buku.id_buku_ajar = tsbuku.id_buku_ajar AND buku.soft_delete = 0
        LEFT JOIN ref.kategori_capaian_luaran AS kacaplu WITH(NOLOCK) ON kacaplu.id_kat_capaian = buku.id_kat_capaian AND kacaplu.expired_date IS NULL
        LEFT JOIN ref.jenis_bahan_ajar AS jebaj WITH(NOLOCK) ON jebaj.id_jns_bhn_ajar = buku.id_jns_bhn_ajar AND jebaj.expired_date IS NULL
        JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = buku.id_litabmas AND lbms.id_litabmas = lbms.id_lanjutan_litabmas AND lbms.soft_delete = 0
        LEFT JOIN pdrd.lembaga_iptek AS lmip WITH(NOLOCK) ON lmip.id_lemb_iptek = lbms.id_lemb_iptek AND lmip.soft_delete = 0
        LEFT JOIN ref.skim_kegiatan AS skim WITH(NOLOCK) ON skim.id_skim = lbms.id_skim AND skim.expired_date IS NULL
        JOIN ref.tahun_anggaran AS thag WITH(NOLOCK) ON thag.id_tahun_anggaran = lbms.id_thn_usulan AND thag.id_tahun_anggaran = lbms.id_thn_kegiatan AND thag.id_tahun_anggaran = lbms.id_thn_laks AND thag.expired_date IS NULL
        LEFT JOIN ref.kelompok_bidang AS kebid WITH(NOLOCK) ON kebid.id_kel_bidang = lbms.id_kel_bidang AND kebid.expired_date IS NULL
        LEFT JOIN ref.tse AS tse WITH(NOLOCK) ON tse.id_tse = lbms.id_tse AND tse.expired_date IS NULL
        LEFT JOIN pdrd.smi AS smi WITH(NOLOCK) ON smi.id_smi = lbms.id_smi AND smi.soft_delete = 0
        LEFT JOIN ref.jenis_penelitian AS jepel WITH(NOLOCK) ON jepel.id_jns_lit = lbms.id_jns_lit AND jepel.expired_date IS NULL
        JOIN pdrd.sdm AS sdm WITH(NOLOCK) ON sdm.id_sdm = tsbuku.id_sdm AND sdm.soft_delete = 0
        LEFT JOIN ref.negara AS ng WITH(NOLOCK) ON ng.id_negara = sdm.kewarganegaraan AND ng.expired_date IS NULL
        LEFT JOIN ref.jenis_sdm AS jsdm WITH(NOLOCK) ON jsdm.id_jns_sdm = sdm.id_jns_sdm AND jsdm.expired_date IS NULL
        LEFT JOIN ref.wilayah AS wil WITH(NOLOCK) ON wil.id_wil = sdm.id_wil AND wil.expired_date IS NULL
        LEFT JOIN ref.status_keaktifan_pegawai AS aktpgw WITH(NOLOCK) ON aktpgw.id_stat_aktif = sdm.id_stat_aktif AND aktpgw.expired_date IS NULL
        LEFT JOIN ref.agama AS agm WITH(NOLOCK) ON agm.id_agama = sdm.id_agama AND agm.expired_date IS NULL
        LEFT JOIN ref.keahlian_lab AS ahlab WITH(NOLOCK) ON ahlab.id_keahlian_lab = sdm.id_keahlian_lab AND ahlab.expired_date IS NULL
        LEFT JOIN ref.pekerjaan AS pkrj WITH(NOLOCK) ON pkrj.id_pekerjaan = sdm.id_pekerjaan_suami_istri AND pkrj.expired_date IS NULL
        LEFT JOIN ref.lembaga_pengangkat AS lbpgt WITH(NOLOCK) ON lbpgt.id_lemb_angkat = sdm.id_lemb_angkat AND lbpgt.expired_date IS NULL
        JOIN pdrd.non_ca AS nonca WITH(NOLOCK) ON nonca.id_orang = tsbuku.id_orang AND nonca.soft_delete = 0 
        LEFT JOIN ref.negara AS ngnoca WITH(NOLOCK) ON ngnoca.id_negara = nonca.id_negara AND ngnoca.expired_date IS NULL
        JOIN pdrd.peserta_didik AS pd WITH(NOLOCK) ON pd.id_pd = tsbuku.id_pd AND pd.soft_delete = 0
        JOIN ref.jenjang_pendidikan AS jenpdd WITH(NOLOCK) ON jenpdd.id_jenj_didik = pd.id_pendidikan_wali AND jenpdd.id_jenj_didik = pd.id_pendidikan_ayah AND jenpdd.id_jenj_didik = pd.id_pendidikan_ibu AND jenpdd.expired_date IS NULL
        JOIN ref.pekerjaan AS pkrja WITH(NOLOCK) ON pkrja.id_pekerjaan = pd.id_pekerjaan_wali AND pkrja.id_pekerjaan = pd.id_pekerjaan_ayah AND pkrja.id_pekerjaan = pd.id_pekerjaan_ibu AND pkrja.expired_date IS NULL
        JOIN ref.penghasilan AS penghas WITH(NOLOCK) ON penghas.id_penghasilan = pd.id_penghasilan_wali AND penghas.id_penghasilan = pd.id_penghasilan_ayah AND penghas.id_penghasilan = pd.id_penghasilan_ibu AND penghas.expired_date IS NULL
        JOIN ref.kebutuhan_khusus AS kebhus WITH(NOLOCK) ON kebhus.id_kk = pd.id_kk AND kebhus.id_kk = pd.id_kk_ayah AND kebhus.id_kk = pd.id_kk_ibu AND kebhus.expired_date IS NULL
        LEFT JOIN ref.negara AS ngpd WITH(NOLOCK) ON ngpd.id_negara = pd.id_kewarganegaraan AND ngpd.expired_date IS NULL
        LEFT JOIN ref.agama AS agmpd WITH(NOLOCK) ON agmpd.id_agama = pd.id_agama AND agmpd.expired_date IS NULL
        LEFT JOIN ref.wilayah AS wilpd WITH(NOLOCK) ON wilpd.id_wil = pd.id_wil AND wilpd.expired_date IS NULL
        LEFT JOIN dok.large_object AS lobj WITH(NOLOCK) ON lobj.id_blob = pd.id_blob
        LEFT JOIN ref.jenis_tinggal AS jeting WITH(NOLOCK) ON jeting.id_jns_tinggal = pd.id_jns_tinggal AND jeting.expired_date IS NULL
        LEFT JOIN ref.status_mahasiswa AS stmhs WITH(NOLOCK) ON stmhs.id_stat_mhs = pd.id_stat_mhs AND stmhs.expired_date IS NULL
        LEFT JOIN sarpras.alat_transportasi AS trnsprt WITH(NOLOCK) ON trnsprt.id_alat_transport = pd.id_alat_transport
        WHERE tsbuku.soft_delete = 0 ");
        return response()->json([
            'success' => true,
            'message' => 'get detail successfully',
            'data'  => $buku_ajar
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
            DB::update("UPDATE pdrd.buku_ajar SET soft_delete = 0 WHERE id_buku_ajar = ?", [$request->id_buku_ajar]);
            DB::update("UPDATE pdrd.tulis_buku_ajar SET soft_delete = 0 WHERE id_buku_ajar = ?", [$request->id_buku_ajar]);
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
