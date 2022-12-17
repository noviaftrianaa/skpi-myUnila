@extends('template.default.app')
@section('title','WS Access Permission | '.$pj->aplikasi->nm_aplikasi)

@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap.css')}}" rel="stylesheet">
<link href="{{asset('bower_components/datatables/RowGroup/css/rowGroup.dataTables.min.css')}}" rel="stylesheet">
@endpush

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list mr-2"></i> WS Access Permission | {!! $pj->aplikasi->nm_aplikasi !!}</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <form action="{{ route('aplikasi.pj_aplikasi.akses_ws.store', Crypt::encrypt($id)) }}" method="post" enctype="multipart/form-data">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                <input type="hidden" name="_method" value="PUT">

                <div class="row text-md">
                    <div class="col-sm-12">
                        <div class="form-group row">
                            <label class="col-2">Pengguna</label>
                            <div class="col-10">
                                <input class="form-control-plaintext" value="{{ $pj->user->nm_pengguna }}" readonly>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-2">Aplikasi</label>
                            <div class="col-10">
                                <input class="form-control-plaintext" value="{{ $pj->aplikasi->nm_aplikasi }}" readonly>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-2">
                                Akses WS<span class="required-label">*</span>
                            </label>
                            <div class="col-10">
                                <a class="btn btn-info" id="addAkses" href="#"><i class="fas fa-plus"></i> Tambah Akses</a>
                                <table class="table table-bordered table-hover text-xs" id="table-data" style="width: 100% !important;">
                                    <thead>
                                        <tr>
                                            <th>Endpoint</th>
                                            <th>Request Body</th>
                                            <th>Terms</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody id="datas">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <a type="button" class="btn btn-link" href="#">Kembali</a>
                    <button type="submit" class="btn btn-primary">Simpan</button>
                </div>
            </form>
        </div>
    </div>

    <div class="modal fade" id="addItem" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah</span> 
                        <span class="fw-light">
                            Akses
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="form-group form-group-default">
                                <label>Endpoint</label>
                                <select id="endpoint" class="form-control select2">
                                    @foreach($data AS $no=>$r)
                                    <option value="{{ $r->id_ws_endpoint }}">{{ strtoupper($r->nm_group) }} <span class="text-muted">{{ '{ '.$r->path_url.' - '.$r->nm_method.' }' }}</span></option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <div class="form-group form-group-default">
                                <label>Request Body</label>
                                <select id="req_body" class="form-control select2">
                                </select>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <div class="form-group form-group-default">
                                <label>Terms</label>
                                <select id="terms" class="form-control select2">
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer no-bd">
                        <a class="btn btn-primary" id="addAksesSession" href="#">Tambah</a>
                        <button type="button" class="btn btn-danger" data-dismiss="modal">Tutup</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push("js")
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>
    $(document).ready(function () {
        let t = $('#table-data').DataTable({
            processing: true,
            pagingType: "simple",
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
        } );
        
        var counter = 1;
    
        $('#addAkses').on('click', function () {
            $('#endpoint').val('').trigger('change');
            $('#req_body').val('').trigger('change');
            $('#terms').val('').trigger('change');
            $('#addItem').modal('show');
        });

        $('#endpoint').on('change', function() {
            var id = $(this).val();
            if(id!=null) {
                $.ajax({
                    url: '/aplikasi/pj_aplikasi/akses_ws/'+id+'/req',
                    type: 'GET',
                    success: function(response) {
                        $("#req_body").html('').select2({data: response});
                    }
                });
            }
        });

        $('#req_body').on('change', function() {
            var id = $(this).val();
            if(id!=null) {
                $.ajax({
                    url: '/aplikasi/pj_aplikasi/akses_ws/'+id+'/terms',
                    type: 'GET',
                    success: function(response) {
                        $("#terms").html('').select2({data: response});
                    }
                });
            }
        });

        $('#addAksesSession').on('click', function() {
            t.row.add([$('#endpoint option:selected').text(), $('#req_body option:selected').text(), $('#terms option:selected').text(), '<a class="btn btn-danger btn-xs" href="#"><i class="fas fa-trash-alt"></i></a>']).draw(true);
            counter++;
            $('#addItem').modal('hide');
        });
    });
</script>
@endpush