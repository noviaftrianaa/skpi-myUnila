@extends('template_public.default')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-6 col-sm-6">
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

            <div class="col-md-6 col-sm-6">
                <div class="card">
                    <div class="card-header bg-primary">
                        <h3 class="card-title font-weight-bold">Akreditasi Pertahun</h3>
                    </div>
                    <div class="card-body">
                        <div id="detail_akreditasi_prodi"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">
                <div class="card card-primary card-tabs">
                    <div class="card-header p-0 pt-1">
                        <ul class="nav nav-tabs" id="tabs-kriteria-tab" role="tablist">
                            <li class="pt-2 px-3">
                                <h3 class="card-title font-weight-bold">Kriteria Akreditasi</h3>
                            </li>

                            @forelse ($list_kriteria as $key => $value)
                                @if ($key == 0)
                                    <li class="nav-item">
                                        <a class="nav-link active"
                                            id="tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}-tab"
                                            data-toggle="pill"
                                            href="#tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}" role="tab"
                                            aria-controls="tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}"
                                            aria-selected="true">{{ $value }}</a>
                                    </li>
                                @else
                                    <li class="nav-item">
                                        <a class="nav-link"
                                            id="tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}-tab"
                                            data-toggle="pill"
                                            href="#tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}" role="tab"
                                            aria-controls="tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}"
                                            aria-selected="true">{{ $value }}</a>
                                    </li>
                                @endif
                            @empty
                                <li class="nav-item">
                                    <a class="nav-link" data-toggle="pill" role="tab" caria-selected="true">Terdapat
                                        Kesalahan, Silahkan Refresh Kembali</a>
                                </li>
                            @endforelse
                        </ul>
                    </div>
                    <div class="card-body">
                        <div class="tab-content" id="tabs-kriteria-tabContent">

                            @forelse ($kriteria as $judul => $value)
                                @if ($judul == 'kriteria_1')
                                    <div class="tab-pane fade show active"
                                        id="tabs-{{ strtolower(Str::replace('_', '-', $judul)) }}" role="tabpanel"
                                        aria-labelledby="tabs-{{ strtolower(Str::replace('_', '-', $judul)) }}-tab">

                                        @forelse ($value as $kriteria => $isi)
                                            <div class="card card-primary">
                                                <div class="card-header bg-primary">
                                                    <h3 class="card-title font-weight-bold">{{ $kriteria }}
                                                    </h3>
                                                </div>
                                                <div class="card-body">
                                                    <div class="row">
                                                        <div class="col-5 col-sm-3">
                                                            <div class="nav flex-column nav-tabs h-100" id="vert-tabs-tab"
                                                                role="tablist" aria-orientation="vertical">
                                                                @foreach (array_keys($isi) as $urutan => $value)
                                                                    @if ($urutan == 0)
                                                                        <a class="nav-link active"
                                                                            id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                            data-toggle="pill"
                                                                            href="#vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            role="tab"
                                                                            aria-controls="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            aria-selected="true">{{ $value }}</a>
                                                                    @else
                                                                        <a class="nav-link"
                                                                            id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                            data-toggle="pill"
                                                                            href="#vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            role="tab"
                                                                            aria-controls="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            aria-selected="true">{{ $value }}</a>
                                                                    @endif
                                                                @endforeach
                                                            </div>
                                                        </div>

                                                        <div class="col-7 col-sm-9">
                                                            <div class="tab-content" id="vert-tabs-tabContent">
                                                                @foreach (array_keys($isi) as $urutan => $value)
                                                                    @if ($urutan == 0)
                                                                        <div class="tab-pane fade show active"
                                                                            id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            role="tabpanel"
                                                                            aria-labelledby="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                            style="text-align: justify;">
                                                                            {{ $isi[$value] }}
                                                                        </div>
                                                                    @else
                                                                        <div class="tab-pane fade"
                                                                            id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            role="tabpanel"
                                                                            aria-labelledby="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                            style="text-align: justify;">
                                                                            {{ $isi[$value] }}
                                                                        </div>
                                                                    @endif
                                                                @endforeach
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        @empty
                                        @endforelse
                                    </div>
                                @else
                                    <div class="tab-pane fade"
                                        id="tabs-{{ strtolower(Str::replace('_', '-', $judul)) }}" role="tabpanel"
                                        aria-labelledby="tabs-{{ strtolower(Str::replace('_', '-', $judul)) }}-tab">

                                        @forelse ($value as $kriteria => $isi)
                                            <div class="card card-primary">
                                                <div class="card-header bg-primary">
                                                    <h3 class="card-title font-weight-bold">{{ $kriteria }}
                                                    </h3>
                                                </div>
                                                <div class="card-body">
                                                    <div class="row">
                                                        <div class="col-5 col-sm-3">
                                                            <div class="nav flex-column nav-tabs h-100" id="vert-tabs-tab"
                                                                role="tablist" aria-orientation="vertical">
                                                                @foreach (array_keys($isi) as $urutan => $value)
                                                                    @if ($urutan == 0)
                                                                        <a class="nav-link active"
                                                                            id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                            data-toggle="pill"
                                                                            href="#vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            role="tab"
                                                                            aria-controls="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            aria-selected="true">{{ $value }}</a>
                                                                    @else
                                                                        <a class="nav-link"
                                                                            id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                            data-toggle="pill"
                                                                            href="#vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            role="tab"
                                                                            aria-controls="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            aria-selected="true">{{ $value }}</a>
                                                                    @endif
                                                                @endforeach
                                                            </div>
                                                        </div>

                                                        <div class="col-7 col-sm-9">
                                                            <div class="tab-content" id="vert-tabs-tabContent">
                                                                @foreach (array_keys($isi) as $urutan => $value)
                                                                    @if ($urutan == 0)
                                                                        <div class="tab-pane fade show active"
                                                                            id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            role="tabpanel"
                                                                            aria-labelledby="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                            style="text-align: justify;">
                                                                            {{ $isi[$value] }}
                                                                        </div>
                                                                    @else
                                                                        <div class="tab-pane fade"
                                                                            id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                            role="tabpanel"
                                                                            aria-labelledby="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                            style="text-align: justify;">
                                                                            {{ $isi[$value] }}
                                                                        </div>
                                                                    @endif
                                                                @endforeach
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        @empty
                                        @endforelse
                                    </div>
                                @endif
                            @empty
                            @endforelse
                        </div>
                    </div>

                </div>
            </div>
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

            let chartType = 'line';
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
