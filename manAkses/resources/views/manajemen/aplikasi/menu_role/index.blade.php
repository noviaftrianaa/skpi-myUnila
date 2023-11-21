@extends('template.default.app')
@section('title','Menu Role Aplikasi '.$data->nm_aplikasi)
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list mr-2"></i> Menu Role Aplikasi {!! $data->nm_aplikasi !!}</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="d-lg-flex d-block">
                <div class="col-2">
                    <a type="button" class="btn btn-default col-12" href="#" onclick="history.back()"><i class="fa fa-arrow-left"></i> Kembali</a>
                </div>
                @if($menus->a_boleh_insert==1)
                <div class="col-2">
                    <a type="button" class="btn btn-info col-12" href="{{ route('aplikasi.menu_role.create', [Crypt::encrypt($data->id_aplikasi)]) }}"><i class="fa fa-plus"></i> Tambah Data</a>
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
                    <thead class="bg-info">
                        <tr>
                            <th>Role</th>
                            <th width="10%" class="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($peran AS $no=>$item)
                        <tr>
                            <td>{{ strtoupper($item->nm_peran) }}</td>
                            <td width="10%" class="text-center">
                                @if($menus->a_boleh_update==1)
                                <a type="button" class="btn btn-primary btn-xs" href="{{ route('aplikasi.menu_role.edit', [Crypt::encrypt($data->id_aplikasi), Crypt::encrypt($item->id_peran)]) }}"><i class="fas fa-users"></i></a>
                                @endif
                                @if($menus->a_boleh_delete==1)
                                <a type="button" class="btn btn-danger btn-xs" href="{{ route('aplikasi.menu_role.destroy', [Crypt::encrypt($data->id_aplikasi), Crypt::encrypt($item->id_peran)]) }}"><i class="fas fa-trash-alt"></i></a>
                                @endif
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
@endsection
