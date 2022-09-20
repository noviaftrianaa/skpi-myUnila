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
                { data: 'DT_RowIndex', orderable: false, searchable: false },
                { data: 'nm_pengguna' },
                { data: 'username' },
                { data: 'jenis_kelamin', searchable: false },
                { data: 'status', searchable: false },
                { data: 'aksi', orderable: false, searchable: false }
            ],
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
        } );

        $('#search').on('keyup click', function () {
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
            <div class="d-lg-flex d-block">
                <div class="col-2">
                    <a class="btn btn-info" href="{{route('user.create')}}"><i class="fa fa-plus"></i> Tambah Data</a>
                </div>
                <div class="ml-auto pr-2">
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
                <table class="table table-striped table-bordered table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Nama</th>
                        <th>Username (<i>Email</i>)</th>
                        <th>Jenis Kelamin</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                </table>
            </div>
        </div>
    </div>

@endsection