@push('css')
<link rel="stylesheet" href="{{ asset('assets/vendor/libs/apex-charts/apex-charts.css') }}" />
@endpush

@push('js')
<script src="{{ asset('assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
<script type="text/javascript">
    'use strict';
    function setOptions(typeChart,title,subtitle,data,kategori,title_kategori,target,isHorizontal=false) {
        $('#'+target).html(null);
        var options = {
            chart: {
                height: '400',
                type: typeChart,
                stacked: false
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#000']
                },
                offsetY: isHorizontal ? 0 : -20,
                offsetX: isHorizontal ? 30 : 0,
            },
            title: {
                text: title,
                align: "center"
            },
            subtitle: {
                text: subtitle,
                align: "center"
            },
            series: [
                {
                    name: 'Total',
                    data: data
                }
            ],
            plotOptions: {
                bar: {
                    horizontal: isHorizontal,
                    dataLabels: {
                        position: isHorizontal ? 'top' : 'top',
                    }
                },
            },
            xaxis: {
                categories: kategori,
                labels: {
                    rotate: 0
                }
            },
            xaxis: {
                categories: kategori,
                labels: {
                    rotate: 0
                }
            },
            tooltip: {
                shared: false,
                intersect: true,
                x: {
                    show: true
                }
            },
            legend: {
                horizontalAlign: "center",
                offsetX: 40
            },
        };
        var chart = new ApexCharts(document.querySelector("#"+target), options);
        return chart.render();
    }

    function dosen() {
        $.ajax({
            url: "{{ route('pages-infografis-dosen') }}",
            type: "GET",
            data: {
                tahun: $('#selectTahunDosen').val()
            },
            success: function(res) {
                console.log(res);
                var dosen_nomor_induk = res['total_dosen'];
                var dosen_jabfung = res['total_dosen_jabfung'];
                var dosen_fakultas = res['total_dosen_fakultas'];
                var data_dosen_nomor_induk = [];
                var data_dosen_jabfung = [];
                var data_dosen_fakultas = [];
                var kategori_dosen_nomor_induk = [];
                var kategori_dosen_jabfung = [];
                var kategori_dosen_fakultas = [];
                $.each(JSON.parse(dosen_nomor_induk),function (i, k) {
                    data_dosen_nomor_induk.push(
                        parseInt(k)
                    );
                    kategori_dosen_nomor_induk.push(i);
                });
                $.each(JSON.parse(dosen_jabfung),function (i, k) {
                    data_dosen_jabfung.push(
                        parseInt(k)
                    );
                    kategori_dosen_jabfung.push(i);
                });
                $.each(JSON.parse(dosen_fakultas),function (i, k) {
                    data_dosen_fakultas.push(
                        parseInt(k.total)
                    );
                    kategori_dosen_fakultas.push(k.nm_lemb.split(" "));
                });
                setOptions('bar','Sebaran Dosen','berdasarkan Nomor Induk',data_dosen_nomor_induk,kategori_dosen_nomor_induk,'','dosen',false);
                setOptions('bar','Sebaran Dosen','berdasarkan Jabatan Fungsional',data_dosen_jabfung,kategori_dosen_jabfung,'','dosen_jabfung',false);
                setOptions('bar','Sebaran Dosen','berdasarkan Fakultas',data_dosen_fakultas,kategori_dosen_fakultas,'','total_dosen',false);
            }
        });
    }

    function mahasiswa() {
        $.ajax({
            url: "{{ route('pages-infografis-mahasiswa') }}",
            type: "GET",
            data: {
                tahun: $('#selectTahunMahasiswa').val()
            },
            success: function(res) {
                var total_mhs_fakultas = res['total_mhs_fakultas'];
                var total_mhs_jenjang = res['total_mhs_jenjang'];
                var data_mhs_fakultas = [];
                var data_mhs_jenjang = [];
                var kategori_mhs_fakultas = [];
                var kategori_mhs_jenjang = [];
                $.each(JSON.parse(total_mhs_fakultas),function (i, k) {
                    data_mhs_fakultas.push(
                        parseInt(k.total)
                    );
                    kategori_mhs_fakultas.push(k.nm_lemb);
                });

                $.each(JSON.parse(total_mhs_jenjang),function (i, k) {
                    data_mhs_jenjang.push(
                        parseInt(k.total)
                    );
                    kategori_mhs_jenjang.push(k.nm_jenj_didik);
                });
                setOptions('bar','Sebaran Mahasiswa','berdasarkan Fakultas',data_mhs_fakultas,kategori_mhs_fakultas,'','total_mhs_fakultas',true);
                setOptions('bar','Sebaran Mahasiswa','berdasarkan Jenjang Pendidikan',data_mhs_jenjang,kategori_mhs_jenjang,'','total_mhs_jenjang',true);
            }
        });
    }

    function pubHaki() {
        $.ajax({
            url: "{{ route('pages-infografis-pubHaki') }}",
            type: "GET",
            data: {
                tahun: $('#selectTahunPubHaki').val()
            },
            success: function(res) {
                var total_publikasi = res['publikasi'];
                var total_haki = res['haki'];
                var data_publikasi = [];
                var data_haki = [];
                var kategori_publikasi = [];
                var kategori_haki = [];
                $.each(JSON.parse(total_publikasi),function (i, k) {
                    data_publikasi.push(
                        parseInt(k.total)
                    );
                    kategori_publikasi.push(k.nm_lemb);
                });

                $.each(JSON.parse(total_haki),function (i, k) {
                    data_haki.push(
                        parseInt(k.total)
                    );
                    kategori_haki.push(k.nm_lemb);
                });
                setOptions('bar','Sebaran Publikasi','berdasarkan Fakultas',data_publikasi,kategori_publikasi,'','publikasi',true);
                setOptions('bar','Sebaran HAKI','berdasarkan Fakultas',data_haki,kategori_haki,'','haki',true);
            }
        });
    }

    function litabmas() {
        $.ajax({
            url: "{{ route('pages-infografis-litabmas') }}",
            type: "GET",
            data: {
                tahun: $('#selectTahunLitabmas').val()
            },
            success: function(res) {
                var total_penelitian = res['penelitian'];
                var total_pengabdian = res['pengabdian'];
                var data_penelitian = [];
                var data_pengabdian = [];
                var kategori_penelitian = [];
                var kategori_pengabdian = [];
                $.each(JSON.parse(total_penelitian),function (i, k) {
                    data_penelitian.push(
                        parseInt(k.total)
                    );
                    kategori_penelitian.push(k.nm_lemb);
                });

                $.each(JSON.parse(total_pengabdian),function (i, k) {
                    data_pengabdian.push(
                        parseInt(k.total)
                    );
                    kategori_pengabdian.push(k.nm_lemb);
                });
                setOptions('bar','Sebaran Penelitian','berdasarkan Fakultas',data_penelitian,kategori_penelitian,'','penelitian',true);
                setOptions('bar','Sebaran Pengabdian','berdasarkan Fakultas',data_pengabdian,kategori_pengabdian,'','pengabdian',true);
            }
        });
    }

    $(document).ready( function () {
        dosen();
        mahasiswa();
        pubHaki();
        litabmas();

        $('#selectTahunDosen').change(function() {
            dosen();
        });
        $('#selectTahunMahasiswa').change(function() {
            mahasiswa();
        });
        $('#selectTahunPubHaki').change(function() {
            pubHaki();
        });
        $('#selectTahunLitabmas').change(function() {
            litabmas();
        });
    });
</script>
@endpush
