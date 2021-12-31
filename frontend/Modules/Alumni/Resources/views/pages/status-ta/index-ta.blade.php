@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-4">
<div class="col-12 mt-2">
  <div class="card h-100">
    <div class="card-header pb-0 p-3">
      <div class="row">
        <div class="col-md-8 d-flex align-items-center">
          <h6 class="mb-0">Status Tugas Akhir</h6>
        </div>
        <div class="col-md-4 text-end">
          <a href="{{url('alumni/edit-status-ta')}}">
            <i class="fas fa-cog text-secondary text-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Ubah"></i>
          </a>
        </div>
      </div>
    </div>
    <hr>
    <div class="card-body p-3">
      <div class="timeline timeline-one-side">
        <div class="timeline-block mb-3">
          <span class="timeline-step">
            <i class="ni ni-bulb-61 text-warning text-gradient"></i>
          </span>
          <div class="timeline-content">
            <h6 class="text-dark text-sm font-weight-bold mb-0">Seminar Proposal</h6>
            <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">25 MEI 2019</p>
          </div>
        </div>
        <div class="timeline-block mb-3">
          <span class="timeline-step">
              <i class="ni ni-bulb-61 text-primary text-gradient"></i>
          </span>
          <div class="timeline-content">
            <h6 class="text-dark text-sm font-weight-bold mb-0">Seminar Hasil</h6>
            <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">15 September 2020</p>
          </div>
        </div>
        <div class="timeline-block mb-3">
          <span class="timeline-step">
              <i class="ni ni-bulb-61 text-success text-gradient"></i>
          </span>
          <div class="timeline-content">
              <h6 class="text-dark text-sm font-weight-bold mb-0">Sidang Komprehensif</h6>
              <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">13 November 2020</p>
            </div>
        </div>
      </div>
      <div class="card-body px-0 pt-0 pb-2">
        <div class="table-responsive p-0">
          <table class="table align-items-center mb-0">
            <thead>
              <tr>
                <td class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Judul Tugas Akhir</td>
                <td>:</td>
                <td class="text-xs font-weight-bold mb-0">Surat Keterangan Pendamping Ijazah (SKPI) Berbasis Website <br> dengan Laravel Framework pada Fakultas Teknik Universitas Lampung</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama Pembimbing</td>
                <td>:</td>
                <td>
                  <p class="text-xs font-weight-bold mb-0">1. Ing. Hery Dian Septama,S.T.</p>
                  <p class="text-xs font-weight-bold mb-0">2. Yessi Mulyani, S.T.,M.T.</p>
                </td>
              </tr>
              <tr>
                <td class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No. SK Kelulusan</td>
                <td>:</td>
                <td>-</td>
              </tr>
              <tr>
                <td class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">NINA</td>
                <td>:</td>
                <td class="text-xs font-weight-bold mb-0">55202202100064</td>
              </tr>
              <tr>
                <td class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No. Ijazah</td>
                <td>:</td>
                <td class="text-xs font-weight-bold mb-0">04716/26.5 S1/2021</td>
              </tr>
              <tr>
                <td class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Program</td>
                <td>:</td>
                <td class="text-xs font-weight-bold mb-0">Sarjana (S1)</td>
              </tr>
              <tr>
                <td class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Prodi</td>
                <td>:</td>
                <td class="text-xs font-weight-bold mb-0">Teknik Informatika</td>
              </tr>
            </tbody>
            </table>
        </div>
      </div>
    </div>
  </div>
</div>
</div>
</div>
    
    {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection
