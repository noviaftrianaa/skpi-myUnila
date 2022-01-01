<?php

namespace Modules\Dosen\Http\Controllers;

use DataTables;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DosenInpassingController extends Controller
{
    public function index()
    {
        $listInpassing = $this->listInpassing();
        return view('dosen::pages.inpassing.inpassing',compact('listInpassing'));
    }
    
    public function listInpassing()
    {
        $list = [];        
        $golongan = [
            'Penata',
            'Penata Muda',
            'Juru',
            'Pengatur',
            'Pengatur Tk.1'
        ];
        for ($i=0; $i < 5; $i++) { 
            $list[] = [
                'id' => ($i+1),
                'pangkat' => $golongan[$i],
                'golongan' => 'III/c',
                'no_sk' => '1567/J26/KP/2001',
                'tgl_sk' => '20-05-2001',
                'tmt' => '06-06-2021'
            ];
        }
        return $list;
    }

    public function create()
    {
        return view('dosen::pages.inpassing.add-inpassing');
    }

    public function store(Request $request)
    {
        //
    }

    public function show($id)
    {
        return view('dosen::show');
    }

    public function edit($id = '1')
    {
        return view('dosen::pages.inpassing.edit-inpassing');
    }

    public function update(Request $request, $id)
    {
        //
    }

    public function destroy($id)
    {
        //
    }
}
