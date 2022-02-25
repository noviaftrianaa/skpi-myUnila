@extends('template_public.default')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-7 col-sm-7">
                <div class="card">
                    <div class="card-header bg-primary">
                        <h3 class="card-title" style="font-weight: bold;">{{ $detail_prodi->prodi }} -
                            {{ $detail_prodi->jenjang_pendidikan }}
                        </h3>
                    </div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <tbody>
                                {!! tableRow('Nama Prodi', $detail_prodi->prodi) !!}
                                {!! tableRow('Program', $detail_prodi->jenjang_pendidikan) !!}
                                {!! tableRow('Status Akreditasi', $detail_prodi->nm_akred) !!}
                                {!! tableRow('SK Akreditasi', $detail_prodi->sk_akreditasi_prodi) !!}
                                {!! tableRow('Tanggal SK Akreditasi', tglIndonesia($detail_prodi->tanggal_sk_akreditasi_prodi)) !!}
                                {!! tableRow('Expired SK Akreditasi', 'sampai <span class="text-danger" style="font-weight: bold;">' . tglIndonesia($detail_prodi->tst_sk_akreditasi_prodi) . '</span>') !!}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-md-4 col-sm-4">
                <div class="card">
                    <div class="card-header bg-primary">
                        <h3 class="card-title">Akreditasi Pertahun</h3>
                    </div>
                    <div class="card-body">
                        <div id="detail_akreditasi_prodi"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">

        </div>
    </div>
@endsection

@push('js')
    <script>
        $(document).ready(function() {
            let detail_akred = {!! $detail_akred !!};
            let rank_akred = {!! $rank_akred !!};
            let tahun_akred = [];
            let akreditasi = [];
            
            $.each(detail_akred, function(i, k) {
                tahun_akred.push(i);
                akreditasi.push(k[1]);
            });

            let chartType = 'column';
            let count = tahun_akred.length;
            if (count > 1) {
                let chartType = 'line';
            }

            let chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'detail_akreditasi_prodi',
                    type: chartType
                },
                title: {
                    text: 'Sebaran Akreditasi Pertahun'
                },
                xAxis: {
                    categories: tahun_akred,
                    gridLineWidth: 1,
                    crosshair: true,
                    title: {
                        text: 'Tahun'
                    }
                },
                yAxis: {
                    categories: rank_akred,
                    title: {
                        text: 'Akreditas'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                legend: {
                    itemWidth: 220
                },
                series: [{
                    name: 'Akreditasi',
                    data: akreditasi
                }],
                credits: {
                    enabled: false
                }
            });
        });
    </script>
@endpush
