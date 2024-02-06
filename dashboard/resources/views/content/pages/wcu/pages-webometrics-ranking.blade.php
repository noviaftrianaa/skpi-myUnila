@extends('layouts/layoutMaster')

@section('title', $title)

@section('content')
    <!-- Hour chart  -->
    <div class="card bg-transparent shadow-none my-4 border-0">
        <div class="card-body row p-0 pb-3">
            <div class="col-12 col-md-8 card-separator">
                <h3>University of Lampung Ranking</h3>
                <div class="col-12 col-lg-7">
                    <p></p>
                </div>
                <div class="d-flex justify-content-between flex-wrap gap-3 me-5">
                    <div class="d-flex align-items-center gap-3 me-4 me-sm-0">
                        <span class="bg-label-primary p-2 rounded">
                            <i class='ti ti-world ti-xl'></i>
                        </span>
                        <div class="content-right">
                            <p class="mb-0">World Ranking</p>
                            <h4 class="text-primary mb-0">{{ $dataWebometrics['rank_by_world'] ?? "-" }}</h4>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="bg-label-info p-2 rounded">
                            <i class='ti ti-globe ti-xl'></i>
                        </span>
                        <div class="content-right">
                            <p class="mb-0">Asian Ranking</p>
                            <h4 class="text-info mb-0">{{ $dataWebometrics['rank_by_asian'] ?? "-" }}</h4>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="bg-label-warning p-2 rounded">
                            <i class='ti ti-discount-check ti-xl'></i>
                        </span>
                        <div class="content-right">
                            <p class="mb-0">Indonesian Rank </p>
                            <h4 class="text-warning mb-0">{{ $dataWebometrics['rank_by_impact'] ?? '-' }}</h4>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 col-md-4 ps-md-3 ps-lg-4 pt-3 pt-md-0">
                <div class="d-flex justify-content-between align-items-center">
                    <img src="https://www.uzhnu.edu.ua/uploads/news/20210111_1631_img1866941047.jpg" class="img-fluid" style="height: 125px" />
                </div>
            </div>
        </div>
    </div>

@endsection
