@extends('template.auth')
@section('title', 'Otorisasi Gagal!')
@section('content')

<div class="box-2 d-flex align-items-center flex-column">
    <div class="text-center">
        <p class="mb-1 mb-sm-0 h-1 mt-auto">
            <img src="{{ asset('images/sima-sso.png') }}" title="Manajemen Akses" class="img-fluid" />
        </p>

        <div class="card-mobile d-flex flex-column">
            <div class="input-field d-flex flex-column">
                <h2>Otorisasi Gagal!</h2>
                <div class="mt-3">
                    <a type="button" href="{{ route('auth.logout') }}" class="btn btn-warning btn-block">
                        <i class="fa fa-sign-out"></i>  Logout
                    </a>
                </div>
                <div class="mt-4 text-muted text-center">Situs ini dikelola oleh Tim <a href="http://tik.unila.ac.id" title="">TIK Universitas Lampung</a></div>
            </div>
        </div>
    </div>
</div>

@endsection