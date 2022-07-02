<!DOCTYPE html>
<html lang="en">
<head>
    <title>@yield('title')</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/png" href="{{ asset('auth/img/logo.png') }}">
    <link href="{{ asset('auth/assets/style.css') }}" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
    <link href="{{ asset('auth/css/font-awesome.min.css') }}" rel="stylesheet">
    @stack('css')
</head>
<body>

<div id="wrap">
    <div class="container">
        <div class="body d-md-flex align-items-center justify-content-between">
            <div class="box-1 mt-md-0 mt-5"> 
                <img src="{{ asset('auth/assets/images/bg-form.jpg') }}" class="" alt=""> 

            </div>
            <img src="{{ asset('auth/assets/images/logo-unila.png') }}" class="logo" alt=""> 
            @yield('content')
        </div>
    </div>
</div>


<script type="text/javascript" src="{{ asset('auth/js/jquery.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('auth/js/bootstrap.min.js') }}"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p" crossorigin="anonymous"></script>
<script src="{!! asset('node_modules/sweetalert/dist/sweetalert.min.js') !!}"></script>
@stack('js')
@include('sweet::alert')

</body>
</html>