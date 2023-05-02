@extends('template.default', ['judul_layout' => $judul_layout, 'side_active' => $side_active])

@include('__partial.datatable_yajra')
@include('__partial.highchart')
@include('home.wr.wakil_rektor_1.buku_ajar.report-pt-chart')

@section('content')
    <div class="col-md-12">
        <div class="row mb-3">
            <div class="col">
                <div class="input-group">
                    <select id="thn_buku_ajar" class="form-control mr-2">
                        @foreach ($bukuAjarYear as $th)
                            <option {{ $th->a_periode_aktif == 1 ? 'selected' : '' }} value="{{ $th->id_thn_ajaran }}">
                                Data BukuAjar Tahun {{ $th->id_thn_ajaran }}</option>
                        @endforeach
                    </select>
                    <div class="input-group-append">
                        <button class="btn btn-info mr-2" onclick="reloadChart()">FILTER</button>
                        <button class="btn btn-info" onclick="reloadChart()">HITUNG ULANG</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-body">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation"><button data-toggle="tab" data-target="#chart" href="#chart"
                            class="nav-link active"><i class="fa fa-bar-chart"></i>
                            Grafik</button></li>
                    <li class="nav-item" role="presentation"><button data-toggle="tab" data-target="#table" href="#table"
                            class="nav-link"><i class="fa fa-table"></i> Tabel</button></li>
                    <li class="nav-item" role="presentation"><button data-toggle="tab" data-target="#info" href="#info"
                            class="nav-link"><i class="fa fa-info"></i> Keterangan</button></li>
                </ul>
                <div class="tab-content mt-4" id="myTabContent">
                    <div id="chart" class="tab-pane fade show active" role="tabpanel" aria-labelledby="chart-tab">
                        <div class="card-body" id="chartBody">
                            <div class="align-middle">
                                <nav aria-label="breadcrumb mb-3" class="second ">
                                    <ol class="breadcrumb indigo lighten-6 first" id="chartBreadcrumb">
                                    </ol>
                                </nav>
                            </div>
                            <hr>
                            <center>
                                <div id="bodyChart" style="height: 600px; margin: 0 auto"></div>
                            </center>
                        </div>

                        <div class="card-body" id="chartEmptyState">
                            <div class="col-12 text-center">
                                <img class="img-fluid mb-2" src="{{ asset('asset/empty_state_chart.jpg') }}" width="500" height="500">
                                <h2>Belum Ada Data BukuAjar</h2>
                            </div>
                        </div>
                    </div>

                    <div id="table" class="tab-pane fade" role="tabpanel" aria-labelledby="table-tab">
                        <div class="panel-body" id="res">
                        </div>
                    </div>
                    <div id="info" class="tab-pane fade" role="tabpanel" aria-labelledby="info-tab">
                        <div class="card-body">
                            <ul>
                                @foreach ($info as $info)
                                    <li>{!! $info !!}</li>
                                @endforeach
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="overlay" id="overlayChart">
                <div class="row">
                    <div class="col">
                        <div class="spinner-grow text-primary" role="status">
                        </div>
                    </div>
                    <div class="col">
                        <div class="spinner-grow text-success" role="status">
                        </div>
                    </div>
                    <div class="col">
                        <div class="spinner-grow text-warning" role="status">
                        </div>
                    </div>
                    <div class="col">
                        <div class="spinner-grow text-danger" role="status">
                        </div>
                    </div>
                    <div class="col">
                        <div class="spinner-grow text-secondary" role="status">
                        </div>
                    </div>
                    <div class="col">
                        <div class="spinner-grow text-info" role="status">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="chartBukuAjarDetail" class="modal fade" role="dialog" aria-hidden="true">
        <div class="vertical-alignment-helper">
            <div class="modal-dialog vertical-align-center" style="width:50%;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fa fa-info"></i> Info</h5>
                        <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"><span
                                aria-hidden="true">&times;</span></button>
                    </div>
                    <div class="modal-body">
                        <table class="table table-striped table-bordered">
                            <tbody>
                                <tr>
                                    <th scope="row">Level</th>
                                    <td><span id="selectedLevel"></span></td>
                                </tr>
                                <tr>
                                    <th scope="row">Kategori Terpilih</th>
                                    <td><span id="selectedColumn"></span></td>
                                </tr>
                                <tr>
                                    <th scope="row">Tahun</th>
                                    <td><span id="selectedYear"></span></td>
                                </tr>
                                <tr>
                                    <th scope="row">Jumlah</th>
                                    <td><span id="selectedValue"></span></td>
                                </tr>
                                <tr>
                                    <th scope="row">Action</th>
                                    <td>
                                        <button id="drilldown" class="btn btn-success btn-sm">
                                            <i class="fa fa-sort-amount-desc"></i> Drill Down
                                        </button>
                                        <button id="showtable" class="btn btn-primary btn-sm" data-toggle="offcanvas"
                                            data-target="#offcanvasTop" aria-controls="offcanvasTop">
                                            <i class="fa fa-table"></i> Daftar Detail
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal"><i class="fa fa-close"></i>
                            Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
