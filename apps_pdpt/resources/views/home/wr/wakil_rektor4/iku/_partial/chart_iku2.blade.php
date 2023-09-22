<div class="row">
    <div class="col">
        <div class="card card-info">
            <div class="card-header">
                <div class="input-group">
                    <span class="mr-2 p-2"> <strong>Tahun IKU 2</strong></span>
                     <select id="thn_iku" class="form-control mr-2">
                         @foreach ($thn_iku as $th)
                             <option {{ $th->a_periode_aktif == 1 ? 'selected' : '' }}
                                 value="{{ $th->id_thn_ajaran }}">{{ $th->id_thn_ajaran }}</option>
                         @endforeach
                     </select>
                     <div class="input-group-append">
                         <button class="btn btn-sm py-0 bg-white mr-2" onclick="Iku1Data(0)"><i class="fas fa-filter"></i> Filter</button>
                         <button class="btn btn-sm py-0 bg-white mr-2" onclick="DownloadIku1(1)"><i class="fas fa-download"></i> Excel</button>
                         {{-- <a href="{!! route('downloadIku1') !!}?thn_iku=2023" class="btn btn-sm py-2 bg-white mr-2">
                            <i class="fas fa-download"></i> Excel
                        </a> --}}
                         <button class="btn btn-sm py-0 bg-white" data-toggle="modal" data-target="#rumusIku1Modal"><i class="fas fa-info-circle"></i> Info</button>
                        </div>
                 </div>
            </div>
            <div class="card-body">
                <div class="row mb-3">
                    <div class="col">
                        <div class="isLoading overlay mt-3" style="display: none;"><i
                                class="fas fa-3x fa-sync-alt fa-spin"></i>
                        </div>
                    </div>
                </div>
                <div class="row col-12 d-flex justify-content-around mb-2">
                    <div class="col">
                        <div class="small-box bg-silver border shadow mb-4 bg-white rounded">
                            <div class="inner px-5">
                                <h3 id="x_total_data_yes">0</h3><h3> / </h3><h3 id="x_total_data">0</h3>
                                <hr><span> Pembentuk iku 2</span>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="small-box bg-silver border shadow mb-4 bg-white rounded">
                            <div class="inner px-5">
                                <h3 id="x_total_data_alumni">0</h3>
                                <hr><span> Total Lulusan </span>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="small-box bg-silver border shadow mb-4 bg-white rounded">
                            <div class="inner px-5">
                                <h3 id="h_total_data_capaian">0</h3>
                                <hr><span> Pencapaian </span>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="small-box bg-silver border shadow mb-4 bg-white rounded">
                            <div class="inner px-5">
                                <h3 id="h_total_data_gold">0</h3>
                                <hr><span> Delta Gold Standar </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-around">
                    <div class="col-12">
                        <div class="card border shadow p-2 mb-3">
                            <div class="text-center">
                                <span id="navChart"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12">

                </div>
                </div>
            </div>
        </div>
    </div>
</div>
