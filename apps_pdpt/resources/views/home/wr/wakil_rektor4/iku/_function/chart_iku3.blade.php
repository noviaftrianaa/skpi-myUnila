<script type="text/javascript">
    let dataIku3 = [],
        drill = 1,
        x_total_data = 0,
        x_total_data_yes = 0,
        x_total_data_no = 0,
        h_total_data_capaian = 0,
        h_total_data_gold = 0;

    $(document).ready(function() {
        $("#x_tb_01").show();
        $("#x_tb_02").hide();
        $("#x_tb_03").hide();
        $("#x_tb_04").hide();
        $("#x_tb_05").hide();
        Iku3Data();
    });

    $("#btn_modal_back").click(function() {
        $("#btn_modal_close").show();
        $("#btn_modal_back").hide();
        $("#txt3_modal").html("");
        $("#x_tb_01").show();
        $("#x_tb_02").hide();
        $("#x_tb_03").hide();
        $("#x_tb_04").hide();
        $("#x_tb_05").hide();
    });

    function refreshTotal() {
        let standar = 20;
        h_total_data_capaian = (x_total_data_yes / x_total_data) * 100;
        h_total_data_gold = (h_total_data_capaian - standar);
        $('#x_total_data1').text(x_total_data);
        $('#x_total_data2').text(x_total_data);
        $('#x_total_data_yes').text(x_total_data_yes);
        $('#x_total_data_no').text(x_total_data_no);
        $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + ' %');
        $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + ' %');
    }

    function Iku3Data(ulang) {
        $(".isLoading").show();
        $.ajax({
            type: 'GET',
            url: "{{ route('apiDashboardIku3v2') }}",
            data: {
                thn_iku: $("#thn_iku").val(),
                is_ulang: ulang
            }
        }).done(function(res) {
            dataIku3 = res;
            Iku3Fakultas();
            $(".isLoading").hide();
        }).fail(function(res) {
            console.log(res);
            $(".isLoading").hide();
        });
    }

    function Iku3Fakultas() {
        let y_id = [],
            y_title = [],
            x_data_yes = [],
            x_data_no = [];
        x_total_data = 0;
        x_total_data_yes = 0;
        x_total_data_no = 0;
        $.each(dataIku3, function(index, value) {
            y_id.push(value.DATA.y_id);
            y_title.push(value.DATA.y_title);
            x_data_yes.push(value.DATA.x_data_yes);
            x_data_no.push(value.DATA.x_data_no);
            x_total_data += value.DATA.x_data;
            x_total_data_yes += value.DATA.x_data_yes;
            x_total_data_no += value.DATA.x_data_no;
        });
        drill = 1;
        Iku3Chart(y_title, x_data_yes, x_data_no);
        $("#navChart").html(`<a href="javascript:" class="text-dark">UNILA</a> / FAKULTAS`);
    }

    function Iku3Prodi(fak) {
        let y_id = [],
            y_title = [],
            x_data_yes = [],
            x_data_no = [];
        x_total_data = 0;
        x_total_data_yes = 0;
        x_total_data_no = 0;
        $.each(dataIku3[fak]['DRILL'], function(index, value) {
            y_id.push(value.DATA.y_id);
            y_title.push(value.DATA.y_title);
            x_data_yes.push(value.DATA.x_data_yes);
            x_data_no.push(value.DATA.x_data_no);
            x_total_data += value.DATA.x_data;
            x_total_data_yes += value.DATA.x_data_yes;
            x_total_data_no += value.DATA.x_data_no;
        });
        drill = 2;
        Iku3Chart(y_title, x_data_yes, x_data_no, fak);
        $("#navChart").html(
            `<a href="javascript:" class="text-dark">UNILA</a> / <a href="javascript:Iku3Fakultas();" class="text-dark">FAKULTAS</a> / PRODI`
        );
    }

    function Iku3Chart(y_title, x_data_yes, x_data_no, fak = null) {
        refreshTotal();
        var chart = Highcharts.chart('Iku3ChartBar', {
            chart: {
                type: 'bar',
                height: 700,
            },
            title: {
                text: 'IKU 3 : Dosen Berkegiatan di Luar Kampus'
            },
            xAxis: {
                categories: y_title
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Dosen IKU 3'
                }
            },
            legend: {
                reversed: true
            },
            plotOptions: {
                series: {
                    stacking: 'percent',
                    dataLabels: {
                        enabled: true
                    },
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function(event) {
                                if (drill == 1) {
                                    Iku3Prodi(event.point.category);
                                } else {
                                    let id_prodi = dataIku3[fak]['DRILL'][event.point.category]['DATA'][
                                        'y_id'
                                    ];
                                    $("#txt1_modal").html(
                                        "<b>IKU 3 : DOSEN BERKEGIATAN DILUAR KAMPUS</b><br>");
                                    $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                        .category + "<br>");
                                    if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                        $('#tb_01').DataTable().destroy();
                                    } else {
                                        TbIku3Dosen(id_prodi);
                                    }
                                }
                            }
                        }
                    },
                }
            },
            series: [{
                name: 'Tidak Memenuhi',
                data: x_data_no,
                color: '#FF4136'
            }, {
                name: 'Memenuhi',
                data: x_data_yes,
                color: '#2ECC40'
            }]
        });
        chart.setSize(null);
    }

    function reloadTbIku3Tridharma(id_sdm, nm_sdm, nidn) {
        $("#btn_modal_close").hide();
        $("#btn_modal_back").show();
        $("#txt3_modal").html("TRIDHARMA - " + nm_sdm + " - " + nidn);
        $("#x_tb_01").hide();
        $("#x_tb_02").show();
        $("#x_tb_03").hide();
        $("#x_tb_04").hide();
        $("#x_tb_05").hide();
        if ($.fn.dataTable.isDataTable($('#tb_02'))) {
            $('#tb_02').DataTable().destroy();
            TbIku3Tridharma(id_sdm, nm_sdm, nidn);
        } else {
            TbIku3Tridharma(id_sdm, nm_sdm, nidn);
        }
    }

    function reloadTbIku3Qs100(id_sdm, nm_sdm, nidn) {
        $("#btn_modal_close").hide();
        $("#btn_modal_back").show();
        $("#txt3_modal").html("Qs100 - " + nm_sdm + " - " + nidn);
        $("#x_tb_01").hide();
        $("#x_tb_02").hide();
        $("#x_tb_03").show();
        $("#x_tb_04").hide();
        $("#x_tb_05").hide();
        if ($.fn.dataTable.isDataTable($('#tb_03'))) {
            $('#tb_03').DataTable().destroy();
            TbIku3Qs100(id_sdm, nm_sdm, nidn);
        } else {
            TbIku3Qs100(id_sdm, nm_sdm, nidn);
        }
    }

    function reloadTbIku3Praktisi(id_sdm, nm_sdm, nidn) {
        $("#btn_modal_close").hide();
        $("#btn_modal_back").show();
        $("#txt3_modal").html("Praktisi - " + nm_sdm + " - " + nidn);
        $("#x_tb_01").hide();
        $("#x_tb_02").hide();
        $("#x_tb_03").hide();
        $("#x_tb_04").show();
        $("#x_tb_05").hide();
        if ($.fn.dataTable.isDataTable($('#tb_04'))) {
            $('#tb_04').DataTable().destroy();
            TbIku3Praktisi(id_sdm, nm_sdm, nidn);
        } else {
            TbIku3Praktisi(id_sdm, nm_sdm, nidn);
        }
    }

    function reloadTbIku3Prestasi(id_sdm, nm_sdm, nidn) {
        $("#btn_modal_close").hide();
        $("#btn_modal_back").show();
        $("#txt3_modal").html("Prestasi - " + nm_sdm + " - " + nidn);
        $("#x_tb_01").hide();
        $("#x_tb_02").hide();
        $("#x_tb_03").hide();
        $("#x_tb_04").hide();
        $("#x_tb_05").show();
        if ($.fn.dataTable.isDataTable($('#tb_05'))) {
            $('#tb_05').DataTable().destroy();
            TbIku3Prestasi(id_sdm, nm_sdm, nidn);
        } else {
            TbIku3Prestasi(id_sdm, nm_sdm, nidn);
        }
    }

    function TbIku3Dosen(id_prodi) {
        $("#btn_modal_close").show();
        $("#btn_modal_back").hide();
        $('#exampleModal').modal('show');
        $('#tb_01').DataTable({
            processing: true,
            serverSide: true,
            responsive: true,
            searching: true,
            paging: true,
            info: true,
            ordering: true,
            ajax: {
                url: '{!! route('apiIku3Dosenv2') !!}',
                type: 'GET',
                data: {
                    id_prodi: id_prodi,
                    thn_iku: $("#thn_iku").val(),
                }
            },
            columns: [{
                    title: '#',
                    render: function(data, type, row) {
                        if (row.l_tridharma > 0 || row.l_qs100 > 0 || row.l_praktisi > 0 || row
                            .l_prestasi > 0) {
                            return "<center><b class='text-bold text-green'>Y</b></center>";
                        } else {
                            return "<center><b class='text-bold text-red'>T</b></center>";
                        }
                    }
                },
                {
                    title: 'Nama Dosen',
                    data: 'nm_sdm',
                    name: 'nm_sdm',
                }, {
                    title: 'JK',
                    data: 'jk',
                    name: 'jk',
                },{
                    title: 'No. Induk',
                    data: 'l_nidn',
                    name: 'l_nidn',
                },
                {
                    title: 'Pend. Akhir',
                    data: 'pend_akhir',
                    name: 'pend_akhir',
                },
                {
                    title: 'Ikatan',
                    data: 'ikatan_kerja',
                    name: 'ikatan_kerja',
                },
                {
                    title: 'Keaktifan',
                    data: 'keaktifan',
                    name: 'keaktifan',
                },
                {
                    title: 'Tridharma',
                    data: 'l_tridharma',
                    name: 'l_tridharma',
                    render: function(data, type, row) {
                        return `<a href="javascript:" onclick="reloadTbIku3Tridharma('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                    }
                },
                {
                    title: 'QS100',
                    data: 'l_qs100',
                    name: 'l_qs100',
                    render: function(data, type, row) {
                        return `<a href="javascript:" onclick="reloadTbIku3Qs100('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                    }
                },
                {
                    title: 'Praktisi',
                    data: 'l_praktisi',
                    name: 'l_praktisi',
                    render: function(data, type, row) {
                        return `<a href="javascript:" onclick="reloadTbIku3Praktisi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                    }
                },
                {
                    title: 'Membina',
                    data: 'l_prestasi',
                    name: 'l_prestasi',
                    render: function(data, type, row) {
                        return `<a href="javascript:" onclick="reloadTbIku3Prestasi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                    }
                }
            ],
            order: [
                [7, 'desc'],
                [8, 'desc'],
                [9, 'desc'],
                [10, 'desc'],
            ],
        });
    }

    function TbIku3Tridharma(id_sdm, nm_sdm, nidn) {
        $('#tb_02').DataTable({
            processing: true,
            serverSide: true,
            responsive: true,
            searching: true,
            paging: true,
            info: true,
            ordering: true,
            ajax: {
                url: '{!! route('apiIku3Tridharmav2') !!}',
                type: 'GET',
                data: {
                    id_sdm: id_sdm,
                    thn_iku: $("#thn_iku").val(),
                }
            },
            columns: [{
                    title: 'Jenis',
                    data: 'jns_litabmas',
                    name: 'jns_litabmas',
                }, {
                    title: 'Peran',
                    data: 'peran_litabmas',
                    name: 'peran_litabmas',
                }, {
                    title: 'Afiliasi',
                    data: 'afiliasi_litabmas',
                    name: 'afiliasi_litabmas',
                },
                {
                    title: 'Judul',
                    data: 'judul_litabmas',
                    name: 'judul_litabmas',
                },
                {
                    title: 'Tahun Laks.',
                    data: 'thn_laks_litabmas',
                    name: 'thn_laks_litabmas',
                }
            ],
        });
    }

    function TbIku3Qs100(id_sdm, nm_sdm, nidn) {
        $('#tb_03').DataTable({
            processing: true,
            serverSide: true,
            responsive: true,
            searching: true,
            paging: true,
            info: true,
            ordering: true,
            ajax: {
                url: '{!! route('apiIku3Qs100v2') !!}',
                type: 'GET',
                data: {
                    id_sdm: id_sdm,
                    thn_iku: $("#thn_iku").val(),
                }
            },
            columns: [{
                    title: 'Bidang',
                    data: 'bid_tgs',
                    name: 'bid_tgs',
                }, {
                    title: 'SP Sumber',
                    data: 'sp_sumber',
                    name: 'sp_sumber',
                }, {
                    title: 'SP Sasaran',
                    data: 'sp_sasaran',
                    name: 'sp_sasaran',
                },
                {
                    title: 'Tgl. Mulai',
                    data: 'tgl_mulai',
                    name: 'tgl_mulai',
                }
            ],
        });
    }

    function TbIku3Praktisi(id_sdm, nm_sdm, nidn) {
        $('#tb_04').DataTable({
            processing: true,
            serverSide: true,
            responsive: true,
            searching: true,
            paging: true,
            info: true,
            ordering: true,
            ajax: {
                url: '{!! route('apiIku3Praktisiv2') !!}',
                type: 'GET',
                data: {
                    id_sdm: id_sdm,
                    thn_iku: $("#thn_iku").val(),
                }
            },
            columns: [{
                    title: 'Bidang',
                    data: 'bid_pekerjaan',
                    name: 'bid_pekerjaan',
                }, {
                    title: 'Jabatan',
                    data: 'nm_jabatan',
                    name: 'nm_jabatan',
                }, {
                    title: 'Instansi',
                    data: 'instansi',
                    name: 'instansi',
                },
                {
                    title: 'Mulai Kerja',
                    data: 'mulai_bekerja',
                    name: 'mulai_bekerja',
                },
                {
                    title: 'Selesai Kerja',
                    data: 'selesai_bekerja',
                    name: 'selesai_bekerja',
                }
            ],
        });
    }

    function TbIku3Prestasi(id_sdm, nm_sdm, nidn) {
        $('#tb_05').DataTable({
            processing: true,
            serverSide: true,
            responsive: true,
            searching: true,
            paging: true,
            info: true,
            ordering: true,
            ajax: {
                url: '{!! route('apiIku3Prestasiv2') !!}',
                type: 'GET',
                data: {
                    id_sdm: id_sdm,
                    thn_iku: $("#thn_iku").val(),
                }
            },
            columns: [{
                    title: 'Nama',
                    data: 'nm_pd',
                    name: 'nm_pd',
                }, {
                    title: 'JK',
                    data: 'jk',
                    name: 'jk',
                }, {
                    title: 'NPM',
                    data: 'nipd',
                    name: 'nipd',
                },
                {
                    title: 'Tgl. Lahir',
                    data: 'tgl_lahir',
                    name: 'tgl_lahir',
                },
                {
                    title: 'Prodi',
                    data: 'nm_prodi',
                    name: 'nm_prodi',
                },
                {
                    title: 'Jurusan',
                    data: 'nm_jur',
                    name: 'nm_jur',
                },
                {
                    title: 'Fakultas',
                    data: 'nm_fak',
                    name: 'nm_fak',
                },
                {
                    title: 'Jns Prestasi',
                    data: 'nm_jenis_prestasi',
                    name: 'nm_jenis_prestasi',
                },
                {
                    title: 'Nm Prestasi',
                    data: 'nm_prestasi',
                    name: 'nm_prestasi',
                },
                {
                    title: 'Penyelenggara',
                    data: 'penyelenggara',
                    name: 'penyelenggara',
                },
                {
                    title: 'Peringkat',
                    data: 'peringkat',
                    name: 'peringkat',
                },
                {
                    title: 'Thn Prestasi',
                    data: 'thn_prestasi',
                    name: 'thn_prestasi',
                },
            ],
        });
    }
</script>
