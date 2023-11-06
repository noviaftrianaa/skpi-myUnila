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
                    @if($menus->a_boleh_insert == "1")
                    <a class="btn btn-info col-12" href="{{route('aplikasi.create')}}"><i class="fa fa-plus"></i> Tambah Data</a>
                    @else
                    <a class="btn btn-info col-12" href="{{ url('/api/live/v1') }}" target="_blank"><i class="fa fa-connectdevelop"></i> Rest API</a>
                    @endif
                </div>
                <div class="ml-auto px-2">
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
                <table class="table table-borderless table-hover text-center" id="table-data" style="width: 100% !important">
                    <thead class="bg-info">
                      <tr>
                        <th>No.</th>
                        <th>Aplikasi</th>
                        <th>Unit</th>
                        <th width="5px">URL</th>
                        <th>Expired</th>
                        <th>Sync</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    @if($menus->a_boleh_insert == "1")
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td width="5px">{{$no+1}}</td>
                            <td>{{$item->nm_aplikasi}}</td>
                            <td>{{$item->unitorganisasi->nm_lemb}}</td>
                            <td width="5px">{{$item->url}}</td>
                            <td>{{TglIndonesiaShort($item->expired_date) ?? '-'}}</td>
                            <td>{{TglIndonesiaShort($item->last_sync) ?? '-'}}</td>
                            <td width="5px">
                                <a class="btn btn-link btn-xs" title="Show" href="{{ route('aplikasi.detail', [Crypt::encrypt($item->id_aplikasi)]) }}"><i class="fas fa-search"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                    @else
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td width="5px">{{$no+1}}</td>
                            <td>{{$item->aplikasi->nm_aplikasi}}</td>
                            <td>{{$item->aplikasi->unitorganisasi->nm_lemb}}</td>
                            <td>{{$item->aplikasi->url}}</td>
                            <td>{{TglWaktuIndonesia($item->aplikasi->expired_date)}}</td>
                            <td>{{TglWaktuIndonesia($item->aplikasi->last_sync)}}</td>
                            <td width="5px">
                                <a class="btn btn-link btn-xs" title="Show" href="{{ route('aplikasi.detail', [Crypt::encrypt($item->id_aplikasi)]) }}"><i class="fas fa-search"></i></a>
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
