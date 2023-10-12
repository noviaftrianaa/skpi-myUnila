<script type="text/javascript">
    let dataIku7 = [],
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
        Iku7Data();
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

    function Iku7Data(ulang) {
        $(".isLoading").show();
        $.ajax({
            type: 'GET',
            url: "{{ route('apiDashboardIku7v2') }}",
            data: {
                thn_iku: $("#thn_iku").val(),
                is_ulang: ulang
            }
        }).done(function(res) {
            dataIku7 = res;
            Iku7Fakultas();
            $(".isLoading").hide();
        }).fail(function(res) {
            console.log(res);
            $(".isLoading").hide();
        });
    }

    function Iku7Fakultas() {
        let y_id = [],
            y_title = [],
            x_data_yes = [],
            x_data_no = [];
        x_total_data = 0;
        x_total_data_yes = 0;
        x_total_data_no = 0;
        $.each(dataIku7, function(index, value) {
            y_id.push(value.DATA.y_id);
            y_title.push(value.DATA.y_title);
            x_data_yes.push(value.DATA.x_data_yes);
            x_data_no.push(value.DATA.x_data_no);
            x_total_data += value.DATA.x_data;
            x_total_data_yes += value.DATA.x_data_yes;
            x_total_data_no += value.DATA.x_data_no;
        });
        drill = 1;
        Iku7Chart(y_title, x_data_yes, x_data_no);
        $("#navChart").html(`<a href="javascript:" class="text-dark">UNILA</a> / FAKULTAS`);
    }

    function Iku7Prodi(fak) {
        let y_id = [],
            y_title = [],
            x_data_yes = [],
            x_data_no = [];
        x_total_data = 0;
        x_total_data_yes = 0;
        x_total_data_no = 0;
        $.each(dataIku7[fak]['DRILL'], function(index, value) {
            y_id.push(value.DATA.y_id);
            y_title.push(value.DATA.y_title);
            x_data_yes.push(value.DATA.x_data_yes);
            x_data_no.push(value.DATA.x_data_no);
            x_total_data += value.DATA.x_data;
            x_total_data_yes += value.DATA.x_data_yes;
            x_total_data_no += value.DATA.x_data_no;
        });
        drill = 2;
        Iku7Chart(y_title, x_data_yes, x_data_no, fak);
        $("#navChart").html(
            `<a href="javascript:" class="text-dark">UNILA</a> / <a href="javascript:Iku7Fakultas();" class="text-dark">FAKULTAS</a> / PRODI`
        );
    }

    function Iku7Chart(y_title, x_data_yes, x_data_no, fak = null) {
        refreshTotal();
        var chart = Highcharts.chart('Iku7ChartBar', {
            chart: {
                type: 'bar',
                height: 700,
            },
            title: {
                text: 'IKU 7: Kelas yang Kolaboratif dan Partisipatif'
            },
            xAxis: {
                categories: y_title
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Dosen IKU 7'
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
                                    Iku7Prodi(event.point.category);
                                } else {
                                    let id_prodi = dataIku7[fak]['DRILL'][event.point.category]['DATA'][
                                        'y_id'
                                    ];
                                    $("#txt1_modal").html(
                                        "<b>IKU 7: KELAS YANG KOLABORATIF DAN PARTISIPATIF</b><br>"
                                    );
                                    $("#txt2_modal").html("FAKULTAS " + fak + " - Prodi " + event.point
                                        .category + "<br>");
                                    if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                                        $('#tb_01').DataTable().destroy();
                                    } else {
                                        TbIku7Matkul(id_prodi);
                                    }
                                }
                            }
                        }
                    },
                }
            },
            series: [{
                name: 'Mata Kuliah Tidak Memenuhi',
                data: x_data_no,
                color: '#FF4136'
            }, {
                name: 'Mata Kuliah Memenuhi',
                data: x_data_yes,
                color: '#2ECC40'
            }]
        });
        chart.setSize(null);
    }

    function TbIku7Matkul(id_prodi){
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
                url: '{!! route('apiIku7Matkulv2') !!}',
                type: 'GET',
                data: {
                    id_prodi: id_prodi,
                    thn_iku: $("#thn_iku").val(),
                }
            },
            columns: [
                {
                            title: 'No',
                            data: 'y_id_mk',
                            name: 'y_id_mk',
                            render: function(data, type, row, meta) {
                                return meta.row + meta.settings._iDisplayStart + 1;
                            }
                },
                {
                    title: 'Kode MK',
                    data: 'kode_mk',
                    name: 'kode_mk',
                }, {
                    title: 'Nama MK',
                    data: 'l_nm_mk',
                    name: 'l_nm_mk',
                }, {
                    title: 'SKS MK',
                    data: 'l_sks_mk',
                    name: 'l_sks_mk',
                },
                {
                    title: 'Sesuai IKU 7',
                    data: 'x_data_yes',
                    name: 'x_data_yes',
                    render: function(data, type, row) {
                        if (data > 0) {
                            return "<center><b class='text-bold text-green'>Ya</b></center>";
                        } else {
                            return "<center><b class='text-bold text-danger'>Tidak</b></center>";
                        }
                    }
                },
            ],
            order: [
                [0, 'desc']
            ],
        });
    }
</script>
