@extends('template.default.app')
@section('title','Tambah Aplikasi')
@extends('__partial.datatable')

@section('content')
    <!-- FORM CREATE APLIKASI -->
    <form action="{{ route('aplikasi.store') }}" method="post" enctype="multipart/form-data">
        <input type="hidden" name="_token" value="{{ csrf_token() }}">
        <input type="hidden" name="_method" value="PUT">

        <div class="card card-info">
            <div class="card-header">
                <h3 class="card-title"><i class="fa fa-list"></i> Tambah Aplikasi</h3>
            </div><!-- /.card-header -->
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Unit Organisasi</label>
                            <select name="id_organisasi" class="form-control select2" required>
                                <option selected disabled>Pilih</option>
                                @foreach($unit as $item)
                                <option value="{{$item->id_organisasi}}">{{$item->nm_lemb}}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Nama Aplikasi</label>
                            <input name="nm_aplikasi" type="text" class="form-control" placeholder="Masukkan Nama Aplikasi" required>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Keterangan</label>
                            <textarea class="form-control" name="ket_aplikasi" required></textarea>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>URL</label>
                            <div class="input-group">
                                <input name="url" type="text" class="form-control" placeholder="http://" required>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Apakah Bisa Generate Menu ?</label>
                            <select class="form-control" name="a_generate_menu" required>
                                <option value="0">Tidak</option>
                                <option value="1">Ya</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card card-info">
            <div class="card-header">
                <h3 class="card-title"><i class="fa fa-list"></i> Penanggung Jawab Aplikasi</h3>
            </div><!-- /.card-header -->
            <div class="card-body">
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Nama PJ</label>
                            <input name="nm_pj" type="text" class="form-control" placeholder="Masukkan Nama PJ" required>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Email</label>
                            <input name="username" type="email" class="form-control" placeholder="Masukkan Email" required>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Jenis Kelamin</label>
                            <select name="jenis_kelamin" class="form-control" required>
                                <option selected disabled>Pilih</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Jabatan</label>
                            <input name="jabatan_pj" type="text" class="form-control" placeholder="Masukkan Jabatan" required>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>No. HP</label>
                            <input name="no_hp" type="number" class="form-control" placeholder="Masukkan Nomor HP" required>
                        </div>
                    </div>
                    <div class="col-sm-6 col-12">
                        <div class="form-group form-group-default">
                            <label>Apakah Masih ?</label>
                            <select class="form-control" name="a_masih" required>
                                <option value="0">Tidak</option>
                                <option value="1">Ya</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-6 col-12">
                        <div class="form-group form-group-default">
                            <label>Waktu Selesai</label>
                            <input name="wkt_selesai" type="date" class="form-control">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <a type="button" class="btn btn-link" href="{{route('aplikasi.index')}}">Kembali</a>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
            </div>
        </div>

    </form>

@endsection