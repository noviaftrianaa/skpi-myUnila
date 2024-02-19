@extends('layouts/layoutMaster')
{{-- @include('content.pages.ktw.function') --}}

@section('title', $title)

@section('content')
    <!-- Chart -->
    <div class="row">

        <div class="col-12 mb-4">
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-md-center align-items-start">
                    {{-- <h5 class="card-title mb-0">Kelulusan Tepat Waktu</h5> --}}
                    {{-- <div class="dropdown">
                        <div class="input-group">
                            <label class="input-group-text">Tahun</label>
                            <select class="form-select" id="tahun">
                                <option value="{{ $tahun }}">{{ $tahun - 4 }} - {{ $tahun }}</option>
                                <option value="{{ $tahun - 5 }}">{{ $tahun - 9 }} - {{ $tahun - 5 }}</option>
                                <option value="{{ $tahun - 10 }}">{{ $tahun - 14 }} - {{ $tahun - 10 }}</option>
                            </select>
                        </div>
                    </div> --}}
                </div>
                <div class="card-body">
                    <div class="container-xxl container-p-y text-center">
                        <div class="misc-wrapper">
                            <h2 class="mb-1 mx-2">We are launching soon</h2>
                            <p class="mb-4 mx-2">We're creating something awesome.</p>
                            <div class="mt-4">
                                <img src="{{ asset('assets/img/illustrations/page-misc-under-maintenance.png') }}"
                                    alt="page-misc-under-maintenance" width="550" class="img-fluid">
                            </div>
                        </div>
                    </div>
                    {{-- <div id="barChart"></div> --}}
                </div>
            </div>
        </div>
    </div>

    {{-- @if (auth()->check())
        <!-- Detail -->
        <div class="row">
            <div class="col-12 mb-4">
                <div class="card">
                    <div
                        class="card-header sticky-element bg-label-light d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4">
                        <h5 class="card-title">{{ $title }}</h5>
                        <div class="float-end">
                            <div class="btn-group" role="group">
                                <div id="exportBtn"></div>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover table-bordered table-stripped" id="table-data"
                                style="width: 100% !important">
                                <thead class="table-primary"></thead>
                            </table>
                        </div>
                        <!-- Offcanvas to filter -->
                        <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddUser"
                            aria-labelledby="offcanvasAddUserLabel">
                            <div class="offcanvas-header">
                                <h5 id="offcanvasAddUserLabel" class="offcanvas-title">Filter</h5>
                                <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                                    aria-label="Close"></button>
                            </div>
                            <div class="offcanvas-body mx-0 flex-grow-0 pt-0 h-100">
                                <div class="mb-3">
                                    <div class="input-group w-100">
                                        <input type="text" id="search" placeholder="Pencarian" class="form-control">
                                        <button type="button" id="btnSearch" class="btn btn-primary"><i
                                                class="fas fa-search"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif --}}

@endsection
