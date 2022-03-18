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
                        <table class="tg table-striped rekognisi_dtps_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow" rowspan="2">No</th>
                                    <th class="tg-c3ow" rowspan="2">Nama Dosen</th>
                                    <th class="tg-c3ow" rowspan="2">Bidang Keahlian</th>
                                    <th class="tg-c3ow" rowspan="2">Rekognisi dan
                                        Bukti
                                        Pendukung</th>
                                    <th class="tg-c3ow" colspan="3">Tingkat</th>
                                    <th class="tg-c3ow" rowspan="2">Tahun</th>
                                </tr>
                                <tr>
                                    <th class="tg-c3ow" colspan="1">Wilayah</th>
                                    <th class="tg-c3ow" colspan="1">Nasional</th>
                                    <th class="tg-c3ow" colspan="1">Internasional</th>
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
