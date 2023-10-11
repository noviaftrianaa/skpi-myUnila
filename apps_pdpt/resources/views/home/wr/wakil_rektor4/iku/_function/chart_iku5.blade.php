<script type="text/javascript">
        let dataIku5 = [],
            drill = 1,
            x_total_data = 0,
            h_total_data = 0,
            x_total_data_yes = 0,
            x_total_data_no = 0,
            x_total_data_keluaran_publikasi = 0,
            x_total_data_keluaran_pengabdian = 0,
            h_total_data_capaian = 0,
            h_total_data_gold = 0;

        $(document).ready(function() {
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            Iku5Data();
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
            let standar = 50;
            h_total_data_publikasi_pengabdian = x_total_data_keluaran_publikasi + x_total_data_keluaran_pengabdian;
            h_total_data_capaian = (h_total_data_publikasi_pengabdian / x_total_data) * 100;
            h_total_data_gold = (h_total_data_capaian - standar);
            $('#x_total_data1').text(x_total_data);
            $('#x_total_data2').text(x_total_data);
            $('#h_total_data_publikasi_pengabdian').text(h_total_data_publikasi_pengabdian);
            $('#x_total_data_keluaran_publikasi').text(x_total_data_keluaran_publikasi);
            $('#x_total_data_keluaran_pengabdian').text(x_total_data_keluaran_pengabdian);
            $('#x_total_data_yes').text(x_total_data_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + '%');
            $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + '%');
        }

        function Iku5Data(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiDashboardIku5v2') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku5 = res;
                Iku5Fakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku5Fakultas() {
            let y_id = [],
                y_title = [],
                x_data_keluaran_publikasi = [],
                x_data_keluaran_pengabdian = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_keluaran_publikasi = 0;
            x_total_data_keluaran_pengabdian = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku5, function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_keluaran_publikasi.push(value.DATA.l_publikasi);
                x_data_keluaran_pengabdian.push(value.DATA.l_pengabdian);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_keluaran_publikasi += value.DATA.l_publikasi;
                x_total_data_keluaran_pengabdian += value.DATA.l_pengabdian;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 1;
            Iku5Chart(y_title, x_data_keluaran_publikasi, x_data_keluaran_pengabdian, x_data_yes, x_data_no);
            $("#navChart").html(`<a href="javascript:" class="text-dark">UNILA</a> / FAKULTAS`);
        }

        function Iku5Prodi(fak) {
            let y_id = [],
                y_title = [],
                x_data_keluaran_publikasi = [],
                x_data_keluaran_pengabdian = [],
                x_data_yes = [],
                x_data_no = [];
            x_total_data = 0;
            x_total_data_keluaran_publikasi = 0;
            x_total_data_keluaran_pengabdian = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku5[fak]['DRILL'], function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_keluaran_publikasi.push(value.DATA.l_publikasi);
                x_data_keluaran_pengabdian.push(value.DATA.l_pengabdian);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_keluaran_publikasi += value.DATA.l_publikasi;
                x_total_data_keluaran_pengabdian += value.DATA.l_pengabdian;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
            });
            drill = 2;
            Iku5Chart(y_title, x_data_keluaran_publikasi, x_data_keluaran_pengabdian, x_data_yes, x_data_no, fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark">UNILA</a> / <a href="javascript:Iku5Fakultas();" class="text-dark">FAKULTAS</a> / PRODI`
            );
        }

        function Iku5Chart(y_title, x_data_keluaran_publikasi, x_data_keluaran_pengabdian, x_data_yes, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('Iku5ChartBar', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'IKU 5: Hasil Kerja Dosen Digunakan Oleh Masyarakat Atau Mendapat Rekognisi Internasional'
                },
                xAxis: {
                    categories: y_title
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Dosen IKU 5'
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
                                        Iku5Prodi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku5[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>IKU 5: HASIL KERJA DOSEN DIGUNAKAN OLEH MASYARAKAT ATAU MENDAPAT REKOGNISI INTERNASIONAL</b><br>"
                                        );
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku5Dosen(id_prodi);
                                        }
                                    }
                                }
                            }
                        },
                    }
                },
                series: [{
                    name: 'Jumlah Dosen Tidak Memenuhi',
                    data: x_data_no,
                    color: '#FF4136'
                }, {
                    name: 'Jumlah Dosen Memenuhi',
                    data: x_data_yes,
                    color: '#2ECC40'
                },
                // {
                //     name: 'Jumlah Keluaran Penelitian',
                //     data: x_data_keluaran_publikasi,
                //     color: '#4f7bff'
                // }
            ]
            });
            chart.setSize(null);
        }

        function TbIku5Dosen(id_prodi) {
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
                    url: '{!! route('apiIku5Dosenv2') !!}',
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
                        title: 'Publikasi',
                        data: 'l_publikasi',
                        name: 'l_publikasi',
                        render: function(data, type, row) {
                            return `<a href="javascript:" onclick="reloadTbIku4KeluaranPublikasi('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Pengabdian',
                        data: 'l_pengabdian',
                        name: 'l_pengabdian',
                        render: function(data, type, row) {
                            return `<a href="javascript:" onclick="reloadTbIku4KeluaranPengabdian('${row.id_sdm}','${row.nm_sdm}','${row.nidn}')">${data}</a>`;
                        }
                    },
                    {
                        title: 'Sesuai IKU 5',
                        render: function(data, type, row) {
                            if (row.l_publikasi > 0) {
                                return "<center><b class='text-bold text-green'>Ya</b></center>";
                            } else {
                                return "<center><b class='text-bold text-danger'>Tidak</b></center>";
                            }
                        }
                    },
                ],
                order: [
                    [7, 'desc']
                ],
            });
        }

        function reloadTbIku4KeluaranPublikasi(id_sdm, nm_sdm, nidn) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html("Keluaran Publikasi - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").show();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_02'))) {
                $('#tb_02').DataTable().destroy();
                TbIku5KeluaranPublikasi(id_sdm, nm_sdm, nidn);
            } else {
                TbIku5KeluaranPublikasi(id_sdm, nm_sdm, nidn);
            }
        }

        function reloadTbIku4KeluaranPengabdian(id_sdm, nm_sdm, nidn) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html("Keluaran Pengabdian - " + nm_sdm + " - " + nidn);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").show();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_03'))) {
                $('#tb_03').DataTable().destroy();
                TbIku5KeluaranPengabdian(id_sdm, nm_sdm, nidn);
            } else {
                TbIku5KeluaranPengabdian(id_sdm, nm_sdm, nidn);
            }
        }

        function TbIku5KeluaranPublikasi(id_sdm) {
            $('#tb_02').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku5KeluaranPublikasiv2') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Jenis Litabmas',
                        data: 'nm_jns_pub',
                        name: 'nm_jns_pub',
                    },
                   {
                        title: 'Judul',
                        data: 'judul',
                        name: 'judul',
                    },
                    {
                        title: 'Tanggal Terbit',
                        data: 'tgl_terbit',
                        name: 'tgl_terbit',
                    },
                    {
                        title: 'Peran Tulis',
                        data: 'peran_tulis',
                        name: 'peran_tulis',
                    },
                    {
                        title: 'URL',
                        data: 'url',
                        name: 'url',
                        render: function(data, type, row) {
                            if(data != null){
                                return  `<a href="${data}" target="_blank">Link</a>`;
                            } else {
                                return '-';
                            }
                        }
                    },
                ],
            });
        }

        function TbIku5KeluaranPengabdian(id_sdm) {
            $('#tb_03').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku5KeluaranPengabdianv2') !!}',
                    type: 'GET',
                    data: {
                        id_sdm: id_sdm,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [
                    {
                        title: 'Tahun Anggaran',
                        data: 'TA',
                        name: 'TA',
                    },
                    {
                        title: 'Jenis Litabmas',
                        data: 'Jenis Litabmas',
                        name: 'Jenis Litabmas',
                    },
                   {
                        title: 'Judul Litabmas',
                        data: 'judul_litabmas',
                        name: 'judul_litabmas',
                    },
                   {
                        title: 'Bidang',
                        data: 'Bidang',
                        name: 'Bidang',
                    },
                    {
                        title: 'Tanggal Terbit',
                        data: 'Tanggal Terbit',
                        name: 'Tanggal Terbit',
                    },
                    {
                        title: 'URL',
                        data: 'url',
                        name: 'url',
                        render: function(data, type, row) {
                            if(data != null){
                                return  `<a href="${data}" target="_blank">Link</a>`;
                            } else {
                                return '-';
                            }
                        }
                    },
                ],
            });
        }
    </script>
