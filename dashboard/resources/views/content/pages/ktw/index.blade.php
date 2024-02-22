@extends('layouts/layoutMaster')
@include('content.pages.ktw.function')

@section('title', $title)

@section('content')
    <!-- Chart -->
    <div class="row">

        <div class="col-12 mb-4">
            <div class="card">
                <div
                    class="card-header d-flex justify-content-between align-items-md-center align-items-start border-bottom">
                    <h4 class="card-title mb-0">Kelulusan Tepat Waktu</h4>
                    <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text">Fakultas</label>
                            <select class="form-select w-auto me-2" id="sms">
                                <option value="all" selected>SEMUA FAKULTAS</option>
                                @foreach ($sms as $item)
                                    <option value="{{ $item->id_sms }}">{{ $item->nm_lemb }}</option>
                                @endforeach
                            </select>
                            <label class="input-group-text">Tahun</label>
                            <select class="form-select w-auto me-2" id="tahun">
                                <option value="{{ $tahun }}" selected>{{ $tahun - 4 }} - {{ $tahun }}
                                </option>
                                <option value="{{ $tahun - 5 }}">{{ $tahun - 9 }} - {{ $tahun - 5 }}</option>
                                <option value="{{ $tahun - 10 }}">{{ $tahun - 14 }} - {{ $tahun - 10 }}</option>
                            </select>
                            @if (auth()->check())
                                <a href="#detailData" data-bs-toggle="modal" class="btn btn-label-primary"><i
                                        class="fas fa-info-circle me-1"></i> Data</a>
                            @endif
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="overlay" id="loading">
                        <div class="overlay-content">
                            <div class="d-flex justify-content-center">
                                <p class="mb-0" style="color: #0d6efd">Mohon menunggu, data sedang diproses ... </p>
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
                    <div class="my-4" id="studiChart"></div>
                    <div class="border-bottom"></div>
                    <div class="my-4" id="ipkChart"></div>
                </div>
            </div>
        </div>
    </div>

    @if (auth()->check())
        <!-- Detail Raw modal -->
        <div class="modal fade" id="detailData" tabindex="-1" aria-hidden="true" data-bs-backdrop="static"
            data-bs-keyboard="false">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content p-3 p-md-5">
                    <div class="modal-body">
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

                        <div class="card">
                            <div class="card-header">
                                <div class="card-title text-center">
                                    <h3 class="mb-3">Detail Data Kelulusan Tepat Waktu (KTW)</h3>
                                    <p class="text-muted" id="title-modal"></p>
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
                                                <input type="text" id="search" placeholder="Pencarian"
                                                    class="form-control">
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
            </div>
        </div>
        <!-- / Detail Raw modal -->
    @endif

@endsection
