@extends('template_public.default')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-sm-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fa fa-info-circle"></i> Profil</h3>
                    </div>
                    <div class="card-body">

                        <div class="table-responsive">
                            <table class="table table-striped">
                                <tbody>
                                    {!! tableRow('Nama', $profil_mahasiswa->nm_pd) !!}
                                    {!! tableRow('NPM', $profil_mahasiswa->npm) !!}
                                    {!! tableRow('Jenis Kelamin', $profil_mahasiswa->jenis_kelamin) !!}
                                    {!! tableRow('Tempat, Tgl Lahir', $profil_mahasiswa->ttgl_lahir) !!}
                                    {!! tableRow('Agama', $profil_mahasiswa->nm_agama) !!}
                                    {!! tableRow('Kewarganegaraan', $profil_mahasiswa->nm_negara) !!}
                                    {!! tableRow('Email', $profil_mahasiswa->email) !!}
                                    {!! tableRow('Telepon/Hp', $profil_mahasiswa->tlpn_hp) !!}
                                    {!! tableRow('Alamat', $profil_mahasiswa->jln) !!}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fa fa-book"></i> Perkuliahaan</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <tbody>
                                    {!! tableRow('Status', $profil_mahasiswa->nm_stat_mhs) !!}
                                    {!! tableRow('Perguruan Tinggi', $profil_mahasiswa->asal_pt) !!}
                                    {!! tableRow('Fakultas', $profil_mahasiswa->fakultas) !!}
                                    {!! tableRow('Jurusan', $profil_mahasiswa->jurusan) !!}
                                    {!! tableRow('Program Studi', $profil_mahasiswa->nm_prodi) !!}
                                    {!! tableRow('Jalur Daftar', $profil_mahasiswa->nm_jalur_daftar) !!}
                                    {!! tableRow('Semester Sekarang', $profil_mahasiswa->smt_skrng) !!}
                                    {!! tableRow('IPK', $profil_mahasiswa->ipk) !!}
                                    {!! tableRow('Total SKS', number_format($profil_mahasiswa->total_sks, 0, '.', '')) !!}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fa fa-tasks"></i> Status UKT</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Periode</th>
                                        <th>Kelas UKT</th>
                                        <th>Status Pembayaran</th>
                                        <th>Semester</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($status_ukt as $no_ukt => $each_ukt)
                                        <tr>
                                            <td>{{ $each_ukt->periode }}</td>
                                            <td>{{ $each_ukt->fk_kelas_ukt }}</td>
                                            <td>{{ $each_ukt->fk_flag_bayar }}</td>
                                            <td>{{ $each_ukt->fk_nama_semester }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fa fa-tasks"></i> Status Semester</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Periode</th>
                                        <th>SKS Semester</th>
                                        <th>IPS</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($status_semester as $no_semester => $each_semester)
                                        <tr>
                                            <td>{{ $each_semester->periode }}</td>
                                            <td>{{ $each_semester->sks_semester }}</td>
                                            <td>{{ number_format($each_semester->ips, 2, '.', '') }}</td>
                                            <td>{{ $each_semester->nm_stat_mhs }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
