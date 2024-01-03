@extends('template.default.app')
@section('title','Edit Aplikasi')
@extends('__partial.datatable')
@extends('__partial.select2')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Edit Aplikasi</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <!-- FORM CREATE APLIKASI -->
            <form action="{{ route('aplikasi.store') }}" method="post" enctype="multipart/form-data">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                <input type="hidden" name="_method" value="PUT">
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Unit Organisasi</label>
                            <select class="form-control select2" name="id_organisasi" data-placeholder="Pilih">
                                <option></option>
                                @foreach($unit as $item)
                                <option value="{{$item->id_aplikasi}}" {{ ($item->id_organisasi==$data->id_organisasi) ? 'selected':''}}>{{$item->nm_lemb}}</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Nama Aplikasi</label>
                            <input name="nm_aplikasi" type="text" class="form-control" placeholder="Masukkan Nama Aplikasi" value="{{ $data->nm_aplikasi }}" required>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Keterangan</label>
                            <textarea class="form-control" name="ket_aplikasi" required>{{ $data->ket_aplikasi }}</textarea>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>URL</label>
                            <div class="input-group">
                                <input name="url" type="text" class="form-control" placeholder="http://" value="{{ $data->url }}" required>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-12">
                        <div class="form-group form-group-default">
                            <label>Apakah Bisa Generate Menu ?</label>
                            <select class="form-control" name="a_generate_menu" required>
                                <option value="0" {{ ($data->a_generate_menu==0) ? 'selected' : ''}}>Tidak</option>
                                <option value="1" {{ ($data->a_generate_menu==1) ? 'selected' : ''}}>Ya</option>
                            </select>
                        </div>
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
