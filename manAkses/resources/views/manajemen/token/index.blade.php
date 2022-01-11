@extends('template.default.app')
@section('title','Data Token')
@extends('__partial.datatable')

@section('content')
    <div class="card">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Data Token</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Token</th>
                        <th>Keterangan</th>
                        <th>Created Date</th>
                        <th>Expired Date</th>
                        <th>Base URL</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->token_value}}</td>
                            <td>{{$item->keterangan}}</td>
                            <td>{{$item->waktu_create}}</td>
                            <td>{{$item->waktu_expired}}</td>
                            <td>{{$item->base_url}}</td>
                            <td>
                                <button class="btn btn-outline-danger btn-xs" title="Reset" data-toggle="modal" data-target="#deleteItem{{$item->id_token}}"> <i class="fas fa-trash-alt"></i></button>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    @foreach($data as $items)
    <div class="modal fade" id="deleteItem{{$items->id_token}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                        Tambah</span> 
                        <span class="fw-light">
                            PJ
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="#" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                Yakin ingin menghapus Token?
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="submit" class="btn btn-danger">Hapus</button>
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Tutup</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    @endforeach

@endsection