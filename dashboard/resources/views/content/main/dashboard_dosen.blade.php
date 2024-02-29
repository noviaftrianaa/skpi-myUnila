@extends('layouts/layoutMaster')
@include('_partials.__partial.highchart')
@section('title', $judul)

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="container">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-dashboard"></i> {{ $judul }} Tahun {{ $ta_pilih }}</h3>
                    </div>
                    <div class="card-body">
                        <form action="{{ route('dashboard_dosen') }}" method="GET">
                            {!! FormInputSelect('id_ta','Tahun Ajaran',$ta_list,false,false,$ta_pilih) !!}
                        </form>
                        <div class="row">
                            <div class="col-sm-6">
                                <div id="dosen"></div>
                            </div>
                            <div class="col-sm-6">
                                <div id="dosen_jabfung"></div>
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
                        <div class="row">
                            <div class="col-sm-4">
                                <div id="litabmas_dosen"></div>
                            </div>
                            <div class="col-sm-8">
                                <div id="publikasi_dosen"></div>
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
            var tahun_1 = '{!! $ta_pilih !!}';
            var tahun_2 = '{!! ($ta_pilih-1) !!}';
            var tahun_3 = '{!! ($ta_pilih-2) !!}';
            var dosen_nomor_induk = '{!! $total_dosen !!}';
            var data_dosen_nomor_induk = [];
            var kategori_dosen_nomor_induk = [];
            $.each(JSON.parse(dosen_nomor_induk),function (i, k) {
                data_dosen_nomor_induk.push([
                    i, parseInt(k)
                ]);
                kategori_dosen_nomor_induk.push(i);
            });

            var dosen_jabfung = '{!! $total_dosen_jabfung !!}';
            var data_dosen_jabfung = [];
            var kategori_dosen_jabfung = [];
            $.each(JSON.parse(dosen_jabfung),function (i, k) {
                if(parseInt(k)>0) {
                    data_dosen_jabfung.push([
                        i, parseInt(k)
                    ]);
                    kategori_dosen_jabfung.push(i);
                }
            });

            var litabmas = '{!! $data_litabmas !!}';
            var data_pengmas = [];
            var data_lit = [];
            var kategori_litabmas = [];
            var series_litabmas = [];
            $.each(JSON.parse(litabmas),function (i, k) {
                if(k.jns_litabmas=='M') {
                    data_pengmas.push(parseInt(k.total_litabmas))
                } else {
                    data_lit.push(parseInt(k.total_litabmas))
                }
                if($.inArray(k.id_thn_kegiatan, kategori_litabmas)===-1) {
                    kategori_litabmas.push(k.id_thn_kegiatan);
                }
            });
            series_litabmas.push({
                'name': 'Penelitian',
                'data': data_lit
            })
            series_litabmas.push({
                'name': 'Pengabdian',
                'data': data_pengmas
            })

            var publikasi = '{!! $data_publikasi !!}';
            var data_publikasi_1 = [];
            var data_publikasi_2 = [];
            var data_publikasi_3 = [];
            var tahun_publikasi = [];
            var kategori_publikasi = [];
            var series_publikasi = [];
            $.each(JSON.parse(publikasi),function (i, k) {
                kategori_publikasi.push(i);
                $.each(k,function(m,n) {
                    if($.inArray(m, tahun_publikasi)===-1) {
                        tahun_publikasi.push(m);
                    }
                    if(m==tahun_1) {
                        data_publikasi_1.push(parseInt(n));
                    } else if(m==tahun_2) {
                        data_publikasi_2.push(parseInt(n));
                    } else if(m==tahun_3) {
                        data_publikasi_3.push(parseInt(n));
                    }
                })
            });
            series_publikasi.push({
                'name': tahun_1,
                'data': data_publikasi_1
            })
            series_publikasi.push({
                'name': tahun_2,
                'data': data_publikasi_2
            })
            series_publikasi.push({
                'name': tahun_3,
                'data': data_publikasi_3
            })

            var dosen_kepangkatan = '{!! $dosen_kepangkatan_detail !!}';
            var data_dosen_kepangkatan = [];
            var kategori_dosen_kepangkatan = [];
            $.each(JSON.parse(dosen_kepangkatan),function (i, k) {
                if(parseInt(k)>0) {
                    data_dosen_kepangkatan.push([
                        i, parseInt(k)
                    ]);
                    kategori_dosen_kepangkatan.push(i);
                }
            });

            var dosen_pendidikan = '{!! $dosen_pendidikan_detail !!}';
            var data_dosen_pendidikan = [];
            var kategori_dosen_pendidikan = [];
            $.each(JSON.parse(dosen_pendidikan),function (i, k) {
                if(parseInt(k)>0) {
                    data_dosen_pendidikan.push([
                        i, parseInt(k)
                    ]);
                    kategori_dosen_pendidikan.push(i);
                }
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

            chart_show('Sebaran Dosen','berdasarkan Nomor Induk',data_dosen_nomor_induk,'dosen','Jumlah Dosen',kategori_dosen_nomor_induk,'');
            chart_show('Sebaran Dosen','berdasarkan Jabatan Fungsional',data_dosen_jabfung,'dosen_jabfung','Jumlah Dosen',kategori_dosen_jabfung,'');
            reloadPieChart('dosen_rasio_pendidikan','Sebaran Dosen berdasarkan Kualifikasi Pendidikan',data_dosen_pendidikan);
            reloadPieChart('dosen_rasio_pangkat','Sebaran Dosen berdasarkan Pangkat Golongan',data_dosen_kepangkatan);
            reloadPieChart('dosen_rasio_ikatan_kerja','Sebaran Dosen berdasarkan Ikatan Kerja',data_dosen_ikatan);
            chart_tipe_show('Trend Penelitian dan Pengabdian','line','berdasarkan 3 tahun terakhir',series_litabmas,'litabmas_dosen','Jumlah Litabmas',kategori_litabmas,'Tahun Litabmas','Judul')
            chart_tipe_show('Trend Publikasi Karya dan Paten/HKI','column','berdasarkan 3 tahun terakhir',series_publikasi,'publikasi_dosen','Jumlah Judul',kategori_publikasi,'Tahun Terbit','Judul')

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
                            text: 'Jumlah Dosen',
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
                    },
                    xAxis: [{
                        categories: categories,
                        reversed: false,
                        labels: {
                            step: 1,
                        }
                    }, { // mirror axis on right side
                        opposite: true,
                        reversed: false,
                        categories: categories,
                        linkedTo: 0,
                        labels: {
                            step: 1,
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

            $('#id_ta').on('change', function() {
                this.form.submit();
            });
        });
    </script>
@endpush
