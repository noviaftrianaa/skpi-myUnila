@extends('template.default.app')
@section('title','Data Pengguna')
@extends('__partial.datatable')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Data Pengguna</h3>
            <div class="card-tools">
                <a class="btn btn-secondary btn-xs btn-flat" href="{{route('user.create')}}"><i class="fa fa-edit"></i> Edit</a>
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
                        {!! tablerow('Jenis Kelamin', ($data->jenis_kelamin=="l") ? "Laki-laki" : "Perempuan") !!}
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
    
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Role Pengguna</h3>
            <div class="card-tools">
                <a class="btn btn-secondary btn-xs btn-flat" href="{{route('user.create')}}"><i class="fa fa-edit"></i> Edit</a>
            </div>
        </div>
        <div class="card-body" style="margin: 0;padding: 0">
            <div class="table-responsive">
                <table class="table table-striped">
                    <tbody>
                        {!! tablerow('Unit Organisasi','') !!}
                        {!! tablerow('Peran','') !!}
                        {!! tablerow('SK Penugasan','') !!}
                        {!! tablerow('Tgl SK Penugasan','') !!}
                        {!! tablerow('Tgl Kadaluarsa','') !!}
                        {!! tablerow('Approval Pengguna ?','') !!}
                    </tbody>
                </table>
            </div>
        </div>
    </div>

@endsection