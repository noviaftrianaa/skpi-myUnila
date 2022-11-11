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
                    <h3 class="card-title">IKU 1 : Lulusan Mendapat Pekerjaan yang Layak</h3>
                    <div class="card-tools">
                        <a class="btn btn-sm bg-white mr-1" target="_blank" href="https://drive.google.com/file/d/1bzsNVI_OoY3LcfBf_53INSJ9T2hoZQCq/view?usp=share_link"><i class="fas fa-info-circle"></i></a>
                        <button type="button" class="btn btn-sm bg-white" data-card-widget="maximize">
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
                                    <button class="btn btn-info mr-2" onclick="Iku1Data(0)">FILTER</button>
                                    <button class="btn btn-info" onclick="Iku1Data(1)">HITUNG ULANG</button>
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
                                    <p>Alumni Memenuhi IKU 1</p>
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
                                    <p>Alumni Tidak Memenuhi IKU 1</p>
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
                                    <p>Total Alumni IKU 1</p>
                                </div>
                                <div class="icon">
                                    <i class="ion ion-person-add"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-lg-6 col-6">
                            <div class="row">
                                <div class="col">
                                    <div class="small-box bg-warning">
                                        <div class="inner">
                                            <h3 id="h_total_data_capaian">0</h3>
                                            <p>Presentase Capaian IKU 1</p>
                                        </div>
                                        <div class="icon">
                                            <i class="ion ion-stats-bars"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div class="small-box bg-warning">
                                        <div class="inner">
                                            <h3 id="h_total_data_gold">0</h3>
                                            <p>Delta Gold Standar IKU 1</p>
                                        </div>
                                        <div class="icon">
                                            <i class="ion ion-person-add"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-6 col-6">
                            <div class="row">
                                <div class="col">
                                    <div id="Iku1ChartPie"></div>
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
                            <div id="Iku1ChartBar"></div>
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
        var dataIku1 = [];
        var drill = 1;
        var x_total_data = 0;
        var x_total_data_yes = 0;
        var x_total_data_no = 0;
        var x_total_data_blm_isi = 0;
        var x_total_data_tdk_krj = 0;
        var x_total_data_krj = 0;
        var x_total_data_usaha = 0;
        var x_total_data_lanstud = 0;
        var h_total_data_capaian = 0;
        var h_total_data_gold = 0;

        $(document).ready(function() {
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            Iku1Data();
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
            let standar = 80;
            h_total_data_capaian = (x_total_data_yes / x_total_data) * 100;
            h_total_data_gold = (h_total_data_capaian - standar);
            $('#x_total_data').text(x_total_data);
            $('#x_total_data_yes').text(x_total_data_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + ' %');
            $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + ' %');
        }

        function Iku1Data(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiDashboardIku1') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku1 = res;
                Iku1Fakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku1Fakultas() {
            var y_id = [];
            var y_title = [];
            var x_data_yes = [];
            var x_data_no = [];
            var x_data_pie = [];
            x_total_data_blm_isi = 0;
            x_total_data_tdk_krj = 0;
            x_total_data_krj = 0;
            x_total_data_usaha = 0;
            x_total_data_lanstud = 0;
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku1, function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
                x_total_data_blm_isi += value.DATA.l_blm_isi;
                x_total_data_tdk_krj += value.DATA.l_tdk_krj;
                x_total_data_krj += value.DATA.l_krj;
                x_total_data_usaha += value.DATA.l_usaha;
                x_total_data_lanstud += value.DATA.l_lanstud;
            });
            x_data_pie.push({
                name: 'Bekerja',
                y: x_total_data_krj,
                sliced: true,
                selected: true
            }, {
                name: 'Berwirausaha',
                y: x_total_data_usaha
            }, {
                name: 'Lanjut Studi',
                y: x_total_data_lanstud
            }, {
                name: 'Tidak Bekerja',
                y: x_total_data_tdk_krj
            }, {
                name: 'Belum Mengisi',
                y: x_total_data_blm_isi
            });
            drill = 1;
            Iku1ChartPie(x_data_pie);
            Iku1ChartBar(y_title, x_data_yes, x_data_no);
            $("#navChart").html(`<a href="javascript:" class="text-dark">UNILA</a> / FAKULTAS`);
        }

        function Iku1Prodi(fak) {
            var y_id = [];
            var y_title = [];
            var x_data_yes = [];
            var x_data_no = [];
            var x_data_pie = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            x_total_data_blm_isi = 0;
            x_total_data_tdk_krj = 0;
            x_total_data_krj = 0;
            x_total_data_usaha = 0;
            x_total_data_lanstud = 0;
            $.each(dataIku1[fak]['DRILL'], function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
                x_total_data_blm_isi += value.DATA.l_blm_isi;
                x_total_data_tdk_krj += value.DATA.l_tdk_krj;
                x_total_data_krj += value.DATA.l_krj;
                x_total_data_usaha += value.DATA.l_usaha;
                x_total_data_lanstud += value.DATA.l_lanstud;
            });
            x_data_pie.push({
                name: 'Bekerja',
                y: x_total_data_krj,
                sliced: true,
                selected: true
            }, {
                name: 'Berwirausaha',
                y: x_total_data_usaha
            }, {
                name: 'Lanjut Studi',
                y: x_total_data_lanstud
            }, {
                name: 'Tidak Bekerja',
                y: x_total_data_tdk_krj
            }, {
                name: 'Belum Mengisi',
                y: x_total_data_blm_isi
            });
            drill = 2;
            Iku1ChartPie(x_data_pie);
            Iku1ChartBar(y_title, x_data_yes, x_data_no, fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark">UNILA</a> / <a href="javascript:Iku1Fakultas();" class="text-dark">FAKULTAS</a> / PRODI`
            );
        }

        function Iku1ChartBar(y_title, x_data_yes, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('Iku1ChartBar', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'IKU 1 : Lulusan Mendapat Pekerjaan yang Layak'
                },
                xAxis: {
                    categories: y_title,
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Alumni IKU 1'
                    },
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
                                        Iku1Prodi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku1[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>IKU 1 : Lulusan Mendapat Pekerjaan yang Layak</b><br>");
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku1Alumni(id_prodi);
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

        function Iku1ChartPie(x_data_pie) {
            Highcharts.chart('Iku1ChartPie', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie',
                    height: 245,
                },
                title: {
                    text: 'Status Lulusan'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y:.0f}</b>'
                },
                accessibility: {
                    point: {
                        valueSuffix: '%'
                    }
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.y:.0f}',
                        }
                    }
                },
                series: [{
                    name: 'Alumni',
                    colorByPoint: true,
                    data: x_data_pie
                }]
            });
        }

        function TbIku1Alumni(id_prodi) {
            $("#btn_modal_close").show();
            $("#btn_modal_back").hide();
            $('#exampleModal').modal('show');
            $('#tb_01').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku1Alumni') !!}',
                    type: 'GET',
                    data: {
                        id_prodi: id_prodi,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: '#',
                        data: 'x_data_yes',
                        name: 'x_data_yes',
                        render: function(data, type, row) {
                            if (data == 1) {
                                return "<center><b class='text-bold text-green'>Y</b></center>";
                            } else {
                                return "<center><b class='text-bold text-red'>T</b></center>";
                            }
                        }
                    },
                    {
                        title: 'Nama Alumni',
                        data: 'nm_pd',
                        name: 'nm_pd',
                    }, {
                        title: 'Jk',
                        data: 'jk',
                        name: 'jk',
                    },
                    {
                        title: 'Jenis Daftar',
                        data: 'nm_jns_daftar',
                        name: 'nm_jns_daftar',
                    },
                    {
                        title: 'Jalur Daftar',
                        data: 'nm_jalur_daftar',
                        name: 'nm_jalur_daftar',
                    },
                    {
                        title: 'Tgl. Masuk',
                        data: 'tgl_masuk_sp',
                        name: 'tgl_masuk_sp',
                    },
                    {
                        title: 'Tgl. Lulus',
                        data: 'tgl_keluar',
                        name: 'tgl_keluar',
                    },
                    {
                        title: 'Status Lulus',
                        data: 'l_stat_lulus',
                        name: 'l_stat_lulus',
                        render: function(data, type, row) {
                            p_nm_pd = "Status " + data + " - " + row.nm_pd + " - " + row.nipd;
                            if (data == "Bekerja" || data == "Berwirausaha") {
                                return `<a href="#" onclick="reloadTbIku1Bekerja('${row.id_reg_pd}','${p_nm_pd}')">${data}</a>`;
                            }
                            if (data == "Melanjutkan Studi") {
                                return `<a href="#" onclick="reloadTbIku1LanjutStudi('${row.id_reg_pd}','${p_nm_pd}')">${data}</a>`;
                            }
                            if (data == "Tidak Bekerja" || data == "Belum Mengisi") {
                                return data;
                            }
                        }
                    },
                ],
                order: [
                    [0, 'desc'],
                ],
            });
        }

        function reloadTbIku1Bekerja(id_reg_pd, p_nm_pd = null) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html(p_nm_pd);
            $("#x_tb_01").hide();
            $("#x_tb_02").show();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_02'))) {
                $('#tb_02').DataTable().destroy();
                TbIku1Bekerja(id_reg_pd);
            } else {
                TbIku1Bekerja(id_reg_pd);
            }
        }

        function reloadTbIku1LanjutStudi(id_reg_pd, p_nm_pd = null) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html(p_nm_pd);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").show();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_03'))) {
                $('#tb_03').DataTable().destroy();
                TbIku1LanjutStudi(id_reg_pd);
            } else {
                TbIku1LanjutStudi(id_reg_pd);
            }
        }

        function TbIku1Bekerja(id_reg_pd) {
            $('#tb_02').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku1Bekerja') !!}',
                    type: 'GET',
                    data: {
                        id_reg_pd: id_reg_pd,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Wkt. Pengisian',
                        data: 'wkt_pengisian',
                        name: 'wkt_pengisian',
                    }, {
                        title: 'Wkt. Tunggu',
                        data: 'wkt_tunggu',
                        name: 'wkt_tunggu',
                    },
                    {
                        title: 'Jns. Pekerjaan',
                        data: 'jns_tmpt_bekerja',
                        name: 'jns_tmpt_bekerja',
                    },
                    {
                        title: 'Bid. Pekerjaan',
                        data: 'nm_bid_kerja',
                        name: 'nm_bid_kerja',
                    },
                    {
                        title: 'Tmpt. Bekerja',
                        data: 'nm_tmpt_bekerja',
                        name: 'nm_tmpt_bekerja',
                    },
                    {
                        title: 'Jabatan',
                        data: 'status_jabatan',
                        name: 'status_jabatan',
                    },
                    {
                        title: 'Wilayah Kerja',
                        data: 'nm_wil',
                        name: 'nm_wil',
                    },
                    {
                        title: 'UMR Wilayah',
                        data: 'besaran_umr',
                        name: 'besaran_umr',
                    },
                    {
                        title: 'Pendapatan (Bulan)',
                        data: 'income_per_bln',
                        name: 'income_per_bln',
                    },
                    {
                        title: 'Keterangan',
                        data: 'kerja_sblm_lulus',
                        name: 'kerja_sblm_lulus',
                    },
                ],
            });
        }

        function TbIku1LanjutStudi(id_reg_pd){
            $('#tb_03').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku1LanjutStudi') !!}',
                    type: 'GET',
                    data: {
                        id_reg_pd: id_reg_pd,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Wkt. Pengisian',
                        data: 'wkt_pengisian',
                        name: 'wkt_pengisian',
                    }, {
                        title: 'Wkt. Masuk',
                        data: 'wkt_masuk',
                        name: 'wkt_masuk',
                    },
                    {
                        title: 'PT Lanjut',
                        data: 'nm_pt_lnjt',
                        name: 'nm_pt_lnjt',
                    },
                    {
                        title: 'Prodi Lanjut',
                        data: 'nm_prodi_lnjt',
                        name: 'nm_prodi_lnjt',
                    },
                ],
            });
        }
    </script>
@endpush
