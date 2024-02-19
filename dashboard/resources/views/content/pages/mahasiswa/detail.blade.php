@extends('layouts/layoutMaster')

@section('title', 'Detail Mahasiswa ' . $profil->nm_pd)

@include('content.pages.mahasiswa.function')

@section('content')
    <!-- Header -->
    <div class="row">
        <div class="col-12">
            <div class="card mb-4">
              <div class="user-profile-header-banner pt-3 px-4 pb-5"></div>
              <div class="user-profile-header d-flex flex-column flex-sm-row text-sm-start text-center mb-4">
                  <div class="flex-shrink-0 mt-n1 mx-sm-0 mx-auto">
                        <img src="{{ asset('images/ghost_person.png') }}" alt="user image"
                            class="d-block h-auto ms-0 ms-sm-4 rounded user-profile-img">
                    </div>
                    <div class="flex-grow-1">
                      <div class="d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start mx-4 flex-md-row flex-column gap-4">
                            <div class="user-profile-info">
                                <h5 class="mb-1">{{ $profil->nm_pd }}</h5>
                                <ul class="list-inline d-flex d-lg-inline-block align-items-center flex-wrap justify-content-sm-start justify-content-center gap-2">
                                    <li class="list-inline-item d-flex gap-1" title="Prodi">
                                        <i class='ti ti-building'></i>
                                        {{ $profil->fak ? 'Fakultas ' . ucwords(strtolower($profil->fak)) : ' ' }}
                                        {{ $profil->jur ? ', ' . ucwords(strtolower($profil->jur)) : '' }}
                                        {!! $profil->prodi ? ', Program Studi ' . ucwords(strtolower($profil->prodi)) . " ($profil->nm_jenj_didik)" : '' !!}
                                    </li>
                                    <li class="list-inline-item d-flex gap-1" title="NPM">
                                        <i class='ti ti-id-badge'></i> {{ $profil->nipd ?? '-' }}
                                    </li>
                                </ul>
                            </div>

                            @if (is_null($profil->id_jns_keluar))
                                <a href="javascript:void(0)" class="btn btn-label-primary">AKTIF</a>
                            @elseif($profil->id_jns_keluar == '1')
                                <a href="javascript:void(0)" class="btn btn-label-success">{{ strtoupper($profil->ket_keluar) }}</a>
                            @elseif($profil->id_jns_keluar == 'C')
                                <a href="javascript:void(0)" class="btn btn-label-warning">{{ strtoupper($profil->ket_keluar) }}</a>
                            @else
                                <a href="javascript:void(0)" class="btn btn-label-danger">{{ strtoupper($profil->ket_keluar) }}</a>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Navbar pills -->
    <div class="row">
      <div class="col-md-12">
          <ul class="nav nav-pills flex-column flex-md-row mb-4">
              <li class="nav-item"><button class="nav-link active" role="tab" data-bs-toggle="tab"
                      data-bs-target="#semester" aria-controls="semester" aria-selected="true"><i
                          class="ti ti-book ti-xs me-1"></i>Riwayat Semester</button></li>
              <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                      data-bs-target="#mk" aria-controls="mk"
                      aria-selected="true"><i class="ti ti-book ti-xs me-1"></i>Riwayat Mata Kuliah</button></li>
              <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                      data-bs-target="#aktivitas" aria-controls="aktivitas" aria-selected="true"><i
                          class="ti ti-history ti-xs me-1"></i>Aktivitas Mahasiswa</button></li>
              <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                      data-bs-target="#prestasi" aria-controls="prestasi" aria-selected="true"><i
                          class="ti ti-notebook ti-xs me-1"></i>Prestasi</button></li>
          </ul>
      </div>
  </div>
  <!--/ Navbar pills -->

  <!-- User Profile Content -->
  <div class="card mb-4">
      <div class="tab-content pt-0">
          <div class="tab-pane fade show active" id="semester" role="tabpanel">
              <div class="card-header">
                  <h5>Riwayat Semester</h5>
              </div>
              <div class="card-body">
                  <div class="table-responsive">
                      <table id="tSemester" class="table table-striped table-hover table-bordered table-sm" width="100% !important">
                          <thead class="table-primary"></thead>
                      </table>
                  </div>
              </div>
          </div>
          <div class="tab-pane fade" id="mk" role="tabpanel">
              <div class="card-header">
                  <h5>Riwayat Mata Kuliah</h5>
              </div>
              <div class="card-body">
                  <div class="table-responsive">
                      <table id="tMK" class="table table-striped table-hover table-bordered table-sm" width="100% !important">
                          <thead class="table-primary"></thead>
                      </table>
                  </div>
              </div>
          </div>
          <div class="tab-pane fade" id="aktivitas" role="tabpanel">
              <div class="card-header">
                  <h5>Aktivitas Mahasiswa</h5>
              </div>
              <div class="card-body">
                  <div class="table-responsive">
                      <table id="tAktivitas" class="table table-striped table-hover table-bordered table-sm" width="100% !important">
                          <thead class="table-primary"></thead>
                      </table>
                  </div>
              </div>
          </div>
          <div class="tab-pane fade" id="prestasi" role="tabpanel">
              <div class="card-header">
                  <h5>Prestasi</h5>
              </div>
              <div class="card-body">
                  <div class="table-responsive">
                      <table id="tPrestasi" class="table table-striped table-hover table-bordered table-sm" width="100% !important">
                          <thead class="table-primary"></thead>
                      </table>
                  </div>
              </div>
          </div>
      </div>
  </div>
  <!--/ User Profile Content -->

@endsection
