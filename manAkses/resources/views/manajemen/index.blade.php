@extends('template.default.app')
@section('title','Dashboard')

@section('content')
    <div class="row">
        <div class="col-md-3 col-sm-6 col-12">
            <a href="{{route('user.index')}}" title="Data Pengguna">
                <div class="info-box">
                    <span class="info-box-icon bg-primary"><i class="fas fa-user"></i></span>
                    <div class="info-box-content">
                        <span class="info-box-text">{{$data->count()}}</span>
                        <span class="info-box-number">Pengguna Aktif</span>
                    </div>
                </div>
            </a>
        </div>
    </div>

	<div class="row">
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