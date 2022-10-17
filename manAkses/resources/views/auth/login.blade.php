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
    <link rel="manifest" href="{{ asset('favicon/site.webmanifest') }}">
</head>

<body class="hold-transition login-page light-mode">
    <div class="login-box">

        @error('all')
            <div class="alert alert-danger">
                {{ $message }}
            </div>
        @enderror

        @error('sso')
            <div class="alert alert-danger">
                {{ $message }} atau ganti akun SSO <a class="text-blue" href="https://login.unila.ac.id/cas/logout">Klik Disini</a>
            </div>
        @enderror

        <div class="card ">
            <div class="card-header text-center mt-4">
                <a href="{{ url('/') }}"><img src="{{ asset('images/logo_unila_kampus_merdeka.png') }}"></a>
                <p class="text-sm mt-4"><strong>Selamat Datang di SI-MA v1.0</strong><br>Sistem Informasi Manajemen Akses<br>Univeritas Lampung (UNILA)
                </p>
            </div>
            <div class="card-body">
                <div class="social-auth-links text-center mt-2 mb-3">
                    <a href="{{ route('auth.signing_process') }}" class="btn btn-block btn-primary">
                        <i class="fas fa-sign-in-alt mr-2"></i>Sign In - SSO UNILA
                    </a>
                </div>
                <div class="social-auth-links text-center mt-2 mb-3">
                    <a href="http://login.unila.ac.id/about#faq" class="btn btn-block btn-warning">
                        <i class="fas fa-question-circle mr-2"></i>Forgot Password
                    </a>
                </div>
                <div class="social-auth-links text-center mt-2 mb-3">
                    <a href="http://login.unila.ac.id/about#register" class="btn btn-block btn-info">
                        <i class="fas fa-user-plus mr-2"></i>Register
                    </a>
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