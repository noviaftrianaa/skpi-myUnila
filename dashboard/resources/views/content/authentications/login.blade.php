@php
    $customizerHidden = 'customizer-hide';
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Login Page')

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
@endsection

@section('content')
    <div class="container-xxl">
        <div class="authentication-wrapper authentication-basic container-p-y">
            <div class="authentication-inner py-4">
                <!-- Login -->
                <div class="card">
                    <div class="card-body">

                        <h4 class="mb-1 pt-2">Welcome to {{ config('variables.templateName') }}! 👋</h4>
                        <p class="mb-4">Please sign-in to your account</p>

                        <div class="my-3">
                            <a href="{{ route('auth-sso') }}" class="btn btn-primary w-100"><i class="fas fa-user me-2"></i>Sign
                                In - SSO UNILA</a>
                        </div>
                        <div class="my-3">
                            <a href="https://apps.unila.ac.id/#lupa" class="btn btn-info w-100" target="_blank"><i
                                    class="fas fa-info-circle me-2"></i>Lupa Kata Sandi</a>
                        </div>
                        <div class="my-3">
                            <a href="/" class="btn btn-default w-100"><i
                                    class="fas fa-home me-2"></i>Dashboard</a>
                        </div>

                        <div class="divider my-4">
                            <div class="divider-text">
                                Created By <a href="https://tik.unila.ac.id" target="_blank">UPT TIK</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
