@extends('layouts/layoutMaster')
@include('content.main.ktw.function')

@section('title', $title)

@section('content')
    <!-- Chart -->
    <div class="row">

        <div class="col-12 mb-4">
            <div class="card">
                <div
                    class="card-header d-flex justify-content-between align-items-md-center align-items-start border-bottom">
                    <h4 class="card-title mb-0">Kelulusan Tepat Waktu</h4>
                    <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text">Fakultas</label>
                            <select class="select2 form-select w-auto" id="sms" data-allow-clear="true">
                                <option value="all" selected>SEMUA FAKULTAS</option>
                                @foreach ($sms as $item)
                                    <option value="{{ $item->id_sms }}">{{ $item->nm_lemb }}</option>
                                    @if (!is_null($item->prodi))
                                        @foreach ($item->prodi as $value)
                                            <option value="{{ $value->id_sms }}">
                                                {{ $value->nm_lemb }}
                                                ({{ $value->jenjang->nm_jenj_didik }})
                                                </span>
                                            </option>
                                        @endforeach
                                    @endif
                                @endforeach
                            </select>
                            <label class="input-group-text ms-2">Tahun</label>
                            <select class="form-select w-auto" id="tahun">
                                <option value="{{ $tahun }}" selected>{{ $tahun - 4 }} - {{ $tahun }}
                                </option>
                                <option value="{{ $tahun - 5 }}">{{ $tahun - 9 }} - {{ $tahun - 5 }}</option>
                                <option value="{{ $tahun - 10 }}">{{ $tahun - 14 }} - {{ $tahun - 10 }}</option>
                            </select>
                            @if (auth()->check() and in_array(session()->get('login.role')->id_peran, [1, 32, 107]))
                                <a href="#detailData" data-bs-toggle="modal" class="btn btn-label-primary ms-2"><i
                                        class="fas fa-info-circle me-1"></i> Data</a>
                                @include('content.main.ktw.modal')
                            @endif
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="overlay" id="loading">
                        <div class="overlay-content">
                            <div class="d-flex justify-content-center">
                                <p class="mb-0" style="color: #0d6efd">Mohon menunggu, data sedang diproses ... </p>
                                <div class="sk-wave m-0">
                                    <div class="sk-rect sk-wave-rect"></div>
                                    <div class="sk-rect sk-wave-rect"></div>
                                    <div class="sk-rect sk-wave-rect"></div>
                                    <div class="sk-rect sk-wave-rect"></div>
                                    <div class="sk-rect sk-wave-rect"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="my-4" id="studiChart"></div>
                    <div class="border-bottom"></div>
                    <div class="my-4" id="ipkChart"></div>
                </div>
            </div>
        </div>
    </div>

@endsection
