@extends('template.default')

@push('css')
<link href="{{asset('node_modules/datatables/media/css/jquery.dataTables.css')}}" rel="stylesheet">
<style>
        .modal.modal-fullscreen .modal-dialog {
            width: 100vw;
            height: 100vh;
            margin: 0;
            padding: 0;
            max-width: none;
        }

        .modal.modal-fullscreen .modal-content {
            height: auto;
            height: 100vh;
            border-radius: 0;
            border: none;
        }

        .modal.modal-fullscreen .modal-body {
            overflow-y: auto;
        }

        h3{
        display: inline;
        }

        hr{
            border: 1px solid #17A2B8;
        }

        a {
            text-underline-offset: 0.2em
        }

        .nav-tabs .nav-item .nav-link {
            color: #0080FF;
            border-top: 1px solid #d6d7d8;
            border-left: 1px solid #d6d7d8;
            border-right: 1px solid #d6d7d8;
        }

        .nav-tabs .nav-item .nav-link.active {
            background-color: #17A2B8;
            color: #fff;
        }

</style>
@endpush

@section('content')

<div class="card card-primary card-outline">
    <div class="card-header">
        <h3 class="card-title">
            Dashboard IKU 1 - 8
        </h3>
    </div>
    <div class="card-body">
        <ul class="nav nav-tabs mb-3" id="custom-content-below-tab" role="tablist">
            <li class="nav-item">
                <a class="nav-link active" id="iku1-tab" data-toggle="pill" href="#iku1" role="tab" aria-controls="iku1" aria-selected="true">IKU 1</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="iku2-tab" data-toggle="pill" href="#iku2" role="tab" aria-controls="iku2" aria-selected="false">IKU 2</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="iku3-tab" data-toggle="pill" href="#iku3" role="tab" aria-controls="iku3" aria-selected="false">IKU 3</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="iku4-tab" data-toggle="pill" href="#iku4" role="tab" aria-controls="iku4" aria-selected="false">IKU 4</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="iku5-tab" data-toggle="pill" href="#iku5" role="tab" aria-controls="iku5" aria-selected="false">IKU 5</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="iku6-tab" data-toggle="pill" href="#iku6" role="tab" aria-controls="iku6" aria-selected="false">IKU 6</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="iku7-tab" data-toggle="pill" href="#iku7" role="tab" aria-controls="iku7" aria-selected="false">IKU 7</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="iku8-tab" data-toggle="pill" href="#iku8" role="tab" aria-controls="iku8" aria-selected="false">IKU 8</a>
            </li>
        </ul>
        <div class="tab-content" id="tabContent">
            <div class="tab-pane fade active show" id="iku1" role="tabpanel" aria-labelledby="iku1-tab">
                @include('home.wr.wakil_rektor4.iku._partial.chart_iku1')1
            </div>

        </div>
    </div>
</div>

@endsection
@section('js')
    <script type="text/javascript" src="{{asset('node_modules/highcharts/highstock.js')}}"></script>
    <script type="text/javascript" src="{{asset('node_modules/highcharts/modules/exporting.js')}}"></script>
    <script type="text/javascript" src="{{asset('node_modules/highcharts/modules/offline-exporting.js')}}"></script>
    <script type="text/javascript" src="{{ asset('node_modules/datatables/media/js/jquery.dataTables.min.js')}}"></script>
    <script type="text/javascript" src="{{ asset('js/konfirmasi_yajra.js')}}"></script>

    @include('home.wr.wakil_rektor4.iku._function.chart_iku1')

@stop
