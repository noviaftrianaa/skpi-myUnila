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
                            <select class="form-control" name="unit">
                                <option selected disabled>Pilih</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Nama Aplikasi</label>
                            <input name="nama_aplikasi" type="text" class="form-control" placeholder="Masukkan Nama Aplikasi" required>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Keterangan</label>
                            <textarea class="form-control" name="keterangan" required></textarea>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>URL</label>
                            <input name="url" type="text" class="form-control" placeholder="Masukkan URL Aplikasi" required>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Apakah Bisa Generate Menu ?</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="generate">
                                <label class="form-check-label" for="flexRadioDefault1">
                                    Bisa
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="generate">
                                <label class="form-check-label" for="flexRadioDefault1">
                                    Tidak
                                </label>
                            </div>
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