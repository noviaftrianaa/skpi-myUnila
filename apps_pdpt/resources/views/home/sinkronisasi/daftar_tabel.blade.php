@extends('template.default')

@section('content')
    <div class="row">
        <div class="col-md-12 col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa fa-graduation-cap mr-2"></i> {{ strtoupper(Judul()) }}</h3>
                </div>
                <div class="card-body">
                            <div class="row">
                                <div class="col-8 mb-2">
                                    <button type="button" class="btn btn-primary ml-1" id="BtnSinkron" onclick="Sinkronisasi()">
                                        <i class="fas fa-sync"></i> Sinkonisasi Data</button>
                                    <button type="button" class="btn btn-info ml-1" title="Filter Tabel" id="BtnFilterTable"
                                        onclick="ShowModalFilter(3)"><i class="fas fa-filter"></i>
                                        Filter Tabel</button>
                                </div>
                                <div class="ml-auto px-2 mb-2">
                                    <div class="input-group">
                                        <input type="text" id="search" placeholder="Pencarian" class="form-control">
                                        <div class="input-group-append">
                                            <button class="btn btn-primary btn-sm" data-toggle="tooltip" data-placement="top"
                                                title="Cari">
                                                <i class="fa fa-search search-icon"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    <div class="table-responsive">
                        <table class="table table-stripped table-hover" id="table-data" style="width:100% !important">
                            <thead class="bg-white"></thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="ModalFilter" data-backdrop="static" data-keyboard="false" tabindex="-1"
    aria-labelledby="ModalFilterLabel" aria-hidden="true">
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header bg-info">
                <h5 class="modal-title text-bold" id="ModalFilterLabel">Filter Tabel</h5>
            </div>
            <div class="modal-body">
                <form id="FormModalFilter">
                    @csrf
                    <div class="form-group row">
                        <label class="col-sm-4 col-form-label text-right">Skema Tabel<i
                                class="text-danger">*</i></label>
                        <div class="col-sm-7">
                            <select name="skema_tabel" id="skema_tabel" class="form-control">
                                <option value="">Pilih Skema Tabel</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <div class="float-right">
                    <button type="button" class="btn btn-default noborder" data-dismiss="modal">Batalkan
                        <i class="fas fa-times-circle"></i></button>
                    <button type="button" class="btn btn-primary ml-2 noborder" onclick="FilterTabel()"
                        id="ModalBtnModalFilterTabel">Filter <i class="fas fa-sign-out-alt"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
<style>
    .modal.modal-fullscreen .modal-dialog {
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        max-width: none;
    }

    .modal.modal-fullscreen .modal-content {
        height: auto;
        height: 100vh;
        border-radius: 0;
        border: none;
    }

    .modal.modal-fullscreen .modal-body {
        overflow-y: auto;
    }
</style>
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>
    function RefreshTable() {
        $('#table-data').DataTable().ajax.reload();
    }

    $(document).ready(function() {
        ShowTable();
    });

    function ShowModalFilter() {
        $('#ModalFilter').modal('toggle');
    }

    function ShowTable() {
        var public_url = {!! json_encode(url('/')) !!};
        let table = $('#table-data').DataTable({
            processing: true,
            serverSide: true,
            responsive: true,
            searching: true,
            paging: true,
            info: true,
            ordering: false,
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>',
            ajax: {
                url: '{!! route('sinkronisasi.data_tabel') !!}',
                type: 'GET',
                data: {
                    '_token': '{!! csrf_token() !!}',
                    'skema_tbl': '{!! request()->get('skema_tbl') !!}'
                },
            },
            columns: [{
                    data: 'id_table_app',
                    name: 'id_table_app',
                    title: '<input type="checkbox" class="CheckboxAll" id="CheckboxAll" onclick="Checkbox();" />',
                    width: '5px',
                    render: function(data, type, row) {
                        return `<input type="checkbox" class="CheckboxItem" id="CheckboxItem" value="${data}" />`;
                    }
                },
                {
                    data: 'id_table_app',
                    name: 'id_table_app',
                    title: 'No',
                    width: '5%',
                    render: function(data, type, row, meta) {
                        return meta.row + meta.settings._iDisplayStart + 1;
                    }
                },
                {
                    data: 'skema_tbl',
                    name: 'skema_tbl',
                    title: 'Skema Tabel',
                    width: '10%'
                },
                {
                    data: 'nm_tbl',
                    name: 'nm_tbl',
                    title: 'Nama Tabel',
                    width: '20%'
                },
                {
                    data: 'tabel_alias',
                    name: 'tabel_alias',
                    title: 'Tabel Alias',
                    width: '20%'
                },
                {
                    data: 'kode_primary',
                    name: 'kode_primary',
                    title: 'Kode Primary',
                    width: '20%'
                },
                {
                    data: 'tgl_create',
                    name: 'tgl_create',
                    title: 'Tanggal Sinkron',
                    width: '20%'
                },
                {
                    data: 'id_table_app',
                    name: 'id_table_app',
                    title: 'Aksi',
                    width: '20%',
                    render: function(data, type, row, meta) {
                        return `
                            <a type="button" class="btn btn-primary btn-sm py-0 mb-1 mr-1" href="#">
                                <i class="fas fa-info"></i> riwayat
                            </a>
                        `;
                    }
                }
            ],
        });
        $('#search').on('change', function() {
            table.search($('#search').val()).draw();
        });
    }

    function Checkbox() {
        if ($('#CheckboxAll').is(':checked')) {
            $('.CheckboxItem').prop('checked', true);
        } else {
            $('.CheckboxItem').prop('checked', false);
        }
    }

    LoadSkemaTabel(function(Callback) {
    Callback.data.forEach(function(item, index) {
        $('#skema_tabel').append($('<option>', {
            value: item.skema_tbl,
            text: item.skema_tbl
            }));
        });
    });

    function LoadSkemaTabel(Callback, IsTable = 0) {
        $.ajax({
                type: 'GET',
                url: '{!! route('sinkronisasi.skema_tabel') !!}',
                data: {
                    '_token': '{!! csrf_token() !!}',
                    'IsTable': 0
                },
                dataType: 'json'
            })
            .done(function (res) {
                Callback(res);
            })
            .fail(function (res) {
                Callback(res);
            });
    }

    function FilterTabel(){

    }
    function Sinkronisasi(Idd = null) {
        let checkbox = $('.CheckboxItem:checked'),
            type = 'POST',
            url = '{!! route('sinkronisasi.sinkron') !!}',
            btn = $('#BtnSinkron'),
            id = [];

        btn.prop("disabled", true);

        if (Idd != null) {
            id.push(Idd);
        } else {
            checkbox.each(function () {
                id.push($(this).val());
            });
        }

        let data = {
            '_token': '{!! csrf_token() !!}',
            'id_table_app': id
        };

        if (id.length > 0) {
            SweetAlertSinkronisasi(btn, type, url, data, function (callback) {
                if (callback) {
                    RefreshTable();
                }
            });
        } else {
            SweetAlertEmpty(btn);
        }
    }
</script>
@endpush
