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
                <a style='color'> Kriteria Standar 4</a>
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
                                        <a class="nav-link active" id="dosen-tetap-tab" data-toggle="pill"
                                            href="#dosen-tetap" role="tab" aria-controls="dosen-tetap"
                                            aria-selected="true">Dosen Tetap Perguruan Tinggi</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="dosen-pembimbing-tab" data-toggle="pill"
                                            href="#dosen-pembimbing" role="tab" aria-controls="dosen-pembimbing"
                                            aria-selected="false">Dosen Pembimbing Utama Tugas Akhir</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="ewpm-dosen-tetap-tab" data-toggle="pill"
                                            href="#ewpm-dosen-tetap" role="tab" aria-controls="ewpm-dosen-tetap"
                                            aria-selected="false">EWPM Dosen Tetap Perguruan Tinggi</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id=">ewpm-dosen-tidak" data-toggle="pill"
                                            href="#ewpm-dosen-tidak" role="tab" aria-controls="ewpm-dosen-tidak"
                                            aria-selected="false">EWPM Dosen Tidak Tetap</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="dosen-industri-tab" data-toggle="pill"
                                            href="#dosen-industri" role="tab" aria-controls="dosen-industri"
                                            aria-selected="false">Dosen Industri/Praktisi</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="Pengakuan-tab" data-toggle="pill"
                                            href="#Pengakuan" role="tab" aria-controls="Pengakuan"
                                            aria-selected="false">Pengakuan/Rekoknisi DTPS </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="penelitian-tab" data-toggle="pill"
                                            href="#penelitian" role="tab" aria-controls="penelitian"
                                            aria-selected="false">Penelitian DTPS</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pkm-tab" data-toggle="pill" href="#pkm" role="tab"
                                            aria-controls="pkm" aria-selected="false">PKM DTPS</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="publikasi-tab" data-toggle="pill"
                                            href="#publikasi" role="tab" aria-controls="publikasi"
                                            aria-selected="false">Publikasi Ilmiah DTPS</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pegelaran-tab" data-toggle="pill"
                                            href="#pegelaran" role="tab" aria-controls="pegelaran"
                                            aria-selected="false">Pegelaran Ilmiah DTPS</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="disita-tab" data-toggle="pill" href="#disita"
                                            role="tab" aria-controls="disita" aria-selected="false">Karya Ilmiah DTPS
                                            yang disita</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="produk-tab" data-toggle="pill" href="#produk"
                                            role="tab" aria-controls="produk" aria-selected="false">Produk/Jasa DTPSyang
                                            diadopsi oleh industri/Masyarakat</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="paten-tab" data-toggle="pill" href="#paten"
                                            role="tab" aria-controls="paten" aria-selected="false">HKI Paten </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="cipta-tab" data-toggle="pill" href="#cipta"
                                            role="tab" aria-controls="cipta" aria-selected= "false">HKI Hak Cipta</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="teknologi-tab" data-toggle="pill"
                                            href="#teknologi" role="tab" aria-controls="teknologi"
                                            aria-selected="false">Teknologi tepat guna</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="buku-tab" data-toggle="pill" href="#buku"
                                            role="tab" aria-controls="buku" aria-selected="false">Buku BerISBN</a>
                                    </li>

                                </ul>
                                <div class="tab-content" id="pills-tabContent">
                                    <div class="tab-pane fade show active" id="dosen-tetap" role="tabpanel"
                                        aria-labelledby="dosen-tetap-tab">
                                        <style type="text/css">
                                            .tg {
                                                border-collapse: collapse;
                                                border-color: #ccc;
                                                border-spacing: 0;
                                            }

                                            .tg td {
                                                background-color: #fff;
                                                border-color: #ccc;
                                                border-style: solid;
                                                border-width: 1px;
                                                color: #333;
                                                font-family: Arial, sans-serif;
                                                font-size: 14px;
                                                overflow: hidden;
                                                padding: 10px 5px;
                                                word-break: normal;
                                            }

                                            .tg th {
                                                background-color: #f0f0f0;
                                                border-color: #ccc;
                                                border-style: solid;
                                                border-width: 1px;
                                                color: #333;
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

                                        </style>
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No </th>
                                                    <th rowspan="2">Nama Dosen </th>
                                                    <th rowspan="2">NIDN/NIDK</th>
                                                    <th colspan="2">Pendidikan Pasca Sarjana</th>
                                                    <th rowspan="2">Bidang Keahlian </th>
                                                    <th rowspan="2">Kesesuaian dengan Kompetisi Inti PS
                                                    </th>
                                                    <th rowspan="2">Jabatan Akademik</th>
                                                    <th rowspan="2"> Sertifikat Pandidikan Profesional
                                                    </th>
                                                    <th rowspan="2"> Sertifikat Kompetensi
                                                        Profesi/Industri</th>
                                                    <th rowspan="2">Mata Kuliah yang Diampu pada PS yang
                                                        Diakreditasi</th>
                                                    <th rowspan="2">Kesesuaian Bidang Keahlian dengan
                                                        Mata Kuliah yang Diampu</th>
                                                    <th rowspan="2">Mata Kuliah yang Diampu pada PS lain
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th>Magister/Magister Terapan/Spesialis</th>
                                                    <th>Doktor/Doktor Terapan/Spesialis</th>
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
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="dosen-pembimbing" role="tabpanel"
                                        aria-labelledby="dosen-pembimbing-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <td rowspan="3">No </td>
                                                    <td rowspan="3">Nama Dosen</td>
                                                    <td colspan="8">Jumlah Mahasiswa yang Dibimbing</td>
                                                    <td rowspan="3">Rata-rata Jumlah Bimbingan di semua
                                                        Program/Semester</td>
                                                </tr>
                                                <tr>
                                                    <td colspan="4">Pada PS yang Diakreditasi</td>
                                                    <td colspan="4">Pada PS lain di PT</td>
                                                </tr>
                                                <tr>
                                                    <td>TS-2</td>
                                                    <td>TS-1</td>
                                                    <td>TS</td>
                                                    <td>Rata-rata</td>
                                                    <td>TS-2</td>
                                                    <td>TS-1</td>
                                                    <td>TS</td>
                                                    <td>Rata-rata</td>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="ewpm-dosen-tetap" role="tabpanel"
                                        aria-labelledby="ewpm-dosen-tetap-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <td rowspan="3">No</td>
                                                    <td rowspan="3">Nama Dosen (DT)</td>
                                                    <td rowspan="3">DTPS</td>
                                                    <td colspan="7">EWMP pada saat TS dalam SKS</td>
                                                    <td rowspan="3">Rata-rata per Semester (sks)</td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3">Pendidikan : Pembelajaran dan
                                                        Pembimbingan </td>
                                                    <td rowspan="2">Penelitian </td>
                                                    <td rowspan="2">PKM</td>
                                                    <td rowspan="2">Tugas Tambahan dan Penunjang</td>
                                                    <td rowspan="2">Jumlah (SKS)</td>
                                                </tr>
                                                <tr>
                                                    <td>PS yang Diakreditasi</td>
                                                    <td>PS Lain di dalam PT</td>
                                                    <td>PS lain di luar PT</td>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="ewpm-dosen-tidak" role="tabpanel"
                                        aria-labelledby="ewpm-dosen-tidak-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Nama Dosen</th>
                                                    <th>NIDN/NIDK</th>
                                                    <th>Pendidikan Pasca Sarjana</th>
                                                    <th>Bidang Keahlian</th>
                                                    <th>Jabatan Akademik</th>
                                                    <th>Sertifikasi Pendidikan Profesional</th>
                                                    <th>Sertifikasi Kompetensi Profesi/Industri</th>
                                                    <th>Mata Kuliah yang Diampu pada PS&nbsp;&nbsp;yang
                                                        Diakreditasi</th>
                                                    <th>Kesesuaian Bidang Keahlian dengan Mata Kuliah
                                                        yang Diampu</th>
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
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="dosen-industri" role="tabpanel"
                                        aria-labelledby="dosen-industri-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th>No </th>
                                                    <th>Nama Dosen Industri/Praktisi</th>
                                                    <th>NIDK </th>
                                                    <th>Perusahaan/Industri</th>
                                                    <th>Pendidikan Tertinggi</th>
                                                    <th>Bidang Keahlian </th>
                                                    <th>Sertifikasi Profesi/Kompetensi/Industri</th>
                                                    <th>Mata Kuliah yang Diampu</th>
                                                    <th>Bobot Kredit (sks)</th>
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
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="Pengakuan" role="tabpanel"
                                        aria-labelledby="Pengakuan-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No </th>
                                                    <th rowspan="2">Nama Dosen </th>
                                                    <th rowspan="2">Bidang Kuliah </th>
                                                    <th rowspan="2">Rekognisi dan Bukti Pendukung</th>
                                                    <th colspan="3">Tingkat</th>
                                                    <th rowspan="2">Tahun (yyyy)</th>
                                                </tr>
                                                <tr>
                                                    <th>Wilayah</th>
                                                    <th>Nasional</th>
                                                    <th>Internasional</th>
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
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="penelitian" role="tabpanel"
                                        aria-labelledby="penelitian-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Sumber Pembiayaan </th>
                                                    <th colspan="3">Jumlah Judul Penelitian</th>
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
                                                    <td>Perguruan Tinggi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td>Mandiri</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td>Lembaga dalam negeri ( diluar PT)</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td>Lembaga luar negeri</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">Jumlah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="pkm" role="tabpanel" aria-labelledby="pkm-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Sumber Pembiayaan </th>
                                                    <th colspan="3">Jumlah Judul Penelitian</th>
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
                                                    <td>Perguruan Tinggi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td>Mandiri</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td>Lembaga dalam negeri ( diluar PT)</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td>Lembaga luar negeri</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">Jumlah</td>
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
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Jenis Publikasi</th>
                                                    <th colspan="3">Jumlah Judul</th>
                                                    <th>Jumlah</th>
                                                </tr>
                                                <tr>
                                                    <th>TS-2</th>
                                                    <th>TS-1</th>
                                                    <th>TS</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td>Jurnal penelitian tidak terakreditasi</td>
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
                                                    <td>jurnal penelitian internasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td>jurnal penelitian internasional bereputasi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td>Seminar wilayah/lokal/ perguruan tinggi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>6</td>
                                                    <td>Seminar Nasional </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>7</td>
                                                    <td>Seminar Internasional</td>
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
                                                    <td>Tulisan di media massa nasional</td>
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
                                                    <td colspan="2">Jumlah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="pegelaran" role="tabpanel"
                                        aria-labelledby="pegelaran-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Jenis Publikasi </th>
                                                    <th colspan="3">Jumlah Judul</th>
                                                    <th rowspan="2">Jumlah</th>
                                                </tr>
                                                <tr>
                                                    <th>TS-2</th>
                                                    <th>TS-1</th>
                                                    <th>TS </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td>Jurnal penelitian tidak terakreditasi</td>
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
                                                    <td>Jurnal penelitian Internasioan </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td>Jurnal penelitian Internasional bereputasi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td>Seminar wilayah/lokal/perguruan tinggu</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>6</td>
                                                    <td>Seminar nasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>7</td>
                                                    <td>Seminar internasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>8</td>
                                                    <td>Pegelaran/pameran/prsentasi dalam forum di
                                                        tingkat wilayah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>9</td>
                                                    <td>Pegelaran/pameran/presentasi dalam forum di
                                                        tingkat nasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>10</td>
                                                    <td>Pegelaran/pameran/presentasi dalam forum di
                                                        tingkat internasional</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">Jumlah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="disita" role="tabpanel" aria-labelledby="disita">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Nama Dosen </th>
                                                    <th>Judul Artikel Disita (Jurnal, Volume, Tahun,
                                                        Nomor, Halaman)</th>
                                                    <th>Jumlah Sitasi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="produk" role="tabpanel" aria-labelledby="produk">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Nama Dosen</th>
                                                    <th>Nama Produk/jasa</th>
                                                    <th>Deskripsi Produk/Jasa</th>
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
                                                <tr>
                                                    <td>3</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="paten" role="tabpanel" aria-labelledby="paten">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Luaran Penelitian dan PKM</th>
                                                    <th>Tahun (YYYY)</th>
                                                    <th>Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="cipta" role="tabpanel" aria-labelledby="cipta-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Luaran Penelitian dan PKM</th>
                                                    <th>Tahun (YYYY)</th>
                                                    <th>Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="teknologi" role="tabpanel"
                                        aria-labelledby="teknologi-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Luaran Penelitian dan PKM</th>
                                                    <th>Tahun (YYYY)</th>
                                                    <th>Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="buku" role="tabpanel" aria-labelledby="buku-tab">
                                        <table class="tg">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Luaran Penelitian dan PKM</th>
                                                    <th>Tahun (YYYY)</th>
                                                    <th>Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>1</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>2</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>3</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>4</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>5</td>
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
