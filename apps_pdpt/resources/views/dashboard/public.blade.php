@extends('template_public.default')
@include('__partial.highchart')

@section('content')
    <div class="container">
        <div class="card">
            <div class="card-header"><h3 class="card-title">Dashboard</h3></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-4">
                        <div id="dosen"></div>
                    </div>
                    <div class="col-sm-8">
                        <div id="dosen_jabfung"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script>
        $(document).ready( function () {
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'dosen',
                    type: 'column'
                },
                title: {
                    text: 'Sebaran Dosen'
                },
                xAxis: {
                    categories: ['NIDN','NIDK'],
                    crosshair: true,
                    title: {
                        text: 'Dosen Berdasarkan Nomor Induk'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Jumlah Dosen'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y} dosen</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    itemWidth: 220
                },
                series: [{
                    name: 'Total Peserta',
                    data: [1285,46]
                }],
                credits: {
                    enabled: false
                }
            });

            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'dosen_jabfung',
                    type: 'column'
                },
                title: {
                    text: 'Sebaran Dosen berdasarkan jabfung'
                },
                xAxis: {
                    categories: ['Belum memiliki Jabfung','Asisten Ahli','Lektor','Lektor Kepala','Guru Besar'],
                    crosshair: true,
                    title: {
                        text: 'Nama Jabatan Fungsional'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Jumlah Dosen'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y} dosen</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    itemWidth: 220
                },
                series: [{
                    name: 'Total Dosen',
                    data: [256,195,445,312,77]
                }],
                credits: {
                    enabled: false
                }
            });
        });
    </script>
@endpush
