@extends('mahasiswa::components.master')
@section('title', 'Daftar Publikasi')

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
                  Daftar Publikasi
                  <a href="#" class="btn btn-sm btn-round mb-0 me-1 btn-primary"><i class="fa fa-plus text-white"></i>&nbsp;&nbsp;Tambah</a>
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
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">NPM</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jenis Publikasi</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Judul Artikel Ilmiah / HAKI</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pembimbing 1</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Aksi</th>
                </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1</span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> 1717051073 </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> Mizar Zulmi Ramadhan </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> HAKI </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> coffee.id, Platform Jual Beli, Lelang Dan Investasi Panen Kopi Berbasis Web </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> Astria Hijriani, M.Kom. </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> Verifikasi </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                            <button type="button" class="btn btn-info btn-sm mt-3 py-1 px-3"><i class="fa fa-eye text-white"></i></button>
                        </td>
                      </tr>

                </tbody>
            </table>
            </table>
          </div>
        </div>
      </div>
    </div>
</div>
@endsection
