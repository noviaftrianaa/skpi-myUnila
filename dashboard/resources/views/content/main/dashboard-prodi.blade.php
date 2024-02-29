@extends('layouts/layoutMaster')

@section('title', 'Halaman Utama '.$judul)

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-body">
                    <form action="{{ route('main-index') }}" method="GET">
                        {!! FormInputSelect('smt','Semester Aktif',$semester_list,false,false,$smt_pilih) !!}
                    </form>
                    <hr>
                    <div class="table-responsive">
                        <table class="table table-striped table-bordered">
                            <thead>
                            <tr>
                                <th rowspan="3" class="align-middle">Fakultas</th>
                                <th rowspan="3" class="align-middle">Program Studi</th>
                                <th rowspan="3" class="align-middle">Jenjang</th>
                                <th colspan="5" class="text-center">Dosen</th>
                                <th colspan="7" class="text-center">Mahasiswa</th>
                            </tr>
                            <tr>
                                <th colspan="4" class="text-center">&Sigma;Homebase</th>
                                <th rowspan="2" class="text-center align-middle">&Sigma;Penghitung Rasio</th>
                                <th colspan="4" class="text-center">&Sigma;Keaktifan Mahasiswa</th>
                                <th colspan="2" class="text-center">&Sigma;Kewarganegaraan Mahasiswa</th>
                                <th rowspan="2" class="align-middle">&Sigma;Total</th>
                            </tr>
                            <tr>
                                <th>NIDN</th>
                                <th>NIDK</th>
                                <th>NUP</th>
                                <th>Total</th>
                                <th>Aktif</th>
                                <th>MBKM</th>
                                <th>Non Aktif</th>
                                <th>Lulus</th>
                                <th>Indonesia</th>
                                <th>Asing</th>
                            </tr>
                            </thead>
                            <tbody>
                            @foreach($data_list_tabel AS $index_data_list=>$each_data_list)
                                <tr>
                                    <td>{{ $each_data_list->nm_fak }}</td>
                                    <td>{{ $each_data_list->nm_lemb }}</td>
                                    <td class="text-center">{{ $each_data_list->nm_jenj_didik }}</td>
                                    <td class="text-center">{{ $each_data_list->total_dosen_nidn }}</td>
                                    <td class="text-center">{{ $each_data_list->total_dosen_nidk }}</td>
                                    <td class="text-center">{{ $each_data_list->total_dosen_nup }}</td>
                                    <td class="text-center">{{ $each_data_list->total_dosen_homebase }}</td>
                                    <td class="text-center">{{ $each_data_list->total_dosen_rasio }}</td>
                                    <td class="text-center">{{ $each_data_list->mhs_aktif }}</td>
                                    <td class="text-center">{{ $each_data_list->mhs_mbkm }}</td>
                                    <td class="text-center">{{ $each_data_list->mhs_non_aktif+$each_data_list->mhs_do+$each_data_list->mhs_cuti+$each_data_list->mhs_keluar }}</td>
                                    <td class="text-center">{{ $each_data_list->mhs_lulus }}</td>
                                    <td class="text-center">{{ $each_data_list->mhs_indonesia }}</td>
                                    <td class="text-center">{{ $each_data_list->mhs_asing }}</td>
                                    <td class="text-center">{{ $each_data_list->total_mhs }}</td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <hr>
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title"><i class="fas fa-home"></i> {{ $judul }}</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-primary" style="padding-bottom: 0px;">
                                    <h4 class="card-title text-white">Detail Prodi</h4>
                                </div>
                                <div class="card-body">
                                    <table class="table table-striped mt-2">
                                        <tbody>
                                        {!! tableRow('Nama Prodi',$sms->nm_lemb) !!}
                                        {!! tableRow('Jenjang Pendidikan',$sms->jenjang->nm_jenj_didik) !!}
                                        {!! tableRow('Jurusan',$sms->jurusan_unila->nm_lemb) !!}
                                        {!! tableRow('Fakultas',$sms->fakultas_unila->nm_lemb) !!}
                                        {!! tableRow('Semester mulai berdiri',$sms->smt->nm_smt) !!}
                                        {!! tableRow('Tanggal berdiri',$sms->tgl_berdiri) !!}
                                        {!! tableRow('No SK',$sms->sk_selenggara) !!}
                                        {!! tableRow('Tanggal SK',$sms->tgl_sk_selenggara) !!}
                                        {!! tableRow('Status Prodi',config('mp.data_master.stat_prodi.'.$sms->stat_prodi)) !!}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header bg-primary" style="padding-bottom: 0px;">
                                    <h4 class="card-title text-white">Riwayat Akreditasi</h4>
                                </div>
                                <div class="card-body">
                                    <table class="table table-bordered mt-4">
                                        <thead class="bg-dark-subtle">
                                        <tr>
                                            <th>SK Akreditasi</th>
                                            <th>TMT SK Akreditasi</th>
                                            <th>TST SK Akreditasi</th>
                                            <th>Akreditasi</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        @foreach($data_akreditasi_prodi AS $no=>$each_akred)
                                            <tr
                                                @if($no==0) class="bg-success" @endif
                                            >
                                                <td>{{ $each_akred->sk_akreditasi_prodi }}</td>
                                                <td>{{ $each_akred->tanggal_sk_akreditasi_prodi }}</td>
                                                <td>{{ $each_akred->tst_sk_akreditasi_prodi }}</td>
                                                <td>{{ $each_akred->nm_akred }}</td>
                                            </tr>
                                        @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <div class="card">
                                <div class="card-header bg-primary" style="padding-bottom: 0px;">
                                    <h4 class="card-title text-white">Profil Prodi</h4>
                                </div>
                                <div class="card-body">
                                    <table class="table table-striped mt-2">
                                        <tbody>
                                        {!! tableRow('Visi',$data_profil_prodi->visi) !!}
                                        {!! tableRow('Misi',$data_profil_prodi->misi) !!}
                                        {!! tableRow('Tujuan',$data_profil_prodi->tujuan) !!}
                                        {!! tableRow('Capaian Pembelajaran',$data_profil_prodi->capaian_belajar) !!}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
    <script>
        $(document).ready(function() {
            $('#smt').on('change', function() {
                this.form.submit();
            });
        });
    </script>
@endpush
