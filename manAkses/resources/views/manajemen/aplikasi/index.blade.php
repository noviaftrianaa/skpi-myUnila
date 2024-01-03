@extends('template.default.app')
@section('title','Data Aplikasi')

@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>

    function datatables() {
        return $('#table-data').DataTable({
            processing: true,
            serverSide: true,
            ordering: false,
            ajax: window.location.href,
            columns: [
                { data: 'DT_RowIndex', orderable: false, searchable: false, title: 'No.', width: '5px', className: 'text-center' },
                { data: 'apps', title: 'Aplikasi' },
                { data: 'lemb', title: 'Unit' },
                {
                    data: 'links',
                    title: 'URL',
                    className: 'text-center',
                    width: '5px'
                },
                {
                    data: 'expired',
                    title: 'Expired',
                    className: 'text-center'
                },
                {
                    data: 'sync',
                    title: 'Sync',
                    className: 'text-center'
                },
                {
                    data: 'aksi',
                    title: 'Action',
                    className: 'text-center',
                    width: '5px'
                }
            ],
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
        } );
    }

    $(document).ready( function () {
        let table = datatables();

        $('#search').on('change', function () {
            table.search($('#search').val()).draw();
        } );
    });
</script>
@endpush

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Aplikasi</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="d-lg-flex d-block">
                <div class="col-md-2 col-6 py-1">
                    @if($menus->a_boleh_insert == "1")
                    <a class="btn btn-info col-12" href="{{route('aplikasi.create')}}"><i class="fa fa-plus"></i> Tambah Data</a>
                    @else
                    <a class="btn btn-info col-12" href="{{ url('/api/live/v1') }}" target="_blank"><i class="fa fa-connectdevelop"></i> Rest API</a>
                    @endif
                </div>
                <div class="col-md-4 col-12 ml-auto py-1">
                    <div class="input-group">
                        <input type="text" id="search" placeholder="Pencarian" class="form-control">
                        <div class="input-group-append">
                            <button class="btn btn-info btn-sm" data-toggle="tooltip" data-placement="top" title="Cari">
                                <i class="fa fa-search search-icon"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-borderless table-hover" id="table-data" style="width: 100% !important">
                    <thead class="bg-info"></thead>
                </table>
            </div>
        </div>
    </div>

@endsection
