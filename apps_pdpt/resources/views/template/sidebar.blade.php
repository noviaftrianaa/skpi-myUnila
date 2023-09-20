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
            <a href="#" class="d-block">{{ strtoupper(auth()->user()->nm_pengguna) }}</a>
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
                            WHERE role.id_pengguna='".auth()->user()->id_pengguna."' AND role.soft_delete=0
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
            <li class="nav-item">
                <a href="{{ url('home') }}" class="nav-link {{ $side_active == 'home' ? 'active' : '' }}">
                    <i class="nav-icon fas fa-tachometer-alt"></i>
                    <p>Dashboard</p>
                </a>
            </li>
			@if(!empty(\Session::get('login.menu')))
			<li class="nav-header text-bold">MANAJEMEN</li>
			@foreach(\Session::get('login.menu') AS $n=>$r)
			@if(empty($r->sub))
			<li class="nav-item">
				<a href="{{ route($r->nm_file) }}" class="nav-link {{ AktifMenu($r->nm_file, 1) }}">
					<i class="nav-icon {{ $r->icon }}"></i>
					<p>{{ $r->nm_menu }}</p>
				</a>
			</li>
			@else
			<li class="nav-item {{ AktifMenu($r->nm_file, 1) == 'active' ? 'menu-open' : '' }}">
				<a href="#" class="nav-link">
					<i class="nav-icon {{ $r->icon }}"></i>
					<p>
						{{ $r->nm_menu }}
						<i class="right fas fa-angle-left"></i>
					</p>
				</a>
				<ul class="nav nav-treeview">
					@foreach($r->sub AS $t)
					<li class="nav-item">
						<a href="{{ route($t->nm_file) }}" class="nav-link {{ AktifMenu($r->nm_file, 2) }}">
							<i class="{{ $t->icon }} nav-icon"></i>
							<p>{{ $t->nm_menu }}</p>
						</a>
					</li>
					@endforeach
				</ul>
			</li>
			@endif
			@endforeach
			@endif

			<a href="{{ url('refresh_menu') }}" class="btn btn-info text-light col-12 mt-4">REFRESH MENU</a>
        </ul>
    </nav>
    <!-- /.sidebar-menu -->
</div>
<!-- /.sidebar -->
@section('js')
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
@stop
