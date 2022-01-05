@extends('tendik::components.master')
@section('title', 'Pembuatan Pedoman')

@section('content')
{{-- start pembuatan pedoman --}}
<div class="container-fluid py-4">
    <div class="row">
        <div class="col-12 mb-4">
            <div class="card h-100">
                <div class="card-header pb-0 p-3 mb-0">
                    <div class="row">
                        <div class="col-6 d-flex align-items-center">
                            <p class="text-uppercase text-sm font-weight-bolder mb-0">Pembuatan Pedoman</p>
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
                                    <th class="text-uppercase text-xxs font-weight-bolder">Judul</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Jenis</th>
                                    <th class="text-uppercase text-xxs font-weight-bolder">Tanggal Terbit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {{-- @foreach ($listPembuatanPedoman as $value)
                                    <tr>
                                        <td>
                                            <span class="text-xs font-weight-bold">{{ $value['id'] }}</span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['judul'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['jenis'] }} </span>
                                        </td>
                                        <td>
                                            <span class="text-xs font-weight-bold"> {{ $value['tanggal_terbit'] }} </span>
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
{{-- end pembuatan pedoman --}}
@endsection
