@extends('template.default.app')
@section('title','Data Token')

@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>
    $(document).ready( function () {
        $('#table-data').DataTable({
            processing: true,
            serverSide: true,
            pagingType: "simple",
            info: false,
            searching: false,
            lengthChange: false,
            ajax: window.location.href,
            columns: [
                { data: 'DT_RowIndex', orderable: false, searchable: false, width: '5px', className: 'text-center', title: 'No.' },
                { data: 'token_value', title: 'Token' },
                { data: 'base_url', title: 'URL' },
                { data: 'waktu_create', title: 'Created' },
                { data: 'waktu_expired', title: 'Expired' },
                { data: 'keterangan', title: 'Notes' }
                // { data: 'action', orderable: false, searchable: false }
            ],
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

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Token</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-borderless table-hover" id="table-data" style="width: 100% !important">
                    <thead class="bg-info"></thead>
                </table>
            </div>
        </div>
    </div>

@endsection
