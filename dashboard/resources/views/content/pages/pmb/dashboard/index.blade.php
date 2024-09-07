@extends('layouts/layoutMaster')
@include('content.pages.pmb.dashboard.function')

@section('title', $title)

@section('content')
    <!-- Chart -->
    <div class="row">

        <div class="col-12 mb-4">
            <div class="card">
                <div
                    class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 border-bottom">
                    <h4 class="card-title mb-0">{{ $title }}</h4>
                    <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text">Tahun Ajaran</label>
                            <select class="form-select text-center" id="periodeTahun">
                                @for ($i = $tahun; $i > $tahun - 2; $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="overlay" id="loading">
                        <div class="overlay-content">
                            <div class="d-flex justify-content-center">
                                <p class="mb-0" style="color: #0d6efd">Mohon menunggu, data sedang diproses ... </p>
                                <div class="sk-wave m-0">
                                    <div class="sk-rect sk-wave-rect"></div>
                                    <div class="sk-rect sk-wave-rect"></div>
                                    <div class="sk-rect sk-wave-rect"></div>
                                    <div class="sk-rect sk-wave-rect"></div>
                                    <div class="sk-rect sk-wave-rect"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <div id="chart-status"></div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-body">
                                    <div id="chart-age"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="border-bottom"></div>
                </div>
            </div>
        </div>
    </div>

@endsection
