@extends('template.default.app')
@section('title','Aplikasi ABCD')
@extends('__partial.datatable')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Aplikasi ABCD</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <!-- FORM CREATE APLIKASI -->
            <form action="{{ route('aplikasi.store') }}" method="post" enctype="multipart/form-data">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                <input type="hidden" name="_method" value="PUT">
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Nama Menu</label>
                            <input name="nama_menu" type="text" class="form-control" placeholder="Masukkan Nama Menu" required>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Nama File</label>
                            <input type="file" class="form-control" name="nama_file" required>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Urutan Menu</label>
                            <input name="urutan_menu" type="number" class="form-control" placeholder="Masukkan Urutan Menu" required>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Apakah Aktif ?</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="a_aktif">
                                <label class="form-check-label" for="flexRadioDefault1">
                                    Bisa
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="a_aktif">
                                <label class="form-check-label" for="flexRadioDefault1">
                                    Tidak
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Apakah Tampil ?</label>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="a_tampil">
                                <label class="form-check-label" for="flexRadioDefault1">
                                    Bisa
                                </label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="a_tampil">
                                <label class="form-check-label" for="flexRadioDefault1">
                                    Tidak
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Icon</label>
                            <input type="file" class="form-control" name="icon">
                        </div>
                    </div>
                    <div class="col-sm-6">
                        <div class="form-group form-group-default">
                            <label>Level Menu</label>
                            <input type="text" class="form-control" name="level_menu">
                        </div>
                    </div>
                </div>
                <div class="modal-footer no-bd">
                    <a type="button" class="btn btn-link" href="{{route('aplikasi.index')}}">Kembali</a>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
            </form>
        </div>
    </div>

@endsection