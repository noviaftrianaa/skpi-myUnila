@extends('template.auth')
@section('title', 'Login Area')
@section('content')

<!-- /form -->
<div class="workinghny-form-grid">
  <div class="wrapper">
    <div class="logo">
      <h1><a class="brand-logo" href="index.html"> Access Management<br>Sign In</a></h1>
      <!-- if logo is image enable this   
      <a class="brand-logo" href="#index.html">
      <img src="image-path" alt="Your logo" title="Your logo" style="height:35px;" />
      </a> -->
    </div>
    <div class="workinghny-block-grid">
      <div class="workinghny-left-img">
        <img src="https://upload.wikimedia.org/wikipedia/id/f/ff/Logo_UnivLampung.png" class="img-responsive" width="75%" alt="img" />
      </div>
      <div class="form-right-inf">
        <div class="login-form-content">
          <form action="{{route('auth.login')}}" class="signin-form" method="post">
            {!! csrf_field() !!}
            <div class="one-frm">
              <label>Username</label>
              <input type="text" name="username" id="username" placeholder="Tuliskan Username/Nama ID" value="{{ old('username') }}">
            </div>
            <div class="one-frm">
              <label>Password</label>
              <input type="password" name="password" id="password" placeholder="Tuliskan Password Anda">
            </div>
            <label class="check-remaind">
              <input type="checkbox">
              <span class="checkmark"></span>
              <p class="remember">Remember Me</p>
            </label>
            <button class="btn btn-style mt-3">Sign In </button>
            <p class="already">
              <a href="{{ route('auth.signing_process') }}" class="btn btn-style mt-3">Login With SSO</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
@endsection