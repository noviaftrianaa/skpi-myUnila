<script type="text/javascript">
    function renderAgeChart(data) {
        var ageData = {
            categories: data.age.categories,
            total: data.age.total
        };

        var combinedData = ageData.categories.map(function(category, index) {
            return { category: category, total: ageData.total[index] };
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

        var optionsAge = {
            chart: {
                type: 'bar',
                height: 400
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
            colors: ['#17a2b8'],
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

        var chartAge = new ApexCharts(document.querySelector("#chart-age"), optionsAge);
        chartAge.render();
    }
</script>
