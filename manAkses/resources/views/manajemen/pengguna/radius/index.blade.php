@extends('template.default.app')
@section('title','Data Pengguna Radius')

@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>
    $(document).ready( function () {
        let table = $('#table-data').DataTable({
            processing: true,
            serverSide: true,
            pagingType: "simple",
            ordering: false,
            ajax: window.location.href,
            columns: [
                { data: 'DT_RowIndex', orderable: false, searchable: false, title: 'No.', width: '5px', className: 'text-center' },
                { data: 'nm_pengguna', title: 'Nama', className: 'text-center' },
                { data: 'username', title: 'Username', className: 'text-center', width: '5px' },
                { data: 'email', title: 'Email', className: 'text-center', width: '5px' },
                { data: 'nip', title: 'NIP/NPM', className: 'text-center', width: '5px' },
                {
                    data: 'status',
                    title: 'Peran',
                    className: 'text-center',
                    width: '5px',
                    render: function(data,type,row) {
                        return `<span class="badge badge-warning">${data}</span>`;
                    }
                },
                {
                    data: 'a_aktif',
                    title: 'Aktif',
                    className: 'text-center',
                    width: '5px',
                    render: function(data,type,row) {
                        return data==1 ? `<span class="badge badge-success">Aktif</span>` : `<span class="badge badge-danger">Tidak Aktif</span>`;
                    }
                }
            ],
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
        } );

        $('#search').on('change', function () {
            table.search($('#search').val()).draw();
        } );
    });
</script>
@endpush

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Pengguna Radius</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="row px-2">
                <div class="col-2">
                    <a type="button" class="btn btn-default" href="{{ route('user.index') }}"><i class="fas fa-arrow-left mr-1"></i>Kembali</a>
                </div>
                <div class="ml-auto px-2">
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
                <table class="table table-hover table-borderless" id="table-data" style="width: 100% !important">
                    <thead class="bg-info"></thead>
                </table>
            </div>
        </div>
    </div>

@endsection
