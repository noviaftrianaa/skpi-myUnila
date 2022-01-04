@extends('template.default.app')
@section('title','DATA UNIT ORGANISASI')
@extends('__partial.datatable')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> DATA UNIT ORGANISASI</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
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
                            <td>{{$no+1}}</td>
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