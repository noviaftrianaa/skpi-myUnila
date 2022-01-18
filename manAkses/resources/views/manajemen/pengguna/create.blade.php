@extends('template.default.app')
@section('title','Tambah Pengguna')
@extends('__partial.datatable')

@section('content')

    <form action="{{ route('user.store') }}" method="post" enctype="multipart/form-data">
        <input type="hidden" name="_token" value="{{ csrf_token() }}">
        <input type="hidden" name="_method" value="PUT">

        <div class="card card-info">
            <div class="card-header">
                <h3 class="card-title"><i class="fa fa-list"></i> Tambah Pengguna</h3>
            </div><!-- /.card-header -->
            <div class="card-body">
                <!-- FORM CREATE APLIKASI -->
                <div class="row">
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Nama Pengguna</label>
                            <input class="form-control" name="nm_pengguna" type="text" placeholder="Masukkan Nama Pengguna" required>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Username (<i>Email</i>)</label>
                            <input class="form-control" name="username" type="email" placeholder="Masukkan Username" required>
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
                            <input class="form-control" name="tgl_lahir" type="date" placeholder="Masukkan Tanggal Lahir">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Jenis Kelamin</label>
                            <select name="jenis_kelamin" class="form-control" required>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Jabatan</label>
                            <input class="form-control" name="jabatan" type="text" placeholder="Masukkan Jabatan">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Nomor Telepon</label>
                            <input class="form-control" name="no_tel" type="number" placeholder="Masukkan Nomor Telepon">
                        </div>
                    </div>
                    <div class="col-sm-4">
                        <div class="form-group form-group-default">
                            <label>Nomor HP</label>
                            <input class="form-control" name="no_hp" type="number" placeholder="Masukkan Nomor HP">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card card-info">
            <div class="card-header">
                <h3 class="card-title"><i class="fa fa-list"></i> Role Pengguna</h3>
            </div><!-- /.card-header -->
            <div class="card-body">
                <!-- FORM CREATE APLIKASI -->
                <div class="row">
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Unit Organisasi</label>
                            <select name="id_organisasi" class="select2 form-control" data-placeholder="Pilih" required>
                                <option selected disabled>Pilih</option>
                                @foreach($unit as $item)
                                <option value="{{$item->id_organisasi}}">{{$item->nm_lemb}}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Peran</label>
                            <select name="id_peran[]" class="form-control select2" multiple="multiple" data-placeholder="Pilih" required>
                                @foreach($peran as $item)
                                <option value="{{$item->id_peran}}">{{$item->nm_peran}}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>SK Penugasan</label>
                            <input class="form-control" name="sk_penugasan" type="text" placeholder="Masukkan SK Penugasan">
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Tanggal SK Penugasan</label>
                            <input class="form-control" name="tgl_sk_penugasan" type="date" placeholder="Masukkan Tanggal SK Penugasan">
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