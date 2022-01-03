@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-2 bg-white">
    <div class="row">
        <div class="col-md-5 border-right line">
            <div class="p-3 py-5">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="text-right">Tambah Pengajuan Legalisasi</h4>
                </div>
                <div class="row mt-2">
                    <div class="form-group">
                        <label for="exampleFormControlFile1">Unggah Dokumen</label>
                        <input type="file" class="form-control-file" id="exampleFormControlFile1">
                      </div>
                    <div class="col-md-12 mt-3" ><label for="exampleFormControlSelect1">Jenis Dokumen</label>
                        <select class="form-control" id="exampleFormControlSelect1">
                            <option>Ijazah</option>
                            <option>Transkrip</option>
                        </select>
                    </div>
                    <div class="col-md-12 mt-3" ><label for="exampleFormControlSelect1">Jumlah</label>
                        <select class="form-control" id="exampleFormControlSelect1">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                            <option>8</option>
                            <option>9</option>
                            <option>10</option>
                        </select>
                    </div>
                    <div class="col-md-12 mt-3"><label class="labels">Pengambilan</label><div class="form-check">
                        <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios1" value="option1" checked>
                        <label class="form-check-label" for="exampleRadios1">
                          Dikirim
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="exampleRadios" id="exampleRadios2" value="option2">
                        <label class="form-check-label" for="exampleRadios2">
                          Ambil di Fakultas
                        </label>
                      </div></div>
                    <div class="col-md-12 mt-3"><label class="labels">Alamat Pengiriman</label><textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                    <div class="col-md-12 mt-3"><label class="labels">Biaya Legalisasi</label><input type="email" class="form-control" placeholder="education" value="20000"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Tarif Pengiriman</label><input type="email" class="form-control" placeholder="education" value="10000"></div>
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
