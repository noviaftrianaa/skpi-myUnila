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
                    <h3 class="card-title">IKU 4: Praktisi Mengajar di Dalam Kampus</h3>
                    <div class="card-tools">
                        <button type="button" class="btn btn-tool" data-card-widget="maximize">
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
                                            value="{{ $th->id_thn_ajaran }}">{{ $th->nm_thn_ajaran }}</option>
                                    @endforeach
                                </select>
                                <div class="input-group-append">
                                    <button class="btn btn-info mr-2" onclick="Iku4Data(0)">FILTER</button>
                                    <button class="btn btn-info" onclick="Iku4Data(1)">HITUNG ULANG</button>
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
                                    <p>Dosen Memenuhi IKU 4</p>
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
                                    <p>Dosen Tidak Memenuhi IKU 4</p>
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
                                    <p>Total Dosen Pada IKU 4</p>
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
                                    <p>Presentase Pencapaian IKU 4</p>
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
                                    <p>Delta Terhadap Gold Standar IKU 4</p>
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
                        <table id="tb_01" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_01_info">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                    <div id="x_tb_02">
                        <table id="tb_02" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_02_info">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                    <div id="x_tb_03">
                        <table id="tb_03" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_03_info">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                    <div id="x_tb_04">
                        <table id="tb_04" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_04_info">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                    <div id="x_tb_05">
                        <table id="tb_05" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_05_info">
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
        let dataIku4 = [],
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
            Iku4Data();
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
            let standar = 40;
            h_total_data_capaian = (x_total_data_yes / x_total_data) * 100;
            h_total_data_gold = (h_total_data_capaian - standar);
            $('#x_total_data').text(x_total_data);
            $('#x_total_data_yes').text(x_total_data_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + '%');
            $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + '%');
        }

        function Iku4Data(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiDashboardIku4') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku4 = res;
                Iku4Fakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku4Fakultas() {
            let y_id = [],
                y_title = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku4, function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 1;
            Iku4Chart(y_title, x_data_yes, x_data_no);
            $("#navChart").html(`<a href="javascript:" class="text-dark">UNILA</a> / FAKULTAS`);
        }

        function Iku4Prodi(fak) {
            let y_id = [],
                y_title = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku4[fak]['DRILL'], function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 2;
            Iku4Chart(y_title, x_data_yes, x_data_no, fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark">UNILA</a> / <a href="javascript:Iku4Fakultas();" class="text-dark">FAKULTAS</a> / PRODI`
            );
        }

        function Iku4Chart(y_title, x_data_yes, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('container', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'IKU 4: Praktisi Mengajar di Dalam Kampus'
                },
                xAxis: {
                    categories: y_title
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Dosen IKU 4'
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
                                        Iku4Prodi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku4[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>IKU 4 : DOSEN BERKEGIATAN DILUAR KAMPUS</b><br>");
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku4Dosen(id_prodi);
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

        function reloadTbIku4Pendidikan(id_sdm, nm_sdm, nidn) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html("Pendidikan - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").show();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_02'))) {
                $('#tb_02').DataTable().destroy();
                TbIku4Pendidikan(id_sdm, nm_sdm, nidn);
            } else {
                TbIku4Pendidikan(id_sdm, nm_sdm, nidn);
            }
        }

        function reloadTbIku4Sertifikasi(id_sdm, nm_sdm, nidn) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html("Sertifikasi - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").show();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_03'))) {
                $('#tb_03').DataTable().destroy();
                TbIku4Sertifikasi(id_sdm, nm_sdm, nidn);
            } else {
                TbIku4Sertifikasi(id_sdm, nm_sdm, nidn);
            }
        }

        function reloadTbIku4Praktisi(id_sdm, nm_sdm, nidn) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html("Praktisi - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").show();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_04'))) {
                $('#tb_04').DataTable().destroy();
                TbIku4Praktisi(id_sdm, nm_sdm, nidn);
            } else {
                TbIku4Praktisi(id_sdm, nm_sdm, nidn);
            }
        }

        function TbIku4Dosen(id_prodi) {
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
                    url: '{!! route('apiIku4Dosen') !!}',
                    type: 'GET',
                    data: {
                        id_prodi: id_prodi,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: '#',
                        render: function(data, type, row) {
                            if ((row.l_pend > 0 || row.nidk != null) && (row.l_sert > 0 || row.l_praktisi > 0)) {
                                return "<center><b class='text-bold text-green'>Y</b></center>";
                            } else {
                                return "<center><b class='text-bold text-red'>T</b></center>";
                            }
                        }
                    },
                    {
                        title: 'Nama Dosen',
                        data: 'nm_sdm',
                        name: 'nm_sdm',
                    }, {
                        title: 'Jk',
                        data: 'jk',
                        name: 'jk',
                    }, {
                        title: 'Nidn',
                        data: 'l_nidn',
                        name: 'l_nidn',
                    },
                    {
                        title: 'Nidk',
                        data: 'l_nidk',
                        name: 'l_nidk',
                    },
                    {
                        title: 'Tgl. Lhr',
                        data: 'tgl_lahir',
                        name: 'tgl_lahir',
                    },
                    {
                        title: 'Pend. Akhir',
                        data: 'pend_akhir',
                        name: 'pend_akhir',
                    },
                    {
                        title: 'Ikatan',
                        data: 'ikatan_kerja',
                        name: 'ikatan_kerja',
                    },
                    {
                        title: 'Keaktifan',
                        data: 'keaktifan',
                        name: 'keaktifan',
                    },
                    {
                        title: 'Pend. S3',
                        data: 'l_pend',
                        name: 'l_pend',
                        render: function(data, type, row) {
                            return `<a href="#" onclick="reloadTbIku4Pendidikan('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Sertifikasi',
                        data: 'l_sert',
                        name: 'l_sert',
                        render: function(data, type, row) {
                            return `<a href="#" onclick="reloadTbIku4Sertifikasi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Praktisi',
                        data: 'l_praktisi',
                        name: 'l_praktisi',
                        render: function(data, type, row) {
                            return `<a href="#" onclick="reloadTbIku4Praktisi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                ],
                order: [
                    [9, 'desc'],
                    [10, 'desc'],
                    [11, 'desc']
                ],
            });
        }

        function TbIku4Pendidikan(id_sdm, nm_sdm, nidn) {
            $('#tb_02').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku4Pendidikan') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Nama SP',
                        data: 'nm_sp_formal',
                        name: 'nm_sp_formal',
                    }, {
                        title: 'Bidang Studi',
                        data: 'bid_studi',
                        name: 'bid_studi',
                    }, {
                        title: 'Thn. Masuk',
                        data: 'thn_masuk',
                        name: 'thn_masuk',
                    },
                    {
                        title: 'Thn. Lulus',
                        data: 'thn_lulus',
                        name: 'thn_lulus',
                    },
                ],
            });
        }

        function TbIku4Sertifikasi(id_sdm, nm_sdm, nidn) {
            $('#tb_03').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku4Sertifikasi') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Jenis',
                        data: 'nm_jns_sert',
                        name: 'nm_jns_sert',
                    }, {
                        title: 'Bidang',
                        data: 'nm_bid_studi',
                        name: 'nm_bid_studi',
                    }, {
                        title: 'SK',
                        data: 'sk_sert',
                        name: 'sk_sert',
                    },
                    {
                        title: 'NRG',
                        data: 'nrg',
                        name: 'nrg',
                    },
                    {
                        title: 'No. Peserta',
                        data: 'no_peserta',
                        name: 'no_peserta',
                    },
                    {
                        title: 'Thn. Sert',
                        data: 'thn_sert',
                        name: 'thn_sert',
                    },
                ],
            });
        }

        function TbIku4Praktisi(id_sdm, nm_sdm, nidn) {
            $('#tb_04').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku4Praktisi') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Bidang',
                        data: 'bid_pekerjaan',
                        name: 'bid_pekerjaan',
                    }, {
                        title: 'Jabatan',
                        data: 'nm_jabatan',
                        name: 'nm_jabatan',
                    }, {
                        title: 'Instansi',
                        data: 'instansi',
                        name: 'instansi',
                    },
                    {
                        title: 'Mulai Kerja',
                        data: 'mulai_bekerja',
                        name: 'mulai_bekerja',
                    },
                    {
                        title: 'Selesai Kerja',
                        data: 'selesai_bekerja',
                        name: 'selesai_bekerja',
                    },
                ],
            });
        }
    </script>
@endpush
