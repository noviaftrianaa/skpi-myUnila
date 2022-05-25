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
        $('#table-data').DataTable({
            processing: true,
            serverSide: true,
            pagingType: "simple",
            ajax: window.location.href,
            columns: [
                { data: 'DT_RowIndex', orderable: false, searchable: false },
                { data: 'nm_menu' },
                { data: 'nm_file' },
                { data: 'icon', searchable: false },
                { data: 'a_aktif', searchable: false },
                { data: 'aksi', orderable: false, searchable: false }
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
            <h3 class="card-title"><i class="fa fa-list"></i> Data Menu</h3>
            <div class="card-tools">
                <button class="btn btn-dark btn-xs rounded-pill" data-toggle="modal" data-target="#addItem"><i class="fa fa-plus"></i> Tambah</button>
            </div>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
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