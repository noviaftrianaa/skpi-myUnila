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
                <a class="text-color:white"> Kriteria Standar 5</a>
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
                                        <a class="nav-link active" id="perolehan-dana-tab" data-toggle="pill"
                                            href="#perolehan-dana" role="tab" aria-controls="perolehan-dana"
                                            aria-selected="true">Perolehan Dana</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="penggunaan-dana-tab" data-toggle="pill"
                                            href="#penggunaan-dana" role="tab" aria-controls="pills-contact"
                                            aria-selected="false">Penggunaan Dana</a>
                                    </li>
                                </ul>
                                <div class="tab-content" id="pills-tabContent">
                                    <div class="tab-pane fade show active" id="perolehan-dana" role="tabpanel"
                                        aria-labelledby="perolehan-dana-tab">
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

                                            .tg .tg-c3ow {
                                                border-color: inherit;
                                                text-align: center;
                                                vertical-align: top
                                            }

                                            .tg .tg-0pky {
                                                border-color: inherit;
                                                text-align: left;
                                                vertical-align: top
                                            }

                                        </style>
                                        <table class="tg table-responsive table-striped">
                                            <colgroup>
                                                <col style="width: 29px">
                                                <col style="width: 101px">
                                                <col style="width: 139px">
                                                <col style="width: 57px">
                                                <col style="width: 58px">
                                                <col style="width: 59px">
                                                <col style="width: 116px">
                                            </colgroup>
                                            <thead>
                                                <tr>
                                                    <th rowspan="2">No</th>
                                                    <th rowspan="2">Sumber Dana</th>
                                                    <th rowspan="2">Jenis Dana</th>
                                                    <th colspan="3">Jumlah Dana (Rupiah)</th>
                                                    <th>Jumlah (Rupiah)</th>
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
                                                    <td rowspan="4">1</td>
                                                    <td>Mahasiswa</td>
                                                    <td>SPP</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td>Sumbangan lainnya</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td></td>
                                                    <td>Lain-lain</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">Jumlah :</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="6">2</td>
                                                    <td rowspan="5">Kementrian/Yayasan</td>
                                                    <td>Anggaran rutin*</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Anggaran pembangunan</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Hibah penelitian</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Hibah PKM</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Lain-lain</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td colspan="2">Jumlah :</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="5">3</td>
                                                    <td rowspan="4">PT sendiri</td>
                                                    <td>Jasa layanan profesi dan keahlian</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Produk institusi</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Kerjasama kelembagaan (Pemerintah atau swasta)</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Lain-lain</td>
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
                                                <tr>
                                                    <td rowspan="4">4</td>
                                                    <td rowspan="3">Sumber lain (dalam dan luar negeri)</td>
                                                    <td>Hibah</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Dana lestari dan filantropis</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Lain-lain</td>
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
                                                <tr>
                                                    <td></td>
                                                    <td colspan="2">Jumlah (1+2+3+4)</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td rowspan="4">5</td>
                                                    <td rowspan="2">Dana penelitian dan PKM</td>
                                                    <td>Dana penelitian</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                                <tr>
                                                    <td>Dana PKM</td>
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
                                                <tr>
                                                    <td colspan="2">Jumlah (1+2+3+4+5)</td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div class="tab-pane fade" id="penggunaan-dana" role="tabpanel"
                                        aria-labelledby="penggunaan-dana-tab">
                                        <table class="tg table-responsive table-striped">
                                            <colgroup>
                                            <col style="width: 28px">
                                            <col style="width: 268px">
                                            <col style="width: 42px">
                                            <col style="width: 50px">
                                            <col style="width: 52px">
                                            <col style="width: 114px">
                                            </colgroup>
                                            <thead>
                                              <tr>
                                                <th rowspan="2">No</th>
                                                <th rowspan="2">Jenis Penggunaan</th>
                                                <th colspan="3">Dana (Rupiah)</th>
                                                <th>Jumlah (Rupiah)</th>
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
                                                <td>Dana operasional proses pembelajaran *</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                              </tr>
                                              <tr>
                                                <td>2</td>
                                                <td>Dana penelitian **</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                              </tr>
                                              <tr>
                                                <td>3</td>
                                                <td>Dana pengabdian kepada masyarakat ***</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                              </tr>
                                              <tr>
                                                <td>4</td>
                                                <td>Investasi prasarana</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                              </tr>
                                              <tr>
                                                <td>5</td>
                                                <td>Investasi sarana</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                              </tr>
                                              <tr>
                                                <td>6</td>
                                                <td>Investasi SDM</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                              </tr>
                                              <tr>
                                                <td>7</td>
                                                <td>Lain-lain, </td>
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
                                              <tr>
                                                <td>1</td>
                                                <td>Dana penelitian ****</td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                              </tr>
                                              <tr>
                                                <td>2</td>
                                                <td>Dana PKM ****</td>
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
