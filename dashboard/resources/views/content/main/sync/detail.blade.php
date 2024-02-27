@extends('layouts/layoutMaster')
@include('_partials.__partial.datatable')

@section('title', 'Sync Data My Unila')

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fa fa-refresh"></i> Detail Table Grup Sync Data My Unila dan PDDIKTI/SISTER
                        <a href="{{ route('sinkronisasi.tabel.tambah',Crypt::encrypt($data->id_kel_table_app)) }}" class="btn btn-outline-primary float-end"><i class="fa fa-plus"></i> Tambah</a>
                    </h4>
                </div>
                <div class="card-body">
                    <table class="table table-striped">
                        <tbody>
                        {!! tableRow('Nama Grup',$data->enpoint) !!}
                        </tbody>
                    </table>
                    <hr>
                    <table id="table-data" class="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>Nama Tabel</th>
                            <th>URL</th>
                            <th>Endpoint</th>
                            <th>Mulai Sync</th>
                            <th>Selesai Sync</th>
                            <th>Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($data_tabel AS $each_data_tabel)
                            <tr>
                                <td>{{ $each_data_tabel->tabel_alias }}</td>
                                <td>{{ $each_data_tabel->url }}</td>
                                <td>{{ $each_data_tabel->enpoint }}</td>
                                <td>{{ is_null($each_data_tabel->waktu_mulai_sync)?'--Belum Sync--':$each_data_tabel->waktu_mulai_sync }}</td>
                                <td>{{ $each_data_tabel->waktu_selesai_sync }}</td>
                                <td>
                                    {!! buttonEditMultipleId('sinkronisasi.tabel.ubah','Ubah detail tabel',[Crypt::encrypt($data->id_kel_table_app),Crypt::encrypt($each_data_tabel->id_kel_table_app)]) !!}
                                    <a href="{{ route('sinkronisasi.tabel.mulai_sync',[Crypt::encrypt($data->id_kel_table_app),Crypt::encrypt($each_data_tabel->id_kel_table_app)]) }}" class="btn btn-sm btn-primary">Mulai Sync</a>
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
                <div class="card-footer">
                    {!! buttonBack(route('sinkronisasi')) !!}
                </div>
            </div>
        </div>
    </div>
@endsection
