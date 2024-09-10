<script type="text/javascript">
    function renderLulusFakultasChart(data) {
        var lulusFakultasData = {
            categories: data.lulus_fakultas.categories,
            total: data.lulus_fakultas.total
        };

        const randomColors = generateRandomColors(lulusFakultasData.categories.length);

        if (window.chartLulusFakultas) {
            window.chartLulusFakultas.updateOptions({
                xaxis: {
                    categories: lulusFakultasData.categories
                },
                series: [
                    {
                        name: 'Jumlah Peseta Lulus',
                        data: lulusFakultasData.total
                    }
                ]
            });
        } else {
            var optionsLulusFakultas = {
                chart: {
                    type: 'bar',
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
                                filename: 'fakultas',
                                columnDelimiter: ',',
                                headerCategory: 'Fakultas',
                                headerValue: 'Total',
                            },
                            svg: {
                                filename: 'fakultas'
                            },
                            png: {
                                filename: 'fakultas'
                            }
                        }
                    },
                },
                title: {
                    text: 'Jumlah Peserta Lulus per Fakultas',
                    align: "center"
                },
                xaxis: {
                    categories: lulusFakultasData.categories,
                    labels: {
                        rotate: 0
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        dataLabels: {
                            position: 'top'
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        colors: ['#000']
                    },
                    offsetX: 30,
                },
                colors: randomColors,
                series: [
                    {
                        name: 'Jumlah Peserta Lulus',
                        data: lulusFakultasData.total
                    }
                ],
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val + " peserta";
                        }
                    }
                }
            };

            window.chartLulusFakultas = new ApexCharts(document.querySelector("#chart-lulus-fakultas"), optionsLulusFakultas);
            window.chartLulusFakultas.render();
        }
    }
</script>
