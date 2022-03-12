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
            var dosen_nomor_induk = '{!! $total_dosen !!}';
            var dosen_jabfung = '{!! $total_dosen_jabfung !!}';
            var data_dosen_nomor_induk = [];
            var data_dosen_jabfung = [];
            var kategori_dosen_nomor_induk = [];
            var kategori_dosen_jabfung = [];
            $.each(JSON.parse(dosen_nomor_induk),function (i, k) {
                data_dosen_nomor_induk.push([
                    i, parseInt(k)
                ]);
                kategori_dosen_nomor_induk.push(i);
            });

            $.each(JSON.parse(dosen_jabfung),function (i, k) {
                data_dosen_jabfung.push([
                    i, parseInt(k)
                ]);
                kategori_dosen_jabfung.push(i);
            });
            chart_show('Sebaran Dosen','berdasarkan Nomor Induk',data_dosen_nomor_induk,'dosen','Jumlah Dosen',kategori_dosen_nomor_induk,'');
            chart_show('Sebaran Dosen','berdasarkan Jabatan Fungsional',data_dosen_jabfung,'dosen_jabfung','Jumlah Dosen',kategori_dosen_jabfung,'');
            function chart_show(title,subtitle,data,target,y_axis,kategori,title_kategori) {
                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        type: 'column',
                        backgroundColor: 'rgba(0,0,0,0)'
                    },
                    title: {
                        text: title,
                        style: {
                            color: "#ffffff"
                        }
                    },
                    xAxis: {
                        categories: kategori,
                        crosshair: true,
                        title: {
                            text: title_kategori,
                            style: {
                                color: "#ffffff"
                            }
                        },
                        labels: {
                            style: {
                                color: '#FFFFFF',
                            }
                        },
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Jumlah Dosen',
                            style: {
                                color: "#ffffff"
                            }
                        },
                        labels: {
                            style: {
                                color: '#FFFFFF',
                            }
                        },
                    },
                    subtitle: {
                        text: subtitle
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
                                enabled: true,
                                style: {
                                    color: '#FFFFFF',
                                }
                            }
                        }
                    },
                    legend: {
                        itemWidth: 220,
                        itemStyle: {
                            font: 'Trebuchet MS, Verdana, sans-serif',
                            color: '#A0A0A0'
                        },
                        itemHoverStyle: {
                            color: '#FFF'
                        },
                        itemHiddenStyle: {
                            color: '#444'
                        }
                    },
                    series: [{
                        name: 'Total Peserta',
                        data: data
                    }],
                    credits: {
                        enabled: false
                    }
                });
            }
        });
    </script>
@endpush
