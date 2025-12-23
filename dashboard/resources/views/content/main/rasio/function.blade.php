<script>
    $(function() {
        // Initialize Select2
        $('.select2').select2();

        // Chart variable
        let chart;

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
                series: data.series
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
                    let title = fakultas_id ? `Rasio Mahasiswa dan Dosen Program Studi` :
                        'Rasio Mahasiswa dan Dosen Fakultas';
                    let subtitle = `Tahun Ajaran ${tahun_ajaran}`;
                    renderChart(response, title, subtitle);

                    if (fakultas_id) {
                        $('#fakultas-select-container').hide();
                    } else {
                        $('#fakultas-select-container').show();
                    }
                }
            });
        };

        // Initial chart load
        loadChartData($('#tahun-ajaran-filter').val());

        // Event listener for tahun ajaran filter
        $('#tahun-ajaran-filter').on('change', function() {
            loadChartData($(this).val());
        });

        // Event listener for fakultas filter for drilldown
        $('#fakultas-filter').on('change', function() {
            let fakultas_id = $(this).val();
            if (fakultas_id) {
                loadChartData($('#tahun-ajaran-filter').val(), fakultas_id);
            }
        });

        // Datatables
        const dosenTable = $('#table-dosen').DataTable({
            processing: true,
            serverSide: true,
            ajax: "{{ route('rasio.dosen.datatable') }}",
            columns: [{
                    data: 'DT_RowIndex',
                    name: 'DT_RowIndex',
                    orderable: false,
                    searchable: false
                },
                {
                    data: 'nama_dosen',
                    name: 'nama_dosen'
                },
                {
                    data: 'nip',
                    name: 'nip'
                },
                {
                    data: 'fakultas',
                    name: 'fakultas'
                },
            ]
        });

        const mahasiswaTable = $('#table-mahasiswa').DataTable({
            processing: true,
            serverSide: true,
            ajax: "{{ route('rasio.mahasiswa.datatable') }}",
            columns: [{
                    data: 'DT_RowIndex',
                    name: 'DT_RowIndex',
                    orderable: false,
                    searchable: false
                },
                {
                    data: 'nama_mahasiswa',
                    name: 'nama_mahasiswa'
                },
                {
                    data: 'npm',
                    name: 'npm'
                },
                {
                    data: 'fakultas',
                    name: 'fakultas'
                },
                {
                    data: 'prodi',
                    name: 'prodi'
                },
            ]
        });

        // Redraw tables on tab shown
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            $($.fn.dataTable.tables(true)).DataTable()
                .columns.adjust();
        });

    });
</script>
