<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login : SI-MA v1.0 UNILA</title>
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/fontawesome-free/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('master_template/dist/css/adminlte.min.css') }}">
    <link rel="icon" type="image/png" href="{{ asset('auth/img/logo.png') }}">

    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('favicon/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon/favicon-16x16.png') }}">
    <link rel="stylesheet" href="{{ asset('node_modules/font-awesome/css/font-awesome.css') }}">
    <link rel="manifest" href="{{ asset('favicon/site.webmanifest') }}">
</head>

<body class="hold-transition login-page light-mode">
    <div class="login-box">

        <div class="card ">
            <div class="card-header text-center mt-4">
                <img src="{{ asset('images/logo_unila_kampus_merdeka.png') }}">
                <p class="text-sm mt-4"><strong>Sistem Informasi Manajemen Akses<br>Univeritas Lampung (UNILA)</strong>
                </p>
            </div>
            <div class="card-body">
                <div class="input-field d-flex flex-column text-center">
                    <h2>Otorisasi Gagal!</h2>
                    <small class="my-2 text-muted text-center"><i>Silahkan lakukan logout dan login kembali menggunakan akun terdaftar.</i></small>
                    <div class="mt-3">
                        <a type="button" href="{{ route('auth.logout') }}" class="btn btn-warning btn-block">
                            <i class="fas fa-sign-out"></i>  Logout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="{{ asset('master_template/plugins/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('master_template/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('master_template/dist/js/adminlte.min.js') }}"></script>
    <script src="{!! asset('node_modules/sweetalert/dist/sweetalert.min.js') !!}"></script>

    @stack('js')

    @include('sweet::alert')
</body>

</html>