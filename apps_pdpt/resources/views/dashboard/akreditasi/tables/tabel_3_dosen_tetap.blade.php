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
                        <table class="tg table-responsive table-striped dsn_tetap_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow">No</th>
                                    <th class="tg-c3ow">Nama Dosen</th>
                                    <th class="tg-c3ow">NIDN</th>
                                    <th class="tg-c3ow">Pendidikan Pasca Sarjana</th>
                                    <th class="tg-c3ow">Bidang Keahlian</th>
                                    <th class="tg-c3ow">Kesesuaian
                                        dengan Kompetensi
                                        Inti PS</th>
                                    <th class="tg-c3ow">Jabatan Akademik</th>
                                    <th class="tg-c3ow">Sertifikat
                                        Pendidik
                                        Profesional</th>
                                    <th class="tg-c3ow">Sertifikat
                                        Kompetensi/
                                        Profesi/
                                        Industri </th>
                                    <th class="tg-c3ow">Mata Kuliah
                                        yang Diampu
                                        pada PS yang
                                        Diakreditasi</th>
                                    <th class="tg-c3ow">Kesesuaian
                                        Bidang
                                        Keahlian
                                        dengan Mata Kuliah
                                        yang
                                        Diampu</th>
                                    <th class="tg-c3ow">Mata Kuliah
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
