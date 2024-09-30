<!-- Detail Raw modal -->
<div class="modal fade" id="detailRawIkuModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static"
    data-bs-keyboard="false">
    <div class="modal-dialog modal-fullscreen">
        <div class="modal-content p-3 p-md-5">
            <div class="modal-body">
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onclick="ClearCloseTable()"></button>
                <div class="text-center mb-4">
                    <h3 class="mb-3">Detail Raw Data IKU 6</h3>
                    <p class="text-muted" id="title-modal"></p>
                </div>

                <div class="card px-3">
                    {{-- <div class="tab-content pt-0">
                        <div class="tab-pane fade show active" id="navs-iku5" role="tabpanel"> --}}
                            <div class="text-nowrap pt-0 mb-5">
                                <div class="table-responsive text-nowrap">
                                    <table class="datatables-raw-iku6 table table-bordered" id="table-data"
                                        style="width: 100% !important">
                                        <thead class="table-primary"></thead>
                                    </table>
                                </div>
                            </div>
                        {{-- </div>

                    </div> --}}
                </div>
            </div>
        </div>
    </div>
</div>
<!-- / Detail Raw modal -->
