@include('__partial.highchart')
@include('__partial.datatable_class')


<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>
        {{ config('mp.apps.title') .' - ' .(config('mp.apps.at_use') == 1 ? config('mp.apps.user.institute') : config('mp.copyright.institute')) }}
    </title>
    <!-- Tell the browser to be responsive to screen width -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/png"
        href="{{ asset(config('mp.apps.at_use') == 1 ? config('mp.apps.user.logo') : config('mp.copyright.logo')) }}">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/fontawesome-free/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('node_modules/font-awesome/css/font-awesome.css') }}">
    <!-- Ionicons -->
    <link rel="stylesheet" href="{{ asset('node_modules/ionicons/dist/css/ionicons.min.css') }}">
    <!-- Tempusdominus Bbootstrap 4 -->
    <link rel="stylesheet"
        href="{{ asset('master_template/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css') }}">
    <!-- iCheck -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">
    <!-- JQVMap -->
    <link rel="stylesheet" href="{!! asset('node_modules/select2/dist/css/select2.min.css') !!}">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/jqvmap/jqvmap.min.css') }}">
    <!-- Theme style -->
    <link rel="stylesheet" href="{{ asset('master_template/dist/css/adminlte.min.css') }}">
    <!-- overlayScrollbars -->
    <link rel="stylesheet"
        href="{{ asset('master_template/plugins/overlayScrollbars/css/OverlayScrollbars.min.css') }}">
    <!-- Daterange picker -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/daterangepicker/daterangepicker.css') }}">
    <!-- summernote -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/summernote/summernote-bs4.css') }}">
    <!-- Google Font: Source Sans Pro -->
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">
    @stack('css')
</head>

