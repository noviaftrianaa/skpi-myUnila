@extends('template.default.app')
@section('title','Ubah Password Pengguna')
@extends('__partial.datatable')

@section('content')

    <form action="{{ url('changePassword') }}" method="post" enctype="multipart/form-data">
        <input type="hidden" name="_token" value="{{ csrf_token() }}">
        <input type="hidden" name="_method" value="PUT">

        <div class="card card-info">
            <div class="card-header">
                <h3 class="card-title mt-1"><i class="fa fa-list"></i> Ubah Password Pengguna</h3>
            </div><!-- /.card-header -->
            <div class="card-body">
                <!-- FORM CREATE APLIKASI -->
                <div class="row">
                    <div class="col-12">
                        <div class="form-group form-group-default">
                            <label>Password Lama</label>
                            <input class="form-control" name="old_password" type="password" placeholder="Masukkan Password Lama" required>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="form-group form-group-default">
                            <label>Password Baru</label>
                            <input class="form-control" name="password" type="password" placeholder="Masukkan Password Baru" required>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="form-group form-group-default">
                            <label>Ulangi Password Baru</label>
                            <input class="form-control" name="confirm_password" type="password" placeholder="Masukkan Password Baru Lagi" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                    </div>
                </div>
            </div>
        </div>
    </form>

@endsection