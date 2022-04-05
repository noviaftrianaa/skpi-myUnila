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
                            Kualitas Input Mahasiswa
                        </h1>
                        <h1 class="card-title" style="font-weight: bold;">
                            {{ $judul }}
                        </h1>
                    </div>
                    <div class="card-body">
                        <table class="tg table-striped seleksi_mhs_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow" rowspan="2">No</th>
                                    <th class="tg-c3ow" rowspan="2">Daya Tampung</th>
                                    <th class="tg-c3ow" colspan="2">Jumlah Calon Mahasiswa</th>
                                    <th class="tg-c3ow" colspan="2">Jumlah Mahasiswa Baru</th>
                                    <th class="tg-c3ow" colspan="2">Jumlah Mahasiswa Aktif</th>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">Pendaftar</th>
                                    <th class="tg-0pky">Lulus Seleksi</th>
                                    <th class="tg-0pky">Reguler</th>
                                    <th class="tg-0pky">Transfer</th>
                                    <th class="tg-0pky">Reguler</th>
                                    <th class="tg-0pky">Transfer</th>
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
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
