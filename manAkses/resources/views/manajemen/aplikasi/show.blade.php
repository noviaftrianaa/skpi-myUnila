@extends('template.default.app')
@section('title','Aplikasi '.$data->nm_aplikasi)
@extends('__partial.datatable')
@extends('__partial.datatable2')

@section('content')

    @include('error.list')

    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list"></i> Data Aplikasi</h3>
            <div class="card-tools">
                <a type="button" class="btn btn-primary btn-xs " href="{{ route('aplikasi.table', [Crypt::encrypt($data->id_aplikasi)]) }}"><i class="fas fa-table"></i> Table Aplikasi</a>
                <a type="button" data-toggle="modal" class="btn btn-secondary btn-xs " href="#editAplikasi{{$data->id_aplikasi}}"><i class="fa fa-edit"></i> Edit</a>
            </div>
        </div><!-- /.card-header -->
        <div class="card-body" style="margin: 0;padding: 0">
            <div class="row">
            <div class="col-md-2 col-12 p-3">
                <img src="{!! (!is_null($data->largeobject)) ? 'data:image/' . $data->largeobject->mime_type . ';base64,' . $data->largeobject->blob_content : asset('auth/img/logo.png') !!}" class="img-fluid" />
            </div>
            <div class="col-md-10 col-12">
                <div class="table-responsive">
                    <table class="table table-striped">
                        <tbody>
                            {!! tablerow('Nama Aplikasi',$data->nm_aplikasi) !!}
                            {!! tablerow('Nama Unit Organisasi',$data->unitorganisasi->nm_lemb) !!}
                            {!! tablerow('Keterangan Aplikasi',$data->ket_aplikasi) !!}
                            {!! tablerow('URL','<a href="'.$data->url.'" target=new>'.$data->url.'</a>') !!}
                            {!! tablerow('Apakah Bisa Generate Menu ?',($data->a_generate_menu==1)?'Ya':'Tidak') !!}
                            {!! tablerow('Apakah Telah Ter-integrasi SSO ?',($data->a_integrasi_cas==1)?'Ya':'Tidak') !!}
                            {!! tablerow('Apakah Sistem Internal PT ?',($data->a_sistem_internal_pt==1)?'Ya':'Tidak') !!}
                            {!! tablerow('Tgl Buat', TglWaktuIndonesia($data->tgl_create)) ?? '-' !!}
                            {!! tablerow('Tgl Update', TglWaktuIndonesia($data->last_update)) ?? '-' !!}
                            {!! tablerow('Last Sync', TglWaktuIndonesia($data->last_sync)) ?? '-' !!}
                            {!! tablerow('Tgl Expired', TglWaktuIndonesia($data->expired_date)) ?? '-' !!}
                        </tbody>
                    </table>
                </div>
            </div></div>
        </div>
    </div>
    
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list"></i> PJ Aplikasi</h3>
            <div class="card-tools">
                <a type="button" data-toggle="modal" class="btn btn-default btn-xs text-dark" href="#pjCreate"><i class="fa fa-plus"></i> Tambah</a>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>No. HP</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($pj as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->nm_pj}}</td>
                            <td>{{$item->email}}</td>
                            <td>{{$item->no_hp}}</td>
                            <td>
                                <a type="button" data-toggle="modal" class="btn btn-primary btn-xs" href="#editPJ{{$item->id_pj_aplikasi}}"><i class="fa fa-edit"></i></a>
                                <a type="button" data-toggle="modal" class="btn btn-danger btn-xs" href="#deletePJ{{$item->id_pj_aplikasi}}"><i class="fas fa-trash-alt"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    @if($data->a_generate_menu==1)
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list"></i> Menu Aplikasi</h3>
            <div class="card-tools">
                <a type="button" data-toggle="modal" class="btn btn-default btn-xs text-dark" href="#createMenu"><i class="fa fa-plus"></i> Tambah</a>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data-2" style="width: 100% !important">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Nama Menu</th>
                            <th>Nama File</th>
                            <th>Urutan</th>
                            <th>ID Group Menu</th>
                            <th>Apakah Aktif ?</th>
                            <th>Apakah Tampil ?</th>
                            <th>Last Sync</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($menu as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->nm_menu}}</td>
                            <td>{{$item->nm_file}}</td>
                            <td>{{$item->urutan_menu}}</td>
                            <td>{{$item->id_group_menu}}</td>
                            <td>{{($item->a_aktif==1)?'Ya':'Tidak'}}</td>
                            <td>{{($item->a_tampil==1)?'Ya':'Tidak'}}</td>
                            <td>{{TglWaktuIndonesia($data->last_sync) ?? '-'}}</td>
                            <td>
                                <a type="button" data-toggle="modal" class="btn btn-primary btn-xs" href="#editMenu{{$item->id_menu}}"><i class="fa fa-edit"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    @endif

    <div class="modal fade" id="editAplikasi{{$data->id_aplikasi}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Edit </span> 
                        <span class="fw-light">
                            Aplikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('aplikasi.update', [Crypt::encrypt($data->id_aplikasi)])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Unit Organisasi</label>
                                    @php
                                    $unit = DB::SELECT("
                                            SELECT *
                                            FROM man_akses.unit_organisasi WITH (NOLOCK)
                                    ");
                                    @endphp
                                    <select name="id_organisasi" class="form-control select2" required>
                                        <option selected disabled>Pilih</option>
                                        @foreach($unit as $item)
                                        <option value="{{$item->id_organisasi}}" {{($data->id_organisasi==$item->id_organisasi)?'selected':''}}>{{$item->nm_lemb}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Aplikasi</label>
                                    <input name="nm_aplikasi" type="text" class="form-control" placeholder="Masukkan Nama Aplikasi" value="{{$data->nm_aplikasi}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Keterangan</label>
                                    <textarea class="form-control" name="ket_aplikasi" required>{{ $data->ket_aplikasi }}</textarea>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>URL</label>
                                    <div class="input-group">
                                        <input name="url" type="text" class="form-control" placeholder="http://" value="{{$data->url}}" required>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Icon</label>
                                    <div class="input-group">
                                        <input name="file" type="file" class="form-control">
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-12 col-12">
                                <div class="form-group form-group-default">
                                    <label>Option<sup style="color:red">*</sup> :</label><br>
                                    <input type="checkbox" id="a_generate_menu" name="a_generate_menu" {{($data->a_generate_menu==1)?'checked':''}}>
                                    <label for="a_generate_menu">&nbsp;&nbsp;Apakah Bisa Generate Menu ?</label><br>
                                    <input type="checkbox" id="a_integrasi_cas" name="a_integrasi_cas" {{($data->a_integrasi_cas==1)?'checked':''}}>
                                    <label for="a_integrasi_cas">&nbsp;&nbsp;Apakah Telah Ter-integrasi SSO ?</label><br>
                                    <input type="checkbox" id="a_sistem_internal_pt" name="a_sistem_internal_pt" {{($data->a_sistem_internal_pt==1)?'checked':''}}>
                                    <label for="a_sistem_internal_pt">&nbsp;&nbsp;Apakah Sistem Internal PT ?</label>
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

    <div class="modal fade" id="pjCreate" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah </span> 
                        <span class="fw-light">
                            PJ APlikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('pj_aplikasi.store')}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <input type="hidden" name="id_aplikasi" value="{{$data->id_aplikasi}}">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Select</label>
                                    <select id="code" class="form-control">
                                        <option selected disabled>Select</option>
                                        <option value="0">New</option>
                                        <option value="1">Existing</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row" id="existingPJ">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Pengguna</label>
                                    @php
                                    $pengguna = DB::SELECT("
                                            SELECT *
                                            FROM man_akses.pengguna WITH (NOLOCK)
                                            WHERE soft_delete=0 AND a_aktif=1
                                    ");
                                    @endphp
                                    <select name="id_pengguna[]" id="id_pengguna" class="form-control select2" data-placeholder="Pilih" multiple>
                                    @foreach($pengguna as $value)
                                    <option value="{{$value->id_pengguna}}">{{$value->nm_pengguna}}</option>
                                    @endforeach
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row" id="newPJ">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama PJ</label>
                                    <input name="nm_pj" id="nm_pj" type="text" class="form-control" placeholder="Masukkan Nama PJ">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Username</label>
                                    <input name="username" id="username" type="text" class="form-control" placeholder="Masukkan Username tanpa spasi">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Jenis Kelamin</label>
                                    <select name="jenis_kelamin" id="jenis_kelamin" class="form-control">
                                        <option selected disabled>Pilih</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>No. HP</label>
                                    <input name="no_hp" id="no_hp" type="number" class="form-control" placeholder="Masukkan Nomor HP">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Email</label>
                                    <input name="email" id="email" type="email" class="form-control" placeholder="Masukkan Email">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Jabatan</label>
                                    <input name="jabatan_pj" id="jabatan_pj" type="text" class="form-control" placeholder="Masukkan Jabatan" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
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
                        <div class="modal-footer no-bd">
                            <button type="submit" class="btn btn-primary">Simpan</button>
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Tutup</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    @foreach($pj as $items)
    <div class="modal fade" id="editPJ{{$items->id_pj_aplikasi}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Edit </span> 
                        <span class="fw-light">
                            PJ Aplikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('pj_aplikasi.update', [Crypt::encrypt($items->id_pj_aplikasi)])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama PJ</label>
                                    @php
                                    $pengguna = DB::SELECT("
                                            SELECT *
                                            FROM man_akses.pengguna WITH (NOLOCK)
                                            WHERE soft_delete=0 AND a_aktif=1
                                    ");
                                    @endphp
                                    <select class="form-control select2" name="id_pengguna" required>
                                    @foreach($pengguna as $value)
                                    <option value="{{$value->id_pengguna}}" {{($value->id_pengguna==$items->id_pengguna)?'selected':''}}>{{$value->nm_pengguna}}</option>
                                    @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Masih ?</label>
                                    <select class="form-control" name="a_masih" required>
                                        <option value="0" {{($items->a_masih==0)?'selected':''}}>Tidak</option>
                                        <option value="1" {{($items->a_masih==1)?'selected':''}}>Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Waktu Selesai</label>
                                    <input name="wkt_selesai" type="date" class="form-control" value="{{$items->wkt_selesai}}">
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

    @foreach($pj as $items)
    <div class="modal fade" id="deletePJ{{$items->id_pj_aplikasi}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Delete </span> 
                        <span class="fw-light">
                            PJ Aplikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('pj_aplikasi.destroy', [Crypt::encrypt($items->id_pj_aplikasi)])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                Yakin ingin menghapus PJ atas nama <strong>{{$items->nm_pj}}</strong> dari {{$data->nm_aplikasi}} ?
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

    <div class="modal fade" id="createMenu" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah </span> 
                        <span class="fw-light">
                            Menu
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('menu.store')}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <input type="hidden" name="id_aplikasi" value="{{$data->id_aplikasi}}">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Menu</label>
                                    <input name="nm_menu" type="text" class="form-control" placeholder="Masukkan Nama Menu" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama File</label>
                                    <input name="nm_file" type="text" class="form-control" placeholder="Masukkan Nama File" required>
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
                                    <label>Group Menu</label>
                                    <select name="id_group_menu" class="form-control">
                                        <option selected disabled>Pilih</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Aktif ?</label>
                                    <select class="form-control" name="a_aktif" required>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Tampil ?</label>
                                    <select class="form-control" name="a_tampil" required>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12 col-12">
                                <div class="form-group form-group-default">
                                    <label>Peran</label>
                                    @php
                                    $peran = DB::SELECT("
                                            SELECT *
                                            FROM man_akses.peran WITH (NOLOCK)
                                            WHERE expired_date=NULL
                                    ");
                                    @endphp
                                    <select class="form-control select2" name="id_peran[]" data-placeholder="Pilih" multiple required>
                                        @foreach($peran as $item)
                                        <option value="{{$item->id_peran}}">{{$item->nm_peran}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Bisa:</label><br>
                                    <input type="checkbox" id="a_boleh_insert" name="a_boleh_insert">
                                    <label for="a_boleh_insert"> Insert</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_show" name="a_boleh_show">
                                    <label for="a_boleh_show"> Show</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_delete" name="a_boleh_delete">
                                    <label for="a_boleh_delete"> Delete</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_update" name="a_boleh_update">
                                    <label for="a_boleh_update"> Update</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_sanggah" name="a_boleh_sanggah">
                                    <label for="a_boleh_sanggah"> Sanggah</label>
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

    @foreach($menu as $items)
    <div class="modal fade" id="editMenu{{$items->id_menu}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Edit </span> 
                        <span class="fw-light">
                            Menu
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('menu.update', [Crypt::encrypt($items->id_menu)])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Menu</label>
                                    <input name="nm_menu" type="text" class="form-control" placeholder="Masukkan Nama Menu" value="{{$items->nm_menu}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama File</label>
                                    <input name="nm_file" type="text" class="form-control" placeholder="Masukkan Nama File" value="{{$items->nm_file}}" required>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Urutan Menu</label>
                                    <input name="urutan_menu" type="number" class="form-control" placeholder="Masukkan Urutan Menu" value="{{$items->urutan_menu}}" required>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Group Menu</label>
                                    <select name="id_group_menu" class="form-control">
                                        <option selected disabled>Pilih</option>
                                        @foreach($menu as $value)
                                        <option value="{{$value->id_menu}}" {{($items->id_group_menu==$value->id_menu)?'selected':''}}>{{$items->nm_menu}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Aktif ?</label>
                                    <select class="form-control" name="a_aktif" required>
                                        <option value="0" {{($items->a_aktif==0)?'selected':''}}>Tidak</option>
                                        <option value="1" {{($items->a_aktif==1)?'selected':''}}>Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Tampil ?</label>
                                    <select class="form-control" name="a_tampil" required>
                                        <option value="0" {{($items->a_tampil==0)?'selected':''}}>Tidak</option>
                                        <option value="1" {{($items->a_tampil==1)?'selected':''}}>Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12 col-12">
                                <div class="form-group form-group-default">
                                    <label>Peran</label>
                                    @php
                                    $peran = DB::SELECT("
                                            SELECT *
                                            FROM man_akses.peran WITH (NOLOCK)
                                            WHERE expired_date=NULL
                                    ");
                                    @endphp
                                    <select class="form-control select2" name="id_peran[]" data-placeholder="Pilih" multiple required>
                                        @foreach($peran as $item)
                                            <?php
                                                $checkRole = DB::table('man_akses.menu_role')->where('id_menu', $items->id_menu)->where('soft_delete',0)->get()->toArray();
                                            ?>
                                            <option value="{{$item->id_peran}}" {{(in_array($item->id_peran, array_column($checkRole, "id_peran"))==true)?'selected':''}}>{{$item->nm_peran}}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12 col-12">
                                <div class="form-group form-group-default">
                                    <?php $menurole = DB::table('man_akses.menu_role')->where('id_menu', $items->id_menu)->first(); ?>
                                    <label>Apakah Bisa:</label><br>
                                    <input type="checkbox" id="a_boleh_insert" name="a_boleh_insert" {{(!empty($menurole->a_boleh_insert)&&$menurole->a_boleh_insert==1)?'checked':''}}>
                                    <label for="a_boleh_insert"> Insert</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_show" name="a_boleh_show" {{(!empty($menurole->a_boleh_show)&&$menurole->a_boleh_show==1)?'checked':''}}>
                                    <label for="a_boleh_show"> Show</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_delete" name="a_boleh_delete" {{(!empty($menurole->a_boleh_delete)&&$menurole->a_boleh_delete==1)?'checked':''}}>
                                    <label for="a_boleh_delete"> Delete</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_update" name="a_boleh_update" {{(!empty($menurole->a_boleh_update)&&$menurole->a_boleh_update==1)?'checked':''}}>
                                    <label for="a_boleh_update"> Update</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_sanggah" name="a_boleh_sanggah" {{(!empty($menurole->a_boleh_sanggah)&&$menurole->a_boleh_sanggah==1)?'checked':''}}>
                                    <label for="a_boleh_sanggah"> Sanggah</label>
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

    @push('js')
    <script>
        $(document).ready( function () {
            $('#newPJ').hide();
            $('#existingPJ').hide();
            $('#code').on('change', function() {
                if(this.value==0) {
                    $('#existingPJ').hide();
                    $('#id_pengguna').val(null).trigger("change");
                    $('#id_pengguna').removeAttr('required', '');
                    $('#newPJ').show();
                    $('#nm_pj').attr('required', '');
                    $('#username').attr('required', '');
                    $('#jenis_kelamin').attr('required', ''); 
                    $('#no_hp').attr('required', '');
                    $('#email').attr('required', '');
                } else {
                    $('#newPJ').hide();
                    $('#existingPJ').show();
                    $('#id_pengguna').attr('required', '');
                    $('#nm_pj').removeAttr('required', '');
                    $('#jenis_kelamin').removeAttr('required', '');
                    $('#username').removeAttr('required', '');
                    $('#nm_pj').val(null);
                    $('#jenis_kelamin').val(null);
                    $('#username').val(null);
                    $('#no_hp').removeAttr('required', '');
                    $('#email').removeAttr('required', '');
                    $('#no_hp').val(null);
                    $('#email').val(null);
                }
            });
        });
    </script>
    @endpush
@endsection