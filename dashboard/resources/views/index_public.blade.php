@extends('layouts/layoutMaster')

@section('title', $title)

@section('content')
    <!-- Chart -->
    <div class="row">

        <div class="col-12 mb-4">
            <div class="card">
                <div
                    class="card-header d-flex justify-content-between align-items-md-center align-items-start border-bottom">
                    <h4 class="card-title mb-0">{{ $title }}</h4>
                    <div class="float-end">
                        <div class="btn-group" role="group">
                            <!-- letakkan disini jika ingin menambahkan button -->
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <!-- letakkan content disini -->
                </div>
            </div>
        </div>
    </div>

@endsection

@section('vendor-style')
@endsection

@section('page-style')
@endsection

@section('vendor-script')
@endsection

@section('page-script')
@endsection
