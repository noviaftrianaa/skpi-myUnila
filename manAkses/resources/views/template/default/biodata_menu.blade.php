<li class="nav-item has-treeview">
    <a href="{{ route('manajemen.paket_wisata') }}" class="nav-link">
        <i class="nav-icon"></i>
            <p>Profile</p> <i class="right fas fa-angle-left">
        </i>
    </a>
    <ul class="nav nav-treeview">
            <li class="nav-item">
                <a href="{{ route('pengguna.biodata') }}" class="nav-link">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Biodata</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('pengguna.rekening') }}" class="nav-link">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Rekening Pengguna</span>
                </a>
            </li>
    </ul>
</li>