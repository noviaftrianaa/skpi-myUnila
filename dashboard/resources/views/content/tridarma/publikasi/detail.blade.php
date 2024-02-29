@extends('layouts/layoutMaster')

@section('title', 'Detail Pelaksanaan '.($kode=='L'?'Penelitian/Penelitian':'Pengabdian/Pengabdian'))

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-flask"></i> Detail {{ $judul }}</h4>
                </div>
                <div class="card-body">
                    <table id="table-data" class="table table-striped">
                        <tbody>
                        {!! tableRow('Jenis Publikasi',$jenis_pub->nm_jns_pub) !!}
                        {!! tableRow('Judul',$data['judul']) !!}
                        {!! tableRow('Nama Jurnal',$data['nama_jurnal']) !!}
                        {!! tableRow('Laman Jurnal',$data['laman_jurnal']) !!}
                        {!! tableRow('Tanggal Terbit',$data['tgl_terbit']) !!}
                        {!! tableRow('Vol',$data['vol']) !!}
                        {!! tableRow('No',$data['no']) !!}
                        {!! tableRow('Halaman',$data['hal']) !!}
                        {!! tableRow('Penerbit',$data['penerbit']) !!}
                        {!! tableRow('DOI',$data['doi']) !!}
                        <tr>
                            <td class="align-text-top"><strong>Penulis</strong></td>
                            <td class="align-text-top">:</td>
                            <td>
                                @if(count($data['penulis'])>0)
                                    <ol>
                                        @foreach($data['penulis'] AS $each_penulis)
                                            <li>{{ 'Penulis ke-'.$each_penulis->urutan.'. '.$each_penulis->nama.' - '.$each_penulis->jenis_penulis }}</li>
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
