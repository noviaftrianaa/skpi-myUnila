@extends('template.default.app')
@section('title','Data Aplikasi')
@extends('__partial.datatable')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Data Aplikasi</h3>
            <div class="card-tools">
                <a class="btn btn-primary btn-sm btn-flat" href="{{route('aplikasi.create')}}"><i class="fa fa-plus"></i> Tambah</a>
            </div>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Nama Aplikasi</th>
                        <th>Nama Organisasi</th>
                        <th>URL</th>
                        <th>Last Sync</th>
                        <th>Menu</th>
                        <th>PJ Aplikasi</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>0</td>
                            <td>SIRANDU</td>
                            <td>UPT TIK Universitas Lampung</td>
                            <td>http://sirandu.unila.ac.id</td>
                            <td>Date</td>
                            <td>
                                <a class="btn btn-outline-warning btn-xs" title="Create Menu" href="{{ route('aplikasi.create_menu') }}"> <i class="fas fa-plus"></i> Menu</a>
                                <ul class="mt-2">
                                    <li>Menu 1</li>
                                    <li>Menu 2</li>
                                    <li>Menu 3</li>
                                </ul>
                            </td>
                            <td>
                                <button class="btn btn-outline-warning btn-xs" title="Create PJ Aplikasi" data-toggle="modal" data-target="#pjItem"> <i class="fas fa-plus"></i> PJ</button>
                                <ul class="mt-2">
                                    <li>PJ 1</li>
                                    <li>PJ 2</li>
                                </ul>
                            </td>
                            <td>
                                <a class="btn btn-outline-info btn-xs" title="Edit" href="#"> <i class="fas fa-edit"></i></a>
                                <a class="btn btn-outline-danger btn-xs" title="Delete" href="#"> <i class="fas fa-trash-alt"></i></a>
                            </td>
                        </tr>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->nm_aplikasi}}</td>
                            <td>{{$item->unit_organisasi->nm_lemb}}</td>
                            <td>{{$item->url}}</td>
                            <td>{{$item->last_sync}}</td>
                            <td>
                                <a class="btn btn-outline-warning btn-xs" title="Create Menu" href="{{ route('aplikasi.create_menu') }}"> <i class="fas fa-plus"></i> Menu</a>
                            </td>
                            <td>
                                <button class="btn btn-outline-warning btn-xs" title="Create PJ Aplikasi" data-toggle="modal" data-target="#pjItem{{$item->id_aplikasi}}"> <i class="fas fa-plus"></i> PJ</button>
                                <ul class="mt-2">
                                    <li>PJ 1</li>
                                    <li>PJ 2</li>
                                </ul>
                            </td>
                            <td>
                                <a class="btn btn-outline-info btn-xs" title="Edit" href="{{ route('aplikasi.edit', [Crypt::encrypt($item->id_aplikasi)]) }}"> <i class="fas fa-edit"></i></a>
                                <a class="btn btn-outline-danger btn-xs" title="Delete" href="#"> <i class="fas fa-trash-alt"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal fade" id="pjItem" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah</span> 
                        <span class="fw-light">
                            PJ
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="#" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama PJ</label>
                                    <select name="nm_pj" class="form-control select2" data-placeholder="Pilih" required>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Email</label>
                                    <input name="email" type="email" class="form-control" placeholder="Masukkan Email" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Masih Aktif ?</label>
                                    <select name="a_masih" class="form-control" required>
                                        <option value="0">Tidak Aktif</option>
                                        <option value="1">Aktif</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Waktu Selesai</label>
                                    <input name="wkt_selesai" type="date" class="form-control" required>
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