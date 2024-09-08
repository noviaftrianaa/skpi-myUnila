<script type="text/javascript">
    function renderJenisPendaftaranChart(data) {
        const numericTotals = data.jenis_pendaftaran.total.map(Number);
        const randomColors = generateRandomColors(data.jenis_pendaftaran.categories.length);

        if (window.chartJenisPendaftaran) {
            window.chartJenisPendaftaran.updateOptions({
                labels: data.jenis_pendaftaran.categories,
                series: numericTotals
            });
        } else {
            var optionsJenisPendaftaran = {
                chart: {
                    type: 'donut',
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
                                filename: 'jenis_pendaftaran',
                                columnDelimiter: ',',
                                headerCategory: 'Kategori',
                                headerValue: 'Total',
                            },
                            svg: {
                                filename: 'jenis_pendaftaran'
                            },
                            png: {
                                filename: 'jenis_pendaftaran'
                            }
                        }
                    },
                },
                title: {
                    text: 'Jenis Pendaftaran',
                    align: "center",
                    floating: false,
                    offsetY: 0
                },
                labels: data.jenis_pendaftaran.categories,
                series: numericTotals,
                colors: randomColors,
                legend: {
                    position: 'right',
                    horizontalAlign: 'center',
                    floating: false,
                    offsetY: 70,
                    onItemClick: {
                        toggleDataSeries: true,
                    },
                    onItemHover: {
                        highlightDataSeries: true
                    }
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val + " peserta";
                        }
                    }
                },
                plotOptions: {
                    pie: {
                        donut: {
                            labels: {
                                show: true,
                                total: {
                                    show: true,
                                    label: 'Total',
                                    formatter: function(w) {
                                        return w.globals.seriesTotals.reduce((a, b) => {
                                            return a + b
                                        }, 0) + ' peserta'
                                    }
                                }
                            }
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

            window.chartJenisPendaftaran = new ApexCharts(document.querySelector("#chart-jenis-pendaftaran"), optionsJenisPendaftaran);
            window.chartJenisPendaftaran.render();

            window.chartJenisPendaftaran.addEventListener('legendItemClick', function(event, chartContext, config) {
                const category = data.jenis_pendaftaran.categories[config.seriesIndex];
                const total = data.jenis_pendaftaran.total[config.seriesIndex];
                alert(`Kategori: ${category}\nTotal: ${total} peserta`);
            });
        }
    }
    </script>
