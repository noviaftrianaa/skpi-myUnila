@extends('layouts/layoutMaster')
@include('content.pages.infografis.function')

@section('title', 'Infografis')

@section('content')
    <!-- Chart -->
    <div class="row">
        <div class="col-12 mb-4">
            <div class="card">
                <div class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 border-bottom">
                    <h4 class="card-title mb-0">Filter</h4>
                    <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text ms-2 d-none d-sm-inline-block">Tahun</label>
                            <select class="form-select w-auto" id="selectTahun">
                                @for ($i=get_tahun_keaktifan(); $i>=(get_tahun_keaktifan()-4); $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 mb-4">
            <div class="card">
                <div class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 border-bottom">
                    <h4 class="card-title mb-0">Infografis Dosen</h4>
                    {{-- <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text ms-2 d-none d-sm-inline-block">Tahun</label>
                            <select class="form-select w-auto" id="selectTahunDosen">
                                @for ($i=get_tahun_keaktifan(); $i>=(get_tahun_keaktifan()-4); $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                    </div> --}}
                </div>
                <div class="card-body my-4">
                    <div class="row">
                        <div class="col-sm-6 col-12">
                            <div id="dosen_jabfung"></div>
                        </div>
                        <div class="col-sm-6 col-12">
                            <div id="dosen"></div>
                        </div>
                        <div class="col-sm-12 col-12">
                            <div id="total_dosen"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 mb-4">
            <div class="card">
                <div class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 border-bottom">
                    <h4 class="card-title mb-0">Infografis Mahasiswa</h4>
                    {{-- <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text ms-2 d-none d-sm-inline-block">Tahun</label>
                            <select class="form-select w-auto" id="selectTahunMahasiswa">
                                @for ($i=get_tahun_keaktifan(); $i>=(get_tahun_keaktifan()-4); $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                    </div> --}}
                </div>
                <div class="card-body my-4">
                    <div class="row">
                        <div class="col-sm-6 col-12">
                            <div id="total_mhs_fakultas"></div>
                        </div>
                        <div class="col-sm-6 col-12">
                            <div id="total_mhs_jenjang"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12 mb-4">
            <div class="card">
                <div class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 border-bottom">
                    <h4 class="card-title mb-0">Infografis Publikasi & HAKI</h4>
                    {{-- <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text ms-2 d-none d-sm-inline-block">Tahun</label>
                            <select class="form-select w-auto" id="selectTahunPubHaki">
                                @for ($i=get_tahun_keaktifan(); $i>=(get_tahun_keaktifan()-4); $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                    </div> --}}
                </div>
                <div class="card-body my-4">
                    <div class="row">
                        <div class="col-sm-6 col-12">
                            <div id="publikasi"></div>
                        </div>
                        <div class="col-sm-6 col-12">
                            <div id="haki"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-12">
            <div class="card">
                <div class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 border-bottom">
                    <h4 class="card-title mb-0">Infografis Penelitian & Pengabdian</h4>
                    {{-- <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text ms-2 d-none d-sm-inline-block">Tahun</label>
                            <select class="form-select w-auto" id="selectTahunLitabmas">
                                @for ($i=get_tahun_keaktifan(); $i>=(get_tahun_keaktifan()-4); $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                    </div> --}}
                </div>
                <div class="card-body my-4">
                    <div class="row">
                        <div class="col-sm-6 col-12">
                            <div id="penelitian"></div>
                        </div>
                        <div class="col-sm-6 col-12">
                            <div id="pengabdian"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

@endsection
