

@extends('template.default')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container-fluid">
            <div class="col-sm-16">
                <div class="card">
                    <div class="card-header">Data Aplikasi Univeritas Lampung </div>
                    <div class="card-body">
                        <div class="tab-content" id="pills-tabContent">
                                <div class>
                                    <div class="table-responsive">
                                        <table class="table table-hover table-striped table-data">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Aplikasi</th>
                                                    <th>URL</th>
                                                    <th>Teknologi</th>
                                                    <th>Administrator</th>
                                                    <th>Penanggung Jawab</th>
                                                    <th>Unit Organisasi</th>
                                                    <th>Status</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach ($aplikasi as $no_data => $each_data)
                                                    <tr>
                                                        <td>{{ $no_data + 1 }}</td>
                                                        <td>{{ $each_data->nm_aplikasi }}</td>
                                                        <td><a href={{$each_data->url }} target = "_blank">{{$each_data->url}}</a></td>
                                                        <td>{{ $each_data->teknologi }}</td>
                                                        <td>{{ $each_data->administrator }}</td>
                                                        <td>{{ $each_data->nm_pengguna }}</td>
                                                        <td>{{ $each_data->nm_lemb }}</td>
                                                        <td>{{ $each_data->status_aplikasi }}</td>
                                                        <td style="text-align: center;">
                                                            <button type="button" class="btn btn-primary"><i class="fas fa-eye"></i></button>
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
        </div>
    </div>
@endsection

