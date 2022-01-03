@extends('mahasiswa::components.master')
@section('title', 'Status Semester')

@section('css')
<style>
th {
    text-align: center;
}

td {
    text-align: center;
}

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
                 Status Semester
                </h5>
            </div>
        <div class="card-body px-0 pb-2">
          <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Periode</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Smt</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pembayaran</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style="width:50px">SKS</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style="width:50px">IPS</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style="width:50px">Total SKS Lulus</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7" style="width:50px">IPK Lulus</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td id="td_periode" class="text-center text-xs font-weight-bold">2017 Ganjil</td>
                        <td class="text-center text-xs font-weight-bold">1</td>
                        <td class="text-center text-xs font-weight-bold">Aktif</td>
                        <td class="text-center text-xs font-weight-bold">Lunas</td>
                        <td class="text-center text-xs font-weight-bold">23</td>
                        <td class="text-center text-xs font-weight-bold">2.70</td>
                        <td class="text-center text-xs font-weight-bold">23</td>
                        <td class="text-center text-xs font-weight-bold">2.70</td>
                    </tr>
                    <tr>
                        <td>2</td>
                        <td id="td_periode" class="text-center text-xs font-weight-bold">2017 Genap</td>
                        <td class="text-center text-xs font-weight-bold">2</td>
                        <td class="text-center text-xs font-weight-bold">Aktif</td>
                        <td class="text-center text-xs font-weight-bold">Lunas</td>
                        <td class="text-center text-xs font-weight-bold">23</td>
                        <td class="text-center text-xs font-weight-bold">2.52</td>
                        <td class="text-center text-xs font-weight-bold">46</td>
                        <td class="text-center text-xs font-weight-bold">2.61</td>
                    </tr>
                    <tr>
                        <td>3</td>
                        <td id="td_periode" class="text-center text-xs font-weight-bold">2018 Ganjil</td>
                        <td class="text-center text-xs font-weight-bold">3</td>
                        <td class="text-center text-xs font-weight-bold">Aktif</td>
                        <td class="text-center text-xs font-weight-bold">Lunas</td>
                        <td class="text-center text-xs font-weight-bold">21</td>
                        <td class="text-center text-xs font-weight-bold">3.19</td>
                        <td class="text-center text-xs font-weight-bold">67</td>
                        <td class="text-center text-xs font-weight-bold">2.79</td>
                    </tr>
                    <tr>
                        <td>4</td>
                        <td id="td_periode" class="text-center text-xs font-weight-bold">2018 Genap</td>
                        <td class="text-center text-xs font-weight-bold">4</td>
                        <td class="text-center text-xs font-weight-bold">Aktif</td>
                        <td class="text-center text-xs font-weight-bold">Lunas</td>
                        <td class="text-center text-xs font-weight-bold">24</td>
                        <td class="text-center text-xs font-weight-bold">3.13</td>
                        <td class="text-center text-xs font-weight-bold">91</td>
                        <td class="text-center text-xs font-weight-bold">2.88</td>
                    </tr>
                    <tr>
                        <td>5</td>
                        <td id="td_periode" class="text-center text-xs font-weight-bold">2019 Ganjil</td>
                        <td class="text-center text-xs font-weight-bold">5</td>
                        <td class="text-center text-xs font-weight-bold">Aktif</td>
                        <td class="text-center text-xs font-weight-bold">Lunas</td>
                        <td class="text-center text-xs font-weight-bold">21</td>
                        <td class="text-center text-xs font-weight-bold">3.29</td>
                        <td class="text-center text-xs font-weight-bold">112</td>
                        <td class="text-center text-xs font-weight-bold">2.96</td>
                    </tr>
                    <tr>
                        <td>6</td>
                        <td id="td_periode" class="text-center text-xs font-weight-bold">2019 Genap</td>
                        <td class="text-center text-xs font-weight-bold">6</td>
                        <td class="text-center text-xs font-weight-bold">Aktif</td>
                        <td class="text-center text-xs font-weight-bold">Lunas</td>
                        <td class="text-center text-xs font-weight-bold">20</td>
                        <td class="text-center text-xs font-weight-bold">3.08</td>
                        <td class="text-center text-xs font-weight-bold">132</td>
                        <td class="text-center text-xs font-weight-bold">2.97</td>
                    </tr>
                    <tr>
                        <td>7</td>
                        <td id="td_periode" class="text-center text-xs font-weight-bold">2020 Ganjil</td>
                        <td class="text-center text-xs font-weight-bold">7</td>
                        <td class="text-center text-xs font-weight-bold">Aktif</td>
                        <td class="text-center text-xs font-weight-bold">Lunas</td>
                        <td class="text-center text-xs font-weight-bold">12</td>
                        <td class="text-center text-xs font-weight-bold">3.75</td>
                        <td class="text-center text-xs font-weight-bold">144</td>
                        <td class="text-center text-xs font-weight-bold">3.04</td>
                    </tr>
                    <tr>
                        <td>8</td>
                        <td id="td_periode" class="text-center text-xs font-weight-bold">2020 Genap</td>
                        <td class="text-center text-xs font-weight-bold">8</td>
                        <td class="text-center text-xs font-weight-bold">Aktif</td>
                        <td class="text-center text-xs font-weight-bold">Lunas</td>
                        <td class="text-center text-xs font-weight-bold">8</td>
                        <td class="text-center text-xs font-weight-bold">0.75</td>
                        <td class="text-center text-xs font-weight-bold">146</td>
                        <td class="text-center text-xs font-weight-bold">3.04</td>
                    </tr>
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
</div>
@endsection
