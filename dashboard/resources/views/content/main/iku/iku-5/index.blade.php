@php
$customizerHidden = 'customizer-hide';
$configData = Helper::appClasses();
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Indikator Kinerja Utama - IKU 5 Universitas Lampung')

@section('vendor-style')
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-fixedcolumns-bs5/fixedcolumns.bootstrap5.css')}}">
<link rel="stylesheet" href="{{asset('assets/vendor/libs/bs-stepper/bs-stepper.css')}}" />
<link rel="stylesheet" href="{{asset('assets/vendor/libs/loading/overlay.css')}}" />
<link rel="stylesheet" href="{{asset('assets/vendor/libs/flatpickr/flatpickr.css')}}" />
<link rel="stylesheet" href="{{asset('assets/vendor/libs/spinkit/spinkit.css')}}" />
<link rel="stylesheet" href="{{asset('assets/vendor/css/pages/page-misc.css')}}">
<!-- Row Group CSS -->
<link rel="stylesheet" href="{{asset('assets/vendor/libs/datatables-rowgroup-bs5/rowgroup.bootstrap5.css')}}">
<!-- Form Validation -->
<link rel="stylesheet" href="{{asset('assets/vendor/libs/@form-validation/umd/styles/index.min.css')}}" />
<style>
  .bs-stepper.vertical .bs-stepper-header {
      min-width: 25rem!important;
  }
  .bs-stepper .bs-stepper-header .step .step-trigger .bs-stepper-label {
      max-width: 274px!important;
  }
  .light-style div.dtfc-left-top-blocker,
  .light-style div.dtfc-right-top-blocker,
  .light-style table.dataTable tbody tr > .dtfc-fixed-left,
  .light-style table.dataTable tbody tr > .dtfc-fixed-right,
  .light-style table.dataTable thead tr > .dtfc-fixed-left,
  .light-style table.dataTable thead tr > .dtfc-fixed-right {
      background-color: #dae6f8;
  }
  .select-iku {
      border-radius: 4px;
      margin-top: 8px;
      padding: 5px 30px 0px 10px;
      background: #fff;
      box-shadow: 0 6px 10px rgba(0,0,0,.08), 0 0 6px rgba(0,0,0,.05);
      transition: 0.3s transform cubic-bezier(.155,1.105,.295,1.12),.3s box-shadow,.3s -webkit-transform cubic-bezier(.155,1.105,.295,1.12);
      cursor: pointer;
  }
  .select-iku:hover {
      border: 0.5px solid;
      border-color: #a7a7a7;
      transform: scale(1.05);
      box-shadow: 0 10px 20px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06);
  }
  @media(max-width: 990px){
    .select-iku{
      padding: 5px 5px 0px 10px;
    }
  }
  .zoom {
    transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(0,0,0,.12), 0 4px 8px rgba(0,0,0,.06);
    border: 0.5px solid;
    border-color: #a7a7a7;
  }

  .bs-stepper.vertical .bs-stepper-header .step:first-child .step-trigger {
  padding-top: 5px;
}
</style>
@endsection

@section('vendor-script')
<script src="{{asset('assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js')}}"></script>
<script src="{{asset('assets/vendor/libs/block-ui/block-ui.js')}}"></script>
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
  Indikator Kinerja Utama - IKU 5
</h4>

