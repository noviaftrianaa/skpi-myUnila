<!DOCTYPE html>
<!--
This is a starter template page. Use this page to start your new project from
scratch. This page gets rid of all links and provides the needed markup only.
-->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>@yield('title')</title>
  <link rel="icon" type="image/png" href="{{ asset('auth/img/logo.png') }}">

  <!-- Google Font: Source Sans Pro -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="{{ asset('master_template/plugins/fontawesome-free/css/all.min.css') }}">
  <!-- Theme style -->
  <link rel="stylesheet" href="{{ asset('master_template/dist/css/adminlte.min.css') }}">
</head>
<body class="hold-transition layout-top-nav">
<div class="wrapper">

  <!-- Navbar -->
  <nav class="main-header navbar navbar-expand navbar-info navbar-dark border-bottom-0">
    <div class="container">
      <a href="{{url('/')}}" class="navbar-brand">
        <img src="{{ asset('auth/img/logo.png') }}" alt="Universitas Lampung" class="brand-image img-circle">
        <span class="brand-text font-weight-light">SIMA UNILA</span>
      </a>

      <!-- Right navbar links -->
      <ul class="order-1 order-md-3 navbar-nav navbar-no-expand ml-auto">
        @if(auth()->check())
        <li class="nav-item dropdown">
          <a class="nav-link" data-toggle="dropdown" href="#">
            <i class="fas fa-cog"></i> Pengaturan
          </a>
          <div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
            <!-- route peran -->
            <a class="dropdown-item" data-toggle="modal" href="#roleItem">
              <i class="fas fa-users"></i> Ubah Peran
            </a>
            <!-- route peran -->
            <a class="dropdown-item" href="{{ route('biodata') }}">
              <i class="fas fa-users"></i> Biodata
            </a>
            <!-- route password -->
            <a class="dropdown-item" data-toggle="modal" href="#passwordItem">
              <i class="fas fa-key mr-2"></i> Ubah Password
            </a>
          </div>
        </li>
        @endif
        <!-- Messages Dropdown Menu -->
        <li class="nav-item d-sm-inline-block">
            <a class="nav-link" href="{{ route('auth.logout') }}">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>
        </li>
      </ul>
    </div>
  </nav>
  <!-- /.navbar -->

  <!-- Modal Role -->
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
                  <form action="{{ url('changeRole') }}" method="post" enctype="multipart/form-data">
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
                                      <option value="{{$item->id_peran}}" {{($item->id_peran==session()->get('login.role')->id_peran) ? 'selected':''}}>{{$item->nm_peran}}</option>
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
  <!-- Modal Change Password -->
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
                    <form action="{{ url('changePassword') }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <input name="old_password" type="password" class="form-control" placeholder="Kata Sandi Lama Anda" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <input name="password" type="password" class="form-control" placeholder="Kata Sandi Baru Anda" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <input name="confirm_password" type="password" class="form-control" placeholder="Tuliskan Kata Sandi Baru Lagi" required>
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

  <!-- Content Wrapper. Contains page content -->
  <div class="content-wrapper">

    <!-- Main content -->
    <div class="content">
      <div class="container">
        <div class="content-header">
          @include('error.list')
        </div>
        @yield('content')
      </div><!-- /.container-fluid -->
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
        <strong>Copyright 2021</strong> by TIK UNILA
        <div class="float-right">
            <b>SIMA UNILA</b>
        </div>
  </footer>
</div>
<!-- ./wrapper -->

<!-- REQUIRED SCRIPTS -->

<!-- jQuery -->
<script src="{{ asset('master_template/plugins/jquery/jquery.min.js') }}"></script>
<!-- Bootstrap 4 -->
<script src="{{ asset('master_template/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
<!-- AdminLTE App -->
<script src="{{ asset('master_template/dist/js/adminlte.min.js') }}"></script>
<!-- AdminLTE for demo purposes -->
<script src="{{ asset('master_template/dist/js/demo.js') }}"></script>
<script src="{!! asset('node_modules/sweetalert/dist/sweetalert.min.js') !!}"></script>

@stack('js')

@include('sweet::alert')
</body>
</html>