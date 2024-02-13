@extends('layouts/layoutMaster')

@section('title', 'Halaman Utama')

@include('content.pages.dashboard.function')

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
                                <h4 class="mb-2">Universitas Lampung</h4>
                                <span class="badge bg-label-secondary text-dark">Prof. Dr. Ir. Lusmeilia Afriani. D. E. A.,
                                    IPM., ASEAN Eng.</span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-around flex-wrap mt-3 pt-3 pb-4 border-bottom">
                        <div class="d-flex align-items-start me-4 mt-3 gap-2">
                            <span class="badge bg-label-warning p-2 rounded"><i class='ti ti-star-filled ti-sm'></i></span>
                            <div>
                                {{-- <small>Akreditasi</small> --}}
                                <p class="mb-0 mt-2 fw-medium text-bold">UNGGUL</p>
                            </div>
                        </div>
                        <div class="d-flex align-items-start mt-3 gap-2">
                            <span class="badge bg-label-success p-2 rounded"><i class='ti ti-check ti-sm'></i></span>
                            <div>
                                <p class="mb-0 mt-2 fw-medium text-bold">AKTIF</p>
                                {{-- <small>Status</small> --}}
                            </div>
                        </div>
                    </div>
                    <span class="my-3 badge bg-label-secondary">INFORMASI</span>
                    <div class="table-responsive info-container">
                        <table class="table table-striped table-striped table-hover table-sm"
                            style="width: 100% !important">

                            <body>
                                {!! tableRow('Kode PT', '001026') !!}
                                {!! tableRow('Tanggal Berdiri', '22 September 1965') !!}
                                {!! tableRow(
                                    'Alamat',
                                    'Jl Sumantri Brojonegoro No 1 Gedong Meneng, Kecamatan Rajabasa, Kota Bandar Lampung 35145',
                                ) !!}
                                {!! tableRow('Telepon', '(0721) 701609') !!}
                                {!! tableRow('Email', 'humas@kpa.unila.ac.id') !!}
                            </body>
                        </table>
                    </div>
                </div>
            </div>
            <!-- /User Card -->
            <!-- Plan Card -->
            <div class="card mb-4">
                <div class="card-body p-0">
                    {{-- <div class="d-flex justify-content-center align-items-start my-3">
												<span class="badge bg-label-secondary">MAPS</span>
										</div> --}}
                    <div class="d-grid w-100">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63558.293854487536!2d105.22368909837614!3d-5.356795687097715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40c5f60802221d%3A0xac5d5819e12c9bcf!2sUniversitas%20Lampung%20(UNILA)!5e0!3m2!1sid!2sid!4v1706425991688!5m2!1sid!2sid"
                            width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>
                </div>
            </div>
            <!-- /Plan Card -->
        </div>
        <!--/ User Sidebar -->


        <!-- User Content -->
        <div class="col-xl-8 col-lg-7 col-md-7 order-1 order-md-1">
            <!-- Deskripsi, Visi, dan Misi -->
            <div class="row">
                <div class="col-12 mb-4">
                    <div class="bs-stepper vertical wizard-vertical-icons-example">
                        <div class="bs-stepper-header">
                            <div class="step" data-target="#visi">
                                <button type="button" class="step-trigger">
                                    <span class="bs-stepper-circle">
                                        <i class="fas fa-eye"></i>
                                    </span>
                                    <span class="bs-stepper-label">
                                        <span class="bs-stepper-title">Visi</span>
                                        <span class="bs-stepper-subtitle">Universitas Lampung</span>
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
                                        <span class="bs-stepper-subtitle">Universitas Lampung</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                        <div class="bs-stepper-content">
                            <form onSubmit="return false">
                                <!-- Visi -->
                                <div id="visi" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        Universitas Lampung menjadi <i class="fw-bold">Center of Excellence</i> di tingkat
                                        Nasional dan
                                        Internasional sebagai Institusi yang kuat <i class="fw-bold">(BE STRONG)</i>
                                        berlandaskan
                                        nilai-nilai luhur budaya Nasional dan Pancasila.
                                    </div>
                                </div>
                                <!-- Misi -->
                                <div id="misi" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        Menerapkan <span class="fw-bold">Tridharma Perguruan Tinggi</span> yang berkualitas
                                        guna menghasilkan
                                        sumber daya manusia yang adaptif dan fleksibel terhadap perubahan serta
                                        inovasi yang bermanfaat bagi peningkatan daya saing bangsa.
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <!-- User Pills -->

            <ul class="nav nav-pills flex-column flex-md-row mb-4">
                <li class="nav-item"><button class="nav-link active" role="tab" data-bs-toggle="tab"
                        data-bs-target="#navs-program-studi" aria-controls="navs-program-studi" aria-selected="true"><i
                            class="ti ti-category ti-xs me-1"></i>Program Studi</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#navs-mahasiswa" aria-controls="navs-mahasiswa" aria-selected="true"><i
                            class="ti ti-users ti-xs me-1"></i>Mahasiswa</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#navs-dosen" aria-controls="navs-dosen" aria-selected="true"><i
                            class="ti ti-users-group ti-xs me-1"></i>Dosen</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#navs-tendik" aria-controls="navs-tendik" aria-selected="true"><i
                            class="ti ti-users-group ti-xs me-1"></i>Tenaga Pendidik</button></li>
            </ul>
            <!--/ User Pills -->

            <!-- Project table -->
            <div class="card">
                <!-- Program Studi -->
                <div class="tab-content pt-0">
                    <div class="tab-pane fade show active" id="navs-program-studi" role="tabpanel">
                      <div class="card-header border-bottom d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0">
                            <h5>Program Studi</h5>
                        </div>
                        <div class="table-responsive my-3">
                            <table class="table table-striped table-hover programstudi table-sm"
                                style="width: 100% !important">
                                <thead class="table-primary"></thead>
                            </table>
                        </div>
                    </div>
                    <!-- Mahasiswa -->
                    <div class="tab-pane fade" id="navs-mahasiswa" role="tabpanel">
                      <div class="card-header border-bottom d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0">
                            <h5>Mahasiswa</h5>
                            <div class="float-end row">
                                <div class="input-group">
                                    <label class="input-group-text">Semester</label>
                                    <select class="form-select text-center" id="periodeMahasiswa">
                                        <option value="ALL">Semua</option>
                                        @foreach ($periode as $idThnAjaran => $item)
                                            @foreach ($item as $value)
                                                @php
                                                    $text = substr($value->id_smt, 4, 1) == 1 ? 'Ganjil' : 'Genap';
                                                @endphp
                                                <option value="{{ $value->id_smt }}">
                                                    {{ substr($value->id_smt, 0, 4) . ' ' . $text }}</option>
                                            @endforeach
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive my-3">
                            <table class="table table-striped table-hover mahasiswa table-sm"
                                style="width: 100% !important">
                                <thead class="table-primary"></thead>
                            </table>
                        </div>
                    </div>
                    <!-- Dosen -->
                    <div class="tab-pane fade" id="navs-dosen" role="tabpanel">
                      <div class="card-header border-bottom d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0">
                            <h5>Dosen</h5>
                            <div class="float-end row">
                                <div class="input-group">
                                    <label class="input-group-text">Tahun</label>
                                    <select class="form-select text-center" id="periodeDosen">
                                        {{-- <option value="ALL">Semua Tahun</option> --}}
                                        @foreach ($periode as $idThnAjaran => $item)
                                            <option value="{{ $idThnAjaran }}">{{ $idThnAjaran }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive my-3">
                            <table class="table table-striped table-hover dosen table-sm"
                                style="width: 100% !important">
                                <thead class="table-primary">
                                    <tr>
                                        <th rowspan="2" width="5px">No.</th>
                                        <th rowspan="2">Program Studi</th>
                                        <th rowspan="2" width="5px">Jenjang</th>
                                        <th colspan="2" class="text-center">PNS</th>
                                        <th colspan="2" class="text-center">Kontrak</th>
                                    </tr>
                                    <tr>
                                        <td width="5px">Pria</td>
                                        <td width="5px">Wanita</td>
                                        <td width="5px">Pria</td>
                                        <td width="5px">Wanita</td>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                    <!-- Tenaga Pendidik -->
                    <div class="tab-pane fade" id="navs-tendik" role="tabpanel">
                      <div class="card-header border-bottom d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0">
                            <h5>Tenaga Pendidik</h5>
                        </div>
                        <div class="table-responsive my-3">
                            <table class="table table-striped table-hover tendik table-sm"
                                style="width: 100% !important">
                                <thead class="table-primary">
                                    <tr>
                                        <th rowspan="2" width="5px">No.</th>
                                        <th rowspan="2">Lembaga/Fakultas</th>
                                        <th colspan="2" class="text-center">PNS</th>
                                        <th colspan="2" class="text-center">Kontrak</th>
                                    </tr>
                                    <tr>
                                        <td width="5px">Pria</td>
                                        <td width="5px">Wanita</td>
                                        <td width="5px">Pria</td>
                                        <td width="5px">Wanita</td>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <!-- /Project table -->
        </div>
        <!--/ User Content -->
    </div>
    <!-- /Modal -->

    @include('content.pages.dashboard.modal-dosen-list')
    @include('content.pages.dashboard.modal-tendik-list')
    @include('content.pages.dashboard.modal-mahasiswa-list')

@endsection
