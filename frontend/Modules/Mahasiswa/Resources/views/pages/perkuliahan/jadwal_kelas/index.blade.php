@extends('mahasiswa::components.master')
@section('title', 'Jadwal dan Kelas')

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
                  Kelas & Jadwal
                </h5>
            </div>
        </div>
        <div class="card-body px-0 pb-2">
            <div class="mb-2 d-flex justify-content-between align-items-center px-5 mb-3">
                <div class="position-relative"> <span class="position-absolute search"><i class="fa fa-search"></i></span> <input class="form-control w-100" placeholder="Pencarian, mata kuliah..."> </div>
                <div class="px-2"> <div class="dropdown">
                    <button class="btn btn-primary dropdown-toggle mt-3" type="button"
                        id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                        Tahun Ajaran
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        <li><a class="dropdown-item" href="javascript:;">2021/2022 Genap</a></li>
                        <li><a class="dropdown-item" href="javascript:;">2020/2021 Ganjil</a></li>
                        <li><a class="dropdown-item" href="javascript:;">2019/2020 Genap</a></li>
                    </ul>
                </div> </div>
            </div>
          <div class="table-responsive">
            <table class="table align-items-center mb-3">
              <thead>
                <tr>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Mulai</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Selesai</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jenis</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Mata Kuliah</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pengajar</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Ruang</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> 07:30 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> 09:10 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> kuliah </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> COM620112 - SISTEM OPERASI (B) </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> Dr. rer. nat. Akmal Junaidi, S.Si., M.Sc. </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> GIK L1C </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                        <button type="button" class="btn btn-info btn-sm m-3 py-1 px-3 dropdown-toggle dropdown-toggle-split m-3" data-bs-toggle="dropdown" aria-expanded="false">
                          <span class="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark">
                          <li><a class="dropdown-item" href="#">Kontrak Kuliah</a></li>
                          <li><a class="dropdown-item" href="#">Peserta Kelas</a></li>
                          <li><a class="dropdown-item" href="#">Tugas Kuliah</a></li>
                          <li><a class="dropdown-item" href="#">Jadwal Ujian</a></li>
                        </ul>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 2</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> 13:30 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> 15:10 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> Praktikum </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> COM616224 - MULTIMEDIA (B) </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> BAMBANG HERMANTO, S.Kom., M.Cs. </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> GIK L1C </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                        <button type="button" class="btn btn-info btn-sm m-3 py-1 px-3 dropdown-toggle dropdown-toggle-split m-3" data-bs-toggle="dropdown" aria-expanded="false">
                          <span class="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark">
                          <li><a class="dropdown-item" href="#">Kontrak Kuliah</a></li>
                          <li><a class="dropdown-item" href="#">Peserta Kelas</a></li>
                          <li><a class="dropdown-item" href="#">Tugas Kuliah</a></li>
                          <li><a class="dropdown-item" href="#">Jadwal Ujian</a></li>
                        </ul>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 3</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> 15:30 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> 17:00 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> Kuliah </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> UNI617306 - BAHASA INDONESIA (B) </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> SISKA MEIRITA, S.PD., M.PD., M.Pd. </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> ILK11 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                        <button type="button" class="btn btn-info btn-sm m-3 py-1 px-3 dropdown-toggle dropdown-toggle-split m-3" data-bs-toggle="dropdown" aria-expanded="false">
                          <span class="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark">
                          <li><a class="dropdown-item" href="#">Kontrak Kuliah</a></li>
                          <li><a class="dropdown-item" href="#">Peserta Kelas</a></li>
                          <li><a class="dropdown-item" href="#">Tugas Kuliah</a></li>
                          <li><a class="dropdown-item" href="#">Jadwal Ujian</a></li>
                        </ul>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 4</span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> 15:30 </span>
                  </td>
                  <td>
                    <span class="text-xs font-weight-bold"> 17:00 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> Kuliah </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> COM616302 - TEKNOLOGI DAN APLIKASI MOBILE </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> Ardiansyah,, S.Kom., M.Kom. </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                    <span class="text-xs font-weight-bold"> GIK L2 </span>
                  </td>
                  <td class="align-middle text-center text-sm">
                        <button type="button" class="btn btn-info btn-sm m-3 py-1 px-3 dropdown-toggle dropdown-toggle-split m-3" data-bs-toggle="dropdown" aria-expanded="false">
                          <span class="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-dark">
                          <li><a class="dropdown-item" href="#">Kontrak Kuliah</a></li>
                          <li><a class="dropdown-item" href="#">Peserta Kelas</a></li>
                          <li><a class="dropdown-item" href="#">Tugas Kuliah</a></li>
                          <li><a class="dropdown-item" href="#">Jadwal Ujian</a></li>
                        </ul>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
</div>
@endsection
