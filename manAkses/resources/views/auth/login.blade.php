@extends('template.auth')
@section('title', 'Login Area')
@section('content')

<div class="box-2 d-flex flex-column h-100 ">
    <div class="text-center">
        <p class="mb-1 mb-sm-0 h-1">Sistem Informasi Manajemen Akses</p>
        <p class="text-muted mt-4">Login your account</p>

        <div class="card-mobile d-flex flex-column">
            <div class="input-field d-flex flex-column">
              <form id="loginForm" class="form-horizontal" role="form" action="{{route('auth.login')}}" method="post">
                  {!! csrf_field() !!}
                  <input type="email" class="form-control input-lg" id="inputLogin" name="username" placeholder="Username" value="{{ old('username') }}" autofocus required>
                  <input type="password" class="form-control input-lg mt-3" id="inputPassword" name="password" placeholder="Password" required> 
                  <button type="submit" class="mt-4 btn btn-success text-white d-flex justify-content-center align-items-center"><i class="fa fa-sign-in" aria-hidden="true"></i>&nbsp;Login</button>
                  <div class="mt-3 text1"> <a href="{{ route('auth.register') }}" class="text-muted mt-3 forget">Register</a> </div>
                  <div class="mt-3 text1"> <a href="{{ route('auth.signing_process') }}" class="text-muted mt-3 forget">Login with SSO</a> </div>
                  <div class="mt-3 text1"> <a class="text-muted mt-3 forget" href="{{ route('auth.forgot_password') }}">Forget Password?</a> </div>
                  <div class="text2 mt-4 d-flex flex-row align-items-center"> </span> </div>
              </form>
            </div>
        </div>
    </div>
</div>

@endsection