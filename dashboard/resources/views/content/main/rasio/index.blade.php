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

@section('title', 'Dashboard Rasio')
@include('_partials.datatables')
@include('_partials.__partial.highchart')

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <div class="d-flex justify-content-between">
                            <h3 class="card-title">Rasio Mahasiswa dan Dosen</h3>
                            <div class="card-tools">
                                <div class="gap-2 d-flex">
                                    <div class="mr-2">
                                        <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                                            data-bs-target="#detail-modal">
                                            Data
                                        </button>
                                    </div>
                                    <div class="mr-2">
                                        <select class="form-control" id="tahun-ajaran-filter" style="width: 100%;">
                                            @foreach ($tahun_ajaran as $tahun)
                                                <option value="{{ (string) $tahun->id_smt }}"
                                                    {{ $loop->first ? 'selected' : '' }}>
                                                    {{ $tahun->nm_smt }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div id="fakultas-select-container">
                                        <select class="form-control select2" id="fakultas-filter" style="width: 100%;">
                                            <option value="">Pilih Fakultas</option>
                                            @foreach ($fakultas as $item)
                                                <option value="{{ $item->id_sms }}">{{ $item->nm_lemb }}</option>
                                            @endforeach
                                        </select>
                                    </div>
                                    <div id="container-btn-back" style="display: none">
                                        <button id="button-back" class="btn btn-primary">
                                            Back</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div id="chart-container"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="detail-modal" tabindex="-1" role="dialog" aria-labelledby="detail-modal-label"
        aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="detail-modal-label">Detail Data</h5>
                        <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                </div>
                <div class="modal-body">
                    <div class="card">
                        <div class="p-0 card-header d-flex">
                            <ul class="p-2 nav nav-pills ms-auto" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="dosen-tab" data-bs-toggle="tab"
                                        data-bs-target="#tab_1" type="button" role="tab">
                                        Dosen
                                    </button>
                                </li>

                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="mahasiswa-tab" data-bs-toggle="tab" data-bs-target="#tab_2"
                                        type="button" role="tab">
                                        Mahasiswa
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <div class="card-body">
                            <div class="tab-content">
                                <div class="tab-pane active" id="tab_1">
                                    <table class="table table-bordered table-striped" id="table-dosen" style="width:100%">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Nama Dosen</th>
                                                <th>NIP</th>
                                                <th>Fakultas</th>
                                                <th>Prodi</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                                <div class="tab-pane" id="tab_2">
                                    <table class="table table-bordered table-striped" id="table-mahasiswa"
                                        style="width:100%">
                                        <thead>
                                            <tr>
                                                <th>No</th>
                                                <th>Nama Mahasiswa</th>
                                                <th>NPM</th>
                                                <th>Fakultas</th>
                                                <th>Prodi</th>
                                            </tr>
                                        </thead>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
    @include('content.main.rasio.function')
@endpush
