@extends('layouts/layoutMaster')

@section('title', $title)

@section('content')

    <h4>
        {{ $title }} <!-- jika halaman tidak memiliki menu induk -->
        <span class="text-muted fw-light">{{ $menu_induk }} /</span> {{ $title }}
        <!-- jika halaman memiliki menu induk -->
    </h4>

    <div class="card">
        <div
            class="card-header sticky-element bg-label-light d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4">
            <h5 class="card-title">{{ $title }}</h5>
            <div class="float-end">
                <div class="btn-group" role="group">
                    <!-- jika ingin menambahkan button, letakkan disini -->
                </div>
            </div>
        </div>
        <div class="card-body my-3">
            <!-- tambahkan content di bagian ini -->
        </div>
    </div>
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/jquery-sticky/jquery-sticky.js') }}"></script> <!-- wajib ditambahkan -->
@endsection

@section('page-script')
    <script src="{{ asset('assets/js/form-layouts.js') }}"></script> <!-- wajib ditambahkan -->
@endsection
