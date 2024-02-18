@extends('layouts/layoutMaster')
@include('_partials.__partial.datatable')

@section('title', 'Sync Data My Unila')

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fa fa-refresh"></i> Sync Data My Unila dan PDDIKTI/SISTER
                        <a href="{{ route('sinkronisasi.tambah') }}" class="btn btn-outline-primary float-end"><i class="fa fa-plus"></i> Tambah</a>
                    </h4>
                </div>
                <div class="card-body">
                    <table id="table-data" class="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>Sync Group</th>
                            <th>Keterangan</th>
                            <th>Last Sync</th>
                            <th>Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($data AS $each_data)
                            <tr>
                                <td>{{ $each_data->enpoint }}</td>
                                <td></td>
                                <td></td>
                                <td>
                                    {!! buttonEdit('sinkronisasi.ubah',Crypt::encrypt($each_data->id_kel_table_app),'Ubah data kelompok sinkronisasi') !!}
                                    {!! buttonShow('sinkronisasi.tabel',Crypt::encrypt($each_data->id_kel_table_app),'Detail tabel grup') !!}
                                </td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
