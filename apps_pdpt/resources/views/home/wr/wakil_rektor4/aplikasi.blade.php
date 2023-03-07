

@extends('template.default')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container-fluid">
        <div class="col-sm-12">
            <div class="card">
                <div class="card-header"><i class="fa fa-globe mr-2"></i>APLIKASI UNIVERSITAS LAMPUNG</div>
                <div class="card-body">
                    <div class="tab-content" id="pills-tabContent">
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
                                            <td>
                                                @if(!is_null($each_data->nama_pj))
                                                @php
                                                    $pj = explode(';', $each_data->nama_pj);
                                                @endphp
                                                <ul>
                                                    @foreach($pj AS $item)
                                                    <li>{{$item}}</li>
                                                    @endforeach
                                                </ul>
                                                @endif
                                            </td>
                                            <td>{{ TglWaktuIndonesia($each_data->last_sync) }}</td>
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
@endsection

