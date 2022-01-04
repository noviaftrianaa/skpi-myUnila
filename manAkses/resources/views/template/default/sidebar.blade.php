<!-- Sidebar -->
<div class="sidebar">
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
		</ul>
	</nav>
	<!-- /.sidebar-menu -->
</div>
<!-- /.sidebar -->