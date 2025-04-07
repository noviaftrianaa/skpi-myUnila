@extends('layouts/layoutMaster')
@include('content.pages.infografis.function')

@section('title', 'Infografis')
@section('content')

    <!-- Chart -->
    <div class="row">
        <div class="col-12 mb-4">
            <div class="card">
                <div
                    class="card-header d-flex align-items-md-end align-items-sm-start align-items-center justify-content-md-between justify-content-start flex-md-row flex-column gap-4 border-bottom">
                    <h4 class="card-title mb-0">Filter</h4>
                    <div class="float-end">
                        <div class="btn-group" role="group">
                            <label class="input-group-text ms-2 d-none d-sm-inline-block">Tahun</label>
                            <select class="form-select w-auto" id="selectTahun">
                                @for ($i = get_tahun_keaktifan(); $i >= get_tahun_keaktifan() - 4; $i--)
                                    <option value="{{ $i }}">{{ $i }}</option>
                                @endfor
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="accordion" id="accordionExample">
            <div class="col-12 mb-4">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#accDosen" aria-expanded="true" aria-controls="accDosen">
                            INFOGRAFIS DOSEN
                        </button>
                    </h2>
                    <div id="accDosen" class="accordion-collapse collapse" aria-labelledby="headingOne"
                        data-bs-parent="#accordionExample">
                        <div class="accordion-body border-top pt-4">
                            <div class="row mb-4">
                                <div class="col-sm-12 col-12">
                                    <div id="total_dosen"></div>
                                </div>
                            </div>
                            <div class="row mb-4">
                                <div class="col-sm-6 col-12">
                                    <div id="dosen_jabfung"></div>
                                </div>
                                <div class="col-sm-6 col-12">
                                    <div id="dosen"></div>
                                </div>
                            </div>
                            <div class="row mb-4">
                                <div class="col-sm-6">
                                    <div id="dosen_rasio_jk"></div>
                                </div>
                                <div class="col-sm-6">
                                    <div id="dosen_rasio_pangkat"></div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-sm-6">
                                    <div id="dosen_rasio_pendidikan"></div>
                                </div>
                                <div class="col-sm-6">
                                    <div id="dosen_rasio_ikatan_kerja"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 mb-4">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#accMahasiswa" aria-expanded="true" aria-controls="accMahasiswa">
                            INFOGRAFIS MAHASISWA
                        </button>
                    </h2>
                    <div id="accMahasiswa" class="accordion-collapse collapse" aria-labelledby="headingOne"
                        data-bs-parent="#accordionExample">
                        <div class="accordion-body border-top pt-4">
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
            </div>
            <div class="col-12 mb-4">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#accPubHaki" aria-expanded="true" aria-controls="accPubHaki">
                            INFOGRAFIS PUBLIKASI DAN HAKI
                        </button>
                    </h2>
                    <div id="accPubHaki" class="accordion-collapse collapse" aria-labelledby="headingOne"
                        data-bs-parent="#accordionExample">
                        <div class="accordion-body border-top pt-4">
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
            </div>
            <div class="col-12 mb-4">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                            data-bs-target="#accPenAbdi" aria-expanded="true" aria-controls="accPenAbdi">
                            INFOGRAFIS PENELITIAN DAN PENGABDIAN
                        </button>
                    </h2>
                    <div id="accPenAbdi" class="accordion-collapse collapse" aria-labelledby="headingOne"
                        data-bs-parent="#accordionExample">
                        <div class="accordion-body border-top pt-4">
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
        </div>
    </div>

@endsection
