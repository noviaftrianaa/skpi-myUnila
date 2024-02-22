@extends('layouts/layoutMaster')

@section('title', $title)

@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bs-stepper/bs-stepper.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/select2/select2.css') }}" />
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/bs-stepper/bs-stepper.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('assets/js/form-wizard-icons.js') }}"></script>
@endsection

@section('content')
    <!-- Hour chart  -->
    <div class="row">
        <div class="col-12 mb-4">
            <div class="card h-100">
                <div class="card-header pb-0 d-flex justify-content-between">
                    <div class="card-title mb-0">
                        <h3 class="mb-0">Universitas Lampung</h3>
                        <h6>WORLD RANKING</h6>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-12 d-flex justify-content-between">
                            <div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h1 class="mb-0">
                                        {{ intval($dataWebometrics['world'] ?? 0) > 0 ? intval($dataWebometrics['world'] ?? 0) : $dataWebometrics['world'] ?? 0 }}
                                    </h1>
                                </div>
                                <small>Sumber: https://webometrics.info/</small>
                            </div>
                            <img src="{{ asset('wcu/webometrics/webo.jpg') }}" class="img-fluid" style="height: 100px" />
                        </div>
                    </div>
                    <div class="border rounded p-3 mt-4">
                        <div class="row gap-4 gap-sm-0">
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-world ti-sm"></i></div>
                                    <h6 class="mb-0">Asian Ranking</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">
                                        {{ intval($dataWebometrics['asian'] ?? 0) > 0 ? intval($dataWebometrics['asian'] ?? 0) : $dataWebometrics['asian'] ?? 0 }}
                                    </h3>
                                </div>
                            </div>
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-globe ti-sm"></i></div>
                                    <h6 class="mb-0">Asean Ranking</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">
                                        {{ intval($dataWebometrics['asean'] ?? 0) > 0 ? intval($dataWebometrics['asean'] ?? 0) : $dataWebometrics['asean'] ?? 0 }}
                                    </h3>
                                </div>
                            </div>
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-scoreboard ti-sm"></i>
                                    </div>
                                    <h6 class="mb-0">Indonesian Ranking</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">
                                        {{ intval($dataWebometrics['indonesian'] ?? 0) > 0 ? intval($dataWebometrics['indonesian'] ?? 0) : $dataWebometrics['indonesian'] ?? 0 }}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-12 col-md-4 mb-4">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between">
                    <div class="card-title mb-0">
                        <h5 class="mb-0">Parameter</h5>
                    </div>
                    <div class="card-tools">
                        <h5>Score</h5>
                    </div>
                </div>
                <div class="card-body">
                    <ul class="p-0 m-0">
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-1 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Impact</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataWebometrics['impact'] }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-2 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Openness</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataWebometrics['openness'] }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-3 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Excellence</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataWebometrics['excellence'] }}</p>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="col-12 col-md-8 mb-4">
            <div class="card h-100">
                <div class="card-header d-flex justify-content-between">
                    <div class="card-title mb-0">
                        <h5 class="mb-0">Methodology</h5>
                    </div>
                </div>
                <div class="bs-stepper vertical wizard-vertical-icons-example">
                    <div class="bs-stepper-header">
                        @if (!empty($methodology))
                            @foreach ($methodology as $no => $item)
                                <div class="step" data-target="#data{{ $no + 1 }}">
                                    <button type="button" class="step-trigger">
                                        <span class="bs-stepper-circle">{{ $no + 1 }}</span>
                                        <span class="bs-stepper-label">
                                            <span
                                                class="bs-stepper-title">{{ ucwords(strtolower($item['indicator'])) }}</span>
                                        </span>
                                    </button>
                                </div>
                                <div class="line"></div>
                            @endforeach
                        @else
                            <div class="step" data-target="#data">
                                <button type="button" class="step-trigger">
                                    <span class="bs-stepper-circle">-</span>
                                    <span class="bs-stepper-label">
                                        <span class="bs-stepper-title">-</span>
                                    </span>
                                </button>
                            </div>
                        @endif
                    </div>
                    <div class="bs-stepper-content">
                        <form onSubmit="return false">
                            @if (!empty($methodology))
                                @foreach ($methodology as $no => $item)
                                    <div id="data{{ $no + 1 }}" class="content">
                                        <div class="content-header mb-3" style="text-align: justify">
                                            <h6 class="mb-0">{{ $item['indicator'] }} ({{ $item['weight'] }})</h6>
                                        </div>
                                        <div class="row g-3">
                                            <div class="col-12">
                                                <h6>Meaning</h6>
                                                <p>{{ $item['meaning'] }}</p>
                                                <h6>Methodology</h6>
                                                <p>{{ $item['methodology'] }}</p>
                                                <h6>Source</h6>
                                                <p>{{ $item['source'] }}</p>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            @else
                                <div id="data" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">-</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            -
                                        </div>
                                    </div>
                                </div>
                            @endif
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

@endsection

@section('page-script')
    <script>
        $(document).ready(function() {
            $('#tahun').on('change', function() {
                var tahun = $(this).val();
                window.location.href = "{{ route('pages-qs-world-university-ranking') }}" + "?tahun=" +
                    tahun;
            });
        });
    </script>
@endsection
