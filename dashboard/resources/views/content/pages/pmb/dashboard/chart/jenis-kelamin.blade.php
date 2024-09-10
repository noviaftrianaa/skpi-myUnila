<script type="text/javascript">
    function renderJenisKelaminChart(data) {
        const numericTotals = data.jenis_kelamin.total.map(Number);
        const randomColors = generateRandomColors(data.jenis_kelamin.categories.length);

        if (window.chartJenisKelamin) {
            window.chartJenisKelamin.updateOptions({
                labels: data.jenis_kelamin.categories,
                series: numericTotals
            });
        } else {
            var optionsJenisKelamin = {
                chart: {
                    type: 'pie',
                    height: 400,
                    toolbar: {
                        show: true,
                        tools: {
                            download: true,
                            selection: false,
                            zoom: false,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: false,
                        },
                        export: {
                            csv: {
                                filename: 'jenis_kelamin',
                                columnDelimiter: ',',
                                headerCategory: 'Kategori',
                                headerValue: 'Total',
                            },
                            svg: {
                                filename: 'jenis_kelamin'
                            },
                            png: {
                                filename: 'jenis_kelamin'
                            }
                        }
                    },
                },
                title: {
                    text: 'Jenis Kelamin Pendaftar',
                    align: "center",
                    floating: false,
                    offsetY: 0
                },
                labels: data.jenis_kelamin.categories,
                series: numericTotals,
                colors: randomColors,
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center'
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val + " peserta";
                        }
                    }
                },
                responsive: [{
                    breakpoint: 600,
                    options: {
                        chart: {
                            height: 400,
                            offsetY: 0
                        },
                        legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                            offsetY: 0,
                        }
                    }
                }]
            };

            window.chartJenisKelamin = new ApexCharts(document.querySelector("#chart-jenis-kelamin"), optionsJenisKelamin);
            window.chartJenisKelamin.render();
        }
    }
    </script>
