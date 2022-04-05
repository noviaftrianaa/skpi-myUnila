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
                            Profil Dosen
                        </h1>
                        <h1 class="card-title" style="font-weight: bold;">
                            {{ $judul }}
                        </h1>
                    </div>
                    <div class="card-body">
                        <style type="text/css">
                            .tg {
                                border-collapse: collapse;
                                border-color: #ccc;
                                border-spacing: 0;
                                width: 100%;
                            }

                            .tg td {
                                background-color: #fff;
                                border-color: #ccc;
                                border-style: solid;
                                border-width: 1px;
                                color: #333;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                overflow: hidden;
                                padding: 10px 5px;
                                word-break: normal;
                            }

                            .tg th {
                                background-color: #f0f0f0;
                                border-color: #ccc;
                                border-style: solid;
                                border-width: 1px;
                                color: #333;
                                font-family: Arial, sans-serif;
                                font-size: 14px;
                                font-weight: normal;
                                overflow: hidden;
                                padding: 10px 5px;
                                word-break: normal;
                            }

                            .tg .tg-c3ow {
                                border-color: inherit;
                                text-align: center;
                                vertical-align: middle;
                                font-weight: bold;
                            }

                            .tg .tg-0pky {
                                border-color: inherit;
                                text-align: center;
                                vertical-align: middle;
                                font-weight: bold;
                            }

                        </style>
                        <table class="tg table-striped eewmp_dosen_tetap_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow" rowspan="3">No</th>
                                    <th class="tg-c3ow" rowspan="3">Nama Dosen (DT)</th>
                                    <th class="tg-c3ow" rowspan="3">DTPS</th>
                                    <th class="tg-c3ow" colspan="6">Jumlah Mahasiswa Yang Dibimbing</th>
                                    <th class="tg-c3ow" rowspan="3">Jumlah
                                        (sks)</th>
                                    <th class="tg-c3ow" rowspan="3">Rata-rata
                                        per
                                        Semester
                                        (sks)</th>
                                </tr>
                                <tr>
                                    <th class="tg-c3ow" colspan="3">Pendidikan:
                                        Pembelajaran dan Pembimbingan</th>
                                    <th class="tg-c3ow" rowspan="2">Penelitian</th>
                                    <th class="tg-c3ow" rowspan="2">PkM</th>
                                    <th class="tg-c3ow" rowspan="2">Tugas
                                        Tambahan
                                        dan/atau
                                        Penunjang</th>
                                </tr>
                                <tr>
                                    <th class="tg-c3ow" rowspan="1">PS yang
                                        Diakreditasi</th>
                                    <th class="tg-c3ow" rowspan="1">PS Lain di
                                        dalam PT</th>
                                    <th class="tg-c3ow" rowspan="1">PS Lain di
                                        luar PT</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    @for ($index = 1; $index <= 11; $index++)
                                        <td class="tg-0pky">{{ $index }}</td>
                                    @endfor
                                </tr>
                                {{-- <tr>
                                    <td class="tg-0pky" colspan="9" style="text-align: right;">Rata-Rata DT : </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <td class="tg-0pky" colspan="9" style="text-align: right;">Rata-Rata DTPS : </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr> --}}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
