@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>
    $(document).ready( function () {
        let table = $('#table-data').DataTable({
            // serverSide: true,
            processing: true,
            ordering: false,
            pagingType: "simple",
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
        } );

        $('#search').on('keyup click', function () {
            table.search($('#search').val()).draw();
        } );
    });
</script>
@endpush
