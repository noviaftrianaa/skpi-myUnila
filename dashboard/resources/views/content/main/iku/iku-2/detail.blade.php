<!-- Detail Raw modal -->
<div class="modal fade" id="detailRawIkuModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static"
    data-bs-keyboard="false">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content p-3 p-md-5">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onclick="ClearCloseTable()"></button>
                <div class="text-center mb-5">
                    <h3 class="mb-3">Detail Raw Data IKU 2</h3>
                    <h5 class="text-muted" id="tahun-modal"></h5>
                    <p class="text-muted" id="title-modal"></p>
                </div>

                <ul class="nav nav-pills flex-column flex-md-row mb-4 mt-4">
                    <li class="nav-item">
                        <button class="nav-link active" role="tab" id="tab-mbkm" data-bs-toggle="tab"
                            data-bs-target="#navs-mbkm" aria-controls="navs-mbkm" aria-selected="true">
                            <i class="ti ti-category ti-xs me-1"></i>MBKM Agregat</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" role="tab" id="tab-mbkm-detail" data-bs-toggle="tab"
                            data-bs-target="#navs-mbkm-detail" aria-controls="navs-mbkm-detail" aria-selected="true">
                            <i class="ti ti-category ti-xs me-1"></i>MBKM Detail</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" role="tab" id="tab-prestasi" data-bs-toggle="tab"
                            data-bs-target="#navs-prestasi" aria-controls="navs-prestasi" aria-selected="true">
                            <i class="ti ti-category ti-xs me-1"></i>Prestasi</button>
                    </li>
                </ul>

                <div class="card px-3">
                    <div class="tab-content pt-0">
                        <div class="tab-pane fade show active" id="navs-mbkm" role="tabpanel">
                            <div class="text-nowrap pt-0 mb-5">
                                <table class="datatables-raw-mbkm table table-bordered">
                                    <div class="overlay" id="loading_raw_table">
                                        <div class="overlay-content">
                                            <div class="d-flex justify-content-center">
                                                <p class="mb-0" style="color: #5599FE">Harap tunggu... </p>
                                                <div class="sk-wave m-0">
                                                    <div class="sk-rect sk-wave-rect primary"></div>
                                                    <div class="sk-rect sk-wave-rect"></div>
                                                    <div class="sk-rect sk-wave-rect"></div>
                                                    <div class="sk-rect sk-wave-rect"></div>
                                                    <div class="sk-rect sk-wave-rect"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <thead style="background-color:#ECF3FF">
                                        <tr>
                                            <th hidden>ID</th>
                                            <th width="40">Nama Alumni</th>
                                            <th width="15">NPM</th>
                                            <th hidden>Fakultas</th>
                                            <th hidden>Prodi</th>
                                            <th hidden>Jenjang</th>
                                            <th width="25">Total SKS Konversi</th>
                                            <th width="20">Point</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>

                        <div class="tab-pane fade" id="navs-mbkm-detail" role="tabpanel">
                            <div class="text-nowrap pt-0 mb-5">
                                <table class="datatables-raw-mbkm_detail table table-bordered">
                                    <thead style="background-color:#ECF3FF">
                                        <tr>
                                            <th hidden>ID</th>
                                            <th>Nama Alumni</th>
                                            <th>NPM</th>
                                            <th hidden>Fakultas</th>
                                            <th hidden>Prodi</th>
                                            <th hidden>Jenjang</th>
                                            <th>Semester</th>
                                            <th>Kategori MBKM</th>
                                            <th>Nama Program</th>
                                            <th>SKS MBKM</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>

                        <div class="tab-pane fade" id="navs-prestasi" role="tabpanel">
                            <div class="text-nowrap pt-0 mb-5">
                                <table class="datatables-raw-prestasi table table-bordered">
                                    <thead style="background-color:#ECF3FF">
                                        <tr>
                                            <th hidden>ID</th>
                                            <th>Nama Alumni</th>
                                            <th>NPM</th>
                                            <th hidden>Fakultas</th>
                                            <th hidden>Prodi</th>
                                            <th hidden>Jenjang</th>
                                            <th>Tahun Prestasi</th>
                                            <th>Nama Prestasi</th>
                                            <th>Tingkat Prestasi</th>
                                            <th>Peringkat</th>
                                            <th>Point</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- / Detail Raw modal -->
