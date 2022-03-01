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
                <a style='color'> Detail Standar 5</a>
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
                                            aria-selected="false">Kurikulum, capaian pembelajaran, dan rencana pembelajaran</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-contact-tab" data-toggle="pill"
                                            href="#pills-contact" role="tab" aria-controls="pills-contact"
                                            aria-selected="false">Intergrasi kegiatan penelitian/ PKM dalam Pembelajaran</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="pills-profile-tab" data-toggle="pill"
                                            href="#pills-profile" role="tab" aria-controls="pills-profile"
                                            aria-selected="false">Kepuasan Mahasiswa</a>
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
                                    .tg  {border-collapse:collapse;border-spacing:0;}
                                    .tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
                                      overflow:hidden;padding:10px 5px;word-break:normal;}
                                    .tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
                                      font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
                                    .tg .tg-0lax{text-align:left;vertical-align:top}
                                    </style>
                                    <table class="tg">
                                    <thead>
                                      <tr>
                                        <th class="tg-0lax" rowspan="2">No</th>
                                        <th class="tg-0lax" rowspan="2">Semester</th>
                                        <th class="tg-0lax" rowspan="2">Kode Mata Kuliah</th>
                                        <th class="tg-0lax" rowspan="2">Nama Mata Kuliah</th>
                                        <th class="tg-0lax" rowspan="2">Mata Kuliah Kompetensi</th>
                                        <th class="tg-0lax" colspan="3">Bobot Kredit (Sks)</th>
                                        <th class="tg-0lax" rowspan="2">Konversi Kredit ke Jam</th>
                                        <th class="tg-0lax" colspan="4">Capaian Pembelajaran</th>
                                        <th class="tg-0lax" rowspan="2">Dokumen Rencanan Pembelajaran</th>
                                        <th class="tg-0lax" rowspan="2">Unit Penyelenggaraan</th>
                                      </tr>
                                      <tr>
                                        <th class="tg-0lax">Kuliah/Responsi/tutorial</th>
                                        <th class="tg-0lax">Seminar</th>
                                        <th class="tg-0lax">Praktikum/Praktik/Praktik Lapangan</th>
                                        <th class="tg-0lax">Sikap</th>
                                        <th class="tg-0lax">Pengetahuan</th>
                                        <th class="tg-0lax">Keterampilan Umum</th>
                                        <th class="tg-0lax">Keterampilan Khusus</th>
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
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
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
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
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
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
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
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
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
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                      <tr>
                                        <td class="tg-0lax">6</td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                      <tr>
                                        <td class="tg-0lax">7</td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                      <tr>
                                        <td class="tg-0lax">8</td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                      <tr>
                                        <td class="tg-0lax">9</td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                      <tr>
                                        <td class="tg-0lax">10</td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                      <tr>
                                        <td class="tg-0lax">11</td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                      <tr>
                                        <td class="tg-0lax">12</td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                      <tr>
                                        <td class="tg-0lax">13</td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                        <td class="tg-0lax"></td>
                                      </tr>
                                    </tbody>
                                    </table>
                                    <style type="text/css">
                                        .tg  {border-collapse:collapse;border-spacing:0;}
                                        .tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
                                          overflow:hidden;padding:10px 5px;word-break:normal;}
                                        .tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
                                          font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
                                        .tg .tg-0lax{text-align:left;vertical-align:top}
                                        </style>
                                        <table class="tg">
                                        <thead>
                                          <tr>
                                            <th class="tg-0lax">No</th>
                                            <th class="tg-0lax">Judul Penelitian/PKM</th>
                                            <th class="tg-0lax">Nama Dosen</th>
                                            <th class="tg-0lax">Mata Kuliah</th>
                                            <th class="tg-0lax">Bentuk Integrasi</th>
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
                                            .tg  {border-collapse:collapse;border-spacing:0;}
                                            .tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
                                              overflow:hidden;padding:10px 5px;word-break:normal;}
                                            .tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
                                              font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
                                            .tg .tg-0lax{text-align:left;vertical-align:top}
                                            </style>
                                            <table class="tg">
                                            <thead>
                                              <tr>
                                                <th class="tg-0lax" rowspan="2">No</th>
                                                <th class="tg-0lax" rowspan="2">Aspek yang Diukur</th>
                                                <th class="tg-0lax" colspan="4">Tingkat Kepuasan Mahasiswa</th>
                                                <th class="tg-0lax" rowspan="2">Rencana Tindak Lanjut oleh UPPS/PS</th>
                                              </tr>
                                              <tr>
                                                <th class="tg-0lax">Sangat Baik</th>
                                                <th class="tg-0lax">Baik</th>
                                                <th class="tg-0lax">Cukup</th>
                                                <th class="tg-0lax">Kurang</th>
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
                                                <td class="tg-0lax"></td>
                                              </tr>
                                              <tr>
                                                <td class="tg-0lax">2</td>
                                                <td class="tg-0lax"></td>
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
