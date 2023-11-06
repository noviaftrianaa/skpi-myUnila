<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>@yield('title')</title>
    <!-- Tell the browser to be responsive to screen width -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/png" href="{{ asset('auth/img/logo.png') }}">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/fontawesome-free/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('node_modules/font-awesome/css/font-awesome.css') }}">
    <!-- Ionicons -->
    <link rel="stylesheet" href="{{ asset('node_modules/ionicons/dist/css/ionicons.min.css') }}">
    <!-- Tempusdominus Bbootstrap 4 -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css') }}">
    <!-- iCheck -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">
    <!-- JQVMap -->
    <!-- <link rel="stylesheet" href="{!! asset('node_modules/select2/dist/css/select2.min.css') !!}"> -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/select2/css/select2.min.css') }}">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/select2-bootstrap4-theme/select2-bootstrap4.min.css') }}">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/jqvmap/jqvmap.min.css') }}">
    <!-- Theme style -->
    <link rel="stylesheet" href="{{ asset('master_template/dist/css/adminlte.min.css') }}">
    <!-- overlayScrollbars -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/overlayScrollbars/css/OverlayScrollbars.min.css') }}">
    <!-- Daterange picker -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/daterangepicker/daterangepicker.css') }}">
    <!-- summernote -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/summernote/summernote-bs4.css') }}">
    <!-- Google Font: Source Sans Pro -->
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">
    @stack('css')
    <style>
        #loader {
            border: 16px solid #f3f3f3;
            border-radius: 50%;
            border-top: 16px solid #3498db;
            width: 120px;
            height: 120px;
            -webkit-animation: spin 2s linear infinite;
            animation: spin 2s linear infinite;
            margin-left:250px;
            margin-top:250px;
        }
        @-webkit-keyframes spin {
            0% { -webkit-transform: rotate(0deg); }
            100% { -webkit-transform: rotate(360deg); }
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="hold-transition sidebar-mini layout-fixed layout-navbar-fixed layout-footer-fixed text-sm">
<div class="wrapper">
    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand navbar-info navbar-dark border-bottom-0 text-white">
        <!-- Left navbar links -->
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" data-widget="pushmenu" href="#"><i class="fas fa-bars"></i></a>
            </li>
            <li class="nav-item d-none d-sm-inline-block">
                <a href="{{ url('/') }}" class="nav-link"><strong>Sistem Informasi Manajemen Akses</strong></a>
            </li>
        </ul>

        <!-- Right navbar links -->
        <ul class="navbar-nav ml-auto">
            @if(auth()->check())
            <li class="nav-item dropdown">
                <a class="nav-link" data-toggle="dropdown" href="#">
                    <i class="fas fa-user mr-2"></i>{{ auth()->user()->nm_pengguna }}
                </a>
                <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                    <!-- change password -->
                    <a class="dropdown-item" href="{{ route('dashboard.ubah_password') }}" style="border-bottom: 1px solid #eee">
                        <i class="fas fa-key mr-1"></i> Ubah Password
                    </a>
                    <!-- Logout -->
                    <a class="dropdown-item" href="{{ route('auth.logout') }}">
                        <i class="fas fa-power-off mr-1"></i> Logout
                    </a>
                </div>
            </li>
            @endif
        </ul>
    </nav>
    <!-- /.navbar -->

    <!-- Main Sidebar Container -->
    <aside class="main-sidebar sidebar-dark-info elevation-4">
        <!-- Brand Logo -->
        <a href="{!! url('/') !!}" class="brand-link text-white">
            <img src="{{ asset('images/logo-unila.png') }}" alt="Logo Aplikasi" class="brand-image img-fluid">
            <span class="brand-text font-weight text-sm"><strong>MANAJEMEN AKSES</strong></span>
        </a>
        @include('template.default.sidebar')
    </aside>

    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <div class="content-header">
            <div class="container-fluid">
                <!-- <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0 text-dark">{!! Judul() !!}</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                        </ol>
                    </div>
                </div> -->
            </div>
        </div>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                @include('error.list')
                @yield('content')
            </div>
        </section>
        <!-- /.content -->
    </div>
    <!-- /.content-wrapper -->
    <footer class="main-footer">
        <strong>Copyright {!! date('Y') !!}</strong> by TIK UNILA
        <div class="float-right">
            <b>SIMA UNILA</b>
        </div>
    </footer>
</div>
<!-- ./wrapper -->

<!-- jQuery -->
<script src="{{ asset('master_template/plugins/jquery/jquery.min.js') }}"></script>
<!-- jQuery UI 1.11.4 -->
<script src="{{ asset('master_template/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
    $.widget.bridge('uibutton', $.ui.button)
</script>
<script src="{{ asset('master_template/plugins/select2/js/select2.full.min.js') }}"></script>
<!-- Bootstrap 4 -->
<script src="{{ asset('master_template/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<!-- ChartJS -->
<script src="{{ asset('master_template/plugins/chart.js/Chart.min.js') }}"></script>
<!-- Sparkline -->
<script src="{{ asset('master_template/plugins/sparklines/sparkline.js') }}"></script>
<!-- JQVMap -->
<script src="{{ asset('master_template/plugins/jqvmap/jquery.vmap.min.js') }}"></script>
<script src="{{ asset('master_template/plugins/jqvmap/maps/jquery.vmap.usa.js') }}"></script>
<!-- jQuery Knob Chart -->
<script src="{{ asset('master_template/plugins/jquery-knob/jquery.knob.min.js') }}"></script>
<!-- daterangepicker -->
<script src="{{ asset('master_template/plugins/moment/moment.min.js') }}"></script>
<script src="{{ asset('master_template/plugins/daterangepicker/daterangepicker.js') }}"></script>
<!-- Tempusdominus Bootstrap 4 -->
<script src="{{ asset('master_template/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js') }}"></script>
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

    $(document).ready( function () {
        $('.select2').select2();
    });

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    function convertToRupiah(angka)
    {
        var rupiah = '';
        var angkarev = angka.toString().split('').reverse().join('');
        for(var i = 0; i < angkarev.length; i++) if(i%3 == 0) rupiah += angkarev.substr(i,3)+'.';
        return 'Rp. '+rupiah.split('',rupiah.length-1).reverse().join('');
    }
</script>
</body>
</html>
