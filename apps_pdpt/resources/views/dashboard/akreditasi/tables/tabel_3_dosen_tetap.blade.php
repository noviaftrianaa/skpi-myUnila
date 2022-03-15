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
                        <table class="tg table-striped">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow" rowspan="2">No</th>
                                    <th class="tg-c3ow" rowspan="2">Nama Dosen</th>
                                    <th class="tg-c3ow" rowspan="2">NIDN</th>
                                    <th class="tg-c3ow" rowspan="2">Pendidikan Pasca Sarjana</th>
                                    <th class="tg-c3ow" rowspan="2">Bidang Keahlian</th>
                                    <th class="tg-c3ow" rowspan="2">Kesesuaian
                                        dengan Kompetensi
                                        Inti PS</th>
                                    <th class="tg-c3ow" rowspan="2">Jabatan Akademik</th>
                                    <th class="tg-c3ow" rowspan="2">Sertifikat
                                        Pendidik
                                        Profesional</th>
                                    <th class="tg-c3ow" rowspan="2">Sertifikat
                                        Kompetensi/
                                        Profesi/
                                        Industri </th>
                                    <th class="tg-c3ow" rowspan="2">Mata Kuliah
                                        yang Diampu
                                        pada PS yang
                                        Diakreditasi</th>
                                    <th class="tg-c3ow" rowspan="2">Kesesuaian
                                        Bidang
                                        Keahlian
                                        dengan Mata Kuliah
                                        yang
                                        Diampu</th>
                                    <th class="tg-c3ow" rowspan="2">Mata Kuliah
                                        yang Diampu
                                        pada PS Lain</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
