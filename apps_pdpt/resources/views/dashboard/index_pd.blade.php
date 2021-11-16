@extends('template.default')

@section('content')
    <div class="row">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa fa-dashboard"></i> Dashboard</h3>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            @include('dashboard.log_login')
        </div>
    </div>
@endsection
