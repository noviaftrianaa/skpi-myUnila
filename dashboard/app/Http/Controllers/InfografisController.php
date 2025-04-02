<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pdrd\SatuanPendidikan;
use App\Models\Pdrd\SDM;
use App\Models\Pdrd\PesertaDidik;
use App\Models\Pdrd\Publikasi;
use App\Models\Pdrd\Litabmas;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Collection;

class InfografisController extends Controller
{
    private $id_sp;
    protected $ttl, $namespace;

    public function __construct()
    {
        $this->id_sp = env("APP_ID_SP", "E2B705A7-173E-464A-9FAC-509128709515");
        $this->ttl = 600; //10 menit
        $this->namespace = 'infografis';
    }

	public function index()
	{
		$pageConfigs = ['myLayout' => 'horizontal'];
		$title = [
            'Infografis Dosen',
            'Infografis Mahasiswa',
            'Infografis Publikasi & HAKI',
            'Infografis Penelitian & Pengabdian'
        ];
        $pt = SatuanPendidikan::find($this->id_sp);

		return view('content.pages.infografis.index', [
		'pageConfigs' => $pageConfigs,
		'title' => $title,
        'pt' => $pt
		]);
	}

    public function dosen(Request $request)
    {
        $tahun = $request->tahun ?? get_tahun_keaktifan();
        $cacheKey = $this->namespace . '_dosen_' . $tahun;

        if(Cache::has($cacheKey)) {
            $data = Cache::get($cacheKey);
        } else {
            $data = Cache::remember($cacheKey, $this->ttl, function () use ($tahun) {
                $total_dosen = json_encode(SDM::dashboard_dosen('nomor_induk', $tahun, 'pt', null)->first());
                $total_dosen_jabfung = json_encode(SDM::dashboard_dosen('dosen_jabfung', $tahun, 'pt', null)->first());
                $total_dosen_fakultas = json_encode(SDM::total_dosen_fakultas($tahun));

                return [
                    'total_dosen' => $total_dosen,
                    'total_dosen_jabfung' => $total_dosen_jabfung,
                    'total_dosen_fakultas' => $total_dosen_fakultas
                ];
            });
        }

        return $data;
    }

    public function mahasiswa(Request $request)
    {
        $tahun = $request->tahun ?? get_tahun_keaktifan();
        $cacheKey = $this->namespace . '_mahasiswa_' . $tahun;

        if(Cache::has($cacheKey)) {
            $data = Cache::get($cacheKey);
        } else {
            $data = Cache::remember($cacheKey, $this->ttl, function () use ($tahun) {
                $total_mhs_fakultas = json_encode(PesertaDidik::total_mhs($tahun));
                $total_mhs_jenjang = json_encode(PesertaDidik::total_mhs_jenjang($tahun));

                return [
                    'total_mhs_fakultas' => $total_mhs_fakultas,
                    'total_mhs_jenjang' => $total_mhs_jenjang
                ];
            });
        }

        return $data;
    }

    public function pubHaki(Request $request)
    {
        $tahun = $request->tahun ?? get_tahun_keaktifan();
        $cacheKey = $this->namespace . '_pubhaki_' . $tahun;

        if(Cache::has($cacheKey)) {
            $data = Cache::get($cacheKey);
        } else {
            $data = Cache::remember($cacheKey, $this->ttl, function () use ($tahun) {
                $publikasi = json_encode(Publikasi::total_publikasi($tahun));
                $haki = json_encode(Publikasi::total_haki($tahun));

                return [
                    'publikasi' => $publikasi,
                    'haki' => $haki
                ];
            });
        }

        return $data;
    }

    public function litabmas(Request $request)
    {
        $tahun = $request->tahun ?? get_tahun_keaktifan();
        $cacheKey = $this->namespace . '_litabmas_' . $tahun;

        if(Cache::has($cacheKey)) {
            $data = Cache::get($cacheKey);
        } else {
            $data = Cache::remember($cacheKey, $this->ttl, function () use ($tahun) {
                $penelitian = json_encode(Litabmas::total($tahun, "L"));
                $pengabdian = json_encode(Litabmas::total($tahun, "M"));

                return [
                    'penelitian' => $penelitian,
                    'pengabdian' => $pengabdian
                ];
            });
        }

        return $data;
    }
}
