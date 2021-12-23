@extends('alumni::layouts.master')

@section('content')

<div class="row">
    <div class="col-md-6 mt-3">
      <div class="card">
        <div class="card-header pb-0 px-3">
          <h6 class="mb-0">Lowongan Kerja</h6>
        </div>
        <div class="card-body pt-4 p-3">
          <ul class="list-group">
            <li class="list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg">
              <div class="d-flex flex-column">
                <h6 class="mb-3 text-sm"><a href="">Community Program and Partnership Specialist</a></h6>
                <span class="mb-2 text-xs">Perusahaan: <span class="text-dark font-weight-bold ms-sm-2">Buka Lapak</span></span>
                <span class="mb-2 text-xs">Alamat: <span class="text-dark ms-sm-2 font-weight-bold">Area DKI Jakarta</span></span>
                <span class="text-xs">Jenis Pekerjaan: <span class="text-dark ms-sm-2 font-weight-bold">Hybrid</span></span>
              </div>
              <div class="ms-auto text-end">
                <div class="avatar avatar-xl position-relative">
                    <img src="../assets/img/bl.png" alt="profile_image" class="w-100 border-radius-lg shadow-sm">
                  </div>
              </div>
            </li>
            <li class="list-group-item border-0 d-flex p-4 mb-2 mt-3 bg-gray-100 border-radius-lg">
                <div class="d-flex flex-column">
                    <h6 class="mb-3 text-sm"><a href="">IT Developer</a></h6>
                    <span class="mb-2 text-xs">Perusahaan: <span class="text-dark font-weight-bold ms-sm-2">PT BANK BCA</span></span>
                    <span class="mb-2 text-xs">Alamat: <span class="text-dark ms-sm-2 font-weight-bold">Jakarta Raya</span></span>
                    <span class="text-xs">Jenis Pekerjaan: <span class="text-dark ms-sm-2 font-weight-bold">On-Site</span></span>
                  </div>
              <div class="ms-auto text-end">
                <div class="avatar avatar-xl position-relative">
                    <img src="../assets/img/bca.jpg" alt="profile_image" class="w-100 border-radius-lg shadow-sm">
                  </div>
              </div>
            </li>
            <li class="list-group-item border-0 d-flex p-4 mb-2 mt-3 bg-gray-100 border-radius-lg">
                <div class="d-flex flex-column">
                    <h6 class="mb-3 text-sm"><a href="">Social Media</a></h6>
                    <span class="mb-2 text-xs">Perusahaan: <span class="text-dark font-weight-bold ms-sm-2">Shopee</span></span>
                    <span class="mb-2 text-xs">Alamat: <span class="text-dark ms-sm-2 font-weight-bold">Jakarta Raya</span></span>
                    <span class="text-xs">Jenis Pekerjaan: <span class="text-dark ms-sm-2 font-weight-bold">On-Site</span></span>
                  </div>
              <div class="ms-auto text-end">
                <div class="avatar avatar-xl position-relative">
                    <img src="../assets/img/shopee.png" alt="profile_image" class="w-100 border-radius-lg shadow-sm">
                  </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="col-md-5 mt-3">
        <div class="card h-50 mb-4">
          <div class="card-header pb-0 px-3">
            <div class="row">
              <div class="col-md-10">
                <h4 >Punya Lowongan Pekerjaan?</h4>
              </div>
              <hr>
            </div>
          </div>
          <div class="card-body pt-4 p-3">
            <ul class="list-group">
              <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                <div class="d-flex align-items-center">
                  <button class="btn btn-icon-only btn-rounded btn-outline-danger mb-0 me-3 btn-sm d-flex align-items-center justify-content-center"><i class="fas fa-arrow-down"></i></button>
                  <div class="d-flex flex-column">
                    <h6 class="mb-1 text-dark text-sm">Pekerjaan Saya</h6>
                   
                  </div>
                </div>
                {{-- <div class="d-flex align-items-center text-danger text-gradient text-sm font-weight-bold">
                  - $ 2,500
                </div> --}}
              </li>
              <li class="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                <div class="d-flex align-items-center">
                  <button class="btn btn-icon-only btn-rounded btn-outline-success mb-0 me-3 btn-sm d-flex align-items-center justify-content-center"><i class="fas fa-arrow-up"></i></button>
                  <div class="d-flex flex-column">
                    <h6 class="mb-1 text-dark text-sm">Status Loker</h6>
                   
                  </div>
                </div>
                {{-- <div class="d-flex align-items-center text-success text-gradient text-sm font-weight-bold">
                  + $ 2,000
                </div> --}}
              </li>
              <div class="col-8 text-end">
                <a class="btn bg-gradient-dark mb-0" href="javascript:;"><i class="fas fa-plus"></i>&nbsp;&nbsp;Tambah Loker</a>
              </div>
            </ul>
          </div>
        </div>
      </div>
    </div>
    {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection
