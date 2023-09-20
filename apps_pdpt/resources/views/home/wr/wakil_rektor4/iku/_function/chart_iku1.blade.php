
<script type="text/javascript">
        var dataIku1 = [];
        var drill = 1;
        var x_total_data = 0;
        var x_total_data_alumni = 0;
        var x_total_data_yes = 0;
        var x_total_data_no = 0;
        var x_total_data_tdk_krj = 0;
        var x_total_data_krj = 0;
        var x_total_data_usaha = 0;
        var x_total_data_lanstud = 0;
        var h_total_data_capaian = 0;
        var h_total_data_gold = 0;

        $(document).ready(function() {
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            Iku1Data();
            Iku1TotalAlumni();
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

        function DownloadIku1(){
            var thn_iku = $("#thn_iku").val();
            var url = "{{ route('downloadIku1') }}?thn_iku="+thn_iku;
            location.href = url;
        }

        function refreshTotal() {
            let standar = 60;
            h_total_data_capaian = (x_total_data_yes / x_total_data) * 100;
            h_total_data_gold = (h_total_data_capaian - standar);
            $('#standar').text(standar);
            $('#x_total_data').text(x_total_data);
            $('#x_total_data_alumni').text(x_total_data_alumni);
            $('#x_total_data_yes').text(x_total_data_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + ' %');
            $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + ' %');
        }

        function Iku1Data(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiDashboardIku1') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku1 = res;
                Iku1Fakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        // function DownloadIku1(){
        //     $(".isLoading").show();
        //     $.ajax({
        //         type: 'GET',
        //         url: "{{ route('downloadIku1') }}",
        //         data: {
        //             thn_iku: $("#thn_iku").val()
        //         }
        //     }).done(function(res) {
        //         var url = window.URL || window.webkitURL;
        //         var objectUrl = url.createObjectURL(res);
        //         window.open(objectUrl);
        //         Iku1Fakultas();
        //         $(".isLoading").hide();
        //     }).fail(function(res) {
        //         console.log(res);
        //         $(".isLoading").hide();
        //     });
        // }

        function Iku1TotalAlumni(fak) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiTotalAlumni') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    id_fak: fak
                }
            }).done(function(res) {
                x_total_data_alumni = res;
                $('#x_total_data_alumni').text(x_total_data_alumni);
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku1Fakultas() {
            var y_id = [];
            var y_title = [];
            var x_data_yes = [];
            var x_data_no = [];
            x_total_data_tdk_krj = 0;
            x_total_data_krj = 0;
            x_total_data_usaha = 0;
            x_total_data_lanstud = 0;
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            $.each(dataIku1, function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
                x_total_data_tdk_krj += value.DATA.l_tdk_krj;
                x_total_data_krj += value.DATA.l_krj;
                x_total_data_usaha += value.DATA.l_usaha;
                x_total_data_lanstud += value.DATA.l_lanstud;
            });
            drill = 1;
            Iku1ChartBar(y_title, x_data_yes, x_data_no);
            Iku1TotalAlumni();
            $("#navChart").html(`<a href="javascript:" class="text-dark text-xl"><u>Unila</u></a> <a class="text-xl">/</a> <a class="text-xl">Fakultas</a>`);
        }

        function Iku1Prodi(fak) {
            var y_id = [];
            var y_title = [];
            var x_data_yes = [];
            var x_data_no = [];
            x_total_data = 0;
            x_total_data_yes = 0;
            x_total_data_no = 0;
            x_total_data_tdk_krj = 0;
            x_total_data_krj = 0;
            x_total_data_usaha = 0;
            x_total_data_lanstud = 0;
            $.each(dataIku1[fak]['DRILL'], function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes.push(value.DATA.x_data_yes);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes += value.DATA.x_data_yes;
                x_total_data_no += value.DATA.x_data_no;
                x_total_data_tdk_krj += value.DATA.l_tdk_krj;
                x_total_data_krj += value.DATA.l_krj;
                x_total_data_usaha += value.DATA.l_usaha;
                x_total_data_lanstud += value.DATA.l_lanstud;
            });
            drill = 2;
            Iku1ChartBar(y_title, x_data_yes, x_data_no, fak);
            Iku1TotalAlumni(fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark text-xl">Unila</a> <a class="text-xl">/</a> <a href="javascript:Iku1Fakultas();" class="text-dark text-xl"><u>Fakultas</u></a> <a class="text-xl">/ Prodi</a>`
            );
        }

        function Iku1ChartBar(y_title, x_data_yes, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('Iku1ChartBar', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'IKU 1 : Lulusan Mendapat Pekerjaan yang Layak'
                },
                xAxis: {
                    categories: y_title,
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Alumni IKU 1'
                    },
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
                                        Iku1Prodi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku1[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>IKU 1 : Lulusan Mendapat Pekerjaan yang Layak</b><br>");
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku1Alumni(id_prodi);
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

        function TbIku1Alumni(id_prodi) {
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
                    url: '{!! route('apiIku1Alumni') !!}',
                    type: 'GET',
                    data: {
                        id_prodi: id_prodi,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [
                    {
                            title: 'No',
                            data: 'id_reg_pd',
                            name: 'id_reg_pd',
                            render: function(data, type, row, meta) {
                                return meta.row + meta.settings._iDisplayStart + 1;
                            }
                        },
                    {
                        title: 'NPM',
                        data: 'nipd',
                        name: 'nipd',
                    },
                    {
                        title: 'Nama Alumni',
                        data: 'nm_pd',
                        name: 'nm_pd',
                    },
                    {
                        title: 'Tgl. Lulus',
                        data: 'tgl_keluar',
                        name: 'tgl_keluar',
                    },
                    {
                        title: 'Status Lulus',
                        data: 'l_stat_lulus',
                        name: 'l_stat_lulus',
                        render: function(data, type, row) {
                            p_nm_pd = "Status " + data + " - " + row.nm_pd + " - " + row.nipd;
                            if (data == "Bekerja" || data == "Berwirausaha") {
                                return `<a href="#" onclick="reloadTbIku1Bekerja('${row.id_reg_pd}','${p_nm_pd}')">${data}</a>`;
                            }
                            if (data == "Melanjutkan Studi") {
                                return `<a href="#" onclick="reloadTbIku1LanjutStudi('${row.id_reg_pd}','${p_nm_pd}')">${data}</a>`;
                            }
                            if (data == "Tidak Bekerja") {
                                return data;
                            }
                        }
                    },
                    {
                        title: '<= 12 bulan',
                        data: 'kerja_or_study_12_bln',
                        name: 'kerja_or_study_12_bln',
                    },
                    {
                        title: 'Pendapatan',
                        data: 'income_per_bln',
                        name: 'income_per_bln',
                    },
                    {
                        title: 'Provinsi',
                        data: 'provinsi',
                        name: 'provinsi',
                    },
                    {
                        title: '1,2 UMP',
                        data: 'satu_koma_dua_ump',
                        name: 'satu_koma_dua_ump',
                    },
                    {
                        title: 'Sesuai IKU 1',
                        data: 'x_data_yes',
                        name: 'x_data_yes',
                        render: function(data, type, row) {
                            if (data == 1) {
                                return "<center><b class='text-bold text-green'>Ya</b></center>";
                            } else {
                                return "<center><b class='text-bold text-red'>Tidak</b></center>";
                            }
                        }
                    },
                ],
                order: [
                    [0, 'desc'],
                ],
            });
        }

        function reloadTbIku1Bekerja(id_reg_pd, p_nm_pd = null) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html(p_nm_pd);
            $("#x_tb_01").hide();
            $("#x_tb_02").show();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_02'))) {
                $('#tb_02').DataTable().destroy();
                TbIku1Bekerja(id_reg_pd);
            } else {
                TbIku1Bekerja(id_reg_pd);
            }
        }

        function reloadTbIku1LanjutStudi(id_reg_pd, p_nm_pd = null) {
            $("#btn_modal_close").hide();
            $("#btn_modal_back").show();
            $("#txt3_modal").html(p_nm_pd);
            $("#x_tb_01").hide();
            $("#x_tb_02").hide();
            $("#x_tb_03").show();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            if ($.fn.dataTable.isDataTable($('#tb_03'))) {
                $('#tb_03').DataTable().destroy();
                TbIku1LanjutStudi(id_reg_pd);
            } else {
                TbIku1LanjutStudi(id_reg_pd);
            }
        }

        function TbIku1Bekerja(id_reg_pd) {
            $('#tb_02').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku1Bekerja') !!}',
                    type: 'GET',
                    data: {
                        id_reg_pd: id_reg_pd,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Wkt. Pengisian',
                        data: 'wkt_pengisian',
                        name: 'wkt_pengisian',
                    },
                    {
                        title: 'Apakah Kerja/Berwirausaha Sebelum Lulus?',
                        data: 'kerja_sblm_lulus',
                        name: 'kerja_sblm_lulus',
                    },
                    {
                        title: 'Wkt. Tunggu',
                        data: 'wkt_tunggu',
                        name: 'wkt_tunggu',
                    },
                    {
                        title: 'Jns. Pekerjaan',
                        data: 'jns_tmpt_bekerja',
                        name: 'jns_tmpt_bekerja',
                    },
                    {
                        title: 'Bid. Pekerjaan',
                        data: 'nm_bid_kerja',
                        name: 'nm_bid_kerja',
                    },
                    {
                        title: 'Tmpt. Bekerja',
                        data: 'nm_tmpt_bekerja',
                        name: 'nm_tmpt_bekerja',
                    },
                    {
                        title: 'Jabatan',
                        data: 'status_jabatan',
                        name: 'status_jabatan',
                    },
                    {
                        title: 'Wilayah Kerja',
                        data: 'nm_wil',
                        name: 'nm_wil',
                    },
                    {
                        title: 'UMR Wilayah',
                        data: 'besaran_umr',
                        name: 'besaran_umr',
                    },
                    {
                        title: 'Pendapatan (Bulan)',
                        data: 'income_per_bln',
                        name: 'income_per_bln',
                    },
                ],
            });
        }

        function TbIku1LanjutStudi(id_reg_pd){
            $('#tb_03').DataTable({
                processing: true,
                serverSide: true,
                responsive: true,
                searching: true,
                paging: true,
                info: true,
                ordering: true,
                ajax: {
                    url: '{!! route('apiIku1LanjutStudi') !!}',
                    type: 'GET',
                    data: {
                        id_reg_pd: id_reg_pd,
                        thn_iku: $("#thn_iku").val(),
                    }
                },
                columns: [{
                        title: 'Wkt. Pengisian',
                        data: 'wkt_pengisian',
                        name: 'wkt_pengisian',
                    },
                    {
                        title: 'Tgl. Lulus',
                        data: 'tgl_keluar',
                        name: 'tgl_keluar',
                    },
                    {
                        title: 'Tgl. Masuk',
                        data: 'wkt_masuk',
                        name: 'wkt_masuk',
                    },
                    {
                        title: 'PT Lanjut',
                        data: 'nm_pt_lnjt',
                        name: 'nm_pt_lnjt',
                    },
                    {
                        title: 'Prodi Lanjut',
                        data: 'nm_prodi_lnjt',
                        name: 'nm_prodi_lnjt',
                    },
                ],
            });
        }
    </script>
