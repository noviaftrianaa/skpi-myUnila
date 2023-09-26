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
                <a class="nav-link" href="{{ url('dashboard_iku') }}">IKU 1</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="{{ url('dashboard_iku2v2') }}">IKU 2</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="{{ url('dashboard_iku3v2') }}">IKU 3</a>
            </li>
            <li class="nav-item">
                <a class="nav-link active" href="{{ url('dashboard_iku4v2') }}">IKU 4</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="{{ url('dashboard_iku5v2') }}">IKU 5</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="{{ url('dashboard_iku6v2') }}">IKU 6</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="{{ url('dashboard_iku7v2') }}">IKU 7</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="{{ url('dashboard_iku8v2') }}">IKU 8</a>
            </li>
        </ul>
        <div class="tab-content" id="tabContent">
            <div class="tab-pane fade active show">
                @include('home.wr.wakil_rektor4.iku._partial.comming_soon')
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

    {{-- @include('home.wr.wakil_rektor4.iku._function.chart_iku1') --}}

@stop
