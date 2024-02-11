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
                                @for ($tahun = date('Y'); $tahun >= date('Y') - 1; $tahun--)
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
                                    <h1 class="mb-0">
                                        {{ intval($dataTheWur['rank']) > 0 ? intval($dataTheWur['rank']) : $dataTheWur['rank'] }}
                                    </h1>
                                    {!! intval($dataPastTheWur['rank']??0) == 0 ? '<div class="badge rounded bg-label-success">+' . intval($dataTheWur['rank'] ?? 0) . '</div>' : (intval($dataTheWur['rank'] ?? 0) <= intval($dataPastTheWur['rank'] ?? 0)
                                        ? '<div class="badge rounded bg-label-success">+' .
                                            intval($dataPastTheWur['rank'] ?? 0) -
                                            intval($dataTheWur['rank'] ?? 0) .
                                            '</div>'
                                        : '<div class="badge rounded bg-label-danger">' .
                                            intval($dataPastTheWur['rank'] ?? 0) -
                                            intval($dataTheWur['rank'] ?? 0) .
                                            '</div>') !!}
                                </div>
                                <small>Sumber: https://timeshighereducation.com/</small>
                            </div>
                            <img src="https://iconape.com/wp-content/files/zv/193884/svg/193884.svg" class="img-fluid"
                                style="height: 100px" />
                        </div>
                    </div>
                    <div class="border rounded p-3 mt-4">
                        <div class="row gap-4 gap-sm-0">
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-world ti-sm"></i></div>
                                    <h6 class="mb-0">Overall Ranking</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">{{ $dataTheWur['scores_overall_rank'] }}</h3>
                                    {!! intval($dataPastTheWur['scores_overall_rank']??0) == 0 ? '<div class="badge rounded bg-label-success">+' . intval($dataTheWur['scores_overall_rank'] ?? 0) . '</div>' : (intval($dataTheWur['scores_overall_rank'] ?? 0) <= intval($dataPastTheWur['scores_overall_rank'] ?? 0)
                                        ? '<div class="badge rounded bg-label-success">+' .
                                            intval($dataPastTheWur['scores_overall_rank'] ?? 0) -
                                            intval($dataTheWur['scores_overall_rank'] ?? 0) .
                                            '</div>'
                                        : '<div class="badge rounded bg-label-danger">' .
                                            intval($dataPastTheWur['scores_overall_rank'] ?? 0) -
                                            intval($dataTheWur['scores_overall_rank'] ?? 0) .
                                            '</div>') !!}
                                </div>
                            </div>
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-globe ti-sm"></i></div>
                                    <h6 class="mb-0">Indonesian Ranking</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">
                                        @php
                                            $now = 0;
                                            $last = 0;
                                            foreach ($dataTheWur['indonesia'] as $item) {
                                                if (in_array($item['name'], ['Universitas Lampung', 'Lampung University', 'University of Lampung'])) {
                                                    $now++;
                                                    break;
                                                }
                                                $now++;
                                            }
                                            foreach ($dataPastTheWur['indonesia'] as $item) {
                                                if (in_array($item['name'], ['Universitas Lampung', 'Lampung University', 'University of Lampung'])) {
                                                    $last++;
                                                    break;
                                                }
                                                $last++;
                                            }
                                        @endphp
                                        {{ $now }}
                                    </h3>
                                    {!! $now <= $last
                                        ? '<div class="badge rounded bg-label-success">+' . $last - $now . '</div>'
                                        : '<div class="badge rounded bg-label-danger">' . $last - $now . '</div>' !!}
                                </div>
                            </div>
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-scoreboard ti-sm"></i>
                                    </div>
                                    <h6 class="mb-0">Total Score</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">{{ $dataTheWur['scores_overall'] }}</h3>
                                    {!! intval($dataPastTheWur['scores_overall']??0) == 0 ? '<div class="badge rounded bg-label-success">+' . intval($dataTheWur['scores_overall'] ?? 0) . '</div>' : (intval($dataTheWur['scores_overall'] ?? 0) >= intval($dataPastTheWur['scores_overall'] ?? 0)
                                        ? '<div class="badge rounded bg-label-success">+' .
                                            intval($dataTheWur['scores_overall'] ?? 0) -
                                            intval($dataPastTheWur['scores_overall'] ?? 0) .
                                            '</div>'
                                        : '<div class="badge rounded bg-label-danger">' .
                                            intval($dataTheWur['scores_overall'] ?? 0) -
                                            intval($dataPastTheWur['scores_overall'] ?? 0) .
                                            '</div>') !!}
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
                                <h6 class="mb-0 ms-3">Teaching</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataTheWur['scores_teaching'] ?? 0 }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-2 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Research environment</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataTheWur['scores_research'] ?? 0 }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-3 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Research quality</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataTheWur['scores_citations'] ?? 0 }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-4 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">International outlook</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">
                                        {{ $dataTheWur['scores_international_outlook'] ?? 0 }}</p>
                                </div>
                            </div>
                        </li>
                        <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                            <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-5 ti-sm"></i></div>
                            <div class="d-flex justify-content-between w-100 flex-wrap">
                                <h6 class="mb-0 ms-3">Industry</h6>
                                <div class="d-flex">
                                    <p class="mb-0 fw-medium text-primary">{{ $dataTheWur['scores_industry_income'] ?? 0 }}
                                    </p>
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
                        <div class="step" data-target="#data1">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">1</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Teaching</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#data2">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">2</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Research environment</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#data3">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">3</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Research quality</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#data4">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">4</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">International outlook</span>
                                </span>
                            </button>
                        </div>
                        <div class="line"></div>
                        <div class="step" data-target="#data5">
                            <button type="button" class="step-trigger">
                                <span class="bs-stepper-circle">5</span>
                                <span class="bs-stepper-label">
                                    <span class="bs-stepper-title">Industry</span>
                                </span>
                            </button>
                        </div>
                    </div>
                    <div class="bs-stepper-content">
                        <form onSubmit="return false">
                            <div id="data1" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Teaching (29.5%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        <ul>
                                            <li>Teaching reputation: 15%</li>
                                            <li>Staff-to-student ratio: 4.5%</li>
                                            <li>Doctorate-to-bachelor’s ratio: 2%</li>
                                            <li>Doctorates-awarded-to-academic-staff ratio: 5.5%</li>
                                            <li>Institutional income: 2.5%</li>
                                        </ul>
                                        <p>The most recent Academic Reputation Survey (run annually, this year conducted by
                                            THE) that underpins this category was carried out between October 2022 and
                                            January 2023. We have run the survey to ensure a balanced spread of responses
                                            across disciplines and countries. Where disciplines or countries were over- or
                                            under-represented, THE’s data team weighted the responses to fully reflect the
                                            global distribution of scholars. The 2023 data are combined with the results of
                                            the 2022 survey, giving more than 500,000 votes to universities in 166
                                            countries. Votes come from more than 68,000 cited academics.</p>
                                        <p>As well as giving a sense of how committed an institution is to nurturing the
                                            next generation of academics, a high proportion of postgraduate research
                                            students also suggests the provision of teaching at the highest level that is
                                            thus attractive to graduates and effective at developing them. This indicator is
                                            normalised to take account of a university’s unique subject mix, reflecting that
                                            the volume of doctoral awards varies by discipline.
                                        </p>
                                        <p>Institutional income is scaled against academic staff numbers and normalised for
                                            purchasing-power parity (PPP). It indicates an institution’s general status and
                                            gives a broad sense of the infrastructure and facilities available to students
                                            and staff.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div id="data2" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Research environment (29%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        <ul>
                                            <li>Research reputation: 18%</li>
                                            <li>Research income: 5.5%</li>
                                            <li>Research productivity: 5.5%</li>
                                        </ul>
                                        <p>The most prominent indicator in this category looks at a university’s reputation
                                            for research excellence among its peers, based on the responses to our annual
                                            Academic Reputation Survey (see above).</p>
                                        <p>Research income is scaled against academic staff numbers and adjusted for
                                            purchasing-power parity (PPP). This is a controversial indicator because it can
                                            be influenced by national policy and economic circumstances. But income is
                                            crucial to the development of world-class research, and because much of it is
                                            subject to competition and judged by peer review, our experts suggested that it
                                            was a valid measure. This indicator is fully normalised to take account of each
                                            university’s distinct subject profile, reflecting the fact that research grants
                                            in science subjects are often bigger than those awarded for the highest-quality
                                            social science, arts and humanities research.
                                        </p>
                                        <p>To measure productivity, we count the number of publications published in the
                                            academic journals indexed by Elsevier’s Scopus database per scholar, scaled for
                                            institutional size and normalised for subject. This gives a sense of the
                                            university’s ability to get papers published in quality peer-reviewed journals.
                                            From the 2018 rankings, we devised a method to give credit for papers that are
                                            published in subjects where a university declares no staff.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div id="data3" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Research quality (30%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        <ul>
                                            <li>Research reputation: 18%</li>
                                            <li>Research income: 5.5%</li>
                                            <li>Research productivity: 5.5%</li>
                                        </ul>
                                        <p>The most prominent indicator in this category looks at a university’s reputation
                                            for research excellence among its peers, based on the responses to our annual
                                            Academic Reputation Survey (see above).</p>
                                        <p>Research income is scaled against academic staff numbers and adjusted for
                                            purchasing-power parity (PPP). This is a controversial indicator because it can
                                            be influenced by national policy and economic circumstances. But income is
                                            crucial to the development of world-class research, and because much of it is
                                            subject to competition and judged by peer review, our experts suggested that it
                                            was a valid measure. This indicator is fully normalised to take account of each
                                            university’s distinct subject profile, reflecting the fact that research grants
                                            in science subjects are often bigger than those awarded for the highest-quality
                                            social science, arts and humanities research.
                                        </p>
                                        <p>To measure productivity, we count the number of publications published in the
                                            academic journals indexed by Elsevier’s Scopus database per scholar, scaled for
                                            institutional size and normalised for subject. This gives a sense of the
                                            university’s ability to get papers published in quality peer-reviewed journals.
                                            From the 2018 rankings, we devised a method to give credit for papers that are
                                            published in subjects where a university declares no staff.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div id="data4" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">International outlook (7.5%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        <ul>
                                            <li>Proportion of international students: 2.5%</li>
                                            <li>Proportion of international staff: 2.5%</li>
                                            <li>International collaboration: 2.5%</li>
                                        </ul>
                                        <p>The ability of a university to attract undergraduates, postgraduates and faculty
                                            from all over the planet is key to its success on the world stage. In the third
                                            international indicator, we calculate the proportion of a university’s total
                                            relevant publications that have at least one international co-author and reward
                                            higher volumes. This indicator is normalised to account for a university’s
                                            subject mix and uses the same five-year window as the “Research quality”
                                            category.</p>
                                        <p>Large countries have been disadvantaged compared to small countries in our
                                            international metrics, in that it is “easier” for staff and students in small
                                            countries to work or study abroad.​ This has led us to change our normalisation
                                            approach for the three measures in 2023, henceforth taking into consideration
                                            the population of a country when evaluating these metrics.
                                        </p>
                                        <p>A study abroad metric – assessing the provision of international learning
                                            opportunities for domestic students – complements the International Outlook
                                            pillar, but is currently given a weight of 0%. The zero weight is a temporary
                                            provision due to the impact of Covid-19 on international travel.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div id="data5" class="content">
                                <div class="content-header mb-3" style="text-align: justify">
                                    <h6 class="mb-0">Industry (4%)</h6>
                                </div>
                                <div class="row g-3">
                                    <div class="col-12">
                                        <ul>
                                            <li>Industry income: 2%</li>
                                            <li>Patents: 2%</li>
                                        </ul>
                                        <p>A university’s ability to help industry with innovations, inventions and
                                            consultancy has become a core mission of the contemporary global academy. The
                                            industry income metric seeks to capture such knowledge-transfer activity by
                                            looking at how much research income an institution earns from industry (adjusted
                                            for PPP), scaled against the number of academic staff it employs.</p>
                                        <p>The metric suggests the extent to which businesses are willing to pay for
                                            research and a university’s ability to attract funding in the commercial
                                            marketplace – useful indicators of institutional quality.
                                        </p>
                                        <p>But the extent to which universities are supporting their national economies
                                            through technology transfer is an area that deserves greater recognition. The
                                            patents metric, introduced in 2023, is defined as the number of patents from any
                                            source that cite research conducted by the university.
                                        </p>
                                        <p>The data are provided by Elsevier and relate to patents published between 2018
                                            and 2022 (not research published between these dates). Patents are sourced from
                                            the World Intellectual Property Organisation, the European Patent Office, and
                                            the patent offices of the US, the UK and Japan.</p>
                                        <p>This measure is subject-weighted to avoid penalising universities producing
                                            research in fields low in patents, and scaled for institutional size.</p>
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
                window.location.href = "{{ route('pages-times-higher-education-ranking') }}" + "?tahun=" +
                    tahun;
            });
        });
    </script>
@endsection
