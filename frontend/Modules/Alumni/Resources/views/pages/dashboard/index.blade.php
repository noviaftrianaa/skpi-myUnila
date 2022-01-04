@extends('alumni::layouts.master')

@section('content')
    <div class="container-fluid py-4">
        <div class="row">
          <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div class="card">
              <div class="card-body p-3">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">IPK</p>
                      <h5 class="font-weight-bolder mb-0">
                       3.67
                      </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape btn-danger shadow text-center border-radius-md">
                      <i class="fas fa-ribbon text-lg opacity-10" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div class="card">
              <div class="card-body p-3">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Total Semester </p>
                      <h5 class="font-weight-bolder mb-0">
                       11
                      </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape btn-warning shadow text-center border-radius-md">
                      <i class="fas fa-bookmark text-lg opacity-10" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div class="card">
              <div class="card-body p-3">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Total SKS</p>
                      <h5 class="font-weight-bolder mb-0">
                        149
                      </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape btn-success shadow text-center border-radius-md">
                      <i class="fas fa-list text-lg opacity-10" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div> 
          <div class="col-xl-3 col-sm-6">
            <div class="card">
              <div class="card-body p-3">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Alumni Prodi</p>
                      <h6 class="font-weight-bolder mb-0">
                        T.Informatika
                        <span class="text-success text-sm font-weight-bolder"></span>
                      </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                      <i class="fas fa-graduation-cap text-lg opacity-10" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style="width: 50%; float:left">
        <div class="container-fluid">
          <div class="page-header min-height-100 border-radius-xl mt-4" style="background-image: url('../assets/img/curved-images/curved0.jpg'); background-position-y: 50%;">
            <span class="mask bg-gradient-primary opacity-6"></span>
          </div>
          <div class="card card-body blur shadow-blur mx-4 mt-n6 overflow-hidden">
            <div class="row gx-3">
              <div class="col-auto">
                <div class="avatar avatar-xl position-relative">
                  <img src="../assets/img/ily.jpeg" alt="profile_image" class="w-100 border-radius-lg shadow-sm">
                </div>
              </div>
              <div class="col-auto my-auto">
                <div class="h-80">
                  <h5 class="mb-1">
                    Aprily Ayu Anbar, S.T.
                  </h5>
                  <p class="mb-0 font-weight-bold text-sm">
                    Web Developer
                  </p>
                </div>
              </div>
          
         
        <div class="container-fluid py-4">
          <div class="row">
            <div class="col-12 mt-4">
              <div class="card h-100">
                <div class="card-header pb-0 p-3">
                  <div class="row">
                    <div class="col-md-8 d-flex align-items-center">
                      <h6 class="mb-0">Informasi Singkat</h6>
                    </div>
                    <div class="col-md-4 text-end">
                      <a href="{{url('alumni/edit-profil')}}">
                        <i class="fas fa-user-edit text-secondary text-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Ubah Profil"></i>
                      </a>
                      |
                      <a href="{{url('alumni/print_cv')}}" target="_blank">
                        <i class="fas fa-download text-secondary text-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Cetak CV"></i>
                      </a>
                    </div>
                  </div>
                </div>
               <div class="card-body p-3">
                  <p class="text-sm">
                    Web Developer Staff di UPT TIK Universitas Lampung 
                  </p>
                 
                  <ul class="list-group">
                    <table>
                      <thead>
                        <tr>
                          <th>NPM</th>
                          <td>:</td>
                          <td>1515061005</td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th>Angkatan</th>
                          <td>:</td>
                          <td>2015</td>
                        </tr>
                        <tr>
                          <th>Tanggal Masuk</th>
                          <td>:</td>
                          <td>24 Agustus 2015</td>
                        </tr>
                        <tr>
                          <th>Tanggal Lulus</th>
                          <td>:</td>
                          <td>13 November 2020</td>
                        </tr>
                        <tr>
                          <th>IPK</th>
                          <td>:</td>
                          <td>3.67</td>
                        </tr>
                        <tr>
                          <th>Sosial Media:</th>
                          <td>:</td>
                          <td>
                            <a class="btn btn-facebook btn-simple mb-0 ps-1 pe-2 py-0" href="javascript:;">
                            <i class="fab fa-facebook fa-lg"></i>
                          </a>
                          <a class="btn btn-twitter btn-simple mb-0 ps-1 pe-2 py-0" href="javascript:;">
                            <i class="fab fa-twitter fa-lg"></i>
                          </a>
                          <a class="btn btn-instagram btn-simple mb-0 ps-1 pe-2 py-0" href="javascript:;">
                            <i class="fab fa-instagram fa-lg"></i>
                          </a>
                        </td>
                        </tr>
                      </tbody>
                      </table>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    <div style="width: 50%; float:right">
      <div class="container-fluid">
        <div class="page-header min-height-100 border-radius-xl mt-4" style="background-image: url('../assets/img/curved-images/curved0.jpg'); background-position-y: 50%;">
          <span class="mask bg-gradient-primary opacity-6"></span>
        </div>
        <div class="card card-body blur shadow-blur mx-4 mt-n6 overflow-hidden">
      {{-- <div class="container-fluid py-4"> --}}
        <div class="row">
          <div class="col-12 mt-4">
            <div class="card h-100">
              <div class="card-header pb-0 p-3">
                <div class="row">
                  <div class="col-md-8 d-flex align-items-center">
                    <h6 class="mb-0">Riwayat Pekerjaan</h6>
                  </div>
                  <div class="col-md-4 text-end">
                    <a href="{{url('alumni/detail-pekerjaan')}}">
                      <i class="fas fa-eye text-secondary text-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Detail"></i>
                    </a>
                  </div>
                </div>
              </div>
              <hr>
              <div class="timeline timeline-one-side">
                <div class="timeline-block mb-3">
                  <span class="timeline-step">
                    <i class="ni ni-building text-warning text-gradient"></i>
                  </span>
                  <div class="timeline-content">
                    <h6 class="text-dark text-sm font-weight-bold mb-0">UPT TIK UNILA</h6>
                    <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">November 2021-Sekarang</p>
                  </div>
                </div>
                <div class="timeline-block mb-3">
                  <span class="timeline-step">
                      <i class="ni ni-building text-primary text-gradient"></i>
                  </span>
                  <div class="timeline-content">
                    <h6 class="text-dark text-sm font-weight-bold mb-0">The Summit Bistro
                    </h6>
                    <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">Februari 2021 - November2021</p>
                  </div>
                </div>
                <div class="timeline-block mb-3">
                  <span class="timeline-step">
                      <i class="ni ni-building text-success text-gradient"></i>
                  </span>
                  <div class="timeline-content">
                      <h6 class="text-dark text-sm font-weight-bold mb-0">After Beaute, PT. Mega Irianto Indonesia, 
                        <br>IT Support</h6>
                      <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">Januari 2021 - Februari 2021</p>
                    </div>
                </div>
                <div class="timeline-block mb-3">
                  <span class="timeline-step">
                      <i class="ni ni-building text-primary text-gradient"></i>
                  </span>
                  <div class="timeline-content">
                      <h6 class="text-dark text-sm font-weight-bold mb-0">PT. Angkasa Pura II (persero) cabang 601, IT staff
                      </h6>
                      <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">Februari 2018 - Maret 2018</p>
                    </div>
                </div>
                <div class="timeline-block mb-3">
                  <span class="timeline-step">
                      <i class="ni ni-building text-warning text-gradient"></i>
                  </span>
                  <div class="timeline-content">
                      <h6 class="text-dark text-sm font-weight-bold mb-0">MooMooBee</h6>
                      <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">Januar 2016 - Juni 2020</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
          {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection
