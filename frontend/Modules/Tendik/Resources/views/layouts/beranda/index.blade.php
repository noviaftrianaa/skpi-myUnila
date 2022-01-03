@extends('tendik::components.master')
@section('content')

@section('css')
<style>
    .stats {
        background: #f2f5f8 !important;
        color: #000 !important;
    }
    .my-custom-scrollbar {
        position: relative;
        height: 200px;
        overflow: auto;
    }
    .table-wrapper-scroll-y {
        display: block;
    }
</style>
@stop

<div class="container-fluid py-4">

    {{-- start jumlah data --}}
    <div class="row">
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Tahun Keaktifan</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2021/2022
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-money-coins text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Diklat Tendik</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    5
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-money-coins text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Sertifikasi</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    12
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-world text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Tes Diikuti</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    6
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-paper-diploma text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Karya Tulis</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Penerjemahan</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Buat Pedoman</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Temuan Teknologi</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Pengajaran</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Pembimbing</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Seminar</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-xl-3 col-sm-6 mb-xl-4 mb-4">
            <div class="card">
                <div class="card-body p-3">
                    <div class="row">
                        <div class="col-8">
                            <div class="numbers">
                                <p class="text-sm mb-0 font-weight-bolder">Penghargaan</p>
                                <p class="text-sm font-weight-bold mb-0" style="color: #000;">
                                    2
                                </p>
                            </div>
                        </div>
                        <div class="col-4 text-end">
                            <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                                <i class="ni ni-cart text-lg opacity-10" aria-hidden="true"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {{-- end jumlah data --}}

    {{-- start profil tendik & tugas pokok --}}
    <div class="row">
        {{-- profil tendik --}}
        <div class="col-lg-6 mb-lg-0 mb-4">
            <div class="card h-100" style="border-radius:0 0 0 0;">
                <div class="card-header p-3">
                    <div class="row">
                        <div class="col-6 d-flex align-items-center">
                            <p class="text-sm font-weight-bolder mb-0">Profil Tendik</p>
                        </div>
                        <div class="col-6 text-end">
                            <a class="btn btn-sm bg-gradient-dark mb-0" href="javascript:;">Lihat Detail</a>
                        </div>
                    </div>
                    <hr class="mt-2">
                    <div class="row mt-3">
                        <div class="col">
                            <h4 class="text-center mb-0">Rio Ananda Putra</h4>
                        </div>
                    </div>
                </div>
                <div class="card-body px-4 pt-0 pb-3">
                    <div class="row">
                        <div class="col-xxl-3 col-lg-4 col-sm-12 mb-xl-0 mb-4">
                            <img src="https://obs.line-scdn.net/0h9jY97ARhZkVkQE_muf8ZEl4WZSpXLHVGAHY3WzQuOHEeIiRGWXIgK0dGbSJMdiEbDSUtI0hCfXQccSBEXnMg/w644"
                                class="rounded" width="150">
                        </div>
                        <div class="col-xxl-9 col-lg-8 col-sm-12 mb-xl-0 mb-4">
                            <div class="p-3 rounded text-white stats">
                                <table class="text-sm mb-1">
                                    <tbody>
                                        <tr>
                                            <td width="35%">NITK</td>
                                            <td>: 1717051073</td>
                                        </tr>
                                        <tr>
                                            <td>NIP</td>
                                            <td>: 7700007066</td>
                                        </tr>
                                        <tr>
                                            <td>Pangkat/Golongan</td>
                                            <td>: III/d - Penata Tk. I</td>
                                        </tr>
                                        <tr>
                                            <td>Jabatan</td>
                                            <td>: PLP Ahli Madya</td>
                                        </tr>
                                        <tr>
                                            <td>Fakultas/Prodi</td>
                                            <td>: TEKNIK/TEKNIK</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {{-- tugas pokok --}}
        <div class="col-lg-6 mb-lg-0 mb-4">
            <div class="card h-100" style="border-radius:0 0 0 0;">
                <div class="card-header p-3">
                    <div class="row">
                        <div class="col-6 d-flex align-items-center">
                            <p class="text-sm font-weight-bolder mb-0">Tugas Pokok</p>
                        </div>
                        <div class="col-6 text-end">
                            <a class="btn btn-sm bg-gradient-dark mb-0" href="javascript:;">Lihat Detail</a>
                        </div>
                    </div>
                    <hr class="mt-2">
                </div>
                <div class="card-body px-4 pt-0 pb-3">
                    <div class="row">
                        <div class="col">
                            <div class="table-responsive">
                                <div class="table-wrapper-scroll-y my-custom-scrollbar">
                                    <table class="table">
                                        <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td class="align-middle text-sm">Menelaah spesifikasi teknis komponen system
                                                    komputer;</td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td class="align-middle text-sm">Menelaah spesifikasi teknis komponen system
                                                    komputer;</td>
                                            </tr>
                                            <tr>
                                                <td>3</td>
                                                <td class="align-middle text-sm">melakukan instalasi dan atau meningkatkan (upgrade)
                                                    sistem komputer; </td>
                                            </tr>
                                            <tr>
                                                <td>4</td>
                                                <td class="align-middle text-sm">membuat program paket;</td>
                                            </tr>
                                            <tr>
                                                <td>5</td>
                                                <td class="align-middle text-sm">melakukan ujicoba sistem komputer;</td>
                                            </tr>
                                            <tr>
                                                <td>6</td>
                                                <td class="align-middle text-sm">melakukan ujicoba program paket;</td>
                                            </tr>
                                            <tr>
                                                <td>1</td>
                                                <td class="align-middle text-sm">Menelaah spesifikasi teknis komponen system
                                                    komputer;</td>
                                            </tr>
                                            <tr>
                                                <td>2</td>
                                                <td class="align-middle text-sm">Menelaah spesifikasi teknis komponen system
                                                    komputer;</td>
                                            </tr>
                                            <tr>
                                                <td>3</td>
                                                <td class="align-middle text-sm">melakukan instalasi dan atau meningkatkan (upgrade)
                                                    sistem komputer; </td>
                                            </tr>
                                            <tr>
                                                <td>4</td>
                                                <td class="align-middle text-sm">membuat program paket;</td>
                                            </tr>
                                            <tr>
                                                <td>5</td>
                                                <td class="align-middle text-sm">melakukan ujicoba sistem komputer;</td>
                                            </tr>
                                            <tr>
                                                <td>6</td>
                                                <td class="align-middle text-sm">melakukan ujicoba program paket;</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {{-- end profil tendik & tugas pokok --}}



































































    <div class="row my-4">
        <div class="col-lg-12 col-md-6 mb-md-0 mb-4">
            <div class="card">
                <div class="card-header pb-0">
                    <div class="row">
                        <div class="col-lg-6 col-7">
                            <h6>Rekap Kehadiran Seminggu Terakhir</h6>
                        </div>
                        <div class="col-lg-6 col-5 my-auto text-end">
                            <p class="text-sm mb-0">
                                <i class="far fa-calendar-alt me-2" aria-hidden="true"></i>
                                <small>23 - 30 March 2020</small>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="card-body px-3 pb-2">
                    <div class="table-responsive">
                        <table class="table align-items-center mb-0">
                            <thead>
                                <tr>
                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                        Tanggal</th>
                                    <th
                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                        Status</th>
                                    <th
                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                        Waktu Datang</th>
                                    <th
                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                        Waktu Pulang</th>
                                    <th
                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                        Lokasi Datang</th>
                                    <th
                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                        Lokasi Pulang</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm">Kamis, 17 Desember 2021</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="align-middle text-sm">
                                        <span class="badge bg-gradient-success">Hadir</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 07.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 16.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> UPT TIK</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> UPT TK</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm">Jumat, 18 Desember 2021</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="align-middle text-sm">
                                        <span class="badge bg-gradient-success">Hadir</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 07.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 16.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> UPT TIK</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> UPT TK</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm">Senin, 20 Desember 2021</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="align-middle text-sm">
                                        <span class="badge bg-gradient-success">Hadir</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 07.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 16.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> UPT TIK</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> UPT TK</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm">Selasa, 21 Desember 2021</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="align-middle text-sm">
                                        <span class="badge bg-gradient-success">Hadir</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 07.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 16.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> UPT TIK</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> UPT TK</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm">Rabu, 22 Desember 2021</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="align-middle text-sm">
                                        <span class="badge bg-gradient-success">Hadir</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 07.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 16.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> WFH</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> WFH</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm">Kamis, 23 Desember 2021</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="align-middle text-sm">
                                        <span class="badge bg-gradient-success">Hadir</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 07.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 16.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> WFH</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> WFH</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div class="d-flex px-2 py-1">
                                            <div class="d-flex flex-column justify-content-center">
                                                <h6 class="mb-0 text-sm">Jumat, 24 Desember 2021</h6>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="align-middle text-sm">
                                        <span class="badge bg-gradient-success">Hadir</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 07.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> 16.30 </span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> WFH</span>
                                    </td>
                                    <td class="align-middle text-center text-sm">
                                        <span class="text-xs font-weight-bold"> WFH</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row my-4">
        <div class="col">
            <div class="card">
                <div class="p-4">
                    <div class="nav-wrapper position-relative end-0">
                        <ul class="nav nav-pills nav-fill p-1" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#home" role="tab"
                                    aria-controls="preview" aria-selected="true">
                                    <i class="ni ni-badge text-sm me-2"></i> Kinerja Pokok
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#profile" role="tab"
                                    aria-controls="code" aria-selected="false">
                                    <i class="ni ni-laptop text-sm me-2"></i> Kinerja Tambahan
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <div class="card">
                                <div class="card-body px-0 pb-2">
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th
                                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Judul</th>
                                                    <th
                                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                                        Tahun Pelaksanaan</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Lama Kegiatan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Identifikasi
                                                                    Tumbuhan
                                                                    Sumber Pakan Lebah
                                                                    Madu di Kecamatan Gading Rejo Kabupeten
                                                                    Pringsewu</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2021/2022</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Identifikasi
                                                                    Kerusakan
                                                                    Tegakan Hutan di
                                                                    Areal Garapan Petani KPPH Kuyung Bawah dalam
                                                                    Tahura Wan Abdul
                                                                    Rachman</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2020/2021</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Tingkat Kesamaan
                                                                    Komposisi Tegakan Hutan
                                                                    Antargarapan Petani KPPH Talangmulya</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2019/2020</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm"> Identifikasi
                                                                    Tingkat
                                                                    Kerusakan Tegakan
                                                                    Hutan di Areal Garapan Petani KPPH Talang
                                                                    Mulya
                                                                    Kecamatan Padang
                                                                    Cermin</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2018/2019</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Tipe Kombinasi Jenis
                                                                    Tanaman dan Hasil
                                                                    Panen pada Areal Garapan Petani dalam
                                                                    Kawasan
                                                                    Hutan Register 19
                                                                    Provinsi Lampung</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2017/2018</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                            <div class="card">
                                <div class="card-body px-0 pb-2">
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th
                                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Judul</th>
                                                    <th
                                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                                        Tahun Anggaran</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Lama Kegiatan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Identifikasi
                                                                    Tumbuhan
                                                                    Sumber Pakan
                                                                    Lebah Madu di Kecamatan Gading Rejo
                                                                    Kabupeten
                                                                    Pringsewu</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2021/2022</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Identifikasi
                                                                    Kerusakan
                                                                    Tegakan Hutan
                                                                    di Areal Garapan Petani KPPH Kuyung Bawah
                                                                    dalam
                                                                    Tahura Wan
                                                                    Abdul Rachman</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2020/2021</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Tingkat Kesamaan
                                                                    Komposisi Tegakan
                                                                    Hutan Antargarapan Petani KPPH Talangmulya
                                                                </h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2019/2020</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm"> Identifikasi
                                                                    Tingkat
                                                                    Kerusakan
                                                                    Tegakan Hutan di Areal Garapan Petani KPPH
                                                                    Talang Mulya
                                                                    Kecamatan Padang Cermin</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2018/2019</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Tipe Kombinasi Jenis
                                                                    Tanaman dan
                                                                    Hasil Panen pada Areal Garapan Petani dalam
                                                                    Kawasan Hutan
                                                                    Register 19 Provinsi Lampung</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2017/2018</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row my-4">
        <div class="col">
            <div class="card">
                <div class="p-4">
                    <div class="nav-wrapper position-relative end-0">
                        <ul class="nav nav-pills nav-fill p-1" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#home" role="tab"
                                    aria-controls="preview" aria-selected="true">
                                    <i class="ni ni-badge text-sm me-2"></i> Tunjangan
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#profile" role="tab"
                                    aria-controls="code" aria-selected="false">
                                    <i class="ni ni-laptop text-sm me-2"></i> Kesejahtraan
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <div class="card">
                                <div class="card-body px-0 pb-2">
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Jenis</th>
                                                    <th>Nama</th>
                                                    <th>Pemberi</th>
                                                    <th>Sumber Dana</th>
                                                    <th>Tahun</th>
                                                    <th>Nominal</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>Cuma-cuma</td>
                                                    <td>Tunjangan Karena Ganteng</td>
                                                    <td>Universitas Lampung</td>
                                                    <td>Dana Kaget</td>
                                                    <td>2020 - 2021</td>
                                                    <td>Rp. 55.000.000,-</td>
                                                </tr>
                                                <tr>
                                                    <td>Cuma-cuma</td>
                                                    <td>Tunjangan Karena Ganteng</td>
                                                    <td>Universitas Lampung</td>
                                                    <td>Dana Kaget</td>
                                                    <td>2020 - 2021</td>
                                                    <td>Rp. 55.000.000,-</td>
                                                </tr>
                                                <tr>
                                                    <td>Cuma-cuma</td>
                                                    <td>Tunjangan Karena Ganteng</td>
                                                    <td>Universitas Lampung</td>
                                                    <td>Dana Kaget</td>
                                                    <td>2020 - 2021</td>
                                                    <td>Rp. 55.000.000,-</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                            <div class="card">
                                <div class="card-body px-0 pb-2">
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Jenis</th>
                                                    <th>Nama</th>
                                                    <th>Pemberi</th>
                                                    <th>Sumber Dana</th>
                                                    <th>Tahun</th>
                                                    <th>Nominal</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr>
                                                    <td>Cuma-cuma</td>
                                                    <td>Tunjangan Karena Ganteng</td>
                                                    <td>Universitas Lampung</td>
                                                    <td>Dana Kaget</td>
                                                    <td>2020 - 2021</td>
                                                    <td>Rp. 55.000.000,-</td>
                                                </tr>
                                                <tr>
                                                    <td>Cuma-cuma</td>
                                                    <td>Tunjangan Karena Ganteng</td>
                                                    <td>Universitas Lampung</td>
                                                    <td>Dana Kaget</td>
                                                    <td>2020 - 2021</td>
                                                    <td>Rp. 55.000.000,-</td>
                                                </tr>
                                                <tr>
                                                    <td>Cuma-cuma</td>
                                                    <td>Tunjangan Karena Ganteng</td>
                                                    <td>Universitas Lampung</td>
                                                    <td>Dana Kaget</td>
                                                    <td>2020 - 2021</td>
                                                    <td>Rp. 55.000.000,-</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row my-4">
        <div class="col">
            <div class="card">
                <div class="p-4">
                    <div class="nav-wrapper position-relative end-0">
                        <ul class="nav nav-pills nav-fill p-1" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#home" role="tab"
                                    aria-controls="preview" aria-selected="true">
                                    <i class="ni ni-badge text-sm me-2"></i> Penelitian
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#profile" role="tab"
                                    aria-controls="code" aria-selected="false">
                                    <i class="ni ni-laptop text-sm me-2"></i> Pengabdian
                                </a>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#contact" role="tab"
                                    aria-controls="code" aria-selected="false">
                                    <i class="ni ni-laptop text-sm me-2"></i> Publikasi
                                </a>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#contact" role="tab"
                                    aria-controls="code" aria-selected="false">
                                    <i class="ni ni-laptop text-sm me-2"></i> Penulisan Buku
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                            <div class="card">
                                <div class="card-body px-0 pb-2">
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th
                                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Judul</th>
                                                    <th
                                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                                        Tahun Pelaksanaan</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Lama Kegiatan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Identifikasi
                                                                    Tumbuhan
                                                                    Sumber Pakan Lebah
                                                                    Madu di Kecamatan Gading Rejo Kabupeten
                                                                    Pringsewu</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2021/2022</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Identifikasi
                                                                    Kerusakan
                                                                    Tegakan Hutan di
                                                                    Areal Garapan Petani KPPH Kuyung Bawah dalam
                                                                    Tahura Wan Abdul
                                                                    Rachman</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2020/2021</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Tingkat Kesamaan
                                                                    Komposisi Tegakan Hutan
                                                                    Antargarapan Petani KPPH Talangmulya</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2019/2020</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm"> Identifikasi
                                                                    Tingkat
                                                                    Kerusakan Tegakan
                                                                    Hutan di Areal Garapan Petani KPPH Talang
                                                                    Mulya
                                                                    Kecamatan Padang
                                                                    Cermin</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2018/2019</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Tipe Kombinasi Jenis
                                                                    Tanaman dan Hasil
                                                                    Panen pada Areal Garapan Petani dalam
                                                                    Kawasan
                                                                    Hutan Register 19
                                                                    Provinsi Lampung</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2017/2018</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                            <div class="card">
                                <div class="card-body px-0 pb-2">
                                    <div class="table-responsive">
                                        <table class="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th
                                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Judul</th>
                                                    <th
                                                        class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                                        Tahun Anggaran</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Lama Kegiatan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Identifikasi
                                                                    Tumbuhan
                                                                    Sumber Pakan
                                                                    Lebah Madu di Kecamatan Gading Rejo
                                                                    Kabupeten
                                                                    Pringsewu</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2021/2022</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Identifikasi
                                                                    Kerusakan
                                                                    Tegakan Hutan
                                                                    di Areal Garapan Petani KPPH Kuyung Bawah
                                                                    dalam
                                                                    Tahura Wan
                                                                    Abdul Rachman</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2020/2021</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Tingkat Kesamaan
                                                                    Komposisi Tegakan
                                                                    Hutan Antargarapan Petani KPPH Talangmulya
                                                                </h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2019/2020</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm"> Identifikasi
                                                                    Tingkat
                                                                    Kerusakan
                                                                    Tegakan Hutan di Areal Garapan Petani KPPH
                                                                    Talang Mulya
                                                                    Kecamatan Padang Cermin</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2018/2019</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">Tipe Kombinasi Jenis
                                                                    Tanaman dan
                                                                    Hasil Panen pada Areal Garapan Petani dalam
                                                                    Kawasan Hutan
                                                                    Register 19 Provinsi Lampung</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="d-flex px-2 py-1">
                                                            <div class="d-flex flex-column justify-content-center">
                                                                <h6 class="mb-0 text-sm">2017/2018</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 1 Tahun </span>
                                                    </td>
                                                </tr>

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                            ...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

















</div>

@endsection
