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
                    <div class="float-end">
                        <div class="input-group">
                            <label class="input-group-text">Tahun</label>
                            <select class="form-control text-center" id="tahun">
                                @for ($tahun = date('Y') - 1; $tahun >= date('Y') - 2; $tahun--)
                                    <option value="{{ $tahun }}" {{ request()->tahun == $tahun ? 'selected' : '' }}>
                                        {{ $tahun }}</option>
                                @endfor
                            </select>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-12 d-flex justify-content-between">
                            <div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h1 class="mb-0">{{ $dataGreenmetric['rank_by_world'] }}</h1>
                                    {!! $dataGreenmetric['rank_by_world'] < $dataPastGreenmetric['rank_by_world']
                                        ? '<div class="badge rounded bg-label-success">+' .
                                            $dataPastGreenmetric['rank_by_world'] -
                                            $dataGreenmetric['rank_by_world'] .
                                            '</div>'
                                        : '<div class="badge rounded bg-label-danger">-' .
                                            $dataPastGreenmetric['rank_by_world'] -
                                            $dataGreenmetric['rank_by_world'] .
                                            '</div>' !!}
                                </div>
                                <small>Sumber: https://greenmetric.ui.ac.id/</small>
                            </div>
                            <img src="https://greenmetric.ui.ac.id/assets/images/Logo2017-new.png" class="img-fluid"
                                style="height: 100px" />
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
                                    <h3 class="my-2 pt-1">{{ $dataGreenmetric['rank_by_asian'] }}</h3>
                                    {!! $dataGreenmetric['rank_by_asian'] < $dataPastGreenmetric['rank_by_asian']
                                        ? '<div class="badge rounded bg-label-success">+' .
                                            $dataPastGreenmetric['rank_by_asian'] -
                                            $dataGreenmetric['rank_by_asian'] .
                                            '</div>'
                                        : '<div class="badge rounded bg-label-danger">' .
                                            $dataPastGreenmetric['rank_by_asian'] -
                                            $dataGreenmetric['rank_by_asian'] .
                                            '</div>' !!}
                                </div>
                            </div>
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-globe ti-sm"></i></div>
                                    <h6 class="mb-0">Indonesian Ranking</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">{{ $dataGreenmetric['rank_by_indonesian'] }}</h3>
                                    {!! $dataGreenmetric['rank_by_indonesian'] < $dataPastGreenmetric['rank_by_indonesian']
                                        ? '<div class="badge rounded bg-label-success">+' .
                                            $dataPastGreenmetric['rank_by_indonesian'] -
                                            $dataGreenmetric['rank_by_indonesian'] .
                                            '</div>'
                                        : '<div class="badge rounded bg-label-danger">' .
                                            $dataPastGreenmetric['rank_by_indonesian'] -
                                            $dataGreenmetric['rank_by_indonesian'] .
                                            '</div>' !!}
                                </div>
                            </div>
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-scoreboard ti-sm"></i>
                                    </div>
                                    <h6 class="mb-0">Total Score</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">{{ $dataGreenmetric['total_score'] }}</h3>
                                    {!! $dataGreenmetric['total_score'] > $dataPastGreenmetric['total_score']
                                        ? '<div class="badge rounded bg-label-success">+' .
                                            $dataGreenmetric['total_score'] -
                                            $dataPastGreenmetric['total_score'] .
                                            '</div>'
                                        : '<div class="badge rounded bg-label-danger">' .
                                            $dataGreenmetric['total_score'] -
                                            $dataPastGreenmetric['total_score'] .
                                            '</div>' !!}
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
                                <h6 class="mb-0 ms-3">Setting & Infrastructure</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataGreenmetric['setting_infrastructure'] }}
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-2 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Energy & Climate Change</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataGreenmetric['energi_climate_change'] }}
                                    </p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-3 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Waste</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataGreenmetric['waste'] }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-4 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Water</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataGreenmetric['water'] }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-5 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Transportation</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataGreenmetric['transportation'] }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-6 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Education Research</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataGreenmetric['education_research'] }}</p>
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
                        <div class="step" data-target="#setting_infrastructure">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">1</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Setting & Infrastructure</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#energi_climate_change">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">2</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Energy & Climate Change</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#waste">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">3</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Waste</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#water">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">4</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Water</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#transportation">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">5</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Transportation</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#education_research">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">6</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Education Research</span>
                                </span>
                            </button>
                        </div>
                    </div>
                    <div class="bs-stepper-content">
                        <form onSubmit="return false">
                            <div id="setting_infrastructure" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Setting & Infrastructure (15%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        Basic information of the university policy towards green environment. Include space
                                        for greenery and in safeguarding environment, as well as developing sustainable
                                        energy.
                                    </div>
                                </div>
                            </div>
                            <div id="energi_climate_change" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Energy & Climate Change (21%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        The university's attention to the use of energy and climate change issues.
                                        Universities are expected to increase the effort in energy efficiency on their
                                        buildings, nature and resources.
                                    </div>
                                </div>
                            </div>
                            <div id="waste" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Waste (18%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        Waste treatment and recycling programs are major factors in creating a sustainable
                                        environment. Universities must take note on its waste production as well as
                                        recycling efforts.
                                    </div>
                                </div>
                            </div>
                            <div id="water" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Water (10%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        Universities are expected to decrease water usage, increase conversation program,
                                        and protect the habitat. This may include water conversation program and piped water
                                        usage.
                                    </div>
                                </div>
                            </div>
                            <div id="transportation" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Transportation (18%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        Universities policies in limiting the number of motor vehicles in campus, the use of
                                        campus bus and bicycle to encourage a healthier environment and reduce universities
                                        carbon footprint.
                                    </div>
                                </div>
                            </div>
                            <div id="education_research" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Education Research (18%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        Universities effort in creating and supporting the new generation concern with
                                        sustainability issues.
                                    </div>
                                </div>
                            </div>
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
                window.location.href = "{{ route('pages-green-metric-ranking') }}" + "?tahun=" + tahun;
            });
        });
    </script>
@endsection
