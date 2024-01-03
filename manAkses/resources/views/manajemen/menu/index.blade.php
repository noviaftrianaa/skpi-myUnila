@extends('template.default.app')
@section('title','Data Menu')
@extends('__partial.select2')

@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>
    function tbl()
    {
        return $('#table-data').DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: window.location.href,
                data: {
                    aplikasi: $('#getAplikasi').val()
                }
            },
            columns: [
                { data: 'DT_RowIndex', width: '5px', className: 'text-center', title: 'No.', orderable: false },
                { data: 'aplikasi.nm_aplikasi', title: 'Aplikasi' },
                { data: 'nm_menu', title: 'Menu', orderable: false },
                { data: 'nm_file', title: 'Alias', width: '5px', orderable: false },
                { data: 'icon', title: 'Icon', className: 'text-center', orderable: false },
                {
                    data: 'a_aktif',
                    title: 'Status',
                    width: '5px',
                    className: 'text-center',
                    orderable: false,
                    render: function(data,type,row) {
                        return data==1 ? `<span class="badge badge-success">Aktif</span>` : `<span class="badge badge-danger">Tidak Aktif</span>`;
                    }
                }
            ],
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>',
            order: [[1, 'asc']],
        } );
    }

    $(document).ready( function () {
        let table = tbl();

        $('#getAplikasi').on('change', function() {
            let id = $(this).val();
            $('#table-data').DataTable().clear().destroy();
            table = tbl();
        });

        $('#search').on('change', function () {
            table.search($('#search').val()).draw();
        } );
    });
</script>
@endpush

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Menu</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="row px-2">
                <div class="col-md-2 col-6 py-1">
                    <select class="form-control select2" id="getAplikasi" data-placeholder="Pilih">
                        <option value="all" selected>TAMPILKAN SEMUA</option>
                        @foreach($aplikasi AS $no=>$item)
                        <option value="{{ $item->id_aplikasi }}">{{ $item->nm_aplikasi }}</option>
                        @endforeach
                    </select>
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

    <!-- Modal -->
    <div class="modal fade" id="addItem" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah</span>
                        <span class="fw-light">
                            Menu
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('menu.store') }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Menu</label>
                                    <input name="nm_menu" type="text" class="form-control" placeholder="Masukkan Nama Menu" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Alias</label>
                                    <input name="nm_file" type="text" class="form-control" placeholder="Masukkan Nama Alias" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Icon</label>
                                    <input name="icon" type="text" class="form-control" placeholder="example: <i class='fas fa-check'></i>">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Aktif ?</label>
                                    <select name="a_aktif" class="form-control" required>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Tampil ?</label>
                                    <select name="a_tampil" class="form-control" required>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="submit" class="btn btn-primary">Simpan</button>
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Tutup</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
