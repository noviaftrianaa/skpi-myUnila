@extends('mahasiswa::layouts.master')
@section('title', 'Data Pribadi')
@section('css')
<style>


img {
    height: 400px;
}

h1 {
    font-size: 80px;
    padding-top: 20px;
}

.coming-soon {
    box-shadow: 3px 3px 6px #b8b9be, -3px -3px 9px #fff;
    border-color: #ced4da !important;
    padding: 40px;
    border-radius: 28px;
}


@media(max-width: 992px) {
    h1 {
        font-size: 60px;
    }
}

@media(max-width: 768px) {
    img {
        height: auto;
    }
}

@media(max-width: 576px) {
    .container {
        max-width: 90%;
    }

    h1 {
        font-size: 50px;
        line-height: 44px;
    }

    h2 {
        font-size: 20px;
    }

    .coming-soon {
        padding: 20px;
    }
}

@media(max-width: 425px) {
    h1 {
        font-size: 40px;
    }

    h2 {
        font-size: 17px;
    }
}

</style>
@stop

@section('content')
<div class="container p-0 d-flex align-items-center vh-100 justify-content-center">
    <div class="row w-100">
        <div class="col-md-12 text-center">
            <div class="coming-soon">
                <img src="{{ asset('assets/img/under-construction.svg') }}" class="w-100">
                <h1 class="mb-0">We're Coming Soon.</h1>
                <h2>Our website is under construction.</h2>
                <h2 class="mb-0">We will launch Soon.</h2>
            </div>
        </div>
    </div>
</div>
@endsection
