@extends('layouts/layoutMaster')
@include('content.main.sdm.dosen.function')

@section('title', $judul)

@section('content')

    <h4>
        <span class="text-muted fw-light">Sumberdaya Manusia /</span> Tendik
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
                            <th>No</th>
                            <th>Nama Pegawai</th>
                            <th>NIP</th>
                            <th>Tanggal Lahir (Usia)</th>
                            <th>Unit Utama</th>
                            <th>Unit 1</th>
                            <th>Unit 2</th>
                            <th>Unit 3</th>
                            <th>Pendidikan Terakhir</th>
                            <th>Jabatan Fungsional</th>
                            <th>Pangkat/Golongan</th>
                            <th>Status Kepegawaian</th>
                            <th>Status Keaktifan</th>
                            <th>TMT Pensiun</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($data as $no => $each_data)
                            <tr>
                                <td>{{ $no + 1 }}</td>
                                <td>{{ $each_data->nm_pegawai }}</a></td>
                                <td>{{ $each_data->nip }}</td>
                                <td>{{ tglIndonesiaShort($each_data->tgl_lahir) . ' (' . $each_data->umur . ' Tahun)' }}
                                </td>
                                <td>{{ $each_data->unit }}</td>
                                <td>{{ $each_data->unit1 }}</td>
                                <td>{{ $each_data->unit2 }}</td>
                                <td>{{ $each_data->unit3 }}</td>
                                <td>{{ $each_data->nm_pend }}</td>
                                <td>{{ $each_data->nm_jabfung }}</td>
                                <td>{{ $each_data->nm_gol }}</td>
                                <td>{{ $each_data->jns_pegawai }}</td>
                                <td>{{ $each_data->status }}</td>
                                <td>{{ $each_data->tmt_pensiun }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <!-- Offcanvas to filter -->
            <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddUser"
                aria-labelledby="offcanvasAddUserLabel">
                <div class="offcanvas-header">
                    <h5 id="offcanvasAddUserLabel" class="offcanvas-title">Filter</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                        aria-label="Close"></button>
                </div>
                <div class="offcanvas-body mx-0 flex-grow-0 pt-0 h-100">
                    <div class="mb-3">
                        <div class="input-group w-100">
                            <input type="text" id="search" placeholder="Pencarian" class="form-control">
                            <button type="button" id="btnSearch" class="btn btn-primary"><i
                                    class="fas fa-search"></i></button>
                        </div>
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