<div class="row">
 <div class="col-md-12">
  <!-- Vertical Menu IKU -->
  <div class="col-12 mb-4">
    <div class="bs-stepper wizard-vertical vertical mt-2">
      <div class="bs-stepper-header">
        <a class="step select-iku" href="{{ route('main-iku1') }}">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">1</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 1</span>
              <span class="bs-stepper-subtitle">Lulusan Mendapat Pekerjaan yang Layak</span>
            </span>
          </button>
        </a>
        <div class="line"></div>
        <a class="step select-iku" href="{{ route('main-iku2') }}" href="{{ route('main-iku1') }}">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">2</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 2</span>
              <span class="bs-stepper-subtitle">Mahasiswa MBKM / prestasi</span>
            </span>
          </button>
        </a>
        <div class="line"></div>
        <a class="step select-iku" href="{{ route('main-iku3') }}">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">3</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 3</span>
              <span class="bs-stepper-subtitle">Dosen di luar kampus</span>
            </span>
          </button>
        </a>
        <div class="line"></div>
        <a class="step select-iku" href="{{ route('main-iku4') }}">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">4</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 4</span>
              <span class="bs-stepper-subtitle">Kualifikasi dosen/pengajar</span>
            </span>
          </button>
        </a>
        <div class="line"></div>
        <a class="step crossed select-iku zoom" href="{{ route('main-iku5') }}">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">5</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 5</span>
              <span class="bs-stepper-subtitle">Penerapan karya dosen</span>
            </span>
          </button>
        </a>
        <div class="line"></div>
        <a class="step select-iku" href="{{ route('main-iku6') }}">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">6</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 6</span>
              <span class="bs-stepper-subtitle">Kemitraan program studi</span>
            </span>
          </button>
        </a>
        <div class="line"></div>
        <a class="step select-iku" href="{{ route('main-iku7') }}">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">7</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 7</span>
              <span class="bs-stepper-subtitle">Pembelajaran dalam kelas</span>
            </span>
          </button>
        </a>
        <div class="line"></div>
        <a class="step select-iku" href="{{ route('main-iku8') }}">
          <button type="button" class="step-trigger">
           <span class="bs-stepper-circle">8</span>
            <span class="bs-stepper-label">
              <span class="bs-stepper-title">IKU 8</span>
              <span class="bs-stepper-subtitle">Akreditasi Internasional</span>
            </span>
          </button>
        </a>
        <div class="line"></div>
      </div>

      <div class="bs-stepper-content">
        <h5 class="card-title mb-3 mt-2" id="title">UNIVERSITAS LAMPUNG</h5>
        <!-- Card Border Shadow -->
        <div class="row">
          <!-- Coming soon -->
          <div class="container-xxl container-p-y">
            <div class="misc-wrapper">
              <h2 class="mb-1 mx-2">We are launching soon</h2>
              <p class="mb-4 mx-2">We're creating something awesome.</p>
              <div class="mt-4">
                <img src="{{ asset('assets/img/illustrations/page-misc-under-maintenance.png') }}" alt="page-misc-under-maintenance" width="550" class="img-fluid">
              </div>
            </div>
          </div>
          <div class="container-fluid misc-bg-wrapper">
            <img src="{{ asset('assets/img/illustrations/bg-shape-image-'.$configData['style'].'.png') }}" alt="page-misc-coming-soon" data-app-light-img="illustrations/bg-shape-image-light.png" data-app-dark-img="illustrations/bg-shape-image-dark.png">
          </div>
          <!-- /Coming soon -->
      </div>
    </div>
  </div>
  <!-- /Vertical Menu IKU -->


<!-- DataTable with Buttons -->
<div class="card px-3">
  <div class="card-datatable table-responsive pt-0">
    <table class="datatables-point table table-bordered">
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
  <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasFilter" aria-labelledby="offcanvasFilterLabel">
    <div class="offcanvas-header">
      <h5 id="offcanvasFilterLabel" class="offcanvas-title">Filter Tahun IKU</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body mx-0 flex-grow-0 pt-0 h-100">
      <form class="add-new-user pt-0" id="filterForm" onsubmit="return false">
        <div class="mb-3">
          <label class="form-label" for="country">Tahun IKU</label>
          <select id="thn_iku" class="select2 form-select" required>
            @foreach ($thn_iku as $idThnAjaran => $item)
                <option value="{{ $idThnAjaran }}">{{ $idThnAjaran }}</option>
            @endforeach
          </select>
        </div>
        <button class="btn btn-primary me-sm-3 me-1 data-submit" onclick="TablePointIku()" data-bs-dismiss="offcanvas"><i class="fas fa-filter me-2"></i> Submit</button>
        <button type="reset" class="btn btn-label-secondary" data-bs-dismiss="offcanvas">Cancel</button>
      </form>
    </div>
  </div>
  </div>
</div>

<div class="container-fluid misc-bg-wrapper">
  <img src="{{ asset('assets/img/illustrations/bg-shape-image-'.$configData['style'].'.png') }}" alt="page-misc-coming-soon" data-app-light-img="illustrations/bg-shape-image-light.png" data-app-dark-img="illustrations/bg-shape-image-dark.png">
</div>
@include('content.main.iku.iku-1.detail')

@endsection
