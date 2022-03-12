<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>{{ (config('mp.apps.title')).' - '.((config('mp.apps.at_use')==1?config('mp.apps.user.institute'):config('mp.copyright.institute'))) }}</title>
    <link rel="icon" type="image/png" href="{{ asset((config('mp.apps.at_use')==1?config('mp.apps.user.logo'):config('mp.copyright.logo'))) }}">
    <!-- Google Font: Source Sans Pro -->
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">
    <!-- Ionicons -->
    <link rel="stylesheet" href="{{ asset('node_modules/ionicons/dist/css/ionicons.min.css') }}">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="{{ asset('template/AdminLTE-3.2.0/plugins/fontawesome-free/css/all.min.css') }}">
    <!-- Admin LTE -->
    <link href="{{ asset('template/AdminLTE-3.2.0/dist/css/adminlte.min.css') }}" rel="stylesheet" />
    <!-- CSS Files -->
    <link rel="stylesheet" href="{!! asset('node_modules/select2/dist/css/select2.min.css') !!}">
    <!-- Daterange picker -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/daterangepicker/daterangepicker.css') }}">

    @stack('css')
    <link href="{{ asset('template/material-dashboard-master/assets/css/overide.css') }}" rel="stylesheet" />
</head>
<body class="hold-transition sidebar-mini dark-mode">
<div class="wrapper">
    <!-- Preloader -->
    <div class="preloader">
        <img src="{{ asset('asset/logo/logo_unila.png') }}" alt="LogoUnilaLoading" height="60" width="60">
    </div>
    @include('template_public.navbar')
    @include('template_public.sidebar')

    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0">{{ $judul_layout ?? 'Dashboard' }}</h1>
                    </div><!-- /.col -->
                </div><!-- /.row -->
            </div><!-- /.container-fluid -->
        </div>
        <!-- /.content-header -->

        <!-- Main content -->
        <div class="content">
            <div class="container-fluid">
            @yield('content')
            </div>
            <!-- /.container-fluid -->
        </div>
        <!-- /.content -->
    </div>
    <!-- /.content-wrapper -->

    <!-- Control Sidebar -->
    <aside class="control-sidebar control-sidebar-dark">
        <!-- Control sidebar content goes here -->
    </aside>
    <!-- /.control-sidebar -->

    <!-- Main Footer -->
    <footer class="main-footer">
        <strong>Copyright &copy; 2014-2021 <a href="https://adminlte.io">AdminLTE.io</a>.</strong>
        All rights reserved.
        <div class="float-right d-none d-sm-inline-block">
            <b>Version</b> 3.2.0
        </div>
    </footer>
</div>

<!-- jQuery -->
<script src="{{ asset('master_template/plugins/jquery/jquery.min.js') }}"></script>
<!-- jQuery UI 1.11.4 -->
<script src="{{ asset('master_template/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
<script src="{{ asset('template/AdminLTE-3.2.0/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<script src="{{ asset('template/AdminLTE-3.2.0/dist/js/adminlte.js') }}"></script>
<!-- Resolve conflict in jQuery UI tooltip with Bootstrap tooltip -->
<script>
    $.widget.bridge('uibutton', $.ui.button)
</script>
<!-- daterangepicker -->
<script src="{{ asset('master_template/plugins/moment/moment.min.js') }}"></script>
<script src="{{ asset('master_template/plugins/daterangepicker/daterangepicker.js') }}"></script>
<script src="{!! asset('node_modules/sweetalert/dist/sweetalert.min.js') !!}"></script>

@stack('js')

@include('sweet::alert')
<script src="{!! asset('js/konfirmasi.js') !!}"></script>
<script src="{!! asset('js/konfirmasi_non_datatables.js') !!}"></script>
<script type="text/javascript">
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    })
</script>
</body>
</html>
