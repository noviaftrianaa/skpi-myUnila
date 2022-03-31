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
                                    <th class="tg-c3ow" rowspan="2">Media Publikasi</th>
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
                                        Jurnal nasional tidak terakreditasi
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">2</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Jurnal nasional terakreditasi
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">3</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Jurnal internasional
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">4</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Jurnal internasional bereputasi
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">5</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Seminar wilayah/lokal/perguruan tinggi
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">6</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Seminar nasional
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">7</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Seminar internasional
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">8</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Tulisan di media massa wilayah
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">9</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Tulisan di media massa nasional
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                                <tr>
                                    <th class="tg-0pky">10</th>
                                    <td class="tg-0pky" style="text-align: left;">
                                        Tulisan di media massa internasional
                                    </td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                    <td class="tg-0pky"></td>
                                </tr>
                            </tbody>

                            @if (!empty($type) && $type == 'terapan')
                                <tbody>
                                    <tr>
                                        <th class="tg-0pky">1</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Publikasi di jurnal nasional tidak terakreditasi
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">2</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Publikasi di jurnal nasional terakreditasi
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">3</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Publikasi di jurnal internasional
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">4</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Publikasi di jurnal internasional bereputasi
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">5</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Publikasi di seminar wilayah/lokal/perguruan tinggi
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">6</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Publikasi di seminar nasional
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">7</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Publikasi di seminar internasional
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">8</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Pagelaran/pameran/presentasi dalam forum di tingkat wilayah
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">9</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Pagelaran/pameran/presentasi dalam forum di tingkat nasional

                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                    <tr>
                                        <th class="tg-0pky">10</th>
                                        <td class="tg-0pky" style="text-align: left;">
                                            Pagelaran/pameran/presentasi dalam forum di tingkat internasional
                                        </td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                        <td class="tg-0pky"></td>
                                    </tr>
                                </tbody>
                            @endif
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
