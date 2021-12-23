@extends('mahasiswa::layouts.master')
@section('title', 'Jadwal dan Kelas')

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
            <div class="col-lg-6 col-7">
              <h6>Kelas & Jadwal</h6>
              <p class="text-sm mb-0">
              </p>
            </div>
            <div class="col-lg-6 col-5 my-auto text-end">
            </div>
          </div>
        </div>
        <div class="card-body px-0 pb-2">
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
                        <button type="button" class="btn btn-info btn-sm dropdown-toggle dropdown-toggle-split m-3" data-bs-toggle="dropdown" aria-expanded="false">
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
                        <button type="button" class="btn btn-info btn-sm dropdown-toggle dropdown-toggle-split m-3" data-bs-toggle="dropdown" aria-expanded="false">
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
                        <button type="button" class="btn btn-info btn-sm dropdown-toggle dropdown-toggle-split m-3" data-bs-toggle="dropdown" aria-expanded="false">
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
