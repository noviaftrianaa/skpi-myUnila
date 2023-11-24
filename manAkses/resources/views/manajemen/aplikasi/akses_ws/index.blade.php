@extends('template.default.app')
@section('title','Data Hak Akses Web Services')
@include('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Hak Akses Web Services</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="d-lg-flex d-block">
                <div class="col-2">
                    <button onclick="history.back()" class="btn btn-default col-12" id="btnBack"><i class="fa fa-arrow-left"></i> Kembali</button>
                </div>
                @if($menus->a_boleh_insert == "1")
                <div class="col-2">
                    <a href="{{ route('aplikasi.pj_aplikasi.akses_ws.create', Crypt::encrypt($id)) }}" class="btn btn-info col-12" id="btnTambah"><i class="fa fa-plus"></i> Tambah</a>
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
                        <th width="5px">No.</th>
                        <th>Pengguna</th>
                        <th width="10%" class="text-center">Action</th>
                    </thead>
                    <tbody>
                        @foreach ($data as $no=>$item)
                            <tr>
                                <td>{{ $no+1 }}</td>
                                <td>{{ strtoupper($item->nm_pengguna) }}</td>
                                <td>
                                    <a href="{{ route('aplikasi.pj_aplikasi.akses_ws.edit', Crypt::encrypt([$id, $item->id_pengguna])) }}" class="btn btn-default btn-xs" title="Edit"><i class="fas fa-edit mr-1"></i>Edit</a>
                                    <button class="btn btn-danger btn-xs" title="Delete" data-toggle="modal" data-target="#deleteMdl{{$no}}"><i class="fas fa-trash-alt mr-1"></i>Delete</a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    @foreach ($data as $no=>$items)
    <div class="modal fade" id="deleteMdl{{$no}}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        HAPUS AKSES WEB SERVICES
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('aplikasi.pj_aplikasi.akses_ws.delete', Crypt::encrypt([$id, $items->id_pengguna])) }}" method="post" enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                <h4>Apakah yakin ingin menghapus akses web services atas nama "<strong>{{ strtoupper($items->nm_pengguna) }}</strong>" ?</h4>
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
    @endforeach

@endsection
