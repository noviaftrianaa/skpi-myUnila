@extends('template_public.default')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-sm-6">
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fa fa-info-circle"></i> Profil</h3></div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <tbody>
                            {!! tableRow('Nama',$profil_dosen->nm_sdm) !!}
                            {!! tableRow('NIDN',$profil_dosen->nidn) !!}
                            {!! tableRow('NIP',$profil_dosen->nip) !!}
                            {!! tableRow('Jenis SDM',$profil_dosen->nm_jns_sdm) !!}
                            {!! tableRow('Jenis Kelamin',$profil_dosen->jenis_kelamin) !!}
                            {!! tableRow('Agama',$profil_dosen->nm_agama) !!}
                            {!! tableRow('Kewarganegaraan',$profil_dosen->nm_negara) !!}
                            {!! tableRow('Email',$profil_dosen->email) !!}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-sm-6">
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fa fa-briefcase"></i> Pekerjaan</h3></div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <tbody>
                            {!! tableRow('Perguruan Tinggi',$profil_dosen->asal_pt) !!}
                            {!! tableRow('Fakultas',$profil_dosen->fakultas) !!}
                            {!! tableRow('Jurusan',$profil_dosen->jurusan) !!}
                            {!! tableRow('Program Studi',$profil_dosen->prodi) !!}
                            {!! tableRow('Ikatan Kerja',$profil_dosen->nm_ikatan_kerja) !!}
                            {!! tableRow('TMT Surat Tugas',(is_null($profil_dosen->tmt_srt_tgs)?null:tglIndonesia($profil_dosen->tmt_srt_tgs))) !!}
                            {!! tableRow('Status Kepegawaian',$profil_dosen->nm_stat_pegawai) !!}
                            {!! tableRow('Status Keaktifan',$profil_dosen->nm_stat_aktif) !!}
                            {!! tableRow('Tanggal Mulai Menjadi Dosen (TMMD)',(is_null($profil_dosen->tmt_srt_tgs)?null:tglIndonesia($profil_dosen->tmt_srt_tgs))) !!}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fa fa-graduation-cap"></i> Riwayat Pendidikan Formal</h3></div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th>Jenjang</th>
                                <th>Nama Perguruan Tinggi</th>
                                <th>Tahun Lulus</th>
                                <th>Gelar Akademik</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($rwy_pend AS $no_pend=>$each_rwy_pend)
                                <tr>
                                    <td>{{ $each_rwy_pend->nm_jenj_didik }}</td>
                                    <td>{{ $each_rwy_pend->nm_sp_formal }}</td>
                                    <td>{{ $each_rwy_pend->thn_lulus }}</td>
                                    <td>{{ $each_rwy_pend->singkat_gelar }}</td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-sm-6">
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fa fa-history"></i> Riwayat Kepangkatan</h3></div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th>Pangkat/Gol</th>
                                <th>No. SK</th>
                                <th>Tgl SK</th>
                                <th>TMT SK</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($rwy_pang AS $no_pang=>$each_rwy_pang)
                                <tr>
                                    <td>{{ $each_rwy_pang->nm_pangkat.' - '.$each_rwy_pang->kode_gol }}</td>
                                    <td>{{ $each_rwy_pang->sk_pangkat }}</td>
                                    <td>{{ tglIndonesia($each_rwy_pang->tgl_sk_pangkat) }}</td>
                                    <td>{{ tglIndonesia($each_rwy_pang->tmt_sk_pangkat) }}</td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6">
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fa fa-briefcase"></i> Riwayat Fungsional</h3></div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th>Jabatan Fungsional</th>
                                <th>No. SK</th>
                                <th>TMT SK</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($rwy_jab AS $no_jab=>$each_rwy_jab)
                                <tr>
                                    <td>{{ $each_rwy_jab->nm_jabfung.' - '.$each_rwy_jab->angka_kredit }}</td>
                                    <td>{{ $each_rwy_jab->sk_jabfung }}</td>
                                    <td>{{ tglIndonesia($each_rwy_jab->tmt_sk_jabfung) }}</td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-sm-6">
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fa fa-tasks"></i> Riwayat Struktural</h3></div>
                    <div class="card-body">
                        <table class="table table-striped">
                            <thead>
                            <tr>
                                <th>Jabatan</th>
                                <th>Kegiatan</th>
                                <th>No. SK</th>
                                <th>TMT SK</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($rwy_struk AS $no_struk=>$each_rwy_struk)
                                <tr>
                                    <td>{{ $each_rwy_struk->nm_jab_tgs }}</td>
                                    <td>{{ $each_rwy_struk->nm_kat }}</td>
                                    <td>{{ $each_rwy_struk->sk_jabstruk }}</td>
                                    <td>{{ tglIndonesia($each_rwy_struk->tmt_sk_jabstruk) }}</td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
