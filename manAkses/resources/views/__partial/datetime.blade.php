@push('css')
<link href="{{asset('js/bootstrap-datetimepicker/css/bootstrap-datetimepicker.css')}}" rel="stylesheet" media="screen">
@endpush

@push('js')
<script type="text/javascript" src="{{asset('js/bootstrap-datetimepicker/js/bootstrap-datetimepicker.min.js')}}"></script>
<script type="text/javascript" src="{{asset('js/bootstrap-datetimepicker/js/locales/bootstrap-datetimepicker.id.js')}}"></script>
<script type="text/javascript">
    $(function () {
        $('#waktu_mulai').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: 1,
            todayBtn: 1,
            todayHighlight: 1,
            forceParse: 0,
            weekStart: 1
        });
        $('input[id^="tgl_mulai"]').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: 1,
            todayBtn: 1,
            todayHighlight: 1,
            forceParse: 0,
            weekStart: 1
        });
        $('input[id^="tgl_selesai"]').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: 1,
            todayBtn: 1,
            todayHighlight: 1,
            forceParse: 0,
            weekStart: 1
        });

        $('#tgl_mulai').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: 1,
            todayBtn: 1,
            todayHighlight: 1,
            forceParse: 0,
            weekStart: 1
        });

        $('#tgl_selesai').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: 1,
            todayBtn: 1,
            todayHighlight: 1,
            forceParse: 0,
            weekStart: 1
        });

        $('#waktu_berakhir').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: 1,
            todayBtn: 1,
            todayHighlight: 1,
            forceParse: 0,
            weekStart: 1
        });

        $('#expired_date').datetimepicker({
            format: 'yyyy-mm-dd hh:ii:ss',
            autoclose: 1,
            todayBtn: 1,
            todayHighlight: 1,
            forceParse: 0,
            weekStart: 1
        });
    });
</script>
@endpush
