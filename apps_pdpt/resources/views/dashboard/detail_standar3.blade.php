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
                <a style='color'> Detail Standar 3</a>
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
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Dosen Tetap Perguruan Tinggi</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-contact-tab" data-toggle="pill"
                                            href="#pills-contact" role="tab" aria-controls="pills-contact"
                                            aria-selected="false">Dosen Pembimbing Utama Tugas Akhir</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">EWPM Dosen Tetap Perguruan Tinggi</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">EWPM Dosen Tidak Tetap</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Dosen Industri/Praktisi</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Pengakuan/Rekoknisi DTPS </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Penelitian DTPS</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">PKM DTPS</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Publikasi Ilmiah DTPS</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Pegelaran Ilmiah DTPS</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Karya Ilmiah DTPS yang disita</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Produk/Jasa DTPS yang diadopsi oleh
                                            industri/Masyarakat</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">HKI Paten </a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">HKI Hak Cipta</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Teknologi tepat guna</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Buku BerISBN</a>
                                    </li>


                                </ul>
                                <div class="tab-content" id="pills-tabContent">
                                    <div class="tab-pane fade show active" id="pills-home" role="tabpanel"
                                        aria-labelledby="pills-home-tab"></div>
                                    <div class="tab-pane fade" id="pills-profile" role="tabpanel"
                                        aria-labelledby="pills-profile-tab"></div>
                                    <div class="tab-pane fade" id="pills-contact" role="tabpanel"
                                        aria-labelledby="pills-contact-tab"></div>
                                </div>
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
                                            <th class="tg-baqh" rowspan="2">No </th>
                                            <th class="tg-baqh" rowspan="2">Nama Dosen </th>
                                            <th class="tg-baqh" rowspan="2">NIDN/NIDK</th>
                                            <th class="tg-baqh" colspan="2">Pendidikan Pasca Sarjana</th>
                                            <th class="tg-baqh" rowspan="2">Bidang Keahlian </th>
                                            <th class="tg-baqh" rowspan="2">Kesesuaian dengan Kompetisi Inti PS
                                            </th>
                                            <th class="tg-baqh" rowspan="2">Jabatan Akademik</th>
                                            <th class="tg-baqh" rowspan="2"> Sertifikat Pandidikan Profesional
                                            </th>
                                            <th class="tg-baqh" rowspan="2"> Sertifikat Kompetensi
                                                Profesi/Industri</th>
                                            <th class="tg-baqh" rowspan="2">Mata Kuliah yang Diampu pada PS yang
                                                Diakreditasi</th>
                                            <th class="tg-baqh" rowspan="2">Kesesuaian Bidang Keahlian dengan
                                                Mata Kuliah yang Diampu</th>
                                            <th class="tg-baqh" rowspan="2">Mata Kuliah yang Diampu pada PS lain
                                            </th>
                                        </tr>
                                        <tr>
                                            <th class="tg-baqh">Magister/Magister Terapan/Spesialis</th>
                                            <th class="tg-baqh">Doktor/Doktor Terapan/Spesialis</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                    </tbody>
                                </table>
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
                                            <td class="tg-baqh" rowspan="3">No </td>
                                            <td class="tg-baqh" rowspan="3">Nama Dosen</td>
                                            <td class="tg-baqh" colspan="8">Jumlah Mahasiswa yang Dibimbing</td>
                                            <td class="tg-baqh" rowspan="3">Rata-rata Jumlah Bimbingan di semua
                                                Program/Semester</td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh" colspan="4">Pada PS yang Diakreditasi</td>
                                            <td class="tg-baqh" colspan="4">Pada PS lain di PT</td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh">TS-2</td>
                                            <td class="tg-baqh">TS-1</td>
                                            <td class="tg-baqh">TS</td>
                                            <td class="tg-baqh">Rata-rata</td>
                                            <td class="tg-baqh">TS-2</td>
                                            <td class="tg-baqh">TS-1</td>
                                            <td class="tg-baqh">TS</td>
                                            <td class="tg-baqh">Rata-rata</td>
                                        </tr>
                                    </thead>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <td class="tg-baqh" rowspan="3">No</td>
                                            <td class="tg-baqh" rowspan="3">Nama Dosen (DT)</td>
                                            <td class="tg-baqh" rowspan="3">DTPS</td>
                                            <td class="tg-baqh" colspan="7">EWMP pada saat TS dalam SKS</td>
                                            <td class="tg-baqh" rowspan="3">Rata-rata per Semester (sks)</td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax" colspan="3">Pendidikan : Pembelajaran dan
                                                Pembimbingan </td>
                                            <td class="tg-0lax" rowspan="2">Penelitian </td>
                                            <td class="tg-0lax" rowspan="2">PKM</td>
                                            <td class="tg-0lax" rowspan="2">Tugas Tambahan dan Penunjang</td>
                                            <td class="tg-0lax" rowspan="2">Jumlah (SKS)</td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">PS yang Diakreditasi</td>
                                            <td class="tg-0lax">PS Lain di dalam PT</td>
                                            <td class="tg-0lax">PS lain di luar PT</td>
                                        </tr>
                                    </thead>
                                </table>
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
                                            <th class="tg-baqh">No</th>
                                            <th class="tg-baqh">Nama Dosen</th>
                                            <th class="tg-baqh">NIDN/NIDK</th>
                                            <th class="tg-baqh">Pendidikan Pasca Sarjana</th>
                                            <th class="tg-baqh">Bidang Keahlian</th>
                                            <th class="tg-baqh">Jabatan Akademik</th>
                                            <th class="tg-baqh">Sertifikasi Pendidikan Profesional</th>
                                            <th class="tg-baqh">Sertifikasi Kompetensi Profesi/Industri</th>
                                            <th class="tg-baqh">Mata Kuliah yang Diampu pada PS&nbsp;&nbsp;yang
                                                Diakreditasi</th>
                                            <th class="tg-baqh">Kesesuaian Bidang Keahlian dengan Mata Kuliah
                                                yang Diampu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                    </tbody>
                                </table>
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
                                            <th class="tg-baqh">No </th>
                                            <th class="tg-baqh">Nama Dosen Industri/Praktisi</th>
                                            <th class="tg-baqh">NIDK </th>
                                            <th class="tg-baqh">Perusahaan/Industri</th>
                                            <th class="tg-baqh">Pendidikan Tertinggi</th>
                                            <th class="tg-baqh">Bidang Keahlian </th>
                                            <th class="tg-baqh">Sertifikasi Profesi/Kompetensi/Industri</th>
                                            <th class="tg-baqh">Mata Kuliah yang Diampu</th>
                                            <th class="tg-baqh">Bobot Kredit (sks)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                    </tbody>
                                </table>
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
                                            <th class="tg-baqh" rowspan="2">No </th>
                                            <th class="tg-baqh" rowspan="2">Nama Dosen </th>
                                            <th class="tg-baqh" rowspan="2">Bidang Kuliah </th>
                                            <th class="tg-baqh" rowspan="2">Rekognisi dan Bukti Pendukung</th>
                                            <th class="tg-baqh" colspan="3">Tingkat</th>
                                            <th class="tg-baqh" rowspan="2">Tahun (yyyy)</th>
                                        </tr>
                                        <tr>
                                            <th class="tg-baqh">Wilayah</th>
                                            <th class="tg-baqh">Nasional</th>
                                            <th class="tg-baqh">Internasional</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                    </tbody>
                                </table>
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
                                            <th class="tg-baqh" rowspan="2">No</th>
                                            <th class="tg-baqh" rowspan="2">Sumber Pembiayaan </th>
                                            <th class="tg-baqh" colspan="3">Jumlah Judul Penelitian</th>
                                            <th class="tg-baqh" rowspan="2">Jumlah</th>
                                        </tr>
                                        <tr>
                                            <th class="tg-baqh">TS-2</th>
                                            <th class="tg-baqh">TS-1</th>
                                            <th class="tg-baqh">TS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-baqh">1</td>
                                            <td class="tg-baqh">Perguruan Tinggi</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh">2</td>
                                            <td class="tg-baqh">Mandiri</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh">3</td>
                                            <td class="tg-baqh">Lembaga dalam negeri ( diluar PT)</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh">4</td>
                                            <td class="tg-baqh">Lembaga luar negeri</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh" colspan="2">Jumlah</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                    </tbody>
                                </table>
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
                                            <th class="tg-baqh" rowspan="2">No</th>
                                            <th class="tg-baqh" rowspan="2">Sumber Pembiayaan </th>
                                            <th class="tg-baqh" colspan="3">Jumlah Judul Penelitian</th>
                                            <th class="tg-baqh" rowspan="2">Jumlah</th>
                                        </tr>
                                        <tr>
                                            <th class="tg-baqh">TS-2</th>
                                            <th class="tg-baqh">TS-1</th>
                                            <th class="tg-baqh">TS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-baqh">1</td>
                                            <td class="tg-baqh">Perguruan Tinggi</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh">2</td>
                                            <td class="tg-baqh">Mandiri</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh">3</td>
                                            <td class="tg-baqh">Lembaga dalam negeri ( diluar PT)</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh">4</td>
                                            <td class="tg-baqh">Lembaga luar negeri</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-baqh" colspan="2">Jumlah</td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                            <td class="tg-baqh"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-baqh" rowspan="2">No</th>
                                            <th class="tg-baqh" rowspan="2">Jenis Publikasi</th>
                                            <th class="tg-baqh" colspan="3">Jumlah Judul</th>
                                            <th class="tg-baqh">Jumlah</th>
                                        </tr>
                                        <tr>
                                            <th class="tg-baqh">TS-2</th>
                                            <th class="tg-baqh">TS-1</th>
                                            <th class="tg-baqh">TS</th>
                                            <th class="tg-baqh"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax">Jurnal penelitian tidak terakreditasi</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax">Jurnal penelitian nasional terakreditasi</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax">jurnal penelitian internasional</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax">jurnal penelitian internasional bereputasi</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax">Seminar wilayah/lokal/ perguruan tinggi</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">6</td>
                                            <td class="tg-0lax">Seminar Nasional </td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">7</td>
                                            <td class="tg-0lax">Seminar Internasional</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">8</td>
                                            <td class="tg-0lax">Tulisan di media massa wilayah</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">9</td>
                                            <td class="tg-0lax">Tulisan di media massa nasional</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">10</td>
                                            <td class="tg-0lax">Tulisan di media massa internasional</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax" colspan="2">Jumlah</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-baqh" rowspan="2">No</th>
                                            <th class="tg-baqh" rowspan="2">Jenis Publikasi </th>
                                            <th class="tg-baqh" colspan="3">Jumlah Judul</th>
                                            <th class="tg-baqh" rowspan="2">Jumlah</th>
                                        </tr>
                                        <tr>
                                            <th class="tg-0lax">TS-2</th>
                                            <th class="tg-0lax">TS-1</th>
                                            <th class="tg-0lax">TS </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax">Jurnal penelitian tidak terakreditasi</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax">Jurnal penelitian nasional terakreditasi</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax">Jurnal penelitian Internasioan </td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax">Jurnal penelitian Internasional bereputasi</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax">Seminar wilayah/lokal/perguruan tinggu</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">6</td>
                                            <td class="tg-0lax">Seminar nasional</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">7</td>
                                            <td class="tg-0lax">Seminar internasional</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">8</td>
                                            <td class="tg-0lax">Pegelaran/pameran/prsentasi dalam forum di
                                                tingkat wilayah</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">9</td>
                                            <td class="tg-0lax">Pegelaran/pameran/presentasi dalam forum di
                                                tingkat nasional</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">10</td>
                                            <td class="tg-0lax">Pegelaran/pameran/presentasi dalam forum di
                                                tingkat internasional</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax" colspan="2">Jumlah</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Nama Dosen </th>
                                            <th class="tg-0lax">Judul Artikel Disita (Jurnal, Volume, Tahun,
                                                Nomor, Halaman)</th>
                                            <th class="tg-0lax">Jumlah Sitasi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Nama Dosen</th>
                                            <th class="tg-0lax">Nama Produk/jasa</th>
                                            <th class="tg-0lax">Deskripsi Produk/Jasa</th>
                                            <th class="tg-0lax">Bukti</th>
                                            <th class="tg-0lax">Tahun (YYYY)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Luaran Penelitian dan PKM</th>
                                            <th class="tg-0lax">Tahun (YYYY)</th>
                                            <th class="tg-0lax">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Luaran Penelitian dan PKM</th>
                                            <th class="tg-0lax">Tahun (YYYY)</th>
                                            <th class="tg-0lax">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Luaran Penelitian dan PKM</th>
                                            <th class="tg-0lax">Tahun (YYYY)</th>
                                            <th class="tg-0lax">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Luaran Penelitian dan PKM</th>
                                            <th class="tg-0lax">Tahun (YYYY)</th>
                                            <th class="tg-0lax">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Luaran Penelitian dan PKM</th>
                                            <th class="tg-0lax">Tahun (YYYY)</th>
                                            <th class="tg-0lax">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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

                                    .tg .tg-0lax {
                                        text-align: left;
                                        vertical-align: top
                                    }

                                </style>
                                <table class="tg">
                                    <thead>
                                        <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Luaran Penelitian dan PKM</th>
                                            <th class="tg-0lax">Tahun (YYYY)</th>
                                            <th class="tg-0lax">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="tg-0lax">1</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">2</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">3</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">4</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                        <tr>
                                            <td class="tg-0lax">5</td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                            <td class="tg-0lax"></td>
                                        </tr>
                                    </tbody>
                                </table>
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
