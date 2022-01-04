@extends('auth.layout')
@section('title', 'Pastikan email yang dimasukkan valid!')
@section('content')
    <form action="{{ route('auth.do_register') }}" method="post">
        {!! csrf_field() !!}
        <label for="email">Email</label>
        <div class="input-group mb-3">
            <input type="email" name="username" id="username" class="form-control {{($errors->has('username')?" is-invalid":"")}}" placeholder="Tulis Email anda">
            <div class="input-group-append">
                <div class="input-group-text">
                    <span class="fas fa-envelope"></span>
                </div>
            </div>
            @if($errors->has('username'))
                <span class="invalid-feedback">{{ $errors->first('username') }}</span>
            @endif
        </div>
        <div class="row">
            <button type="submit" class="btn btn-info btn-block">Daftar Akun</button>
        </div>
        <hr>
        Sudah memiliki akun?
        <div class="row mt-2">
            <a  href="{{ route('login') }}" class="btn btn-outline-primary btn-block">Login</a>
        </div>
    </form>
@endsection
