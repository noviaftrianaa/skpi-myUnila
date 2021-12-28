@extends('mahasiswa::layouts.master')
@section('title', 'Minat & Bakat')

@section('css')
<style>
.search {
    top: 6px;
    left: 10px
}

.form-control {
    border: none;
    padding-left: 32px
}

.form-control:focus {
    border: none;
    box-shadow: none
}

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
                  Jenis Kegiatan
                  <a href="#" class="btn btn-sm btn-round mb-0 me-1 bg-gradient-primary"><i class="fa fa-plus text-white"></i>&nbsp;&nbsp;Tambah</a>
                </h5>
            </div>
        </div>
        <div class="card-body px-0 pb-2">
            <div class="row mt-2 px-5 mb-3">
                    <div class="position-relative">
                    <span class="position-absolute search"><i class="fa fa-search"></i></span>
                    <input class="form-control w-100" placeholder="Pencarian...">
                </div>
            </div>
          <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr role="row">
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jenis Kegiatan</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tingkat Kegiatan</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jabatan</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Bidang</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Aksi</th>
                    </tr>
                    <tr>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">1</td>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">Pengurus Organisasi Intrakampus</td>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">Nasional</td>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">Ketua Bidang/ Koordinator/ Departem</td>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">Bidang Organisasi Dan Kepemimpinan</td>
                        <td class="align-middle text-center text-sm">
                            <button type="button" class="btn btn-danger btn-sm m-3 py-1 px-3 m-3"><i class="fa fa-trash text-white"></i></button>
                        </td>
                    </tr>
                    <tr>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">2</td>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">Lomba/ Kompetisi Yang Diselenggarakan Oleh Belmawa Perorangan</td>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">Internasional</td>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">Peserta Terpilih</td>
                        <td class="align-middle text-center text-sm text-xs font-weight-bold">Minat Bakat, Penalaran dan Kewirausahaan</td>
                        <td class="align-middle text-center text-sm">
                            <button type="button" class="btn btn-danger btn-sm m-3 py-1 px-3 m-3"><i class="fa fa-trash text-white"></i></button>
                        </td>
                    </tr>
                </thead>
            </table>
          </div>
        </div>
      </div>
    </div>
</div>
@endsection
