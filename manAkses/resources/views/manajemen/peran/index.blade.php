@extends('template.default.app')
@section('title','Data Peran')
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list"></i> Data Peran</h3>
            <div class="card-tools">
                <button class="btn btn-default btn-xs text-dark" data-toggle="modal" data-target="#addItem"><i class="fa fa-plus"></i> Tambah</button>
            </div>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Nama Peran</th>
                        <th>Perlu SK ?</th>
                        <th>Expired Date</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($peran as $no=>$item)
                        <tr>
                            <td>{{ $no+1 }}</td>
                            <td>{{ $item->nm_peran }}</td>
                            <td>{{ ($item->a_perlu_sk==1) ? 'Ya' : 'Tidak'}}</td>
                            <td>{{ TglWaktuIndonesia($item->expired_date) ?? '-' }}</td>
                            <td>
                                <button class="btn btn-info btn-xs" title="Edit" data-toggle="modal" data-target="#editItem{{$item->id_peran}}"> <i class="fas fa-edit"></i></button>
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
                            Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('peran.store') }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Peran</label>
                                    <input name="nm_peran" type="text" class="form-control" placeholder="Masukkan Nama Peran" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Perlu SK ?</label>
                                    <select name="a_perlu_sk" class="form-control" required>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Expired Date</label>
                                    <input name="expired_date" type="date" class="form-control">
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

    @foreach($peran as $items)
    <div class="modal fade" id="editItem{{$items->id_peran}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Update</span> 
                        <span class="fw-light">
                            Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('peran.update', [Crypt::encrypt($items->id_peran)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Peran</label>
                                    <input name="nm_peran" type="text" class="form-control" placeholder="Masukkan Nama Peran" value="{{$items->nm_peran}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Perlu SK ?</label>
                                    <select name="a_perlu_sk" class="form-control" required>
                                        <option value="0" {{($items->a_perlu_sk==0)?'selected':''}}>Tidak</option>
                                        <option value="1" {{($items->a_perlu_sk==1)?'selected':''}}>Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Expired Date</label>
                                    <input name="expired_date" type="date" class="form-control" value="{{ date('Y-m-d', strtotime($items->expired_date)) }}">
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

    @foreach($peran as $items)
    <div class="modal fade" id="deleteItem{{$items->id_peran}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Reset</span> 
                        <span class="fw-light">
                            Password Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('peran.destroy', [Crypt::encrypt($items->id_peran)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                <p>Apakah yakin ingin menghapus "<b>{{$items->nm_peran}}</b>" ?</p>
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