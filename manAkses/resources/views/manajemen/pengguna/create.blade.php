@extends('template.default.app')
@section('title','Tambah Pengguna')
@extends('__partial.datatable')

@section('content')

    <form action="{{ route('user.store') }}" method="post" enctype="multipart/form-data">
        <input type="hidden" name="_token" value="{{ csrf_token() }}">
        <input type="hidden" name="_method" value="PUT">

        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fa fa-list"></i> Tambah Pengguna</h3>
            </div><!-- /.card-header -->
            <div class="card-body">
                <!-- FORM CREATE APLIKASI -->
                <div class="row">
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Nama Pengguna</label>
                            <input class="form-control" name="nama" type="text" placeholder="Masukkan Nama Pengguna" required>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Username</label>
                            <input class="form-control" name="username" type="email" placeholder="Masukkan Username" required>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Password</label>
                            <input class="form-control" name="password" type="password" placeholder="Masukkan Password" required>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Alamat</label>
                            <textarea class="form-control" name="alamat" required></textarea>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Tempat Lahir</label>
                            <input class="form-control" name="tempat_lahir" type="text" placeholder="Masukkan Tempat Lahir">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Tanggal Lahir</label>
                            <input class="form-control" name="tanggal_lahir" type="date" placeholder="Masukkan Tanggal Lahir">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Jenis Kelamin</label>
                            <select name="jenis_kelamin" class="form-control" required>
                                <option selected disabled>Pilih</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Jabatan</label>
                            <select name="jabatan" class="form-control" required>
                                <option selected disabled>Pilih</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Nomor Telepon</label>
                            <input class="form-control" name="no_telp" type="number" placeholder="Masukkan Nomor Telepon">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Nomor HP</label>
                            <input class="form-control" name="no_hp" type="number" placeholder="Masukkan Nomor HP">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Approval Pengguna ?</label>
                            <select name="approval_pengguna" class="form-control" required>
                                <option value="0">Tidak Aktif</option>
                                <option value="1">Aktif</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Apakah Aktif ?</label>
                            <select name="a_aktif" class="form-control" required>
                                <option value="0">Tidak Aktif</option>
                                <option value="1">Aktif</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Disable ?</label>
                            <select name="disable" class="form-control" required>
                                <option value="0">Tidak Aktif</option>
                                <option value="1">Aktif</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fa fa-list"></i> Role Pengguna</h3>
            </div><!-- /.card-header -->
            <div class="card-body">
                <!-- FORM CREATE APLIKASI -->
                <div class="row">
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Unit Organisasi</label>
                            <select name="unit" class="form-control" required>
                                <option selected disabled>Pilih</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Peran</label>
                            <select name="peran" class="form-control" required>
                                <option selected disabled>Pilih</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Approval Pengguna</label>
                            <select name="role_approval_pengguna" class="form-control" required>
                                <option value="0">Tidak Aktif</option>
                                <option value="1">Aktif</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>SK Penugasan</label>
                            <input class="form-control" name="sk_penugasan" type="file" placeholder="Masukkan SK Penugasan">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Tanggal SK Penugasan</label>
                            <input class="form-control" name="tgl_sk_penugasan" type="date" placeholder="Masukkan Tanggal SK Penugasan">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Tanggal Kadaluarsa</label>
                            <input class="form-control" name="tgl_kadaluarsa" type="date" placeholder="Masukkan Tanggal Kadaluarsa">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <div class="modal-footer">
            <a type="button" class="btn btn-link" href="{{route('user.index')}}">Kembali</a>
            <button type="submit" class="btn btn-primary">Simpan</button>
        </div>
    </form>

@endsection