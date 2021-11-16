@extends('template_public.default')
@include('__partial.highchart')

@section('content')
    <div class="container">
        <div class="card">
            <div class="card-header"><h3 class="card-title">Akreditasi Prodi</h3></div>
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-6">
                        <table class="table table-striped">
                            <tbody>
                            {!! tableRow('Nama PT',$sp->nm_lemb) !!}
                            {!! tableRow('Kode PT',$sp->npsn) !!}
                            {!! tableRow('Status Akreditasi',$sp->nm_akred) !!}
                            {!! tableRow('SK Akreditasi',$sp->sk_akred_sp) !!}
                            {!! tableRow('Tanggal SK Akreditasi',tglIndonesia($sp->tgl_sk_akred_sp)) !!}
                            {!! tableRow('Expired SK Akreditasi','sampai <spap class="text-danger">'.tglIndonesia($sp->tst_sk_akred_sp).'</span>') !!}
                            </tbody>
                        </table>
                    </div>
                    <div class="col-sm-6">
                        <div id="akreditasi_prodi"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script>
        $(document).ready( function () {
            var akred = {!! $akred !!};
            var data_akred = [];
            var kategori_akred = [];
            $.each(akred,function (i, k) {
                kategori_akred.push(i);
                data_akred.push([
                    i, parseInt(k)
                ]);
            });
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'akreditasi_prodi',
                    type: 'column'
                },
                title: {
                    text: 'Sebaran Akreditasi Program Studi'
                },
                xAxis: {
                    categories: kategori_akred,
                    crosshair: true,
                    title: {
                        text: 'Akreditasi Prodi'
                    }
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
            //
            // chart = new Highcharts.Chart({
            //     chart: {
            //         renderTo: 'dosen_jabfung',
            //         type: 'column'
            //     },
            //     title: {
            //         text: 'Sebaran Dosen berdasarkan jabfung'
            //     },
            //     xAxis: {
            //         categories: ['Belum memiliki Jabfung','Asisten Ahli','Lektor','Lektor Kepala','Guru Besar'],
            //         crosshair: true,
            //         title: {
            //             text: 'Nama Jabatan Fungsional'
            //         }
            //     },
            //     yAxis: {
            //         min: 0,
            //         title: {
            //             text: 'Jumlah Dosen'
            //         }
            //     },
            //     tooltip: {
            //         headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
            //         pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            //             '<td style="padding:0"><b>{point.y} dosen</b></td></tr>',
            //         footerFormat: '</table>',
            //         shared: true,
            //         useHTML: true
            //     },
            //     plotOptions: {
            //         column: {
            //             pointPadding: 0.2,
            //             borderWidth: 0
            //         },
            //         series: {
            //             borderWidth: 0,
            //             dataLabels: {
            //                 enabled: true
            //             }
            //         }
            //     },
            //     legend: {
            //         itemWidth: 220
            //     },
            //     series: [{
            //         name: 'Total Dosen',
            //         data: [256,195,445,312,77]
            //     }],
            //     credits: {
            //         enabled: false
            //     }
            // });
        });
    </script>
@endpush
