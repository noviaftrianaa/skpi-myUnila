<!-- Detail Raw modal -->
<div class="modal fade" id="detailRawIkuModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static"
    data-bs-keyboard="false">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content p-3 p-md-5">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onclick="ClearCloseTable()"></button>
                <div class="text-center mb-4">
                    <h3 class="mb-3">Detail Raw Data IKU 3</h3>
                    <p class="text-muted" id="title-modal"></p>
                </div>

                <div class="card px-3">
                    {{-- <div class="tab-content pt-0">
                        <div class="tab-pane fade show active" id="navs-iku3" role="tabpanel"> --}}
                            <div class="text-nowrap pt-0 mb-5">
                                <div class="table-responsive text-nowrap">
                                    <table class="datatables-raw-iku3 table table-bordered" id="table-data"
                                        style="width: 100% !important">
                                        <thead class="table-primary"></thead>
                                    </table>
                                </div>
                                {{-- <table class="datatables-raw-iku3 table table-bordered">
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
                                            <th>Nama Dosen</th>
                                            <th>NIDN</th>
                                            <th hidden>Fakultas</th>
                                            <th hidden>Prodi</th>
                                            <th hidden>Jenjang</th>
                                            <th>Total Tridharma Litabmas</th>
                                            <th>Total Tridharma Mengajar</th>
                                            <th>Total Tridharma Pembimbing</th>
                                            <th>Total Tridharma Menguji</th>
                                            <th>Total Praktisi</th>
                                            <th>Total Membimbing Prestasi</th>
                                        </tr>
                                    </thead>
                                </table> --}}
                            </div>
                        {{-- </div>

                    </div> --}}
                </div>
            </div>
        </div>
    </div>
</div>
<!-- / Detail Raw modal -->
