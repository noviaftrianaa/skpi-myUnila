@extends('layouts/layoutMaster')
@include('_partials.__partial.highchart')
@section('title', $judul)

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-dashboard"></i> {{ $judul }} Semester {{ $semester->nm_smt }}</h3>
                    </div>
                    <div class="card-body">
                        <form action="{{ route('dashboard_mahasiswa') }}" method="GET">
                            {!! FormInputSelect('smt','Semester',$semester_list,false,false,$smt_pilih) !!}
                        </form>
                        <div class="row">
                            <div class="col-sm-6">
                                <div id="rekap_mhs"></div>
                            </div>
                            <div class="col-sm-6">
                                <div id="rekap_negara_mhs"></div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-6">
                                <div id="rekap_ipk"></div>
                            </div>
                            <div class="col-sm-6">
                                <div id="rekap_masa_mukim"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script>
        $(document).ready( function () {
            var mhs_dashboard = '{!! $dashboard_mhs !!}';
            var data_mhs_dashboard = [];
            $.each(JSON.parse(mhs_dashboard),function (i, k) {
                if(parseInt(k)>0) {
                    data_mhs_dashboard.push([
                        i, parseInt(k)
                    ]);
                }
            });
            reloadPieChart('rekap_mhs','Sebaran Mahasiswa berdasarkan Status Semester',data_mhs_dashboard);

            var mhs_negara_dashboard = '{!! $dashboard_mhs_asing !!}';
            var data_mhs_negara_dashboard = [];
            $.each(JSON.parse(mhs_negara_dashboard),function (i, k) {
                if(parseInt(k)>0) {
                    data_mhs_negara_dashboard.push([
                        i, parseInt(k)
                    ]);
                }
            });
            reloadPieChart('rekap_negara_mhs','Sebaran Mahasiswa berdasarkan Kewarganegaraan',data_mhs_negara_dashboard);

            var ipk_mhs = '{!! $dashboard_ipk_mhs !!}';
            var data_ipk_mhs = [];
            var kategori_ipk_mhs = [];
            $.each(JSON.parse(ipk_mhs),function (i, k) {
                if(parseInt(k)>0) {
                    data_ipk_mhs.push([
                        i, parseInt(k)
                    ]);
                    kategori_ipk_mhs.push(i);
                }
            });
            chart_show('Sebaran Mahasiswa','berdasarkan IPK Semester',data_ipk_mhs,'rekap_ipk','Jumlah Mahasiswa',kategori_ipk_mhs);

            var masa_mukim_mhs = '{!! $dashboard_masa_mukim_mhs !!}';
            var data_masa_mukim_mhs = [];
            var kategori_masa_mukim_mhs = [];
            $.each(JSON.parse(masa_mukim_mhs),function (i, k) {
                if(parseInt(k)>0) {
                    data_masa_mukim_mhs.push([
                        i, parseInt(k)
                    ]);
                    kategori_masa_mukim_mhs.push(i);
                }
            });
            chart_show('Sebaran Mahasiswa','berdasarkan Lama Studi',data_masa_mukim_mhs,'rekap_masa_mukim','Jumlah Mahasiswa',kategori_masa_mukim_mhs);

            function chart_show(title,subtitle,data,target,y_axis,kategori,title_kategori) {
                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        type: 'column',
                        backgroundColor: 'rgba(0,0,0,0)'
                    },
                    title: {
                        text: title,
                    },
                    xAxis: {
                        categories: kategori,
                        crosshair: true,
                        title: {
                            text: title_kategori,
                        },
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Jumlah Mahasiswa',
                        },
                    },
                    subtitle: {
                        text: subtitle
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y} mahasiswa</b></td></tr>',
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
                            }
                        }
                    },
                    legend: {
                        itemWidth: 220,
                        itemStyle: {
                            font: 'Trebuchet MS, Verdana, sans-serif',
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

            function chart_tipe_show(title,tipe,subtitle,data,target,y_axis,kategori,title_kategori,hover) {
                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        type: tipe,
                        backgroundColor: 'rgba(0,0,0,0)'
                    },
                    title: {
                        text: title,
                    },
                    xAxis: {
                        categories: kategori,
                        crosshair: true,
                        title: {
                            text: title_kategori,
                        },
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: y_axis,
                        },
                    },
                    subtitle: {
                        text: subtitle
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y} '+hover+'</b></td></tr>',
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
                            }
                        }
                    },
                    legend: {
                        itemWidth: 220,
                        itemStyle: {
                            font: 'Trebuchet MS, Verdana, sans-serif',
                        },
                        itemHiddenStyle: {
                            color: '#444'
                        }
                    },
                    series: data,
                    credits: {
                        enabled: false
                    }
                });
            }

            function reloadPieChart(target,title,data){
                Highcharts.setOptions({
                    colors: ['#3498DB', '#34495E', '#F1C40F', '#E67E22', '#E74C3C', '#ECF0F1', '#95A5A6', '#1ABC9C', '#2ECC71', '#9B59B6', '#C0392B', '#F39C12','#16A085','#2980B9','#2C3E50']
                });

                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        type: 'pie',
                        options3d: {
                            enabled: true,
                            alpha: 45,
                            beta: 0
                        },
                        backgroundColor: 'rgba(0,0,0,0)'
                    },
                    title: {
                        text: title,
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y} ({point.percentage:.1f} %)</b>'
                    },
                    plotOptions: {
                        pie: {
                            point: {
                                events: {
                                    click: function () {
                                        // alert(this.wil);
                                    },
                                    legendItemClick: function () {
                                        // some code here to achieve my goal
                                        this.select();
                                        chart.tooltip.refresh(this);
                                        return false; // <== returning false will cancel the default action
                                    }
                                }
                            }, allowPointSelect: true,
                            cursor: 'pointer',
                            depth: 25,
                            innerSize: 35,
                            dataLabels: {
                                enabled: true,
                                format: '{point.name}' + '<br/>' + '{point.y} ({point.percentage:.1f} %)',
                            },
                            showInLegend: false
                        }
                    },
                    legend: {
                        itemWidth: 220,
                        borderWidth: 1,
                        shadow: true

                    },
                    series: [{
                        type: 'pie',
                        colorByPoint: true,
                        name: 'Jumlah',
                        data: data,
                    }],
                    credits: {
                        enabled: false
                    }
                });
            }

            $('#smt').on('change', function() {
                this.form.submit();
            });
        });
    </script>
@endpush
