@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-3 bg-white">
    <div class="row">
        <div class="col-md-5 border-right line">
            <div class="p-3 py-5">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="text-right">Ubah Data Status Tugas Akhir</h4>
                </div>
                <div class="row mt-2">
                    <div class="col-md-12 mt-3"><label class="labels">Judul Tugas Akhir</label><input type="email" class="form-control" placeholder="education" value="Surat Keterangan Pendamping Ijazah (SKPI) Berbasis Website
                        dengan Laravel Framework pada Fakultas Teknik Universitas Lampung"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Nama Pembimbing 1</label><input type="email" class="form-control" placeholder="education" value="Ing. Hery Dian Septama,S.T."></div>
                    <div class="col-md-12 mt-3"><label class="labels">Nama Pembimbing 2</label><input type="email" class="form-control" placeholder="education" value="Yessi Mulyani, S.T.,M.T."></div>
                    <div class="col-md-12 mt-3"><label class="labels">Seminar Proposal</label><input type="email" class="form-control" placeholder="education" value="25 MEI 2019"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Seminar Hasil</label><input type="email" class="form-control" placeholder="education" value="15 September 2020"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Sidang Komprehensif</label><input type="email" class="form-control" placeholder="education" value="13 November 2020"></div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="p-4 py-6">
                <div class="card-body p-3">
                        <div class="row mt-2">
                            <div class="col-md-12 mt-3"><label class="labels">No. SK Kelulusan</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                            <div class="col-md-12 mt-3"><label class="labels">NINA</label><input type="email" class="form-control" placeholder="education" value="55202202100064"></div>
                            <div class="col-md-12 mt-3"><label class="labels">No. Ijazah</label><input type="email" class="form-control" placeholder="education" value="04716/26.5 S1/2021"></div>
                            <div class="col-md-12 mt-3"><label class="labels">Program</label><input type="email" class="form-control" placeholder="education" value="Sarjana (S1)"></div>
                            <div class="col-md-12 mt-3"><label class="labels">Prodi</label><input type="email" class="form-control" placeholder="education" value="Teknik Informatika"></div>
                            <div class="mt-5 text-center"><button class="btn btn-sm btn-round mb-0 me-1 bg-gradient-dark" type="button">Simpan Data</button></div>
                        </div>
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
