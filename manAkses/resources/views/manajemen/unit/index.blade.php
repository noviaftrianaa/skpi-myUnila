@extends('template.default.app')
@section('title','Data Unit Organisasi')
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Unit Organisasi</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="d-lg-flex d-block">
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
                <table class="table table-borderless table-hover" id="table-data" style="width: 100% !important">
                    <thead class="bg-info">
                      <tr>
                        <th>No.</th>
                        <th>Unit</th>
                        <th class="text-center" width="5px">Email</th>
                        <th class="text-center" width="5px">Phone</th>
                        <th class="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td class="text-center" width="5px">{{ $no+1 }}</td>
                            <td>{{$item->nm_lemb}}</td>
                            <td class="text-center" width="5px">{{$item->email}}</td>
                            <td class="text-center" width="5px">{{$item->no_telp ?? '-'}}</td>
                            <td class="text-center">{!! ($item->a_aktif==1)?'<span class="badge badge-success">Aktif</span>':'<span class="badge badge-danger">Tidak Aktif</span>' !!}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

@endsection
