@extends('template.default.app')
@section('title','Data Pengguna')

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
            ajax: window.location.href,
            columns: [
                { data: 'DT_RowIndex', orderable: false, searchable: false, title: 'No.', width: '5px', className: 'text-center' },
                { data: 'nm_pengguna', title: 'Nama' },
                { data: 'username', title: 'Username' },
                { data: 'unit_organisasi', title: 'Unit Organisasi' },
                { data: 'jenis_kelamin', searchable: false, title: 'Jenis Kelamin' },
                { data: 'status', searchable: false, title: 'Status', className: 'text-center' },
                { data: 'aksi', orderable: false, searchable: false, title: 'Aksi', className: 'text-center', width: '5px' }
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
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Pengguna</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="row px-2">
                <div class="col-4">
                    <a class="btn btn-info" href="{{route('user.create')}}"><i class="fa fa-plus"></i> Tambah Data</a>
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
                <table class="table table-striped table-bordered table-hover" id="table-data" style="width: 100% !important">
                    <thead>
                      <!-- <tr>
                        <th>No.</th>
                        <th>Nama</th>
                        <th>Username</th>
                        <th>Unit Organisasi</th>
                        <th>Jenis Kelamin</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr> -->
                    </thead>
                </table>
            </div>
        </div>
    </div>

@endsection