@extends('layouts/layoutMaster')

@section('title', 'Indikator Kinerja Utama - IKU 2 Universitas Lampung')

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
<link rel="stylesheet" href="{{ asset(mix('assets/vendor/fonts/fontawesome.css')) }}" />
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
  @include('content.main.iku.iku-2.function')
@endsection

@section('content')
<h4>
  Indikator Kinerja Utama - IKU 2
</h4>

<div class="overlay" id="loading">
    <div class="overlay-content">
      <div class="d-flex justify-content-center">
        <p class="mb-0" style="color: #5599FE">Harap tunggu... </p>
        <div class="sk-wave m-0">
            <div class="sk-rect sk-wave-rect"></div>
            <div class="sk-rect sk-wave-rect"></div>
            <div class="sk-rect sk-wave-rect"></div>
            <div class="sk-rect sk-wave-rect"></div>
            <div class="sk-rect sk-wave-rect"></div>
        </div>
      </div>
    </div>
  </div>

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
        <a class="step crossed select-iku zoom" href="{{ route('main-iku2') }}">
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
        <a class="step select-iku" href="{{ route('main-iku5') }}">
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
        <p class="text-muted mt-3" id="tahun-index"></p>

        <ul class="nav nav-pills flex-column flex-md-row mb-4 mt-4">
            <li class="nav-item">
                <button
                    class="nav-link active"
                    role="tab"
                    id="tab-mbkm"
                    data-bs-toggle="tab"
                    data-bs-target="#mbkm"
                    aria-controls="mbkm"
                    aria-selected="true">
                    <i class="fas fa-flag fa-sm me-1"></i>Kategori MBKM</button>
            </li>
            <li class="nav-item">
                <button
                    class="nav-link"
                    role="tab"
                    id="tab-prestasi"
                    data-bs-toggle="tab"
                    data-bs-target="#prestasi"
                    aria-controls="prestasi"
                    aria-selected="true">
                    <i class="fas fa-trophy fa-sm me-1"></i>Kategori Prestasi</button>
            </li>
        </ul>

        <div class="tab-content p-3 border">
            {{-- mbkm --}}
            <div class="tab-pane fade show active" id="mbkm" role="tabpanel">
                <div class="row">
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="point_a">0</h4>
                                    </span>
                                </div>
                                <p class="mb-3 mt-3">Point MBKM</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="point_b">0</h4>
                                    </span>
                                </div>
                                <p class="mb-3 mt-3">Point MBKM Inbound</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="peserta_mbkm">0</h4>
                                    </span>
                                </div>
                                <p class="mb-3 mt-3">Total Peserta MBKM</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h5 class="ms-1 mb-0" id="pembentuk_a">0</h5>
                                        <h5 class="ms-1 mb-0" id="pembentuk_b"></h5>
                                    </span>
                                </div>
                                <p class="mb-1">Pembentuk</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="pencapaian_1">0</h4>
                                    </span>
                                </div>
                                <p class="mb-1">Pencapaian IKU</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="gold_standart_1">0</h4>
                                    </span>
                                </div>
                                <p class="mb-1">Gold Standart</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="delta_gold_standart_1">0</h4>
                                    </span>
                                </div>
                                <p class="mb-1">Delta Gold Standart</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="skor_pencapaian_1">0</h4>
                                    </span>
                                </div>
                                <p class="mb-1">Skor Pencapaian</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row g-3">
                    <div class="col-12">
                        <ul class="list-group">
                            <li
                                class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                                <div class="offer">
                                    <p class="mb-0 fw-medium">Rumus Perhitungan</p>
                                    <span id="rumus_ab">-</span>
                                </div>
                            </li>
                            <li
                                class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                                <div class="offer">
                                    <p class="mb-0 fw-medium">Sumber Data</p>
                                    <span id="sumber_data_ab">-</span>
                                </div>
                            </li>
                            <li
                                class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                                <div class="offer">
                                    <p class="mb-0 fw-medium">Update Sync Data Terahkir</p>
                                    <span id="last_sync_ab">-</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {{-- mbkm --}}

            {{-- prestasi --}}
            <div class="tab-pane fade" id="prestasi" role="tabpanel">
                <div class="row">
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="point_c">0</h4>
                                    </span>
                                </div>
                                <p class="mb-3 mt-3">Total Point</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="total_prestasi_c">0</h4>
                                    </span>
                                </div>
                                <p class="mb-3 mt-3">Total Prestasi</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="total_mhs_c">0</h4>
                                    </span>
                                </div>
                                <p class="mb-3 mt-3">Total Mahasiswa Aktif</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h5 class="ms-1 mb-0" id="pembentuk_c">0</h5>
                                    </span>
                                </div>
                                <p class="mb-3 mt-3">Pembentuk</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="pencapaian_2">0</h4>
                                    </span>
                                </div>
                                <p class="mb-1">Pencapaian IKU</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="gold_standart_2">0</h4>
                                    </span>
                                </div>
                                <p class="mb-1">Gold Standart</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="delta_gold_standart_2">0</h4>
                                    </span>
                                </div>
                                <p class="mb-1">Delta Gold Standart</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 col-lg-3 mb-4">
                        <div class="card card-border-shadow-primary">
                            <div class="card-body">
                                <div class="d-flex align-items-center mb-2 pb-1">
                                    <span class="avatar-initial rounded bg-label-primary p-1">
                                        <h4 class="ms-1 mb-0" id="skor_pencapaian_2">0</h4>
                                    </span>
                                </div>
                                <p class="mb-1">Skor Pencapaian</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row g-3">
                    <div class="col-12">
                        <ul class="list-group">
                            <li
                                class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                                <div class="offer">
                                    <p class="mb-0 fw-medium">Rumus Perhitungan</p>
                                    <span id="rumus_c">-</span>
                                </div>
                            </li>
                            <li
                                class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                                <div class="offer">
                                    <p class="mb-0 fw-medium">Sumber Data</p>
                                    <span id="sumber_data_c">-</span>
                                </div>
                            </li>
                            <li
                                class="list-group-item d-flex justify-content-between flex-column flex-sm-row">
                                <div class="offer">
                                    <p class="mb-0 fw-medium">Update Sync Data Terahkir</p>
                                    <span id="last_sync_c">-</span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {{-- prestasi--}}
        </div>

      </div>
    </div>
  </div>
  <!-- /Vertical Menu IKU -->


