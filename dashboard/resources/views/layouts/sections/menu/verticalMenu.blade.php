@php
    $configData = Helper::appClasses();
@endphp

<aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">

    <!-- ! Hide app brand if navbar-full -->
    @if (!isset($navbarFull))
        <div class="app-brand demo">
            <a href="{{ url('/') }}" class="app-brand-link">
                <span class="app-brand-logo demo">
                    <img src="/images/logo-unila.png" height="20" />
                </span>
                <span class="app-brand-text demo menu-text fw-bold">{{ config('variables.appName') }}</span>
            </a>

            <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto">
                <i class="ti menu-toggle-icon d-none d-xl-block ti-sm align-middle"></i>
                <i class="ti ti-x d-block d-xl-none ti-sm align-middle"></i>
            </a>
        </div>
    @endif


    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-1">
        <!-- Dashboard -->
        <li class="menu-item {{ AktifMenu('main-index', 1) }}">
            <a href="{{ route('main-index') }}" class="menu-link">
                <i class="menu-icon tf-icons fas fa-home text-center" style="font-size: 1em"></i>
                <div>Halaman Utama</div>
            </a>
        </li>
        <!-- Menu -->
        @if (!empty(\Session::get('login.menu')))
            @foreach (\Session::get('login.menu') as $n => $r)
                @if (empty($r->sub))
                    <!-- Single Menu -->
                    <li class="menu-item {{ AktifMenu($r->nm_file, 1) }}">
                        <a href="{{ route($r->nm_file) }}" class="menu-link">
                            <i class="menu-icon tf-icons {{ is_null($r->icon)?'fa-regular fa-circle':$r->icon }} text-center" style="font-size: 1em"></i>
                            <div>{{ $r->nm_menu }}</div>
                        </a>
                    </li>
                @else
                    <!-- Sub Menu -->
                    <li class="menu-item {{ AktifMenu($r->nm_file, 1) }}">
                        <a href="#" class="menu-link menu-toggle">
                            <i class="menu-icon tf-icons {{ is_null($r->icon)?'fa-regular fa-circle':$r->icon }} text-center" style="font-size: 1em"></i>
                            <div>{{ $r->nm_menu }}</div>
                        </a>
                        <ul class="menu-sub">
                            @foreach ($r->sub as $t)
                                <li class="menu-item {{ AktifMenu($r->nm_file, 2) }}">
                                    <a href="{{ route($t->nm_file) }}" class="menu-link">
                                        <div>{{ $t->nm_menu }}</div>
                                    </a>
                                </li>
                            @endforeach
                        </ul>
                    </li>
                @endif
            @endforeach
        @endif
    </ul>

</aside>
