@extends('layouts/layoutMaster')
@include('content.main.ktw.function')

@section('title', $title)

@push('css')
<style>
    #sms option {
        width: 200px;
        white-space: nowrap;
    }
</style>
@endpush

@section('content')

    <h4>
        {{ $title }}
    </h4>
    <div class="card">
        <div
            class="card-header sticky-element bg-label-light d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4">
            <h5 class="card-title">{{ $title }}</h5>
            <div class="float-end">
                <div class="btn-group" role="group">
                    <label class="input-group-text">Lembaga</label>
                    <select class="form-select" id="sms">
                        @foreach ($sms as $item)
                            <option value="{{ $item->id_sms }}">{{ $item->nm_lemb }} {{ !empty($item->jenjang) ? '('.$item->jenjang->nm_jenj_didik.')' : '' }}</option>
                            @if (!empty($item->fakultas))
                                @foreach ($item->fakultas as $value)
                                    <option value="{{ $value->id_sms }}">
                                        {{ $value->nm_lemb }}
                                        </span>
                                    </option>
                                    @if (!is_null($value->prodi))
                                        @foreach ($value->prodi as $values)
                                            <option value="{{ $values->id_sms }}">
                                                {{ $values->nm_lemb }}
                                                ({{ $values->jenjang->nm_jenj_didik }})
                                                </span>
                                            </option>
                                        @endforeach
                                    @endif
                                @endforeach
                            @elseif(!empty($item->prodi))
                                @foreach ($item->prodi as $values)
                                    <option value="{{ $values->id_sms }}">
                                        {{ $values->nm_lemb }}
                                        ({{ $values->jenjang->nm_jenj_didik }})
                                        </span>
                                    </option>
                                @endforeach
                            @endif
                        @endforeach
                    </select>
                    <label class="input-group-text ms-2">Tahun</label>
                    <select class="form-select" id="tahun">
                        <option value="{{ $tahun }}" selected>{{ $tahun - 4 }} - {{ $tahun }}
                        </option>
                        <option value="{{ $tahun - 5 }}">{{ $tahun - 9 }} - {{ $tahun - 5 }}</option>
                        <option value="{{ $tahun - 10 }}">{{ $tahun - 14 }} - {{ $tahun - 10 }}</option>
                    </select>
                    <a href="#detailData" data-bs-toggle="modal" class="btn btn-label-primary ms-2 w-100"><i
                            class="fas fa-info-circle me-1"></i> Data</a>
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

    @include('content.main.ktw.modal')

@endsection
