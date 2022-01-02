@extends('tendik::components.master')
@section('title', 'Inpassing')

@section('css')
    <style>
        .line {
            border-right: 0.1px solid lightslategray;
        }

    </style>
@stop

@section('content')
    <div class="container-fluid py-4">
        <div class="row my-4">
            <div class="col-lg-12 col-md-12 mb-md-0 mb-4">
                <div class="card">
                    <div class="card-header pb-0">
                        <div class="row">
                            <div class="col-lg-6 col-7">
                                <h6>Form Tambah Inpassing</h6>
                            </div>
                        </div>
                    </div>

                    <div class="card-body pb-2">
                        <form>
                            <div class="row">
                                <div class="col-lg-6 col-md-6">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Pangkat / Golongan</label>
                                                <select class="form-control" id="pangkat_golongan">
                                                    <option>Pilih</option>
                                                    <option>1a / Juru Muda</option>
                                                    <option>3</option>
                                                    <option>4</option>
                                                    <option>5</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Nomor SK Inpassing</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Tanggal SK</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Terhitung Mulai Tanggal</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Angka Kredit</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Masa Kerja (Tahun)</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Masa Kerja (Bulan)</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-6 col-md-6" style="display: show;">
                                    <div class="row">
                                        <div class="col-lg-12 col-md-12 mb-5">
                                            <h6 class="mb-1">Upload Dokumen</h6>
                                            <p class="text-sm mb-0">
                                                <i class="fas fa-info-circle text-info" aria-hidden="true"></i>
                                                <span class="font-italic ms-1">Maksimal total ukuran file dalam sekali
                                                    proses upload 2 MB
                                                </span>
                                            </p>
                                        </div>

                                        <div class="col-lg-12 col-md-12">
                                            <div class="accordion" id="accordionExample">
                                                <div class="accordion-item">
                                                    <h2 class="accordion-header" id="headingOne">
                                                        <button class="accordion-button" type="button"
                                                            data-bs-toggle="collapse" data-bs-target="#collapseOne"
                                                            aria-expanded="true" aria-controls="collapseOne">
                                                            <p class="h5">Dokumen 1</p>
                                                        </button>
                                                    </h2>
                                                    <div id="collapseOne" class="accordion-collapse collapse show"
                                                        aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                        <div class="accordion-body">
                                                            <div class="table-responsive">
                                                                <table class="table align-items-center mb-3">
                                                                    <tbody>
                                                                        <tr class="pb-0">
                                                                            <td>
                                                                                <label>File</label>
                                                                            </td>
                                                                            <td>
                                                                                <div class="form-group">
                                                                                    <input type="email"
                                                                                        class="form-control"
                                                                                        id="exampleFormControlInput1">
                                                                                </div>
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td>
                                                                                <label>Nama Dokumen</label>
                                                                            </td>
                                                                            <td>
                                                                                <div class="form-group">
                                                                                    <div class="form-group">
                                                                                        <input type="email"
                                                                                            class="form-control"
                                                                                            id="exampleFormControlInput1">
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td>
                                                                                <label>Keterangan</label>
                                                                            </td>
                                                                            <td>
                                                                                <div class="form-group">
                                                                                    <div class="form-group">
                                                                                        <input type="email"
                                                                                            class="form-control"
                                                                                            id="exampleFormControlInput1">
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>

                                                                        <tr>
                                                                            <td>
                                                                                <label>Jenis Dokumen</label>
                                                                            </td>
                                                                            <td>
                                                                                <div class="form-group">
                                                                                    <div class="form-group">
                                                                                        <select class="form-control"
                                                                                            id="pangkat_golongan">
                                                                                            <option>Pilih</option>
                                                                                            <option>1a / Juru Muda
                                                                                            </option>
                                                                                            <option>3</option>
                                                                                            <option>4</option>
                                                                                            <option>5</option>
                                                                                        </select>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="accordion-item">
                                                    <h2 class="accordion-header" id="headingTwo">
                                                        <button class="accordion-button collapsed" type="button"
                                                            data-bs-toggle="collapse" data-bs-target="#collapseTwo"
                                                            aria-expanded="false" aria-controls="collapseTwo">
                                                            Dokumen 2
                                                        </button>
                                                    </h2>
                                                    <div id="collapseTwo" class="accordion-collapse collapse"
                                                        aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                                                        <div class="accordion-body">
                                                            <strong>This is the second item's accordion body.</strong>
                                                            It is hidden by default, until the collapse plugin adds the
                                                            appropriate classes that we use to style each element. These
                                                            classes control the overall appearance, as well as the
                                                            showing and hiding via CSS transitions. You can modify any
                                                            of this with custom CSS or overriding our default variables.
                                                            It's also worth noting that just about any HTML can go
                                                            within the <code>.accordion-body</code>, though the
                                                            transition does limit overflow.

                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="accordion-item">
                                                    <h2 class="accordion-header" id="headingThree">
                                                        <button class="accordion-button collapsed" type="button"
                                                            data-bs-toggle="collapse" data-bs-target="#collapseThree"
                                                            aria-expanded="false" aria-controls="collapseThree">
                                                            Accordion Item #3
                                                        </button>
                                                    </h2>
                                                    <div id="collapseThree" class="accordion-collapse collapse"
                                                        aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                                                        <div class="accordion-body">
                                                            <strong>This is the third item's accordion body.</strong> It
                                                            is hidden by default, until the collapse plugin adds the
                                                            appropriate classes that we use to style each element. These
                                                            classes control the overall appearance, as well as the
                                                            showing and hiding via CSS transitions. You can modify any
                                                            of this with custom CSS or overriding our default variables.
                                                            It's also worth noting that just about any HTML can go
                                                            within the <code>.accordion-body</code>, though the
                                                            transition does limit overflow.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('js')
@stop
