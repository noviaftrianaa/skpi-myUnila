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
                        <table class="tg table-striped mhs_asing_datatable">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow" rowspan="2">No</th>
                                    <th class="tg-c3ow" colspan="3">Jumlah Mahasiswa Aktif</th>
                                    <th class="tg-c3ow" colspan="3">Jumlah Mahasiswa
                                        Asing Penuh Waktu
                                        (Full-time)
                                    </th>
                                    <th class="tg-c3ow" colspan="3">Jumlah Mahasiswa
                                        Asing Paruh Waktu
                                        (Part-time)
                                    </th>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">TS-2</th>
                                    <th class="tg-0pky">TS-1</th>
                                    <th class="tg-0pky">TS</th>

                                    <th class="tg-0pky">TS-2</th>
                                    <th class="tg-0pky">TS-1</th>
                                    <th class="tg-0pky">TS</th>

                                    <th class="tg-0pky">TS-2</th>
                                    <th class="tg-0pky">TS-1</th>
                                    <th class="tg-0pky">TS</th>
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
