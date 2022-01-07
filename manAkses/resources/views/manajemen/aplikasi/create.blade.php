@extends('template.default.app')
@section('title','Tambah Aplikasi')
@extends('__partial.datatable')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Tambah Aplikasi</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <!-- FORM CREATE APLIKASI -->
            <form action="{{ route('aplikasi.store') }}" method="post" enctype="multipart/form-data">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                <input type="hidden" name="_method" value="PUT">
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Unit Organisasi</label>
                            <select name="id_organisasi" class="form-control select2" data-placeholder="Pilih" required>
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
                                <div class="input-group-prepend">
                                    <span class="input-group-text">http://</span>
                                </div>
                                <input name="url" type="text" class="form-control" placeholder="Masukkan URL Aplikasi" required>
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
                <div class="modal-footer">
                    <a type="button" class="btn btn-link" href="{{route('aplikasi.index')}}">Kembali</a>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
            </form>
        </div>
    </div>

@endsection