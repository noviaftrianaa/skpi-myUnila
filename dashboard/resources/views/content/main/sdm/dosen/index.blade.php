@extends('layouts/layoutMaster')
@include('content.main.sdm.dosen.function')

@section('title', $judul)

@section('content')

    <h4>
        <span class="text-muted fw-light">Sumberdaya Manusia /</span> Dosen
    </h4>

    <div class="card">
        <div
            class="card-header sticky-element bg-label-light d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4">
            <h5 class="card-title">{{ $judul }}</h5>
            <div class="float-end">
                <div class="btn-group" role="group">
                    <div id="exportBtn"></div>
                </div>
            </div>
        </div>
        <div class="card-body my-3">
            <div class="table-responsive text-nowrap">
                <table class="table table-striped table-hover table-bordered table-sm" id="table-data"
                    style="width: 100% !important">
                    <thead class="table-primary">
                        <tr>
                            <th>No.</th>
                            <th>Nama Dosen</th>
                            <th>NIDN</th>
                            <th>NIP</th>
                            <th>Fakultas</th>
                            <th>Jurusan</th>
                            <th>Prodi</th>
                            <th>Pendidikan Terakhir</th>
                            <th>Jabatan Fungsional</th>
                            <th>Pangkat/Golongan</th>
                            <th>Status Ikatan</th>
                            <th>Status Kepegawaian</th>
                            <th>Status Keaktifan</th>
                            <th>Email</th>
                            <th>ID SINTA</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($data as $no => $each_data)
                            <tr>
                                <td>{{ $no + 1 }}</td>
                                <td>{{ $each_data->nm_sdm }}</td>
                                <td>{{ $each_data->nidn }}</td>
                                <td>{{ $each_data->nip }}</td>
                                <td>{{ $each_data->fakultas }}</td>
                                <td>{{ $each_data->jurusan }}</td>
                                <td>{{ $each_data->homebase }}</td>
                                <td>{{ $each_data->nm_jenj_didik }}</td>
                                <td>{{ $each_data->nm_jabfung }}</td>
                                <td>{{ $each_data->kode_gol }}</td>
                                <td>{{ $each_data->nm_ikatan_kerja }}</td>
                                <td>{{ $each_data->nm_stat_pegawai }}</td>
                                <td>{{ $each_data->nm_stat_aktif }}</td>
                                <td>{{ $each_data->email }}</td>
                                <td>{{ $each_data->id_sinta }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <!-- Offcanvas to filter -->
            <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddUser"
                aria-labelledby="offcanvasAddUserLabel">
                <div class="offcanvas-header">
                    <h5 id="offcanvasAddUserLabel" class="offcanvas-title">Filter Data</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                        aria-label="Close"></button>
                </div>
                <div class="offcanvas-body mx-0 flex-grow-0 pt-0 h-100">
                    <div class="mb-3">
                        <input type="text" id="search" placeholder="Pencarian" class="form-control w-100">
                    </div>
                    <div class="my-3 border-bottom"></div>
                    <div class="mt-3">
                        <label class="form-label">Tahun Ajaran</label>
                        <form action="{{ route('sdm.tendik') }}" method="GET">
                            <select name="tahun" id="tahun" class="form-select">
                                @foreach ($ta_list as $id_thn_ajaran => $nm_thn_ajaran)
                                    <option value="{{ $id_thn_ajaran }}" {{ $id_thn_ajaran == $thn ? 'selected' : '' }}>
                                        {{ $nm_thn_ajaran }}</option>
                                @endforeach
                            </select>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
