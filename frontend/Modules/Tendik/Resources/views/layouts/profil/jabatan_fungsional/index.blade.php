@extends('tendik::components.master')
@section('title', 'Jabatan Fungsional')

@section('content')
{{-- start jabatan fungsional --}}
<div class="container-fluid py-4">
    <div class="row">
        <div class="col-12 mb-4">
            <div class="card h-100">
                <div class="card-header pb-0 p-3 mb-0">
                    <div class="row">
                        <div class="col-6 d-flex align-items-center">
                            <p class="text-uppercase text-sm font-weight-bolder mb-0">Jabatan Fungsional</p>
                        </div>
                        <div class="col-6 text-end">
                            <a class="btn btn-sm bg-gradient-dark mb-0" href="javascript:;">Tambah</a>
                            <a class="btn btn-sm bg-gradient-dark mb-0" href="javascript:;">Riwayat</a>
                        </div>
                    </div>
                    <hr class="mt-2">
                </div>
                <div class="card-body p-3 pt-0">
                    <div class="table-responsive p-0">
                        <table class="table">
                            <thead class="bg-dark text-white">
                                <tr>
                                    <th class="text-uppercase text-xxs font-weight-bolder">No</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Pangkat</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Golongan</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Nomor SK</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Tanggal SK</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Terhitung Mulai</th>
                                </tr>
                            </thead>
                            <tbody>
                                {{-- @foreach ($listJabatanFungsional as $value)
                                    <tr>
                                        <td>
                                            <span class="text-xs font-weight-bold">{{ $value['id'] }}</span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['pangkat'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['golongan'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['no_sk'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['tgl_sk'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['tmt'] }} </span>
                                        </td>
                                    </tr>
                                @endforeach --}}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
{{-- end jabatan fungsional --}}
@endsection
