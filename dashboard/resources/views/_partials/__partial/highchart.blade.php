@push('js')
{{--<script type="text/javascript" src="{{ asset('node_modules/highcharts/highcharts.js') }}"></script>--}}
<script type="text/javascript" src="{{asset('js/highcharts/highstock.js')}}"></script>
{{--<script type="text/javascript" src="{{asset('node_modules/highcharts/themes/grid.js')}}"></script>--}}
<script type="text/javascript" src="{{asset('js/highcharts/modules/exporting.js')}}"></script>
<script type="text/javascript" src="{{asset('js/highcharts/modules/offline-exporting.js')}}"></script>
@endpush
