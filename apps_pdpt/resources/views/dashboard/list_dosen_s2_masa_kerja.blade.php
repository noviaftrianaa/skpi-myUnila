@extends('template_public.default',['judul_layout'=>$judul_layout,'side_active'=>$side_active])

@include('__partial.select2')
@include('__partial.datatable_yajra')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container">
            <div class="col-sm-12">
                <div class="card">
                    <div class="card-header">List Daftar Dosen S2 dengan masa kerja 20, 25, 30 Tahun</div>
                    <div class="card-body">
                        <div class="tab-content" id="pills-tabContent">
                                <div class>
                                    <div class="table-responsive">
                                        <table class="table table-hover table-striped table-data">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Nama Dosen</th>
                                                    <th>NIDN</th>
                                                    <th>Pendidikan Terakhir</th>
                                                    <th>Masa Kerja</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach ($list_dosen_s2_masa_kerja as $no_data => $each_data)
                                                    <tr>
                                                        <td>{{ $no_data + 1 }}</td>
                                                        <td>{{ $each_data->nama_dosen }}</td>
                                                        <td>{{ $each_data->nidn }}</td>
                                                        <td>{{ $each_data->jenjang_terakhir }}</td>
                                                        <td>{{ $each_data->tgl_jabfung}}</td>
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
    </div>
@endsection

