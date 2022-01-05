@extends('auth.layout')
@section('title', 'Forgot Password')
@section('content')
    <form action="{{ route('auth.do_forgot_password') }}" method="post">
        {!! csrf_field() !!}
        <label for="username">Username</label>
        <div class="input-group mb-3">
            <input type="text" name="username" id="username" class="form-control" placeholder="Tuliskan Username/Email Anda" value="{{ old('username') }}">
            <div class="input-group-append">
                <div class="input-group-text">
                    <span class="fas fa-envelope"></span>
                </div>
            </div>
        </div>
        <div class="row">
            <button type="submit" class="btn btn-primary btn-block">Send</button>
        </div>
        <hr>
        Sudah memiliki akun?
        <div class="row mt-2">
            <a  href="{{ route('login') }}" class="btn btn-outline-primary btn-block">Login</a>
        </div>
    </form>
@endsection