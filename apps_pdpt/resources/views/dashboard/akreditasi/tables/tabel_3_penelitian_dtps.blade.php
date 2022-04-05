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
                                    <th class="tg-c3ow" rowspan="2">No</th>
                                    <th class="tg-c3ow" rowspan="2">Sumber Pembiayaan</th>
                                    <th class="tg-c3ow" colspan="3">Jumlah Judul</th>
                                    <th class="tg-c3ow" rowspan="2">Jumlah</th>
                                </tr>
                                <tr>
                                    <th class="tg-c3ow">TS-2</th>
                                    <th class="tg-c3ow">TS-1</th>
                                    <th class="tg-c3ow">TS</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th class="tg-0pky">1</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        <span> a) Perguruan Tinggi</span>
                                        <br>
                                        <span> b) Mandiri</span>
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">2</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Lembaga Dalam Negeri (di luar PT)
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">3</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Lembaga Luar Negeri
                                    </td>
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
