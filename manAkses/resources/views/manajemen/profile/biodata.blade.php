@extends('template.default.app')
@section('title','Biodata')

@section('content')

    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-user"></i>&nbsp;&nbsp;Biodata</h3>
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
                        {!! tablerow('Terakhir Update', TglWaktuIndonesia($data->last_update)) !!}
                    </tbody>
                </table>
            </div>
            <div class="d-lg-flex d-block px-3 mb-3">
                <a data-toggle="modal" class="btn btn-info col-12" href="#editUser"><i class="fa fa-edit"></i> Edit</a>
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
                                    <input class="form-control" name="username" type="email" placeholder="Masukkan Username" value="{{$data->username}}" disabled>
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

@endsection