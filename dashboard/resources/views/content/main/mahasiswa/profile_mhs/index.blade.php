@extends('layouts/layoutMaster')

@section('title', $judul)

@include('content.main.mahasiswa.profile_mhs.function')

@section('page-style')
    <style>
            .accordion-button.collapsed::after {
            color: white; /* Ikon panah ketika accordion tertutup */
        }
        .accordion-button::after {
            color: white; /* Ikon panah ketika accordion terbuka */
        }
        .accordion-item {
            border-radius: 8px; /* Membulatkan sudut seluruh item accordion */
            overflow: hidden; /* Agar bagian konten tetap rapi dan tidak keluar dari border */
        }
    </style>
@endsection

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
                                <i class="fas fa-check-circle me-1" style="color:#0F71FD"></i> Status {{ $profile->nm_stat_mhs }}
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
                {{-- <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#sekolah" aria-controls="sekolah" aria-selected="true">
                            <i class="fa-solid fa-school ti-xs me-1"></i> Sekolah</button></li> --}}
                <li class="nav-item"><button class="nav-link" role="tab" data-bs-toggle="tab"
                        data-bs-target="#perguruan-tinggi" aria-controls="navs-tendik" aria-selected="true"><i
                            class="fa-solid fa-graduation-cap ti-xs me-1"></i>Perguruan Tinggi</button></li>
                {{-- <li class="nav-item">
                    <button class=" nav-link" data-bs-target="#modalSemester" data-bs-toggle="modal" >
                        <i class="fa-solid fa-calendar-days ti-xs me-1"></i>    Rincian Semester
                    </button>
                </li>
                <li class="nav-item">
                    <button class=" nav-link" data-bs-target="#modalTranskip" data-bs-toggle="modal">
                        <i class="fa-solid fa-file-certificate ti-xs me-1"></i>    Rincian Transkip
                    </button>
                </li> --}}
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
                <div class="row table-responsive">
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
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->nm_agama }}</span></td>
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
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->email_kampus }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Email Pribadi</th>
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->email_pribadi ?? '-' }}</span></td>
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

            <div class="col-md-6 table-responsive">
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
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->nm_dsn ?? '-' }}</span></td>
                        </tr>
                        <tr>
                            <th>Desa/Kelurahan</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->ds_kel }}</span></td>
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
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->nm_negara }}</span></td>
                        </tr>
                        <tr>
                            <th>Kode Pos</th>
                            <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->kode_pos }}</span></td>
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
                <div class="row table-responsive">
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
                                    <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $profile->nisn }}</span></td>
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
                @foreach ($reg_pd as $i => $item)
                    <div id="accordionCustomIcon" class="accordion mt-4 accordion-custom-button">
                        <div class="accordion-item">
                            <h2 class="accordion-header text-body d-flex justify-content-between bg-primary text-white" id="accordionCustomIconOne">
                                <button type="button" class="accordion-button {{ $i === 0 ? '' : 'collapsed' }} bg-primary text-white" data-bs-toggle="collapse" aria-expanded="{{ $i === 0 ? 'true' : 'false' }}" data-bs-target="#accordion_{{ $i }}" aria-controls="accordion_{{ $i }}">
                                    {{ $item->nm_jenj_didik }} {{ $item->nm_lemb }}
                                </button>
                            </h2>

                            <div id="accordion_{{ $i }}" class="accordion-collapse collapse {{ $i === 0 ? 'show' : '' }} mt-3" data-bs-parent="#accordionCustomIcon">
                                <div class="accordion-body">
                                    <div class="row">
                                        <!-- Kolom Kiri -->
                                        <div class="col-md-6">
                                            <table class="table table-borderless">
                                                <tbody>
                                                    <tr>
                                                        <th>Tanggal Masuk </th>
                                                        <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ tglIndonesia($item->tgl_masuk_sp) }}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>Jalur Daftar</th>
                                                        <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $item->nm_jalur_daftar }}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>Jenis Daftar</th>
                                                        <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $item->nm_jns_daftar }}</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <!-- Kolom Kanan -->
                                        <div class="col-md-6">
                                            <table class="table table-borderless">
                                                <tbody>
                                                    <tr>
                                                        <th>Tanggal Keluar</th>
                                                        <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $item->tgl_keluar ? tglIndonesia($item->tgl_keluar) : '-' }}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <th>Jenis Keluar</th>
                                                        <td><span class="badge fw-semibold" style="background-color: #ACCDFF; color: #444050">{{ $item->ket_keluar ?? '-' }}</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-end mt-3">
                                        <button class="btn btn-primary me-2 btn-rincian-semester" data-bs-toggle="modal" data-bs-target="#modalSemester" data-id_reg_pd="{{ $item->id_reg_pd }}">
                                            <i class="fa-solid fa-calendar-days me-2"></i> Rincian Semester
                                        </button>
                                        <button class="btn btn-primary btn-transkrip" data-bs-toggle="modal" data-bs-target="#modalTranskip" data-id_reg_pd="{{ $item->id_reg_pd }}" ><i class="fa-solid fa-file me-2"></i>Rincian Transkrip</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        </div>
</div>

@include('content.main.mahasiswa.profile_mhs.modal-semester')
@include('content.main.mahasiswa.profile_mhs.modal-transkip')
@include('content.main.mahasiswa.profile_mhs.modal-khs')
<!-- /Project table -->
</div>
@endsection
