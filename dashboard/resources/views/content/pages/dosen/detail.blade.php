@extends('layouts/layoutMaster')

@section('title', 'Detail Dosen ' . $profil->nm_sdm)

@include('content.pages.dosen.function')

@section('content')
    <!-- Header -->
    <div class="row">
        <div class="col-12">
            <div class="card mb-4 mt-5">
                {{-- <div class="user-profile-header-banner pt-4 px-4 pb-5">
                    <img src="{{ asset('images/Logo-Be-Strong-Unila-2023.png') }}" alt="Banner image"
                        class="rounded-top h-100">
                </div> --}}
                <div class="user-profile-header d-flex flex-column flex-sm-row text-sm-start text-center mb-4">
                    <div class="flex-shrink-0 mt-n2 mx-sm-0 mx-auto">
                        <img src="{{ asset('images/ghost_person.png') }}" alt="user image"
                            class="d-block h-auto ms-0 ms-sm-4 rounded user-profile-img">
                    </div>
                    <div class="flex-grow-1 mt-3 mt-sm-5">
                        <div
                            class="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-4 flex-md-row flex-column gap-4">
                            <div class="user-profile-info">
                                <h4>{{ $profil->nm_sdm }}</h4>
                                <ul
                                    class="list-inline mb-0 d-flex align-items-center flex-wrap justify-content-sm-start justify-content-center gap-2">
                                    <li class="list-inline-item d-flex gap-1" title="Prodi">
                                        <i class='ti ti-building'></i>
                                        {{ $profil->fak ? 'Fakultas ' . ucwords(strtolower($profil->fak)) : ' ' }}
                                        {{ $profil->jur ? ', ' . ucwords(strtolower($profil->jur)) : '' }}
                                        {{ $profil->nm_lemb ? ', Program Studi ' . ucwords(strtolower($profil->nm_lemb)) : '' }}
                                    </li>
                                    <li class="list-inline-item d-flex gap-1" title="NIDN">
                                        <i class='ti ti-id'></i> {{ $profil->nidn ?? '-' }}
                                    </li>
                                    <li class="list-inline-item d-flex gap-1" title="NIP">
                                        <i class='ti ti-id-badge'></i> {{ $profil->nip ?? '-' }}
                                    </li>
                                    <li class="list-inline-item d-flex gap-1" title="Email">
                                        <i class='ti ti-mail'></i> {{ $profil->email }}
                                    </li>
                                </ul>
                            </div>
                            {{-- <a href="javascript:void(0)" class="btn btn-success"> --}}
                            {!! $profil->id_stat_aktif == 1
                                ? '<a href="javascript:void(0)" class="btn btn-success">' . $profil->nm_stat_aktif . '</a>'
                                : ($profil->id_stat_aktif == 27
                                    ? '<a href="javascript:void(0)" class="btn btn-warning">' . $profil->nm_stat_aktif . '</a>'
                                    : '<a href="javascript:void(0)" class="btn btn-danger">' . $profil->nm_stat_aktif . '</a>') !!}
                            {{-- </a> --}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!--/ Header -->

    <!-- Navbar pills -->
    <div class="row">
        <div class="col-md-12">
            <ul class="nav nav-pills flex-column flex-md-row mb-4">
                <li class="nav-item"><button class="nav-link active" role="tab" data-bs-toggle="tab"
                        data-bs-target="#profil" aria-controls="profil" aria-selected="true"><i
                            class="ti ti-user ti-xs me-1"></i>Profil</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#riwayat_pengajaran" aria-controls="riwayat_pengajaran" aria-selected="true"><i
                            class="ti ti-book ti-xs me-1"></i>Riwayat Pengajaran</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#riwayat_pembimbingan_pengujian" aria-controls="riwayat_pembimbingan_pengujian"
                        aria-selected="true"><i class="ti ti-book ti-xs me-1"></i>Riwayat Pembimbingan dan
                        Pengujian</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#penelitian" aria-controls="penelitian" aria-selected="true"><i
                            class="ti ti-history ti-xs me-1"></i>Penelitian</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#publikasi" aria-controls="publikasi" aria-selected="true"><i
                            class="ti ti-notebook ti-xs me-1"></i>Publikasi</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#pengabdian" aria-controls="pengabdian" aria-selected="true"><i
                            class="ti ti-notebook ti-xs me-1"></i>Pengabdian</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#haki"
                        aria-controls="haki" aria-selected="true"><i class="ti ti-certificate ti-xs me-1"></i>HAKI</button>
                </li>
            </ul>
        </div>
    </div>
    <!--/ Navbar pills -->

    <!-- User Profile Content -->
    <div class="card mb-4">
        <div class="tab-content pt-0">
            <div class="tab-pane fade show active" id="profil" role="tabpanel">
                <div class="card-header">
                    <h5>Pendidikan</h5>
                </div>
                <div class="card-body">
                    <ul>
                        @forelse ($pendidikan as $item)
                            <li>
                                {{ $item->nm_gelar_akad }} ({{ $item->nm_bid_studi }}), {{ $item->nm_sp_formal }},
                                {{ $item->thn_lulus }}
                                {{ $item->judul_tesis != null ? ', Tesis: ' . $item->judul_tesis : '' }}
                            </li>
                        @empty
                            <p>Tidak ada data</p>
                        @endforelse
                    </ul>
                </div>
                <div class="card-header">
                    <h5>Sertifikasi</h5>
                </div>
                <div class="card-body">
                    <ul>
                        @forelse ($sertifikasi as $item)
                            <li>
                                {{ $item->nm_jns_sert }} ({{ $item->nm_bid_studi }}), {{ $item->thn_sert }}
                            </li>
                        @empty
                            <p>Tidak ada data</p>
                        @endforelse
                    </ul>
                </div>
                <div class="card-header">
                    <h5>Kepangkatan</h5>
                </div>
                <div class="card-body">
                    <ul>
                        @forelse ($kepangkatan as $item)
                            <li>
                                {{ $item->nm_pangkat }} ({{ $item->kode_gol }}),
                                {{ date('Y', strtotime($item->tmt_sk_pangkat)) }}
                            </li>
                        @empty
                            <p>Tidak ada data</p>
                        @endforelse
                    </ul>
                </div>
                <div class="card-header">
                    <h5>Jabatan Fungsional</h5>
                </div>
                <div class="card-body">
                    <ul>
                        @forelse ($jabfung as $item)
                            <li>
                                {{ $item->nm_jabfung }}, {{ date('Y', strtotime($item->tmt_sk_jabfung)) }}
                            </li>
                        @empty
                            <p>Tidak ada data</p>
                        @endforelse
                    </ul>
                </div>
            </div>
            <div class="tab-pane fade" id="riwayat_pengajaran" role="tabpanel">
                <div class="card-header">
                    <h5>Riwayat Pengajaran</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="tPengajaran" class="table table-striped table-sm" width="100% !important">
                            <thead class="table-primary"></thead>
                        </table>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade" id="riwayat_pembimbingan_pengujian" role="tabpanel">
                <div class="card-header">
                    <h5>Riwayat Pembimbingan</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="tBimbingan" class="table table-striped table-sm" width="100% !important">
                            <thead class="table-primary"></thead>
                        </table>
                    </div>
                </div>
                <div class="card-header">
                    <h5>Riwayat Pengujian</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table id="tPengujian" class="table table-striped table-sm" width="100% !important">
                            <thead class="table-primary"></thead>
                        </table>
                    </div>
                </div>
            </div>
            <div class="tab-pane fade" id="penelitian" role="tabpanel">
                <div class="card-header">
                    <h5>Penelitian</h5>
                </div>
                <div class="card-body">
                    <ul>
                        @forelse ($penelitian as $item)
                            <li>
                                <strong>{{ $item->judul_litabmas }} ({{ $item->id_thn_laks }})</strong>
                                @php
                                    $anggota = explode(',', $item->anggota);
                                    $peran = explode(',', $item->peran);
                                @endphp

                                <p>
                                    @for ($i = 0; $i < count($anggota); $i++)
                                        {{ $peran[$i] ?? '-' == 'K' ? '(Ketua)' : '(Anggota)' }}
                                        {{ $anggota[$i] ?? '-' }},
                                    @endfor
                                </p>
                            </li>
                        @empty
                            <p>Tidak ada data</p>
                        @endforelse
                    </ul>
                </div>
            </div>
            <div class="tab-pane fade" id="publikasi" role="tabpanel">
                <div class="card-header">
                    <h5>Publikasi</h5>
                </div>
                <div class="card-body">
                    <ul>
                        @forelse ($publikasi as $item)
                            <li>
                                <strong>{{ $item->judul_litabmas }} ({{ $item->id_thn_laks }})</strong>
                                @php
                                    $anggota = explode(',', $item->anggota);
                                    $peran = explode(',', $item->peran);
                                @endphp

                                <p>
                                    @for ($i = 0; $i < count($anggota); $i++)
                                        {{ $peran[$i] ?? '-' == 'K' ? '(Ketua)' : '(Anggota)' }}
                                        {{ $anggota[$i] ?? '-' }},
                                    @endfor
                                </p>
                            </li>
                        @empty
                            <p>Tidak ada data</p>
                        @endforelse
                    </ul>
                </div>
            </div>
            <div class="tab-pane fade" id="pengabdian" role="tabpanel">
                <div class="card-header">
                    <h5>Pengabdian</h5>
                </div>
                <div class="card-body">
                    <ul>
                        @forelse ($pengabdian as $item)
                            <li>
                                <strong>{{ $item->judul_litabmas }} ({{ $item->id_thn_laks }})</strong>
                                @php
                                    $anggota = explode(',', $item->anggota);
                                    $peran = explode(',', $item->peran);
                                @endphp

                                <p>
                                    @for ($i = 0; $i < count($anggota); $i++)
                                        {{ $peran[$i] ?? '-' == 'K' ? '(Ketua)' : '(Anggota)' }}
                                        {{ $anggota[$i] ?? '-' }},
                                    @endfor
                                </p>
                            </li>
                        @empty
                            <p>Tidak ada data</p>
                        @endforelse
                    </ul>
                </div>
            </div>
            <div class="tab-pane fade" id="haki" role="tabpanel">
                <div class="card-header">
                    <h5>HAKI</h5>
                </div>
                <div class="card-body">
                    <ul>
                        @forelse ($haki as $item)
                            <li>
                                <strong>{{ $item->judul }} ({{ date('Y', strtotime($item->tgl_terbit)) }})</strong>
                                @php
                                    $anggota = explode(',', $item->anggota);
                                    $peran = explode(',', $item->peran);
                                @endphp

                                <p>
                                    @for ($i = 0; $i < count($anggota); $i++)
                                        {{ $anggota[$i] ?? '-' }},
                                    @endfor
                                </p>
                            </li>
                        @empty
                            <p>Tidak ada data</p>
                        @endforelse
                    </ul>
                </div>
            </div>
        </div>
    </div>
    <!--/ User Profile Content -->
@endsection
