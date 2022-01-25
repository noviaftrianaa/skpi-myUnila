@extends('template.default.app')
@section('title','Data Pengguna')
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Data Pengguna</h3>
            <div class="card-tools">
                <a data-toggle="modal" class="btn btn-primary btn-xs btn-flat" href="#editUser"><i class="fa fa-edit"></i> Edit</a>
            </div>
        </div><!-- /.card-header -->
        <div class="card-body" style="margin: 0;padding: 0">
            <div class="table-responsive">
                <table class="table table-striped">
                    <tbody>
                        {!! tablerow('Username',$data->username) !!}
                        {!! tablerow('Nama Pengguna',$data->nm_pengguna) !!}
                        {!! tablerow('Alamat',$data->alamat) !!}
                        {!! tablerow('Tempat Lahir',$data->tempat_lahir) !!}
                        {!! tablerow('Tgl Lahir',$data->tgl_lahir) !!}
                        {!! tablerow('Jenis Kelamin', ($data->jenis_kelamin=="L") ? "Laki-laki" : "Perempuan") !!}
                        {!! tablerow('Jabatan',$data->jabatan) !!}
                        {!! tablerow('No. Telepon',$data->no_tel) !!}
                        {!! tablerow('No. HP',$data->no_hp) !!}
                        {!! tablerow('Approval Pengguna ?', ($data->approval_pengguna==1) ? 'Disetujui':'Tidak Disetujui') !!}
                        {!! tablerow('Apakah Aktif ?',($data->a_aktif==1) ? 'Aktif':'Tidak Aktif') !!}
                        {!! tablerow('Disable ?',($data->disable==1) ? 'Aktif':'Tidak Aktif') !!}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Role Pengguna</h3>
            <div class="card-tools">
                <a type="button" data-toggle="modal" class="btn btn-primary btn-xs btn-flat" href="#createRole"><i class="fa fa-plus"></i> Tambah</a>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Nama Peran</th>
                            <th>SK Penugasan</th>
                            <th>Tgl SK Penugasan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($role as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->peran->nm_peran ?? '-'}}</td>
                            <td>{{$item->sk_penugasan ?? '-'}}</td>
                            <td>{{$item->tgl_sk_penugasan ?? '-'}}</td>
                            <td>{{($item->approval_peran==1)?'Aktif':'Tidak Aktif'}}</td>
                            <td>
                                <a type="button" data-toggle="modal" class="btn btn-primary btn-xs" href="#editRole{{$item->id_role_pengguna}}"><i class="fa fa-edit"></i></a>
                                <a type="button" data-toggle="modal" class="btn btn-danger btn-xs" href="#deleteRole{{$item->id_role_pengguna}}"><i class="fas fa-trash-alt"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal fade" id="editUser" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Edit </span> 
                        <span class="fw-light">
                            Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('user.update', [Crypt::encrypt($data->id_pengguna)])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Pengguna</label>
                                    <input class="form-control" name="nm_pengguna" type="text" placeholder="Masukkan Nama Pengguna" value="{{$data->nm_pengguna}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Username (<i>Email</i>)</label>
                                    <input class="form-control" name="username" type="email" placeholder="Masukkan Username" value="{{$data->username}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Alamat</label>
                                    <textarea class="form-control" name="alamat" required>{{$data->alamat}}</textarea>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Tempat Lahir</label>
                                    <input class="form-control" name="tempat_lahir" type="text" placeholder="Masukkan Tempat Lahir" value="{{$data->tempat_lahir}}">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Tanggal Lahir</label>
                                    <input class="form-control" name="tgl_lahir" type="date" placeholder="Masukkan Tanggal Lahir" value="{{$data->tgl_lahir}}">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Jenis Kelamin</label>
                                    <select name="jenis_kelamin" class="form-control" required>
                                        <option value="L" {{($data->jenis_kelamin=='L')?'selected':''}}>Laki-laki</option>
                                        <option value="P" {{($data->jenis_kelamin=='P')?'selected':''}}>Perempuan</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Jabatan</label>
                                    <input class="form-control" name="jabatan" type="text" placeholder="Masukkan Jabatan" value="{{$data->jabatan}}">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nomor Telepon</label>
                                    <input class="form-control" name="no_tel" type="number" placeholder="Masukkan Nomor Telepon" value="{{$data->no_tel}}">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nomor HP</label>
                                    <input class="form-control" name="no_hp" type="number" placeholder="Masukkan Nomor HP" value="{{$data->no_hp}}">
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

    <div class="modal fade" id="createRole" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah </span> 
                        <span class="fw-light">
                            Role Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('role.store')}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <input type="hidden" name="id_pengguna" value="{{$data->id_pengguna}}">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Peran</label>
                                    <select class="form-control select2" name="id_peran[]" data-placeholder="Pilih" multiple required>
                                        @foreach($peran as $item)
                                        <option value="{{$item->id_peran}}">{{$item->nm_peran}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Unit Organisasi</label>
                                    <select class="form-control select2" name="id_organisasi" required>
                                        <option selected disabled>Pilih</option>
                                        @foreach($unit as $item)
                                        <option value="{{$item->id_organisasi}}">{{$item->nm_lemb}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>SK Penugasan</label>
                                    <input name="sk_penugasan" type="text" class="form-control" placeholder="Masukkan SK Penugasan">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Tgl SK Penugasan</label>
                                    <input name="tgl_sk_penugasan" type="date" class="form-control" placeholder="Masukkan Tgl SK Penugasan">
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

    @foreach($role as $items)
    <div class="modal fade" id="editRole{{$items->id_role_pengguna}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah </span> 
                        <span class="fw-light">
                            Role Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('role.update', [Crypt::encrypt($items->id_role_pengguna)])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <input type="hidden" name="id_pengguna" value="{{$data->id_pengguna}}">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Peran</label>
                                    <select class="form-control select2" name="id_peran" required>
                                        <option selected disabled>Pilih</option>
                                        @foreach($peran as $item)
                                        <option value="{{$item->id_peran}}" {{($items->id_peran==$item->id_peran)?'selected':''}}>{{$item->nm_peran}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Unit Organisasi</label>
                                    <select class="form-control select2" name="id_organisasi" required>
                                        <option selected disabled>Pilih</option>
                                        @foreach($unit as $item)
                                        <option value="{{$item->id_organisasi}}" {{($items->id_organisasi==$item->id_organisasi)?'selected':''}}>{{$item->nm_lemb}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>SK Penugasan</label>
                                    <input name="sk_penugasan" type="text" class="form-control" placeholder="Masukkan SK Penugasan" value="{{$items->sk_penugasan}}">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Tgl SK Penugasan</label>
                                    <input name="tgl_sk_penugasan" type="date" class="form-control" placeholder="Masukkan Tgl SK Penugasan" value="{{$items->tgl_sk_penugasan}}">
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

    @foreach($role as $items)
    <div class="modal fade" id="deleteRole{{$items->id_role_pengguna}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Delete </span> 
                        <span class="fw-light">
                            Role Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('role.destroy', [Crypt::encrypt($items->id_role_pengguna)])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                Yakin ingin menghapus peran <strong>{{$items->peran->nm_peran}}</strong> atas nama <strong>{{$data->nm_pengguna}}</strong> ?
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="button" class="btn btn-link" data-dismiss="modal">Tutup</button>
                            <button type="submit" class="btn btn-danger">Hapus</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    @endforeach

@endsection