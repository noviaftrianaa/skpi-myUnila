@extends('template.main.app')
@section('title','Dashboard')

@section('content')
    <h3 class="text-muted text-bold">Integrated Apps</h3>
    <div class="row mb-3">
        @foreach($app_inter AS $items)
        <div class="col-6 col-sm-4 col-md-2 d-flex align-items-stretch flex-column">
            <a href="{{ $items->url }}">
                <div class="card bg-info d-flex flex-fill">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-12 text-center">
                                <img src="{{ (!is_null($items->largeobject)) ? 'data:image/' . $items->largeobject->mime_type . ';base64,' . $items->largeobject->blob_content : asset('auth/img/logo.png') }}" class="img-fluid" alt="apps">
                                <p class="text-light text-md"><b>{{$items->nm_aplikasi}}</b></p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
        @endforeach
    </div>
    
    <h3 class="text-muted text-bold">Non-Integrated Apps</h3>
    <div class="row">
        @if(!is_null($app_non_inter))
        @foreach($app_non_inter AS $items)
        <div class="col-6 col-sm-4 col-md-2 d-flex align-items-stretch flex-column">
            <a href="{{ $items->url }}">
                <div class="card bg-warning d-flex flex-fill">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-12 text-center">
                                <img src="{{ (!is_null($items->largeobject)) ? 'data:image/' . $items->largeobject->mime_type . ';base64,' . $items->largeobject->blob_content : asset('auth/img/logo.png') }}" class="img-fluid" alt="apps">
                                <p class="text-muted text-sm"><b>{{$items->nm_aplikasi}}</b></p>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
        </div>
        @endforeach
        @else
        <div class="col-12 col-sm-12 col-md-12 d-flex align-items-stretch flex-column">
            === Tidak Ada Data ===
        </div>
        @endif
    </div>

@endsection