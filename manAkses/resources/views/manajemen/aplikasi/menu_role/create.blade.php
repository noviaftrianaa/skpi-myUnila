@extends('template.default.app')
@section('title','Table Aplikasi '.$data->nm_aplikasi)
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list mr-2"></i> Tambah Menu Role Aplikasi {!! $data->nm_aplikasi !!}</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <form action="{{ route('aplikasi.menu_role.store', [Crypt::encrypt($data->id_aplikasi)]) }}" method="post" enctype="multipart/form-data">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                <input type="hidden" name="_method" value="PUT">

                <div class="row text-md">
                    <div class="col-sm-12">
                        <div class="form-group row">
                            <label class="col-2">Peran</label>
                            <div class="col-10">
                                <select class="form-control select2 col-12" name="id_peran" required>
                                    <option value="" selected disabled>-- Pilih --</option>
                                    @foreach(\App\Models\Peran::whereNull('expired_date')->orderBy('nm_peran')->pluck('nm_peran','id_peran') AS $n=>$r)
                                    <option value="{{ $n }}">{{ $r }}</option>
                                    @endforeach
                                </select>
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-2">
                                Akses <span class="required-label">*</span>
                            </label>
                            <div class="col-10">
                                <table class="table table-borderless">
                                    <tbody>
                                        @foreach(\App\Models\Menu::where('id_aplikasi', $data->id_aplikasi)->where('a_aktif',1)->where('level_menu',1)->orderBy('urutan_menu')->get() AS $n=>$r)
                                        <tr>
                                            <th class="row m-0 p-0">
                                                <div class="col-md-2 col-4">
                                                    <div class="form-group form-group-default">
                                                        <input class="mr-2 menus" type="checkbox" id="{{ $n }}" name="menu[{{$r->id_menu}}]" value="{{$r->id_menu}}">
                                                        <label for="a_boleh_insert"> {{ $r->nm_menu }}</label>
                                                    </div>
                                                </div>
                                                <div class="col-md-10 col-8">
                                                    <div class="form-group form-group-default menu_{{$n}}">
                                                        <input class="mr-2" type="checkbox" id="a_boleh_insert" name="menu[{{$r->id_menu}}][insert]">
                                                        <label for="a_boleh_insert"> Insert</label>&nbsp;&nbsp;
                                                        <input class="mr-2" type="checkbox" id="a_boleh_show" name="menu[{{$r->id_menu}}][show]">
                                                        <label for="a_boleh_show"> Show</label>&nbsp;&nbsp;
                                                        <input class="mr-2" type="checkbox" id="a_boleh_delete" name="menu[{{$r->id_menu}}][delete]">
                                                        <label for="a_boleh_delete"> Delete</label>&nbsp;&nbsp;
                                                        <input class="mr-2" type="checkbox" id="a_boleh_update" name="menu[{{$r->id_menu}}][update]">
                                                        <label for="a_boleh_update"> Update</label>&nbsp;&nbsp;
                                                        <input class="mr-2" type="checkbox" id="a_boleh_sanggah" name="menu[{{$r->id_menu}}][sanggah]">
                                                        <label for="a_boleh_sanggah"> Sanggah</label>
                                                    </div>
                                                </div>
                                            </th>
                                        </tr>
                                        @endforeach
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
@endsection

@push("js")
<script>
    $(document).ready(function () {
        $(".menus").change(function() {
            var id = this.id;
            if($(this).is(':checked')==true) {
                $('.menu_'+id+' :checkbox').prop('checked', true);
            } else {
                $('.menu_'+id+' :checkbox').prop('checked', false);
            }
        });
    });
</script>
@endpush