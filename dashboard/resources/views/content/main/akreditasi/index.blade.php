@extends('layouts/layoutMaster')

@push('css')
    <style>
        .table-info-striped tbody tr:nth-of-type(odd) {
            background-color: rgba(13, 202, 240, 0.08);
            /* info soft */
        }
    </style>
@endpush
@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/apex-charts/apex-charts.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/loading/overlay.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/select2/select2.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/jquery-sticky/jquery-sticky.js') }}"></script>
    <script src="{{ asset('js/datatables.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/moment/moment.js') }}"></script>
@endsection

@section('title', 'Dashboard Akreditasi')
@include('_partials.datatables')
@include('_partials.__partial.highchart')


@section('content')
    <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center bg-light border-bottom">
            <div>
                <h4 class="mb-0 fw-bold text-dark">
                    Dashboard Akreditasi
                </h4>
                @if (Route::currentRouteName() === 'akreditasi.prodi')
                    <small class="fw-bold">
                        {{ $get_fak->nm_lemb }}
                    </small>
                @endif
            </div>
        </div>
        <div class="card-body">
            @if (Route::currentRouteName() === 'akreditasi')
                <div class="mt-5 alert alert-primary alert-dismissible" role="alert" bis_skin_checked="1">
                    <h5 class="mb-2 alert-heading font fw-bold"> <i class="fa-solid fa-graduation-cap"></i> Panduan
                        Akreditasi</h5>
                    <p class="mb-0">Klik nama fakultas untuk melihat detail data akreditasi per prodi.</p>
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif

            {{-- Select Tahun - diletakkan di kanan --}}
            {{-- <div class="mb-4 d-flex justify-content-end">
                <select class="w-auto form-select" id="selectTahun">
                    <option value="" selected>Tahun Ajaran</option>
                </select>
            </div> --}}

            @if (Route::currentRouteName() === 'akreditasi.prodi' && $unit->id_jns_lemb != 23 && $unit->id_jns_lemb != 24)
                <a href="{{ route('akreditasi') }}" id="btnBackFakultas" class="mt-5 mb-2 btn btn-secondary">
                    ← Kembali ke Fakultas
                </a>
            @endif
            {{-- Tabel --}}
            <div class="mt-3 table-responsive">
                <table id="tabelAkreditasi" class="table table-bordered table-info-striped">
                    <thead class="text-center align-middle table-secondary">
                        <tr>
                            {{-- {!! $thead !!} --}}
                        </tr>
                    </thead>
                    <tbody class="align-middle">

                    </tbody>
                </table>
            </div>

        </div>
    </div>
@endsection

@include('content.main.akreditasi.function')
