@extends('dosen::components.master')
@section('title', 'Inpassing')

@section('css')
    <style></style>
@stop

@section('content')
    <div class="container-fluid py-4">
        <div class="row my-4">
            <div class="col-lg-12 col-md-12 mb-md-0 mb-4">
                <div class="card">
                    <div class="card-header pb-0">
                        <div class="row">
                            <div class="col-lg-6 col-7">
                                <h6>Inpassing</h6>
                                <p class="text-sm mb-0">
                                    <i class="fa fa-check text-info" aria-hidden="true"></i>
                                    <span class="font-weight-bold ms-1">Menampilkan 5 Data</span> Dalam 1 Tahun
                                </p>
                            </div>
                            <div class="col-lg-6 col-5 my-auto text-end">
                                <a class="btn btn-primary mb-0" href="{{ route('dosen.inpassing.add') }}"><i class="fas fa-plus"
                                        aria-hidden="true"></i>&nbsp;&nbsp;Tambah Data</a>
                            </div>
                        </div>
                    </div>

                    <div class="card-body px-0 pb-2">
                        <div class="table-responsive">
                            <table class="table align-items-center mb-3 inpassing-list">
                                <thead>
                                    <tr>
                                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                            No
                                        </th>
                                        <th
                                            class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                            Pangkat
                                        </th>
                                        <th
                                            class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                            Golongan
                                        </th>
                                        <th
                                            class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                            Nomor SK
                                        </th>
                                        <th
                                            class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                            Tanggal SK
                                        </th>
                                        <th
                                            class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                            Terhitung Mulai
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    @foreach ($listInpassing as $value)
                                        <tr>
                                            <td>
                                                <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                    {{ $value['id'] }}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="text-xs font-weight-bold"> {{ $value['pangkat'] }} </span>
                                            </td>
                                            <td>
                                                <span class="text-xs font-weight-bold"> {{ $value['golongan'] }} </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> {{ $value['no_sk'] }} </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> {{ $value['tgl_sk'] }} </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> {{ $value['tmt'] }} </span>
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

@section('js')
@stop
