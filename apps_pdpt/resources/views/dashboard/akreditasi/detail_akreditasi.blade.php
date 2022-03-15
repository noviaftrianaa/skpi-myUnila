@extends('template_public.default')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header bg-primary">
                        <h1 class="card-subtitle mb-2" style="font-weight: bold;">
                            {{ $detail_prodi->jenjang_pendidikan }}
                        </h1>
                        <h1 class="card-title" style="font-weight: bold;">
                            {{ $detail_prodi->prodi }}
                        </h1>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4 mb-3">
                            <div class="col-md-6 col-sm-6">
                                <div class="card h-100">
                                    <div class="card-header" style="background-color: whitesmoke;">
                                        <h3 class="card-title" style="font-weight: bold;">Detail Prodi
                                        </h3>
                                    </div>
                                    <div class="card-body d-flex justify-content-center">
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
                                <div class="card h-100">
                                    <div class="card-header" style="background-color: whitesmoke;">
                                        <h3 class="card-title font-weight-bold">Grafik Akreditasi Pertahun</h3>
                                    </div>
                                    <div class="card-body">
                                        <div id="detail_akreditasi_prodi"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-header" style="background-color: whitesmoke;">
                                        <h3 class="card-title font-weight-bold">Akreditasi Pertahun</h3>
                                    </div>
                                    <div class="card-body">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th style="width: 10px">#</th>
                                                    <th>Tahun</th>
                                                    <th>No SK</th>
                                                    <th>Tanggal Akred</th>
                                                    <th>Expired Akred</th>
                                                    <th style="text-align: center;">Akreditasi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse ($detail_akred_all as $thn => $value)
                                                    <tr>
                                                        <td>#</td>
                                                        <td>{{ $thn }}</td>
                                                        <td>{{ $value[2] }}</td>
                                                        <td>{{ tglIndonesia($value[3]) }}</td>
                                                        <td>{{ tglIndonesia($value[4]) }}</td>
                                                        @switch(strtolower($value[0]))
                                                            @case('unggul')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: darkblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('baik sekali')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: mediumblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('baik')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: royalblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('a')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: darkblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('b')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: mediumblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('c')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: royalblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @default
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: darkred;">{{ $value[0] }}</a>
                                                                </td>
                                                        @endswitch
                                                    </tr>
                                                    @empty
                                                    @endforelse
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="card card-tabs">
                                        <div class="card-header p-0 pt-1" style="background-color: whitesmoke;">
                                            <ul class="nav nav-tabs" id="tabs-kriteria-tab" role="tablist">
                                                <li class="pt-2 px-3">
                                                    <h3 class="card-title font-weight-bold">Kriteria Akreditasi</h3>
                                                </li>
                                                @forelse ($list_kriteria as $key => $value)
                                                    <li class="nav-item">
                                                        <a class="nav-link{{ $key == 0 ? ' active' : '' }} font-weight-bold"
                                                            id="tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}-tab"
                                                            data-toggle="pill"
                                                            href="#tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}"
                                                            role="tab"
                                                            aria-controls="tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}"
                                                            aria-selected="true">{{ $value }}</a>
                                                    </li>
                                                @empty
                                                    <li class="nav-item">
                                                        <a class="nav-link" data-toggle="pill" role="tab"
                                                            caria-selected="true">
                                                            Terdapat Kesalahan, Silahkan Refresh Kembali</a>
                                                    </li>
                                                @endforelse
                                            </ul>
                                        </div>
                                        <div class="card-body">
                                            <div class="tab-content" id="tabs-kriteria-tabContent">
                                                @forelse ($kriteria as $judul => $value)
                                                    <div class="tab-pane fade{{ $judul == 'kriteria_1' ? ' show active' : '' }}"
                                                        id="tabs-{{ strtolower(Str::replace('_', '-', $judul)) }}"
                                                        role="tabpanel"
                                                        aria-labelledby="tabs-{{ strtolower(Str::replace('_', '-', $judul)) }}-tab">

                                                        @forelse ($value as $kriteria => $isi)
                                                            <div class="card card-primary" style="margin-bottom: 0px;">
                                                                <div class="card-header bg-primary">
                                                                    <h3 class="card-title font-weight-bold">{{ $kriteria }}
                                                                    </h3>
                                                                </div>
                                                                <div class="card-body">
                                                                    <div class="row">
                                                                        <div class="col-5 col-sm-3">
                                                                            <div class="nav flex-column nav-tabs h-100"
                                                                                id="vert-tabs-tab" role="tablist"
                                                                                aria-orientation="vertical">
                                                                                @foreach (array_keys($isi) as $urutan => $value)
                                                                                    <a class="nav-link{{ $urutan == 0 ? ' active' : '' }}"
                                                                                        id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                                        data-toggle="pill"
                                                                                        href="#vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                                        role="tab"
                                                                                        aria-controls="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                                        aria-selected="true">{{ $value }}</a>
                                                                                @endforeach
                                                                            </div>
                                                                        </div>

                                                                        <div class="col-7 col-sm-9">
                                                                            <div class="tab-content"
                                                                                id="vert-tabs-tabContent">
                                                                                @foreach (array_keys($isi) as $urutan => $value)
                                                                                    <div class="tab-pane fade{{ $urutan == 0 ? ' show active' : '' }}"
                                                                                        id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                                        role="tabpanel"
                                                                                        aria-labelledby="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                                        style="text-align: justify;">
                                                                                        @if (is_array($isi[$value]))
                                                                                            @foreach (array_keys($isi[$value]) as $judulChild => $valueChild)
                                                                                                <div id="accordion">
                                                                                                    <div class="card">
                                                                                                        <div class="card-header"
                                                                                                            id="headingOne">
                                                                                                            <h3
                                                                                                                class="mb-0">
                                                                                                                <button
                                                                                                                    class="btn"
                                                                                                                    data-toggle="collapse"
                                                                                                                    data-target="#collapse-{{ strtolower(Str::replace(' ', '-', $valueChild)) . '-' . $judulChild }}"
                                                                                                                    aria-expanded="true"
                                                                                                                    aria-controls="collapse-{{ strtolower(Str::replace(' ', '-', $valueChild)) . '-' . $judulChild }}"
                                                                                                                    style="color: white;">
                                                                                                                    {{ $judulChild + 1 }}.
                                                                                                                    {{ $valueChild }}
                                                                                                                </button>
                                                                                                            </h3>
                                                                                                        </div>

                                                                                                        <div id="collapse-{{ strtolower(Str::replace(' ', '-', $valueChild)) . '-' . $judulChild }}"
                                                                                                            class="collapse"
                                                                                                            aria-labelledby="heading-{{ strtolower(Str::replace(' ', '-', $valueChild)) . '-' . $judulChild }}"
                                                                                                            data-parent="#accordion">
                                                                                                            <div
                                                                                                                class="card-body">
                                                                                                                @if (View::exists($isi[$value][$valueChild]))
                                                                                                                    @include(
                                                                                                                        $isi[$value][
                                                                                                                            $valueChild
                                                                                                                        ]
                                                                                                                    )
                                                                                                                @else
                                                                                                                    {{ $isi[$value][$valueChild] }}
                                                                                                                @endif
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            @endforeach
                                                                                        @else
                                                                                            {{ $isi[$value] }}
                                                                                        @endif
                                                                                    </div>
                                                                                @endforeach
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        @empty
                                                        @endforelse
                                                    </div>

                                                @empty
                                                @endforelse
                                            </div>
                                        </div>

                                    </div>
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
            $(document).ready(function() {
                let detail_akred = {!! $detail_akred !!};
                let rank_akred = {!! $rank_akred !!};
                let tahun_akred = [];
                let akreditasi = [];

                $.each(detail_akred, function(i, k) {
                    tahun_akred.push(i);
                    akreditasi.push(k[1]);
                });

                let count_object = Object.keys(akreditasi).length;
                if (count_object > 1) {
                    var chartType = 'line';
                } else {
                    var chartType = 'column';
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
