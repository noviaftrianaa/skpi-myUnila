@extends('layouts/layoutMaster')

@section('title', 'Halaman Utama '.$judul)

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card mb-4">
            <!-- Banner -->
            <div class="position-relative">
                <img src="/assets/img/pages/profile-banner.png" alt="Banner image" class="img-fluid rounded-top w-100" style="height: 200px; object-fit: cover;">
            </div>
            <!-- Profile Header -->
            <div class="card-body d-flex flex-column flex-lg-row text-center text-lg-start align-items-center mt-5">
                <!-- Profile Image -->
                <div class="flex-shrink-0 mt-n5">
                    <img src="/assets/img/avatars/1.png" alt="user image" class="rounded-circle border border-3 border-white shadow-sm" style="width: 120px; height: 120px;">
                </div>
                <!-- Profile Info -->
                <div class="flex-grow-1 mt-3 mt-lg-0 ps-lg-4">
                    <h4 class="mb-2">M. Abdul Adhim</h4>
                    <div class="d-flex flex-wrap justify-content-center justify-content-lg-start gap-2">
                        <span class="badge bg-primary">S1 - Ilmu Komputer</span>
                        <span class="badge bg-secondary">Masuk 2024 Ganjil</span>
                        <span class="badge bg-success">Sistem Kuliah Reguler</span>
                        <span class="badge bg-warning text-dark">Peserta Didik Baru</span>
                        <span class="badge bg-info text-dark">Jalur SNMPTN</span>
                        <span class="badge bg-light text-dark">Gelombang 1</span>
                        <span class="badge bg-danger">Tidak Beasiswa</span>
                    </div>
                </div>
                <!-- Action Button -->
                <div class="mt-3 mt-lg-0">
                    <a href="javascript:void(0)" class="btn btn-primary">
                        <i class="bi bi-printer"></i> Cetak Biodata
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row mt-5">
    <div class="col-md-12">
        <div class="nav-align-top">
            <ul class="nav nav-pills flex-column flex-md-row mb-4">
                <li class="nav-item"><button class="nav-link active" role="tab" data-bs-toggle="tab"
                        data-bs-target="#informasi_umum" aria-controls="navs-program-studi" aria-selected="true">
                        <span class=" me-1">
                            <i class="fa-solid fa-circle-info"></i>
                        </span>
                        Informasi Umum</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#navs-mahasiswa" aria-controls="navs-mahasiswa" aria-selected="true">
                        <i class="fa-solid fa-location-dot me-1"></i>Domisili</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#sekolah" aria-controls="sekolah" aria-selected="true">
                            <i class="fa-solid fa-school ti-xs me-1"></i> Sekolah</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#navs-tendik" aria-controls="navs-tendik" aria-selected="true"><i
                            class="ti ti-users-group ti-xs me-1"></i>Tenaga Kependidikan</button></li>
            </ul>
        </div>
    </div>
</div>

