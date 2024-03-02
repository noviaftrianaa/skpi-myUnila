@extends('layouts/layoutMaster')

@section('title', 'Detail Mahasiswa'))

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fas fa-user-graduate"></i> Detail Mahasiswa</h4>
                </div>
                <div class="card-body">
                    <h4>Biodata Mahasiswa</h4>
                    <table id="table-data" class="table table-striped">
                        <tbody>
                        {!! tableRow('Nama Mahasiswa',$pd->nm_pd) !!}
                        {!! tableRow('Jenis Kelamin',config('mp.data_master.jk.'.$pd->jk)) !!}
                        {!! tableRow('NISN',$pd->nisn) !!}
                        {!! tableRow('NIK',$pd->nik) !!}
                        {!! tableRow('TTL',$pd->tmpt_lahir.', '.tglIndonesia($pd->tgl_lahir)) !!}
                        {!! tableRow('Alamat',$pd->jln) !!}
                        {!! tableRow('RT/RW',$pd->rt.'/'.$pd->rw) !!}
                        {!! tableRow('Agama',$pd->agama) !!}
                        {!! tableRow('Kewarganegaraan',$pd->kewarganegaraan) !!}
                        {!! tableRow('Status Mahasiswa',$pd->nm_stat_mhs) !!}
                        </tbody>
                    </table>
                    <hr>
                    <ul class="nav nav-pills nav-fill">
                        <li class="nav-item">
                            <a class="nav-link {{ $kode=='homebase'?'active':'' }}" aria-current="page" href="{{ $base_route }}">Homebase</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link {{ $kode=='status_semester'?'active':'' }}" href="{{ $base_route.'?kode=status_semester' }}">Status Semester</a>
                        </li>
{{--                        <li class="nav-item">--}}
{{--                            <a class="nav-link {{ $kode=='rwy_nilai'?'active':'' }}" href="{{ $base_route.'?kode=rwy_nilai' }}">Riwayat Nilai</a>--}}
{{--                        </li>--}}
                    </ul>
                    <div class="mt-4">
                        @if($kode=='homebase')
                            @include('content.main.mahasiswa.detail.homebase')
                        @elseif($kode=='status_semester')
                            @include('content.main.mahasiswa.detail.status_semester')
                        @elseif($kode=='rwy_nilai')
                            @include('content.main.mahasiswa.detail.rwy_nilai')
                        @endif
                    </div>
                </div>
                <div class="card-footer">
                    {!! buttonBack(route('mahasiswa.daftar_mahasiswa')) !!}
                </div>
            </div>
        </div>
    </div>
@endsection
