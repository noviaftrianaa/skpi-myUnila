@extends('layouts/layoutMaster')

@section('title', 'Indikator Kinerja Utama - IKU 1 Universitas Lampung')

@section('vendor-style')
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/bs-stepper/bs-stepper.css')}}" />
<link rel="stylesheet" href="{{asset('assets/vendor/libs/flatpickr/flatpickr.css')}}" />
<!-- Row Group CSS -->
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-rowgroup-bs5/rowgroup.bootstrap5.css')}}">
<!-- Form Validation -->
<link rel="stylesheet" href="{{asset('assets/vendor/libs/@form-validation/umd/styles/index.min.css')}}" />
@endsection

@section('vendor-script')
<script src="{{asset('assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js')}}"></script>
<!-- Flat Picker -->
<script src="{{asset('assets/vendor/libs/moment/moment.js')}}"></script>
<script src="{{asset('assets/vendor/libs/flatpickr/flatpickr.js')}}"></script>
<!-- Form Validation -->
<script src="{{asset('assets/vendor/libs/select2/select2.js')}}"></script>
<script src="{{asset('assets/vendor/libs/@form-validation/umd/bundle/popular.min.js')}}"></script>
<script src="{{asset('assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js')}}"></script>
<script src="{{asset('assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js')}}"></script>
<script src="{{asset('assets/vendor/libs/cleavejs/cleave.js')}}"></script>
<script src="{{asset('assets/vendor/libs/cleavejs/cleave-phone.js')}}"></script>
@endsection

@section('page-script')
  @include('content.main.iku.iku-1.function')
@endsection

@section('content')
<h4>
  Indikator Kinerja Utama
</h4>

