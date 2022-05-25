@push('css')
    <link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
@endpush

@push('js')
    <script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
    <script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
    <script>
        $(document).ready( function () {
            $('.table-data').DataTable({
                stateSave: true,
                "language": {
                    "decimal":        "",
                    "emptyTable":     "Tidak ada data pada tabel",
                    "info":           "Menampilkan _START_ sampai _END_ dari _TOTAL_ total data",
                    "infoEmpty":      "Tidak ada yang ditampilkan",
                    "infoFiltered":   "(Terfilter dari  _MAX_ total entitas)",
                    "infoPostFix":    "",
                    "thousands":      ",",
                    "lengthMenu":     "Menampilkan _MENU_ entitas",
                    "loadingRecords": "Loading...",
                    "processing":     "Sedang dalam proses...",
                    "search":         "Pencarian:",
                    "zeroRecords":    "Tidak ada data yang cocok",
                    "paginate": {
                        "first":      "Pertama",
                        "last":       "Terakhir",
                        "next":       "Selanjutnya",
                        "previous":   "Sebelumnya"
                    },
                    "aria": {
                        "sortAscending":  ": activate to sort column ascending",
                        "sortDescending": ": activate to sort column descending"
                    }
                }
            } );
        });
    </script>
@endpush
