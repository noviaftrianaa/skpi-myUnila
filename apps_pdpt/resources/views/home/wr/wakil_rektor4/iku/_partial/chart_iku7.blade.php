<style type="text/css">

    body {
        font-family: "Roboto", sans-seriff;
        color: #949393;
        margin: 0;
    }
    a, button {
    transition: 0.3s all ease-out;
    }
    a {
        color: #111;
        text-decoration: none;
    }
    a:hover {
        color: #0043ee;
    }
    .row {
        display: flex;
    }
    .container {
        width: 530px;
        margin: 170px auto;
    }
    #body-wrap .col-8 {
        width: 70%;
    }
    #body-wrap .col-4 {
        width: 30%;
        height: 950px;
        overflow: hidden;
    }
    header#header {
        margin-bottom: 70px;
    }
    .main-content {
        color: #fff;
    }
    .main-content h1 {
        font-size: 3em;
        font-weight: 700;
        color: #007BFF;
        margin-bottom: 0;
    }
    #countdown-clock {
        font-size: 30px;
        display: flex;
        flex-wrap: wrap;
        margin: 50px 0;
    }
    #countdown-clock .time{
        background-color: #f5f5f5;
        color: #007BFF;
        border-radius: 10px;
        padding: 20px;
        margin-right: 10px;
        margin-bottom: 10px;
        text-align: center;
    }
    #countdown-clock .time > span{
        font-weight: 700;
    }
    #countdown-clock .time small{
        padding-top: 5px;
        font-size: 12px;
        text-transform: uppercase;
        display: block;
    }
    .main-content p {
        font-size: 1.2em;
        color: #666;
        width: 70%;
    }

    @media (max-width: 999px) {
        .container {
            padding-left: 70px;
        }
        #body-wrap .col-4 {
            width: 40%;
            margin-left: -48px;
            z-index: -1;
        }
     }

    @media (max-width: 599px) {
        #body-wrap .col-8 {
            width: 100%;
        }
        .container {
            width: 100%;
        }
        #body-wrap .page-title {
            width: 98%;
        }
        #body-wrap .col-4 {
            width: 100%;
            margin-left: -438px;
            opacity: 0.1;
        }
     }

    @media (max-width: 540px) {
        .container {
            padding-right: 30px;
            padding-left: 30px;
        }
        .main-content h1 {
            font-size: 2.4em;
        }
        #form .form-group {
            flex-wrap: wrap;
        }
        .form-group input.form-control {
            width: 100%;
            margin-bottom: 10px;
            background: #e4edf7;
        }
        .form-group button.submit-button {
            width: 100%;
        }
        #body-wrap .col-4 {
            margin-left: -108px;
        }
     }

    </style>


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
                         <button class="btn btn-sm py-0 bg-white mr-2" onclick="Iku7Data(0)"><i class="fas fa-filter"></i> Filter</button>
                         <button class="btn btn-sm py-0 bg-white mr-2" onclick="DownloadIku7(1)"><i class="fas fa-download"></i> Excel</button>
                         {{-- <a href="{!! route('downloadIku1') !!}?thn_iku=2023" class="btn btn-sm py-2 bg-white mr-2">
                            <i class="fas fa-download"></i> Excel
                        </a> --}}
                         <button class="btn btn-sm py-0 bg-white" data-toggle="modal" data-target="#rumusIku7Modal"><i class="fas fa-info-circle"></i> Info</button>
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
                                <hr><span> Total Mata Kuliah </span>
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
                        <div id="Iku7ChartBar"></div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="rumusIku7Modal" tabindex="-1" role="dialog" aria-labelledby="rumusIku7ModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
    <div class="modal-content">
        <div class="modal-header">
        <h5 class="modal-title" id="rumusIku7ModalLabel">Formula IKU 7</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </div>
        <div class="modal-body">
            <img src="{{ asset('images/rumus-iku-7.png') }}" class="img-fluid">
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
