<script type="text/javascript">
    function renderStatusChart(data) {
        var optionsStatus = {
            chart: {
                type: 'bar',
                height: 400,
                stacked: false
            },
            title: {
                text: 'Total Penerimaan',
                align: "center"
            },
            xaxis: {
                categories: data.status.categories,
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
            colors: ['#28a745', '#dd4b39'],
            series: [
                {
                    name: 'Lulus',
                    type: 'column',
                    data: data.status.lulus
                },
                {
                    name: 'Tidak Lulus',
                    type: 'column',
                    data: data.status.tidak_lulus
                }
            ],
            tooltip: {
                shared: false,
                intersect: true,
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const year = w.config.xaxis.categories[dataPointIndex];
                    const lulus = Number(w.config.series[0].data[dataPointIndex]);
                    const tidakLulus = Number(w.config.series[1].data[dataPointIndex]);
                    const total = lulus + tidakLulus;

                    return '<div style="padding: 10px; border-radius: 5px;">' +
                        '<div style="font-weight: bold; padding-bottom: 5px;">' + year + '</div>' +
                        '<div style="padding-bottom: 5px;">Lulus: ' + lulus.toLocaleString() + ' peserta</div>' +
                        '<div style="padding-bottom: 5px;">Tidak Lulus: ' + tidakLulus.toLocaleString() + ' peserta</div>' +
                        '<div>Total: ' + total.toLocaleString() + ' peserta</div>' +
                        '</div>';
                }
            },
            legend: {
                horizontalAlign: "center",
                offsetX: 40
            }
        };

        var chartStatus = new ApexCharts(document.querySelector("#chart-status"), optionsStatus);
        chartStatus.render();
    }
</script>
