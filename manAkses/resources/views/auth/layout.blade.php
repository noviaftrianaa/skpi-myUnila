<!DOCTYPE html>

<html>

<head>

    <meta charset="utf-8">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>@yield('title')</title>

    <!-- Tell the browser to be responsive to screen width -->

    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link rel="icon" type="image/png" href="{{ asset((config('mp.apps.at_use')==1?config('mp.apps.user.logo'):config('mp.copyright.logo'))) }}">



    <link rel="stylesheet" href="{{ asset('master_template/plugins/fontawesome-free/css/all.min.css') }}">

    <link rel="stylesheet" href="{{ asset('node_modules/font-awesome/css/font-awesome.css') }}">

    <link rel="stylesheet" href="{{ asset('node_modules/ionicons/dist/css/ionicons.min.css') }}">

    <link rel="stylesheet" href="{{ asset('master_template/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">

    <link rel="stylesheet" href="{{ asset('master_template/dist/css/adminlte.min.css') }}">

    <!-- Google Font: Source Sans Pro -->

    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700" rel="stylesheet">

    @stack('css')

</head>

<body class="hold-transition login-page">

<div class="login-box">

    <!-- /.login-logo -->

    <div class="card">

        <div class="card-body login-card-body">

            <div class="login-logo mb-4">

                <img class="img img-md" src="{{ asset('images/logo-unila.png') }}" alt="logo_login">

                <a href="{{ url('/') }}"><b>@yield('title')</b></a>

            </div>

            @yield('content')

        </div>

    </div>

</div>

<!-- /.login-box -->



<!-- jQuery -->

<script src="{{ asset('master_template/plugins/jquery/jquery.min.js') }}"></script>

<!-- Bootstrap 4 -->

<script src="{{ asset('master_template/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>

<!-- AdminLTE App -->

<script src="{{ asset('master_template/dist/js/adminlte.js') }}"></script>

<script src="{!! asset('node_modules/sweetalert/dist/sweetalert.min.js') !!}"></script>

@include('sweet::alert')

@stack('js')

</body>

</html>

