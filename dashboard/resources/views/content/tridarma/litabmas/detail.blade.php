@extends('layouts/layoutMaster')

@section('title', 'Detail Pelaksanaan '.($kode=='L'?'Penelitian/Penelitian':'Pengabdian/Pengabdian'))

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-{{ ($kode=='L'?'flask':'chain') }}"></i> Detail {{ $judul }}</h4>
                </div>
                <div class="card-body">
                    <table id="table-data" class="table table-striped">
                        <tbody>
                        {!! tableRow('Judul',$data['judul_litabmas']) !!}
                        {!! tableRow('No. SK',$data['sk_tugas']) !!}
                        {!! tableRow('Tanggal SK',$data['tgl_sk_tugas']) !!}
                        {!! tableRow('Lokasi Kegiatan',$data['lokasi_kegiatan']) !!}
                        {!! tableRow('Tahun Pengusulan',$data['id_thn_usulan']) !!}
                        {!! tableRow('Tahun Kegiatan',$data['id_thn_kegiatan']) !!}
                        {!! tableRow('In Kind',$data['in_kind']) !!}
                        {!! tableRow('Dana dari Dikti',$data['dana_dikti']) !!}
                        {!! tableRow('Dana dari PT',$data['dana_pt']) !!}
                        {!! tableRow('Dana Lain',$data['dana_institusi_lain']) !!}
                        <tr>
                            <td class="align-text-top"><strong>Penulis</strong></td>
                            <td class="align-text-top">:</td>
                            <td>
                                @if(count($data['penulis'])>0)
                                    <ol>
                                        @foreach($data['penulis'] AS $each_penulis)
                                            <li>{{ $each_penulis->nama.' ('.$each_penulis->peran.') - '.$each_penulis->jenis_penulis }}</li>
                                        @endforeach
                                    </ol>
                                @else
                                    -
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td class="align-text-top"><strong>Dokumen</strong></td>
                            <td class="align-text-top">:</td>
                            <td>
                                @if(count($data['dokumen'])>0)
                                    <ul>
                                        @foreach($data['dokumen'] AS $each_dok)
                                            <li><a href="{{ route('dokumen_publik',$each_dok) }}" class="btn btn-primary btn-sm" target="_blank">Link Dokumen</a></li>
                                        @endforeach
                                    </ul>
                                @else
                                    -
                                @endif
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div class="card-footer">
                    {!! buttonBack(route($base_route)) !!}
                </div>
            </div>
        </div>
    </div>
@endsection
