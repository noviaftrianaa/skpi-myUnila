@extends('tendik::components.master')
@section('title', 'Anggota Profesi')

@section('content')
{{-- start Anggota Profesi --}}
<div class="container-fluid py-4">
    <div class="row">
        <div class="col-12 mb-4">
            <div class="card h-100">
                <div class="card-header pb-0 p-3 mb-0">
                    <div class="row">
                        <div class="col-6 d-flex align-items-center">
                            <p class="text-uppercase text-sm font-weight-bolder mb-0">Anggota Profesi</p>
                        </div>
                        <div class="col-6 text-end">
                            <a class="btn btn-sm bg-gradient-dark mb-0" href="javascript:;">Tambah</a>
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
                                    <th class="text-uppercase text-xxs font-weight-bolder">Nama Organisasi</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Peran/Kedudukan</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Mulai Keanggotaan</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Selesai Keanggotaan</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Instansi Profesi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {{-- @foreach ($listAnggotaProfesi as $value)
                                    <tr>
                                        <td>
                                            <span class="text-xs font-weight-bold">{{ $value['id'] }}</span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['nama_organisasi'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['peran_kedudukan'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['mulai_keanggotaan'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['selesai_keanggotaan'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['instansi_profesi'] }} </span>
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
{{-- end Anggota Profesi --}}
@endsection
