@extends('layouts/layoutMaster')
@include('_partials.__partial.highchart')
@section('title', $judul)
@include('_partials.datatables')


@section('content')
    <div class="container">
        <div class="card">
            <div class="card-body">
                <div class="col-md-12" id="reportTemp">
                    <div class="card">
                        <div class="card-body">
                            Update Data Terakhir : <span id="last-update">{{ @$temp->last_update }}</span>
                            <div class="pull-right">
                                {{-- {!! Form::open(['url'=>Request::url().'/reload','id'=>'reload_temp']) !!}
                                {!! Form::button(
                                    "<i class='fa fa-refresh'></i> Hitung Ulang",
                                    [
                                        'type' => 'submit',
                                        'class' => 'btn btn-default btn-xs'
                                    ]
                                ) !!}
                                {!! Form::close() !!} --}}
                                <form action="{{ Request::url().'/reload' }}" id="reload_temp" method="POST">
                                    @csrf
                                    <button class="btn btn-default btn-xs"><i class='fa fa-refresh'></i> Hitung Ulang</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <hr>
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-body">
                            <!-- Nav Tabs -->
                            <ul class="nav nav-pills" id="myTab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="chart-tab" data-bs-toggle="tab"
                                        data-bs-target="#chart" type="button" role="tab" aria-controls="chart"
                                        aria-selected="true">
                                        <i class="fa fa-bar-chart"></i> Grafik
                                    </button>
                                </li>

                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="table-tab" data-bs-toggle="tab" data-bs-target="#table"
                                        type="button" role="tab" aria-controls="table" aria-selected="false">
                                        <i class="fa fa-table"></i> Tabel
                                    </button>
                                </li>

                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="info-tab" data-bs-toggle="tab" data-bs-target="#info"
                                        type="button" role="tab" aria-controls="info" aria-selected="false">
                                        <i class="fa fa-info"></i> Keterangan
                                    </button>
                                </li>
                            </ul>

                            <!-- Tab Content -->
                            <div class="tab-content" id="myTabContent">
                                <!-- Chart Tab -->
                                <div class="tab-pane fade show active" id="chart" role="tabpanel"
                                    aria-labelledby="chart-tab">
                                    <div class="card-body">
                                        <div class="align-middle">
                                            <nav aria-label="breadcrumb">
                                                <p class="pull-left fw-bold">Level :</p>
                                                <ol class="breadcrumb" role="button" id="chartBreadcrumb"></ol>
                                            </nav>
                                        </div>
                                        <hr />
                                        <center>
                                            <div id="container" style="height: 600px; margin: 0 auto"></div>
                                        </center>
                                    </div>
                                </div>

                                <!-- Table Tab -->
                                <div class="tab-pane fade" id="table" role="tabpanel" aria-labelledby="table-tab">
                                    <div class="panel-body" id="res"></div>
                                </div>

                                <!-- Info Tab -->
                                <div class="tab-pane fade" id="info" role="tabpanel" aria-labelledby="info-tab">
                                    <div class="card-body">
                                        <ul>
                                            @foreach ($info as $item)
                                                <li>{!! $item !!}</li>
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
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><span
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
                                            <i class="mr-3 fa fa-sort-amount-desc"></i> Drill Down
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
                        <button type="button" class="btn btn-default" data-bs-dismiss="modal"><i
                                class="fa fa-close"></i>
                            Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @include('content.main.dosen.list')
@endsection

@include('content.main.dosen.report-pt-chart')
