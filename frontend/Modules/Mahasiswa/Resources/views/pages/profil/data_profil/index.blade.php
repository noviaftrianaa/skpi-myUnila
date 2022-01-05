@extends('mahasiswa::components.master')
@section('title', 'Data Profil')

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
            <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img class="rounded-circle mt-5"
                    width="150px"
                    src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg">
                <span class="font-weight-bold">{{ $mahasiswa_profil['kemahasiswaan']['Nama'] }}</span><span
                    class="text-black-50">{{ $mahasiswa_profil['kemahasiswaan']['NPM'] }}</span><span> </span>
            </div>

        </div>

        <div class="col-md-9 border-right">
            <div class="p-3">
                <div class="card p-3">
                    <div class="card-header pb-0">
                        <div class="row">
                            <h5 class="card-header d-flex justify-content-between align-items-center">
                              Data Profil
                              <a href="{{url('mahasiswa/data-profil/edit')}}" class="btn btn-sm btn-round btn-info"><i class="fa fa-edit text-white"></i>&nbsp;&nbsp;Ubah Data</a>
                            </h5>
                        </div>
                    </div>

                    <div class="bg-white mt-5">
                        <ul class="nav nav-tabs nav-fill" id="myTab" role="tablist">
                            <li class="nav-item" role="presentation"> <button class="nav-link active" id="faq_tab_1-tab"
                                    data-bs-toggle="tab" data-bs-target="#faq_tab_1" type="button" role="tab"
                                    aria-controls="faq_tab_1" aria-selected="true">
                                    <div class="d-flex flex-column lh-lg mb-2"> <i class='bx bxs-plane-alt'></i>
                                        <span>Kemahasiswaan</span> </div>
                                </button> </li>
                            <li class="nav-item" role="presentation"> <button class="nav-link" id="faq_tab_2-tab"
                                    data-bs-toggle="tab" data-bs-target="#faq_tab_2" type="button" role="tab"
                                    aria-controls="faq_tab_2" aria-selected="false">
                                    <div class="d-flex flex-column lh-lg mb-2"> <i class='bx bxs-shopping-bag'></i>
                                        <span>Informasi Umum</span> </div>
                                </button> </li>
                            <li class="nav-item" role="presentation"> <button class="nav-link" id="faq_tab_3-tab"
                                    data-bs-toggle="tab" data-bs-target="#faq_tab_3" type="button" role="tab"
                                    aria-controls="faq_tab_3" aria-selected="false">
                                    <div class="d-flex flex-column lh-lg mb-2"> <i class='bx bx-check-circle'></i>
                                        <span>Domisili</span> </div>
                                </button> </li>
                            <li class="nav-item" role="presentation"> <button class="nav-link" id="faq_tab_4-tab"
                                    data-bs-toggle="tab" data-bs-target="#faq_tab_4" type="button" role="tab"
                                    aria-controls="faq_tab_4" aria-selected="false">
                                    <div class="d-flex flex-column lh-lg mb-2"> <i class='bx bxs-plane-alt'></i>
                                        <span>Sekolah</span> </div>
                                </button> </li>
                        </ul>
                        <div class="tab-content" id="myTabContent">
                            <div class="tab-pane fade active show" id="faq_tab_1" role="tabpanel"
                                aria-labelledby="faq_tab_1-tab">
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
                                                                {{ str_replace('_', ' ', $key) }}</h6>
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
                                <div class="card-body p-5">
                                    <div class="timeline timeline-one-side">
                                        @foreach ($mahasiswa_profil['sekolah'] as $key => $values)
                                            <div class="timeline-block mb-3">
                                                <span class="timeline-step">
                                                    <i class="ni ni-hat-3 text-warning text-gradient"></i>
                                                </span>
                                                <div class="timeline-content">
                                                    <h6 class="text-dark text-sm font-weight-bold mb-0">{{ $key }}</h6>
                                                    <p class="text-dark text-sm font-weight-bold mb-0">
                                                        {{ $values['Perguruan_Tinggi'] }}</p>
                                                    @foreach ($values['prodi'] as $value)
                                                        <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">
                                                            {{ $value }}</p>
                                                    @endforeach
                                                </div>
                                            </div>
                                        @endforeach
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
</div>
</div>
@endsection
