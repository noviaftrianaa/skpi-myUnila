@extends('mahasiswa::layouts.master')
@section('title', 'Data Profil')

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
                <div class="d-flex flex-column align-items-center text-center p-3 py-5"><img class="rounded-circle mt-5"
                        width="150px"
                        src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg">
                    <span class="font-weight-bold">{{ $mahasiswa_profil['kemahasiswaan']['Nama'] }}</span><span
                        class="text-black-50">{{ $mahasiswa_profil['informasi_umum']['Email'] }}</span><span> </span>
                </div>

                {{-- <div class="p-3">
                    <div class="card p-3">
                        <div class="card-header pb-0 p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-right">Profil</h4>
                            </div>
                        </div>

                        <div class="table-responsive p-0">
                            <table class="table align-items-center justify-content-center mb-0">
                                </thead>
                                <tbody>
                                    @foreach ($mahasiswa_profil['profile'] as $key => $value)
                                        @if ($key == 'Nama')
                                            @continue
                                        @endif
                                        <tr>
                                            <td>
                                                <div class="d-flex px-2">
                                                    <div class="my-auto">
                                                        <h6 class="mb-0 text-sm">
                                                            {{ ucwords(str_replace('_', ' ', $key)) }}
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
                </div>

                <div class="p-3">
                    <div class="card p-3">
                        <div class="card-header pb-0 p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-right">Kependudukan</h4>
                            </div>
                        </div>

                        <div class="table-responsive p-0">
                            <table class="table align-items-center justify-content-center mb-0">
                                </thead>
                                <tbody>
                                    @foreach ($mahasiswa_profil['kependudukan'] as $key => $value)
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

                <div class="p-3">
                    <div class="card p-3">
                        <div class="card-header pb-0 p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-right">Keluarga</h4>
                            </div>
                        </div>

                        <div class="table-responsive p-0">
                            <table class="table align-items-center justify-content-center mb-0">
                                </thead>
                                <tbody>
                                    @foreach ($mahasiswa_profil['keluarga'] as $key => $value)
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
                </div> --}}
            </div>

            <div class="col-md-5 border-right">
                <div class="p-3">
                    <div class="card p-3">
                        <div class="card-header pb-0 p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-right">Kemahasiswaan</h4>
                            </div>
                        </div>

                        <div class="table-responsive p-0">
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
                </div>

                <div class="p-3">
                    <div class="card p-3">
                        <div class="card-header pb-0 p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-right">Informasi Umum</h4>
                            </div>
                        </div>

                        <div class="table-responsive p-0">
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
                </div>

                <div class="p-3">
                    <div class="card p-3">
                        <div class="card-header pb-0 p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-right">Domisili</h4>
                            </div>
                        </div>

                        <div class="table-responsive p-0">
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
                </div>
            </div>

            <div class="col-md-4">
                <div class="p-3">
                    <div class="card p-3">
                        <div class="card-header pb-0 p-3">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h4 class="text-right">Riwayat Pendidikan</h4>
                            </div>
                        </div>

                        <div class="card-body p-3">
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
@endsection
