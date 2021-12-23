@extends('mahasiswa::layouts.master')
@section('title', 'Data Pribadi')

@section('css')
<style>
.form-control:focus {
    box-shadow: none;
    border-color: #BA68C8
}

.profile-button {
    background: rgb(99, 39, 120);
    box-shadow: none;
    border: none
}

.profile-button:hover {
    background: #682773
}

.profile-button:focus {
    background: #682773;
    box-shadow: none
}

.profile-button:active {
    background: #682773;
    box-shadow: none
}

.back:hover {
    color: #682773;
    cursor: pointer
}

.labels {
    font-size: 11px
}

.add-experience:hover {
    background: #BA68C8;
    color: #fff;
    cursor: pointer;
    border: solid 1px #BA68C8
}

.line {
  border-right: 0.1px solid lightslategray;
}
</style>
@stop

@section('content')

<div class="container-fluid py-4 bg-white">
    <div class="row">
        <div class="col-md-3 border-right line">
            <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img class="rounded-circle mt-5" width="150px" src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"><span class="font-weight-bold">Mizar Zulmi Ramadhan</span><span class="text-black-50">mizarzulmi.my.id/</span><span> </span></div>
        </div>
        <div class="col-md-5 border-right line">
            <div class="p-3 py-5">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="text-right">Detail Profil</h4>
                </div>
                <div class="row mt-2">
                    <div class="col-md-6"><label class="labels">Nama Mahasiswa</label><input type="text" class="form-control" placeholder="Nama Mahasiswa" value="Mizar Zulmi Ramadhan"></div>
                    <div class="col-md-6"><label class="labels">NPM</label><input type="number" class="form-control" placeholder="NPM" value="1717051073"></div>
                </div>
                <div class="row mt-3">
                    <div class="row mt-2">
                    <div class="col-md-4"><label class="labels">Jenis Kelamin</label><input type="text" class="form-control" placeholder="enter address line 2" value="Laki-Laki"></div>
                    <div class="col-md-4"><label class="labels">Tempat Lahir</label><input type="text" class="form-control" placeholder="enter address line 2" value="Bandar Lampung"></div>
                    <div class="col-md-4"><label class="labels">Tanggal Lahir</label><input type="text" class="form-control" placeholder="enter address line 2" value="02-05-1998"></div>
                    </div>
                    <div class="col-md-12 mt-3"><label class="labels">Agama</label><input type="text" class="form-control" placeholder="enter address line 1" value="Islam"></div>
                    <div class="row mt-2">
                    <div class="col-md-6 mt-2"><label class="labels">NIK</label><input type="number" class="form-control" placeholder="enter email id" value="1717051073"></div>
                    <div class="col-md-6 mt-2"><label class="labels">KK</label><input type="number" class="form-control" placeholder="education" value="1717051073"></div>
                    </div>
                    <div class="col-md-12 mt-3"><label class="labels">No. Hp</label><input type="number" class="form-control" placeholder="enter phone number" value="089516501662"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Email</label><input type="email" class="form-control" placeholder="education" value="mizarzulmiramadhan@gmail.com"></div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-4"><label class="labels">Provinsi</label><input type="text" class="form-control" placeholder="country" value="Lampung"></div>
                    <div class="col-md-4"><label class="labels">Kota/Kab</label><input type="text" class="form-control" value="Bandar Lampung" placeholder="state"></div>
                    <div class="col-md-4"><label class="labels">Kecamatan</label><input type="text" class="form-control" value="Sukarame" placeholder="state"></div>
                </div>
                <div class="col-md-12 mt-3"><label class="labels">Alamat</label><input type="text" class="form-control" placeholder="enter address line 1" value="Islam"></div>
                <div class="mt-5 text-center"><button class="btn btn-sm btn-round mb-0 me-1 bg-gradient-dark" type="button">Simpan Data</button></div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="p-3 py-5">
                <div class="d-flex justify-content-between align-items-center experience"><span>Riwayat Pendidikan</span><span class="btn btn-sm btn-round mb-0 me-1 bg-gradient-dark"><i class="fa fa-plus"></i>&nbsp;Tambah</span></div><br>
                <div class="card-body p-3">
                    <div class="timeline timeline-one-side">
                      <div class="timeline-block mb-3">
                        <span class="timeline-step">
                          <i class="ni ni-hat-3 text-warning text-gradient"></i>
                        </span>
                        <div class="timeline-content">
                          <h6 class="text-dark text-sm font-weight-bold mb-0">SMK Negeri 4 Bandar Lampung</h6>
                          <p class="text-dark text-sm font-weight-bold mb-0">(Teknik Komputer Jaringan)</p>
                          <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">2014 - 2017</p>
                        </div>
                      </div>
                      <div class="timeline-block mb-3">
                        <span class="timeline-step">
                            <i class="ni ni-hat-3 text-primary text-gradient"></i>
                        </span>
                        <div class="timeline-content">
                          <h6 class="text-dark text-sm font-weight-bold mb-0">Universitas Lampung</h6>
                          <p class="text-dark text-sm font-weight-bold mb-0">(S1 Ilmu Komputer)</p>
                          <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">2017-2021</p>
                        </div>
                      </div>
                    </div>
                  </div>
            </div>
        </div>
    </div>
</div>
</div>
</div>
@endsection
