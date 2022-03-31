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
                        <table class="tg table-striped dsn_pembimbing_utama_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow" rowspan="3">No</th>
                                    <th class="tg-c3ow" rowspan="3">Nama Dosen</th>
                                    <th class="tg-c3ow" colspan="6">Jumlah Mahasiswa Yang Dibimbing</th>
                                    <th class="tg-c3ow" rowspan="3">Rata-rata Jumlah Bimbingan/ Tahun</th>
                                    <th class="tg-c3ow" rowspan="3">Rata-rata Jumlah
                                        Bimbingan di seluruh
                                        Program/
                                        Tahun</th>
                                </tr>
                                <tr>
                                    <th class="tg-c3ow" colspan="3">Pada PS yang Diakreditasi</th>
                                    <th class="tg-c3ow" colspan="3">Pada PS Lain pada Program
                                        yang sama di PT</th>
                                </tr>
                                <tr>
                                    <th class="tg-c3ow" colspan="1">TS-2</th>
                                    <th class="tg-c3ow" colspan="1">TS-1</th>
                                    <th class="tg-c3ow" colspan="1">TS</th>

                                    <th class="tg-c3ow" colspan="1">TS-2</th>
                                    <th class="tg-c3ow" colspan="1">TS-1</th>
                                    <th class="tg-c3ow" colspan="1">TS</th>
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
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
