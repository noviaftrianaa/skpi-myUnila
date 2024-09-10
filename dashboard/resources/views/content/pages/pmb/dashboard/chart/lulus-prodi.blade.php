<script type="text/javascript">
    function renderLulusProdiChart(data) {
        var lulusProdiData = {
            categories: data.lulus_prodi.categories,
            total: data.lulus_prodi.total
        };

        const randomColors = generateRandomColors(lulusProdiData.categories.length);

        if (window.chartLulusProdi) {
            window.chartLulusProdi.updateOptions({
                xaxis: {
                    categories: lulusProdiData.categories
                },
                series: [
                    {
                        name: 'Jumlah Peserta Lulus',
                        data: lulusProdiData.total
                    }
                ]
            });
        } else {
            var optionsLulusProdi = {
                chart: {
                    type: 'bar',
                    height: lulusProdiData.categories.length * 30,
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
                    parentHeightOffset: 0
                },
                title: {
                    text: 'Jumlah Peserta Lulus per Prodi',
                    align: "center"
                },
                xaxis: {
                    categories: lulusProdiData.categories,
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
                        name: 'Jumlah Peserta Lulus',
                        data: lulusProdiData.total
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

            window.chartLulusProdi = new ApexCharts(document.querySelector("#chart-lulus-prodi"), optionsLulusProdi);
            window.chartLulusProdi.render();
        }
    }
</script>
