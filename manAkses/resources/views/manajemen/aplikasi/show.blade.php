@extends('template.default.app')
@section('title', 'Aplikasi ' . $data->nm_aplikasi)
@extends('__partial.datatable_yajra')

@push('css')
    <link rel="stylesheet" href="{{ asset('iconpicker/css/bootstrap-iconpicker.min.css') }}">
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/select2/3.5.4/select2.min.css" />
    <link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/select2-bootstrap-css/1.4.6/select2-bootstrap.min.css" />
@endpush

@section('content')

    @include('error.list')

    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Aplikasi</h3>
        </div><!-- /.card-header -->
        <div class="card-body" style="margin: 0;padding: 0">
            <div class="row">
                <div class="col-md-2 col-12 pl-4">
                    <img src="{!! !is_null($data->largeobject)
                        ? 'data:image/' . $data->largeobject->mime_type . ';base64,' . $data->largeobject->blob_content
                        : asset('auth/img/logo.png') !!}" width="100%" class="my-3" />
                    @if ($menus->a_boleh_update == '1')
                        <a type="button" data-toggle="modal" class="btn btn-info col-12 my-1"
                            href="#editAplikasi{{ $data->id_aplikasi }}"><i class="fa fa-edit mr-1"></i>Edit</a>
                    @endif
                    @if ($menus->a_boleh_show == '1')
                        <a type="button" class="btn btn-info col-12 my-1"
                            href="{{ route('aplikasi.menu_role', [Crypt::encrypt($data->id_aplikasi)]) }}"><i
                                class="fas fa-table mr-1"></i>Menu Role</a>
                        <a type="button" class="btn btn-info col-12 my-1"
                            href="{{ route('aplikasi.table', [Crypt::encrypt($data->id_aplikasi)]) }}"><i
                                class="fas fa-table mr-1"></i>Tabel Aplikasi</a>
                        <a type="button" class="btn btn-info col-12 my-1"
                            href="{{ route('aplikasi.ws.index', [Crypt::encrypt($data->id_aplikasi)]) }}"><i
                                class="fa fa-connectdevelop mr-1"></i>Web Services</a>
                    @endif
                </div>
                <div class="col-md-10 col-12">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <tbody>
                                {!! tablerow('Aplikasi', $data->nm_aplikasi) !!}
                                {!! tablerow('Unit Organisasi', $data->unitorganisasi->nm_lemb) !!}
                                {!! tablerow('Keterangan Aplikasi', $data->ket_aplikasi) !!}
                                {!! tablerow(
                                    'URL',
                                    '<a href="' . $data->url . '" class="btn btn-outline-info btn-xs" target=new>' . $data->url . '</a>',
                                ) !!}
                                {!! tablerow(
                                    'APP KEY',
                                    '<a href="#showKey" class="btn btn-outline-info btn-xs" data-toggle="modal" onclick="btnFunc()"><i class="fas fa-key"></i></a>',
                                ) !!}
                                {!! tablerow('Apakah Bisa Generate Menu ?', $data->a_generate_menu == 1 ? 'Ya' : 'Tidak') !!}
                                {!! tablerow('Apakah Telah Ter-integrasi SSO ?', $data->a_integrasi_cas == 1 ? 'Ya' : 'Tidak') !!}
                                {!! tablerow('Apakah Sistem Internal PT ?', $data->a_sistem_internal_pt == 1 ? 'Ya' : 'Tidak') !!}
                                {!! tablerow('Tgl Buat', TglWaktuIndonesia($data->tgl_create)) ?? '-' !!}
                                {!! tablerow('Tgl Update', TglWaktuIndonesia($data->last_update)) ?? '-' !!}
                                {!! tablerow('Last Sync', TglWaktuIndonesia($data->last_sync)) ?? '-' !!}
                                {!! tablerow('Tgl Expired', TglWaktuIndonesia($data->expired_date)) ?? '-' !!}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> PJ Aplikasi</h3>
        </div>
        <div class="card-body">
            <div class="row px-2">
                @if ($menus->a_boleh_insert == '1')
                    <div class="col-md-2 col-6 py-1">
                        <button class="btn btn-info" id="pjCreate"><i class="fa fa-plus"></i> Tambah</button>
                    </div>
                @endif
                <div class="col-md-4 col-12 ml-auto py-1">
                    <div class="input-group">
                        <input type="text" id="search-1" placeholder="Pencarian" class="form-control">
                        <div class="input-group-append">
                            <button class="btn btn-info btn-sm" data-toggle="tooltip" data-placement="top" title="Cari">
                                <i class="fa fa-search search-icon"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-borderless table-hover" id="table-pj" style="width: 100% !important">
                    <thead class="bg-info"></thead>
                </table>
            </div>
        </div>
    </div>

    @if ($data->a_generate_menu == 1)
        <div class="card card-info">
            <div class="card-header">
                <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Menu Aplikasi</h3>
            </div>
            <div class="card-body">
                <div class="row px-2">
                    @if ($menus->a_boleh_insert == '1')
                        <div class="col-md-2 col-6 py-1">
                            <button class="btn btn-info" id="createMenu"><i class="fa fa-plus"></i> Tambah</button>
                        </div>
                    @endif
                    <div class="col-md-4 col-12 ml-auto py-1">
                        <div class="input-group">
                            <input type="text" id="search-2" placeholder="Pencarian" class="form-control">
                            <div class="input-group-append">
                                <button class="btn btn-info btn-sm" data-toggle="tooltip" data-placement="top"
                                    title="Cari">
                                    <i class="fa fa-search search-icon"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-borderless table-hover" id="table-menu" style="width: 100% !important">
                        <thead class="bg-info"></thead>
                    </table>
                </div>
            </div>
        </div>
    @endif

    <div class="modal fade" id="editAplikasi{{ $data->id_aplikasi }}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                            Edit </span>
                        <span class="fw-light">
                            Aplikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('aplikasi.update', [Crypt::encrypt($data->id_aplikasi)]) }}" method="post"
                        enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="PATCH">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Unit Organisasi</label>
                                    @php
                                        $unit = DB::SELECT("
                                            SELECT *
                                            FROM man_akses.unit_organisasi WITH (NOLOCK)
                                    ");
                                    @endphp
                                    <select name="id_organisasi" class="form-control select2" data-placeholder="Pilih"
                                        required>
                                        <option></option>
                                        @foreach ($unit as $item)
                                            <option value="{{ $item->id_organisasi }}"
                                                {{ $data->id_organisasi == $item->id_organisasi ? 'selected' : '' }}>
                                                {{ $item->nm_lemb }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Aplikasi</label>
                                    <input name="nm_aplikasi" type="text" class="form-control"
                                        placeholder="Masukkan Nama Aplikasi" value="{{ $data->nm_aplikasi }}" required>
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
                                        <input name="url" type="text" class="form-control" placeholder="http://"
                                            value="{{ $data->url }}" required>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Icon</label>
                                    <div class="input-group">
                                        <input name="file" type="file" class="form-control">
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-12 col-12">
                                <div class="form-group form-group-default">
                                    <label>Option<sup style="color:red">*</sup> :</label><br>
                                    <input type="checkbox" id="a_generate_menu" name="a_generate_menu"
                                        {{ $data->a_generate_menu == 1 ? 'checked' : '' }}>
                                    <label for="a_generate_menu">&nbsp;&nbsp;Apakah Bisa Generate Menu ?</label><br>
                                    <input type="checkbox" id="a_integrasi_cas" name="a_integrasi_cas"
                                        {{ $data->a_integrasi_cas == 1 ? 'checked' : '' }}>
                                    <label for="a_integrasi_cas">&nbsp;&nbsp;Apakah Telah Ter-integrasi SSO ?</label><br>
                                    <input type="checkbox" id="a_sistem_internal_pt" name="a_sistem_internal_pt"
                                        {{ $data->a_sistem_internal_pt == 1 ? 'checked' : '' }}>
                                    <label for="a_sistem_internal_pt">&nbsp;&nbsp;Apakah Sistem Internal PT ?</label>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Expired Date</label>
                                    <input name="expired_date" type="date" class="form-control"
                                        value="{{ !is_null($data->expired_date) ? date('Y-m-d', strtotime($data->expired_date)) : '' }}">
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

    <div class="modal fade" id="showKey" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                            APP </span>
                        <span class="fw-light">
                            KEY
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        @if ($menus->a_boleh_insert == '1')
                            <div class="col-sm-12">
                                <p class="text-muted text-center text-break">
                                    @if (is_null($data->app_key))
                                        -
                                    @else
                                        @php
                                            $app_key = substr($data->app_key, 0, 3) . str_repeat('*', strlen($data->app_key) - 3);
                                        @endphp
                                        <input type="text" class="form-control-plaintext text-center"
                                            value="{{ $app_key }}">
                                    @endif
                                </p>
                            </div>
                        @else
                            <div class="col-sm-12">
                                @if (is_null($data->app_key))
                                    -
                                @else
                                    @php
                                        $app_key = strrev($data->app_key);
                                    @endphp
                                    <input type="text" id="appKeyText" class="form-control-plaintext text-center"
                                        value="{{ $app_key }}">
                                @endif
                            </div>
                        @endif
                    </div>
                    <div class="modal-footer no-bd">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Tutup</button>
                        @if ($menus->a_boleh_insert == '1')
                            <a type="button" class="btn btn-warning" href="{!! route('aplikasi.appKeyGenerate', $data->id_aplikasi) !!}"><i
                                    class="fas fa-key mr-1"></i> Generate App Key</a>
                        @else
                            <button type="button" class="btn btn-warning" id="copyText">Copy</button>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="hapusAplikasi" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                            Hapus </span>
                        <span class="fw-light">
                            Aplikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="{{ route('aplikasi.destroy', [Crypt::encrypt($data->id_aplikasi)]) }}" method="post"
                        enctype="multipart/form-data">
                        <input type="hidden" name="_token" value="{{ csrf_token() }}">
                        <input type="hidden" name="_method" value="DELETE">
                        <div class="row">
                            <div class="col-sm-12">
                                <p>Apakah yakin ingin menghapus aplikasi <b>{{ $data->nm_aplikasi }}</b> ?</p>
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="button" class="btn btn-link" data-dismiss="modal">Tutup</button>
                            <button type="submit" class="btn btn-danger">Hapus</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="pjMdl" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold" id="titleMdl"></span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="#" method="post" enctype="multipart/form-data" id="formPjMdl">
                        <input type="hidden" name="_token" id="pj_token">
                        <input type="hidden" name="_method" id="pjMethodMdl">
                        <input type="hidden" name="id_aplikasi" id="pj_id_aplikasi">
                        <div class="row">
                            <div class="col-sm-12" id="createPjMdl">
                                <div class="form-group form-group-default">
                                    <label>Select</label>
                                    <select id="code" class="form-control">
                                        <option value="" selected disabled>Select</option>
                                        <option value="0">New</option>
                                        <option value="1">Existing</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row" id="existingPJ">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Pengguna</label>
                                    <input id="id_pengguna" class="form-control" name="id_pengguna" />
                                </div>
                            </div>
                        </div>
                        <div class="row" id="newPJ">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama PJ</label>
                                    <input name="nm_pj" id="nm_pj" type="text" class="form-control"
                                        placeholder="Masukkan Nama PJ">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Username</label>
                                    <input name="username" id="username" type="text" class="form-control"
                                        placeholder="Masukkan Username tanpa spasi">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Jenis Kelamin</label>
                                    <select name="jenis_kelamin" id="jenis_kelamin" class="form-control">
                                        <option value="" selected disabled>Pilih</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>No. HP</label>
                                    <input name="no_hp" id="no_hp" type="number" class="form-control"
                                        placeholder="Masukkan Nomor HP">
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Email</label>
                                    <input name="email" id="email" type="email" class="form-control"
                                        placeholder="Masukkan Email">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Jabatan</label>
                                    <input name="jabatan_pj" id="jabatan_pj" type="text" class="form-control"
                                        placeholder="Masukkan Jabatan" required>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Masih ?</label>
                                    <select class="form-control" name="a_masih" id="a_masih" required>
                                        <option value="" selected disabled>Pilih</option>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Waktu Selesai</label>
                                    <input name="wkt_selesai" id="wkt_selesai" type="date" class="form-control">
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

    <div class="modal fade" id="deletePjMdl" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                            Delete </span>
                        <span class="fw-light">
                            PJ Aplikasi
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="#" method="post" enctype="multipart/form-data" id="formPjDeleteMdl">
                        <input type="hidden" name="_token" id="pj_token_delete">
                        <input type="hidden" name="_method" id="pj_method_delete">
                        <div class="row">
                            <div class="col-sm-12">
                                Yakin ingin menghapus PJ atas nama <strong id="deleteNmPjMdl"></strong> dari
                                {{ $data->nm_aplikasi }} ?
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="button" class="btn btn-link" data-dismiss="modal">Tutup</button>
                            <button type="submit" class="btn btn-danger">Hapus</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="menuMdl" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                            Tambah </span>
                        <span class="fw-light">
                            Menu
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="#" method="post" enctype="multipart/form-data" id="formMenuMdl">
                        <input type="hidden" name="_token" id="menu_token">
                        <input type="hidden" name="_method" id="menu_method">
                        <input type="hidden" name="id_aplikasi" id="menu_id_aplikasi">
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama Menu</label>
                                    <input name="nm_menu" id="nm_menu" type="text" class="form-control"
                                        placeholder="Masukkan Nama Menu" required>
                                </div>
                            </div>
                            <div class="col-sm-12">
                                <div class="form-group form-group-default">
                                    <label>Nama File</label>
                                    <input name="nm_file" id="nm_file" type="text" class="form-control"
                                        placeholder="Masukkan Nama File" required>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Urutan Menu</label>
                                    <input name="urutan_menu" id="urutan_menu" type="number" class="form-control"
                                        placeholder="Masukkan Urutan Menu" required>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Group Menu</label>
                                    <select name="id_group_menu" id="id_group_menu" class="form-control">
                                        <option value="" selected disabled>Pilih</option>
                                        @foreach (\App\Models\Menu::where('id_aplikasi', $data->id_aplikasi)->where('urutan_menu', '>', 0)->orderBy('urutan_menu', 'ASC')->pluck('nm_menu', 'id_menu') as $n => $r)
                                            <option value="{{ $n }}">{{ $r }}</option>
                                        @endforeach
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Icon</label>
                                    <div class="input-group">
                                        <div class="input-group-prepend">
                                            <button class="btn btn-secondary" data-icon="fas fa-map-marker-alt"
                                                role="iconpicker" id="btnIcon"></button>
                                        </div>
                                        <input type="text" class="form-control" name="icon" id="icon">
                                    </div>
                                    <!-- <input name="icon" id="icon" type="text" class="form-control iconpicker" placeholder="icon"> -->
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="form-group form-group-default">
                                    <label>Level Menu</label>
                                    <input name="level_menu" id="level_menu" type="number" class="form-control"
                                        placeholder="level menu">
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Aktif ?</label>
                                    <select class="form-control" name="a_aktif" id="a_aktif" required>
                                        <option value="" selected disabled>Pilih</option>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-sm-6 col-12">
                                <div class="form-group form-group-default">
                                    <label>Apakah Tampil ?</label>
                                    <select class="form-control" name="a_tampil" id="a_tampil" required>
                                        <option value="" selected disabled>Pilih</option>
                                        <option value="0">Tidak</option>
                                        <option value="1">Ya</option>
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

    <div class="modal fade" id="deleteMenuMdl" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header no-bd">
                    <h5 class="modal-title">
                        <span class="fw-mediumbold">
                            Delete </span>
                        <span class="fw-light">
                            Menu
                        </span>
                    </h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form action="#" method="post" enctype="multipart/form-data" id="formMenuDeleteMdl">
                        <input type="hidden" name="_token" id="menu_token_delete">
                        <input type="hidden" name="_method" id="menu_method_delete">
                        <div class="row">
                            <div class="col-sm-12">
                                Yakin ingin menghapus Menu <strong id="deleteNmMenuMdl"></strong> dari
                                {{ $data->nm_aplikasi }} ?
                            </div>
                        </div>
                        <div class="modal-footer no-bd">
                            <button type="button" class="btn btn-link" data-dismiss="modal">Tutup</button>
                            <button type="submit" class="btn btn-danger">Hapus</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

@endsection

@push('js')
    <script src="{{ asset('iconpicker/js/bootstrap-iconpicker.bundle.min.js') }}"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.15.0/lodash.min.js"></script>
    <script src="//cdnjs.cloudflare.com/ajax/libs/select2/3.5.4/select2.min.js"></script>
    <script>
        function btnFunc() {
            $('#copyText').text('Copy to Clipboard');
        }

        function tbPJ(menus, url) {
            return $('#table-pj').DataTable({
                processing: true,
                serverSide: true,
                ajax: {
                    url: url,
                    type: "GET"
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        width: '5px',
                        title: 'No.'
                    },
                    {
                        data: 'nm_pj',
                        title: 'Penanggung Jawab'
                    },
                    {
                        data: 'email',
                        title: 'Email',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'no_hp',
                        title: 'HP',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'id_pj_aplikasi',
                        title: 'Action',
                        width: '5px',
                        className: 'text-center',
                        render: function(data, type, row) {
                            var btn = ``;
                            if (menus.a_boleh_insert == 1) {
                                var ws = "{{ route('aplikasi.pj_aplikasi.akses_ws.create', '') }}" + "/" +
                                    data;
                                btn += `
                                <div class="btn-group">
                                    <button type="button" class="btn btn-link btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <button class="dropdown-item text-danger" id="deletePJ" data-id="${data}" data-nama="${row.nm_pj}"><i class="fas fa-trash-alt mr-1"></i>Delete</button>
                                    </div>
                                </div>
                            `;
                                // <button class="dropdown-item" id="editPJ" data-id="${data}" data-pengguna="${row.id_pengguna}" data-jabatan="${row.jabatan_pj}" data-aktif="${row.a_masih}" data-expired="${row.wkt_selesai}"><i class="fa fa-edit mr-1"></i>Edit</button>
                                // <div class="dropdown-divider"></div>
                                // <a class="dropdown-item" href="${ws}"><i class="fa fa-globe mr-1"></i>Akses WS</a>
                            }
                            return btn;
                        }
                    }
                ],
                sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
            })
        }

        function tbMenu(menus, url) {
            return $('#table-menu').DataTable({
                processing: true,
                serverSide: true,
                ajax: {
                    url: url,
                    type: "GET"
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        width: '5px',
                        title: 'No.'
                    },
                    {
                        data: 'nm_menu',
                        title: 'Nama Menu'
                    },
                    {
                        data: 'nm_file',
                        title: 'Nama File'
                    },
                    {
                        data: 'icon',
                        title: 'Icon'
                    },
                    {
                        data: 'group_menu',
                        title: 'Group Menu',
                        render: function(data, type, row) {
                            if (data != null) {
                                data = data.nm_menu;
                            }
                            return data;
                        }
                    },
                    {
                        data: 'urutan_menu',
                        title: 'Urutan',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'a_tampil',
                        title: 'Tampil?',
                        width: '5px',
                        className: 'text-center',
                        render: function(data, type, row) {
                            return data == 1 ? `<span class="badge badge-success">Ya</span>` :
                                `<span class="badge badge-danger">Tidak</span>`;
                        }
                    },
                    {
                        data: 'a_aktif',
                        title: 'Status',
                        width: '5px',
                        className: 'text-center',
                        render: function(data, type, row) {
                            return data == 1 ? `<span class="badge badge-success">Aktif</span>` :
                                `<span class="badge badge-danger">Tidak Aktif</span>`;
                        }
                    },
                    {
                        data: 'id_menu',
                        title: 'Action',
                        width: '5px',
                        className: 'text-center',
                        render: function(data, type, row) {
                            var btn = ``;
                            if (menus.a_boleh_insert == 1) {
                                btn += `
                                <div class="btn-group">
                                    <button type="button" class="btn btn-link btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right">
                                        <button class="dropdown-item" id="editMenu" data-id="${data}" data-action="{{ route('menu.update', ':id') }}"><i class="fas fa-edit mr-1"></i>Edit</button>
                                        <button class="dropdown-item text-danger" id="deleteMenu" data-id="${data}" data-action="{{ route('menu.destroy', ':id') }}" data-nama="${row.nm_menu}"><i class="fas fa-trash-alt mr-1"></i>Delete</button>
                                    </div>
                                </div>
                            `;
                            }
                            return btn;
                        }
                    }
                ],
                sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
            })
        }

        function data() {
            let data = <?php echo json_encode($user); ?>;
            return $.map(data, function(i) {
                return {
                    id: i.id_pengguna,
                    text: i.nm_pengguna + ' (' + i.email + ')',
                };
            });
        }

        $(document).ready(function() {
            //GET PENGGUNA
            $('#id_pengguna').select2({
                data: data(),
                placeholder: 'Search',
                multiple: true,
                query: function(data) {
                    var pageSize,
                        dataset,
                        that = this;
                    pageSize = 20; // Number of the option loads at a time
                    results = [];
                    if (data.term && data.term !== '') {
                        // HEADS UP; for the _.filter function I use underscore (actually lo-dash) here
                        results = _.filter(that.data, function(e) {
                            return e.text.toUpperCase().indexOf(data.term.toUpperCase()) >= 0;
                        });
                    } else if (data.term === '') {
                        results = that.data;
                    }
                    data.callback({
                        results: results.slice((data.page - 1) * pageSize, data.page *
                            pageSize),
                        more: results.length >= data.page * pageSize,
                    });
                },
            });

            let menus = <?php echo json_encode($menus); ?>;
            let id = "{{ $id }}";
            var pj = "{{ route('aplikasi.dataPJ', '') }}" + "/" + id;
            var menu = "{{ route('aplikasi.dataMenu', '') }}" + "/" + id;
            //Install Datatables
            var tpj = tbPJ(menus, pj);
            var tmn = tbMenu(menus, menu);
            //search input
            $('#search-1').on('change', function() {
                tpj.search($('#search-1').val()).draw();
            });
            $('#search-2').on('change', function() {
                tmn.search($('#search-2').val()).draw();
            });
            $('#copyText').on('click', function() {
                var text = $(this).text();
                window.navigator.clipboard.writeText($('#appKeyText').val());
                $(this).text('Copied!');
            });
            //ifelse
            $('#code').on('change', function() {
                if (this.value == 0) {
                    $('#existingPJ').hide();
                    $('#id_pengguna').val(null).trigger("change");
                    $('#id_pengguna').removeAttr('required', '');
                    $('#newPJ').show();
                    $('#nm_pj').attr('required', '');
                    $('#username').attr('required', '');
                    $('#jenis_kelamin').attr('required', '');
                    $('#no_hp').attr('required', '');
                    $('#email').attr('required', '');
                } else {
                    $('#newPJ').hide();
                    $('#existingPJ').show();
                    $('#id_pengguna').attr('required', '');
                    $('#nm_pj').removeAttr('required', '');
                    $('#jenis_kelamin').removeAttr('required', '');
                    $('#username').removeAttr('required', '');
                    $('#nm_pj').val(null);
                    $('#jenis_kelamin').val(null);
                    $('#username').val(null);
                    $('#no_hp').removeAttr('required', '');
                    $('#email').removeAttr('required', '');
                    $('#no_hp').val(null);
                    $('#email').val(null);
                }
            });
            //Tambah PJ
            $('#pjCreate').on('click', function() {
                //null
                $('#formPjMdl input').val(null);
                $('#formPjMdl select').val("");
                //validate
                $('#createPjMdl').show();
                $('#newPJ').hide();
                $('#existingPJ').hide();
                $('#formPjMdl').prop("action", "{{ route('aplikasi.pj_aplikasi.store') }}");
                $('#pj_token').val("{{ csrf_token() }}");
                $('#pjMethodMdl').val('PUT');
                $('#pj_id_aplikasi').val(id);
                $('#pjMdl').modal('show');
            });
            //Edit PJ
            tpj.on('click', '#editPJ', function() {
                //null
                $('#formPjMdl input').val(null);
                $('#formPjMdl select').val("");

                var ids = $(this).data('id');
                var pengguna = $(this).data('pengguna');
                var jabatan = $(this).data('jabatan');
                var aktif = $(this).data('aktif');
                var expired = $(this).data('expired');
                $('#formPjMdl').prop("action", "{{ route('aplikasi.pj_aplikasi.update', '') }}" + "/" +
                    ids);
                $('#pjMethodMdl').val('PATCH');
                $('#newPJ').hide();
                $('#createPjMdl').hide();
                $('#existingPJ').show();
                $('#pj_id_aplikasi').val(id);
                $('#pj_token').val("{{ csrf_token() }}");
                $('#id_pengguna').val(pengguna).trigger('change');
                $('#jabatan_pj').val(jabatan);
                $('#a_masih').val(aktif);
                $('#wkt_selesai').val(expired);
                $('#pjMdl').modal('show');
            });
            //Delete PJ
            tpj.on('click', '#deletePJ', function() {
                var ids = $(this).data('id');
                var nama = $(this).data('nama');
                $('#deleteNmPjMdl').html(null);
                $('#formPjDeleteMdl').prop("action", "{{ route('aplikasi.pj_aplikasi.destroy', '') }}" +
                    "/" + ids);
                $('#pj_method_delete').val('DELETE');
                $('#pj_token_delete').val("{{ csrf_token() }}");
                $('#deleteNmPjMdl').html(nama);
                $('#deletePjMdl').modal('show');
            });
            $('#createMenu').on('click', function() {
                //null
                $('#formMenuMdl input').val(null);
                $('#formMenuMdl select').val("");
                $('#formMenuMdl').prop("action", "{{ route('menu.store') }}");
                $('#menu_token').val("{{ csrf_token() }}");
                $('#menu_method').val('PUT');
                $('#menu_id_aplikasi').val(id);
                $('#menuMdl').modal('show');
            });
            tmn.on('click', '#editMenu', function() {
                //null
                $('#formMenuMdl input').val(null);
                $('#formMenuMdl select').val("");

                var ids = $(this).data('id');
                var url = $(this).data('action');
                url = url.replace(':id', ids);

                $.ajax({
                    url: "{{ route('menu.data', '') }}" + "/" + ids,
                    type: "GET",
                    success: function(data) {
                        $('#formMenuMdl').prop("action", url);
                        $('#menu_token').val("{{ csrf_token() }}");
                        $('#menu_method').val('PATCH');
                        $('#menu_id_aplikasi').val(id);
                        $('#nm_menu').val(data.nm_menu);
                        $('#nm_file').val(data.nm_file);
                        $('#urutan_menu').val(data.urutan_menu);
                        $('#id_group_menu').val(data.id_group_menu).trigger('change');
                        $('#icon').val(data.icon);
                        $('#level_menu').val(data.level_menu);
                        $('#btnIcon i').prop('class', data.icon);
                        $('#a_aktif').val(data.a_aktif).trigger('change');
                        $('#a_tampil').val(data.a_tampil).trigger('change');
                        $('#menuMdl').modal('show');
                    }
                });
            });
            tmn.on('click', '#deleteMenu', function() {

                var ids = $(this).data('id');
                var url = $(this).data('action');
                url = url.replace(':id', ids);
                var nama = $(this).data('nama');

                $('#deleteNmMenuMdl').html(null);
                $('#formMenuDeleteMdl').prop("action", url);
                $('#menu_method_delete').val('DELETE');
                $('#menu_token_delete').val("{{ csrf_token() }}");
                $('#deleteNmMenuMdl').html(nama);
                $('#deleteMenuMdl').modal('show');
            });
            $('.iconpicker').iconpicker();
            $('#btnIcon').on('change', function() {
                $('#icon').val(null);
                $('#icon').val($('#btnIcon input').val());
            });
        });
    </script>
@endpush
