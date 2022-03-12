<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>{{ (config('mp.apps.title')).' - '.((config('mp.apps.at_use')==1?config('mp.apps.user.institute'):config('mp.copyright.institute'))) }}</title>
    <!-- Tell the browser to be responsive to screen width -->
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="icon" type="image/png" href="{{ asset((config('mp.apps.at_use')==1?config('mp.apps.user.logo'):config('mp.copyright.logo'))) }}">
    <!--     Fonts and icons     -->
    <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900|Roboto+Slab:400,700" />
    <!-- Nucleo Icons -->
    <link href="{{ asset('template/material-dashboard-master/assets/css/nucleo-icons.css') }}" rel="stylesheet" />
    <link href="{{ asset('template/material-dashboard-master/assets/css/nucleo-svg.css') }}" rel="stylesheet" />
    <!-- Ionicons -->
    <link rel="stylesheet" href="{{ asset('node_modules/ionicons/dist/css/ionicons.min.css') }}">
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/fontawesome-free/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('node_modules/font-awesome/css/font-awesome.css') }}">
    <!-- Material Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet">
    <!-- CSS Files -->
    <link id="pagestyle" href="{{ asset('template/material-dashboard-master/assets/css/material-dashboard.css?v=3.0.1') }}" rel="stylesheet" />
    <link rel="stylesheet" href="{!! asset('node_modules/select2/dist/css/select2.min.css') !!}">
    <!-- Daterange picker -->
    <link rel="stylesheet" href="{{ asset('master_template/plugins/daterangepicker/daterangepicker.css') }}">
    <!-- Google Font: Source Sans Pro -->
    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">

    @stack('css')
    <link href="{{ asset('template/material-dashboard-master/assets/css/overide.css') }}" rel="stylesheet" />
</head>
<body class="g-sidenav-show  bg-gray-200 dark-version">
@include('template_public.sidebar')

<main class="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
    @include('template_public.navbar')
    <div class="container-fluid py-4">
        <div class="row">
            @yield('content')
        </div>
        <footer class="footer py-4  ">
            <div class="container-fluid">
                <div class="row align-items-center justify-content-lg-between">
                    <div class="col-lg-6 mb-lg-0 mb-4">
                        <div class="copyright text-center text-sm text-muted text-lg-start">
                            © Universitas Lampung - <script>
                                document.write(new Date().getFullYear())
                            </script>,
                            <a href="https://www.creative-tim.com" class="font-weight-bold" target="_blank">Creative Tim</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</main>

<!-- jQuery -->
<script src="{{ asset('master_template/plugins/jquery/jquery.min.js') }}"></script>
<!-- jQuery UI 1.11.4 -->
<script src="{{ asset('master_template/plugins/jquery-ui/jquery-ui.min.js') }}"></script>
<script src="{{ asset('template/material-dashboard-master/assets/js/core/popper.min.js') }}"></script>
<script src="{{ asset('template/material-dashboard-master/assets/js/core/bootstrap.min.js') }}"></script>
<script src="{{ asset('template/material-dashboard-master/assets/js/plugins/perfect-scrollbar.min.js') }}"></script>
<script src="{{ asset('template/material-dashboard-master/assets/js/plugins/smooth-scrollbar.min.js') }}"></script>
<script src="{{ asset('template/material-dashboard-master/assets/js/plugins/chartjs.min.js') }}"></script>
<script>
    var win = navigator.platform.indexOf('Win') > -1;
    if (win && document.querySelector('#sidenav-scrollbar')) {
        var options = {
            damping: '0.5'
        }
        Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
    }
</script>
<!-- Github buttons -->
<script async defer src="https://buttons.github.io/buttons.js"></script>
<!-- Control Center for Material Dashboard: parallax effects, scripts for the example pages etc -->
<script src="{{ asset('template/material-dashboard-master/assets/js/material-dashboard.min.js?v=3.0.1') }}"></script>
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
