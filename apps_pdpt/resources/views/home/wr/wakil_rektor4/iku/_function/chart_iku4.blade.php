<script type="text/javascript">
        let dataIku4 = [],
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
            Iku4Data();
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
            let standar = 40;
            h_total_data_capaian = (x_total_data_yes / x_total_data) * 100;
            h_total_data_gold = (h_total_data_capaian - standar);
            $('#x_total_data1').text(x_total_data);
            $('#x_total_data2').text(x_total_data);
            $('#x_total_data_yes').text(x_total_data_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + '%');
            $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + '%');
        }

        function Iku4Data(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiDashboardIku4v2') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku4 = res;
                Iku4Fakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku4Fakultas() {
            let y_id = [],
                y_title = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku4, function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 1;
            Iku4Chart(y_title, x_data_yes, x_data_no);
            $("#navChart").html(`<a href="javascript:" class="text-dark">UNILA</a> / FAKULTAS`);
        }

        function Iku4Prodi(fak) {
            let y_id = [],
                y_title = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku4[fak]['DRILL'], function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 2;
            Iku4Chart(y_title, x_data_yes, x_data_no, fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark">UNILA</a> / <a href="javascript:Iku4Fakultas();" class="text-dark">FAKULTAS</a> / PRODI`
            );
        }

        function Iku4Chart(y_title, x_data_yes, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('Iku4ChartBar', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'IKU 4: Praktisi Mengajar di Dalam Kampus'
                },
                xAxis: {
                    categories: y_title
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Dosen IKU 4'
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
                                        Iku4Prodi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku4[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>IKU 4 : DOSEN BERKEGIATAN DILUAR KAMPUS</b><br>");
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku4Dosen(id_prodi);
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

        function reloadTbIku4Pendidikan(id_sdm, nm_sdm, nidn) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html("Pendidikan - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").show();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_02'))) {
                $('#tb_02').DataTable().destroy();
                TbIku4Pendidikan(id_sdm, nm_sdm, nidn);
            } else {
                TbIku4Pendidikan(id_sdm, nm_sdm, nidn);
            }
        }

        function reloadTbIku4Sertifikasi(id_sdm, nm_sdm, nidn) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html("Sertifikasi - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").show();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_03'))) {
                $('#tb_03').DataTable().destroy();
                TbIku4Sertifikasi(id_sdm, nm_sdm, nidn);
            } else {
                TbIku4Sertifikasi(id_sdm, nm_sdm, nidn);
            }
        }

        function reloadTbIku4Praktisi(id_sdm, nm_sdm, nidn) {
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
                TbIku4Praktisi(id_sdm, nm_sdm, nidn);
            } else {
                TbIku4Praktisi(id_sdm, nm_sdm, nidn);
            }
        }

        function TbIku4Dosen(id_prodi) {
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
                    url: '{!! route('apiIku4Dosenv2') !!}',
                    type: 'GET',
                    data: {
                        id_prodi: id_prodi,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [
                    {
                            title: 'No',
                            data: 'id_sdm',
                            name: 'id_sdm',
                            render: function(data, type, row, meta) {
                                return meta.row + meta.settings._iDisplayStart + 1;
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
                    }, {
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
                        title: 'Pend. S3',
                        data: 'l_pend',
                        name: 'l_pend',
                        render: function(data, type, row) {
                            return `<a href="javascript:" onclick="reloadTbIku4Pendidikan('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Sertifikasi',
                        data: 'l_sert',
                        name: 'l_sert',
                        render: function(data, type, row) {
                            return `<a href="javascript:" onclick="reloadTbIku4Sertifikasi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Praktisi',
                        data: 'l_praktisi',
                        name: 'l_praktisi',
                        render: function(data, type, row) {
                            return `<a href="javascript:" onclick="reloadTbIku4Praktisi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Sesuai IKU 3',
                        render: function(data, type, row) {
                            x_yes = "<center><b class='text-bold text-red'>Tidak</b></center>";
                            if (row.l_pend > 0 || row.l_nidn == 'NIDK') {
                                x_yes = "<center><b class='text-bold text-green'>Ya</b></center>";
                            } else {
                                if (row.l_sert > 0 || row.l_praktisi > 0) {
                                    x_yes = "<center><b class='text-bold text-green'>Ya</b></center>";
                                }
                            }
                            return x_yes;
                        }
                    },
                ],
                order: [
                    [7, 'desc'],
                    [8, 'desc'],
                    [9, 'desc']
                ],
            });
        }

        function TbIku4Pendidikan(id_sdm, nm_sdm, nidn) {
            $('#tb_02').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku4Pendidikanv2') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Nama SP',
                        data: 'nm_sp_formal',
                        name: 'nm_sp_formal',
                    }, {
                        title: 'Bidang Studi',
                        data: 'bid_studi',
                        name: 'bid_studi',
                    }, {
                        title: 'Thn. Masuk',
                        data: 'thn_masuk',
                        name: 'thn_masuk',
                    },
                    {
                        title: 'Thn. Lulus',
                        data: 'thn_lulus',
                        name: 'thn_lulus',
                    },
                ],
            });
        }

        function TbIku4Sertifikasi(id_sdm, nm_sdm, nidn) {
            $('#tb_03').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku4Sertifikasiv2') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [
                    {
                        title: 'Tahun Sertifikasi',
                        data: 'Tahun Sertifikasi',
                        name: 'Tahun Sertifikasi',
                    },
                    {
                        title: 'Jenis Sertifikasi',
                        data: 'Jenis Sertifikasi',
                        name: 'Jenis Sertifikasi',
                    },
                    {
                        title: 'SK',
                        data: 'sk_sert',
                        name: 'sk_sert',
                    },
                ],
            });
        }

        function TbIku4Praktisi(id_sdm, nm_sdm, nidn) {
            $('#tb_04').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku4Praktisiv2') !!}',
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
                    },
                ],
            });
        }
    </script>
