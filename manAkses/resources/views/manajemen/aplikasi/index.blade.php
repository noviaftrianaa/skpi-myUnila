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
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->nm_aplikasi}}</td>
                            <td>{{$item->unitorganisasi->nm_lemb}}</td>
                            <td>{{$item->url}}</td>
                            <td>{{$item->last_sync}}</td>
                            <td>
                                <a class="btn btn-outline-info btn-xs" title="Show" href="{{ route('aplikasi.show', [Crypt::encrypt($item->id_aplikasi)]) }}"> <i class="fas fa-eye"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

@endsection