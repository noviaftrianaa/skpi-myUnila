@extends('template.default.app')
@section('title','Riwayat Pendidikan')
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Riwayat Pendidikan</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-bordered table-hover" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Jenjang Pendidikan</th>
                        <th>Nama PT</th>
                        <th>Prodi/Bidang Studi</th>
                        @if(!is_null($user->id_sdm_pengguna))
                        <th>Gelar</th>
                        @endif
                        <th>Tahun Masuk</th>
                        <th>Tahun Lulus</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td>{{ $no+1 }}</td>
                            <td>{{ $item['jenjang_pendidikan'] ?? explode(')', (explode('(', $data['prodi'])[1]))[0] }}</td>
                            <td>{{ $item['nama_sp'] ?? $item['nm_lemb'] }}</td>
                            <td>{{ (!is_null($item['prodi'])) ? $item['prodi']." > ".$item['bidang_studi'] : $item['bidang_studi'] }}</td>
                            @if(!is_null($user->id_sdm_pengguna))
                            <td>{{ $item['gelar_akademik'] }}</td>
                            @endif
                            <td>{{ $item['tahun_masuk'] ?? $item['tanggal_masuk'] }}</td>
                            <td>{{ $item['tahun_lulus'] ?? $item['tgl_keluar'] }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

@endsection