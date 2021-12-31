@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-4 bg-white">
    <div class="row">
        <div class="col-md-3 border-right line">
            <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img class="rounded-circle mt-5" width="150px" src="../assets/img/ily.jpeg"><br><span class="font-weight-bold">Aprily Ayu Anbar</span></div>
        </div>
        <div class="col-md-5 border-right line">
            <div class="p-3 py-5">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="text-right">Ubah Data Profil</h4>
                </div>
                <div class="row mt-2">
                    <div class="col-md-6"><label class="labels">Nama</label><input type="text" class="form-control" placeholder="Nama Mahasiswa" value="Aprily Ayu Anbar" disabled></div>
                    <div class="col-md-6"><label class="labels">NPM</label><input type="number" class="form-control" placeholder="NPM" value="1515061005" disabled></div>
                    <div class="col-md-12 mt-3"><label class="labels">Angkatan</label><input type="email" class="form-control" placeholder="education" value="2015"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Tanggal Masuk</label><input type="email" class="form-control" placeholder="education" value="24 Agustus 2015"></div>
                    <div class="col-md-12 mt-3"><label class="labels">Tanggal Lulus</label><input type="email" class="form-control" placeholder="education" value="13 November 2020"></div>
                    <div class="col-md-12 mt-3"><label class="labels">IPK</label><input type="email" class="form-control" placeholder="education" value="3.67"></div>
                </div>
                <div class="row mt-3">
                    <div class="row mt-2">
                    <div class="col-md-4"><label class="labels">Jenis Kelamin</label><input type="text" class="form-control" placeholder="enter address line 2" value="Perempuan" disabled></div>
                    <div class="col-md-4"><label class="labels">Tempat Lahir</label><input type="text" class="form-control" placeholder="enter address line 2" value="Bandar Lampung"></div>
                    <div class="col-md-4"><label class="labels">Tanggal Lahir</label><input type="text" class="form-control" placeholder="enter address line 2" value="22 April 1997"></div>
                    </div>
                    <div class="col-md-12 mt-3"><label class="labels">Agama</label><input type="text" class="form-control" placeholder="enter address line 1" value="Islam"></div>
                    <div class="row mt-2">
                    <div class="col-md-6 mt-2"><label class="labels">NIK</label><input type="text" class="form-control" placeholder="187109620497****" value="187109620497****"></div>
                    <div class="col-md-6 mt-2"><label class="labels">KK</label><input type="text" class="form-control" placeholder="1871096204979999" value="187109620497****"></div>
                    </div>
                    <div class="col-md-12 mt-3"><label class="labels">No. Hp</label><input type="number" class="form-control" placeholder="enter phone number" value="081263191563"></div>
                </div>
                <div class="row mt-3">
                    <div class="col-md-4"><label class="labels">Provinsi</label><input type="text" class="form-control" placeholder="country" value="Lampung"></div>
                    <div class="col-md-4"><label class="labels">Kota/Kab</label><input type="text" class="form-control" value="Bandar Lampung" placeholder="Bandar Lampung"></div>
                    <div class="col-md-4"><label class="labels">Kecamatan</label><input type="text" class="form-control" value="Sukarame" placeholder="Teluk Betung Utara"></div>
                </div>
                <div class="col-md-12 mt-3"><label class="labels">Alamat</label><input type="text" class="form-control" placeholder="enter address line 1" value="Jln. MS Batubara no. 38/40 Kupang Teba"></div>
                <div class="col-md-12 mt-3"><label class="labels">Sosial Media</label><input type="text" class="form-control" placeholder="enter address line 1" value=""></div>
                <div class="mt-5 text-center"><button class="btn btn-sm btn-round mb-0 me-1 bg-gradient-dark" type="button">Simpan Data</button></div>
            </div>
        </div>
          {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection
