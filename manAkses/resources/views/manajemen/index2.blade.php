@extends('template.main.app')
@section('title','Dashboard')

@section('content')
    <h3 class="text-muted">Integrated Apps</h3>
    <div class="row">
        @foreach($aplikasi AS $items)
        <div class="col-6 col-sm-4 col-md-2 d-flex align-items-stretch flex-column">
            <a href="{{ $items->url }}">
                <div class="card bg-info d-flex flex-fill">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-12 text-center">
                                <img src="{{ asset('auth/img/logo.png') }}" alt="user-avatar" class="img-circle img-fluid">
                                <p class="text-light text-sm"><b>{{$items->nm_aplikasi}}</b></p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
        @endforeach
    </div>
    
    <h3 class="text-muted">Non-Integrated Apps</h3>
    <div class="row">
        @foreach($aplikasi AS $items)
        <div class="col-6 col-sm-4 col-md-2 d-flex align-items-stretch flex-column">
            <a href="{{ $items->url }}">
                <div class="card bg-warning d-flex flex-fill">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-12 text-center">
                                <img src="{{ asset('auth/img/logo.png') }}" alt="user-avatar" class="img-circle img-fluid">
                                <p class="text-muted text-sm"><b>{{$items->nm_aplikasi}}</b></p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
        @endforeach
    </div>

@endsection