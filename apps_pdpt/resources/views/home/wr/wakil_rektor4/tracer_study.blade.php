@extends('template.default')
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

        .second a:hover {
    color: rgb(0, 183, 255) !important;
}

.active-2 {
    color: rgb(0, 183, 255) !important;
}

.second a:hover {
    padding-bottom: 10px !important;
    border-bottom: 3px solid rgb(0, 183, 255) !important;

}

.breadcrumb>li+li:before {
    content: "" !important;
}

.breadcrumb {
    font-size: 17px;
    color: #343a408d !important;
    letter-spacing: 2px;
    border-radius: 5px !important;
}


.fa-angle-double-right {
    color: #aaa !important;
}


.first {
    background-color: white !important;
    margin-left: -50%;
}


a {
    text-decoration: none !important;
    color: #aaa;
}

a:focus,
a:active {
    outline: none !important;
    box-shadow: none !important;
}


.fa-caret-right,
.fa-angle-double-right {
    font-size: 20px !important;
}

.fa-caret-right {
    vertical-align: middle;
}

img {
    vertical-align: bottom;
    opacity: 0.3;
}

.four ol {
    background-color: rgb(51, 0, 80) !important;
}

@media (max-width: 767px) {
    .breadcrumb {
        font-size: 13px;
    }

    .breadcrumb-item+.breadcrumb-item {
        padding-left: 0;
    }

    .fa {
        font-size: 9px !important;
    }

    .breadcrumb {
        letter-spacing: 1px !important;
    }

    .breadcrumb>* div {
        max-width: 60px;
    }
}
    </style>
@endpush

