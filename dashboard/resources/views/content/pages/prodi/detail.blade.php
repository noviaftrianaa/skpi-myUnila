@extends('layouts/layoutMaster')

@section('title', "Program Studi $detail->nm_lemb ($detail->nm_jenj_didik)")

@section('content')
    <div class="row">
        <!-- User Sidebar -->
        <div class="col-xl-4 col-lg-5 col-md-5 order-0 order-md-0">
            <!-- User Card -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="user-avatar-section">
                        <div class=" d-flex align-items-center flex-column">
                            <img class="img-fluid rounded mb-3 pt-1 mt-4" src="{{ asset('images/logo-unila.png') }}"
                                height="100" width="100" alt="User avatar" />
                            <div class="user-info text-center">
                                <h4 class="mb-2">{{ $detail->nm_lemb }}</h4>
                                <span class="badge bg-label-secondary text-dark">{{ $detail->nm_jenj_didik }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-around flex-wrap mt-3 pt-3 pb-4 border-bottom">
                        <div class="d-flex align-items-start me-4 mt-3 gap-2">
                            <span class="badge bg-label-warning p-2 rounded"><i class='ti ti-star-filled ti-sm'></i></span>
                            <div>
                                <p class="mb-0 mt-2 fw-medium text-bold">
                                    {{ $detail->akreditasi != null ? strtoupper($detail->akreditasi[0]->nm_akred) : '-' }}
                                </p>
                            </div>
                        </div>
                        <div class="d-flex align-items-start mt-3 gap-2">
                            <span class="badge bg-label-success p-2 rounded"><i class='ti ti-check ti-sm'></i></span>
                            <div>
                                <p class="mb-0 mt-2 fw-medium text-bold">
                                    {{ $detail->stat_prodi == 'A' ? 'AKTIF' : 'HAPUS' }}</p>
                            </div>
                        </div>
                    </div>
                    <span class="my-3 ms-3 badge bg-label-secondary">INFORMASI</span>
                    <div class="table-responsive info-container">
                        <table class="table table-striped table-hover table-sm" style="width: 100% !important">

                            <body>
                                {!! tableRow('Kode Prodi', $detail->kode_prodi) !!}
                                {!! tableRow('Tanggal Berdiri', TglIndonesia($detail->tgl_berdiri) ?? '-') !!}
                                {!! tableRow('Alamat', $detail->jln ?? '-') !!}
                                {!! tableRow('Telepon', $detail->no_tel ?? '-') !!}
                                {!! tableRow('Email', $detail->email ?? '-') !!}
                            </body>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <!--/ User Sidebar -->


        <!-- User Content -->
        <div class="col-xl-8 col-lg-7 col-md-7 order-1 order-md-1">
            <!-- Deskripsi Prodi -->
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="bs-stepper vertical wizard-vertical-icons-example">
                        <div class="bs-stepper-header">
                            <div class="step" data-target="#deskripsi">
                                <button type="button" class="step-trigger">
                                    <span class="bs-stepper-circle">
                                        <i class="fas fa-info"></i>
                                    </span>
                                    <span class="bs-stepper-label">
                                        <span class="bs-stepper-title">Deskripsi</span>
                                        <span class="bs-stepper-subtitle">{{ $detail->nm_lemb }}</span>
                                    </span>
                                </button>
                            </div>
                            <div class="line"></div>
                            <div class="step" data-target="#visi">
                                <button type="button" class="step-trigger">
                                    <span class="bs-stepper-circle">
                                        <i class="fas fa-eye"></i>
                                    </span>
                                    <span class="bs-stepper-label">
                                        <span class="bs-stepper-title">Visi</span>
                                        <span class="bs-stepper-subtitle">{{ $detail->nm_lemb }}</span>
                                    </span>
                                </button>
                            </div>
                            <div class="line"></div>
                            <div class="step" data-target="#misi">
                                <button type="button" class="step-trigger">
                                    <span class="bs-stepper-circle"><i class="fas fa-bullseye"></i>
                                    </span>
                                    <span class="bs-stepper-label">
                                        <span class="bs-stepper-title">Misi</span>
                                        <span class="bs-stepper-subtitle">{{ $detail->nm_lemb }}</span>
                                    </span>
                                </button>
                            </div>
                            <div class="line"></div>
                            <div class="step" data-target="#kompetensi">
                                <button type="button" class="step-trigger">
                                    <span class="bs-stepper-circle"><i class="fas fa-square-poll-vertical"></i>
                                    </span>
                                    <span class="bs-stepper-label">
                                        <span class="bs-stepper-title">Kompetensi Program Studi</span>
                                        <span class="bs-stepper-subtitle">{{ $detail->nm_lemb }}</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div class="bs-stepper-content">
                            <form onSubmit="return false">
                                <!-- Deskripsi -->
                                <div id="deskripsi" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        {{ $profil->desk_singkat ?? "-" }}
                                    </div>
                                </div>
                                <!-- Visi -->
                                <div id="visi" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                      {{ $profil->visi ?? "-" }}
                                    </div>
                                </div>
                                <!-- Misi -->
                                <div id="misi" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                      {{ $profil->misi ?? "-" }}
                                    </div>
                                </div>
                                <!-- Kompetensi Program Studi -->
                                <div id="kompetensi" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                      {{ $profil->kompetensi ?? "-" }}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Akreditasi Prodi -->
            <div class="card mb-4">
                <div class="card-header">
                    <h5>Akreditasi Prodi</h5>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover table-sm" style="width: 100% !important">
                            <thead class="table-primary">
                                <tr>
                                    <th class="text-center" width="5px">No.</th>
                                    <th>SK Akreditasi</th>
                                    <th class="text-center">Tanggal Akreditasi</th>
                                    <th class="text-center">Tanggal Expired</th>
                                    <th class="text-center">Akreditasi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($detail->akreditasi as $no=>$item)
                                    <tr>
                                        <td class="text-center">{{ $no + 1 }}</td>
                                        <td>{{ $item->sk_akreditasi_prodi }}</td>
                                        <td class="text-center">{{ TglIndonesia($item->tanggal_sk_akreditasi_prodi) }}
                                        </td>
                                        <td class="text-center">{{ TglIndonesia($item->tst_sk_akreditasi_prodi) }}</td>
                                        <td class="text-center">{{ $item->nm_akred }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="text-center">TIDAK ADA DATA</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <!-- Dosen Homebase & Mahasiswa -->
            @include('content.pages.prodi.dosen-mahasiswa')
        </div>
        <!--/ User Content -->
    </div>
    <!-- /Modal -->

    @include('content.pages.prodi.function')

@endsection
