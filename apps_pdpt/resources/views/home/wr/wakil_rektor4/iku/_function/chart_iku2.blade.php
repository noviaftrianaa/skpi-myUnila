
<script type="text/javascript">
        var dataIku2Mbkm = [];
        var dataIku2Prestasi = [];
        var drill = 1;
        var x_total_data = 0;
        var x_total_data_prestasi = 0;
        var x_total_data_yes_mbkm = 0;
        var x_total_data_prestasi_yes = 0;
        var x_total_data_no = 0;
        var x_total_data_a_mbkm = 0;
        var x_total_data_b_mbkm = 0;
        var h_total_data_capaian = 0;
        var h_total_data_gold = 0;

        $(document).ready(function() {
            $("#x_tb_01").show();
            $("#x_tb_02").hide();
            $("#x_tb_03").hide();
            $("#x_tb_04").hide();
            $("#x_tb_05").hide();
            Iku2MbkmData();
            Iku2PrestasiData();
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
            a_total_mbkm_non = (x_total_data_a_mbkm / x_total_data) * 50;
            b_total_mbkm_pertukaran = (x_total_data_b_mbkm / x_total_data) * 20;
            c_total_prestasi = (x_total_data_prestasi_yes / x_total_data_prestasi) * 30;
            h_total_data_capaian = (a_total_mbkm_non + b_total_mbkm_pertukaran + c_total_prestasi)
            h_total_data_gold = (h_total_data_capaian - standar);

            $('#standar').text(standar);
            $('#x_total_data1').text(x_total_data);
            $('#x_total_data2').text(x_total_data);
            $('#x_total_data_prestasi').text(x_total_data_prestasi);
            $('#x_total_data_a_mbkm').text(x_total_data_a_mbkm);
            $('#x_total_data_b_mbkm').text(x_total_data_b_mbkm);
            $('#x_total_data_yes_mbkm').text(x_total_data_yes_mbkm);
            $('#x_total_data_yes_prestasi').text(x_total_data_prestasi_yes);
            $('#x_total_data_no').text(x_total_data_no);
            $('#h_total_data_capaian').text(h_total_data_capaian.toFixed(2) + ' %');
            $('#h_total_data_gold').text(h_total_data_gold.toFixed(2) + ' %');
        }

        function filterIku2(ulang) {
            Iku2MbkmData(0);
            Iku2PrestasiData(1);
        }

        function Iku2MbkmData(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiIku2Mbkmv2') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku2Mbkm = res;
                Iku2MbkmFakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku2MbkmFakultas() {
            var y_id = [];
            var y_title = [];
            var x_data_yes_mbkm = [];
            var x_data_no = [];
            x_total_data_a_mbkm = 0;
            x_total_data_b_mbkm = 0;
            x_total_data = 0;
            x_total_data_yes_mbkm = 0;
            x_total_data_no = 0;
            $.each(dataIku2Mbkm, function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes_mbkm.push(value.DATA.x_data_yes_mbkm);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes_mbkm += value.DATA.x_data_yes_mbkm;
                x_total_data_no += value.DATA.x_data_no;
                x_total_data_a_mbkm += value.DATA.a_mbkm;
                x_total_data_b_mbkm += value.DATA.b_mbkm;
            });
            drill = 1;
            Iku2MbkmChartBar(y_title, x_data_yes_mbkm, x_data_no);
            $("#navChart").html(`<a href="javascript:" class="text-dark text-xl"><u>Unila</u></a> <a class="text-xl">/</a> <a class="text-xl">Fakultas</a>`);
        }

        function Iku2MbkmProdi(fak) {
            var y_id = [];
            var y_title = [];
            var x_data_yes_mbkm = [];
            var x_data_no = [];
            x_total_data_a_mbkm = 0;
            x_total_data_b_mbkm = 0;
            x_total_data = 0;
            x_total_data_yes_mbkm = 0;
            x_total_data_no = 0;
            $.each(dataIku2Mbkm[fak]['DRILL'], function(index, value) {
                y_id.push(value.DATA.y_id);
                y_title.push(value.DATA.y_title);
                x_data_yes_mbkm.push(value.DATA.x_data_yes_mbkm);
                x_data_no.push(value.DATA.x_data_no);
                x_total_data += value.DATA.x_data;
                x_total_data_yes_mbkm += value.DATA.x_data_yes_mbkm;
                x_total_data_no += value.DATA.x_data_no;
                x_total_data_a_mbkm += value.DATA.a_mbkm;
                x_total_data_b_mbkm += value.DATA.b_mbkm;
            });
            drill = 2;
            Iku2MbkmChartBar(y_title, x_data_yes_mbkm, x_data_no, fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark text-xl">Unila</a> <a class="text-xl">/</a> <a href="javascript:Iku2MbkmFakultas();" class="text-dark text-xl"><u>Fakultas</u></a> <a class="text-xl">/ Prodi</a>`
            );
        }

        function Iku2MbkmChartBar(y_title, x_data_yes_mbkm, x_data_no, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('Iku2MbkmChartBar', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'Kampus Merdeka'
                },
                xAxis: {
                    categories: y_title,
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'MBKM IKU 2'
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
                                        Iku2MbkmProdi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku2Mbkm[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>Kampus Merdeka</b><br>");
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku2Mbkm(id_prodi);
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
                    data: x_data_yes_mbkm,
                    color: '#2ECC40'
                }]
            });
            chart.setSize(null);
        }

        function TbIku2Mbkm(id_prodi) {
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
                    url: '{!! route('apiIku2MbkmTablev2') !!}',
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
                        title: 'SKS Konversi Non Pertukaran',
                        data: 'a_mbkm',
                        name: 'a_mbkm',
                    },
                    {
                        title: 'SKS Konversi Pertukaran',
                        data: 'b_mbkm',
                        name: 'b_mbkm',
                    },
                    {
                        title: 'Sesuai IKU 2',
                        data: 'x_data_yes_mbkm',
                        name: 'x_data_yes_mbkm',
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

        function Iku2PrestasiData(ulang) {
            $(".isLoading").show();
            $.ajax({
                type: 'GET',
                url: "{{ route('apiIku2Prestasiv2') }}",
                data: {
                    thn_iku: $("#thn_iku").val(),
                    is_ulang: ulang
                }
            }).done(function(res) {
                dataIku2Prestasi = res;
                Iku2PrestasiFakultas();
                $(".isLoading").hide();
            }).fail(function(res) {
                console.log(res);
                $(".isLoading").hide();
            });
        }

        function Iku2PrestasiFakultas() {
            var y_id_prestasi = [];
            var y_title_prestasi = [];
            var x_data_yes_prestasi = [];
            var x_data_no_prestasi = [];
            x_total_data_prestasi = 0;
            x_total_data_prestasi_yes = 0;
            x_total_data_prestasi_no = 0;
            $.each(dataIku2Prestasi, function(index, value) {
                y_id_prestasi.push(value.DATA.y_id);
                y_title_prestasi.push(value.DATA.y_title);
                x_data_yes_prestasi.push(value.DATA.x_data_yes_prestasi);
                x_data_no_prestasi.push(value.DATA.x_data_no);
                x_total_data_prestasi += value.DATA.x_data;
                x_total_data_prestasi_yes += value.DATA.x_data_yes_prestasi;
                x_total_data_prestasi_no += value.DATA.x_data_no;
            });
            drill = 1;
            Iku2PrestasiChartBar(y_title_prestasi, x_data_yes_prestasi, x_data_no_prestasi);
            $("#navChart").html(`<a href="javascript:" class="text-dark text-xl"><u>Unila</u></a> <a class="text-xl">/</a> <a class="text-xl">Fakultas</a>`);
        }

        function Iku2PrestasiProdi(fak) {
            var y_id_prestasi = [];
            var y_title_prestasi = [];
            var x_data_yes_prestasi = [];
            var x_data_no_prestasi = [];
            x_total_data_prestasi = 0;
            x_total_data_prestasi_yes = 0;
            x_total_data_prestasi_no = 0;
            $.each(dataIku2Prestasi[fak]['DRILL'], function(index, value) {
                y_id_prestasi.push(value.DATA.y_id);
                y_title_prestasi.push(value.DATA.y_title);
                x_data_yes_prestasi.push(value.DATA.x_data_yes_prestasi);
                x_data_no_prestasi.push(value.DATA.x_data_no);
                x_total_data_prestasi += value.DATA.x_data;
                x_total_data_prestasi_yes += value.DATA.x_data_yes_prestasi;
                x_total_data_prestasi_no += value.DATA.x_data_no;
            });
            drill = 2;
            Iku2PrestasiChartBar(y_title_prestasi, x_data_yes_prestasi, x_data_no_prestasi, fak);
            $("#navChart").html(
                `<a href="javascript:" class="text-dark text-xl">Unila</a> <a class="text-xl">/</a> <a href="javascript:Iku2PrestasiFakultas();" class="text-dark text-xl"><u>Fakultas</u></a> <a class="text-xl">/ Prodi</a>`
            );
        }

        function Iku2PrestasiChartBar(y_title_prestasi, x_data_yes_prestasi, x_data_no_prestasi, fak = null) {
            refreshTotal();
            var chart = Highcharts.chart('Iku2PrestasiChartBar', {
                chart: {
                    type: 'bar',
                    height: 700,
                },
                title: {
                    text: 'Prestasi'
                },
                xAxis: {
                    categories: y_title_prestasi,
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Prestasi IKU 2'
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
                                        Iku2PrestasiProdi(event.point.category);
                                    } else {
                                        let id_prodi = dataIku2Prestasi[fak]['DRILL'][event.point.category]['DATA'][
                                            'y_id'
                                        ];
                                        $("#txt1_modal").html(
                                            "<b>Prestasi</b><br>");
                                        $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                            .category + "<br>");
                                        if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                            $('#tb_01').DataTable().destroy();
                                        } else {
                                            TbIku2Prestasi(id_prodi);
                                        }
                                    }
                                }
                            }
                        },
                    }
                },
                series: [{
                    name: 'Tidak Memenuhi',
                    data: x_data_no_prestasi,
                    color: '#FF4136'
                }, {
                    name: 'Memenuhi',
                    data: x_data_yes_prestasi,
                    color: '#2ECC40'
                }]
            });
            chart.setSize(null);
        }

        function TbIku2Prestasi(id_prodi) {
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
                    url: '{!! route('apiIku2PrestasiTablev2') !!}',
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
                        title: 'Total Prestasi',
                        data: 'x_prestasi',
                        name: 'x_prestasi',
                    },
                    {
                        title: 'Sesuai IKU 2',
                        data: 'x_data_yes_prestasi',
                        name: 'x_data_yes_prestasi',
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

    </script>