@section('content')
    <div class="container">
        <div class="card">
            <div class="card-header"><h3 class="card-title">Sebaran Tracer Study Tahun <span id="selectYear">{{ $tahun_pilih }}</span></h3></div>
            <div class="card-body">

                <div class="row mb-5">
                    <div class="col">
                        <div id="ReloadResponRateBarChart"></div>
                    </div>
                </div>
                <div class="row mb-5">
                    <div class="col-sm-6">
                        <div id="alumni_rasio_jk"></div>
                    </div>
                    <div class="col-sm-6">
                        <div id="alumni_rasio_pendidikan"></div>
                    </div>
                </div>
                <div class="row mb-5">
                    <div class="col-sm-6">
                        <div id="rasio_status_lulusan"></div>
                    </div>
                    <div class="col-sm-6">
                        <div id="rasio_tingkat_perusahaan"></div>
                    </div>
                </div>
                <div class="row mb-5">
                    <div class="col-sm-12">
                        <div id="rasio_bidang_kerja"></div>
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
                    <button id="btn_modal_close" class="btn btn-danger" data-dismiss="modal" aria-label="Close"><i
                            class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="modal-body">
                <div id="x_tb_01">
                    <table id="tb_01" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
                <div id="x_tb_02">
                    <table id="tb_02" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
                <div id="x_tb_03">
                    <table id="tb_03" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
                <div id="x_tb_04">
                    <table id="tb_04" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
                <div id="x_tb_05">
                    <table id="tb_05" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('js')
    <script>
        var respon_rate = [];
        var drill = 1;
        var x_total_data = 0;
        var x_total_data_yes = 0;
        var x_total_data_no = 0;

        $("#btn_modal_back").click(function() {
            $("#btn_modal_close").show();
            $("#btn_modal_back").hide();
            $("#txt3_modal").html("");
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
        });

        $(document).ready( function () {
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            ResponRateFakultas();

            var alumni_jk = '{!! $alumni_jk !!}';
            var data_alumni_jk = [];
            var kategori_alumni_jk = [];
            $.each(JSON.parse(alumni_jk),function (i, k) {
                data_alumni_jk.push([
                    i, parseInt(k)
                ]);
                kategori_alumni_jk.push(i);
            });

            var alumni_pendidikan = '{!! $alumni_pendidikan !!}';
            var data_alumni_pendidikan = [];
            var kategori_alumni_pendidikan = [];
            $.each(JSON.parse(alumni_pendidikan),function (i, k) {
                data_alumni_pendidikan.push([
                    i, parseInt(k)
                ]);
                kategori_alumni_pendidikan.push(i);
            });

            var status_lulusan = '{!! $status_lulusan !!}';
            var data_status_lulusan = [];
            var kategori_status_lulusan = [];
            $.each(JSON.parse(status_lulusan),function (i, k) {
                data_status_lulusan.push([
                    i, parseInt(k)
                ]);
                kategori_status_lulusan.push(i);
            });

            var tingkat_perusahaan = '{!! $tingkat_perusahaan !!}';
            var data_tingkat_perusahaan = [];
            var kategori_tingkat_perusahaan = [];
            $.each(JSON.parse(tingkat_perusahaan),function (i, k) {
                data_tingkat_perusahaan.push([
                    i, parseInt(k)
                ]);
                kategori_tingkat_perusahaan.push(i);
            });

            var bidang_kerja = '{!! $bidang_kerja !!}';
            var data_bidang_kerja = [];
            var kategori_bidang_kerja = [];
            $.each(JSON.parse(bidang_kerja),function (i, k) {
                data_bidang_kerja.push([
                    i, parseInt(k)
                ]);
                kategori_bidang_kerja.push(i);
            });



            function ResponRateFakultas() {
                var res = '{!! $respon_rate !!}';
                var respon_rate = JSON.parse(res);

                var y_id = [];
                var y_title = [];
                var x_data_yes = [];
                var x_data_no = [];
                var x_data_pie = [];
                x_total_data = 0;
                x_total_data_yes = 0;
                x_total_data_no = 0;
                $.each(respon_rate, function(index, value) {
                    y_id.push(value.DATA.y_id);
                    y_title.push(value.DATA.y_title);
                    x_data_yes.push(value.DATA.x_data_yes);
                    x_data_no.push(value.DATA.x_data_no);
                    x_total_data += value.DATA.x_data;
                    x_total_data_yes += value.DATA.x_data_yes;
                    x_total_data_no += value.DATA.x_data_no;
                });

                drill = 1;
                ReloadResponRateBarChart(y_title, x_data_yes, x_data_no);
                $("#navChart").html(
                    `<li class="breadcrumb-item font-weight-bold"><a data-nextlevel="Fakultas">Respon Rate Fakultas</a></li>`
                    );
            }

            function ResponRateProdi(fak) {
                var res = '{!! $respon_rate !!}';
                var respon_rate = JSON.parse(res);

                var y_id = [];
                var y_title = [];
                var x_data_yes = [];
                var x_data_no = [];
                var x_data_pie = [];
                x_total_data = 0;
                x_total_data_yes = 0;
                x_total_data_no = 0;
                $.each(respon_rate[fak]['DRILL'], function(index, value) {
                    y_id.push(value.DATA.y_id);
                    y_title.push(value.DATA.y_title);
                    x_data_yes.push(value.DATA.x_data_yes);
                    x_data_no.push(value.DATA.x_data_no);
                    x_total_data += value.DATA.x_data;
                    x_total_data_yes += value.DATA.x_data_yes;
                    x_total_data_no += value.DATA.x_data_no;
                });
                drill = 2;
                ReloadResponRateBarChart(y_title, x_data_yes, x_data_no, fak);
                $("#navChart").html(
                    '<li class="breadcrumb-item font-weight-bold active" aria-current="page"><a href="javascript:location.reload();">Respon Rate Fakultas</a> / Program Studi</li>'
                );
            }

            reloadPieChart('alumni_rasio_jk','Sebaran berdasarkan Jenis Kelamin',data_alumni_jk);
            reloadPieChart('alumni_rasio_pendidikan','Sebaran berdasarkan Pendidikan',data_alumni_pendidikan);
            reloadPieChart('rasio_status_lulusan','Sebaran berdasarkan Status Lulusan',data_status_lulusan);
            reloadColumnChart('rasio_tingkat_perusahaan','Sebaran berdasarkan Tingkat Perusahaan',data_tingkat_perusahaan, kategori_tingkat_perusahaan);
            reloadBarChart('rasio_bidang_kerja','Sebaran berdasarkan Bidang Pekerjaan', data_bidang_kerja, kategori_bidang_kerja);

            $("#selectYear").change(function() {
                loading(id_wil,nm_wil,false,kualifikasi);
            });

            function ReloadResponRateBarChart(y_title, x_data_yes, x_data_no, fak = null) {
                var chart = Highcharts.chart('ReloadResponRateBarChart', {
                    chart: {
                        type: 'bar',
                        height: 700,
                    },
                    title: {
                        text: '<nav aria-label="breadcrumb mb-3" class="second " > <ol class="breadcrumb indigo lighten-6 first" id="navChart"> </ol> </nav>',
                        useHTML: true,
                    },
                    xAxis: {
                        categories: y_title,
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Alumni'
                        },
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
                                            ResponRateProdi(event.point.category);
                                        } else {
                                            let id_prodi = respon_rate[fak]['DRILL'][event.point.category]['DATA'][
                                                'y_id'
                                            ];
                                            $("#txt1_modal").html(
                                                "<b>Respon Rate Tracer Study</b><br>");
                                            $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                                .category + "<br>");
                                            if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                                $('#tb_01').DataTable().destroy();
                                            } else {
                                                TbIku1Alumni(id_prodi);
                                            }
                                        }
                                    }
                                }
                            },
                        }
                    },
                    series: [{
                        name: 'Belum Mengisi',
                        data: x_data_no,
                        color: '#FF973B'
                    }, {
                        name: 'Sudah Mengisi',
                        data: x_data_yes,
                        color: '#4D6277'
                    }],
                    credits: {
                        enabled: false
                    }
                });
                chart.setSize(null);
            }

            function reloadPieChart(target,title,data){
                Highcharts.setOptions({
                    colors: ['#3498DB', '#34495E', '#F1C40F', '#E67E22', '#E74C3C', '#4DB1F4', '#95A5A6', '#1ABC9C', '#2ECC71', '#9B59B6', '#C0392B', '#F39C12','#16A085','#2980B9','#2C3E50']
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
                            color: "#343A40"
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
                                    color: "#343A40"
                                }
                            },
                            showInLegend: false,
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

            function reloadColumnChart(target, title, data, kategori) {
                Highcharts.setOptions({
                    colors: ['#3498DB', '#34495E', '#F1C40F', '#E67E22', '#E74C3C', '#4DB1F4', '#95A5A6', '#1ABC9C', '#2ECC71', '#9B59B6', '#C0392B', '#F39C12', '#16A085', '#2980B9', '#2C3E50']
                });

                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        type: 'column',
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
                            color: "#343A40"
                        }
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.point.name + '</b><br/>' +
                                'Jumlah: ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
                        }
                    },
                    xAxis: {
                        categories: kategori,
                    },
                    yAxis: {
                        title: {
                            enabled: false
                        }
                    },
                    plotOptions: {
                        column: {
                            showInLegend: false,
                        },
                    },
                    series: [{
                        type: 'column',
                        colorByPoint: true,
                        data: data,
                    }],
                    credits: {
                        enabled: false
                    }
                });
            }

            function reloadBarChart(target, title, data, kategori) {
                Highcharts.setOptions({
                    colors: ['#3498DB', '#34495E', '#F1C40F', '#E67E22', '#E74C3C', '#4DB1F4', '#95A5A6', '#1ABC9C', '#2ECC71', '#9B59B6', '#C0392B', '#F39C12', '#16A085', '#2980B9', '#2C3E50']
                });

                chart = new Highcharts.Chart({
                    chart: {
                        renderTo: target,
                        type: 'bar',
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
                            color: "#343A40"
                        }
                    },
                    tooltip: {
                        formatter: function () {
                            return '<b>' + this.point.name + '</b><br/>' +
                                'Jumlah: ' + Highcharts.numberFormat(Math.abs(this.point.y), 0);
                        }
                    },
                    xAxis: {
                        categories: kategori,
                    },
                    yAxis: {
                        title: {
                            enabled: false
                        }
                    },
                    plotOptions: {
                        bar: {
                            showInLegend: false,
                        },
                    },
                    series: [{
                        type: 'bar',
                        colorByPoint: true,
                        data: data,
                    }],
                    credits: {
                        enabled: false
                    }
                });
            }


        });
    </script>
@endpush
