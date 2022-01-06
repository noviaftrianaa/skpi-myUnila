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
                                <a class="btn btn-outline-warning btn-xs" title="Edit" href="#"> <i class="fas fa-plus"></i> Menu</a>
                                <ul class="mt-2">
                                    <li>Menu 1</li>
                                    <li>Menu 2</li>
                                    <li>Menu 3</li>
                                </ul>
                            </td>
                            <td>
                                <a class="btn btn-outline-info btn-xs" title="Edit" href="#"> <i class="fas fa-edit"></i></a>
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
                                <a class="btn btn-outline-warning btn-xs" title="Edit" href="{{ route('aplikasi.create_menu', [Crypt::encrypt($item->id_aplikasi)]) }}"> <i class="fas fa-plus"></i> Menu</a>
                            </td>
                            <td>
                                <a class="btn btn-outline-info btn-xs" title="Edit" href="{{ route('aplikasi.edit', [Crypt::encrypt($item->id_aplikasi)]) }}"> <i class="fas fa-edit"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

@endsection