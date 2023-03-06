@extends('template_public.default')
@include('__partial.highchart')
@include('__partial.leaflet')

@section('content')
    <div class="container">
        <div class="card">
            <div class="card-header"><h4 class="card-title">Dosen Bergelar S3</h4></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-12">
                        <div id="dosen-s3"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><h4 class="card-title">Dosen Jabatan Lektor Kepala dan Guru Besar</h4></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-12">
                        <div id="dosen-jabatan"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><h4 class="card-title">Jumlah Mahasiswa</h4></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-12">
                        <div id="jumlah-mhs"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><h4 class="card-title">Dosen Tetap Unila sebagai Praktisi di Dunia Industri</h4></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-12">
                        <div id="Dsn-ttp-Praktisi"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
{{-- <script>
     $(document).ready(function() {
            var akred = {!! $akred !!};
            var data_akred = [];
            var kategori_akred = [];
            $.each(akred, function(i, k) {
                kategori_akred.push(i);
                data_akred.push([
                    i, parseInt(k)
                ]);
            });
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'akreditasi_prodi',
                    type: 'column',
                    backgroundColor: 'rgba(0,0,0,0)'
                },
                title: {
                    text: 'Sebaran Akreditasi Program Studi',
                    style: {
                        color: "#ffffff"
                    }
                },
                xAxis: {
                    categories: kategori_akred,
                    crosshair: true,
                    title: {
                        text: 'Akreditasi Prodi'
                    },
                    labels: {
                        overflow: 'justify',
                        style: {
                            width: '80px',
                            color: '#FFFFFF'
                        },
                        groupedOptions: [{
                            rotation: 0, // rotate labels for a 2nd-level
                            align: 'center',
                            style: {
                                color: 'red', // set red font for labels in 1st-Level
                            }
                        }, {
                            rotation: -45, // rotate labels for a 2nd-level
                        }],
                        rotation: -45, // 0-level options aren't changed, use them as always
                        align: 'right',
                    },
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Jumlah Prodi'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y} Program Studi</b></td></tr>',
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
                    name: 'Total Prodi',
                    data: data_akred
                }],
                credits: {
                    enabled: false
                }
            });
        });
</script> --}}
<script src="https://code.highcharts.com/highcharts.js"></script>
    <script>
        Highcharts.chart('dosen-s3', {
        data: {
            table: 'datatable'
        },
        chart: {
            type: 'column',
            backgroundColor: 'rgba(0,0,0,0)'
        },
        title: {
            text: 'Dosen Bergelar S3',
            style: {
                color: "#ffffff"
            }
        },
        subtitle: {
            text:
                'Tingkat Perguruan Tinggi Universitas Lampung'
        },
        xAxis: {
            categories: ['2020', '2021', '2022']
        },
        credits: {
            enabled: false
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: 'Amount'
            }
        },
        yAxis: {
            title: {
                text: 'Dosen'
            }

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
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.point.y + ' ' + this.point.name.toLowerCase();
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
                    name: 'Jumlah Seluruh Dosen',
                    data: [1798, 1873, 591]
                }, {
                    name: 'Dosen S3',
                    data: [591,591, 591]
                }],
                credits: {
                    enabled: false
                        }
    });
    </script>
    <script>
        Highcharts.chart('dosen-jabatan', {
        data: {
            table: 'datatable'
        },
        chart: {
            type: 'column',
            backgroundColor: 'rgba(0,0,0,0)'
        },
        title: {
            text: 'Dosen Jabatan Lektor Kepala dan Guru Besar',
            style: {
                color: "#ffffff"
            }
        },
        subtitle: {
            text:
                'Tingkat Perguruan Tinggi Universitas Lampung'
        },
        xAxis: {
            categories: ['2020', '2021', '2022']
        },
        credits: {
            enabled: false
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: 'Amount'
            }
        },
        yAxis: {
            title: {
                text: 'Dosen'
            }

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
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.point.y + ' ' + this.point.name.toLowerCase();
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
                    name: 'Jumlah Seluruh Dosen',
                    data: [1798, 1873, 591]
                }, {
                    name: 'Dosen Lektor Kepala',
                    data: [591,591, 591]
                },
                {
                    name: 'Dosen Guru Besar',
                    data: [591,591, 591]
                }],
                credits: {
                    enabled: false
                        }
    });
    </script>
    <script>
        Highcharts.chart('jumlah-mhs', {
        data: {
            table: 'datatable'
        },
        chart: {
            type: 'column',
            backgroundColor: 'rgba(0,0,0,0)'
        },
        title: {
            text: 'Jumlah Mahasiswa',
            style: {
                color: "#ffffff"
            }
        },
        subtitle: {
            text:
                'Tingkat Perguruan Tinggi Universitas Lampung'
        },
        xAxis: {
            categories: ['2020', '2021', '2022']
        },
        credits: {
            enabled: false
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: 'Amount'
            }
        },
        yAxis: {
            title: {
                text: 'Dosen'
            }

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
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.point.y + ' ' + this.point.name.toLowerCase();
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
                    name: 'Jumlah Seluruh Dosen',
                    data: [1798, 1873, 591]
                }, {
                    name: 'Jumlah Seluruh Mahasiswa',
                    data: [591,591, 591]
                }, 
                {
                    name: 'Jumlah Mahasiswa Asing',
                    data: [591,591, 591]
                }],
                credits: {
                    enabled: false
                        }
    });
    </script>
    <script>
        Highcharts.chart('Dsn-ttp-Praktisi', {
        data: {
            table: 'datatable'
        },
        chart: {
            type: 'column',
            backgroundColor: 'rgba(0,0,0,0)'
        },
        title: {
            text: 'Dosen Tetap Unila sebagai Praktisi di Dunia Industri',
            style: {
                color: "#ffffff"
            }
        },
        subtitle: {
            text:
                'Tingkat Perguruan Tinggi Universitas Lampung'
        },
        xAxis: {
            categories: ['2020', '2021', '2022']
        },
        credits: {
            enabled: false
        },
        yAxis: {
            allowDecimals: false,
            title: {
                text: 'Amount'
            }
        },
        yAxis: {
            title: {
                text: 'Dosen'
            }

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
        tooltip: {
            formatter: function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.point.y + ' ' + this.point.name.toLowerCase();
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
                    name: 'Jumlah Dosen',
                    data: [1798, 1873, 591]
                }],
                credits: {
                    enabled: false
                        }
    });
    </script>
@endpush
