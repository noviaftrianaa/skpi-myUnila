@php
$configData = Helper::appClasses();
@endphp

<aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">

  <!-- ! Hide app brand if navbar-full -->
  @if(!isset($navbarFull))
  <div class="app-brand demo">
    <a href="{{url('/')}}" class="app-brand-link">
      <span class="app-brand-logo demo">
        <img src="/images/logo-unila.png" height="20" />
      </span>
      <span class="app-brand-text demo menu-text fw-bold">{{config('variables.appName')}}</span>
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
        Halaman Utama
      </a>
    </li>
    <!-- Menu -->
    @if(!empty(\Session::get('login.menu')))
    @foreach(\Session::get('login.menu') AS $n=>$r)
      @if(empty($r->sub))
        <!-- Single Menu -->
        <li class="menu-item {{ AktifMenu($r->nm_file, 1) }}">
          <a href="#" class="menu-link">
            <i class="menu-icon tf-icons {{ $r->icon }} text-center" style="font-size: 1em"></i>
            {{ $r->nm_menu }}
          </a>
        </li>
      @else
      <!-- Sub Menu -->
      <li class="menu-item {{ AktifMenu($r->nm_file, 1) }}">
        <a href="#" class="menu-link menu-toggle">
          <i class="menu-icon tf-icons {{ $r->icon }} text-center" style="font-size: 1em"></i>
          {{ $r->nm_menu }}
        </a>
        <ul class="menu-sub">
					@foreach($r->sub AS $t)
          <li class="menu-item {{ AktifMenu($r->nm_file, 2) }}">
            <a href="#" class="menu-link">
              {{ $t->nm_menu }}
            </a>
          </li>
          @endforeach
        </ul>
      </li>
      @endif
    @endforeach
    @endif
    {{-- @foreach ($menuData[0]->menu as $menu)
    @if (isset($menu->menuHeader))
    <li class="menu-header small text-uppercase">
      <span class="menu-header-text">{{ __($menu->menuHeader) }}</span>
    </li>

    @else

    @php
    $activeClass = null;
    $currentRouteName = Route::currentRouteName();

    if ($currentRouteName === $menu->slug) {
    $activeClass = 'active';
    }
    elseif (isset($menu->submenu)) {
    if (gettype($menu->slug) === 'array') {
    foreach($menu->slug as $slug){
    if (str_contains($currentRouteName,$slug) and strpos($currentRouteName,$slug) === 0) {
    $activeClass = 'active open';
    }
    }
    }
    else{
    if (str_contains($currentRouteName,$menu->slug) and strpos($currentRouteName,$menu->slug) === 0) {
    $activeClass = 'active open';
    }
    }

    }
    @endphp

    <li class="menu-item {{$activeClass}}">
      <a href="{{ isset($menu->url) ? url($menu->url) : 'javascript:void(0);' }}" class="{{ isset($menu->submenu) ? 'menu-link menu-toggle' : 'menu-link' }}" @if (isset($menu->target) and !empty($menu->target)) target="_blank" @endif>
        @isset($menu->icon)
        <i class="{{ $menu->icon }}"></i>
        @endisset
        <div>{{ isset($menu->name) ? __($menu->name) : '' }}</div>
        @isset($menu->badge)
        <div class="badge bg-{{ $menu->badge[0] }} rounded-pill ms-auto">{{ $menu->badge[1] }}</div>

        @endisset
      </a>

      @isset($menu->submenu)
      @include('layouts.sections.menu.submenu',['menu' => $menu->submenu])
      @endisset
    </li>
    @endif
    @endforeach --}}
  </ul>

</aside>
