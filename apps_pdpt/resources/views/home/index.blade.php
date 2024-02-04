@extends('template.default')

@section('content')
    <div class="row">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa fa-dashboard"></i> Dashboard</h3>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered table-striped">
                            <thead>
                            <tr>
                                <th>Unit</th>
                                <th>&Sigma; Dosen Homebase</th>
                                <th>&Sigma; Dosen Penghitung Rasio</th>
                                <th>&Sigma; Mahasiswa Aktif</th>
                                <th>Rasio Dosen/Mahasiswa</th>
                            </tr>
                            </thead>
                            <tbody>
                            @if($level=='prodi')
                                <tr>
                                    <td>{{ $unit->nm_lemb.' ('.$unit->jenjang->nm_jenj_didik.')' }}</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            @else {{--Level Universitas--}}
                            @endif
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            @include('dashboard.log_login')
            @include('dashboard.database')
        </div>
    </div>
@endsection
