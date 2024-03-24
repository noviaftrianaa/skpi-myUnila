@extends('layouts/layoutMaster')
@include('content.main.mahasiswa.daftar-mahasiswa.function')

@section('title', $judul)

@section('content')

    <h4>
        <span class="text-muted fw-light">Mahasiswa / Daftar Mahasiswa</span>
    </h4>

    <div class="card">
        <div
            class="card-header sticky-element bg-label-light d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4">
            <h5 class="card-title mt-4">{{ $judul }}</h5>
            <div class="float-end">
                <div class="btn-group" role="group">
                    <div id="exportBtn"></div>
                </div>
            </div>
        </div>
        <div class="card-body">
            <div class="table-responsive text-nowrap">
                <table class="table table-striped table-hover table-bordered table-sm" id="table-data"
                    style="width: 100% !important">
                    <thead class="table-primary"></thead>
                </table>
            </div>
            <!-- Offcanvas to filter -->
            <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddUser"
                aria-labelledby="offcanvasAddUserLabel">
                <div class="offcanvas-header">
                    <h5 id="offcanvasAddUserLabel" class="offcanvas-title">Filter</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas"
                        aria-label="Close"></button>
                </div>
                <div class="offcanvas-body mx-0 flex-grow-0 pt-0 h-100">
                    <div class="mb-3">
                        <div class="input-group w-100">
                            <input type="text" id="search" placeholder="Pencarian" class="form-control">
                            <button type="button" id="btnSearch" class="btn btn-primary"><i
                                    class="fas fa-search"></i></button>
                        </div>
                    </div>
                    <div class="my-3 border-bottom"></div>
                    <div class="mt-3">
                        <label class="form-label">Tahun Semester Aktif</label>
                        <select name="tahun" id="tahun" class="form-select">
                            @foreach ($semester_list as $id_smt => $nm_smt)
                                <option value="{{ $id_smt }}" {{ $id_smt == $smt_pilih ? 'selected' : '' }}>
                                    {{ $nm_smt }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
