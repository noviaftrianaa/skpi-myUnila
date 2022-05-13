<?php

namespace App\Http\Controllers\PDUT\Api\Pdrd;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\PDUT\Pdrd\Publikasi;
use App\Models\PDUT\Pdrd\TulisPub;
use Illuminate\Validation\Rule as ValidationRule;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;


class BukuReferensiController extends Controller
{
    protected $request;
    protected $publikasi;
    protected $tulis_pub;

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->publikasi = new Publikasi();
        $this->tulis_pub = new TulisPub();
    }

    public function daftar()
    {
        InputValidator([
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
        ]);

        $sortby = "ASC";
        $sortby = $this->request->input('sortby');

        if (!empty($sortby)) {
            $sortby =$sortby;
        }
      
        try {
        $query = "SELECT
            pub.id_publikasi,
            pub.judul,
            pub.isbn,
            pub.tgl_terbit,
            pub.penerbit,
            pub.create_date,
            pub.last_update
        FROM 
            pdrd.publikasi AS pub WITH(NOLOCK)
        WHERE 
            pub.soft_delete = 0
        ORDER BY   
            pub.judul " . $sortby . " ";
        
        $pagination = CustomPagination($query);
        $query = $pagination['query'];

        $pubs = DB::select($query);
        if(empty($pubs)) {
            return WrapResponse(['data' => null], 'tidak ada daftar buku referensi yang ditampilkan', FALSE);
        }

        $data = [];
        foreach ($pubs as $value) {
            $data[] = [
                'id_publikasi' => $value->id_publikasi,
                'judul' => $value->judul,
                'isbn' => $value->isbn,
                'tanggal_terbit' => $value->tgl_terbit,
                'penerbit' => $value->penerbit,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }
    } catch (\Throwable $th) {
        return WrapResponse(['data' => null], 'gagal mendapatkan daftar buku referensi', FALSE );
    }
        return WrapResponse(['data' => $data], 'Daftar Buku Referensi', TRUE);
    }


    public function daftar_id()
    {
        InputValidator([
            'id_sdm' => 'required|uuid',
            'page' => 'numeric|min:1',
            'count'    => 'numeric|min:1|max:50',
            'sortby' => ['alpha', ValidationRule::in(['ASC', 'asc', 'DESC', 'desc'])]
         ]);

         $sortby = "ASC";
         $sortby = $this->request->input('sortby');
         $id_sdm = $this->request->input('id_sdm');

        if (!empty($sortby)) {
            $sortby = $sortby;
        }
        
        try {
            $query = "SELECT
                tspub.id_sdm,
                pub.id_publikasi,
                pub.judul,
                pub.isbn,
                pub.tgl_terbit,
                pub.penerbit,
                pub.create_date,
                pub.last_update
            FROM 
                pdrd.tulis_pub AS tspub WITH(NOLOCK)
            LEFT JOIN 
                pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
            WHERE tspub.soft_delete = 0 AND tspub.id_sdm = '" . $id_sdm . "' ORDER BY pub.judul " . $sortby . " ";
           
           $pagination = CustomPagination($query);
           $query = $pagination['query'];

           $pubs = DB::select($query);
           if (empty($pubs)) {
               return WrapResponse(['data' => null], 'tidak ada daftar buku referensi yang ditampilkan', FALSE);
           }

        $data = [];
        foreach ($pubs as $value) {
            $data[] = [
                'id_sdm' => $value->id_sdm,
                'id_publikasi' => $value->id_publikasi,
                'judul' => $value->judul,
                'isbn' => $value->isbn,
                'tanggal_terbit' => $value->tgl_terbit,
                'penerbit' => $value->penerbit,
                'waktu_data_ditambahkan' => $value->create_date,
                'terakhir_diubah' => $value->last_update
            ];
        }
    } catch (\Throwable $th) {
        return WrapResponse(['data' => null], 'gagal mendapatkan daftar buku referensi', FALSE);
    }
    return WrapResponse(['data' => $data], 'daftar buku referensi', TRUE);
}


    public function detail()
    {
        InputValidator([
            'id_publikasi' => 'required|uuid'
        ]);

        $id_publikasi = $this->request->input('id_publikasi');

        try {
            $buku_referensi = DB::select("SELECT TOP 1
            pub.id_publikasi, pub.judul, pub.isbn, jepub.nm_jns_pub,pub.penerbit,
           pub.tgl_terbit, lbms.judul_litabmas, kacaplu.nm_kat_capaian
            FROM pdrd.publikasi AS pub WITH(NOLOCK)
            LEFT JOIN pdrd.publikasi AS pub WITH(NOLOCK) ON pub.id_publikasi = tspub.id_publikasi AND pub.soft_delete = 0
            LEFT JOIN ref.jenis_publikasi AS jepub WITH(NOLOCK) ON jepub.id_jns_pub = pub.id_jns_pub AND jepub.expired_date IS NULL
            LEFT JOIN pdrd.litabmas AS lbms WITH(NOLOCK) ON lbms.id_litabmas = pub.id_litabmas AND lbms.soft_delete = 0
            LEFT JOIN ref.kategori_capaian_luaran AS kacaplu WITH(NOLOCK) ON kacaplu.id_kat_capaian = pub.id_kat_capaian AND kacaplu.expired_date IS NULL
            WHERE pub.soft_delete = 0 AND pub.id_publikasi = ? ", [$id_publikasi]);

            if (empty($publikasi)){
                return WrapResponse(array('data' => array('id_publikasi' => $id_publikasi)), 'detail buku referensi tidak ditemukan', TRUE);
            }

            $buku_referensi_sdm = DB::select("SELECT
            sdm.id_sdm,
            sdm.nm_sdm,
            tspub.urutan2,
            tspub.afiliasi,
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.sdm AS sdm ON sdm.id_sdm = tspub.id_sdm
            WHERE tspub.id_publikasi = ?
            ORDER BY tspub.urutan2 ASC", [$id_publikasi]);

            if (empty($buku_referensi_sdm)) {
                $buku_referensi_sdm = [];
            }

            $buku_referensi_pd = DB::select("SELECT
            pd.id_pd,
            pd.nm_pd,
            tspub.urutan2,
            tspub.afiliasi,
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.peserta_didik AS pd ON pd.id_pd = tspub.id_pd
            WHERE tspub.id_publikasi = ?
            ORDER BY tspub.urutan2 ASC", [$id_publikasi]);

            if (empty($buku_referensi_pd)) {
                $buku_referensi_pd = [];
            }

            $buku_referensi_nonca = DB::select("SELECT
            nonca.id_orang,
            nonca.nm_orang,
            tspub.urutan2,
            tspub.afiliasi,
            tspub.peran_tulis
            FROM pdrd.tulis_pub AS tspub
            JOIN pdrd.non_ca AS nonca ON nonca.id_orang = tspub.id_orang
            WHERE tspub.id_publikasi = ?
            ORDER BY tspub.urutan2 ASC", [$id_publikasi]);

            if (empty($buku_referensi_nonca)) {
                $buku_referensi_nonca = [];
            }

            $buku_referensi_dok = DB::select("SELECT
            dok_dokumen.nm_dok AS nama_dok,
            dok_dokumen.file_name AS nama_file,
            dok_dokumen.media_type AS jenis_file,
            dok_pub.create_date AS tanggal_upload,
            refj_dokumen.nm_jns_dok AS jenis_dokumen
            FROM pdrd.publikasi AS pub
            JOIN dok.dok_pub AS dok_pub ON dok_pub.id_publikasi = pub.id_publikasi
            AND dok_pub.soft_delete = 0
            LEFT JOIN dok.dokumen AS dok_dokumen ON dok_dokumen.id_dok = dok_pub.id_dok
            AND dok_dokumen.soft_delete = 0
            LEFT JOIN ref.jenis_dokumen AS refj_dokumen ON refj_dokumen.id_jns_dok = dok_dokumen.id_jns_dok
            AND refj_dokumen.expired_date IS NULL
            WHERE pub.id_publikasi = ? AND pub.soft_delete = 0", [$id_publikasi]);

            if (empty($buku_referensi_dok)) {
                $buku_referensi_dok = [];
            }

            
            foreach ($buku_referensi as $each_data) {
                $data[] = [
                    'id_publikasi' => $each_data->id_publikasi,
                    'judul' => $each_data->judul,
                    'isbn' => $each_data->isbn,
                    'jenis_publikasi' => $each_data->nm_jns_pub,
                    'nama_penerbit' => $each_data->penerbit,
                    'tanggal_terbit' => $each_data->tgl_terbit,
                    'kategori_capaian' => $each_data->nm_kat_capaian,
                    'judul_litabmas' => $each_data->judul_litabmas,
                    'penulis_dosen' =>  $buku_referensi_sdm,
                    'penulis_mahasiswa' =>  $buku_referensi_pd,
                    'penulis_lain' =>  $buku_referensi_nonca,
                    'dokumen' =>  $buku_referensi_dok
                ];
            }
        } catch (\Throwable $th) {
            return WrapResponse(['data' => null], 'Tidak Dapat Menampilkan Detail Buku Referensi', FALSE);
        }
        return WrapResponse(['data' => $data], 'Detail Buku Referensi', TRUE);
    }


    public function tambah()
    {
        InputValidator([
            'id_litabmas' => 'required|uuid',
            'judul' => 'required',
            'penerbit' => 'required',
            'isbn' => 'required',
            'tgl_terbit' => 'required|date',
            'urutan_dosen.*' => 'nullable|numeric',
            'afiliasi_dosen.*' => 'nullable',
            'peran_tulis_dosen.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_dosen.*' => 'nullable|numeric',
            'urutan_mahasiswa.*' => 'nullable|numeric',
            'afiliasi_mahasiswa.*' => 'nullable',
            'peran_tulis_mahasiswa.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_mahasiswa.*' => 'nullable|numeric',
            'nm_pd_mahasiswa.*' => 'nullable',
            'nipd_mahasiswa.*' => 'nullable',
            'urutan_orang.*' => 'nullable|numeric',
            'afiliasi_orang.*' => 'nullable',
            'peran_tulis_orang.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_orang.*' => 'nullable|numeric'
        ]);

        $id_publikasi = guid();
        $id_katgiat = 120102;
        $creatorId = $updateId = '26004417-6e92-463c-bf35-f741817121dc';
        $id_jns_pub = 1;
        $id_kat_capaian = 5;

        $id_litabmas = $this->request->input('id_litabmas');
        $judul = $this->request->input('judul');
        $penerbit = $this->request->input('penerbit');
        $isbn = $this->request->input('isbn');
        $tgl_terbit = $this->request->input('tgl_terbit');
       

        $id_dosen = $this->request->input('id_dosen');
        $urutan_dosen = $this->request->input('urutan_dosen');
        $afiliasi_dosen = $this->request->input('afiliasi_dosen');
        $peran_tulis_dosen = $this->request->input('peran_tulis_dosen');
        $jns_penulis_dosen = $this->request->input('jns_penulis_dosen');

        $id_mahasiswa = $this->request->input('id_mahasiswa');
        $urutan_mahasiswa = $this->request->input('urutan_mahasiswa');
        $afiliasi_mahasiswa = $this->request->input('afiliasi_mahasiswa');
        $peran_tulis_mahasiswa = $this->request->input('peran_tulis_mahasiswa');
        $jns_penulis_mahasiswa = $this->request->input('jns_penulis_mahasiswa');
        $nm_pd_mahasiswa = $this->request->input('nm_pd_mahasiswa');
        $nipd_mahasiswa = $this->request->input('nipd_mahasiswa');

        $id_orang = $this->request->input('id_orang');
        $urutan_orang = $this->request->input('urutan_orang');
        $afiliasi_orang = $this->request->input('afiliasi_orang');
        $peran_tulis_orang = $this->request->input('peran_tulis_orang');
        $jns_penulis_orang = $this->request->input('jns_penulis_orang');

        DB::beginTransaction();
        try {
            $this->publikasi->create([
                'id_publikasi' => $id_publikasi,
                'id_kat_capaian' => $id_kat_capaian,
                'id_jns_pub' => $id_jns_pub,
                'id_litabmas' => $id_litabmas,
                'judul' => $judul,
                'penerbit' => $penerbit,
                'isbn' => $isbn,
                'tgl_terbit' => $tgl_terbit,
                'create_date' => currDateTime(),
                'id_creator' => $creatorId,
                'last_update' => currDateTime(),
                'id_updater' => $updateId,
                'soft_delete' => 0,
                'last_sync' => currDateTime(),
            ]);

            if (!empty($id_dosen)) {
                foreach ($id_dosen as $index => $iddsn) {
                    if (is_null($iddsn)) break;
                    $this->tulis_pub->create([
                        'id_tulis_pub' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_publikasi' => $id_publikasi,
                        'id_sdm' => $iddsn,
                        'id_pd' => NULL,
                        'id_orang' => NULL,
                        'urutan2' => $urutan_dosen[$index],
                        'afiliasi' => $afiliasi_dosen[$index],
                        'peran_tulis' => $peran_tulis_dosen[$index],
                        'jns_penulis' => $jns_penulis_dosen[$index],
                        'nm_pd' => NULL,
                        'nipd' => NULL,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }

            if (!empty($id_mahasiswa)) {
                foreach ($id_mahasiswa as $index => $idmhs) {
                    if (is_null($idmhs)) break;
                    $this->tulis_pub->create([
                        'id_tulis_pub' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_publikasi' => $id_publikasi,
                        'id_sdm' => NULL,
                        'id_pd' => $idmhs,
                        'id_orang' => NULL,
                        'urutan2' => $urutan_mahasiswa[$index],
                        'afiliasi' => $afiliasi_mahasiswa[$index],
                        'peran_tulis' => $peran_tulis_mahasiswa[$index],
                        'jns_penulis' => $jns_penulis_mahasiswa[$index],
                        'nm_pd' => $nm_pd_mahasiswa[$index],
                        'nipd' => $nipd_mahasiswa[$index],
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }

            if (!empty($id_orang)) {
                foreach ($id_orang as $index => $idorg) {
                    if (is_null($idorg)) break;
                    $this->tulis_pub->create([
                        'id_tulis_pub' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_publikasi' => $id_publikasi,
                        'id_sdm' => NULL,
                        'id_pd' => NULL,
                        'id_orang' => $id_orang[$index],
                        'urutan2' => $urutan_orang[$index],
                        'afiliasi' => $afiliasi_orang[$index],
                        'peran_tulis' => $peran_tulis_orang[$index],
                        'jns_penulis' => $jns_penulis_orang[$index],
                        'nm_pd' => NULL,
                        'nipd' => NULL,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }

            DB::commit();
            return WrapResponse(array('data' => array('id_publikasi' => $id_publikasi)), 'sukses menambahkan buku referensi', TRUE);
        } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'buku referensi tidak dapat ditambahkan', FALSE);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'gagal menambahkan buku referensi', FALSE);
        }
    }

    public function ubah()
    {
        InputValidator([
            'id_publikasi' => 'required|uuid',
            'id_litabmas' => 'required|uuid',
            'judul' => 'required',
            'penerbit' => 'required',
            'isbn' => 'required',
            'tgl_terbit' => 'required|date',
            'urutan_dosen.*' => 'nullable|numeric',
            'afiliasi_dosen.*' => 'nullable',
            'peran_tulis_dosen.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_dosen.*' => 'nullable|numeric',
            'urutan_mahasiswa.*' => 'nullable|numeric',
            'afiliasi_mahasiswa.*' => 'nullable',
            'peran_tulis_mahasiswa.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_mahasiswa.*' => 'nullable|numeric',
            'nm_pd_mahasiswa.*' => 'nullable',
            'nipd_mahasiswa.*' => 'nullable',
            'urutan_orang.*' => 'nullable|numeric',
            'afiliasi_orang.*' => 'nullable',
            'peran_tulis_orang.*' => ['nullable', ValidationRule::in(['A', 'B', 'C', 'D'])],
            'jns_penulis_orang.*' => 'nullable|numeric'
        ]);

        $id_katgiat = 120102;
        $creatorId = $updateId = '26004417-6e92-463c-bf35-f741817121dc';

        $id_publikasi = $this->request->input('id_publikasi');
        $id_litabmas = $this->request->input('id_litabmas');
        $judul = $this->request->input('judul');
        $penerbit = $this->request->input('penerbit');
        $isbn = $this->request->input('isbn');
        $tgl_terbit = $this->request->input('tgl_terbit');
      

        $id_dosen = $this->request->input('id_dosen');
        $urutan_dosen = $this->request->input('urutan_dosen');
        $afiliasi_dosen = $this->request->input('afiliasi_dosen');
        $peran_tulis_dosen = $this->request->input('peran_tulis_dosen');
        $jns_penulis_dosen = $this->request->input('jns_penulis_dosen');

        $id_mahasiswa = $this->request->input('id_mahasiswa');
        $urutan_mahasiswa = $this->request->input('urutan_mahasiswa');
        $afiliasi_mahasiswa = $this->request->input('afiliasi_mahasiswa');
        $peran_tulis_mahasiswa = $this->request->input('peran_tulis_mahasiswa');
        $jns_penulis_mahasiswa = $this->request->input('jns_penulis_mahasiswa');
        $nm_pd_mahasiswa = $this->request->input('nm_pd_mahasiswa');
        $nipd_mahasiswa = $this->request->input('nipd_mahasiswa');

        $id_orang = $this->request->input('id_orang');
        $urutan_orang = $this->request->input('urutan_orang');
        $afiliasi_orang = $this->request->input('afiliasi_orang');
        $peran_tulis_orang = $this->request->input('peran_tulis_orang');
        $jns_penulis_orang = $this->request->input('jns_penulis_orang');

        DB::beginTransaction();
        try {
            $publikasi = $this->publikasi->where('id_publikasi', $id_publikasi)->first();
            if (!$publikasi) return WrapResponse(['data' => null], 'buku referensi tidak ditemukan atau tidak terdaftar', FALSE);

            $publikasi->update([
                'id_litabmas' => $id_litabmas,
                'judul' => $judul,
                'penerbit' => $penerbit,
                'isbn' => $isbn,
                'tgl_terbit' => $tgl_terbit,
                'last_update' => currDateTime(),
                'id_updater' => $updateId
            ]);

            $penulis_x = $this->tulis_pub->where('id_publikasi', $id_publikasi)->delete();
            if ($penulis_x) :

            if (!empty($id_dosen)) {
                foreach ($id_dosen as $index => $iddsn) {
                    if (is_null($iddsn)) break;
                    $this->tulis_pub->create([
                        'id_tulis_pub' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_publikasi' => $id_publikasi,
                        'id_sdm' => $iddsn,
                        'id_pd' => NULL,
                        'id_orang' => NULL,
                        'urutan2' => $urutan_dosen[$index],
                        'afiliasi' => $afiliasi_dosen[$index],
                        'peran_tulis' => $peran_tulis_dosen[$index],
                        'jns_penulis' => $jns_penulis_dosen[$index],
                        'nm_pd' => NULL,
                        'nipd' => NULL,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }

            if (!empty($id_mahasiswa)) {
                foreach ($id_mahasiswa as $index => $idmhs) {
                    if (is_null($idmhs)) break;
                    $this->tulis_pub->create([
                        'id_tulis_pub' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_publikasi' => $id_publikasi,
                        'id_sdm' => NULL,
                        'id_pd' => $idmhs,
                        'id_orang' => NULL,
                        'urutan2' => $urutan_mahasiswa[$index],
                        'afiliasi' => $afiliasi_mahasiswa[$index],
                        'peran_tulis' => $peran_tulis_mahasiswa[$index],
                        'jns_penulis' => $jns_penulis_mahasiswa[$index],
                        'nm_pd' => $nm_pd_mahasiswa[$index],
                        'nipd' => $nipd_mahasiswa[$index],
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }

            if (!empty($id_orang)) {
                foreach ($id_orang as $index => $idorg) {
                    if (is_null($idorg)) break;
                    $this->tulis_pub->create([
                        'id_tulis_pub' => guid(),
                        'id_katgiat' => $id_katgiat,
                        'id_publikasi' => $id_publikasi,
                        'id_sdm' => NULL,
                        'id_pd' => NULL,
                        'id_orang' => $id_orang[$index],
                        'urutan2' => $urutan_orang[$index],
                        'afiliasi' => $afiliasi_orang[$index],
                        'peran_tulis' => $peran_tulis_orang[$index],
                        'jns_penulis' => $jns_penulis_orang[$index],
                        'nm_pd' => NULL,
                        'nipd' => NULL,
                        'create_date' => currDateTime(),
                        'id_creator' => $creatorId,
                        'last_update' => currDateTime(),
                        'id_updater' => $updateId,
                        'soft_delete' => 0,
                        'last_sync' => currDateTime()
                    ]);
                }
            }
        endif;

            DB::commit();
            return WrapResponse(array('data' => array('id_publikasi' => $id_publikasi)), 'Buku Referensi Berhasil Diubah', TRUE);
       } catch (ModelNotFoundException $mnfe) {
            DB::rollBack();
            Log::error($mnfe->getMessage() . ' - ' . $mnfe->getModel() . ' - ' . $mnfe->getIds());
            return WrapResponse(['data' => null], 'buku referensi tidak dapat diubah', FALSE);
        } catch (Exception $e) {
            DB::rollback();
            Log::error($e->getMessage() . ' on line ' . $e->getLine());
            return WrapResponse(['data' => null], 'Buku Referensi Gagal Diubah', FALSE);
        }
    }


    public function hapus()
    {
        $creatorId = $updateId = '26004417-6e92-463c-bf35-f741817121dc';
        $id_publikasi = $this->request->input('id_publikasi');

        InputValidator([
            'id_publikasi' => 'required|uuid'
        ]);

        DB::beginTransaction();
        try {
            $this->publikasi->where('id_publikasi', $id_publikasi)->update([
                'soft_delete' => 1,
                'last_update' => currDateTime(),
                'id_updater' => $updateId
            ]);
            $this->tulis_pub->where('id_publikasi', $id_publikasi)->update([
                'soft_delete' => 1,
                'last_update' => currDateTime(),
                'id_updater' => $updateId
            ]);

            DB::commit();
            return WrapResponse(array('data' => array('id_publikasi' => $id_publikasi)), 'Buku Referensi Berhasil Dihapus', TRUE);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Error on ' . $e->getMessage() . ' in line ' . $e->getLine());
            return WrapResponse(['data' => null], 'Buku Referensi Gagal Dihapus', FALSE);
        }
    }
}
