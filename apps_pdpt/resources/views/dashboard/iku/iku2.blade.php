@extends('template_public.default')
@include('__partial.highchart')
@include('__partial.datatable_yajra')

@push('css')
    <style>
        .modal.modal-fullscreen .modal-dialog {
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            max-width: none;
        }

        .modal.modal-fullscreen .modal-content {
            height: auto;
            height: 100vh;
            border-radius: 0;
            border: none;
        }

        .modal.modal-fullscreen .modal-body {
            overflow-y: auto;
        }
    </style>
@endpush

@section('content')
    <div class="row">
        <div class="col">
            <div class="card card-info">
                <div class="card-header">
                    <h3 class="card-title">IKU 2 : Mahasiswa Mendapat Pengalaman di Luar Kampus</h3>
                    <div class="card-tools">
                        <a class="btn btn-sm bg-white mr-1" target="_blank" href="https://drive.google.com/file/d/1bzsNVI_OoY3LcfBf_53INSJ9T2hoZQCq/view?usp=share_link"><i class="fas fa-info-circle"></i></a>
                        <button type="button" class="btn btn-sm btn-light" data-card-widget="maximize">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row mb-3">
                        <div class="col">
                            <div class="input-group">
                                <select id="thn_iku" class="form-control mr-2">
                                    @foreach ($thn_iku as $th)
                                        <option {{ $th->a_periode_aktif == 1 ? 'selected' : '' }}
                                            value="{{ $th->id_thn_ajaran }}">{{ $th->id_thn_ajaran }}</option>
                                    @endforeach
                                </select>
                                <div class="input-group-append">
                                    <button class="btn btn-info mr-2" onclick="Iku2Data(0)">FILTER</button>
                                    <button class="btn btn-info" onclick="Iku2Data(1)">HITUNG ULANG</button>
                                </div>
                            </div>
                            <div class="isLoading overlay mt-3" style="display: none;"><i
                                    class="fas fa-3x fa-sync-alt fa-spin"></i>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-warning">
                                <div class="inner">
                                    <h3 id="x_total_data_yes">0</h3>
                                    <p>Mahasiswa Memenuhi IKU 2</p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-bag"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-warning">
                                <div class="inner">
                                    <h3 id="x_total_data_no">0</h3>
                                    <p>Mahasiswa Tidak Memenuhi IKU 2</p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-stats-bars"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-warning">
                                <div class="inner">
                                    <h3 id="x_total_data">0</h3>
                                    <p>Total Mahasiswa IKU 2</p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-person-add"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-6 col-6">
                            <div class="small-box bg-warning">
                                <div class="inner">
                                    <h3 id="h_total_data_capaian">0</h3>
                                    <p>Presentase Capaian IKU 2</p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-stats-bars"></i>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6 col-6">
                            <div class="small-box bg-warning">
                                <div class="inner">
                                    <h3 id="h_total_data_gold">0</h3>
                                    <p>Delta Gold Standar IKU 2</p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-person-add"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col bg-info mr-2 ml-2">
                            <div class="text-center">
                                <h1 id="navChart"></h1>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <div id="container" style="width: 100%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade modal-fullscreen" id="exampleModal" tabindex="-1" role="dialog"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header pb-0">
                    <div class="float-left">
                        <p>
                            <span id="txt1_modal"></span>
                            <span id="txt2_modal"></span>
                            <span id="txt3_modal"></span>
                            <span id="txt4_modal"></span>
                        </p>
                    </div>
                    <div class="float-right mt-3">
                        <button id="btn_modal_back" class="btn btn-primary mr-1"><i class="fas fa-arrow-left"></i></button>
                        <button id="btn_modal_close" class="btn btn-danger" data-dismiss="modal" aria-label="Close"><i
                                class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="modal-body">
                    <div id="x_tb_01">
                        <table id="tb_01" class="table table-bordered table-striped">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                    <div id="x_tb_02">
                        <table id="tb_02" class="table table-bordered table-striped">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                    <div id="x_tb_03">
                        <table id="tb_03" class="table table-bordered table-striped">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                    <div id="x_tb_04">
                        <table id="tb_04" class="table table-bordered table-striped">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                    <div id="x_tb_05">
                        <table id="tb_05" class="table table-bordered table-striped">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script>
        let dataIku2 = [],
            drill = 1,
            x_total_data = 0,
            x_total_data_yes = 0,
            x_total_data_no = 0,
            h_total_data_capaian = 0,
            h_total_data_gold = 0;

        $(document).ready(function() {
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            Iku2Data();
        });

        $("#btn_modal_back").click(function() {
            $("#btn_modal_close").show();
            $("#btn_modal_back").hide();
            $("#txt3_modal").html("");
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
        });

        function refreshTotal() {
            let standar = 30;
            h_total_data_capaian = (x_total_data_yes / x_total_data) * 100;
            h_total_data_gold = (h_total_data_capaian - standar);
            $('#x_total_data').text(x_total_data);
            $('#x_total_data_yes').text(x_total_data_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + ' %');
            $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + ' %');
        }

        function Iku2Data(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiDashboardIku2') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku2 = res;
                Iku2Fakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku2Fakultas() {
            let y_id = [],
                y_title = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku2, function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 1;
            Iku2Chart(y_title, x_data_yes, x_data_no);
            $("#navChart").html(`<a href="javascript:" class="text-dark">UNILA</a> / FAKULTAS`);
        }

        function Iku2Prodi(fak) {
            let y_id = [],
                y_title = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku2[fak]['DRILL'], function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 2;
            Iku2Chart(y_title, x_data_yes, x_data_no, fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark">UNILA</a> / <a href="javascript:Iku2Fakultas();" class="text-dark">FAKULTAS</a> / PRODI`
            );
        }

        function Iku2Chart(y_title, x_data_yes, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('container', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'IKU 2 : Mahasiswa Mendapat Pengalaman di Luar Kampus'
                },
                xAxis: {
                    categories: y_title
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Mahasiswa IKU 2'
                    }
                },
                legend: {
                    reversed: true
                },
                plotOptions: {
                    series: {
                        stacking: 'percent',
                        dataLabels: {
                            enabled: true
                        },
                        cursor: 'pointer',
                        point: {
                            events: {
                                click: function(event) {
                                    if (drill == 1) {
                                        Iku2Prodi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku2[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>IKU 2 : MAHASISWA MENDAPAT PENGALAMAN DI LUAR KAMPUS</b><br>");
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku2Mahasiswa(id_prodi);
                                        }
                                    }
                                }
                            }
                        },
                    }
                },
                series: [{
                    name: 'Tidak Memenuhi',
                    data: x_data_no,
                    color: '#dc3545'
                }, {
                    name: 'Memenuhi',
                    data: x_data_yes,
                    color: '#28a745'
                }]
            });
            chart.setSize(null);
        }
    </script>
@endpush
