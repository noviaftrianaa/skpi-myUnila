<script type="text/javascript">
    function renderFakultasChart(data) {
        var fakultasData = {
            categories: data.fakultas.categories,
            total: data.fakultas.total
        };

        const randomColors = generateRandomColors(fakultasData.categories.length);

        if (window.chartFakultas) {
            window.chartFakultas.updateOptions({
                xaxis: {
                    categories: fakultasData.categories
                },
                series: [
                    {
                        name: 'Jumlah Lulus',
                        data: fakultasData.total
                    }
                ]
            });
        } else {
            var optionsFakultas = {
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
                    text: 'Jumlah Lulus per Fakultas',
                    align: "center"
                },
                xaxis: {
                    categories: fakultasData.categories,
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
                        name: 'Jumlah Lulus',
                        data: fakultasData.total
                    }
                ],
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return val + " peserta";
                        }
                    }
                },
            };

            window.chartFakultas = new ApexCharts(document.querySelector("#chart-fakultas-prodi"), optionsFakultas);
            window.chartFakultas.render();
        }
    }
</script>
