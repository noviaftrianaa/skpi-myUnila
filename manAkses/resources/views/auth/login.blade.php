@extends('template.auth')
@section('title', 'Login Area')
@section('content')

<div class="box-2 d-flex align-items-center flex-column">
    <div class="text-center">
        <!-- <p class="mb-1 mb-sm-0 h-1 mt-auto">
            @<img src="{{ asset('images/sima-sso.png') }}" title="Manajemen Akses" class="img-fluid" />
        </p> -->
        <p class="mb-1 mb-sm-0 h-1 mt-auto">Sistem Informasi Manajemen Akses (SIMA) Universitas Lampung</p>
        <!-- <p class="mb-1 mb-sm-0 h-1">Universitas Lampung</p> -->

        <div class="card-mobile d-flex flex-column">
            <div class="input-field d-flex flex-column">
                <div class="mt-3">
                    <a type="button" href="{{ route('auth.signing_process') }}" class="btn btn-primary btn-block">
                        <i class="fa fa-user"></i>  Login With SSO
                    </a>
                </div>
                <div class="mt-3 text1">
                    <a type="button" href="{{ route('auth.forgot_password') }}" class="btn btn-info btn-block">
                        <i class="fa fa-question"></i>  Forgot Password
                    </a>
                </div>
                <div class="mt-4 text-muted text-center">Situs ini dikelola oleh Tim <a href="http://tik.unila.ac.id" title="">TIK Universitas Lampung</a></div>
            </div>
        </div>
    </div>
</div>

@endsection