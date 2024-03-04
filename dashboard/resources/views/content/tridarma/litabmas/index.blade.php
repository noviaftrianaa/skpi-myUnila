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
                    <form action="{{ route($base_route) }}" method="GET">
                        {!! FormInputSelect('thn','Tahun Kegiatan',$list_tahun,false,false,$thn_pilih) !!}
                    </form>
                    <hr>
                    <div class="row">
                        <div class="col-lg-2 col-sm-6 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between">
                                        <small class="d-block mb-1 text-muted">Total Judul</small>
                                    </div>
                                    <h4 class="card-title mb-1">{{ count($data) }}</h4>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-sm-6 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between">
                                        <small class="d-block mb-1 text-muted">Dana DIKTI</small>
                                    </div>
                                    <h4 class="card-title mb-1">{{ number_to_currency(collect($data)->sum('dana_dikti')) }}</h4>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-4 col-sm-6 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between">
                                        <small class="d-block mb-1 text-muted">Dana PT</small>
                                    </div>
                                    <h4 class="card-title mb-1">{{ number_to_currency(collect($data)->sum('dana_pt')) }}</h4>
                                </div>
                            </div>
                        </div>
                        <div class="col-lg-3 col-sm-6 mb-4">
                            <div class="card">
                                <div class="card-header">
                                    <div class="d-flex justify-content-between">
                                        <small class="d-block mb-1 text-muted">Dana Instansi Lain</small>
                                    </div>
                                    <h4 class="card-title mb-1">{{ number_to_currency(collect($data)->sum('dana_instansi_lain')) }}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <table id="table-data" class="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>No</th>
                            <th>Judul</th>
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

@push('js')
    <script>
        $(document).ready(function() {
            $('#thn').on('change', function() {
                this.form.submit();
            });
        })
    </script>
@endpush
