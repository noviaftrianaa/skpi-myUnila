@extends('alumni::layouts.master')

@section('content')
    <h1>Selamat Datang </h1>
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
                        <span class="text-success text-sm font-weight-bolder"></span>
                      </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                      <i class="ni ni-money-coins text-lg opacity-10" aria-hidden="true"></i>
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
                        <span class="text-success text-sm font-weight-bolder"></span>
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
          <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div class="card">
              <div class="card-body p-3">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Total SKS</p>
                      <h5 class="font-weight-bolder mb-0">
                        149
                        <span class="text-danger text-sm font-weight-bolder"></span>
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
          <div class="col-xl-3 col-sm-6">
            <div class="card">
              <div class="card-body p-3">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Alumni</p>
                      <h5 class="font-weight-bolder mb-0">
                        
                        <span class="text-success text-sm font-weight-bolder"></span>
                      </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                      <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="container-fluid">
          <div class="page-header min-height-100 border-radius-xl mt-4" style="background-image: url('../assets/img/curved-images/curved0.jpg'); background-position-y: 50%;">
            <span class="mask bg-gradient-primary opacity-6"></span>
          </div>
          <div class="card card-body blur shadow-blur mx-4 mt-n6 overflow-hidden">
            <div class="row gx-4">
              <div class="col-auto">
                <div class="avatar avatar-xl position-relative">
                  <img src="../assets/img/ily.jpeg" alt="profile_image" class="w-100 border-radius-lg shadow-sm">
                </div>
              </div>
              <div class="col-auto my-auto">
                <div class="h-100">
                  <h5 class="mb-1">
                    Aprily Ayu Anbar
                  </h5>
                  <p class="mb-0 font-weight-bold text-sm">
                    Web Developer
                  </p>
                </div>
              </div>
             
            </div>
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
                      <a href="javascript:;">
                        <i class="fas fa-user-edit text-secondary text-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Edit Profile"></i>
                      </a>
                    </div>
                  </div>
                </div>
                <div class="card-body p-3">
                  <p class="text-sm">
                    Hai, saya Aprily lahir di Bandar Lampung pada tanggal 22 April 1997. Suka browsing dan traveling. 
                  </p>
                  <hr class="horizontal gray-light my-4">
                  <ul class="list-group">
                    <li class="list-group-item border-0 ps-0 pt-0 text-sm"><strong class="text-dark">NPM:</strong> &nbsp; 1515061005</li>
                    <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">Angkatan:</strong> &nbsp; 2015</li>
                    <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">Tanggal Masuk:</strong> &nbsp; 24 Agustus 2015</li>
                    <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">Tanggal Lulus:</strong> &nbsp; 13 November 2020</li>
                    <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">IPK Terakhir</strong> &nbsp; 3.67</li>
                    <li class="list-group-item border-0 ps-0 pb-0">
                      <strong class="text-dark text-sm">Social:</strong> &nbsp;
                      <a class="btn btn-facebook btn-simple mb-0 ps-1 pe-2 py-0" href="javascript:;">
                        <i class="fab fa-facebook fa-lg"></i>
                      </a>
                      <a class="btn btn-twitter btn-simple mb-0 ps-1 pe-2 py-0" href="javascript:;">
                        <i class="fab fa-twitter fa-lg"></i>
                      </a>
                      <a class="btn btn-instagram btn-simple mb-0 ps-1 pe-2 py-0" href="javascript:;">
                        <i class="fab fa-instagram fa-lg"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
       
          {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection
