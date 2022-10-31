@extends('template_public.default')
@section('content')
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <script src="https://code.highcharts.com/modules/drilldown.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>

    <div class="row">
        <div class="col">
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-success">
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
                            <div class="small-box bg-danger">
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
                            <div class="small-box bg-blue">
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
                    <div class="row mt-3">
                        <div class="col">
                            <div id="container" style="width: 100%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

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
            let standar = 0.2;
            h_total_data_capaian = x_total_data_yes / x_total_data;
            h_total_data_gold = h_total_data_capaian - standar;
            $('#x_total_data').text(x_total_data);
            $('#x_total_data_yes').text(x_total_data_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian);
            $('#h_total_data_gold').text(h_total_data_gold);
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
                    height: 800,
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
                                        let id_fakultas = dataIku3[fak]['DRILL'][event.point.category]['DATA']['y_id'];
                                        window.open("{!! route('apiIku3Detail') !!}/?id_fakultas=" + id_fakultas);
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
@endsection
