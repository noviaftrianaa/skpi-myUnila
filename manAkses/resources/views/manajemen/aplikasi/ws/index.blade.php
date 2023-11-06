@extends('template.default.app')
@section('title','Data Web Services')
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Web Services</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="d-lg-flex d-block">
                <div class="col-2">
                    <button class="btn btn-info col-12" data-toggle="modal" data-target="#addItem"><i class="fa fa-plus"></i> Tambah Data</button>
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
                <table class="table table-borderless table-hover" id="table-data" style="width: 100% !important">
                    <thead class="bg-info">
                      <tr>
                        <th class="text-center" width="5px">No.</th>
                        <th>Group</th>
                        <th>URL</th>
                        <th class="text-center" width="5px">Method</th>
                        <th class="text-center" width="5px">Status</th>
                        <th class="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td class="text-center" width="5px">{{ $no+1 }}</td>
                            <td>{{ $item->nm_group }}</td>
                            <td>{{ $item->path_url }}</td>
                            <td class="text-center" width="5px">{{ $item->nm_method }}</td>
                            <td class="text-center" width="5px">{!! $item->a_active==1 ? '<span class="badge badge-success">Aktif</span>' : '<span class="badge badge-danger">Tidak Aktif</span>' !!}</td>
                            <td class="text-center" width="5px">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-link btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <button class="dropdown-item" title="Edit" data-toggle="modal" data-target="#editItem{{$item->id_ws_endpoint}}"><i class="fas fa-edit mr-1"></i>Edit</button>
                                        <button class="dropdown-item" title="Delete" data-toggle="modal" data-target="#deleteItem{{$item->id_ws_endpoint}}"><i class="fas fa-trash-alt mr-2"></i>Delete</button>
                                    </div>
                                </div>
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
                            Web Services
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('aplikasi.ws.store', [Crypt::encrypt($id)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="POST">
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Group</label>
                                    <select name="nm_group_lama" class="form-control select2" data-placeholder="Choose">
                                        <option></option>
                                        @foreach ($group as $value)
                                            <option value="{{ $value->nm_group }}">{{ $value->nm_group }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Or New Group</label>
                                    <input name="nm_group_baru" type="text" class="form-control" placeholder="Nama Group Baru">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Method</label>
                                    <select name="nm_method" class="form-control select2" data-placeholder="Choose" required>
                                        <option></option>
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="PATCH">PATCH</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Path URL</label>
                                    <input name="path_url" type="text" class="form-control" placeholder="/path/url" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Active ?</label>
                                    <select name="a_active" class="form-control" required>
                                        <option value="1">Aktif</option>
                                        <option value="0">Tidak Aktif</option>
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

    @foreach($data as $items)
    <div class="modal fade" id="editItem{{$items->id_ws_endpoint}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Update</span>
                        <span class="fw-light">
                            Web Services
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">

                    <form action="{{ route('aplikasi.ws.store', [Crypt::encrypt($id)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="POST">
                        <input type="hidden" name="id_ws_endpoint" value="{{ $items->id_ws_endpoint }}">
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Group</label>
                                    <select name="nm_group_lama" class="form-control select2" data-placeholder="Choose" required>
                                        <option></option>
                                        @foreach ($group as $value)
                                            <option value="{{ $value->nm_group }}" {{ $items->nm_group==$value->nm_group ? 'selected':'' }}>{{ $value->nm_group }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Or New Group</label>
                                    <input name="nm_group_baru" type="text" class="form-control" placeholder="Nama Group Baru">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Method</label>
                                    <select name="nm_method" class="form-control select2" data-placeholder="Choose" required>
                                        <option></option>
                                        <option value="GET" {{ $items->nm_method=='GET' ? 'selected':'' }}>GET</option>
                                        <option value="POST" {{ $items->nm_method=='POST' ? 'selected':'' }}>POST</option>
                                        <option value="PUT" {{ $items->nm_method=='PUT' ? 'selected':'' }}>PUT</option>
                                        <option value="PATCH" {{ $items->nm_method=='PATCH' ? 'selected':'' }}>PATCH</option>
                                        <option value="DELETE" {{ $items->nm_method==`DELETE` ? 'selected':'' }}>DELETE</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Path URL</label>
                                    <input name="path_url" type="text" class="form-control" placeholder="/path/url" value="{{ $items->path_url }}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Active ?</label>
                                    <select name="a_active" class="form-control" required>
                                        <option value="1" {{ $items->nm_method==1 ? 'selected':'' }}>Aktif</option>
                                        <option value="0" {{ $items->nm_method==0 ? 'selected':'' }}>Tidak Aktif</option>
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

    @foreach($data as $items)
    <div class="modal fade" id="deleteItem{{$items->id_ws_endpoint}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Hapus</span>
                        <span class="fw-light">
                            Web Services
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('aplikasi.ws.destroy', [Crypt::encrypt($items->id_ws_endpoint)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                <p>Apakah yakin ingin menghapus "<b>{{ $items->nm_group .' ('.$items->nm_method.') ['.$items->path_url.']' }}</b>" ?</p>
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
