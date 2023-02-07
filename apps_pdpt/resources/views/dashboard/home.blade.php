@extends('template.default')

@section('content')
    <div class="container">
        <div class="card p-2">
            Welcome, {{ strtoupper(auth()->user()->nm_pengguna) }}.
        </div>
    </div>
@endsection
