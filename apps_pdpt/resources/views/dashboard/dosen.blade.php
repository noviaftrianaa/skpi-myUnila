@extends('template_public.default')
@include('__partial.highchart')

@section('content')
    <div class="container">
        <div class="card">
            <div class="card-header"><h3 class="card-title">Dashboard</h3></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-6">
                        <div id="dosen_rasio_jk"></div>
                    </div>
                    <div class="col-sm-6">
                        <div id="dosen_rasio_jabfung"></div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <div id="dosen_rasio_pendidikan"></div>
                    </div>
                    <div class="col-sm-6">
                        <div id="dosen_rasio_pangkat"></div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-6">
                        <div id="dosen_rasio_ikatan_kerja"></div>
                    </div>
                    <div class="col-sm-6">
                        <div id="dosen_berdasarkan_usia"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script>
        $(document).ready( function () {
            function reloadChartUsia(target,title,data)
            {
                chartUsia = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        type: 'bar'
                    },
                    title: {
                        text: title
                    },
                    subtitle: {
                        text: $nm_wil+'Tahun '+$("#selectYear").val()
                    },
                    xAxis: [{
                        categories: categories,
                        reversed: false,
                        labels: {
                            step: 1
                        }
                    }, { // mirror axis on right side
                        opposite: true,
                        reversed: false,
                        categories: categories,
                        linkedTo: 0,
                        labels: {
                            step: 1
                        }
                    }],
                    yAxis: {
                        title: {
                            text: null
                        },
                        labels: {
                            formatter: function () {
                                return Math.abs(this.value);
                            }
                        }
                    },
                    plotOptions: {
                        series: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    return Highcharts.numberFormat(Math.abs(this.point.y), 0);
                                },
                                crop: false,
                                inside: false,
                                overflow: 'none'
                            }
                        }
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.series.name + ', usia ' + this.point.category + '</b><br/>' +
                                'Jumlah: ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
                        }
                    },
                    series: data,
                    credits: {
                        enabled: false
                    }
                });
            }

            $("#selectYear").change(function() {
                loading(id_wil,nm_wil,false,kualifikasi);
            });

            $("#lembaga").change(function() {
                if($('#lembaga option:selected').text() != 'Semua Unit'){
                    getPt($("#lembaga").val());
                }
                else{
                    loading(id_wil,nm_wil,false,kualifikasi);
                }
            });

            $("#kualifikasi").change(function() {
                loading(id_wil,nm_wil,false,$(this).val());
            });

            $("#perguruan_tinggi").change(function() {
                if($(this).val() != 'all'){
                    reloading(id_wil,nm_wil);
                    $('#peta_indonesia').hide();
                    $('#nama_wilayah').hide();
                    $('#top_univ').hide();
                    $('#min_univ').hide();
                }
                else{
                    loading(id_wil,nm_wil,false,kualifikasi);
                    $('#peta_indonesia').show();
                    $('#nama_wilayah').show();
                    $('#top_univ').show();
                    $('#min_univ').show();
                }
            });

            $("#backNasional").click(function() {
                id_wil          = '';
                nm_wil          = 'Indonesia';
                loading(id_wil,nm_wil,false,kualifikasi);
            });

            $("#reloadTemp").click(function() {
                reloading(id_wil,nm_wil);
            });

            function reloadPieChart(target,title,data){
                $nm_wil = $("#nm_wil").html();

                if($nm_wil === undefined){
                    $nm_wil = '';
                }
                else{
                    $nm_wil = $("#nm_wil").html() + ' ';
                }

                if(target == 'chartJk'){
                    $legend = false;
                }
                else{
                    $legend = 220;
                }

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
                        }
                    },
                    title: {
                        text: title
                    },
                    subtitle: {
                        text: $nm_wil+'Tahun '+$("#selectYear").val()
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
                                format: '{point.name}' + '<br/>' + '{point.y} ({point.percentage:.1f} %)'
                            },
                            showInLegend: false
                        }
                    },
                    legend: {
                        itemWidth: $legend,
                        borderWidth: 1,
                        shadow: true

                    },
                    series: [{
                        type: 'pie',
                        colorByPoint: true,
                        name: 'Jumlah',
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
