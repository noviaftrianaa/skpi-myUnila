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
                <input type="hidden" name="id_pengguna" value="{{ $pj->id_pengguna }}">
                <input type="hidden" name="id_aplikasi" value="{{ $pj->aplikasi->id_aplikasi }}">

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
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-12">
                        <table class="table table-bordered table-hover text-xs" id="table-data" style="width: 100% !important;">
                            <thead>
                                <tr>
                                    <th>Endpoint</th>
                                    <th>Request Body & Terms</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody id="datas">
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="modal-footer">
                    <a type="button" class="btn btn-default" href="#" onclick="history.back()"><i class="fa fa-arrow-left"></i> Kembali</a>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                </div>
            </form>
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

        $('#addAkses').on('click', function() {

            t.row.add(
                [
                    cEndpoint(counter),
                    null,
                    cAction(counter)
                ] 
            ).draw(true);
            
            $(".endpoint").select2();
            $('.endpoint').on('change', function() {
                var id = $(this).data('id');
                var value = $(this).val();
                var row = $(this).closest('tr');
                var cell = t.cell(row, 1);
                if(value!=null) {
                    $.ajax({
                        url: '/aplikasi/pj_aplikasi/akses_ws/'+value+'/body',
                        type: 'GET',
                        success: function(response) {
                            cell.data(cBody(id, response));
                        }
                    });
                }
            });

            counter++;
        });
    });

    function cEndpoint(counter)
    {
        var data = <?php echo json_encode($data) ?>;
        var html = '';
        html += '<select class="form-control select2bs4 endpoint" data-id="'+counter+'" name="ws['+counter+'][id]" required>';
        if(data.length>0) {
            $.each(data, function(index, item) {
                html += '<option value="'+item.id_ws_endpoint+'">['+item.nm_method+'] ['+item.nm_group+'] [<span class="text-muted">'+item.path_url+'</span>]</option>';
            })
        };
        html += '</select>';

        return html;
    }

    function cBody(id, data)
    {
        var html = '';
        html += '<table class="table table-borderless">';
        html += '<thead><tr><th></th><th>Endpoint Body</th><th>Operator</th><th>Terms</th></tr></thead>'
        html += '<tbody>';
        $.each(data, function(index, item) {
            html += '<tr>';
            html += '<td><input class=".checkItem" type="checkbox" name="ws['+id+'][body]['+item.id_ws_endpoint_body+']"></td>';
            html += '<td>'+item.nm_req+' ['+item.type_data+']</td>';
            html += '<td><select class="form-control input-sm" name="ws['+id+'][body]['+item.id_ws_endpoint_body+'][]"><option value="equals">equals [==]</option><option value="does_not_equal">does_not_equal [!=]</option><option value="contains">contains [str_contains]</option><option value="does_not_contain">does_not_contain [!str_contains]</option><option value="greater_than">greater_than [>]</option><option value="less_than">less_than [<]</option><option value="greater_than_or_equal_to">greater_than_or_equal_to [>=]</option><option value="less_than_or_equal_to">less_than_or_equal_to [<=]</option><option value="is_in">is_in [in_array]</option><option value="is_not_in">is_not_in [!in_array]</option></select></td>';
            html += '<td><input type="text" class="form-control input-sm" name="ws['+id+'][body]['+item.id_ws_endpoint_body+'][]"></td>';
        })
        html += '</tbody>';
        html += '</table>';
        return html;
    }

    function cAction(counter)
    {
        var html = '';
        html += '<a href="#" class="btn btn-danger btnDelete" data-id="'+counter+'"><i class="fas fa-trash-alt"></i> Delete</a>';
        return html;
    }
</script>
@endpush