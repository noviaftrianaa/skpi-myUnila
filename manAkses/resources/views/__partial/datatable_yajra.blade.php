@push('css')
<link href="{{asset('node_modules/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
{{--<link href="{{asset('master/css/select.dataTables.min.css')}}" rel="stylesheet">--}}
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('node_modules/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('node_modules/datatables/media/js/dataTables.bootstrap4.js')}}"></script>
{{--<script type="text/javascript" src="{{ asset('master/js/dataTables.select.min.js')}}"></script>--}}
<script type="text/javascript" src="{{ asset('js/konfirmasi_yajra.js')}}"></script>
@endpush
