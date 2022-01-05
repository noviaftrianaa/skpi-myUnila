<li class="nav-item has-treeview {{ (request()->is('manajemen/produk*')) ? 'menu-open' : '' }}">
    <a href="{{ route('manajemen.produk') }}" class="nav-link {{ (request()->is('manajemen/produk*')) ? 'active' : '' }}">
        <i class="nav-icon fa fa-get-pocket"></i>
            <p>Produk</p> <i class="right fas fa-angle-left">
        </i>
    </a>
    <ul class="nav nav-treeview">
            <li class="nav-item">
                <a href="{{ route('manajemen.produk') }}" class="nav-link {{ (request()->is('manajemen/produk')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Produk</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('manajemen.produk.booking') }}" class="nav-link {{ (request()->is('manajemen/produk/booking*')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Pemesanan Produk</span>
                </a>
            </li>
    </ul>
</li>