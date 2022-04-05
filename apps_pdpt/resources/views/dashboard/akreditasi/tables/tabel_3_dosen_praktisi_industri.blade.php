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
                        <table class="tg table-striped dsn_prakin_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow">No</th>
                                    <th class="tg-c3ow">Nama Dosen
                                        Industri/Praktisi</th>
                                    <th class="tg-c3ow">NIDK</th>
                                    <th class="tg-c3ow">Perusahaan/
                                        Industri
                                    </th>
                                    <th class="tg-c3ow">Pendidikan
                                        Tertinggi</th>
                                    <th class="tg-c3ow">Bidang
                                        Keahlian</th>
                                    <th class="tg-c3ow">Sertifikat
                                        Profesi/
                                        Kompetensi/
                                        Industri
                                    </th>
                                    <th class="tg-c3ow">Mata Kuliah
                                        yang Diampu</th>
                                    <th class="tg-c3ow">Bobot Kredit
                                        (sks)</th>
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
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
