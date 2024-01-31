@extends('layouts/layoutMaster')
@include('_partials.datatables')

@section('title', 'Halaman Utama')

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
                    <span class="my-3 badge bg-label-secondary">Information</span>
                    <div class="info-container">
                        <table class="table table-striped table-hover">

                            <body>
                                <tr>
                                    <th>Kode PT</th>
                                    <td>:</td>
                                    <td>001026</td>
                                </tr>
                                <tr>
                                    <th>Tanggal Berdiri</th>
                                    <td>:</td>
                                    <td>22 September 1965</td>
                                </tr>
                                <tr>
                                    <th>Alamat</th>
                                    <td>:</td>
                                    <td>Jl Sumantri Brojonegoro No 1 Gedong Meneng, Kecamatan Rajabasa, Kota Bandar Lampung
                                        35145</td>
                                </tr>
                                <tr>
                                    <th>Telepon</th>
                                    <td>:</td>
                                    <td>(0721) 701609</td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>:</td>
                                    <td>humas@kpa.unila.ac.id</td>
                                </tr>
                            </body>
                        </table>
                    </div>
                </div>
            </div>
            <!-- /User Card -->
            <!-- Plan Card -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <span class="badge bg-label-secondary">MAPS</span>
                    </div>
                    <div class="d-grid w-100 mt-3">
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
                      <div class="card-header px-0 d-flex justify-content-between align-items-start">
                        <h5>Program Studi</h5>
                        <div class="card-tools">
                          <button class="btn btn-default" id="programstudi"><i class="fas fa-refresh me-2"></i>Refresh</button>
                        </div>
                      </div>
                        <div class="table-responsive">
                            <table class="table table-hover programstudi" style="width: 100% !important">
                                <thead class="table-primary"></thead>
                            </table>
                        </div>
                    </div>
                    <!-- Mahasiswa -->
                    <div class="tab-pane fade" id="navs-mahasiswa" role="tabpanel">
                        <div class="card-header px-0 d-flex justify-content-between align-items-start">
                          <h5>Mahasiswa</h5>
                          <div class="card-tools">
                            <button class="btn btn-default" id="mahasiswa"><i class="fas fa-refresh me-2"></i>Refresh</button>
                          </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-hover mahasiswa" style="width: 100% !important">
                                <thead class="table-primary"></thead>
                            </table>
                        </div>
                    </div>
                    <!-- Dosen -->
                    <div class="tab-pane fade" id="navs-dosen" role="tabpanel">
                      <div class="card-header px-0 d-flex justify-content-between align-items-start">
                        <h5>Dosen</h5>
                        <div class="card-tools">
                          <button class="btn btn-default" id="dosen"><i class="fas fa-refresh me-2"></i>Refresh</button>
                        </div>
                      </div>
                        <div class="table-responsive">
                            <table class="table table-hover dosen" style="width: 100% !important">
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
                      <div class="card-header px-0 d-flex justify-content-between align-items-start">
                        <h5>Tenaga Pendidik</h5>
                        <div class="card-tools">
                          <button class="btn btn-default" id="tendik"><i class="fas fa-refresh me-2"></i>Refresh</button>
                        </div>
                      </div>
                        <div class="table-responsive">
                            <table class="table table-hover tendik" style="width: 100% !important">
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

@endsection

@section('page-script')
    <script>
        function programstudi() {
            return $('.programstudi').DataTable({
                processing: true,
                serverSide: true,
                pagingType: "simple",
                ajax: {
                    url: "{{ route('pages-home-programstudi') }}"
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        title: 'No.',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'kode_prodi',
                        title: 'Kode Prodi',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_lemb',
                        title: 'Program Studi'
                    },
                    {
                        data: 'nm_jenj_didik',
                        title: 'Jenjang',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'soft_delete',
                        title: 'Status',
                        width: '5px',
                        className: 'text-center',
                        render: function(data, type, row) {
                            return data == '0' ? `<span class="badge bg-success">Aktif</span>` :
                                `<span class="badge bg-danger">Tidak Aktif</span>`;
                        }
                    },
                ],
            });
        }

        function mahasiswa() {
            return $('.mahasiswa').DataTable({
                processing: true,
                serverSide: true,
                pagingType: "simple",
                ajax: {
                    url: "{{ route('pages-home-mahasiswa') }}"
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        title: 'No.',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_lemb',
                        title: 'Program Studi'
                    },
                    {
                        data: 'nm_jenj_didik',
                        className: 'text-center',
                        title: 'Jenjang'
                    },
                    {
                        data: 'nasional',
                        className: 'text-center',
                        title: 'Nasional'
                    },
                    {
                        data: 'internasional',
                        className: 'text-center',
                        title: 'Internasional'
                    },
                ],
            });
        }

        function dosen() {
            return $('.dosen').DataTable({
                processing: true,
                serverSide: true,
                pagingType: "simple",
                ajax: {
                    url: "{{ route('pages-home-dosen') }}"
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        className: 'text-center'
                    },
                    {
                        data: 'nm_lemb',
                    },
                    {
                        data: 'nm_jenj_didik',
                        className: 'text-center'
                    },
                    {
                        data: 'pns_pria',
                        className: 'text-center'
                    },
                    {
                        data: 'pns_wanita',
                        className: 'text-center'
                    },
                    {
                        data: 'kontrak_pria',
                        className: 'text-center'
                    },
                    {
                        data: 'kontrak_wanita',
                        className: 'text-center'
                    },
                ],
            });
        }

        function tendik() {
            return $('.tendik').DataTable({
                processing: true,
                serverSide: true,
                pagingType: "simple",
                ajax: {
                    url: "{{ route('pages-home-tendik') }}"
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        className: 'text-center'
                    },
                    {
                        data: 'nm_lemb',
                    },
                    {
                        data: 'pns_pria',
                        className: 'text-center'
                    },
                    {
                        data: 'pns_wanita',
                        className: 'text-center'
                    },
                    {
                        data: 'kontrak_pria',
                        className: 'text-center'
                    },
                    {
                        data: 'kontrak_wanita',
                        className: 'text-center'
                    },
                ],
            });
        }

        $(document).ready(function() {
            programstudi();
            mahasiswa();
            dosen();
            tendik();

            $('#programstudi').on('click', function() {
              $('.programstudi').DataTable().clear().destroy();
              programstudi();
            });
            $('#mahasiswa').on('click', function() {
              $('.mahasiswa').DataTable().clear().destroy();
              mahasiswa();
            });
            $('#dosen').on('click', function() {
              $('.dosen').DataTable().clear().destroy();
              dosen();
            });
            $('#tendik').on('click', function() {
              $('.tendik').DataTable().clear().destroy();
              tendik();
            });
        });
    </script>
@endsection
