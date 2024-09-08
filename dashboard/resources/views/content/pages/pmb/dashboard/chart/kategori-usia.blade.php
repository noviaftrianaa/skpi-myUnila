<script type="text/javascript">
    function renderKategoriUsiaChart(data) {
        var usiaData = {
            categories: data.kategori_usia.categories,
            total: data.kategori_usia.total
        };

        var combinedData = usiaData.categories.map(function(category, index) {
            return { category: category, total: usiaData.total[index] };
        });

        combinedData.sort(function(a, b) {
            var order = ['15-17', '18-19', '20-21', '> 21'];
            return order.indexOf(a.category) - order.indexOf(b.category);
        });

        var sortedCategories = combinedData.map(function(item) {
            return item.category;
        });
        var sortedTotals = combinedData.map(function(item) {
            return item.total;
        });
        const randomColors = generateRandomColors(data.kategori_usia.categories.length);

        if (window.chartUsia) {
            window.chartUsia.updateOptions({
                xaxis: {
                    categories: sortedCategories
                },
                series: [
                    {
                        name: 'Jumlah',
                        data: sortedTotals
                    }
                ]
            });
        } else {
            var optionsAge = {
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
                                filename: 'kategori_usia',
                                columnDelimiter: ',',
                                headerCategory: 'Kategori',
                                headerValue: 'Total',
                            },
                            svg: {
                                filename: 'kategori_usia'
                            },
                            png: {
                                filename: 'kategori_usia'
                            }
                        }
                    },
                },
                title: {
                    text: 'Rata-Rata Usia',
                    align: "center"
                },
                xaxis: {
                    categories: sortedCategories,
                    labels: {
                        rotate: 0
                    }
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            position: 'top',
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        colors: ['#000']
                    },
                    offsetY: -20,
                },
                colors:randomColors,
                series: [
                    {
                        name: 'Jumlah',
                        data: sortedTotals
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

            window.chartUsia = new ApexCharts(document.querySelector("#chart-kategori-usia"), optionsAge);
            window.chartUsia.render();
        }
    }
</script>
