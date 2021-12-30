<?php

namespace Modules\Dosen\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DosenJabatanFungsionalController extends Controller
{
    public function index()
    {
        $listJabatanFungsional = $this->listJabatanFungsional();
        return view('dosen::pages.jabatan_fungsional.index-jabatan_fungsional', compact('listJabatanFungsional'));
    }

    public function listJabatanFungsional()
    {
        $list = [];        
        $golongan = [
            'Lektor Kepala (700.00)',
            'Lektor Kepala (400.00)',
            'Lektor Kepala (400.00)',
            'Lektor (300.00)',
            'Lektor (200.00)',
            'Asisten Ahli (150.00)',
            'Asisten Ahli (100.00)',
        ];
        for ($i=0; $i < 5; $i++) { 
            $list[] = [
                'id' => ($i+1),
                'jabatan_fungsional' => $golongan[$i],
                'no_sk' => '1567/J26/KP/2001',
                'tmt' => '06-06-2021'
            ];
        }
        return $list;
    }

    public function create()
    {
        return view('dosen::pages.jabatan_fungsional.add-jabatan_fungsional');
    }

    public function store(Request $request)
    {
    }

    public function show($id)
    {
        return view('dosen::show');
    }

    public function edit($id)
    {
        return view('dosen::edit');
    }

    public function update(Request $request, $id)
    {
    }

    public function destroy($id)
    {
    }
}
