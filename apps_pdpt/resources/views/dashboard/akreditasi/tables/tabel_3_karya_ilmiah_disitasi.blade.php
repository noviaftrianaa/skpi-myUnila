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
                            Kinerja Dosen
                        </h1>
                        <h1 class="card-title" style="font-weight: bold;">
                            {{ $judul }}
                        </h1>
                    </div>
                    <div class="card-body">
                        <table class="tg table-striped penelitian_dtps_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow">No</th>
                                    <th class="tg-c3ow">Nama Dosen</th>
                                    <th class="tg-c3ow">Judul Artikel yang Disitasi
                                        (Jurnal/Buku, Volume, Tahun,
                                        Nomor, Halaman)
                                    </th>
                                    <th class="tg-c3ow">Jumlah
                                        Sitasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th class="tg-0pky">1</th>
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
