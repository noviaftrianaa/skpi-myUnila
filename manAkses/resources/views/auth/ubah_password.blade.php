<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Ubah Password : SI-MA v1.0 UNILA</title>
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/fontawesome-free/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('master_template/dist/css/adminlte.min.css') }}">

    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('favicon/apple-touch-icon.png') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon/favicon-32x32.png') }}">
    <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('favicon/favicon-16x16.png') }}">
    <link rel="manifest" href="{{ asset('favicon/site.webmanifest') }}">
</head>

<body class="hold-transition login-page light-mode">
    <div class="login-box">
        <div class="card ">
            <div class="card-header text-center mt-4">
                <a href="{{ url('/') }}"><img src="{{ asset('images/logo_unila_kampus_merdeka.png') }}"></a>
                <p class="text-sm mt-4"><strong>UBAH PASSWORD</strong><br>Sistem Informasi Manajemen Akses<br>Univeritas Lampung (UNILA)
                </p>
            </div>
            <div class="card-body">
                <form action="{{ route('dashboard.password') }}" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="_token" value="{{ csrf_token() }}">
                    <input type="hidden" name="_method" value="PUT">
                    <input type="hidden" name="url" value="{{ url()->previous() }}">
                    <div class="input-group mb-3">
                        <input type="password" class="form-control @error('old_password') is-invalid @enderror"
                            name="old_password" value="{{ old('old_password') }}" placeholder="Password Lama" required>
                        <div class="input-group-append">
                            <div class="input-group-text">
                                <span class="fas fa-lock"></span>
                            </div>
                        </div>
                        @error('old_password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="input-group mb-3">
                        <input type="password" class="form-control @error('password') is-invalid @enderror"
                            name="password" value="{{ old('password') }}" placeholder="Password Baru" required>
                        <div class="input-group-append">
                            <div class="input-group-text">
                                <span class="fas fa-lock"></span>
                            </div>
                        </div>
                        @error('password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="input-group mb-3">
                        <input type="password" class="form-control @error('confirm_password') is-invalid @enderror"
                            name="confirm_password" value="{{ old('confirm_password') }}" placeholder="Password Baru Lagi" required>
                        <div class="input-group-append">
                            <div class="input-group-text">
                                <span class="fas fa-lock"></span>
                            </div>
                        </div>
                        @error('confirm_password')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    <div class="social-auth-links text-center mt-2 mb-3">
                        <button type="submit" class="btn btn-block btn-info">
                            Ubah Password
                        </button>
                        <a href="{{ url()->previous() }}" class="btn btn-block btn-warning text-white">
                            Kembali
                        </a>
                    </div>
                </form>
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