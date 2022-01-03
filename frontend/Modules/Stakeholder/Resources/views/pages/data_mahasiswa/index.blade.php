@extends('stakeholder::layouts.master')
@section('title', 'PDUT Universitas Lampung - Data Mahasiswa')
{{-- @section('content') --}}
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
        <div class="col-md-3 border-right">
            <div class="d-flex flex-column align-items-center text-center p-3 py-5">
                <img class="rounded-circle mt-5" width="150px" src="../assets/img/Mahasiswa.png">
                <span class="font-weight-bold">{{ $mahasiswa_profil['kemahasiswaan']['Nama'] }}</span>
                <span class="text-black-50">{{ $mahasiswa_profil['informasi_umum']['Email_Pribadi'] }}</span>
            </div>
        </div>
        
        <div class="col-md-9 border-right">
            <div class="card-body p-3">
                <div class="row nav-tabs-custom">
                    <div class="nav-wrapper position-relative end-0">
                        <ul class="nav nav-pills nav-fill p-1" role="tablist">
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#informasiumum"
                                role="tab" aria-controls="preview" aria-selected="true">
                                <i class="ni ni-badge text-sm me-2"></i> Informasi Umum</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#domisili"
                                role="tab" aria-controls="code" aria-selected="false">
                                <i class="ni ni-laptop text-sm me-2"></i> Domisili</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#orangtua"
                                role="tab" aria-controls="code" aria-selected="false">
                                <i class="ni ni-laptop text-sm me-2"></i> Orang Tua</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#wali"
                                role="tab" aria-controls="code" aria-selected="false">
                                <i class="ni ni-laptop text-sm me-2"></i> Wali</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#sekolah"
                                role="tab" aria-controls="code" aria-selected="false">
                                <i class="ni ni-laptop text-sm me-2"></i> Sekolah</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#perguruantinggi"
                                role="tab" aria-controls="code" aria-selected="false">
                                <i class="ni ni-laptop text-sm me-2"></i> Perguruan Tinggi</a>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="table-responsive p-0">
                        <div class="tab-content" id="myTabContent">
                            <div class="tab-pane fade show active" id="informasiumum" role="tabpanel" aria-labelledby="informasiumum-tab">
                                <table class="table align-items-center justify-content-center mb-0">
                                    </thead>
                                    <tbody>
                                        @foreach ($mahasiswa_profil['informasi_umum'] as $key => $value)
                                        <tr>
                                            <td>
                                                <div class="d-flex px-2">
                                                    <div class="my-auto">
                                                        <h6 class="mb-0 text-sm"> {{ str_replace('_', ' ', $key) }}</h6>
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
                        
                            <div class="tab-pane fade"  id="domisili" role="tabpanel" aria-labelledby="domisili-tab">
                                <table class="table align-items-center justify-content-center mb-0">
                                </thead>
                                <tbody>
                                    @foreach ($mahasiswa_profil['domisili'] as $key => $value)
                                    <tr>
                                        <td>
                                            <div class="d-flex px-2">
                                                <div class="my-auto">
                                                    <h6 class="mb-0 text-sm"> {{ str_replace('_', ' ', $key) }}</h6>
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

                            <div class="tab-pane fade"  id="orangtua" role="tabpanel" aria-labelledby="orangtua-tab">
                                <table class="table align-items-center justify-content-center mb-0">
                                </thead>
                                <tbody>
                                    @foreach ($mahasiswa_profil['orangtua'] as $key => $value)
                                    <tr>
                                        <td>
                                            <div class="d-flex px-2">
                                                <div class="my-auto">
                                                    <h6 class="mb-0 text-sm"> {{ str_replace('_', ' ', $key) }}</h6>
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

                            <div class="tab-pane fade"  id="wali" role="tabpanel" aria-labelledby="wali-tab">
                                <table class="table align-items-center justify-content-center mb-0">
                                </thead>
                                <tbody>
                                    @foreach ($mahasiswa_profil['wali'] as $key => $value)
                                    <tr>
                                        <td>
                                            <div class="d-flex px-2">
                                                <div class="my-auto">
                                                    <h6 class="mb-0 text-sm"> {{ str_replace('_', ' ', $key) }}</h6>
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

                            <div class="tab-pane fade"  id="sekolah" role="tabpanel" aria-labelledby="sekolah-tab">
                                <table class="table align-items-center justify-content-center mb-0">
                                </thead>
                                <tbody>
                                    @foreach ($mahasiswa_profil['sekolah'] as $key => $value)
                                    <tr>
                                        <td>
                                            <div class="d-flex px-2">
                                                <div class="my-auto">
                                                    <h6 class="mb-0 text-sm"> {{ str_replace('_', ' ', $key) }}</h6>
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

                            <div class="tab-pane fade"  id="perguruantinggi" role="tabpanel" aria-labelledby="perguruantinggi-tab">
                                <table class="table align-items-center justify-content-center mb-0">
                                </thead>
                                <tbody>
                                    @foreach ($mahasiswa_profil['perguruantinggi'] as $key => $value)
                                    <tr>
                                        <td>
                                            <div class="d-flex px-2">
                                                <div class="my-auto">
                                                    <h6 class="mb-0 text-sm"> {{ str_replace('_', ' ', $key) }}</h6>
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
@endsection
