@extends('template.default.app')
@section('title', 'Dashboard')

@section('content')
    <div class="row">
        <div class="col-lg-3 col-6">
            <!-- small card -->
            <div class="small-box bg-warning">
                <div class="inner">
                    <h3>{{ $apps }}</h3>
                    <p>Application</p>
                </div>
                <div class="icon">
                    <i class="fab fa-app-store"></i>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-6">
            <!-- small card -->
            <div class="small-box bg-warning">
                <div class="inner">
                    <h3>{{ $data }}</h3>
                    <p>User Registrations</p>
                </div>
                <div class="icon">
                    <i class="fas fa-user-plus"></i>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-6">
            <!-- small card -->
            <div class="small-box bg-warning">
                <div class="inner">
                    <h3>{{ $role }}</h3>
                    <p>Roles</p>
                </div>
                <div class="icon">
                    <i class="fab fa-critical-role"></i>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-6">
            <!-- small card -->
            <div class="small-box bg-warning">
                <div class="inner">
                    <h3>{{ $unit }}</h3>
                    <p>Units</p>
                </div>
                <div class="icon">
                    <i class="fas fa-sitemap"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="row mt-3">
        <div class="col-md-12">
            SQL Server Version is <strong>
                Microsoft SQL Server 2019 (RTM) - 15.0.2000.5 (X64)
            </strong>
        </div>
    </div>

@endsection
