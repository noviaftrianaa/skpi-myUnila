@extends('layouts/layoutMaster')
@include('_partials.__partial.datatable')

@section('title', 'Pelaksanaan '.($kode=='L'?'Penelitian/Penelitian':'Pengabdian/Pengabdian'))

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-{{ ($kode=='L'?'flask':'chain') }}"></i> {{ $judul }}</h4>
                </div>
                <div class="card-body">
                    <table id="table-data" class="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>No</th>
                            <th>Judul</th>
                            <th>No. SK</th>
                            <th>Tanggal SK</th>
                            <th>Lokasi Kegiatan</th>
                            <th>Tahun Kegiatan</th>
                            <th>Ketua</th>
                            <th>Homebase Ketua</th>
                            <th>Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($data AS $no=>$each_data)
                            <tr>
                                <td>{{ $no+1 }}</td>
                                <td>{{ $each_data->judul_litabmas }}</td>
                                <td>{{ $each_data->sk_tugas }}</td>
                                <td>{{ $each_data->tgl_sk_tugas }}</td>
                                <td>{{ $each_data->lokasi_kegiatan }}</td>
                                <td>{{ $each_data->thn_kegiatan }}</td>
                                <td>{{ $each_data->nm_ketua }}</td>
                                <td>{{ $each_data->prodi_ketua }}</td>
                                <td>
                                    {!! buttonShow($base_route.'.detail',Crypt::encrypt($each_data->id_litabmas),'Detail penelitian') !!}
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
