@extends('template_public.default',['judul_layout'=>$judul_layout,'side_active'=>$side_active])

@include('__partial.select2')
@include('__partial.datatable_yajra')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-sm-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Status Akreditasi PT</h3>
                    </div>
                    <div class="card-body">
                        <img src="{{ asset('asset/logo/logo_unila.png') }}" alt="logo_unila"
                            class="img-thumbnail rounded mx-auto d-block" width="200px">
                        <br>
                        <table class="table table-striped">
                            <tbody>
                                {!! tableRow('Nama PT', $sp->first->nm_lemb) !!}
                                {!! tableRow('Kode PT', $sp->first->npsn) !!}
                                {!! tableRow('Status Akreditasi', $sp->first->nm_akred) !!}
                                {!! tableRow('SK Akreditasi', $sp->first->sk_akred_sp) !!}
                                {!! tableRow('Tanggal SK Akreditasi', tglIndonesia($sp->first->tgl_sk_akred_sp)) !!}
                                {!! tableRow('Expired SK Akreditasi', 'sampai <spap class="text-danger">' . tglIndonesia($sp->first->tst_sk_akred_sp) . '</span>') !!}
                            </tbody>
                        </table>

                        <table class="tg table-striped">
                            <thead>
                                <tr>
                                    <th class="tg-c3ow">No SK</th>
                                    <th class="tg-c3ow">Akreditasi</th>
                                    <th class="tg-c3ow" colspan="2">Masa Berlaku</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach ($sp->all as $value)
                                    <tr>
                                        <td class="tg-0pky">{{ $value->sk_akred_sp }}</td>
                                        <td class="tg-0pky">{{ $value->nm_akred }}</td>
                                        <td class="tg-0pky">{{ tglIndonesia($value->tgl_sk_akred_sp) }}</td>
                                        <td class="tg-0pky">{{ tglIndonesia($value->tst_sk_akred_sp) }}</td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="col-sm-6">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Akreditasi Prodi</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6 col-sm-6 col-12">
                                <div class="info-box shadow-lg">
                                    <span class="info-box-icon bg-success"><i class="far fa-check-square"></i></span>
                                    <div class="info-box-content">
                                        <span class="info-box-text">Terakreditasi</span>
                                        <span class="info-box-number">{{ $total['sudah'] . ' Prodi' }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 col-sm-6 col-12">
                                <div class="info-box shadow-lg">
                                    <span class="info-box-icon bg-danger"><i class="far fa-square"></i></span>
                                    <div class="info-box-content">
                                        <span class="info-box-text">Belum Terakreditasi</span>
                                        <span class="info-box-number">{{ $total['belum'] . ' Prodi' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="akreditasi_prodi"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12">
                <div class="card">
                    <div class="card-header">Daftar Akreditasi Program Studi di Universitas Lampung</div>
                    <div class="card-body">
                        <div class="alert alert-info">
                            Data terakhir diambil pada tanggal: {{ tglWaktuIndonesia($last_sync->last_sync) }}
                        </div>
                        <ul class="nav nav-pills nav-fill" id="pills-tab" role="tablist">
                            @foreach ($list_akreditasi as $key_akred => $each_akred)
                                <li class="nav-item" role="presentation">
                                    <a class="nav-link{{ $key_akred == 0 ? ' active' : '' }}"
                                        id="akreditasi_{{ $key_akred }}_tab" data-toggle="pill"
                                        href="#akreditasi_{{ $key_akred }}"
                                        role="tab">{{ $each_akred == 'Tidak ada akreditasi' ? $each_akred : 'Akreditasi ' . $each_akred }}</a>
                                </li>
                            @endforeach
                        </ul>
                        <hr>
                        <div class="tab-content" id="pills-tabContent">
                            @foreach ($list_akreditasi as $key_akreditasi => $each_akreditasi)
                                <?php
                                    $data_akred_prodi = DB::SELECT(
                                        "
                                            SELECT
                                                tprodi.id_sms,
                                                CONCAT(tprodi.nm_lemb,' (',tjenj.nm_jenj_didik,')') AS asal_prodi,
                                                tn.nm_akred,
                                                tprodi.stat_prodi,
                                                takred.sk_akreditasi_prodi,
                                                takred.tanggal_sk_akreditasi_prodi,
                                                takred.tst_sk_akreditasi_prodi,
                                                tl.total_prodi
                                            FROM pdrd.sms AS tprodi
                                            JOIN ref.jenjang_pendidikan AS tjenj ON tjenj.id_jenj_didik=tprodi.id_jenj_didik
                                            LEFT JOIN (
                                                SELECT id_sms, MAX(tst_sk_akreditasi_prodi) AS max_tst FROM pdrd.akreditasi_prodi
                                                WHERE soft_delete=0
                                                GROUP BY id_sms
                                            ) AS tap ON tap.id_sms=tprodi.id_sms
                                            LEFT JOIN pdrd.akreditasi_prodi AS takred ON takred.id_sms=tprodi.id_sms AND takred.soft_delete=0
                                                AND takred.tst_sk_akreditasi_prodi=tap.max_tst
                                            LEFT JOIN ref.nilai_akred AS tn ON tn.id_akred=takred.id_akred
                                            LEFT JOIN (
                                                SELECT tr.id_sms, COUNT(tsdm.id_sdm) AS total_prodi FROM pdrd.sdm AS tsdm
                                                JOIN pdrd.reg_ptk AS tr ON tr.id_sdm=tsdm.id_sdm AND tr.soft_delete=0
                                                    AND (tr.tgl_ptk_keluar IS NULL AND tr.tgl_ptk_keluar>GETDATE())
                                                JOIN pdrd.keaktifan_ptk AS tak ON tak.id_reg_ptk=tr.id_reg_ptk
                                                AND tak.soft_delete=0
                                                AND tak.id_thn_ajaran=2021
                                                GROUP BY tr.id_sms
                                            ) AS tl ON tl.id_sms=tprodi.id_sms
                                            WHERE tprodi.id_jenj_didik = 30
                                            AND tprodi.soft_delete=0
                                            AND tprodi.id_jns_sms=3
                                            AND tprodi.stat_prodi='A'
                                            AND tn.nm_akred " .
                                            ($key_akreditasi == 0 ? 'IS NULL' : "='" . $each_akreditasi . "'") .
                                            "
                                                ORDER BY takred.tst_sk_akreditasi_prodi ASC
                                        ",
                                    );
                                ?>

                                <div class="tab-pane fade{{ $key_akreditasi == 0 ? ' show active' : '' }}"
                                    id="akreditasi_{{ $key_akreditasi }}" role="tabpanel"
                                    aria-labelledby="akreditasi_{{ $key_akreditasi }}_tab">
                                    <div class="table-responsive">
                                        <table class="table table-hover table-striped table-data">
                                            <thead>
                                                <tr>
                                                    <th>No</th>
                                                    <th>Nama Program Studi</th>
                                                    <th>Status</th>
                                                    <th>SK Akreditasi</th>
                                                    <th>Tanggal Akreditasi</th>
                                                    <th>Waktu Expired</th>
                                                    <th>Akreditasi</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @foreach ($data_akred_prodi as $no_data => $each_data_akred)
                                                    <tr>
                                                        <td>{{ $no_data + 1 }}</td>
                                                        <td>{{ $each_data_akred->asal_prodi }}</td>
                                                        <td>{{ config('mp.data_master.stat_prodi.'.$each_data_akred->stat_prodi) }}</td>
                                                        <td>{{ $each_data_akred->sk_akreditasi_prodi }}</td>
                                                        <td>{{ $each_data_akred->tanggal_sk_akreditasi_prodi }}</td>
                                                        <td>{{ $each_data_akred->tst_sk_akreditasi_prodi }}</td>
                                                        <td>{{ $each_data_akred->nm_akred }}</td>
                                                        <td style="text-align: center;">
                                                            <button type="button" class="btn btn-primary"
                                                                onclick="window.location='{{ route('akreditasi_prodi.detail_prodi', Crypt::encrypt($each_data_akred->id_sms)) }}'">Detail</button>
                                                        </td>
                                                    </tr>
                                                @endforeach
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            @endforeach
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
            var akred = {!! $akred !!};
            var data_akred = [];
            var kategori_akred = [];
            $.each(akred, function(i, k) {
                kategori_akred.push(i);
                data_akred.push([
                    i, parseInt(k)
                ]);
            });
            chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'akreditasi_prodi',
                    type: 'column',
                    backgroundColor: 'rgba(0,0,0,0)'
                },
                title: {
                    text: 'Sebaran Akreditasi Program Studi',
                    style: {
                        color: "#ffffff"
                    }
                },
                xAxis: {
                    categories: kategori_akred,
                    crosshair: true,
                    title: {
                        text: 'Akreditasi Prodi'
                    },
                    labels: {
                        overflow: 'justify',
                        style: {
                            width: '80px',
                            color: '#FFFFFF'
                        },
                        groupedOptions: [{
                            rotation: 0, // rotate labels for a 2nd-level
                            align: 'center',
                            style: {
                                color: 'red', // set red font for labels in 1st-Level
                            }
                        }, {
                            rotation: -45, // rotate labels for a 2nd-level
                        }],
                        rotation: -45, // 0-level options aren't changed, use them as always
                        align: 'right',
                    },
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Jumlah Prodi'
                    }
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y} Program Studi</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    },
                    series: {
                        borderWidth: 0,
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    itemWidth: 220
                },
                series: [{
                    name: 'Total Prodi',
                    data: data_akred
                }],
                credits: {
                    enabled: false
                }
            });
        });
    </script>
@endpush
