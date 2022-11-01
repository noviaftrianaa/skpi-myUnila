@extends('template_public.default')
@section('content')
    <div class="row">
        <div class="col">
            <div class="card">
                <div class="card-header">
                    DOSEN TRIDHARMA
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="table-responsive">
                            <table class="table table-striped table-responsive" style="width: 100%;">
                                <thead class="bg-info">
                                    <tr>
                                        <th scope="col">Jenis Tridarma</th>
                                        <th scope="col">Peran Tridarma</th>
                                        <th scope="col">Afiliasi Tridarma</th>
                                        <th scope="col">Th. Laksana Tridarma</th>
                                        <th scope="col">Judul Tridarma</th>

                                        <th scope="col">Nidn/Nidk</th>
                                        <th scope="col">Nama</th>
                                        <th scope="col">Nip</th>
                                        <th scope="col">Pend. Akhir</th>
                                        <th scope="col">Tgl. Lahir</th>
                                        <th scope="col">Ikatan Kerja</th>
                                        <th scope="col">Keaktifan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($apiIku3Tridharma as $item)
                                        <tr>
                                            <th>{{ $item->jns_litabmas }}</th>
                                            <th>{{ $item->peran_litabmas }}</th>
                                            <th>{{ $item->afiliasi_litabmas }}</th>
                                            <th>{{ $item->thn_laks_litabmas }}</th>
                                            <th>{{ $item->judul_litabmas }}</th>

                                            <th>{{ $item->nidn }}</th>
                                            <th>{{ $item->nm_sdm }}</th>
                                            <th>{{ $item->nip }}</th>
                                            <th>{{ $item->pend_akhir }}</th>
                                            <th>{{ $item->tmpt_lahir .', '. $item->tgl_lahir}}</th>
                                            <th>{{ $item->keaktifan }}</th>
                                            <th>{{ $item->ikatan_kerja }}</th>
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

    <div class="row">
        <div class="col">
            <div class="card">
                <div class="card-header">
                    DOSEN QS100
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="table-responsive">
                            <table class="table table-striped table-responsive" style="width: 100%;">
                                <thead class="bg-info">
                                    <tr>
                                        <th scope="col">PT Sasaran</th>
                                        <th scope="col">Tgl. Mulai</th>
                                        <th scope="col">Tgl. Selesai</th>
                                        <th scope="col">Bidang</th>

                                        <th scope="col">Nidn/Nidk</th>
                                        <th scope="col">Nama</th>
                                        <th scope="col">Nip</th>
                                        <th scope="col">Pend. Akhir</th>
                                        <th scope="col">Tgl. Lahir</th>
                                        <th scope="col">Ikatan Kerja</th>
                                        <th scope="col">Keaktifan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($apiIku3Qs100 as $item)
                                        <tr>
                                            <th>{{ $item->perguruan_tinggi_sasaran }}</th>
                                            <th>{{ $item->tanggal_mulai }}</th>
                                            <th>{{ $item->tanggal_selesai }}</th>
                                            <th>{{ $item->bidang_tugas }}</th>

                                            <th>{{ $item->nidn }}</th>
                                            <th>{{ $item->nm_sdm }}</th>
                                            <th>{{ $item->nip }}</th>
                                            <th>{{ $item->pend_akhir }}</th>
                                            <th>{{ $item->tmpt_lahir .', '. $item->tgl_lahir}}</th>
                                            <th>{{ $item->keaktifan }}</th>
                                            <th>{{ $item->ikatan_kerja }}</th>
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
