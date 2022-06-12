<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-dark navbar-light">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
        <li class="nav-item">
            <a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a>
        </li>
    </ul>

    <!-- Right navbar links -->
    <ul class="navbar-nav ml-auto">
        @if(auth()->check())
        <!-- Navbar Search -->
        <li class="nav-item">
            <a class="nav-link" data-toggle="dropdown" href="#">
                <i class="far fa-comments"></i>
                <span class="badge badge-danger navbar-badge">3</span>
            </a>
        </li>
        <!-- Navbar Search -->
        <li class="nav-item">
            <a class="nav-link" href="{{ url('/auth/logout') }}">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </a>
        </li>
        @else
        <!-- Navbar Search -->
        <li class="nav-item">
            <a class="nav-link" href="{{ url('/auth/login/sso') }}">
                <i class="fas fa-sign-in-alt"></i>
                Login
            </a>
        </li>
        @endif
    </ul>
</nav>
<!-- /.navbar -->
