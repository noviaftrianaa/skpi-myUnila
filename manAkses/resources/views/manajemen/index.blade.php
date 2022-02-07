@extends('template.default.app')
@section('title','Dashboard')

@section('content')
    <div class="row">
		<div class="col-lg-3 col-6">
			<!-- small card -->
			<div class="small-box bg-warning">
				<div class="inner">
					<h3>{{$apps->count()}}</h3>
					<p>Application</p>
				</div>
				<div class="icon">
					<i class="fab fa-app-store"></i>
				</div>
			</div>
		</div>
		<div class="col-lg-3 col-6">
			<!-- small card -->
			<div class="small-box bg-warning">
				<div class="inner">
					<h3>{{$data->count()}}</h3>
					<p>User Registrations</p>
				</div>
				<div class="icon">
					<i class="fas fa-user-plus"></i>
				</div>
			</div>
		</div>
		<div class="col-lg-3 col-6">
			<!-- small card -->
			<div class="small-box bg-warning">
				<div class="inner">
					<h3>{{$role->count()}}</h3>
					<p>Roles</p>
				</div>
				<div class="icon">
					<i class="fab fa-critical-role"></i>
				</div>
			</div>
		</div>
		<div class="col-lg-3 col-6">
			<!-- small card -->
			<div class="small-box bg-warning">
				<div class="inner">
					<h3>{{$unit->count()}}</h3>
					<p>Units</p>
				</div>
				<div class="icon">
					<i class="fas fa-sitemap"></i>
				</div>
			</div>
		</div>
    </div>

	<div class="row mt-3">
		<div class="col-md-12">
			SQL Server Version is <strong>
				Microsoft SQL Server 2019 (RTM) - 15.0.2000.5 (X64)
			</strong>
		</div>
	</div>

@push('js')
<!-- ChartJS -->
<script src="{{ asset('js/highcharts.js') }}"></script>
<script>
    $(document).ready( function () {
        var datas = <?php echo json_encode($data); ?>;

        Highcharts.chart('Charts', {
			chart: {
				type: 'column'
			},
			title: {
				text: ''
			},
			accessibility: {
				announceNewData: {
					enabled: true
				}
			},
			xAxis: {
				type: 'category',
			},
			yAxis: {
				max: 4000,
			},
			legend: {
				align: 'right',
				verticalAlign: 'middle',
				layout: 'vertical'
			},
			tooltip: {
				shared: true,
				useHTML: true,
				headerFormat: '<table>',
				pointFormat: '<tr>'+
					'<td><b>{point.name}</b></td>' +
					'</tr><tr>'+
					'<td>Jumlah: <b>{point.y}</b></td></tr>',
				footerFormat: '</table>'
			},
			plotOptions: {
				column: {
					colorByPoint: true,
					pointPadding: 0.2,
					borderWidth: 0
				}
			},
            series: [{
                data: datas,
                showInLegend: false,
                dataLabels: {
                    display: false,
                }
            }]
        });
    });
</script>
@endpush
@endsection