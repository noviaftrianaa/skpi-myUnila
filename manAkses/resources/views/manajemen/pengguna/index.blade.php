@extends('template.default.app')
@section('title','Data Pengguna')
@extends('__partial.datatable')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Data Pengguna</h3>
            <div class="card-tools">
                <button class="btn btn-primary btn-sm btn-flat" data-toggle="modal" data-target="#addItem"><i class="fa fa-plus"></i> Tambah</button>
            </div>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Nama</th>
                        <th>Username</th>
                        <th>Jenis Kelamin</th>
                        <th>Peran</th>
                        <th>Last Active</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($user as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->nm_pengguna}}</td>
                            <td>{{$item->username}}</td>
                            <td>{{($item->jenis_kelamin=="l")?'Laki-laki':'Perempuan'}}</td>
                            <td>{{$item->nm_peran}}</td>
                            <td>{{TglIndonesia($item->last_active)}}</td>
                            <td>
                                <button class="btn btn-outline-warning btn-xs" title="Reset" data-toggle="modal" data-target="#resetItem{{$item->id_pengguna}}"> <i class="fas fa-key"></i></button>
                                <button class="btn btn-outline-info btn-xs" title="Edit" data-toggle="modal" data-target="#editItem{{$item->id_pengguna}}"> <i class="fas fa-edit"></i></button>
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
                    <form action="{{ route('user.store') }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama</label>
                                    <input name="nama" type="text" class="form-control" placeholder="Masukkan Nama Lengkap" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Username</label>
                                    <input name="username" type="email" class="form-control" placeholder="Masukkan Email" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Unit Organisasi</label>
                                    <select class="form-control" name="unit">
                                        <option selected disabled>Pilih</option>
                                        @foreach($unit as $item)
                                        <option value="{{$item->id_unit}}">{{$item->nm_lemb}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Peran</label>
                                    <select class="form-control" name="peran">
                                        <option selected disabled>Pilih</option>
                                        @foreach($peran as $item)
                                        <option value="{{$item->id_peran}}">{{$item->nm_peran}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Status</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="status" id="flexRadioDefault1">
                                        <label class="form-check-label" for="flexRadioDefault1">
                                            Aktif
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="status" id="flexRadioDefault1">
                                        <label class="form-check-label" for="flexRadioDefault1">
                                            Tidak Aktif
                                        </label>
                                    </div>
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

    @foreach($user as $items)
    <div class="modal fade" id="editItem{{$items->id_pengguna}}" tabindex="-1" role="dialog" aria-hidden="true">
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
                    <form action="{{ route('user.update', [Crypt::encrypt($items->id_pengguna)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama</label>
                                    <input name="nama" type="text" class="form-control" value="{{$items->nm_pengguna}}" placeholder="Masukkan Nama Lengkap" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Username</label>
                                    <input name="username" type="text" class="form-control" value="{{$items->username}}" placeholder="Masukkan Email" disabled>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Unit</label>
                                    <select class="form-control" name="unit">
                                        <option selected disabled>Pilih</option>
                                        @foreach($unit as $item)
                                        <option value="{{$item->id_unit}}">{{$item->nm_lemb}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Peran</label>
                                    <select class="form-control" name="peran">
                                        <option selected disabled>Pilih</option>
                                        @foreach($peran as $item)
                                        <option value="{{$item->id_peran}}">{{$item->nm_peran}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Status</label>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="status" id="flexRadioDefault1" {{($items->a_aktif==1) ? 'checked' : ''}}>
                                        <label class="form-check-label" for="flexRadioDefault1">
                                            Aktif
                                        </label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input" type="radio" name="status" id="flexRadioDefault1" {{($items->a_aktif==0) ? 'checked' : ''}}>
                                        <label class="form-check-label" for="flexRadioDefault1">
                                            Tidak Aktif
                                        </label>
                                    </div>
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

    @foreach($user as $items)
    <div class="modal fade" id="resetItem{{$items->id_pengguna}}" tabindex="-1" role="dialog" aria-hidden="true">
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
                    <form action="{{ route('user.reset', [Crypt::encrypt($items->id_pengguna)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                <p>Apakah yakin ingin mengubah password atas nama <b>{{$items->nm_pengguna}}</b> menjadi default ?</p>
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