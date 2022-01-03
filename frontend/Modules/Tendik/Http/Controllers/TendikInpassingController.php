<?php

namespace Modules\Tendik\Http\Controllers;

use DataTables;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TendikInpassingController extends Controller
{
    public function index()
    {
        $listInpassing = $this->listInpassing();
        return view('tendik::layouts.profil.inpassing/index',compact('listInpassing'));
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
        return view('tendik::layouts.profil.inpassing/add');
    }

    public function store(Request $request)
    {
        //
    }

    public function show($id)
    {
        return view('tendik::show');
    }

    public function edit($id)
    {
        return view('tendik::edit');
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
