@extends('template.default.app')
@section('title','Data Menu')

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
                { data: 'DT_RowIndex', orderable: false, searchable: false, width: '5px', className: 'text-center' },
                { data: 'nm_menu' },
                { data: 'nm_file' },
                { data: 'icon', searchable: false },
                { data: 'a_aktif', searchable: false },
                { data: 'aksi', orderable: false, searchable: false, width: '5px' }
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
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Menu</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="d-lg-flex d-block">
                <div class="col-2">
                    <button class="btn btn-info" data-toggle="modal" data-target="#addItem"><i class="fa fa-plus"></i> Tambah Data</button>
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
                      <tr>
                        <th width="5%">No.</th>
                        <th>Nama Menu</th>
                        <th>Nama Alias</th>
                        <th>Icon</th>
                        <th>Aktif ?</th>
                        <th width="5%">Aksi</th>
                      </tr>
                    </thead>
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

    @foreach($menu as $items)
    <div class="modal fade" id="editItem{{$items->id_menu}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Update</span> 
                        <span class="fw-light">
                            Menu
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('menu.update', [Crypt::encrypt($items->id_menu)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Menu</label>
                                    <input name="nm_menu" type="text" class="form-control" placeholder="Masukkan Nama Menu" value="{{$items->nm_menu}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Alias</label>
                                    <input name="nm_file" type="text" class="form-control" placeholder="Masukkan Nama Alias" value="{{$items->nm_file}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Icon</label>
                                    <input name="icon" type="text" class="form-control" placeholder="example: <i class='fas fa-check'></i>" value="{{$items->icon}}">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Aktif ?</label>
                                    <select name="a_aktif" class="form-control" required>
                                        <option value="0" {{ ($items->a_aktif==0)?'selected':'' }}>Tidak</option>
                                        <option value="1" {{ ($items->a_aktif==1)?'selected':'' }}>Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Tampil ?</label>
                                    <select name="a_tampil" class="form-control" required>
                                        <option value="0" {{ ($items->a_tampil==0)?'selected':'' }}>Tidak</option>
                                        <option value="1" {{ ($items->a_tampil==1)?'selected':'' }}>Ya</option>
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
    @endforeach

@endsection