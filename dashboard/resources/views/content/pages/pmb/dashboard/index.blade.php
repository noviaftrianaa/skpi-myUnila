@extends('layouts/layoutMaster')
@include('content.pages.pmb.dashboard.function')

@section('title', $title)

@section('content')
    <div class="row">
        <div class="col-12 mb-4">
            <div class="card">
                <div
                    class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 border-bottom">
                    <h4 class="card-title mb-0">{{ $title }}</h4>
                    <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text">Tahun Ajaran</label>
                            <select class="form-select text-center" id="periodeTahun">
                                @for ($i = $tahun; $i > $tahun - 2; $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
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

                    <div class="container-fluid mt-5">
                        <div class="row equal-height">
                            <div class="col-md-6 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <div id="chart-total-penerimaan"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <div id="chart-jenis-pendaftaran"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row equal-height">
                            <div class="col-md-6 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <div id="chart-kategori-usia"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <div id="chart-jenis-kelamin"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row equal-height">
                            <div class="col-md-6 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <div id="chart-fakultas-prodi"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <div id="chart-top-prodi"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row equal-height">
                            <div class="col-md-6 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <div id="chart-nilai-utbk"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <div id="chart-nilai-wawancara"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row equal-height">
                            <div class="col-md-12 col-12 mb-3 mt-3">
                                <div class="card-shadow h-100">
                                    <div class="card-body">
                                        <h4 class="custom-title">Sebaran Wilayah Peserta</h4>
                                        <div id="sebaran-wilayah" style="height: 500px; width: 100%;"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p class="alert alert-secondary mt-3 text-center">
                            Sinkronisasi data terakhir (sumber : mandiri.unila.ac.id): {{ TglWaktuIndonesia(\DB::table('temp_pmb.pengumuman')->select('last_sync')->orderByDesc('last_sync')->pluck('last_sync')[0] ?? now()) }}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    </div>
@endsection

