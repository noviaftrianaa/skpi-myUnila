@extends('layouts/layoutMaster')
@include('_partials.__partial.datatable')

@section('title', 'Pelaksanaan Penelitian/'.($kode=='P'?'Publikasi':'Paten HKI'))

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-flask"></i> {{ $judul }}</h4>
                </div>
                <div class="card-body">
                    <table id="table-data" class="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>No</th>
                            <th>Jenis Publikasi</th>
                            <th>Judul</th>
                            <th>Tahun Terbit</th>
                            <th>Tanggal Terbit</th>
                            <th>Ketua</th>
                            <th>Homebase Ketua</th>
                            <th>Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($data AS $no=>$each_data)
                            <tr>
                                <td>{{ $no+1 }}</td>
                                <td>{{ $each_data->nm_jns_pub }}</td>
                                <td>{{ $each_data->judul }}</td>
                                <td>{{ $each_data->thn_terbit }}</td>
                                <td>{{ $each_data->tgl_terbit }}</td>
                                <td>{{ $each_data->nm_ketua }}</td>
                                <td>{{ $each_data->prodi_ketua }}</td>
                                <td>
                                    {!! buttonShow($base_route.'.detail',Crypt::encrypt($each_data->id_publikasi),'Detail Publikasi/Paten') !!}
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
