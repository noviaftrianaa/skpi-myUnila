<li class="nav-item has-treeview {{ (request()->is('data_master*')) ? 'menu-open' : '' }}">
    <a href="{{ route('manajemen.paket_wisata') }}" class="nav-link {{ (request()->is('data_master*')) ? 'active' : '' }}">
        <i class="nav-icon fa fa-database"></i>
            <p>Data Master</p> <i class="right fas fa-angle-left">
        </i>
    </a>
    <ul class="nav nav-treeview">
            <li class="nav-item">
                <a href="{{ route('data_master.daftar_bank') }}" class="nav-link {{ (request()->is('data_master/daftar_bank*')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Jenis Bank</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('data_master.jenis_kamar') }}" class="nav-link {{ (request()->is('data_master/jenis_kamar*')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Jenis Kamar</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('data_master.jenis_dokumen') }}" class="nav-link {{ (request()->is('data_master/jenis_dokumen*')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Jenis Dokumen</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('data_master.satuan') }}" class="nav-link {{ (request()->is('data_master/satuan*')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Satuan</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('data_master.daftar_ekspedisi') }}" class="nav-link {{ (request()->is('data_master/daftar_ekspedisi*')) ? 'active' : '' }}">
                    <i class="nav-icon fa fa-circle-o"></i> <span>Tabel Daftar Ekspedisi</span>
                </a>
            </li>
    </ul>
</li>