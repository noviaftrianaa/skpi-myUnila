@extends('template.default.app')
@include('__partial.datatable')
@section('title','Dashboard Manajemen Akses UNILA')

@section('content')
<div class="row">
	<div class="col-lg-12 col-md-12">
		HALOO USER<br>
		Your IP Address is <strong id="ipaddress"></strong><br>
		Your DB Version is <strong>{{$db->versi}}</strong>
	</div>
</div>

@push('js')
<script type="text/javascript">
	window.onload = function () {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = "https://api.ipify.org?format=jsonp&callback=DisplayIP";
		document.getElementsByTagName("head")[0].appendChild(script);
	};
	function DisplayIP(response) {
		document.getElementById("ipaddress").innerHTML = response.ip;
	}
</script>
@endpush

@endsection