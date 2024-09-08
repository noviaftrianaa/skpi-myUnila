<script type="text/javascript">
    function renderTopProdiChart(data) {
        var topProdiData = {
            categories: data.top_prodi.categories,
            total: data.top_prodi.total
        };

        const randomColors = generateRandomColors(topProdiData.categories.length);

        if (window.chartTopProdi) {
            window.chartTopProdi.updateOptions({
                xaxis: {
                    categories: topProdiData.categories
                },
                series: [
                    {
                        name: 'Jumlah Lulus',
                        data: topProdiData.total
                    }
                ]
            });
        } else {
            var optionsTopProdi = {
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
                                filename: 'prodi',
                                columnDelimiter: ',',
                                headerCategory: 'Program Studi',
                                headerValue: 'Total',
                            },
                            svg: {
                                filename: 'prodi'
                            },
                            png: {
                                filename: 'prodi'
                            }
                        }
                    },
                },
                title: {
                    text: 'Top 10 Prodi Minat Tebanyak',
                    align: "center"
                },
                xaxis: {
                    categories: topProdiData.categories,
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
                    offsetX: 20,
                },
                colors: randomColors,
                series: [
                    {
                        name: 'Jumlah Lulus',
                        data: topProdiData.total
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

            window.chartTopProdi = new ApexCharts(document.querySelector("#chart-top-prodi"), optionsTopProdi);
            window.chartTopProdi.render();
        }
    }
</script>