<!-- DataTable with Buttons -->
<div class="card px-3">
    <div class="mbkm card-datatable table-responsive pt-0">
        <table class="datatables-point-mbkm table table-bordered">
            <thead style="background-color:#ECF3FF">
                <tr>
                    <th hidden="hidden">NO</th>
                    <th hidden="hidden">ID</th>
                    <th></th>
                    <th width="45%">Nama Fakultas / Program Studi</th>
                    <th width="15%">Point MBKM</th>
                    <th width="15%">Point MBKM Inbound</th>
                    <th width="15%">Total Peserta MBKM</th>
                    <th width="10%">Pencapaian</th>
                </tr>
            </thead>
        </table>
    </div>
    <div class="prestasi card-datatable table-responsive pt-0">
        <table class="datatables-point-prestasi table table-bordered">
            <thead style="background-color:#ECF3FF">
                <tr>
                    <th hidden="hidden">NO</th>
                    <th hidden="hidden">ID</th>
                    <th></th>
                    <th width="45%">Nama Fakultas/Program Studi</th>
                    <th width="13%">Point Prestasi</th>
                    <th width="17%">Total Mahasiswa Prestasi</th>
                    <th width="15%">Total Mahasiswa Aktif</th>
                    <th width="10%">Pencapaian</th>
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

@include('content.main.iku.iku-2.detail')

@endsection
