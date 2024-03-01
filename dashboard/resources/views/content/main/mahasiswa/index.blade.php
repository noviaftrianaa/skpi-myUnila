@extends('layouts/layoutMaster')
@include('_partials.__partial.datatable')

@section('title', 'Daftar Mahasiswa')

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-"></i> {{ $judul.' Semester '.$semester->nm_smt }}</h4>
                </div>
                <div class="card-body">
                    <form action="{{ route('mahasiswa.daftar_mahasiswa') }}" method="GET">
                        {!! FormInputSelect('smt','Semester',$semester_list,false,false,$smt_pilih) !!}
                    </form>
                    <hr>
                    <table id="table-data" class="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>No</th>
                            <th>Prodi Homebase</th>
                            <th>Nama Mahasiswa</th>
                            <th>NPM</th>
                            <th>Status Mahasiswa</th>
                            <th>IPK</th>
                            <th>Total SKS</th>
                            <th>Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        @foreach($data AS $no=>$each_data)
                            <tr>
                                <td>{{ $no+1 }}</td>
                                <td>{{ $each_data->prodi_homebase }}</td>
                                <td>{{ $each_data->nm_pd }}</td>
                                <td>{{ $each_data->nipd }}</td>
                                <td>{{ $each_data->status_mhs }}</td>
                                <td>{{ $each_data->ipk }}</td>
                                <td>{{ $each_data->total_sks }}</td>
                                <td>
                                    {!! buttonShow('mahasiswa.daftar_mahasiswa.detail',Crypt::encrypt($each_data->id_pd),'Detail Mahasiswa') !!}
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
        $(document).ready( function () {
            $('#smt').on('change', function() {
                this.form.submit();
            });
        });
    </script>
@endpush
