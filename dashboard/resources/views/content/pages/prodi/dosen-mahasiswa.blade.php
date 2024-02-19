<div class="col-12 mb-4">
    <div class="bs-stepper wizard-numbered mt-2">

        <div class="bs-stepper-header">
            <div class="step" data-target="#dosenHomebase">
                <button type="button" class="step-trigger">
                    <span class="bs-stepper-circle"><i class="ti ti-users-group ti-xs me-1"></i></span>
                    <span class="bs-stepper-label">
                        <span class="bs-stepper-title">Dosen Homebase</span>
                    </span>
                </button>
            </div>
            <div class="step" data-target="#mahasiswa">
                <button type="button" class="step-trigger">
                    <span class="bs-stepper-circle"><i class="ti ti-users ti-xs me-1"></i></span>
                    <span class="bs-stepper-label">
                        <span class="bs-stepper-title">Mahasiswa</span>
                    </span>
                </button>
            </div>
        </div>
        <div class="bs-stepper-content">
            <form onSubmit="return false">
                <!-- Account Details -->
                <div id="dosenHomebase" class="content">
                    <div class="content-header mb-3 d-flex justify-content-between align-items-start">
                        <h5>Dosen Homebase</h5>
                        <div class="float-end">
                            <div class="input-group">
                                <label class="input-group-text">Tahun</label>
                                <select class="form-control text-center" id="periodeDosen">
                                    @foreach ($periode as $idThnAjaran => $item)
                                        <option value="{{ $idThnAjaran }}">{{ $idThnAjaran }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                      <div class="table-responsive my-3">
                        <table class="table table-striped table-hover dosen table-sm" style="width: 100% !important">
                            <thead class="table-primary">
                        </table>
                      </div>
                      <p class="alert alert-secondary">
                        Pembaharuan data terakhir: {{ TglWaktuIndonesia(\DB::table('pdrd.sdm')->select('last_sync')->orderByDesc('last_sync')->pluck('last_sync')[0] ?? now()) }}
                      </p>
                    </div>
                </div>
                <!-- Personal Info -->
                <div id="mahasiswa" class="content">
                    <div class="content-header mb-3">
                        <h5>Mahasiswa</h5>
                    </div>
                    <div class="card-body">
                      <div class="table-responsive my-3">
                        <table class="table table-striped table-hover mahasiswa table-sm"
                            style="width: 100% !important">
                            <thead class="table-primary">
                        </table>
                      </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
