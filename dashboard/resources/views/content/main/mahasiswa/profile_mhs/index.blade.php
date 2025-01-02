@extends('layouts/layoutMaster')

@section('title', 'Halaman Utama ' . $judul)

@section('content')
<div class="row">
    <div class="col-12">
        <div class="card mb-4">
            <!-- Banner -->
            <div class="position-relative">
                <!-- Banner Image -->
                <img src="/assets/img/pages/profile-banner.png" alt="Banner image" class="img-fluid rounded-top w-100"
                    style="height: 200px; object-fit: cover;">
                <!-- Cetak Biodata Button -->
                <div class="position-absolute top-0 end-0 m-3">
                    <a href="javascript:void(0)" class="btn btn-primary">
                        <i class="fas fa-file-alt me-1"></i> Cetak Biodata
                    </a>
                </div>
            </div>

            <!-- Profile Section -->
            <div class="card-body">
                <div class="d-flex flex-column flex-lg-row align-items-start">
                    <!-- Profile Image -->
                    <div class="position-relative">
                        <img src="/assets/img/avatars/1.png" alt="user image"
                            class=" border border-3 border-white shadow-sm"
                            style="width: 150px; height: 150px; object-fit: cover; margin-top: -75px;">
                    </div>
                    
                    <!-- Status Aktif & IPK -->
                    <div class="ms-lg-4 mt-4 mt-lg-0">
                        <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                            <span class="badge px-3 py-2" style="background-color: #ACCDFF82; color:#444050">
                                <i class="fas fa-check-circle me-1" style="color:#0F71FD"></i> Status Aktif
                            </span>
                            <span class="badge px-3 py-2" style="background-color: #ACCDFF82;  color:#444050">
                                <span style=" color:#1172FD">IPK </span> 3.54
                            </span>
                        </div>
                        <!-- Profile Header -->
                        <h4 class="mt-3 mb-2">{{ $profile->nm_pd }} | <span class=" text-sm badge bg-primary">{{ $profile->nipd }}</span></h4>
                        <div class="d-flex flex-wrap gap-2">
                            <span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->nm_jenj_didik }} - {{ $profile->nm_lemb }}</span>
                            <span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">Masuk 2024 Ganjil</span>
                            <span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">Jalur {{ $profile->nm_jalur_daftar }}</span>
                            <span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">Tidak Beasiswa</span>
                        </div>
                    </div>
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
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab" data-bs-target="#domisili"
                        aria-controls="navs-mahasiswa" aria-selected="true">
                        <i class="fa-solid fa-location-dot me-1"></i>Domisili</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#sekolah" aria-controls="sekolah" aria-selected="true">
                            <i class="fa-solid fa-school ti-xs me-1"></i> Sekolah</button></li>
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#perguruan-tinggi" aria-controls="navs-tendik" aria-selected="true"><i
                            class="fa-solid fa-graduation-cap ti-xs me-1"></i>Perguruan Tinggi</button></li>
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
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050; "><i class="bi bi-gender-male"></i>
                                            {{ $profile->jk === 'L' ? 'Laki-Laki' : 'Perempuan' }}</span></td>
                                </tr>
                                <tr>
                                    <th>Tempat Lahir</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->tmpt_lahir }}</span></td>
                                </tr>
                                <tr>
                                    <th>Tanggal Lahir</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ tglIndonesia($profile->tgl_lahir) }}</span></td>
                                </tr>
                                <tr>
                                    <th>Agama</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $agama }}</span></td>
                                </tr>
                                <tr>
                                    <th>No. Telp./No. HP</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->tlpn_hp }}</span></td>
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
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->email }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Email Pribadi</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">office.m.abdul@gmail.com</span></td>
                                </tr>
                                <tr>
                                    <th>NIK</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->nik }}</span></td>
                                </tr>
                                {{-- <tr>
                                    <th>Pekerjaan</th>
                                    <td><span class="badge text-dark" style="background-color: #ACCDFF;">-</span></td>
                                </tr>
                                <tr>
                                    <th>Penghasilan</th>
                                    <td><span class="badge text-dark" style="background-color: #ACCDFF;">-</span></td>
                                </tr>
                                <tr>
                                    <th>Instansi Pekerjaan</th>
                                    <td><span class="badge text-dark" style="background-color: #ACCDFF;">-</span></td>
                                </tr> --}}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <!-- Mahasiswa -->
        <div class="tab-pane fade" id="domisili" role="tabpanel">
            <div
                class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0 pb-1">
                <h5>Domisili</h5>
            </div>

            <div class="col-md-6">
                <table class="table table-borderless">
                    <tbody>
                        <tr>
                            <th>Alamat</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->jln }}</span></td>
                        </tr>
                        <tr>
                            <th>RT/RW</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->rt }} / {{ $profile->rw ?? '-' }}</span></td>
                        </tr>
                        <tr>
                            <th>Dusun</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">Dusun 12</span></td>
                        </tr>
                        <tr>
                            <th>Desa/Kelurahan</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                        </tr>
                        <tr>
                            <th>Kota</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                        </tr>
                        <tr>
                            <th>Kecamatan</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                        </tr>
                        <tr>
                            <th>Provinsi</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">68</span></td>
                        </tr>
                        <tr>
                            <th>Kewarganegaraan</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">172</span></td>
                        </tr>
                        <tr>
                            <th>Kode Pos</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">34164</span></td>
                        </tr>
                    </tbody>
                </table>
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
                                    <td><span class="badge fw-semibold"  style="background-color: #ACCDFF; color: #444050">SMA</span></td>
                                </tr>
                                <tr>
                                    <th>Provinsi Sekolah</th>
                                    <td><span class="badge fw-semibold"  style="background-color: #ACCDFF; color: #444050">Lampung</td>
                                </tr>
                                <tr>
                                    <th>Kota Sekolah</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">Lampung Tengah</span></td>
                                </tr>
                                <tr>
                                    <th>NISN</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">12301995</span></td>
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
                                    <td><span class="badge fw-semibold"  style="background-color: #ACCDFF; color: #444050">Bandar Lampung</span></td>
                                </tr>
                                <tr>
                                    <th>Telepon Sekolah</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">masih kosong</span></td>
                                </tr>
                                <tr>
                                    <th>Nomor Ijazah Sekolah</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">masih kosong</span></td>
                                </tr>
                                <tr>
                                    <th>File Ijazah SMA</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">masih kosong</span></td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <!-- Perguruan Tinggi -->
        <div class="tab-pane fade" id="perguruan-tinggi" role="tabpanel">
            <div class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 px-0 pb-1">
                <h5>Perguruan Tinggi</h5>
            </div>
            <div class="row">
                <div class="row">
                    <!-- Kolom Kiri -->
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tbody>
                                <tr>
                                    <th>Perguruan Tinggi Asal</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                                </tr>
                                <tr>
                                    <th>Program Studi Asal</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                                </tr>
                                <tr>
                                    <th>NIM Asal</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                                </tr>
                                <tr>
                                    <th>IPK Asal</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Kolom Kiri -->
                    <div class="col-md-6">
                        <table class="table table-borderless">
                            <tbody>
                                <tr>
                                    <th>SKS Asal (Diakui)</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                                </tr>
                                <tr>
                                    <th>Surat Rekomen. Pindah</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                                </tr>
                                <tr>
                                    <th>Transkrip Asal</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">-</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- /Project table -->
</div>
@endsection