<div class="row">
 <div class="col-md-12">
  <!-- Vertical Wizard -->
  <div class="col-12 mb-4">
    <div class="bs-stepper wizard-vertical vertical mt-2">
      <div class="bs-stepper-header">
        <div class="step crossed" data-target="#account-details-1">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">1</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 1</span>
              <span class="bs-stepper-subtitle">Lulusan Mendapat Pekerjaan yang Layak</span>
            </span>
          </button>
        </div>
        <div class="line"></div>
        <div class="step" data-target="#account-details-1">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">2</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 2</span>
              <span class="bs-stepper-subtitle">Mahasiswa MBKM / prestasi</span>
            </span>
          </button>
        </div>
        <div class="line"></div>
        <div class="step" data-target="#account-details-1">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">3</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 3</span>
              <span class="bs-stepper-subtitle">Dosen di luar kampus</span>
            </span>
          </button>
        </div>
        <div class="line"></div>
        <div class="step" data-target="#account-details-1">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">4</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 4</span>
              <span class="bs-stepper-subtitle">Kualifikasi dosen/pengajar</span>
            </span>
          </button>
        </div>
        <div class="line"></div>
        <div class="step" data-target="#account-details-1">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">5</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 5</span>
              <span class="bs-stepper-subtitle">Penerapan karya dosen</span>
            </span>
          </button>
        </div>
        <div class="line"></div>
        <div class="step" data-target="#account-details-1">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">6</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 6</span>
              <span class="bs-stepper-subtitle">Kemitraan program studi</span>
            </span>
          </button>
        </div>
        <div class="line"></div>
        <div class="step" data-target="#account-details-1">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">7</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 7</span>
              <span class="bs-stepper-subtitle">Pembelajaran dalam kelas</span>
            </span>
          </button>
        </div>
        <div class="line"></div>
        <div class="step" data-target="#account-details-1">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">8</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 8</span>
              <span class="bs-stepper-subtitle">Akreditasi Internasional</span>
            </span>
          </button>
        </div>
        <div class="line"></div>
      </div>

      <div class="bs-stepper-content">
        <h5 class="card-title mb-3" id="title">UNIVERSITAS LAMPUNG</h5>
        <!-- Card Border Shadow -->
        <div class="row">
          <div class="col-sm-6 col-lg-3 mb-4">
            <div class="card card-border-shadow-primary">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2 pb-1">
                    <span class="avatar-initial rounded bg-label-primary p-1"> <h4 class="ms-1 mb-0" id="total_point">0</h4></span>
                </div>
                <p class="mb-1">Total Point</p>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3 mb-4">
            <div class="card card-border-shadow-primary">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2 pb-1">
                    <span class="avatar-initial rounded bg-label-primary p-1"><h4 class="ms-1 mb-0" id="total_responden">0</h4></span>
                </div>
                <p class="mb-1">Total Responden</p>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3 mb-4">
            <div class="card card-border-shadow-primary">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2 pb-1">
                    <span class="avatar-initial rounded bg-label-primary p-1"><h4 class="ms-1 mb-0" id="total_alumni">0</h4></span>
                </div>
                <p class="mb-1">Total Lulusan</p>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3 mb-4">
            <div class="card card-border-shadow-primary">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2 pb-1">
                    <span class="avatar-initial rounded bg-label-primary p-1"><h4 class="ms-1 mb-0" id="pembentuk">0</h4></span>
                </div>
                <p class="mb-1">Pembentuk</p>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3 mb-4">
            <div class="card card-border-shadow-primary">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2 pb-1">
                    <span class="avatar-initial rounded bg-label-primary p-1"><h4 class="ms-1 mb-0"id="pencapaian">0</h4></span>
                </div>
                <p class="mb-1">Pencapaian IKU</p>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3 mb-4">
            <div class="card card-border-shadow-primary">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2 pb-1">
                    <span class="avatar-initial rounded bg-label-primary p-1"><h4 class="ms-1 mb-0" id="gold_standart">0</h4></span>
                </div>
                <p class="mb-1">Gold Standart</p>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3 mb-4">
            <div class="card card-border-shadow-primary">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2 pb-1">
                    <span class="avatar-initial rounded bg-label-primary p-1"><h4 class="ms-1 mb-0" id="delta_gold_standart">0</h4></span>
                </div>
                <p class="mb-1">Delta Gold Standart</p>
              </div>
            </div>
          </div>
          <div class="col-sm-6 col-lg-3 mb-4">
            <div class="card card-border-shadow-primary">
              <div class="card-body">
                <div class="d-flex align-items-center mb-2 pb-1">
                    <span class="avatar-initial rounded bg-label-primary p-1"><h4 class="ms-1 mb-0" id="skor_pencapaian">0</h4></span>
                </div>
                <p class="mb-1">Skor Pencapaian</p>
              </div>
            </div>
          </div>
        </div>
        <!--/ Card Border Shadow -->
          <div class="row g-3">
              <div class="col-12">
                <ul class="list-group">
                  <li class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                    <div class="offer">
                      <p class="mb-0 fw-medium">Rumus Perhitungan</p>
                      <span id="rumus">-</span>
                    </div>
                  </li>
                  <li class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                    <div class="offer">
                      <p class="mb-0 fw-medium">Sumber Data</p>
                      <span id="sumber_data">-</span>
                    </div>
                  </li>
                  <li class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                    <div class="offer">
                      <p class="mb-0 fw-medium">Update Sync Data Terahkir</p>
                      <span id="last_sync">-</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
      </div>
    </div>
  </div>
  <!-- /Vertical Wizard -->


<!-- DataTable with Buttons -->
<div class="card px-3">
  <div class="card-datatable table-responsive pt-0">
    <table class="datatables-basic table">
      <thead style="background-color:#ECF3FF">
        <tr>
          <th hidden>NO</th>
          <th hidden>ID</th>
          <th></th>
          <th width ="55%">Nama Fakultas/Program Studi</th>
          <th width ="10%">Total Point</th>
          <th width ="15%">Total Responden</th>
          <th width ="10%">Total Alumni</th>
          <th width ="10%">Pencapaian</th>
        </tr>
      </thead>
    </table>
  </div>
</div>
  <!-- Offcanvas to filter -->
  <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddUser" aria-labelledby="offcanvasAddUserLabel">
    <div class="offcanvas-header">
      <h5 id="offcanvasAddUserLabel" class="offcanvas-title">Filter Tahun IKU</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0 pt-0 h-100">
      <form class="add-new-user pt-0" id="addNewUserForm" onsubmit="return false">
        <div class="mb-3">
          <label class="form-label" for="country">Tahun IKU</label>
          <select id="country" class="select2 form-select" required>
            <option value="">Pilih</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary me-sm-3 me-1 data-submit">Submit</button>
        <button type="reset" class="btn btn-label-secondary" data-bs-dismiss="offcanvas">Cancel</button>
      </form>
    </div>
  </div>
  </div>
</div>

@endsection
