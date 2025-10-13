@extends('mahasiswa::layouts.master')
@section('title', 'Riwayat Studi')

@section('css')
<style>

</style>
@stop

@section('content')
<div class="container-fluid py-4">
<div class="row my-4">
    <div class="col-lg-12 col-md-12 mb-md-0 mb-4">
      <div class="card">
        <div class="card-header pb-0">
            <div class="row">
                <h5 class="card-header d-flex justify-content-between align-items-center">
                  Riwayat Studi
                </h5>
            </div>
        <div class="card-body px-0 pb-2">
            <div class="row mt-2">
                <div class="col-md-3">
                    <select id="periode" name="periode" class="form-control" onchange="goSubmit(this)">
                        <option value="20202" selected="">Kartu Rencana Studi</option>
                        <option value="20201">Kartu Hasil Studi</option>
                        <option value="20192">Transkrip</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <select id="periode" name="periode" class="form-control" onchange="goSubmit(this)">
                        <option value="20211">2021 Ganjil</option>
                        <option value="20202" selected="">2020 Genap</option>
                        <option value="20201">2020 Ganjil</option>
                        <option value="20192">2019 Genap</option>
                        <option value="20191">2019 Ganjil</option>
                        <option value="20182">2018 Genap</option>
                        <option value="20181">2018 Ganjil</option>
                        <option value="20172">2017 Genap</option>
                        <option value="20171">2017 Ganjil</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <a href="#" class="btn btn-info btn-sm btn-round mb-0 me-1"><i class="fa fa-search text-white"></i>&nbsp;&nbsp;Tampilkan</a>
                    <a href="#" class="btn btn-sm btn-round mb-0 me-1 bg-gradient-dark"><i class="fa fa-download text-white"></i>&nbsp;&nbsp;Download</a>
                </div>
            </div>
          <div class="table-responsive">
            <table class="table align-items-center mb-3">
              <thead>
                <tr>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Kode</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Nama Matakuliah</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Smt</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">SKS</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Grade</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nilai Mutu</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> COM616101 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> ALJABAR LINEAR </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 1 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> B </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3,00 </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> COM616102 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> DASAR-DASAR PEMROGRAMAN </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 1 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> A </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 4,00 </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> COM616103 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> BAHASA INGGRIS </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 1 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> B+ </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3,50 </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> COM616104 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> MATEMATIKA </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 1 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> B </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3,00 </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 5</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> COM616106 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> STATISTIKA DAN PROBABILISTAS </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 1 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> B </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3,00 </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 6</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> UNI617101 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> PENDIDIKAN AGAMA ISLAM </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 1 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 3 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> A </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 4,00 </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 7</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> UNI617109 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> PENDIDIKAN ETIKA DAN KEARIFAN LOKAL </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 1 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 2 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> A </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> 4,00 </span>
                  </td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align:right">Total</td>
                    <td class="text-center">24</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                </tr>
                <tr>
                    <td colspan="4" style="text-align:right">Indeks Prestasi Kumulatif</td>
                    <td class="text-center">3,04</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
</div>
@endsection
