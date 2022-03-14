@extends('template_public.default')
@include('__partial.highchart')

@section('content')
    <div class="container">
        <div class="card">
            <div class="card-header"><h3 class="card-title">Sebaran Dosen Tahun <span id="selectYear">{{ $tahun_pilih }}</span></h3></div>
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
            var dosen_jk = '{!! $dosen_jk !!}';
            var data_dosen_jk = [];
            var kategori_dosen_jk = [];
            $.each(JSON.parse(dosen_jk),function (i, k) {
                data_dosen_jk.push([
                    i, parseInt(k)
                ]);
                kategori_dosen_jk.push(i);
            });

            var dosen_jabfung = '{!! $dosen_jabfung_detail !!}';
            var data_dosen_jabfung = [];
            var kategori_dosen_jabfung = [];
            $.each(JSON.parse(dosen_jabfung),function (i, k) {
                data_dosen_jabfung.push([
                    i, parseInt(k)
                ]);
                kategori_dosen_jabfung.push(i);
            });

            var dosen_kepangkatan = '{!! $dosen_kepangkatan_detail !!}';
            var data_dosen_kepangkatan = [];
            var kategori_dosen_kepangkatan = [];
            $.each(JSON.parse(dosen_kepangkatan),function (i, k) {
                data_dosen_kepangkatan.push([
                    i, parseInt(k)
                ]);
                kategori_dosen_kepangkatan.push(i);
            });

            var dosen_pendidikan = '{!! $dosen_pendidikan_detail !!}';
            var data_dosen_pendidikan = [];
            var kategori_dosen_pendidikan = [];
            $.each(JSON.parse(dosen_pendidikan),function (i, k) {
                data_dosen_pendidikan.push([
                    i, parseInt(k)
                ]);
                kategori_dosen_pendidikan.push(i);
            });

            var dosen_ikatan = '{!! $dosen_ikatan_detail !!}';
            var data_dosen_ikatan = [];
            var kategori_dosen_ikatan = [];
            $.each(JSON.parse(dosen_ikatan),function (i, k) {
                data_dosen_ikatan.push([
                    i, parseInt(k)
                ]);
                kategori_dosen_ikatan.push(i);
            });

            reloadPieChart('dosen_rasio_jk','Sebaran Dosen berdasarkan Jenis Kelamin',data_dosen_jk);
            reloadPieChart('dosen_rasio_jabfung','Sebaran Dosen berdasarkan Jabatan Fungsional',data_dosen_jabfung);
            reloadPieChart('dosen_rasio_pendidikan','Sebaran Dosen berdasarkan Kualifikasi Pendidikan',data_dosen_pendidikan);
            reloadPieChart('dosen_rasio_pangkat','Sebaran Dosen berdasarkan Pangkat Golongan',data_dosen_kepangkatan);
            reloadPieChart('dosen_rasio_ikatan_kerja','Sebaran Dosen berdasarkan Ikatan Kerja',data_dosen_ikatan);

            $("#selectYear").change(function() {
                loading(id_wil,nm_wil,false,kualifikasi);
            });

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
                        style: {
                            color: "#ffffff"
                        }
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
                                style: {
                                    color: "#ffffff"
                                }
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

            tempL       = [];
            tempP       = [];
            laki        = [];
            perempuan   = [];
            var categories          = ['0-30', '31-40', '41-50', '51-60', '61-80', '80+'];
            var dosen_usia = '{!! $dosen_usia_detail !!}';
            $.each(JSON.parse(dosen_usia), function(i, item) {
                if(item.jk=='L'){
                    tempL[item.umur] = item.total;
                }
                else{
                    tempP[item.umur] = item.total;
                }
            });
            for(i = 0; i < categories.length; i++){
                if(tempL[categories[i]]){
                    laki.push(Math.abs(parseInt(tempL[categories[i]])) * -1);
                }
                else{
                    laki.push(0);
                }
            }
            for(i = 0; i < categories.length; i++){
                if(tempP[categories[i]]){
                    perempuan.push(parseInt(tempP[categories[i]]));
                }
                else{
                    perempuan.push(0);
                }
            }
            dataUsia = [{
                name: 'Laki-Laki',
                data: laki
            }, {
                name: 'Perempuan',
                data: perempuan
            }];
            reloadChartUsia('dosen_berdasarkan_usia','Sebaran Dosen berdasarkan Usia dan Jenis Kelamin',dataUsia)

            function reloadChartUsia(target,title,data)
            {
                chartUsia = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        type: 'bar',
                        backgroundColor: 'rgba(0,0,0,0)'
                    },
                    title: {
                        text: title,
                        style: {
                            color: "#ffffff"
                        }
                    },
                    xAxis: [{
                        categories: categories,
                        reversed: false,
                        labels: {
                            step: 1,
                            style: {
                                color: "#ffffff"
                            }
                        }
                    }, { // mirror axis on right side
                        opposite: true,
                        reversed: false,
                        categories: categories,
                        linkedTo: 0,
                        labels: {
                            step: 1,
                            style: {
                                color: "#ffffff"
                            }
                        }
                    }],
                    yAxis: {
                        title: {
                            text: null
                        },
                        labels: {
                            formatter: function () {
                                return Math.abs(this.value);
                            },
                            style: {
                                color: "#ffffff"
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
                                overflow: 'none',
                                style: {
                                    color: "#ffffff"
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

        });
    </script>
@endpush
