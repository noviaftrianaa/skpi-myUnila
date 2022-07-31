<!-- Main Sidebar Container -->
<aside class="main-sidebar sidebar-dark-primary elevation-4">
    <!-- Brand Logo -->
    <a href="{{ url('/') }}" class="brand-link">
        <img src="{{ asset('asset/logo/logo_unila.png') }}" alt="Apps Logo" class="brand-image img-circle elevation-3" style="opacity: .8">
        <span class="brand-text font-weight-light">{{ config('mp.apps.title') }}</span>
    </a>

    <!-- Sidebar -->
    <div class="sidebar">
        <!-- Sidebar Menu -->
        <nav class="mt-2">
            <ul class="nav nav-pills nav-sidebar nav-flat flex-column" data-widget="treeview" role="menu" data-accordion="false">
                <!-- Add icons to the links using the .nav-icon class
                     with font-awesome or any other icon font library -->
                <li class="nav-item">
                    <a href="{{ url('/') }}" class="nav-link {{ $side_active=='home'?'active':'' }}">
                        <i class="nav-icon fas fa-tachometer-alt"></i>
                        <p>Dashboard</p>
                    </a>
                </li>
                <li class="nav-item {{ in_array($side_active,['mahasiswa','tracer_study', 'kampus_merdeka'])?'menu-open':'' }}">
                    <a href="#" class="nav-link {{ in_array($side_active,['mahasiswa','tracer_study'])?'active':'' }}">
                        <i class="nav-icon fas fa-layer-group"></i>
                        <p>
                            Mahasiswa & Alumni
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="{{ route('dashboard.mahasiswa') }}" class="nav-link {{ $side_active=='mahasiswa'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Dashboard Mahasiswa</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.tracer_study') }}" class="nav-link {{ $side_active=='tracer_study'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Tracer Study</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.kampus_merdeka') }}" class="nav-link {{ $side_active=='kampus_merdeka'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Kampus Merdeka</p>
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="nav-item {{ in_array($side_active,['dashboard.dosen','dashboard.jabfung','dashboard.jenj_didik','dashboard.pangkat_golongan','dashboard.ikatan_kerja','dashboard.jenis_kelamin','dashboard.status_kepegawaian','dashboard.status_keaktifan'])?'menu-open':'' }}">
                    <a href="#" class="nav-link {{ in_array($side_active,['dashboard.dosen','dashboard.jabfung','dashboard.jenj_didik','dashboard.pangkat_golongan','dashboard.ikatan_kerja','dashboard.jenis_kelamin','dashboard.status_kepegawaian','dashboard.status_keaktifan'])?'active':'' }}">
                        <i class="nav-icon fas fa-chalkboard-teacher"></i>
                        <p>
                            Rekap Dosen
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="{{ route('dashboard.dosen') }}" class="nav-link {{ $side_active=='dashboard.dosen'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Dashboard Dosen</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.jabfung') }}" class="nav-link {{ $side_active=='dashboard.jabfung'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Jabatan Fungsional</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.jenj_didik') }}" class="nav-link {{ $side_active=='dashboard.jenj_didik'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Jenjang Pendidikan</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.pangkat_golongan') }}" class="nav-link {{ $side_active=='dashboard.pangkat_golongan'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Pangkat Golongan</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.ikatan_kerja') }}" class="nav-link {{ $side_active=='dashboard.ikatan_kerja'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Ikatan Kerja</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.jenis_kelamin') }}" class="nav-link {{ $side_active=='dashboard.jenis_kelamin'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Jenis Kelamin</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.status_kepegawaian') }}" class="nav-link {{ $side_active=='dashboard.status_kepegawaian'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Status Kepegawaian</p>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a href="{{ route('dashboard.status_keaktifan') }}" class="nav-link {{ $side_active=='dashboard.status_keaktifan'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>Status Keaktifan</p>
                            </a>
                        </li>
                    </ul>
                </li>
                <li class="nav-item {{ in_array($side_active,['iku','akreditasi'])?'menu-open':'' }}">
                    <a href="#" class="nav-link {{ in_array($side_active,['iku','akreditasi'])?'active':'' }}">
                        <i class="nav-icon fas fa-building"></i>
                        <p>
                            Institusi
                            <i class="right fas fa-angle-left"></i>
                        </p>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item">
                            <a href="{{ route('iku') }}" class="nav-link {{ $side_active=='iku'?'active':'' }}">
                                <i class="far fa-circle nav-icon"></i>
                                <p>IKU</p>
                            </a>
                        </li>
{{--                        <li class="nav-item {{ in_array($side_active,['akreditasi','akreditasi.dashboard','akreditasi.pt','akreditasi.prodi'])?'menu-open':'' }}">--}}
{{--                            <a href="{{ route('akreditasi') }}" class="nav-link {{ $side_active=='akreditasi'?'active':'' }}">--}}
{{--                                <i class="far fa-circle nav-icon"></i>--}}
{{--                                <p>--}}
{{--                                    Akreditasi--}}
{{--                                    <i class="right fas fa-angle-left"></i>--}}
{{--                                </p>--}}
{{--                            </a>--}}

{{--                            <ul class="nav nav-treeview">--}}
{{--                                <li class="nav-item">--}}
{{--                                    <a href="{{ route('dashboard.dosen') }}" class="nav-link {{ $side_active=='dashboard.dosen'?'active':'' }}">--}}
{{--                                        <i class="far fa-circle nav-icon"></i>--}}
{{--                                        <p>Dashboard Akreditasi</p>--}}
{{--                                    </a>--}}
{{--                                </li>--}}
{{--                                <li class="nav-item">--}}
{{--                                    <a href="{{ route('dashboard.jabfung') }}" class="nav-link {{ $side_active=='dashboard.jabfung'?'active':'' }}">--}}
{{--                                        <i class="far fa-circle nav-icon"></i>--}}
{{--                                        <p>Akreditasi PT</p>--}}
{{--                                    </a>--}}
{{--                                </li>--}}
{{--                                <li class="nav-item">--}}
{{--                                    <a href="{{ route('dashboard.jabfung') }}" class="nav-link {{ $side_active=='dashboard.jabfung'?'active':'' }}">--}}
{{--                                        <i class="far fa-circle nav-icon"></i>--}}
{{--                                        <p>Akreditasi Prodi</p>--}}
{{--                                    </a>--}}
{{--                                </li>--}}
{{--                            </ul>--}}
{{--                        </li>--}}
                    </ul>
                </li>
            </ul>
        </nav>
        <!-- /.sidebar-menu -->
    </div>
    <!-- /.sidebar -->
</aside>
