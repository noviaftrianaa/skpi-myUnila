@php
    $containerNav = $configData['contentLayout'] === 'compact' ? 'container-xxl' : 'container-fluid';
    $navbarDetached = $navbarDetached ?? '';
@endphp

<!-- Navbar -->
@if (isset($navbarDetached) && $navbarDetached == 'navbar-detached')
    <nav class="layout-navbar {{ $containerNav }} navbar navbar-expand-xl {{ $navbarDetached }} align-items-center bg-navbar-theme"
        id="layout-navbar">
@endif
@if (isset($navbarDetached) && $navbarDetached == '')
    <nav class="layout-navbar navbar navbar-expand-xl align-items-center bg-navbar-theme" id="layout-navbar">
        <div class="{{ $containerNav }}">
@endif

<!--  Brand demo (display only for navbar-full and hide on below xl) -->
@if (isset($navbarFull))
    <div class="navbar-brand app-brand demo d-none d-xl-flex py-0 me-4">
        <a href="{{ auth()->check() ? route('main-index') : route('pages-home') }}" class="app-brand-link gap-2">
            <span class="app-brand-logo demo">
                <img src="{!! asset('/images/logo-unila.png') !!}" height="30" />
            </span>
            <span class="app-brand-text demo menu-text fw-bold">{{ config('variables.templateName') }}</span>
        </a>
    </div>
@endif

<!-- ! Not required for layout-without-menu -->
@if (!isset($navbarHideToggle))
    <div
        class="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0{{ isset($menuHorizontal) ? ' d-xl-none ' : '' }} {{ isset($contentNavbar) ? ' d-xl-none ' : '' }}">
        <a class="nav-item nav-link px-0 me-xl-4" href="javascript:void(0)">
            <i class="ti ti-menu-2 ti-sm"></i>
        </a>
    </div>
@endif

<li class="navbar-nav-right d-flex align-items-center" id="navbar-collapse">

    @if ($configData['hasCustomizer'] == true)
        <!-- Style Switcher -->
        <div class="navbar-nav align-items-center">
            <div class="nav-item dropdown-style-switcher dropdown me-2 me-xl-0">
                <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                    <i class='ti ti-md'></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-start dropdown-styles">
                    <li>
                        <a class="dropdown-item" href="javascript:void(0);" data-theme="light">
                            <span class="align-middle"><i class='ti ti-sun me-2'></i>Light</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="javascript:void(0);" data-theme="dark">
                            <span class="align-middle"><i class="ti ti-moon me-2"></i>Dark</span>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="javascript:void(0);" data-theme="system">
                            <span class="align-middle"><i class="ti ti-device-desktop me-2"></i>System</span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <!--/ Style Switcher -->
    @endif
</li>

<ul class="navbar-nav flex-row align-items-center ms-auto">

    <!-- User -->
    @if (Auth::check())
        <li class="nav-item navbar-dropdown dropdown-user dropdown">
            <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                <div class="d-flex">
                    <div class="flex-shrink-0">
                        <div class="avatar avatar-online">
                            <span
                                class="avatar-initial rounded-circle bg-label-primary">{{ substr(\Auth::user()->nm_pengguna, 0, 2) }}</span>
                        </div>
                    </div>
                    <div class="flex-grow-1 d-none d-lg-inline-block ms-2">
                        <span class="fw-medium d-block">
                            {{ Auth::user()->nm_pengguna }}
                        </span>
                        <small class="text-muted">
                            {{ \App\Models\Peran::where('id_peran', session()->get('login.role')->id_peran)->pluck('nm_peran')[0] }}
                        </small>
                    </div>
                </div>
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
                <li class="d-lg-none bg-label-primary">
                  <div class="dropdown-item">
                    <i class="ti ti-user me-2 ti-sm"></i>
                    <span class="align-middle">{{ Auth::user()->nm_pengguna }} <small class="fst-italic">({{ \App\Models\Peran::where('id_peran', session()->get('login.role')->id_peran)->pluck('nm_peran')[0] }})</small></span>
                  </div>
                  <div class="dropdown-divider"></div>
                </li>
                <li>
                    <a class="dropdown-item" href="/" target="_blank">
                        <i class="ti ti-user-edit me-2 ti-sm"></i>
                        <span class="align-middle">Profil</span>
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="{{ url('https://apps.unila.ac.id/#password') }}" target="_blank">
                        <i class="ti ti-key me-2 ti-sm"></i>
                        <span class="align-middle">Ganti Password</span>
                    </a>
                </li>
                <li>
                    <a class="dropdown-item"
                        href="{{ Route::has('main-peran') ? route('main-peran') : 'javascript:void(0);' }}">
                        <i class="ti ti-users-group me-2 ti-sm"></i>
                        <span class="align-middle">Ganti Peran</span>
                    </a>
                </li>
                @if (!\Request::is('main*'))
                    <li>
                        <a class="dropdown-item text-primary" href="{{ route('main-index') }}">
                            <i class="ti ti-home me-2 ti-sm"></i>
                            <span class="align-middle">Dashboard Utama</span>
                        </a>
                    </li>
                @else
                <li>
                    <a class="dropdown-item text-primary" href="{{ route('pages-home') }}">
                        <i class="ti ti-home me-2 ti-sm"></i>
                        <span class="align-middle">Dashboard Publik</span>
                    </a>
                </li>
                @endif
                <li>
                    <div class="dropdown-divider"></div>
                </li>
                <li>
                    <a class="dropdown-item" href="{{ route('auth-logout') }}"
                        onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                        <i class='ti ti-logout me-2'></i>
                        <span class="align-middle">Logout</span>
                    </a>
                </li>
                <form method="POST" id="logout-form" action="{{ route('auth-logout') }}">
                    @csrf
                </form>
            </ul>
        </li>
    @else
        <li class="nav-item">
            <a class="nav-link" href="{{ route('auth-login') }}">LOGIN</a>
        </li>
    @endif
</ul>

@if (!isset($navbarDetached))
    </div>
@endif
</nav>
<!-- / Navbar -->
