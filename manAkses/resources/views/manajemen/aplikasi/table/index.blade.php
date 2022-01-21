@extends('template.default.app')
@section('title','Table Aplikasi '.$data->nm_aplikasi)
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Table Aplikasi {!! $data->nm_aplikasi !!}</h3>
            <div class="card-tools">
                <a type="button" data-toggle="modal" class="btn btn-primary btn-xs btn-flat" href="#tambahTable"><i class="fa fa-plus"></i> Tambah</a>
            </div>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Skema Table</th>
                            <th>Nama Table</th>
                            <th>Bisa ?</th>
                            <th>Expired Date</th>
                            <th>Last Sync</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($table as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{ $item->skema_tbl }}</td>
                            <td>{{ $item->nm_tbl }}</td>
                            <td>
                                {{ ($item->a_boleh_insert==1) ? 'Insert, ' : '' }}
                                {{ ($item->a_boleh_show==1) ? 'Show, ' : '' }}
                                {{ ($item->a_boleh_delete==1) ? 'Delete, ' : '' }}
                                {{ ($item->a_boleh_update==1) ? 'Update' : '' }}
                            </td>
                            <td>{{ $item->expired_date }}</td>
                            <td>{{ $item->last_sync }}</td>
                            <td>
                                <a type="button" data-toggle="modal" class="btn btn-primary btn-xs" href="#editTable{{$item->id_table_app}}"><i class="fas fa-edit"></i></a>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <div class="modal fade" id="tambahTable" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah </span> 
                        <span class="fw-light">
                            Table Aplikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('aplikasi.table.store', [Crypt::encrypt($data->id_aplikasi)])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PUT">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Skema Table</label>
                                    <input name="skema_tbl" type="text" class="form-control" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Table</label>
                                    <input name="nm_tbl" type="text" class="form-control" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Kode Primary</label>
                                    <input name="kode_primary" type="text" class="form-control">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Enable ?</label>
                                    <select class="form-control" name="a_enable" required>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Bisa:</label><br>
                                    <input type="checkbox" id="a_boleh_insert" name="a_boleh_insert">
                                    <label for="a_boleh_insert"> Insert</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_show" name="a_boleh_show">
                                    <label for="a_boleh_show"> Show</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_delete" name="a_boleh_delete">
                                    <label for="a_boleh_delete"> Delete</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_update" name="a_boleh_update">
                                    <label for="a_boleh_update"> Update</label>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Expired Date</label>
                                    <input name="expired_date" type="date" class="form-control">
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

    @foreach($table as $items)
    <div class="modal fade" id="editTable{{$items->id_table_app}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Edit </span> 
                        <span class="fw-light">
                            Table Aplikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{route('aplikasi.table.update', [Crypt::encrypt([$items->id_table_app, $items->id_pengaturan_table_app])])}}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Skema Table</label>
                                    <input name="skema_tbl" type="text" class="form-control" value="{{$items->skema_tbl}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Table</label>
                                    <input name="nm_tbl" type="text" class="form-control" value="{{$items->nm_tbl}}" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Kode Primary</label>
                                    <input name="kode_primary" type="text" class="form-control" value="{{$items->kode_primary}}">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Enable ?</label>
                                    <select class="form-control" name="a_enable" required>
                                        <option value="0" {{($items->a_enable==0)?'selected':''}}>Tidak</option>
                                        <option value="1" {{($items->a_enable==1)?'selected':''}}>Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Bisa:</label><br>
                                    <input type="checkbox" id="a_boleh_insert" name="a_boleh_insert" {{($items->a_boleh_insert==1)?'checked':''}}>
                                    <label for="a_boleh_insert"> Insert</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_show" name="a_boleh_show" {{($items->a_boleh_show==1)?'checked':''}}>
                                    <label for="a_boleh_show"> Show</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_delete" name="a_boleh_delete" {{($items->a_boleh_delete==1)?'checked':''}}>
                                    <label for="a_boleh_delete"> Delete</label>&nbsp;&nbsp;
                                    <input type="checkbox" id="a_boleh_update" name="a_boleh_update" {{($items->a_boleh_update==1)?'checked':''}}>
                                    <label for="a_boleh_update"> Update</label>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Expired Date</label>
                                    <input name="expired_date" type="date" class="form-control" value="{{$items->expired_date}}">
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
    @endforeach

@endsection