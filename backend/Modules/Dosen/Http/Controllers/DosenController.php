<?php

namespace Modules\Dosen\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Faker\Factory as Faker;
use DataTables;

class DosenController extends Controller
{
    public function index()
    {
        return view('dosen::index');
    }

    public function dashboard()
    {
        return DataTables::of($this->getListMahasiswaBimbingan())->make(true);
    }

    public function getListMahasiswaBimbingan()
    {
        $faker = Faker::create('id_ID');
        $listMahasiswaBimbingan = [
            'nama' => $faker->name,
        ];
        return $listMahasiswaBimbingan;
    }

    public function create()
    {
        return view('dosen::create');
    }

    public function store(Request $request)
    {
        //
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
        //
    }

    public function destroy($id)
    {
        //
    }
}