<div class="card">
    <!-- Program Studi -->
    <div class="tab-content pt-0">
        <div class="tab-pane fade show active" id="informasi_umum" role="tabpanel">
            <div
                class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0 pb-1">
                <h5>Informasi Umum</h5>
            </div>
            <div class="row">
                <div class="row">
                    <!-- Kolom Kiri -->
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tbody>
                                <tr>
                                    <th>Jenis Kelamin</th>
                                    <td><span class="badge bg-primary"><i class="bi bi-gender-male"></i> Laki-Laki</span></td>
                                </tr>
                                <tr>
                                    <th>Tempat Lahir</th>
                                    <td>Lampung Tengah</td>
                                </tr>
                                <tr>
                                    <th>Tanggal Lahir</th>
                                    <td><span class="badge bg-light  text-dark">Tgl Bulan Tahun</span></td>
                                </tr>
                                <tr>
                                    <th>Agama</th>
                                    <td><span class="badge bg-light text-dark">-</span></td>
                                </tr>
                                <tr>
                                    <th>Suku</th>
                                    <td><span class="badge bg-light text-dark">-</span></td>
                                </tr>
                                <tr>
                                    <th>Golongan Darah</th>
                                    <td><span class="badge bg-light text-dark">-</span></td>
                                </tr>
                                <tr>
                                    <th>Berat Badan (kg)</th>
                                    <td><span class="badge bg-light text-dark">68</span></td>
                                </tr>
                                <tr>
                                    <th>Tinggi Badan (cm)</th>
                                    <td><span class="badge bg-light text-dark">172</span></td>
                                </tr>
                                <tr>
                                    <th>No. Telp./No. HP</th>
                                    <td><span class="badge bg-light text-dark">081271545451</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- Kolom Kanan -->
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tbody>
                                <tr>
                                    <th>Email Kampus</th>
                                    <td><span class="badge bg-light text-dark">2217051030@student.unila.ac.id</span></td>
                                </tr>
                                <tr>
                                    <th>Email Pribadi</th>
                                    <td><span class="badge bg-light text-dark">office.m.abdul@gmail.com</span></td>
                                </tr>
                                <tr>
                                    <th>Status Nikah</th>
                                    <td><span class="badge bg-light text-dark">Lajang</span></td>
                                </tr>
                                <tr>
                                    <th>NIK</th>
                                    <td><span class="badge bg-light text-dark">0000000000000000</span></td>
                                </tr>
                                <tr>
                                    <th>No. KK</th>
                                    <td><span class="badge bg-light text-dark">0000000000000000</span></td>
                                </tr>
                                <tr>
                                    <th>No. KPS</th>
                                    <td><span class="badge bg-light text-dark">-</span></td>
                                </tr>
                                <tr>
                                    <th>Pekerjaan</th>
                                    <td><span class="badge bg-light text-dark">-</span></td>
                                </tr>
                                <tr>
                                    <th>Penghasilan</th>
                                    <td><span class="badge bg-light text-dark">-</span></td>
                                </tr>
                                <tr>
                                    <th>Instansi Pekerjaan</th>
                                    <td><span class="badge bg-light text-dark">-</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <!-- Mahasiswa -->
        <div class="tab-pane fade" id="navs-mahasiswa" role="tabpanel">
            <div class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0 pb-1">
                <h5>Domisili</h5>

            </div>
        </div>
        <!-- Sekolah -->
        <div class="tab-pane fade" id="sekolah" role="tabpanel">
            <div
                class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0 pb-1">
                <h5>Sekolah</h5>
            </div>
            <div class="row">
                <div class="row">
                    <!-- Kolom Kiri -->
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tbody>
                                <tr>
                                    <th>Pendidikan Asal</th>
                                    <td><span class="badge text-dark"  style="background-color: #ACCDFF;">SMA</span></td>
                                </tr>
                                <tr>
                                    <th>Provinsi Sekolah</th>
                                    <td><span class="badge text-dark"  style="background-color: #ACCDFF;">Lampung</td>
                                </tr>
                                <tr>
                                    <th>Kota Sekolah</th>
                                    <td><span class="badge text-dark" style="background-color: #ACCDFF;">Lampung Tengah</span></td>
                                </tr>
                                <tr>
                                    <th>NISN</th>
                                    <td><span class="badge text-dark" style="background-color: #ACCDFF;">12301995</span></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                    <!-- Kolom Kanan -->
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tbody>
                                <tr>
                                    <th>Alamat Sekolah</th>
                                    <td><span class="badge text-dark"  style="background-color: #ACCDFF;">Bandar Lampung</span></td>
                                </tr>
                                <tr>
                                    <th>Telepon Sekolah</th>
                                    <td><span class="badge text-dark" style="background-color: #ACCDFF;">masih kosong</span></td>
                                </tr>
                                <tr>
                                    <th>Nomor Ijazah Sekolah</th>
                                    <td><span class="badge text-dark" style="background-color: #ACCDFF;">masih kosong</span></td>
                                </tr>
                                <tr>
                                    <th>File Ijazah SMA</th>
                                    <td><span class="badge text-dark" style="background-color: #ACCDFF;">masih kosong</span></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tenaga Pendidik -->
        <div class="tab-pane fade" id="navs-tendik" role="tabpanel">
            <div class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0 pb-1">
                <h5>Tenaga Kependidikan</h5>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover tendik table-sm" style="width: 100% !important">
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
@endsection
