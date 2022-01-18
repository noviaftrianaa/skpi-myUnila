@extends('template.auth')
@section('title', 'Forgot Password Area')
@section('content')

<div class="box-2 d-flex align-items-center flex-column">
    <div class="text-center">
        <!-- <p class="mb-1 mb-sm-0 h-1 mt-auto">
            @<img src="{{ asset('images/sima-sso.png') }}" title="Manajemen Akses" class="img-fluid" />
        </p> -->
        <p class="mb-1 mb-sm-0 h-1 mt-auto"><i class="fa fa-question"></i> Lupa Password</p>
        <!-- <p class="mb-1 mb-sm-0 h-1">Universitas Lampung</p> -->

        <div class="card-mobile d-flex flex-column">
            <div class="input-field d-flex flex-column">
                <form action="" method="post">
                    {!! csrf_field() !!}
                    <div class="mt-3">
                        <input type="email" name="username" class="form-control text-center" placeholder="Masukkan Email Anda" required focuses>
                    </div>
                    <div class="mt-3 text1">
                        <button type="submit" class="btn btn-primary btn-block">
                            <i class="fa fa-arrow-circle-right"></i>&nbsp;Submit
                        </a>
                    </div>
                </form>
                <div class="mt-4 text-center">Kembali Ke Halaman <a href="{{ route('auth.login') }}" title="Login">Login</a></div>
                <div class="mt-4 text-muted text-center">Situs ini dikelola oleh Tim <a href="http://tik.unila.ac.id" title="">TIK Universitas Lampung</a></div>
            </div>
        </div>
    </div>
</div>

@endsection