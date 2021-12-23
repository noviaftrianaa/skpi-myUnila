@extends('stakeholder::layouts.master')

@section('content')
    <h1>Selamat Datang</h1>
{{-- 
    <p>
        This view is loaded from module: {!! config('stakeholder.name') !!}
    </p> --}}
    <div class="container-fluid py-4">
        <div class="row">
          <div class="col-xl-4 col-sm-6 mb-xl-0 mb-4">
            <div class="card">
              <div class="card-body p-4">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">IPK</p>
                      <h5 class="font-weight-bolder mb-0">
                        4.00
                       </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                      <i class="ni ni-world text-lg opacity-10" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-sm-6 mb-xl-0 mb-4">
            <div class="card">
              <div class="card-body p-4">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Tagihan SPP</p>
                      <h5 class="font-weight-bolder mb-0">
                        0
                       </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                      <i class="ni ni-paper-diploma text-lg opacity-10" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-sm-6">
            <div class="card">
              <div class="card-body p-4">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Semester Saat Ini</p>
                      <h5 class="font-weight-bolder mb-0">
                        5
                       </h5>
                    </div>
                </div>
                <div class="col-4 text-end">
                  <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                    <i class="ni ni-paper-diploma text-lg opacity-10" aria-hidden="true"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 mt-4">
          <div class="card mb-4">
            <div class="card-header pb-0 p-3">
              <h6 class="mb-1">Profil Mahasiswa</h6>
              {{-- <p class="text-sm">Architects design houses</p> --}}
            </div>
            <div class="card-body p-3">
              <div class="row">
                <div class="col-xl-3 col-md-6 mb-xl-0 mb-4">
                  <div class="card card-blog card-plain">
                    <div class="position-relative">
                      <a class="d-block shadow-xl border-radius-xl">
                        <img src="../assets/img/Mahasiswa.png" alt="img-blur-shadow" class="img-fluid shadow border-radius-xl">
                      </a>
                    </div>
                        <div class="card-body p-4">
                          <ul class="list-group">
                          <li class="list-group-item border-0 ps-0 pt-0 text-sm"><strong class="text-dark">Nama Mahasiswa:</strong><br> Zuliana Nurfadlillah</li>
                          <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">NPM:</strong><br> 151051048</li>
                          <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">Tempat, tanggal Lahir:</strong><br> 23 Februari 1998</li>
                          <li class="list-group-item border-0 ps-0  text-sm"><strong class="text-dark">Alamat:</strong><br> Jl. Soekarno Hatta</li>
                          <li class="list-group-item border-0 ps-0 pb-0">
                          </li>
                        </ul>
                        </div>
                  </div>
                </div> 
                  
@endsection
