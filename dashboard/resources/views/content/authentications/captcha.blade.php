@php
    $customizerHidden = 'customizer-hide';
@endphp

@extends('layouts/layoutMaster')

@section('title', 'Captcha Verification Page')

@section('vendor-style')
    <!-- Vendor -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/@form-validation/umd/styles/index.min.css') }}" />
@endsection

@section('page-style')
    <!-- Page -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/css/pages/page-auth.css') }}">
    <style>
        .captcha-wrap {
            position: relative;
        }

        #CaptchaImageCode {
            text-align: center;
            margin-bottom: 15px;
            padding: 0px 0;
            overflow: hidden;
        }

        .capcode {
            font-size: 46px;
            display: block;
            -moz-user-select: none;
            -webkit-user-select: none;
            user-select: none;
            cursor: default;
            letter-spacing: 1px;
            font-family: 'Roboto Slab', serif;
            font-weight: 100;
            font-style: italic;
            width: 87%;
            height: 80px;
        }

        .ReloadBtn {
            background: url({!! asset('/captcha/img/refresh.png') !!}) left top no-repeat;
            background-size: 100%;
            width: 32px;
            height: 32px;
            border: 0px;
            outline: none;
            position: absolute;
            bottom: 25px;
            right: 0;
            cursor: pointer;
        }

        .error {
            color: red;
            display: none;
        }
    </style>
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/@form-validation/umd/bundle/popular.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/@form-validation/umd/plugin-bootstrap5/index.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/@form-validation/umd/plugin-auto-focus/index.min.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('assets/js/pages-auth.js') }}"></script>
    <script src="{{ asset('captcha/js/captcha.js') }}"></script>
@endsection

@section('content')
    <div class="container-xxl">
        <div class="authentication-wrapper authentication-basic container-p-y">
            <div class="authentication-inner py-4">
                <!-- Login -->
                <div class="card">
                    <div class="card-body">

                        <h4 class="mb-1 pt-2">Captcha Verification</h4>
                        <p class="mb-4">Please fill the captcha field</p>

                        <form action="{{ route('auth-captcha') }}" method="POST" enctype="multipart/form-data"
                            id="formCaptcha">

                            <input type="hidden" name="_token" value="{{ csrf_token() }}">
                            <input type="hidden" name="_method" value="POST">

                            <div class="row">
                                <div class="col-12">
                                    <div class="form-group form-group-default">
                                        <div class="captcha-wrap">
                                            <div id="CaptchaImageCode">
                                                <canvas id="CapCode" class="capcode"></canvas>
                                            </div>
                                            <input type="button" class="ReloadBtn" onclick="CreateCaptcha()">
                                            <input type="hidden" name="data" value="{{ json_encode($data) }}">
                                        </div>

                                        <div class="input-group">
                                            <input type="text" id="captcha-code" class="form-control text-center"
                                                placeholder="Enter Captcha" maxlength="6" required>
                                            <div class="input-group-prepend">
                                                <span class="input-group-text bg-dark"><i class="fas fa-barcode"></i></span>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                <div class="col-12 text-center">
                                    <p id="captcha-error" class="error"></p>
                                </div>
                            </div>

                        </form>

                        <div class="my-2">
                            <button type="Submit" class="btn btn-block btn-primary w-100"
                                onclick="CheckCaptcha(); Submit()">
                                Verifikasi
                                <i class="fas fa-sign-in ms-2"></i>
                            </button>
                        </div>

                        <div class="my-4">
                            <a href="{{ route('auth-logout') }}"
                                onclick="event.preventDefault(); document.getElementById('logout-form').submit();"
                                class="btn btn-danger w-100">
                                Log Out
                                <i class="fas fa-sign-out ms-2"></i>
                            </a>
                            <form method="POST" id="logout-form" action="{{ route('auth-logout') }}">
                                @csrf
                            </form>
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
