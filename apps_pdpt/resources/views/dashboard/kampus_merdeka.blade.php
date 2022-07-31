@extends('template_public.default')

@section('content')
    <div class="container">
        <div class="row">
{{--            <iframe title="{{ $data_1->kode_dashboard }}" width="100%" height="720" src="{{ $data_1->link_dashboard_bi }}" frameborder="0" allowFullScreen="true"></iframe>--}}
        </div>
        <div class="row">
            <iframe title="{{ $data->kode_dashboard }}" width="100%" height="720" src="{{ $data->link_dashboard_bi }}" frameborder="0" allowFullScreen="true"></iframe>
        </div>
    </div>
@endsection
