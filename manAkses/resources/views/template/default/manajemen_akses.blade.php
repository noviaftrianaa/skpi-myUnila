<li class="nav-item has-treeview {{ (request()->is('manajemen_akses*')) ? 'menu-open' : '' }}">
    <a href="#" class="nav-link {{ (request()->is('manajemen_akses/pengguna*')) ? 'active' : '' }}">
        <i class="nav-icon fa fa-universal-access"></i>
            <p>Manajemen Akses</p> <i class="right fas fa-angle-left">
        </i>
    </a>
    <ul class="nav nav-treeview">
        <li class="nav-item">
            <a href="{{ route('manajemen_akses.pengguna') }}" class="nav-link {{ (request()->is('manajemen_akses/pengguna*')) ? 'active' : '' }}">
                <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Pengguna</span>
            </a>
        </li>
    </ul>
</li>