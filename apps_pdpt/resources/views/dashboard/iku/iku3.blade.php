@extends('template_public.default')
@include('__partial.highchart')
@include('__partial.datatable_yajra')

@section('content')
    <div class="row">
        <div class="col">
            <div class="card">
                <div class="card-body">
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
                            <div class="small-box bg-purple">
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
                            <div class="small-box bg-purple">
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
                    <div class="row">
                        <div class="col">
                            <div id="container" style="width: 100%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <table id="example1" class="table table-bordered table-striped dataTable dtr-inline"
                        aria-describedby="example1_info">
                    </table>
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
            Iku3Data();
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

        function Iku3Data() {
            $.ajax({
                type: 'GET',
                url: "{{ route('apiDashboardIku3') }}",
            }).done(function(res) {
                dataIku3 = res;
                Iku3Fakultas();
            }).fail(function(res) {
                console.log(res);
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
        }

        function Iku3ProdiDetail(fak, prod) {
            $.ajax({
                type: 'GET',
                url: "{{ route('apiIku3Detail') }}",
                data: {
                    id_fakultas: dataIku3[fak]['DRILL'][prod]['DATA']['y_id']
                }
            }).done(function(res) {
                console.log(res);
            }).fail(function(res) {
                console.log(res);
            });
        }

        function Iku3Chart(y_title, x_data_yes, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('container', {
                chart: {
                    type: 'bar',
                    height: 600,
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
                                        modalDrill01(id_prodi);
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

        function modalDrill01(param) {
            $('#exampleModal').modal('show');
            $('#example1').DataTable({
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
                        id_prodi: param
                    }
                },
                columns: [{
                        title: 'NIDN/NIDK',
                        data: 'nidn',
                        name: 'nidn',
                    }, {
                        title: 'Nama Dosen',
                        data: 'nm_sdm',
                        name: 'nm_sdm',
                    },
                    {
                        title: 'Pend. Akhir',
                        data: 'pend_akhir',
                        name: 'pend_akhir',
                    },
                    {
                        title: 'Ikatan Kerja',
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
                    },
                    {
                        title: 'QS100',
                        data: 'l_qs100',
                        name: 'l_qs100',
                    },
                    {
                        title: 'Praktisi',
                        data: 'l_praktisi',
                        name: 'l_praktisi',
                    },
                    {
                        title: 'Prestasi',
                        data: 'l_prestasi',
                        name: 'l_prestasi',
                    }
                ],
            });
        }
    </script>
@endpush
