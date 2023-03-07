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
                <table class="table table-striped table-bordered table-hover" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Nama Lembaga</th>
                        <th>Email</th>
                        <th>No Telp.</th>
                        <th>Jalan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td class="text-center" width="5px">{{ $no+1 }}</td>
                            <td>{{$item->nm_lemb}}</td>
                            <td>{{$item->email}}</td>
                            <td>{{$item->no_telp}}</td>
                            <td>{{$item->jalan}}</td>
                            <td>{{($item->a_aktif==1)?'Aktif':'Tidak Aktif'}}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

@endsection