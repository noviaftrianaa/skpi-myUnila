@extends('mahasiswa::components.master')
@section('title', 'Beasiswa')

@section('css')
<style>

</style>
@stop

@section('content')
<div class="container-fluid py-4">
    <div class="card-group">
        <div class="card col-sm-6 col-md-3 shadow-sm p-3 mb-5 bg-white rounded text-center">
            <div class="card-header border-0" style="min-height: 80px;background:white">
                <img src="https://beasiswa.kemdikbud.go.id/assets/images/icons/ic_graduation_cap_s1d4.png"
                    class="img-fluid" width="150">
            </div>
            <div class="card-body  border-0">
                <h5 class="card-title">Beasiswa S1 / D4 </h5>
                <p class="card-text">
                    Khusus Calon Guru SMK, Pelaku Budaya, Beasiswa Prestasi Talenta dan Prestasi Akademik <br> (Dalam
                    &amp; Luar Negeri)
                </p>

            </div>
            <div class="card-footer  border-0" style="min-height: 80px;background:white">
                <a class="btn btn-sm btn-round mb-0 me-1 btn-primary mb-3" href="https://beasiswa.kemdikbud.go.id/dashboard"> Daftar </a><br>
                <a href="https://beasiswa.kemdikbud.go.id/syarat-s1">Persyaratan Pendaftaran</a></div>
        </div>

        <div class="card col-sm-6 col-md-3 shadow-sm p-3 mb-5 bg-white rounded text-center">
            <div class="card-header border-0" style="min-height: 80px;background:white">
                <img src="https://beasiswa.kemdikbud.go.id/assets/images/icons/ic_dual_degree.png" class="img-fluid"
                    width="150">
            </div>
            <div class="card-body border-0">
                <h5 class="card-title">Beasiswa S2 / S3 Dosen / Calon Dosen &amp; Beasiswa Joint Degree / Dual Degree
                </h5>
                <p class="card-text">
                    Khusus Dosen Perguruan Tinggi Akademik dan Dosen / Calon Dosen Perguruan Tinggi Vokasi <br> (Dalam
                    &amp; Luar Negeri)
                </p>
            </div>
            <div class="card-footer border-0" style="min-height: 80px;background:white">
                <a href="http://beasiswadosen.kemdikbud.go.id" class="btn btn-sm btn-round mb-0 me-1 btn-primary mb-3"> Daftar </a> <br>
                <a href="https://beasiswa.kemdikbud.go.id/syarat-dosen">Persyaratan Pendaftaran</a>
            </div>
        </div>

        <div class="card col-sm-6 col-md-3 shadow-sm p-3 mb-5 bg-white rounded text-center">
            <div class="card-header border-0" style="min-height: 80px;background:white">
                <img src="https://beasiswa.kemdikbud.go.id/assets/images/icons/ic_graduation_cap_s2s3.png"
                    class="img-fluid" width="150">
            </div>
            <div class="card-body border-0">
                <h5 class="card-title">Beasiswa S2 / S3 <br>Non Dosen</h5>
                <p class="card-text">
                    Khusus GTK, Pelaku Budaya dan Beasiswa Prestasi Talenta <br>(Dalam &amp; Luar Negeri)
                </p>
            </div>
            <div class="card-footer border-0" style="min-height: 80px;background:white">
                <a class="btn btn-sm btn-round mb-0 me-1 btn-primary mb-3" href="https://beasiswa.kemdikbud.go.id/dashboard"> Daftar </a> <br>
                <a href="https://beasiswa.kemdikbud.go.id/syarat-non-dosen">Persyaratan Pendaftaran</a>
            </div>
        </div>
        <div class="card col-sm-6 col-md-3 shadow-sm p-3 mb-5 bg-white rounded text-center">
            <div class="card-header border-0" style="min-height: 80px;background:white">
                <img src="https://beasiswa.kemdikbud.go.id/assets/images/icons/ic_lpdp.png" class="img-fluid"
                    width="150">
            </div>
            <div class="card-body border-0">
                <h5 class="card-title">Beasiswa S2 / S3 <br>LPDP </h5>
                <p class="card-text">
                    (Dalam &amp; Luar Negeri) ditujukan bagi setiap warganegara Indonesia yang telah lulus S1/D4 atau lulusan S2 dan ingin lanjut studi ke jenjang master maupun doktor.
                </p>
            </div>
            <div class="card-footer border-0" style="min-height: 80px;background:white">
                <a href="https://beasiswalpdp.kemenkeu.go.id" class="btn btn-sm btn-round mb-0 me-1 btn-primary mb-3"> Daftar </a> <br>
                <a href="https://www.lpdp.kemenkeu.go.id/in/page/Beasiswa2021" target="_blank">Persyaratan
                    Pendaftaran</a>
            </div>
        </div>
    </div>
</div>
@endsection
