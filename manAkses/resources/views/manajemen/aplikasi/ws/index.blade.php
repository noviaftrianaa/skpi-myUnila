@extends('template.default.app')
@section('title','Data Web Services')
@extends('__partial.select2')

@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>

    function datatables() {
        var menus = <?php echo json_encode($menus) ?>;

        return $('#table-data').DataTable({
            processing: true,
            serverSide: true,
            ordering: false,
            ajax: window.location.href,
            columns: [
                { data: 'DT_RowIndex', orderable: false, searchable: false, title: 'No.', width: '5px', className: 'text-center' },
                { data: 'nm_group', title: 'Group' },
                { data: 'path_url', title: 'URL' },
                { data: 'nm_method', title: 'Method', className: 'text-center', width: '5px' },
                {
                    data: 'a_active',
                    title: 'Active?',
                    className: 'text-center',
                    width: '5px',
                    render: function(data,type,row) {
                        return data==1 ? `<span class="badge badge-success">Aktif</span>` : `<span class="badge badge-danger">Tidak Aktif</span>`;
                    }
                },
                {
                    data: 'id_ws_endpoint',
                    title: 'Action',
                    className: 'text-center',
                    width: '5px',
                    render: function(data,type,row) {
                        var html = `
                            <div class="btn-group">
                                <button type="button" class="btn btn-link btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fas fa-cog"></i>
                                </button>
                                <div class="dropdown-menu dropdown-menu-right">`;

                        if(menus.a_boleh_update == "1") {
                            html += `
                                <button class="dropdown-item" title="Edit" data-id="${data}" id="btnEdit"><i class="fas fa-edit mr-1"></i>Edit</button>
                            `;
                        }

                        if(menus.a_boleh_delete == "1") {
                            html += `
                                <button class="dropdown-item" title="Delete" data-id="${data}" id="btnDelete"><i class="fas fa-trash-alt mr-2"></i>Delete</button>
                            `;
                        }

                        html += `
                                </div>
                            </div>
                        `;

                        return html;
                    }
                }
            ],
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
        } );
    }

    function clearInput()
    {
        $('#idWsEndpointMdl').val(null);
        $('#nmGroupLamaMdl').val(null).trigger('change');
        $('#nmGroupBaruMdl').val(null);
        $('#nmMethodMdl').val(null).trigger('change');
        $('#pathUrlMdl').val(null);
        $('#activeMdl').val(null).trigger('change');

        return true;
    }

    $(document).ready( function () {
        let table = datatables();

        $('#search').on('change', function () {
            table.search($('#search').val()).draw();
        } );

        $('#btnTambah').on('click', function() {
            clearInput();
            $('#showMdl').modal('show');
        });

        table.on('click', '#btnEdit', function() {
            clearInput();

            let id = $(this).data('id');

            $.ajax({
                url: "{{ route('aplikasi.ws.data', '') }}" + "/" + id,
                type: "GET",
                success: function(res) {
                    $('#idWsEndpointMdl').val(res.id_ws_endpoint);
                    $('#nmGroupLamaMdl').val(res.nm_group).trigger('change');
                    $('#nmMethodMdl').val(res.nm_method).trigger('change');
                    $('#pathUrlMdl').val(res.path_url);
                    $('#activeMdl').val(res.a_active).trigger('change');
                    $('#showMdl').modal('show');
                }
            });
        });

        table.on('click','#btnDelete', function() {
            clearInput();

            let id = $(this).data('id');

            $.ajax({
                url: "{{ route('aplikasi.ws.data', '') }}" + "/" + id,
                type: "GET",
                success: function(res) {
                    $('#formDeleteMdl').attr("action", "{{ route('aplikasi.ws.destroy', '') }}" + "/" + id);
                    $('#textDeleteMdl').text(`${res.nm_group} (${res.nm_method}) [${res.path_url}]`);
                    $('#deleteMdl').modal('show');
                }
            });
        });
    });
</script>
@endpush

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Web Services</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="d-lg-flex d-block">
                <div class="col-2">
                    <a type="button" href="{{ route('aplikasi.detail', Crypt::encrypt($id)) }}" class="btn btn-default col-12" id="btnBack"><i class="fa fa-arrow-left"></i> Kembali</a>
                </div>
                @if($menus->a_boleh_insert == "1")
                <div class="col-2">
                    <button class="btn btn-info col-12" id="btnTambah"><i class="fa fa-plus"></i> Tambah</button>
                </div>
                @endif
                @if($menus->a_boleh_insert == "1")
                <div class="col-2">
                    <a href="{{ route('aplikasi.pj_aplikasi.akses_ws.index', Crypt::encrypt($id)) }}" type="button" class="btn btn-primary col-12" id="btnAksesWS"><i class="fa fa-users"></i> Hak Akses WS</a>
                </div>
                @endif
                <div class="ml-auto px-2">
                    <div class="input-group">
                        <input type="text" id="search" placeholder="Pencarian" class="form-control">
                        <div class="input-group-append">
                            <button class="btn btn-info btn-sm" data-toggle="tooltip" data-placement="top" title="Cari">
                                <i class="fa fa-search search-icon"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-borderless table-hover" id="table-data" style="width: 100% !important">
                    <thead class="bg-info"></thead>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="showMdl" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title" id="titleMdl"></h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('aplikasi.ws.store', [Crypt::encrypt($id)]) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="POST">
                        <input type="hidden" name="id_ws_endpoint" id="idWsEndpointMdl">
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Group</label>
                                    <select id="nmGroupLamaMdl" name="nm_group_lama" class="form-control select2" data-placeholder="Pilih">
                                        <option></option>
                                        @foreach ($group as $value)
                                            <option value="{{ $value->nm_group }}">{{ $value->nm_group }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Or New Group</label>
                                    <input id="nmGroupBaruMdl" name="nm_group_baru" type="text" class="form-control" placeholder="Nama Group Baru">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Method</label>
                                    <select id="nmMethodMdl" name="nm_method" class="form-control select2" data-placeholder="Pilih" required>
                                        <option></option>
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="PATCH">PATCH</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Path URL</label>
                                    <input id="pathUrlMdl" name="path_url" type="text" class="form-control" placeholder="/path/url" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Active ?</label>
                                    <select id="activeMdl" name="a_active" class="form-control select2" data-placeholder="Pilih" required>
                                        <option></option>
                                        <option value="1">Aktif</option>
                                        <option value="0">Tidak Aktif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="submit" class="btn btn-primary">Simpan</button>
                            <button type="button" class="btn btn-danger" data-dismiss="modal">Tutup</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="deleteMdl" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        HAPUS WEB SERVICES
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="formDeleteMdl" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                <p>Apakah yakin ingin menghapus "<strong id="textDeleteMdl"></strong>" ?</p>
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>
                            <button type="submit" class="btn btn-danger">Hapus</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

@endsection
