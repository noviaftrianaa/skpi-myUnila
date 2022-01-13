@extends('template.default.app')
@section('title','Data Pengguna')
@extends('__partial.datatable')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Data Pengguna</h3>
            <div class="card-tools">
                <a class="btn btn-primary btn-sm btn-flat" href="{{route('user.create')}}"><i class="fa fa-plus"></i> Tambah</a>
            </div>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Nama</th>
                        <th>Username (<i>Email</i>)</th>
                        <th>Jenis Kelamin</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($user as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->nm_pengguna}}</td>
                            <td>{{$item->username}}</td>
                            <td>{{($item->jenis_kelamin=="L")?'Laki-laki':'Perempuan'}}</td>
                            <td>
                                @if($item->a_aktif==1)
                                <a data-toggle="modal" href="#changeItem{{$item->id_pengguna}}" type="button" class="btn btn-success btn-xs">Aktif</a>
                                @else
                                <a data-toggle="modal" href="#changeItem{{$item->id_pengguna}}" type="button" class="btn btn-danger btn-xs">Tidak Aktif</a>
                                @endif
                            </td>
                            <td>
                                <a class="btn btn-outline-warning btn-xs" title="Reset" data-toggle="modal" href="#resetItem{{$item->id_pengguna}}"> <i class="fas fa-key"></i></a>
                                <a class="btn btn-outline-primary btn-xs" title="Show User" href="{{ route('user.detail', [Crypt::encrypt($item->id_pengguna)]) }}"> <i class="fas fa-eye"></i></a>
                                <a class="btn btn-outline-danger btn-xs" title="Delete" data-toggle="modal" href="#deleteItem{{$item->id_pengguna}}"> <i class="fas fa-trash-alt"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    @foreach($user as $items)
    <div class="modal fade" id="resetItem{{$items->id_pengguna}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Reset </span> 
                        <span class="fw-light">
                            Password Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('user.reset', [Crypt::encrypt($items->id_pengguna)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <p>Apakah yakin ingin mereset password atas nama <b>{{$items->nm_pengguna}}</b> menjadi "<strong>12345678</strong>" ?</p>
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

    @foreach($user as $items)
    <div class="modal fade" id="changeItem{{$items->id_pengguna}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Ubah Status </span> 
                        <span class="fw-light">
                            Aktif Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('user.edit', [Crypt::encrypt($items->id_pengguna)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <p>Apakah yakin ingin {{($items->a_aktif==1)?'menonaktifkan':'mengaktifkan kembali'}} pengguna atas nama <b>{{$items->nm_pengguna}}</b> ?</p>
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

    @foreach($user as $items)
    <div class="modal fade" id="deleteItem{{$items->id_pengguna}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Ubah Status </span> 
                        <span class="fw-light">
                            Aktif Pengguna
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('user.destroy', [Crypt::encrypt($items->id_pengguna)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                <p>Apakah yakin ingin menghapus pengguna atas nama <b>{{$items->nm_pengguna}}</b> ?</p>
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

@endsection