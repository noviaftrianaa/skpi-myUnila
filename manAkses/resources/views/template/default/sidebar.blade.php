<!-- Sidebar -->
<div class="sidebar">
	<!-- Profile Menu -->
    <div class="user-panel mt-3 pb-2 mb-2 d-flex text-light">
        <div class="image mt-1">
            <img src="{{ asset('images/blank-profile.png') }}" class="mt-2"
                alt="User Image">
        </div>
        <div class="info">
            <a href="{{ url('/biodata') }}" class="d-block">{{ $users['nm_pengguna'] }}</a>
            <span class="d-block text-sm">
				<form action="{{ url('changeRole') }}" method="post" enctype="multipart/form-data" id="changeRole">
					<input type="hidden" name="_token" value="{{ csrf_token() }}">
					<input type="hidden" name="_method" value="PUT">
					<select class="form-control-plaintext bg-dark text-light peran" name="id_peran">
						@foreach($users['status_peran'] AS $items)
						<option value="{{ $items['id_peran'] }}" {{ ($items['id_peran']==session()->get('login.role')->id_peran) ? 'selected' : '' }}>{{ $items['nm_peran'] }}</option>
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
			<!-- route dashboard -->
				<a href="{{ route('index') }}" class="nav-link {{ (request()->is('/')) ? 'active' : '' }}">
						<i class="nav-icon fas fa-tachometer-alt"></i>
						<p>Dashboard</p>
				</a>
			</li>
			<li class="nav-header">Master</li>
			<li class="nav-item">
			<!-- route dashboard -->
				<a href="{{ route('user.index') }}" class="nav-link {{ (request()->is('user*')) ? 'active' : '' }}">
					<i class="nav-icon fas fa-user"></i>
					<p>Data Pengguna</p>
				</a>
			</li>
			<li class="nav-item">
			<!-- route dashboard -->
				<a href="{{ route('peran.index') }}" class="nav-link {{ (request()->is('peran*')) ? 'active' : '' }}">
					<i class="nav-icon fas fa-users"></i>
					<p>Data Peran</p>
				</a>
			</li>
			<li class="nav-item">
			<!-- route dashboard -->
				<a href="{{ route('unit.index') }}" class="nav-link {{ (request()->is('unit*')) ? 'active' : '' }}">
					<i class="nav-icon fas fa-users"></i>
					<p>Data Unit Organisasi</p>
				</a>
			</li>
			<li class="nav-item">
			<!-- route dashboard -->
				<a href="{{ route('aplikasi.index') }}" class="nav-link {{ (request()->is('aplikasi*')) ? 'active' : '' }}">
					<i class="nav-icon fa fa-microchip"></i>
					<p>Data Aplikasi</p>
				</a>
			</li>
			<li class="nav-item">
			<!-- route dashboard -->
				<a href="{{ route('token.index') }}" class="nav-link {{ (request()->is('token*')) ? 'active' : '' }}">
					<i class="nav-icon fas fa-key"></i>
					<p>Data Token</p>
				</a>
			</li>
			<li class="nav-item">
			<!-- route dashboard -->
				<a href="{{ route('menu.index') }}" class="nav-link {{ (request()->is('menu*')) ? 'active' : '' }}">
					<i class="nav-icon fas fa-bars"></i>
					<p>Data Menu</p>
				</a>
			</li>
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
			// document.forms['#changeRole'].submit();
		});
	});
</script>
@endpush