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
                            Kerjasama
                        </h1>
                        <h1 class="card-title" style="font-weight: bold;">
                            {{ $judul }}
                        </h1>
                    </div>
                    <div class="card-body">
                        <table class="tg table-responsive table-striped pengabdian_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow" rowspan="2">No</th>
                                    <th class="tg-c3ow" rowspan="2">Lembaga Mitra</th>
                                    <th class="tg-c3ow" colspan="3">Tingkat *</th>
                                    <th class="tg-c3ow" rowspan="2">Judul Kegiatan Kerjasama</th>
                                    <th class="tg-c3ow" rowspan="2">Manfaat bagi PS yang
                                        Diakreditasi</th>
                                    <th class="tg-c3ow" rowspan="2">Waktu dan Durasi</th>
                                    <th class="tg-c3ow" rowspan="2">Bukti Kerjasama</th>
                                    <th class="tg-c3ow" rowspan="2">Tahun Berakhirnya Bekerjasama
                                        (yyyy)</th>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">Internasional</th>
                                    <th class="tg-0pky">Nasional</th>
                                    <th class="tg-0pky">Wilayah/Lokal</th>
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