<body style="background-color: gainsboro">
    <nav class="navbar navbar-expand-lg navbar-light" style="background-color: #1e73be">
        <div class="container">
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01"
                aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
                <a style='color'> Detail Standar 9</a>
            </div>
        </div>
    </nav>
    <!-- Main content -->
    <section class="content mt-4 mb-4">
        <div class="container-fluid">
            <div class="container">
                <div class="row">
                    <div class="col-sm-12">
                        <div class="card">
                            <div class="card-body">

                                <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">

                                    <li class="nav-item">
                                        <a class="nav-link active" id="lulusan-tab" data-toggle="pill" href="#lulusan"
                                            role="tab" aria-controls="lulusan" aria-selected="true">IPK Lulusan</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="akademik-tab" data-toggle="pill" href="#akademik"
                                            role="tab" aria-controls="akademik" aria-selected="false">Prestasi Akademik
                                            Mahasiswa</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="nonakademik-tab" data-toggle="pill"
                                            href="#nonakademik" role="tab" aria-controls="nonakademik"
                                            aria-selected="false">Prestasi Non-Akademik Mahasiswa</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="dayasaing-tab" data-toggle="pill"
                                            href="#dayasaing" role="tab" aria-controls="dayasaing"
                                            aria-selected="false">Daya Saing Lulusan</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="kesesuaian-tab" data-toggle="pill"
                                            href="#kesesuaian" role="tab" aria-controls="kesesuaian"
                                            aria-selected="false">Kesesuaian bidang kerja lulusan </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="kinerja-tab" data-toggle="pill" href="#kinerja"
                                            role="tab" aria-controls="kinerja" aria-selected="false">Kinerja lulusan
                                            yang diukur</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="kepuasan-tab" data-toggle="pill" href="#kepuasan"
                                            role="tab" aria-controls="kepuasan" aria-selected="false">Kepuasan Pengguna
                                            Lulusan</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="publikasi-tab" data-toggle="pill"
                                            href="#publikasi" role="tab" aria-controls="publikasi"
                                            aria-selected="false">Publikasi Karya Ilmiah</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="karyailmiah-tab" data-toggle="pill"
                                            href="#karyailmiah" role="tab" aria-controls="karyailmiah"
                                            aria-selected="false">Publikasi Karya Ilmiah</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="produk-jasa-tab" data-toggle="pill"
                                            href="#produk-jasa" role="tab" aria-controls="produk-jasa"
                                            aria-selected="false">Produk/Jasa DTPS yang dihasilkan mahasiswa</a>
                                    </li>
                                </ul>
                                <div class="tab-content" id="pills-tabContent">
                                    <div class="tab-pane fade show active" id="lulusan" role="tabpanel"
                                        aria-labelledby="lulusan-tab">
                                        <style type="text/css">
                                            .tg {
                                                border-collapse: collapse;
                                                border-spacing: 0;
                                            }

                                            .tg td {
                                                border-color: black;
                                                border-style: solid;
                                                border-width: 1px;
                                                font-family: Arial, sans-serif;
                                                font-size: 14px;
                                                overflow: hidden;
                                                padding: 10px 5px;
                                                word-break: normal;
                                            }

                                            .tg th {
                                                border-color: black;
                                                border-style: solid;
                                                border-width: 1px;
                                                font-family: Arial, sans-serif;
                                                font-size: 14px;
                                                font-weight: normal;
                                                overflow: hidden;
                                                padding: 10px 5px;
                                                word-break: normal;
                                            }

                                            .tg .tg-baqh {
                                                text-align: center;
                                                vertical-align: top
                                            }

                                            .tg .tg-0lax {
                                                text-align: left;
                                                vertical-align: top
                                            }

                                        </style>
                                        <table class="tg table-responsive table-striped">
                                            <colgroup>
                                                <col style="width: 32px">
                                                <col style="width: 102px">
                                                <col style="width: 109px">
                                                <col style="width: 74px">
                                                <col style="width: 79px">
                                                <col style="width: 66px">
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th class="tg-baqh" rowspan="2">No </th>
                                                    <th class="tg-baqh" rowspan="2">Tahun Lulusan</th>
                                                    <th class="tg-baqh" rowspan="2">Jumlah Lulusan</th>
                                                    <th class="tg-baqh" colspan="3">Indeks Prestasi Kumulatif
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th class="tg-baqh">Min</th>
                                                    <th class="tg-baqh">Rata-rata</th>
                                                    <th class="tg-baqh">Maks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                </tr>
                                                <tr>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                </tr>
                                                <tr>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                    <td class="tg-0lax"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="akademik" role="tabpanel"
                                        aria-labelledby="akademik-tab">
                                        <table class="tg table-responsive table-striped">
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Nama Kegiatan</th>
                                                    <th rowspan="2">Waktu Perolehan (YYYY)</th>
                                                    <th colspan="3">Tingkat</th>
                                                    <th rowspan="2">Prestasi yang Dicapai</th>
                                                </tr>
                                                <tr>
                                                    <th>Lokal/Wilayah</th>
                                                    <th>Nasional</th>
                                                    <th>Internasional</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="nonakademik" role="tabpanel"
                                        aria-labelledby="nonakademik-tab">
                                        <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">

                                            <li class="nav-item">
                                                <a class="nav-link active" id="diploma-tab" data-toggle="pill"
                                                    href="#diploma" role="tab" aria-controls="diploma"
                                                    aria-selected="true">Program Diploma</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" id="sarjana-tab" data-toggle="pill"
                                                    href="#sarjana" role="tab" aria-controls="sarjana"
                                                    aria-selected="false">Program Sarjana</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" id="magister-tab" data-toggle="pill"
                                                    href="#magister" role="tab" aria-controls="magister"
                                                    aria-selected="false">Program Magister</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" id="doktor-tab" data-toggle="pill"
                                                    href="#doktor" role="tab" aria-controls="doktor"
                                                    aria-selected="false">Program Doktor</a>
                                            </li>
                                        </ul>
                                        <div class="non-content" id="non-tabContent">
                                            <div class="tab-pane fade show active" id="diploma" role="tabpanel"
                                                aria-labelledby="diploma-tab">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th rowspan="2">Tahun Masuk</th>
                                                            <th rowspan="2">Jumlah Mahasiswa Diterima</th>
                                                            <th colspan="5">Jumlah Mahasiswa yang lulus pada </th>
                                                            <th rowspan="2">Jumlah Lulusan&nbsp;&nbsp;s.d. akhir TS
                                                            </th>
                                                            <th rowspan="2">Rata-rata Masa Studi</th>
                                                        </tr>
                                                        <tr>
                                                            <th>Akhir TS-4</th>
                                                            <th>Akhir TS-3</th>
                                                            <th>Akhir TS-2</th>
                                                            <th>Akhir TS-1</th>
                                                            <th>Akhir TS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div class="tab-pane fade" id="sarjana" role="tabpanel"
                                                aria-labelledby="sarjana-tab">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th rowspan="2">Tahun Masuk</th>
                                                            <th rowspan="2">Jumlah Mahasiswa Diterima</th>
                                                            <th colspan="7">Jumlah Mahasiswa yang lulus pada </th>
                                                            <th rowspan="2">Jumlah Lulusan&nbsp;&nbsp;s.d. akhir TS
                                                            </th>
                                                            <th rowspan="2">Rata-rata Masa Studi</th>
                                                        </tr>
                                                        <tr>
                                                            <th>Akhir TS-6</th>
                                                            <th>Akhir TS-5</th>
                                                            <th>Akhir TS-4</th>
                                                            <th>Akhir TS-3</th>
                                                            <th>Akhir TS-2</th>
                                                            <th>Akhir TS-1</th>
                                                            <th>Akhir TS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div class="tab-pane fade" id="magister" role="tabpanel"
                                                aria-labelledby="magister-tab">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th rowspan="2">Tahun Masuk</th>
                                                            <th rowspan="2">Jumlah Mahasiswa Diterima</th>
                                                            <th colspan="4">Jumlah mahasiswa yang lulus pada</th>
                                                            <th rowspan="2">Jumlah Lulusan&nbsp;&nbsp;s.d. akhir TS
                                                            </th>
                                                            <th rowspan="2">Rata-rata Masa Studi</th>
                                                        </tr>
                                                        <tr>
                                                            <th>Akhir TS-3</th>
                                                            <th>Akhir TS-2</th>
                                                            <th>Akhir TS-1</th>
                                                            <th>Akhir TS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                            </div>
                                            <div class="tab-pane fade" id="doktor" role="tabpanel"
                                                aria-labelledby="doktor-tab">

                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th rowspan="2">Tahun Masuk</th>
                                                            <th rowspan="2">Jumlah Mahasiswa Diterima</th>
                                                            <th colspan="7">Jumlah Mahasiswa yang lulus pada </th>
                                                            <th rowspan="2">Jumlah Lulusan&nbsp;&nbsp;s.d. akhir TS
                                                            </th>
                                                            <th rowspan="2">Rata-rata Masa Studi</th>
                                                        </tr>
                                                        <tr>
                                                            <th>Akhir TS-6</th>
                                                            <th>Akhir TS-5</th>
                                                            <th>Akhir TS-4</th>
                                                            <th>Akhir TS-3</th>
                                                            <th>Akhir TS-2</th>
                                                            <th>Akhir TS-1</th>
                                                            <th>Akhir TS</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="kesesuaian" role="tabpanel"
                                        aria-labelledby="kesesuaian-tab">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">Tahun Lulusan</th>
                                                    <th rowspan="2">Jumlah Lulusan</th>
                                                    <th rowspan="2">Jumlah Lulusan yang Terlacak</th>
                                                    <th colspan="3">Jumlah lulusan terlacak dengan tingkat kesesuaian
                                                        bidang kerja</th>
                                                </tr>
                                                <tr>
                                                    <th>Rendah</th>
                                                    <th>Sedang</th>
                                                    <th>Tinggi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>TS-4</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>TS-3</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>TS-2</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Jumlah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="kinerja" role="tabpanel"
                                        aria-labelledby="kinerja-tab">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">Tahun Lulusan</th>
                                                    <th rowspan="2">Jumlah Lulusan</th>
                                                    <th rowspan="2">Jumlah Lulusan yang Terlacak</th>
                                                    <th colspan="3">Jumlah lulusan terlacak yang bekerja berdasarkan
                                                        tingkat/ukuran/tempat/kerja/berwirausaha</th>
                                                </tr>
                                                <tr>
                                                    <th>lokal/wilayah/berwirausaha tidak berbadan hukum</th>
                                                    <th>Nasional/berwirausaha berbadan hukum</th>
                                                    <th>Multinasional/internasional</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>TS-4</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>TS-3</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>TS-2</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Jumlah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="kepuasan" role="tabpanel"
                                        aria-labelledby="kepuasan-tab">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Jenis Kemampuan</th>
                                                    <th rowspan="2">Jumlah Lulusan yang Terlacak</th>
                                                    <th colspan="3">Jumlah lulusan terlacak yang bekerja berdasarkan
                                                        tingkat/ukuran/tempat/kerja/berwirausaha</th>
                                                </tr>
                                                <tr>
                                                    <th>lokal/wilayah/berwirausaha tidak berbadan hukum</th>
                                                    <th>Nasional/berwirausaha berbadan hukum</th>
                                                    <th>Multinasional/internasional</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td>Etika</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td>Keahlian pada bidang ilmu (kompetensi utama)</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td>Kemampuan berbahasa asing</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td>penggunaan teknologi informasi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td>kemampuan berkomunikasi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>6</td>
                                                    <td>Kerjasama</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>7</td>
                                                    <td>Pengembangan diri</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td>Jumlah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="publikasi" role="tabpanel"
                                        aria-labelledby="publikasi-tab">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Jenis Publikasi</th>
                                                    <th colspan="3">Jumlah Judul</th>
                                                    <th rowspan="2">Jumlah</th>
                                                </tr>
                                                <tr>
                                                    <th>TS-2</th>
                                                    <th>TS-1</th>
                                                    <th>TS</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td>Jurnlal penelitian tidak terakreditasi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td>Jurnal penelitian nasional terakreditasi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td>Jurnal penelitian internasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td>Jurnal penelitian internasional bereputasi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td>Seminar wilayah/lokal/perguruan tinggi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>6</td>
                                                    <td>seminar nasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>7</td>
                                                    <td>seminar internasioal</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>8</td>
                                                    <td>Tulisan di media massa wilayah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>9</td>
                                                    <td>Tulisan di media massa internasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>10</td>
                                                    <td>Tulisan di media massa internasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td>Jumlah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="karyailmiah" role="tabpanel"
                                        aria-labelledby="karyailmiah-tab">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Nama Mahasiswa</th>
                                                    <th rowspan="2">Judul Artikel yang disitasi (jurnal), volume, tahun,
                                                        nomor, halaman</th>
                                                    <th rowspan="2">Jumlah sitasi</th>
                                                </tr>
                                                <tr>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="produk-jasa" role="tabpanel"
                                        aria-labelledby="produk-jasa-tab">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Nama Mahasiswa</th>
                                                    <th>Nama Produk/jasa</th>
                                                    <th>Deskripsi produk/jasa</th>
                                                    <th>Bukti</th>
                                                    <th>Tahun (YYYY)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    </section>
    <!-- /.content -->

    <footer class="main-footer" style="margin-left: 0px;text-align: center; background-color: #eaeaea">
        <strong>Copyright</strong>
        {{ config('mp.apps.at_use') == 0? config('mp.apps.year_development'): config('mp.copyright.year') . ' by ' . config('mp.copyright.institute') }}<br>
    </footer>
    <!-- jQuery -->
    <script src="{{ asset('master_template/plugins/jquery/jquery.min.js') }}"></script>
    <!-- jQuery UI 1.11.4 -->
    <script src="{{ asset('master_template/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
    <!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
    <script>
        $.widget.bridge('uibutton', $.ui.button)
    </script>
    <!-- Bootstrap 4 -->
    <script src="{{ asset('master_template/plugins/bootstrap/js/bootstrap.min.js') }}"></script>
    <!-- daterangepicker -->
    <script src="{{ asset('master_template/plugins/moment/moment.min.js') }}"></script>
    <script src="{{ asset('master_template/plugins/daterangepicker/daterangepicker.js') }}"></script>
    <!-- Tempusdominus Bootstrap 4 -->
    <script src="{{ asset('master_template/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js') }}">
    </script>
    <!-- Summernote -->
    <script src="{{ asset('master_template/plugins/summernote/summernote-bs4.min.js') }}"></script>
    <!-- overlayScrollbars -->
    <script src="{{ asset('master_template/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js') }}"></script>
    <!-- AdminLTE App -->
    <script src="{{ asset('master_template/dist/js/adminlte.js') }}"></script>
    <script src="{!! asset('node_modules/sweetalert/dist/sweetalert.min.js') !!}"></script>

    @stack('js')

    @include('sweet::alert')
    <script src="{!! asset('js/konfirmasi.js') !!}"></script>
    <script src="{!! asset('js/konfirmasi_non_datatables.js') !!}"></script>
    <script type="text/javascript">
        $(function() {
            $('[data-toggle="tooltip"]').tooltip();
        })
    </script>
</body>

</html>

@push('js')
@endpush
