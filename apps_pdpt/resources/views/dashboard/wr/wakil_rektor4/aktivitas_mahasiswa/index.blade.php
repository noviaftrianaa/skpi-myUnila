@extends('template_public.default',['judul_layout'=>$judul_layout,'side_active'=>$side_active])

@include('__partial.select2')
@include('__partial.datatable_yajra')
@include('__partial.highchart')
@include('dashboard.wr.wakil_rektor4.aktivitas_mahasiswa.report-pt-chart')

@section('content')
    <div class="container">
        <div class="card">
            <div class="card-body">
                <div class="col-md-12" id="reportTemp">
                    <div class="card">
                        <div class="card-body">
                            Update Data Terakhir : <span id="last-update">{{ @$temp->last_update }}</span>
                            <div class="pull-right">
                                {!! Form::open(['url'=>Request::url().'/reload','id'=>'reload_temp']) !!}
                                {!! Form::button(
                                    "<i class='fa fa-refresh'></i> Hitung Ulang",
                                    [
                                        'type' => 'submit',
                                        'class' => 'btn btn-default btn-xs'
                                    ]
                                ) !!}
                                {!! Form::close() !!}
                            </div>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                <li class="nav-item" role="presentation"><button data-toggle="tab" data-target="#chart" href="#chart" class="nav-link active"><i class="fa fa-bar-chart"></i>  Grafik</button></li>
                                <li class="nav-item" role="presentation"><button data-toggle="tab" data-target="#table" href="#table" class="nav-link"><i class="fa fa-table"></i>  Tabel</button></li>
                                <li class="nav-item" role="presentation"><button data-toggle="tab" data-target="#info" href="#info" class="nav-link"><i class="fa fa-info"></i>  Keterangan</button></li>
                            </ul>
                            <div class="tab-content" id="myTabContent">
                                <div id="chart" class="tab-pane fade show active" role="tabpanel" aria-labelledby="chart-tab">
                                    <div class="card-body">
                                        <div class="align-middle">
                                            <nav aria-label="breadcrumb"><p class="pull-left fw-bold">Level : </p>
                                                <ol class="breadcrumb" id="chartBreadcrumb"></ol>
                                            </nav>
                                        </div>
                                        <hr>
                                        <center>
                                            <div id="container" style="height: 600px; margin: 0 auto"></div>
                                        </center>
                                    </div>
                                </div>
                                <div id="table" class="tab-pane fade" role="tabpanel" aria-labelledby="table-tab">
                                    <div class="panel-body" id="res">
                                    </div>
                                </div>
                                <div id="info" class="tab-pane fade" role="tabpanel" aria-labelledby="info-tab">
                                    <div class="card-body">
                                        <ul>
                                            @foreach($info as $info)
                                                <li>{!! $info !!}</li>
                                            @endforeach
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Chart OnClick Modal -->
    <div id="chartDetail" class="modal fade" role="dialog" aria-hidden="true">
        <div class="vertical-alignment-helper">
            <div class="modal-dialog vertical-align-center" style="width:50%;">
                <!-- Modal content-->
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fa fa-info"></i> Info</h5>
                        <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
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
                                    <button id="showtable" class="btn btn-primary btn-sm" data-toggle="offcanvas" data-target="#offcanvasTop" aria-controls="offcanvasTop">
                                        <i class="fa fa-table"></i> Daftar Detail
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="modal-footer">
                        <button type="button"  class="btn btn-default" data-dismiss="modal"><i class="fa fa-close"></i> Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('dashboard.wr.wakil_rektor4.aktivitas_mahasiswa.list')
@endsection
