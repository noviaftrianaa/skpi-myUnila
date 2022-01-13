<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
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
<body class="hold-transition sidebar-mini layout-fixed control-sidebar-slide-open text-sm">
<div class="wrapper">
    <!-- Navbar -->
    <nav class="main-header navbar navbar-expand navbar-white navbar-light border-bottom-0">
        <!-- Left navbar links -->
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link" data-widget="pushmenu" href="#"><i class="fas fa-bars"></i></a>
            </li>
        </ul>

        <!-- Right navbar links -->
        <ul class="navbar-nav ml-auto">
            @if(auth()->check())

            <li class="nav-item dropdown">
                <a class="nav-link" data-toggle="dropdown" href="#">
                    <i class="fas fa-gears"></i> Pengaturan
                </a>
                <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
                <!-- route password -->
                    <button class="dropdown-item" data-toggle="modal" data-target="#roleItem">
                        <i class="fas fa-users"></i> Ubah Peran
                    </button>
                    <button class="dropdown-item" data-toggle="modal" data-target="#passwordItem">
                        <i class="fas fa-key mr-2"></i> Ubah Password
                    </button>
                </div>
            </li>
            @endif
            <li class="nav-item d-sm-inline-block">
                <a class="nav-link" href="{{ route('auth.logout') }}">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>
            </li>
        </ul>
    </nav>
    <!-- /.navbar -->

    <!-- Modal -->
    <div class="modal fade" id="roleItem" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Ubah</span> 
                        <span class="fw-light">
                            Peran
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('user.role') }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    
                                    <?php $prole = DB::table('man_akses.peran as peran')
                                        ->join('man_akses.role_pengguna as role','role.id_peran','=','peran.id_peran')
                                        ->where('role.id_pengguna', auth()->user()->id_pengguna)
                                        ->select('peran.id_peran','peran.nm_peran')
                                        ->get(); ?>

                                    <select name="id_peran" class="form-control" required>
                                        <option selected disabled>Pilih</option>
                                        @foreach($prole as $item)
                                        <option value="{{$item->id_peran}}" {{($item->id_peran==session()->get('login.role')) ? 'selected':''}}>{{$item->nm_peran}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="submit" class="btn btn-primary">Ubah</button>
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Tutup</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="passwordItem" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Ubah</span> 
                        <span class="fw-light">
                            Password
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('user.password') }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <input name="password" type="password" class="form-control" placeholder="Kata Sandi Baru" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <input name="confirm_password" type="password" class="form-control" placeholder="Konfirmasi Kata Sandi Baru" required>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="submit" class="btn btn-primary">Simpan</button>
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Tutup</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Sidebar Container -->
    <aside class="main-sidebar sidebar-dark-primary elevation-4">
        <!-- Brand Logo -->
        <a href="{!! url('/') !!}" class="brand-link">
            <img src="{{ asset('images/logo-unila.png') }}" alt="Logo Aplikasi" class="brand-image img-circle elevation-3" style="opacity: .8">
            <span class="brand-text font-weight-light">SIMA UNILA</span>
        </a>
        @include('template.default.sidebar')
    </aside>

    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
        <!-- Content Header (Page header) -->
        <div class="content-header">
            <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-sm-6">
                        <h1 class="m-0 text-dark">{!! Judul() !!}</h1>
                    </div>
                    <div class="col-sm-6">
                        <ol class="breadcrumb float-sm-right">
                            @{!! auto_breadcrumb() !!}
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content -->
        <section class="content">
            <div class="container-fluid">
                @yield('content')
            </div>
        </section>
        <!-- /.content -->
    </div>
    <!-- /.content-wrapper -->
    <footer class="main-footer">
        <strong>Copyright 2021</strong> by TIK UNILA
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