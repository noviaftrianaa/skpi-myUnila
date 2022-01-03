@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-2 bg-white">
    <div class="row">
        <div class="col-md-5 border-right line">
            <div class="p-3 py-5">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="text-right">Tambah Data Pendidikan</h4>
                </div>
                <div class="row mt-2">
                    <div class="col-md-12 mt-3"><label class="labels">No.</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3" ><label for="exampleFormControlSelect1">Tingkat</label>
                        <select class="form-control" id="exampleFormControlSelect1">
                            <option>SD</option>
                            <option>SMP</option>
                            <option>SMA</option>
                            <option>D3</option>
                            <option>D4/S1</option>
                            <option>S2P</option>
                            <option>S3</option>
                        </select>
                    </div>
                    <div class="col-md-12 mt-3"><label class="labels">Satuan Pendidikan</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3" ><label for="exampleFormControlSelect1">Akreditasi</label>
                        <select class="form-control" id="exampleFormControlSelect1">
                            <option>A</option>
                            <option>B</option>
                            <option>C</option>
                            <option>D</option>
                            <option>-</option>
                        </select>
                    </div>
                    <div class="col-md-12 mt-3"><label class="labels">No. Ijazah</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Tanggal Ijazah</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Pejabat TTD</label><input type="email" class="form-control" placeholder="education" value="-"></div>
                    <div class="col-md-6"><label class="labels">Gelar Depan</label><input type="text" class="form-control" placeholder="Nama Mahasiswa" value="-"></div>
                    <div class="col-md-6"><label class="labels">Gelar Belakang</label><input type="text" class="form-control" placeholder="Nama Mahasiswa" value="-"></div>
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
