@extends('template.default')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container-fluid">
        <div class="col-sm-12">
            <div class="card">
                <div class="card-header"><i class="fas fa-handshake mr-2"></i>KERJASAMA UNIVERSITAS LAMPUNG</div>
                <div class="card-body">
                    <div class="tab-content" id="pills-tabContent">
                        <div class="table-responsive">
                            <table class="table table-hover table-striped table-data">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Judul</th>
                                        <th>Instansi</th>
                                        <th>Nama Mitra</th>
                                        <th>Bidang Usaha</th>
                                        <th>Status</th>
                                        <th>Masa Berlaku</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($kerjasama as $no_data => $each_data)
                                        <tr>
                                            <td>{{ $no_data + 1 }}</td>
                                            <td>{{ $each_data->judul }}</td>
                                            <td>{{ $each_data->instansi }}</td>
                                            <td>{{ $each_data->nama_mitra }}</td>
                                            <td>{{ $each_data->bidang_usaha}}</td>
                                            <td>{{ $each_data->status }}</td>
                                            <td>{{ $each_data->masa_berlaku }}</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary">Detail</button>
                                            </td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

