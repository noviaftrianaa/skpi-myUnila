@extends('stakeholder::layouts.master')
@section('title', 'PDUT Universitas Lampung - Data Mahasiswa')
@section('css')
<style>

.nav-tabs .nav-link.active {
    border-color: transparent;
    background-color: #fff !important;
    color: #121589 !important;
    border-bottom: 4px solid #121589 !important
}

.nav-fill .nav-item .nav-link,
.nav-justified .nav-item .nav-link {
    width: 100%;
    color: #000
}

.nav-tabs .nav-link {
    border-top-left-radius: 0rem !important;
    border-top-right-radius: 0rem !important
}

.nav-tabs .nav-link.active {
    border-color: transparent;
    background-color: #60D0FF;
    color: #fff;
    font-weight: 600
}

.nav-link:hover {
    border: none
}

.nav-link:focus {
    outline: none
}

</style>
@stop

@section('content')

<div class="container-fluid py-4 bg-white mb-5">
    <div class="row">

        <div class="col-md-3 border-right">
            <div class="d-flex flex-column align-items-center text-center p-3 py-5">
                <img class="rounded-circle mt-5" width="150px" src="../assets/img/Mahasiswa.png">
                <span class="font-weight-bold">{{ $mahasiswa_profil['kemahasiswaan']['Nama_Mahasiswa'] }}</span><span
                class="text-black-50">{{ $mahasiswa_profil['kemahasiswaan']['NPM'] }}</span><span> </span>
            </div>

        </div>

        <div class="col-md-9 border-right">
            <div class="p-3">
                <div class="card p-3">
                    <div class="card-header pb-0">
                        <div class="row">
                            <h5 class="card-header d-flex justify-content-between align-items-center">
                              Data Mahasiswa
                            </h5>
                        </div>
                    </div>

                    <div class="bg-white mt-5">
                        <ul class="nav nav-tabs nav-fill" id="myTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="faq_tab_1-tab" data-bs-toggle="tab" data-bs-target="#faq_tab_1" type="button" role="tab"
                                aria-controls="faq_tab_1" aria-selected="true">
                                <div class="d-flex flex-column lh-lg mb-2">
                                    <i class='bx bxs-plane-alt'></i>
                                    <span>Kemahasiswaan</span> </div>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="faq_tab_2-tab" data-bs-toggle="tab" data-bs-target="#faq_tab_2" type="button" role="tab"
                                aria-controls="faq_tab_2" aria-selected="true">
                                <div class="d-flex flex-column lh-lg mb-2">
                                    <i class='bx bxs-plane-alt'></i>
                                    <span>Informasi Umum</span> </div>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="faq_tab_3-tab" data-bs-toggle="tab" data-bs-target="#faq_tab_3" type="button" role="tab"
                                aria-controls="faq_tab_3" aria-selected="false">
                                <div class="d-flex flex-column lh-lg mb-2">
                                    <i class='bx bxs-shopping-bag'></i>
                                    <span>Domisili</span> </div>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="faq_tab_4-tab" data-bs-toggle="tab" data-bs-target="#faq_tab_4" type="button" role="tab"
                                aria-controls="faq_tab_4" aria-selected="false">
                                <div class="d-flex flex-column lh-lg mb-2">
                                    <i class='bx bx-check-circle'></i>
                                    <span>Orang Tua</span> </div>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="faq_tab_5-tab" data-bs-toggle="tab" data-bs-target="#faq_tab_5" type="button" role="tab"
                                aria-controls="faq_tab_5" aria-selected="false">
                                <div class="d-flex flex-column lh-lg mb-2">
                                    <i class='bx bxs-plane-alt'></i>
                                    <span>Wali</span> </div>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="faq_tab_6-tab" data-bs-toggle="tab" data-bs-target="#faq_tab_6" type="button" role="tab"
                                aria-controls="faq_tab_6" aria-selected="false">
                                <div class="d-flex flex-column lh-lg mb-2">
                                    <i class='bx bxs-plane-alt'></i>
                                    <span>Sekolah</span> </div>
                                </button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="faq_tab_7-tab" data-bs-toggle="tab" data-bs-target="#faq_tab_7" type="button" role="tab"
                                aria-controls="faq_tab_7" aria-selected="false">
                                <div class="d-flex flex-column lh-lg mb-2">
                                    <i class='bx bxs-plane-alt'></i>
                                    <span>Perguruan Tinggi</span> </div>
                                </button>
                            </li>
                        </ul>
                        
                        <div class="tab-content" id="myTabContent">
                            <div class="tab-pane fade active show" id="faq_tab_1" role="tabpanel" aria-labelledby="faq_tab_1-tab">
                                <div class="table-responsive p-5">
                                    <table class="table align-items-center justify-content-center mb-0">
                                        </thead>
                                        <tbody>
                                            @foreach ($mahasiswa_profil['kemahasiswaan'] as $key => $value)
                                            <tr>
                                                <td>
                                                    <div class="d-flex px-2">
                                                        <div class="my-auto">
                                                            <h6 class="mb-0 text-sm">
                                                                {{ str_replace('_', ' ', $key) }}
                                                            </h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <p class="text-sm font-weight-bold mb-0">:</p>
                                                </td>
                                                <td>
                                                    <span class="text-xs font-weight-bold">{{ $value }}</span>
                                                </td>
                                            </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="faq_tab_2" role="tabpanel" aria-labelledby="faq_tab_2-tab">
                                <div class="table-responsive p-5">
                                    <table class="table align-items-center justify-content-center mb-0">
                                        </thead>
                                        <tbody>
                                            @foreach ($mahasiswa_profil['informasi_umum'] as $key => $value)
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2">
                                                            <div class="my-auto">
                                                                <h6 class="mb-0 text-sm">
                                                                    {{ ucwords(str_replace('_', ' ', $key)) }}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p class="text-sm font-weight-bold mb-0">:</p>
                                                    </td>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">{{ $value }}</span>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="faq_tab_3" role="tabpanel" aria-labelledby="faq_tab_3-tab">
                                <div class="table-responsive p-5">
                                    <table class="table align-items-center justify-content-center mb-0">
                                        </thead>
                                        <tbody>
                                            @foreach ($mahasiswa_profil['domisili'] as $key => $value)
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2">
                                                            <div class="my-auto">
                                                                <h6 class="mb-0 text-sm">
                                                                    {{ ucwords(str_replace('_', ' ', $key)) }}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p class="text-sm font-weight-bold mb-0">:</p>
                                                    </td>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">{{ $value }}</span>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="faq_tab_4" role="tabpanel" aria-labelledby="faq_tab_4-tab">
                                <div class="table-responsive p-5">
                                    <table class="table align-items-center justify-content-center mb-0">
                                        </thead>
                                        <tbody>
                                            @foreach ($mahasiswa_profil['orangtua'] as $key => $value)
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2">
                                                            <div class="my-auto">
                                                                <h6 class="mb-0 text-sm">
                                                                    {{ ucwords(str_replace('_', ' ', $key)) }}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p class="text-sm font-weight-bold mb-0">:</p>
                                                    </td>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">{{ $value }}</span>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="faq_tab_5" role="tabpanel" aria-labelledby="faq_tab_5-tab">
                                <div class="table-responsive p-5">
                                    <table class="table align-items-center justify-content-center mb-0">
                                        </thead>
                                        <tbody>
                                            @foreach ($mahasiswa_profil['wali'] as $key => $value)
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2">
                                                            <div class="my-auto">
                                                                <h6 class="mb-0 text-sm">
                                                                    {{ ucwords(str_replace('_', ' ', $key)) }}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p class="text-sm font-weight-bold mb-0">:</p>
                                                    </td>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">{{ $value }}</span>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="faq_tab_6" role="tabpanel" aria-labelledby="faq_tab_6-tab">
                                <div class="table-responsive p-5">
                                    <table class="table align-items-center justify-content-center mb-0">
                                        </thead>
                                        <tbody>
                                            @foreach ($mahasiswa_profil['sekolah'] as $key => $value)
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2">
                                                            <div class="my-auto">
                                                                <h6 class="mb-0 text-sm">
                                                                    {{ ucwords(str_replace('_', ' ', $key)) }}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p class="text-sm font-weight-bold mb-0">:</p>
                                                    </td>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">{{ $value }}</span>
                                                    </td>
                                                </tr>
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="tab-pane fade" id="faq_tab_7" role="tabpanel" aria-labelledby="faq_tab_7-tab">
                                <div class="table-responsive p-5">
                                    <table class="table align-items-center justify-content-center mb-0">
                                        </thead>
                                        <tbody>
                                            @foreach ($mahasiswa_profil['perguruantinggi'] as $key => $value)
                                                <tr>
                                                    <td>
                                                        <div class="d-flex px-2">
                                                            <div class="my-auto">
                                                                <h6 class="mb-0 text-sm">
                                                                    {{ ucwords(str_replace('_', ' ', $key)) }}</h6>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p class="text-sm font-weight-bold mb-0">:</p>
                                                    </td>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">{{ $value }}</span>
                                                    </td>
                                                </tr>
                                            @endforeach
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

@endsection
