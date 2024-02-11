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
                                        {{ intval($dataQsWordUniversity['rank'] ?? 0) > 0 ? intval($dataQsWordUniversity['rank'] ?? 0) : $dataQsWordUniversity['rank'] ?? 0 }}
                                    </h1>
                                    {!! intval($dataPastQsWordUniversity['rank'] ?? 0) == 0
                                        ? '<div class="badge rounded bg-label-success">+' . intval($dataQsWordUniversity['rank'] ?? 0) . '</div>'
                                        : (intval($dataQsWordUniversity['rank'] ?? 0) <= intval($dataPastQsWordUniversity['rank'] ?? 0)
                                            ? '<div class="badge rounded bg-label-success">+' .
                                                intval($dataPastQsWordUniversity['rank'] ?? 0) -
                                                intval($dataQsWordUniversity['rank'] ?? 0) .
                                                '</div>'
                                            : '<div class="badge rounded bg-label-danger">' .
                                                intval($dataPastQsWordUniversity['rank'] ?? 0) -
                                                intval($dataQsWordUniversity['rank'] ?? 0) .
                                                '</div>') !!}
                                </div>
                                <small>Sumber: https://topuniversities.com/</small>
                            </div>
                            <img src="{{ asset('images/unila_ranking/qs_world_university_ranking.png') }}"
                                class="img-fluid" style="height: 100px" />
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
                                        @php
                                            $now = 0;
                                            $last = 0;
                                            if (!empty($dataQsWordUniversity['asian'])) {
                                                foreach ($dataQsWordUniversity['asian'] as $item) {
                                                    if (in_array($item['title'], ['Universitas Lampung', 'Lampung University', 'University of Lampung'])) {
                                                        $now++;
                                                        break;
                                                    }
                                                    $now++;
                                                }
                                            }
                                            if (!empty($dataPastQsWordUniversity['asian'])) {
                                                foreach ($dataPastQsWordUniversity['asian'] as $item) {
                                                    if (in_array($item['title'], ['Universitas Lampung', 'Lampung University', 'University of Lampung'])) {
                                                        $last++;
                                                        break;
                                                    }
                                                    $last++;
                                                }
                                            }
                                        @endphp
                                        {{ $now }}
                                    </h3>
                                    {!! $last == 0
                                        ? '<div class="badge rounded bg-label-success">+' . $now . '</div>'
                                        : ($now <= $last
                                            ? '<div class="badge rounded bg-label-success">+' . $last - $now . '</div>'
                                            : '<div class="badge rounded bg-label-danger">' . $last - $now . '</div>') !!}
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
                                            if (!empty($dataQsWordUniversity['indonesian'])) {
                                                foreach ($dataQsWordUniversity['indonesian'] as $item) {
                                                    if (in_array($item['title'], ['Universitas Lampung', 'Lampung University', 'University of Lampung'])) {
                                                        $now++;
                                                        break;
                                                    }
                                                    $now++;
                                                }
                                            }
                                            if (!empty($dataPastQsWordUniversity['indonesian'])) {
                                                foreach ($dataPastQsWordUniversity['indonesian'] as $item) {
                                                    if (in_array($item['title'], ['Universitas Lampung', 'Lampung University', 'University of Lampung'])) {
                                                        $last++;
                                                        break;
                                                    }
                                                    $last++;
                                                }
                                            }
                                        @endphp
                                        {{ $now }}
                                    </h3>
                                    {!! $last == 0
                                        ? '<div class="badge rounded bg-label-success">+' . $now . '</div>'
                                        : ($now <= $last
                                            ? '<div class="badge rounded bg-label-success">+' . $last - $now . '</div>'
                                            : '<div class="badge rounded bg-label-danger">' . $last - $now . '</div>') !!}
                                </div>
                            </div>
                            <div class="col-12 col-sm-4">
                                <div class="d-flex gap-2 align-items-center">
                                    <div class="badge rounded bg-label-primary p-1"><i class="ti ti-scoreboard ti-sm"></i>
                                    </div>
                                    <h6 class="mb-0">Total Score</h6>
                                </div>
                                <div class="d-flex gap-2 align-items-center mb-2 pb-1 flex-wrap">
                                    <h3 class="my-2 pt-1">{{ $dataQsWordUniversity['score_nid'] ?? 0 }}</h3>
                                    {!! intval($dataPastQsWordUniversity['score_nid'] ?? 0) == 0
                                        ? '<div class="badge rounded bg-label-success">+' . intval($dataQsWordUniversity['score_nid'] ?? 0) . '</div>'
                                        : (intval($dataQsWordUniversity['score_nid'] ?? 0) >= intval($dataPastQsWordUniversity['score_nid'] ?? 0)
                                            ? '<div class="badge rounded bg-label-success">+' .
                                                intval($dataQsWordUniversity['score_nid'] ?? 0) -
                                                intval($dataPastQsWordUniversity['score_nid'] ?? 0) .
                                                '</div>'
                                            : '<div class="badge rounded bg-label-danger">' .
                                                intval($dataQsWordUniversity['score_nid'] ?? 0) -
                                                intval($dataPastQsWordUniversity['score_nid'] ?? 0) .
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
                        @if (!empty($dataQsWordUniversity['scores']))
                            @foreach ($dataQsWordUniversity['scores'] as $no => $item)
                                <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                                    <div class="badge bg-label-primary rounded p-2"><i
                                            class="ti ti-number-{{ $no + 1 }} ti-sm"></i></div>
                                    <div class="d-flex justify-content-between w-100 flex-wrap">
                                        <h6 class="mb-0 ms-3">{{ $item['indicator_name'] }}</h6>
                                        <div class="d-flex">
                                            <p class="mb-0 fw-medium text-primary">{{ $item['score'] }}</p>
                                        </div>
                                    </div>
                                </li>
                            @endforeach
                        @else
                            <li class="mb-4 pb-1 d-flex justify-content-between align-items-center">
                                <div class="badge bg-label-primary rounded p-2"><i class="ti ti-number-1 ti-sm"></i></div>
                                <div class="d-flex justify-content-between w-100 flex-wrap">
                                    <h6 class="mb-0 ms-3">-</h6>
                                    <div class="d-flex">
                                        <p class="mb-0 fw-medium text-primary">-</p>
                                    </div>
                                </div>
                            </li>
                        @endif
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
                        @if (!empty($dataQsWordUniversity['scores']))
                            @foreach ($dataQsWordUniversity['scores'] as $no => $item)
                                <div class="step" data-target="#data{{ $no + 1 }}">
                                    <button type="button" class="step-trigger">
                                        <span class="bs-stepper-circle">{{ $no + 1 }}</span>
                                        <span class="bs-stepper-label">
                                            <span class="bs-stepper-title">{{ $item['indicator_name'] }}</span>
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
                            @if (!empty($dataQsWordUniversity['scores']))
                                <div id="data1" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">Academic Reputation (20%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            The Academic Reputation Index is the centerpiece of the QS World University
                                            Rankings® carrying a weighting of 30%. It is an approach to international
                                            university
                                            evaluation that QS pioneered in 2004 and is the component that attracts the
                                            greatest
                                            interest and scrutiny. In concert with the Employer Reputation Index it is the
                                            aspect which sets this ranking most clearly apart from any other. It seeks to
                                            answer
                                            the powerful question: which universities are demonstrating academic excellence?
                                            To
                                            answer this question, we distil the collective intelligence of academics from
                                            around
                                            the world who lean into their discipline and regional expertise to guide them in
                                            their answers. The answer to this question not only illuminates the quality of
                                            an
                                            institution's research, but also their approach to academic partnerships, their
                                            strategic impact, their educational innovativeness and the impact they have made
                                            on
                                            education and society at large.
                                        </div>
                                    </div>
                                </div>
                                <div id="data2" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">Employer Reputation (15%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <p>The Employer Reputation component is unique amongst current international
                                                evaluations in taking into consideration the important component of
                                                employability.
                                                We remain the only major ranking to focus on this vital aspect of a
                                                student's
                                                educational journey. The majority of undergraduate students leave university
                                                in
                                                search of employment after their first degree, making the reputation of
                                                their
                                                university amongst employers a crucial consideration.</p>

                                            <p>The Employer Reputation Index is a key metric of the QS World University
                                                Ranking(s)®
                                                carrying a weighting of 15% in the World University Ranking and different
                                                weights in
                                                other rankings we produce.</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="data3" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">Faculty Student Ratio (10%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <p>Faculty Student Ratio is a major indicator in many of the QS Rankings. This
                                                indicator aims to act as a proxy for the learning and teaching environment
                                                of
                                                the institution. The more academic staff resource made available to
                                                students,
                                                such as teaching, supervision, curriculum development, and pastoral support,
                                                the
                                                better this experience ought to be. It is calculated by dividing the number
                                                of
                                                Faculty figure validated by QS by the Students figure validated by QS. It
                                                aims
                                                to serve as a proxy measure for the learning and teaching environment of the
                                                institution.</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="data4" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">Citations per Faculty (20%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <p>The Citations per Faculty score contributes 20% to the World University
                                                Ranking
                                                score. It is a measure of the relative intensity and volume of research
                                                being
                                                done at an institute, taking into account institute size. Citations,
                                                evaluated
                                                to take into account the size of the institution, are a well-understood and
                                                widely accepted measure of research strength.</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="data5" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">International Faculty Ratio (5%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <h6>Rationale:</h6>
                                            <p>This indicator looks at the ratio of international faculty staff to overall
                                                staff. If an institution is attracting a sizeable population of
                                                international
                                                faculty this has benefits in terms of the research and teaching diversity
                                                and
                                                collaboration. Further, if an institution is attracting a sizeable number of
                                                overseas staff it follows that it is attractive enough to do so.</p>
                                            <h6>Calculation:</h6>
                                            <p>The number of faculty staff who contribute to academic teaching or research
                                                or
                                                both at a university for a minimum period of at least three months and who
                                                are
                                                of foreign nationality as a proportion of overall faculty staff.</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="data6" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">International Student Ratio (5%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <h6>Rationale:</h6>
                                            <p>This indicator looks at the ratio of international students to overall
                                                students.
                                                If an institution is attracting a sizeable population of international
                                                students
                                                this has benefits in terms of networking, cultural exchanges, a more diverse
                                                learning experience and alumni diversity. Further, if an institution is
                                                attracting a sizeable number of overseas students it follows that it is
                                                attractive enough to do so.
                                            </p>
                                            <h6>Calculation:</h6>
                                            <p>The total number of undergraduate and postgraduate students who are foreign
                                                nationals and who spend at least three months at your university as a
                                                proportion
                                                of the total number of undergraduate students and postgraduate students
                                                overall.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div id="data7" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">International Research Network (5%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <p>The International Research Network (IRN) is a measure of global engagement,
                                                and
                                                specifically on how institutions create and sustain research partnerships
                                                resulting in
                                                internationally co-authored publications with other institutions across
                                                borders
                                                to
                                                collaborate on solving the world's challenges and disseminate vital research
                                                to
                                                wider
                                                audiences. </p>
                                            <p>The IRN adapts the Margalef Index, widely used in the environmental sciences,
                                                to
                                                estimate
                                                the richness of international research partners for a given institution. IRN
                                                Index
                                                reflects the ability of institutions to diversify the geography of their
                                                international
                                                research network by establishing repeated research partnerships with other
                                                higher
                                                education institutions. It also reflects the efficiency of this as we look
                                                at
                                                the
                                                diversity of partner locations against the efforts needed to achieve such a
                                                diversity.
                                                Specifically, the QS International Research Network (IRN) Index is
                                                calculated
                                                with the
                                                following formula:
                                            </p>
                                            <h5>IRN Index = L / ln(P), **</h5>
                                            <p>where In(P) is the natural logarithm of the distinct count of international
                                                partners
                                                (higher education institutions) and L is the distinct count of international
                                                countries/territories represented by them.
                                            </p>
                                            <p>In QS World University Rankings, QS University Rankings by Region, as well as
                                                QS
                                                Rankings
                                                by Subject, this metric considers only sustained partnerships, which we
                                                define
                                                as those
                                                which result in 3 or more joint papers published in the corresponding broad
                                                or
                                                narrow
                                                subject in a five-year period.

                                                In the QS Subject Rankings, we produce IRN Index for only those subjects
                                                with a
                                                decent
                                                volume of papers (those subjects with a paper threshold of more than 50
                                                papers
                                                over the
                                                last 5 years).

                                                The usual paper types and affiliation caps are applied.</p>
                                        </div>
                                    </div>
                                </div>
                                <div id="data8" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">Employment Outcomes (5%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <p>
                                                QS appreciates that for many students, a successful career is a primary goal
                                                of
                                                their
                                                university education. We have designed the Employment Outcomes indicator to
                                                reflect the
                                                ability of institutions to ensure a high level of employability for their
                                                graduates,
                                                while also nurturing future leaders who go on to make an impact in their
                                                respective
                                                fields.</p>
                                            <p>
                                                For this, we have combined two metrics, widely known from our QS Graduate
                                                Employability
                                                Rankings:</p>
                                            <ul>
                                                <li>Graduate Employment Index</li>
                                                <li>Alumni Impact</li>
                                            </ul>
                                            <p>
                                                The Alumni Impact Index is balanced against student numbers to ensure that
                                                larger and
                                                smaller institutions are proportionately evaluated. The resulting value is
                                                scaled from 0
                                                to 100 and used to adjust the Graduate Employment Index on a sliding scale:
                                            </p>

                                            <h5>Employment Outcomes = Alumni Impact Index adjusted * ln(Graduate Employment
                                                Index).</h5>


                                            <p>
                                                In common with our approach in various other indicators such as
                                                International
                                                Research
                                                Network, Academic Reputation and Employer Reputation, we apply
                                                log-transformation to
                                                draw in outliers and to ensure that the Graduate Employment Index component
                                                does
                                                not
                                                unduly influence the final score when compared with Alumni Impact Index.</p>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div id="data9" class="content">
                                    <div class="content-header mb-3" style="text-align: justify">
                                        <h6 class="mb-0">Sustainability (5%)</h6>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-12">
                                            <p>Starting from the 2024 edition of the QS World University Rankings, QS was
                                                proud
                                                to include a new 5% Sustainability performance lens as part of our evolved
                                                methodology. This makes us the first of the major rankings to incorporate
                                                Sustainability into the flagship rankings table, helping to emphasize the
                                                importance of this topic to students, institutions, national policymakers
                                                and
                                                the wider sector.

                                                In September 2023, we also introduced this into our inaugural QS Europe
                                                University Rankings, using the same methodology outlined below. </p>
                                        </div>
                                    </div>
                                </div>
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
