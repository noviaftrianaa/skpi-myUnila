<div class="row">
    <div class="col">
        <div class="card card-info">
            <div class="card-header">
                <div class="input-group">
                    <span class="mr-2 p-2"> <strong>Tahun IKU</strong></span>
                     <select id="thn_iku" class="form-control mr-2">
                         @foreach ($thn_iku as $th)
                             <option {{ $th->a_periode_aktif == 1 ? 'selected' : '' }}
                                 value="{{ $th->id_thn_ajaran }}">{{ $th->id_thn_ajaran }}</option>
                         @endforeach
                     </select>
                     <div class="input-group-append">
                         <button class="btn btn-sm py-0 bg-white mr-2" onclick="Iku3Data(0)"><i class="fas fa-filter"></i> Filter</button>
                         <button class="btn btn-sm py-0 bg-white mr-2" onclick="DownloadIku3(1)"><i class="fas fa-download"></i> Excel</button>
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
                                <h3 id="x_total_data_yes">0</h3><h3> / </h3><h3 id="x_total_data1">0</h3>
                                <hr><span> Pembentuk </span>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="small-box bg-silver border shadow mb-4 bg-white rounded">
                            <div class="inner px-5">
                                <h3 id="x_total_data2">0</h3>
                                <hr><span> Total Dosen </span>
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
                    <div class="card border shadow p-3 mb-4">
                        <div id="Iku3ChartBar"></div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="rumusIku1Modal" tabindex="-1" role="dialog" aria-labelledby="rumusIku1ModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header">
        <h5 class="modal-title" id="rumusIku1ModalLabel">Formula IKU 3</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </div>
        <div class="modal-body">
            <img src="{{ asset('images/rumus-iku-3.png') }}" class="img-fluid">
        </div>
    </div>
    </div>
</div>

<div class="modal fade modal-fullscreen" id="exampleModal" tabindex="-1" role="dialog"
    aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
            <div class="modal-header pb-0">
                <div class="float-left">
                    <p>
                        <span id="txt1_modal"></span>
                        <span id="txt2_modal"></span>
                        <span id="txt3_modal"></span>
                        <span id="txt4_modal"></span>
                    </p>
                </div>
                <div class="float-right mt-3">
                    <button id="btn_modal_back" class="btn btn-primary mr-1"><i class="fas fa-arrow-left"></i></button>
                    <button id="btn_modal_close" class="btn btn-danger" data-dismiss="modal" aria-label="Close"><i
                            class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="modal-body">
                <div id="x_tb_01">
                    <table id="tb_01" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
                <div id="x_tb_02">
                    <table id="tb_02" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
                <div id="x_tb_03">
                    <table id="tb_03" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
                <div id="x_tb_04">
                    <table id="tb_04" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
                <div id="x_tb_05">
                    <table id="tb_05" class="table table-bordered table-striped">
                        <thead class="bg-info text-center"></thead>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
