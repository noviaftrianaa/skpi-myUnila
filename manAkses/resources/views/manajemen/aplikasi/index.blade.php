@extends('template.default.app')
@section('title','Data Aplikasi')
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Aplikasi</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="d-lg-flex d-block">
                <div class="col-2">
                    @if(session()->get('login.role')->id_peran==1)
                    <a class="btn btn-info" href="{{route('aplikasi.create')}}"><i class="fa fa-plus"></i> Tambah Data</a>
                    @else
                    <a class="btn btn-info" href="{{ url('/api/live/0.1') }}" target="_blank"><i class="fa fa-connectdevelop"></i> Rest API</a>
                    @endif
                </div>
                <div class="ml-auto pr-2">
                    <div class="input-group">
                        <input type="text" id="search" placeholder="Pencarian" class="form-control">
                        <div class="input-group-append">
                            <button class="btn btn-info btn-sm" data-toggle="tooltip" data-placement="top" title="Cari">
                                <i class="fa fa-search search-icon"></i>
                            </button>
                        </div>
                    </div> 
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-bordered table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Nama Aplikasi</th>
                        <th>Nama Organisasi</th>
                        <th>URL</th>
                        <th>Expired Date</th>
                        <th>Last Sync</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    @if(session()->get('login.role')->id_peran==1)
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->nm_aplikasi}}</td>
                            <td>{{$item->unitorganisasi->nm_lemb}}</td>
                            <td>{{$item->url}}</td>
                            <td>{{TglWaktuIndonesia($item->expired_date)}}</td>
                            <td>{{TglWaktuIndonesia($item->last_sync)}}</td>
                            <td>
                                <a class="btn btn-info btn-xs" title="Show" href="{{ route('aplikasi.detail', [Crypt::encrypt($item->id_aplikasi)]) }}"> <i class="fas fa-eye"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                    @else
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->aplikasi->nm_aplikasi}}</td>
                            <td>{{$item->aplikasi->unitorganisasi->nm_lemb}}</td>
                            <td>{{$item->aplikasi->url}}</td>
                            <td>{{TglWaktuIndonesia($item->aplikasi->expired_date)}}</td>
                            <td>{{TglWaktuIndonesia($item->aplikasi->last_sync)}}</td>
                            <td>
                                <a class="btn btn-info btn-xs" title="Show" href="{{ route('manajemen.aplikasi.detail', [Crypt::encrypt($item->id_aplikasi)]) }}"> <i class="fas fa-eye"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                    @endif
                </table>
            </div>
        </div>
    </div>

@endsection