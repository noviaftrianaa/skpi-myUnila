<script>
    $(function() {
        // Initialize Select2
        $('.select2').select2();


        // Chart variable
        let chart;

        let fakultas_id
        let dosenTable, mahasiswaTable = null;

        $('#detail-modal-label').text("Data Mahasiswa dan Dosen");

        function reloadDetailTables() {
            if (dosenTable) {
                dosenTable.ajax.reload(null, false);
            }
            if (mahasiswaTable) {
                mahasiswaTable.ajax.reload(null, false);
            }
        }

        // Function to render chart
        const renderChart = (data, title, subtitle) => {
            chart = Highcharts.chart('chart-container', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: title
                },
                subtitle: {
                    text: subtitle
                },
                xAxis: {
                    type: 'category',
                    labels: {
                        rotation: -45,
                        style: {
                            fontSize: '13px',
                            fontFamily: 'Verdana, sans-serif'
                        }
                    },
                    categories: data.categories
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Jumlah'
                    }
                },
                legend: {
                    enabled: true
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.y}</b>'
                },
                series: data
            });
        };

        // Function to load chart data
        const loadChartData = (tahun_ajaran, fakultas_id = null) => {
            let url = fakultas_id ? `/main/rasio/prodi/${fakultas_id}?tahun_ajaran=${tahun_ajaran}` :
                "{{ route('rasio.data') }}?tahun_ajaran=" + tahun_ajaran;

            $.ajax({
                url: url,
                method: 'GET',
                success: function(response) {

                    renderChart(response.series, response.title, response.subtitle);

                    if (fakultas_id) {
                        $('#detail-modal-label').text(
                            response.fakultas ?
                            `Data Mahasiswa dan Dosen ${response.fakultas}` :
                            'Data Mahasiswa dan Dosen'
                        );
                        $('#fakultas-select-container').hide();
                        $('#container-btn-back').show()

                    } else {
                        modalTitle = null;
                        $('#fakultas-select-container').show();
                        $('#container-btn-back').hide()

                    }
                }
            });
        };

        // Initial chart load
        loadChartData($('#tahun-ajaran-filter').val());

        // Event listener for tahun ajaran filter
        $('#tahun-ajaran-filter').on('change', function() {
            loadChartData($(this).val(), fakultas_id ? fakultas_id : null);
            reloadDetailTables();
        });

        $('#container-btn-back').click(function() {
            fakultas_id = null;
            modalTitle = null;
            $('.select2').val(null).trigger('change');

            $('#detail-modal-label').text("Data Mahasiswa dan Dosen");
            loadChartData($('#tahun-ajaran-filter').val());
            reloadDetailTables();
        });

        // Event listener for fakultas filter for drilldown
        $('#fakultas-filter').on('change', function() {
            modalTitle = null
            fakultas_id = $(this).val();
            $('#detail-modal-label').text("Data Mahasiswa dan Dosen");
            if (fakultas_id) {
                loadChartData($('#tahun-ajaran-filter').val(), fakultas_id);
                reloadDetailTables();

            }
        });

        $('#detail-modal').on('shown.bs.modal', function() {

            if (!dosenTable) {
                dosenTable = $('#table-dosen').DataTable({
                    processing: true,
                    serverSide: true,
                    ajax: {
                        url: "{{ route('rasio.dosen.datatable') }}",
                        data: function(d) {
                            d.fakultas_id = fakultas_id;
                            d.id_thn_ajaran = $('#tahun-ajaran-filter').val();
                        }
                    },
                    columns: [{
                            data: 'DT_RowIndex',
                            orderable: false,
                            searchable: false
                        },
                        {
                            data: 'nama_dosen'
                        },
                        {
                            data: 'nip'
                        },
                        {
                            data: 'fakultas'
                        },
                        {
                            data: 'prodi'
                        },
                    ]
                });
            }

            if (!mahasiswaTable) {
                mahasiswaTable = $('#table-mahasiswa').DataTable({
                    processing: true,
                    serverSide: true,
                    ajax: {
                        url: "{{ route('rasio.mahasiswa.datatable') }}",
                        data: function(d) {
                            d.fakultas_id = fakultas_id;
                            d.id_thn_ajaran = $('#tahun-ajaran-filter').val();
                        }
                    },
                    columns: [{
                            data: 'DT_RowIndex',
                            orderable: false,
                            searchable: false
                        },
                        {
                            data: 'nama_mahasiswa'
                        },
                        {
                            data: 'npm'
                        },
                        {
                            data: 'fakultas'
                        },
                        {
                            data: 'prodi'
                        },
                    ]
                });
            }

            // Fix width tab + modal
            setTimeout(() => {
                dosenTable.columns.adjust();
                mahasiswaTable.columns.adjust();
            }, 200);
        });

        $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function() {
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
        });

    });
</script>
