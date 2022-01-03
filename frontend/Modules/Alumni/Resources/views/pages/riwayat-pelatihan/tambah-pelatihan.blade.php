@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-2 bg-white">
    <div class="row">
        <div class="col-md-5 border-right line">
            <div class="p-3 py-5">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="text-right">Tambah Data Pelatihan</h4>
                </div>
                <div class="row mt-2">
                    <div class="col-md-12 mt-3"><label class="labels">No.</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Pelatihan</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Tahun</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Penyelengara</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Lokasi</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Durasi</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                </div>
                <div class="mt-5 text-center"><button class="btn btn-sm btn-round mb-0 me-1 bg-gradient-dark" type="button">Simpan Data</button></div>
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
