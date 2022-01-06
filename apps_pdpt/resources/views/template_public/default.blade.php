<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>{{ (config('mp.apps.title')).' - '.((config('mp.apps.at_use')==1?config('mp.apps.user.institute'):config('mp.copyright.institute'))) }}</title>
    <!-- Tell the browser to be responsive to screen width -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/png" href="{{ asset((config('mp.apps.at_use')==1?config('mp.apps.user.logo'):config('mp.copyright.logo'))) }}">
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
    <link rel="stylesheet" href="{!! asset('node_modules/select2/dist/css/select2.min.css') !!}">
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
</head>
<body style="background-color: gainsboro">
<nav class="navbar navbar-expand-lg navbar-light" style="background-color: #1e73be">
    <div class="container">
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
            <a class="navbar-brand text-white" href="{{ url('/') }}">
                <img src="{{ asset('images/logo-unila.png') }}" width="60" height="60" alt="" loading="lazy"> {{ config('mp.apps.title') }}
            </a>
            <ul class="navbar-nav ml-auto">
                <a href="" class="btn btn-success my-2 my-sm-0"><i class="fa fa-key"></i> Login</a>
            </ul>
        </div>
    </div>
</nav>
<!-- Main content -->
<section class="content mt-4 mb-4">
    <div class="container-fluid">
        @yield('content')
    </div>
</section>
<!-- /.content -->

<footer class="main-footer" style="margin-left: 0px;text-align: center; background-color: #eaeaea">
    <strong>Copyright</strong> {{ (config('mp.apps.at_use')==0?config('mp.apps.year_development'):config('mp.copyright.year').' by '.config('mp.copyright.institute')) }}<br>
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
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    })
</script>
</body>
</html>
