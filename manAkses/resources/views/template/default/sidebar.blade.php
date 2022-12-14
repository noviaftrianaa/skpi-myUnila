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
            <a href="{{ url('/biodata') }}" class="d-block">{{ strtoupper(auth()->user()->nm_pengguna) }}</a>
            <span class="d-block text-sm">
				<form action="{{ url('changeRole') }}" method="post" enctype="multipart/form-data" id="changeRole">
					<input type="hidden" name="_token" value="{{ csrf_token() }}">
					<input type="hidden" name="_method" value="PUT">
					<select class="form-control-plaintext bg-dark text-light peran" name="id_peran">
                        @php
                        $peran = DB::SELECT("
                            SELECT peran.*
                            FROM man_akses.role_pengguna AS role
                            JOIN man_akses.peran ON peran.id_peran=role.id_peran
                            WHERE role.id_pengguna='".auth()->user()->id_pengguna."'
                        ");
                        @endphp
						@foreach($peran AS $items)
						<option value="{{ $items->id_peran }}" {{ ($items->id_peran==session()->get('login.role')->id_peran) ? 'selected' : '' }}>{{ strtoupper($items->nm_peran) }}</option>
						@endforeach
					</select>
				</form>
			</span>
        </div>
    </div>
	<!-- Sidebar Menu -->
	<nav class="mt-2">
		<ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
			@if(\Session::has('login.menu'))
			@foreach(\Session::get('login.menu') AS $n=>$r)
			<li class="nav-item">
				<a href="{{ route($r->nm_file) }}" class="nav-link {{ AktifMenu($r->nm_file, 2) }}">
					<i class="nav-icon {{ $r->icon }}"></i>
					<p>{{ $r->nm_menu }}</p>
				</a>
			</li>
			@endforeach
			@if(\Config::get('manAkses')['Developer'] == 1)
			@endif
			@endif
			<a href="{{ route('menu_refresh') }}" class="btn btn-info col-12 mt-4">REFRESH MENU</a>
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