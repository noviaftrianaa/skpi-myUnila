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
                    <h3 class="card-title">IKU 3 : Dosen Berkegiatan Diluar Kampus</h3>
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
                                    @foreach($thn_iku as $th)
                                        <option {{ ($th->a_periode_aktif == 1) ? 'selected' : '' }} value="{{ $th->id_thn_ajaran }}">{{ $th->id_thn_ajaran }}</option>
                                    @endforeach
                                </select>
                                <div class="input-group-append">
                                    <button class="btn btn-info mr-2" onclick="Iku3Data(0)">FILTER</button>
                                    <button class="btn btn-info" onclick="Iku3Data(1)">HITUNG ULANG</button>
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
                                    <p>Dosen Memenuhi IKU 3</p>
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
                                    <p>Dosen Tidak Memenuhi IKU 3</p>
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
                                    <p>Total Dosen IKU 3</p>
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
                                    <p>Presentase Capaian IKU 3</p>
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
                                    <p>Delta Gold Standar IKU 3</p>
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
                        <button class="btn btn-danger" data-dismiss="modal" aria-label="Close"><i
                                class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="modal-body">
                    <div id="x_tb_01">
                        <table id="tb_01" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_01_info">
                            <thead class="bg-info"></thead>
                        </table>
                    </div>
                    <div id="x_tb_02">
                        <table id="tb_02" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_02_info">
                            <thead class="bg-info"></thead>
                        </table>
                    </div>
                    <div id="x_tb_03">
                        <table id="tb_03" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_03_info">
                            <thead class="bg-info"></thead>
                        </table>
                    </div>
                    <div id="x_tb_04">
                        <table id="tb_04" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_04_info">
                            <thead class="bg-info"></thead>
                        </table>
                    </div>
                    <div id="x_tb_05">
                        <table id="tb_05" class="table table-bordered table-striped dataTable dtr-inline"
                            aria-describedby="tb_05_info">
                            <thead class="bg-info"></thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script>
        let dataIku3 = [],
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
            Iku3Data();
        });

        $("#btn_modal_back").click(function() {
            $("#txt3_modal").html("");
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
        });

        function refreshTotal() {
            let standar = 20;
            h_total_data_capaian = (x_total_data_yes / x_total_data) * 100;
            h_total_data_gold = (h_total_data_capaian - standar);
            $('#x_total_data').text(x_total_data);
            $('#x_total_data_yes').text(x_total_data_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + ' %');
            $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + ' %');
        }

        function Iku3Data(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiDashboardIku3') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku3 = res;
                Iku3Fakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku3Fakultas() {
            let y_id = [],
                y_title = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku3, function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 1;
            Iku3Chart(y_title, x_data_yes, x_data_no);
            $("#navChart").html(`<a href="javascript:" class="text-dark">UNILA</a> / FAKULTAS`);
        }

        function Iku3Prodi(fak) {
            let y_id = [],
                y_title = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku3[fak]['DRILL'], function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 2;
            Iku3Chart(y_title, x_data_yes, x_data_no, fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark">UNILA</a> / <a href="javascript:Iku3Fakultas();" class="text-dark">FAKULTAS</a> / PRODI`
                );
        }

        function Iku3Chart(y_title, x_data_yes, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('container', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'IKU 3 : Dosen Berkegiatan di Luar Kampus'
                },
                xAxis: {
                    categories: y_title
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Dosen IKU 3'
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
                                        Iku3Prodi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku3[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>IKU 3 : DOSEN BERKEGIATAN DILUAR KAMPUS</b><br>");
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku3Dosen(id_prodi);
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

        function reloadTbIku3Tridharma(id_sdm, nm_sdm, nidn) {
            $("#txt3_modal").html("TRIDHARMA - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").show();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_02'))) {
                $('#tb_02').DataTable().destroy();
                TbIku3Tridharma(id_sdm, nm_sdm, nidn);
            } else {
                TbIku3Tridharma(id_sdm, nm_sdm, nidn);
            }
        }

        function reloadTbIku3Qs100(id_sdm, nm_sdm, nidn) {
            $("#txt3_modal").html("Qs100 - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").show();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_03'))) {
                $('#tb_03').DataTable().destroy();
                TbIku3Qs100(id_sdm, nm_sdm, nidn);
            } else {
                TbIku3Qs100(id_sdm, nm_sdm, nidn);
            }
        }

        function reloadTbIku3Praktisi(id_sdm, nm_sdm, nidn) {
            $("#txt3_modal").html("Praktisi - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").show();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_04'))) {
                $('#tb_04').DataTable().destroy();
                TbIku3Praktisi(id_sdm, nm_sdm, nidn);
            } else {
                TbIku3Praktisi(id_sdm, nm_sdm, nidn);
            }
        }

        function reloadTbIku3Prestasi(id_sdm, nm_sdm, nidn) {
            $("#txt3_modal").html("Prestasi - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").show();
            if ($.fn.dataTable.isDataTable($('#tb_05'))) {
                $('#tb_05').DataTable().destroy();
                TbIku3Prestasi(id_sdm, nm_sdm, nidn);
            } else {
                TbIku3Prestasi(id_sdm, nm_sdm, nidn);
            }
        }

        function TbIku3Dosen(id_prodi) {
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
                    url: '{!! route('apiIku3Dosen') !!}',
                    type: 'GET',
                    data: {
                        id_prodi: id_prodi,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: '#',
                        render: function(data, type, row) {
                            if (row.l_tridharma > 0 || row.l_qs100 > 0 || row.l_praktisi > 0 || row
                                .l_prestasi > 0) {
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
                        title: 'JK',
                        data: 'jk',
                        name: 'jk',
                    }, {
                        title: 'NIDN/NIDK',
                        data: 'nidn',
                        name: 'nidn',
                    },
                    {
                        title: 'Tgl. Lahir',
                        data: 'tgl_lahir',
                        name: 'tgl_lahir',
                    },
                    {
                        title: 'Pend',
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
                        title: 'Tridharma',
                        data: 'l_tridharma',
                        name: 'l_tridharma',
                        render: function(data, type, row) {
                            return `<a href="#" onclick="reloadTbIku3Tridharma('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'QS100',
                        data: 'l_qs100',
                        name: 'l_qs100',
                        render: function(data, type, row) {
                            return `<a href="#" onclick="reloadTbIku3Qs100('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Praktisi',
                        data: 'l_praktisi',
                        name: 'l_praktisi',
                        render: function(data, type, row) {
                            return `<a href="#" onclick="reloadTbIku3Praktisi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Prestasi',
                        data: 'l_prestasi',
                        name: 'l_prestasi',
                        render: function(data, type, row) {
                            return `<a href="#" onclick="reloadTbIku3Prestasi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    }
                ],
                order: [
                    [8, 'desc'],
                    [9, 'desc'],
                    [10, 'desc'],
                    [11, 'desc']
                ],
            });
        }

        function TbIku3Tridharma(id_sdm, nm_sdm, nidn) {
            $('#tb_02').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku3Tridharma') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Jenis',
                        data: 'jns_litabmas',
                        name: 'jns_litabmas',
                    }, {
                        title: 'Peran',
                        data: 'peran_litabmas',
                        name: 'peran_litabmas',
                    }, {
                        title: 'Afiliasi',
                        data: 'afiliasi_litabmas',
                        name: 'afiliasi_litabmas',
                    },
                    {
                        title: 'Judul',
                        data: 'judul_litabmas',
                        name: 'judul_litabmas',
                    },
                    {
                        title: 'Tahun Laks.',
                        data: 'thn_laks_litabmas',
                        name: 'thn_laks_litabmas',
                    }
                ],
            });
        }

        function TbIku3Qs100(id_sdm, nm_sdm, nidn) {
            $('#tb_03').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku3Qs100') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Bidang',
                        data: 'bid_tgs',
                        name: 'bid_tgs',
                    }, {
                        title: 'SP Sumber',
                        data: 'sp_sumber',
                        name: 'sp_sumber',
                    }, {
                        title: 'SP Sasaran',
                        data: 'sp_sasaran',
                        name: 'sp_sasaran',
                    },
                    {
                        title: 'Tgl. Mulai',
                        data: 'tgl_mulai',
                        name: 'tgl_mulai',
                    }
                ],
            });
        }

        function TbIku3Praktisi(id_sdm, nm_sdm, nidn) {
            $('#tb_04').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku3Praktisi') !!}',
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
                    }
                ],
            });
        }

        function TbIku3Prestasi(id_sdm, nm_sdm, nidn) {
            $('#tb_05').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku3Prestasi') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Nama',
                        data: 'nm_pd',
                        name: 'nm_pd',
                    }, {
                        title: 'JK',
                        data: 'jk',
                        name: 'jk',
                    }, {
                        title: 'NPM',
                        data: 'nipd',
                        name: 'nipd',
                    },
                    {
                        title: 'Tgl. Lahir',
                        data: 'tgl_lahir',
                        name: 'tgl_lahir',
                    },
                    {
                        title: 'Prodi',
                        data: 'nm_prodi',
                        name: 'nm_prodi',
                    },
                    {
                        title: 'Jurusan',
                        data: 'nm_jur',
                        name: 'nm_jur',
                    },
                    {
                        title: 'Fakultas',
                        data: 'nm_fak',
                        name: 'nm_fak',
                    },
                    {
                        title: 'Jns Prestasi',
                        data: 'nm_jenis_prestasi',
                        name: 'nm_jenis_prestasi',
                    },
                    {
                        title: 'Nm Prestasi',
                        data: 'nm_prestasi',
                        name: 'nm_prestasi',
                    },
                    {
                        title: 'Penyelenggara',
                        data: 'penyelenggara',
                        name: 'penyelenggara',
                    },
                    {
                        title: 'Peringkat',
                        data: 'peringkat',
                        name: 'peringkat',
                    },
                    {
                        title: 'Thn Prestasi',
                        data: 'thn_prestasi',
                        name: 'thn_prestasi',
                    },
                ],
            });
        }
    </script>
@endpush
