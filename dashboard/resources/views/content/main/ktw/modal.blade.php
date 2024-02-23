<!-- Detail Raw modal -->
<div class="modal fade" id="detailData" tabindex="-1" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content p-3 p-md-5">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

                <div class="card">
                    <div class="card-header">
                        <div class="card-title text-center">
                            <h3 class="mb-3">Detail Data Kelulusan Tepat Waktu (KTW)</h3>
                            <p class="text-muted" id="title-modal"></p>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover table-bordered table-stripped" id="table-data"
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
                                        <input type="text" id="search" placeholder="Pencarian"
                                            class="form-control">
                                        <button type="button" id="btnSearch" class="btn btn-primary"><i
                                                class="fas fa-search"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- / Detail Raw modal -->
