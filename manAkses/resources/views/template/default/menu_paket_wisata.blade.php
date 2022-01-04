<li class="nav-item has-treeview {{ (request()->is('manajemen/paket_wisata*')) ? 'menu-open' : '' }}">
    <a href="{{ route('manajemen.paket_wisata') }}" class="nav-link  {{ (request()->is('manajemen/paket_wisata*')) ? 'active' : '' }}">
        <i class="nav-icon fa fa-get-pocket"></i>
            <p>Paket Wisata</p> <i class="right fas fa-angle-left">
        </i>
    </a>
    <ul class="nav nav-treeview">
            <li class="nav-item">
                <a href="{{ route('manajemen.paket_wisata') }}" class="nav-link {{ (request()->is('manajemen/paket_wisata')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Paket Wisata</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('manajemen.paket_wisata.booking') }}" class="nav-link {{ (request()->is('manajemen/paket_wisata/booking*')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Pemesanan Paket Wisata</span>
                </a>
            </li>
    </ul>
</li>