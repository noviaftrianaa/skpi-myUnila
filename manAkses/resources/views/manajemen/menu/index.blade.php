@extends('template.default.app')
@section('title','Data Menu')
@extends('__partial.datatable')

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
                    <tbody>
                        @foreach($menu as $no=>$item)
                        <tr>
                            <td>{{ $no+1 }}</td>
                            <td>{{ $item->nm_menu }}</td>
                            <td>{{ $item->nm_file }}</td>
                            <td>{{ $item->icon ?? '-' }}</td>
                            <td>{{ ($item->a_aktif==1) ? 'Ya' : 'Tidak'}}</td>
                            <td>
                                <button class="btn btn-info btn-xs" title="Edit" data-toggle="modal" data-target="#editItem{{$item->id_menu}}"> <i class="fas fa-edit"></i></button>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
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