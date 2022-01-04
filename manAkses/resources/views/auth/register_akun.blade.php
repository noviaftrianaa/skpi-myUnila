@extends('auth.layout')

@section('title', 'Aktivasi Akun')

@include('__partial.date')

@section('content')

    <form action="{{ route('auth.do_aktivasi',Crypt::encrypt($data)) }}" method="post">

        {!! csrf_field() !!}

        <label for="nama_lengkap">Nama Lengkap <i class="text-danger">*</i></label>

        <div class="input-group mb-3">

            <input type="text" name="nama_lengkap" id="nama_lengkap" value="{{ $info->nm_pd }}"  class="form-control" readonly>

            <div class="input-group-append">

                <div class="input-group-text">

                    <span class="fas fa-user"></span>

                </div>

            </div>

        </div>

        <label for="nim">Nomor Induk Pengguna <i class="text-danger">*</i></label>

        <div class="input-group mb-3">

            <input type="text" name="nim" id="nim" value="{{ $info->nim }}"  class="form-control" readonly>

            <div class="input-group-append">

                <div class="input-group-text">

                    <span class="fas fa-barcode"></span>

                </div>

            </div>

        </div>

        <label for="prodi">Asal Program Studi <i class="text-danger">*</i></label>

        <div class="input-group mb-3">

            <input type="text" name="prodi" id="prodi" value="{{ $info->prodi }}"  class="form-control" readonly>

            <div class="input-group-append">

                <div class="input-group-text">

                    <span class="fa fa-building-o"></span>

                </div>

            </div>

        </div>

        <hr>

        <label for="email">Username <i class="text-danger">*</i></label>

        <div class="input-group mb-3">

            <input type="email" name="email" id="email" class="form-control {{($errors->has('email')?" is-invalid":"")}}" required placeholder="Tulis Email anda" value="{{ $data['email'] }}" readonly>

            <div class="input-group-append">

                <div class="input-group-text">

                    <span class="fas fa-envelope"></span>

                </div>

            </div>

            @if($errors->has('email'))

                <span class="invalid-feedback">{{ $errors->first('email') }}</span>

            @endif

        </div>

        <label for="password">Password <i class="text-danger">*</i></label>

        <div class="input-group mb-3">

            <input type="password" name="password" id="password" class="form-control {{($errors->has('password')?" is-invalid":"")}}" required placeholder="Tulis Password anda">

            <div class="input-group-append">

                <div class="input-group-text">

                    <span class="fas fa-key"></span>

                </div>

            </div>

            @if($errors->has('password'))

                <span class="invalid-feedback">{{ $errors->first('password') }}</span>

            @endif

        </div>

        <label for="password_confirmation">Konfirmasi Password <i class="text-danger">*</i></label>

        <div class="input-group mb-3">

            <input type="password" name="password_confirmation" id="password_confirmation" class="form-control {{($errors->has('password_confirmation')?" is-invalid":"")}}" required placeholder="Tulis Password anda">

            <div class="input-group-append">

                <div class="input-group-text">

                    <span class="fas fa-key"></span>

                </div>

            </div>

            @if($errors->has('password_confirmation'))

                <span class="invalid-feedback">{{ $errors->first('password_confirmation') }}</span>

            @endif

        </div>

        <div class="row">

            <button type="submit" class="btn btn-success btn-block"><i class="fa fa-check"></i> Aktifkan Akun</button>

        </div>

        <hr>

        Sudah memiliki akun?

        <div class="row mt-2">

            <a  href="{{ route('auth.login') }}" class="btn btn-outline-primary btn-block">Login</a>

        </div>

    </form>

@endsection

