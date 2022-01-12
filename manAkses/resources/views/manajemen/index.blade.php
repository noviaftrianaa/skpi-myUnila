@extends('template.default.app')
@section('title','Dashboard')

@section('content')
    <div class="row">
		<div class="col-md-4 col-sm-6 col-12">
			<div class="info-box bg-light">
				<div class="info-box-content text-bold">
					<span class="info-box-text text-center text-muted">Pengguna Aktif</span>
					<span class="info-box-number text-center text-muted mb-0">{{$data->count()}}</span>
				</div>
			</div>
		</div>
		<div class="col-md-4 col-sm-6 col-12">
			<div class="info-box bg-light">
				<div class="info-box-content text-bold">
					<span class="info-box-text text-center text-muted">Aplikasi</span>
					<span class="info-box-number text-center text-muted mb-0">{{$apps->count()}}</span>
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