<aside class="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ps bg-gradient-dark" id="sidenav-main">
    <div class="sidenav-header">
        <i class="fas fa-times p-3 cursor-pointer text-white opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
        <a class="navbar-brand m-0" href="{{ url('/') }}">
            <img src="{{ asset('images/logo-unila.png') }}" class="navbar-brand-img h-100" alt="main_logo">
            <span class="ms-1 font-weight-bold text-white">{{ config('mp.apps.title') }}</span>
        </a>
    </div>
    <hr class="horizontal light mt-0 mb-2">
    <div class="collapse navbar-collapse w-auto" style="height: 100%" id="sidenav-collapse-main">
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link text-white active bg-gradient-info" href="{{ url('/') }}">
                    <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
                        <i class="material-icons opacity-10">dashboard</i>
                    </div>
                    <span class="nav-link-text ms-1">Dashboard</span>
                </a>
            </li>
        </ul>
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link text-white" href="#dosen_sidebar" data-bs-toggle="collapse" aria-controls="dosen_sidebar" role="button" aria-expanded="false">
                    <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
                        <i class="material-icons opacity-10">group</i>
                    </div>
                    <span class="nav-link-text ms-1">Rekap Dosen</span>
                </a>
                <div class="collapse" id="dosen_sidebar" style="">
                    <ul class="nav nav-sm flex-column">
                        <li class="nav-item">
                            <a class="nav-link text-white" href="{{ route('dashboard.dosen') }}">
                                <span class="sidenav-mini-icon"> D </span>
                                <span class="sidenav-normal  ms-2  ps-1"> Dashboard Dosen </span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="{{ route('dashboard.jabfung') }}">
                                <span class="sidenav-mini-icon"> J </span>
                                <span class="sidenav-normal  ms-2  ps-1"> Jabatan Fungsional </span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="../../pages/pages/profile/messages.html">
                                <span class="sidenav-mini-icon"> JP </span>
                                <span class="sidenav-normal  ms-2  ps-1"> Jenjang Pendidikan </span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="../../pages/pages/profile/messages.html">
                                <span class="sidenav-mini-icon"> PG </span>
                                <span class="sidenav-normal  ms-2  ps-1"> Pangkat Golongan </span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="../../pages/pages/profile/messages.html">
                                <span class="sidenav-mini-icon"> IK </span>
                                <span class="sidenav-normal  ms-2  ps-1"> Ikatan Kerja </span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="../../pages/pages/profile/messages.html">
                                <span class="sidenav-mini-icon"> JK </span>
                                <span class="sidenav-normal  ms-2  ps-1"> Jenis Kelamin </span>
                            </a>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
        <ul class="navbar-nav">
            <li class="nav-item">
                <a class="nav-link text-white" href="#institusi_sidebar" data-bs-toggle="collapse" aria-controls="institusi_sidebar" role="button" aria-expanded="false">
                    <div class="text-white text-center me-2 d-flex align-items-center justify-content-center">
                        <i class="material-icons opacity-10">building</i>
                    </div>
                    <span class="nav-link-text ms-1">Insitusi</span>
                </a>
                <div class="collapse" id="institusi_sidebar" style="">
                    <ul class="nav nav-sm flex-column">
                        <li class="nav-item">
                            <a class="nav-link text-white" href="{{ route('dashboard.dosen') }}">
                                <span class="sidenav-mini-icon"> D </span>
                                <span class="sidenav-normal  ms-2  ps-1"> Dashboard Dosen </span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link text-white" href="../../pages/pages/profile/projects.html">
                                <span class="sidenav-mini-icon"> J </span>
                                <span class="sidenav-normal  ms-2  ps-1"> Jabatan Fungsional </span>
                            </a>
                        </li>
                    </ul>
                </div>
            </li>
        </ul>
    </div>
</aside>
