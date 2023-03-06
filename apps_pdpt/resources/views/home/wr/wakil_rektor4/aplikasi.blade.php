

@extends('template.default')
@include('__partial.highchart')
@include('__partial.datatable_yajra')

@section('content')
    <div class="container">
            <div class="col-sm-12">
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
                                                    <th>Organisasi</th>
                                                    <th>URL</th>
                                                    <th>Penanggung Jawab</th>
                                                    <th>Last Sync</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach ($aplikasi as $no_data => $each_data)
                                                    <tr>
                                                        <td>{{ $no_data + 1 }}</td>
                                                        <td>{{ $each_data->nm_aplikasi }}</td>
                                                        <td>{{ $each_data->nama_organisasi }}</td>
                                                        <td>{{ $each_data->url }}</td>
                                                        <td>{{ $each_data->nama_pj }}</td>
                                                        <td>{{ $each_data->last_sync }}</td>
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
@endsection

