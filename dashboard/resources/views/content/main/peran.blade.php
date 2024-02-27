@php
    $customizerHidden = 'customizer-hide';
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Ganti Peran')

@section('vendor-style')
    <!-- Vendor -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/@form-validation/umd/styles/index.min.css') }}" />
@endsection

@section('page-style')
    <!-- Page -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/css/pages/page-auth.css') }}">
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/@form-validation/umd/bundle/popular.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('assets/js/pages-auth.js') }}"></script>
    <script>
        $(document).ready(function() {
            $('button').on('click', function() {
                var id = $(this).data('id');
                window.location.href = "{{ route('main-changePeran') }}" + "?id_peran=" + id;
            });
        });
    </script>
@endsection

@section('content')
    <div class="container-xxl">
        <div class="authentication-wrapper authentication-basic container-p-y">
            <div class="authentication-inner py-4">
                <!-- Login -->
                <div class="card">
                    <div class="card-body">

                        <h4 class="mb-2 pt-2">Ganti Peran</h4>

                        @foreach ($peran as $item)
                            <div class="my-3">
                                <button data-id="{{ $item->id_peran }}" class="btn btn-{!! $item->id_peran == session()->get('login.role')->id_peran ? 'label-success' : 'label-dark' !!} p-2 w-100"
                                    type="button">{{ $item->nm_peran }} {!! $item->id_peran == session()->get('login.role')->id_peran ? '<i class="fas fa-check ms-2"></i>' : '' !!} </button>
                            </div>
                        @endforeach

                        <div class="divider mt-5">
                            <div class="divider-text">
                                <a href="javascript:history.back()" class="btn btn-label-primary w-100"><i
                                        class="ti ti-home me-2"></i>Dashboard Utama</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
