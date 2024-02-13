<!-- Detail Raw modal -->
<div class="modal fade" id="detailRawIkuModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static"
    data-bs-keyboard="false">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content p-3 p-md-5">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                <div class="text-center mb-4">
                    <h3 class="mb-3">Detail Raw Data IKU 1</h3>
                    <p class="text-muted" id="title-modal"></p>
                </div>

                <ul class="nav nav-pills flex-column flex-md-row mb-4 mt-4">
                    <li class="nav-item">
                        <button class="nav-link active" role="tab" id="tab-bekber" data-bs-toggle="tab"
                            data-bs-target="#navs-bekber" aria-controls="navs-bekber" aria-selected="true">
                            <i class="ti ti-category ti-xs me-1"></i>Bekerja/Berwirausaha</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" role="tab" id="tab-lnjt-studi" data-bs-toggle="tab"
                            data-bs-target="#navs-lnjt-studi" aria-controls="navs-lnjt-studi" aria-selected="true">
                            <i class="ti ti-category ti-xs me-1"></i>Melanjutkan Studi</button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" role="tab" id="tab-tdk-bekber" data-bs-toggle="tab"
                            data-bs-target="#navs-tdk-bekber" aria-controls="navs-tdk-bekber" aria-selected="true">
                            <i class="ti ti-category ti-xs me-1"></i>Tidak Bekerja</button>
                    </li>
                </ul>

                <div class="card px-3">
                    <div class="tab-content pt-0">
                        <div class="tab-pane fade show active" id="navs-bekber" role="tabpanel">
                            <div class="text-nowrap pt-0 mb-5">
                                <table class="datatables-raw-bekber table table-bordered">
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
                                            <th>Nama Alumni</th>
                                            <th>NPM</th>
                                            <th hidden>Fakultas</th>
                                            <th hidden>Prodi</th>
                                            <th hidden>Jenjang</th>
                                            <th>Tgl Lulus/Kompre</th>
                                            <th>Status Lulusan</th>
                                            <th>Kerja Sebelum Lulus?</th>
                                            <th>Bulan Mendapatkan Pekerjaan</th>
                                            <th>Tempat Bekerja</th>
                                            <th>Wilayah Bekerja</th>
                                            <th>1.2 UMP</th>
                                            <th>Pendapatan /Bulan</th>
                                            <th>Point</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>

                        <div class="tab-pane fade" id="navs-lnjt-studi" role="tabpanel">
                            <div class="text-nowrap pt-0 mb-5">
                                <table class="datatables-raw-lnjt-studi table table-bordered">
                                    <thead style="background-color:#ECF3FF">
                                        <tr>
                                            <th hidden>ID</th>
                                            <th>Nama Alumni</th>
                                            <th>NPM</th>
                                            <th hidden>Fakultas</th>
                                            <th hidden>Prodi</th>
                                            <th hidden>Jenjang</th>
                                            <th>Tgl Lulus/Kompre</th>
                                            <th>Status Lulusan</th>
                                            <th>Wilayah Studi</th>
                                            <th>Nama Perguruan Tinggi</th>
                                            <th>Prodi Lanjut Studi</th>
                                            <th>Waktu Masuk Studi</th>
                                            <th>Jarak Lulus - Masuk Studi</th>
                                            <th>Point</th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="navs-tdk-bekber" role="tabpanel">
                            <div class="text-nowrap pt-0 mb-5">
                                <table class="datatables-raw-tdk_bekerja table table-bordered">
                                    <thead style="background-color:#ECF3FF">
                                        <tr>
                                            <th hidden>ID</th>
                                            <th>Nama Alumni</th>
                                            <th>NPM</th>
                                            <th hidden>Fakultas</th>
                                            <th hidden>Prodi</th>
                                            <th hidden>Jenjang</th>
                                            <th>Tgl Lulus/Kompre</th>
                                            <th>Status Lulusan</th>
                                            <th>Keterangan Tidak Bekerja/Berwirausaha</th>
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
