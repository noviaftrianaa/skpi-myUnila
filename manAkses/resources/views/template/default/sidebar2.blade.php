@push('css')
<style>
	.nav li .nav-treeview{
		position: relative;
		list-style: none;
		transition: all 0.4s ease;
	}
</style>
@endpush

<!-- Sidebar -->
<div class="sidebar">
	<!-- Profile Menu -->
    <div class="user-panel mt-3 pb-2 mb-2 d-flex text-light">
        <div class="image mt-1">
            <img src="{{ asset('images/blank-profile.png') }}" class="mt-2"
                alt="User Image">
        </div>
        <div class="info">
            <a href="{{ url('/biodata') }}" class="d-block">{{ strtoupper($getPeran['nm_pengguna']) }}</a>
            <span class="d-block text-sm">
				<form action="{{ url('changeRole') }}" method="post" enctype="multipart/form-data" id="changeRole">
					<input type="hidden" name="_token" value="{{ csrf_token() }}">
					<input type="hidden" name="_method" value="PUT">
					<select class="form-control-plaintext bg-dark text-light peran" name="id_peran">
						@foreach($getPeran['status_peran'] AS $items)
						<option value="{{ $items['id_peran'] }}" {{ ($items['id_peran']==session()->get('login.role')->id_peran) ? 'selected' : '' }}>{{ strtoupper($items['nm_peran']) }}</option>
						@endforeach
					</select>
				</form>
			</span>
        </div>
    </div>
	<!-- Sidebar Menu -->
	<nav class="mt-2">
		<ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
			<li class="nav-item">
				<a href="{{ route('index') }}" class="nav-link {{ AktifMenu('index', 2) }}">
						<i class="nav-icon fas fa-tachometer-alt"></i>
						<p>Dashboard</p>
				</a>
			</li>

            <li class="nav-item">
                <li class="nav-header text-bold">PROFILE</li>
                <li class="nav-item">
                    <a href="{{ route('profile.biodata') }}" class="nav-link {{ AktifMenu('profile.biodata', 2) }}">
                        <i class="nav-icon fas fa-user"></i>
                        <p>Biodata</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('profile.riwayat_pendidikan') }}" class="nav-link {{ AktifMenu('profile.riwayat_pendidikan', 2) }}">
                        <i class="nav-icon fas fa-school"></i>
                        <p>Riwayat Pendidikan</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('ubah_password') }}" class="nav-link {{ AktifMenu('ubah_password', 2) }}">
                        <i class="fas fa-key nav-icon"></i>
                        <p>Ubah Password</p>
                    </a>
                </li>
            </li>

			@if(session()->has('login.role') && session()->get('login.role')->id_peran==1)
			
            <li class="nav-item">
                <li class="nav-header text-bold">MASTER DATA</li>
                <li class="nav-item">
                    <a href="{{ route('user.index') }}" class="nav-link {{ (request()->is('master/user*')) ? 'active' : '' }}">
                        <i class="nav-icon fas fa-users"></i>
                        <p>Pengguna</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('peran.index') }}" class="nav-link {{ (request()->is('master/peran*')) ? 'active' : '' }}">
                        <i class="nav-icon fab fa-critical-role"></i>
                        <p>Peran</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('unit.index') }}" class="nav-link {{ (request()->is('master/unit*')) ? 'active' : '' }}">
                        <i class="nav-icon fa fa-building-o"></i>
                        <p>Unit Organisasi</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('aplikasi.index') }}" class="nav-link {{ (request()->is('master/aplikasi*')) ? 'active' : '' }}">
                        <i class="nav-icon fa fa-desktop"></i>
                        <p>Aplikasi</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('token.index') }}" class="nav-link {{ (request()->is('master/token*')) ? 'active' : '' }}">
                        <i class="nav-icon fas fa-coins"></i>
                        <p>Token</p>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="{{ route('menu.index') }}" class="nav-link {{ (request()->is('master/menu*')) ? 'active' : '' }}">
                        <i class="nav-icon fas fa-bars"></i>
                        <p>Menu</p>
                    </a>
                </li>
            </li>
			@endif
		</ul>
	</nav>
	<!-- /.sidebar-menu -->
</div>
<!-- /.sidebar -->

@push('js')
<script>
	$(document).ready(function() {
		$('.peran').on('change', function() {
			var parentForm = $(this).closest("form");
			if (parentForm && parentForm.length > 0) {
				parentForm.submit();
			}
		});
	});
</script>
@endpush