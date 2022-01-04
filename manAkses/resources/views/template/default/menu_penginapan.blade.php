<li class="nav-item has-treeview {{ (request()->is('manajemen/penginapan*')) ? 'menu-open' : '' }}">
    <a href="{{ route('manajemen.penginapan') }}" class="nav-link {{ (request()->is('manajemen/penginapan*')) ? 'active' : '' }}">
        <i class="nav-icon fa fa-get-pocket"></i>
            <p>Penginapan</p> <i class="right fas fa-angle-left">
        </i>
    </a>
    <ul class="nav nav-treeview">
            <li class="nav-item">
                <a href="{{ route('manajemen.penginapan') }}" class="nav-link {{ (request()->is('manajemen/penginapan')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Penginapan</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('manajemen.penginapan.booking') }}" class="nav-link {{ (request()->is('manajemen/penginapan/booking*')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Pemesanan Penginapan</span>
                </a>
            </li>
    </ul>
</li>