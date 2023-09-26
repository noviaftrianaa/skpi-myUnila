@push('js')
    <script type="text/javascript">
        $(document).ready(function() {
            reloadChart();
        });

        var levelChart = 1;
        var selectedCategoryId = '';
        var selectedCategoryChart = '';
        var selectedFakultasChart = '';
        var selectedProdiChart = '';

        $("#chartBreadcrumb").on("click", "a", function(event) {
            nextLevel = this.getAttribute("data-nextlevel");
            previouslevel = this.getAttribute("data-previouslevel");
            levelCategory = this.getAttribute("data-category");

            if (nextLevel == 1) {
                reloadChart();
                $("#chartBreadcrumb").html('');
                setBreadcrumbsChart();
            } else if (previouslevel == 1 && levelCategory !== null) {
                reloadChart(levelCategory);
                $("#chartBreadcrumb").html('');
                setBreadcrumbsChart(levelCategory);
            }
        });

        function setBreadcrumbsChart(levelCategory) {
            var chartBreadcrumb =
                '<li class="breadcrumb-item"><a data-nextlevel="1">UNIVERSITAS LAMPUNG</a></li>';

            if ((levelChart == 2 || levelChart == 3)) {
                chartBreadcrumb +=
                    '<li class="breadcrumb-item active"><a data-nextlevel="2" data-previouslevel="1" data-category="' +
                    levelCategory + '">' +
                    selectedCategoryChart.toUpperCase() + '</a></li>';
            }

            if (levelChart == 3) {
                chartBreadcrumb +=
                    '<li class="breadcrumb-item active"><a data-nextlevel="" data-previouslevel="2">' +
                    selectedFakultasChart.toUpperCase() + '</a></li>';
            }

            $("#chartBreadcrumb").html(chartBreadcrumb);
            $("#chartBreadcrumb").css('cursor', 'pointer');
        }

        function reloadChart(levelCategory = null, levelFakultas = null, levelProdi = null) {
            $('#overlayChart').show();

            if (levelCategory !== null) {
                levelChart = 2;
                selectedCategoryId = levelCategory;
                ajaxLevel(2, levelCategory).then((response) => generateChart(response.data.chartCategory, response.data
                    .chartSeries, response.data.chartMax));
                setBreadcrumbsChart(levelCategory);
            } else if (levelFakultas !== null) {
                levelChart = 3;
                ajaxLevel(3, null, levelFakultas).then((response) => generateChart(response.data.chartCategory, response
                    .data.chartSeries, response.data.chartMax));
                setBreadcrumbsChart(selectedCategoryId);
            } else {
                levelChart = 1;
                ajaxLevel().then((response) => generateChart(response.data.chartCategory, response.data.chartSeries, response.data.chartMax));
                setBreadcrumbsChart();
            }
        }

        function generateChart(chartCategory, chartSeries, chartMax) {
            Chart(chartCategory, chartSeries, chartMax);
            Tabel(chartSeries);
        }

        function Tabel(chartSeries) {
            let body = `
                <table class="table table-bordered tresults" id="resultTable">
                    <thead>
                        <tr>
                            <th rowspan="2" class="text-center">Deskripsi</th>
                            <th colspan="1" class="text-center">Tahun</th>
                        </tr>
                        <tr><th class="text-center">2022</th></tr>
                    </thead>
                    <tbody>
            `;

            $.each(chartSeries[0].data, function(index, value) {
                body += `
                    <tr>
                        <td>${value.name}</td>
                        <td class="text-center">${value.y}</td>
                    </tr>
                `;
            });

            body += `
                    </tbody>
                </table>
            `;

            $('#res').html(body);
        }

        function Chart(chartCategory, chartSeries, chartMax) {
            $('#overlayChart').hide();

            subtitle = 'Pada Tingkat Universitas Lampung';
            if (levelChart == 2) {
                subtitle = 'Pada Kategori ' + selectedCategoryChart;
            } else if(levelChart == 3) {
                subtitle = 'Pada Tingkat Fakultas ' + selectedFakultasChart;
            }

            Highcharts.chart('bodyChart', {
                chart: {
                    type: 'column',
                    zoomType: 'xy',
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: `<b>Penelitian</b>`,
                    align: 'center'
                },
                subtitle: {
                    text: subtitle
                },
                scrollbar: {
                    enabled: true,
                    barBackgroundColor: 'gray',
                    barBorderRadius: 7,
                    barBorderWidth: 0,
                    buttonBackgroundColor: 'gray',
                    buttonBorderWidth: 0,
                    buttonArrowColor: 'yellow',
                    buttonBorderRadius: 7,
                    rifleColor: 'yellow',
                    trackBackgroundColor: 'white',
                    trackBorderWidth: 1,
                    trackBorderColor: 'silver',
                    trackBorderRadius: 7
                },
                xAxis: [{
                    categories: chartCategory,
                    crosshair: false,
                    min: 0,
                    max: chartMax,
                }],
                yAxis: {
                    title: {
                        text: `<b>Total</b>`
                    }
                },
                legend: {
                    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || // theme
                        'rgba(255,255,255,0.25)'
                },
                tooltip: {
                    shared: true
                },
                plotOptions: {
                    column: {
                        grouping: false,
                        shadow: false,
                        borderWidth: 0
                    },
                    series: {
                        showInLegend: true,
                        turboThreshold: 0,
                        cursor: 'pointer',
                        shadow: false,
                        point: {
                            events: {
                                click: function(event) {
                                    if (this.id.indexOf('highcharts') == -1) {
                                        console.log(this.name, levelChart);
                                        if (levelChart == 3) {
                                            selectedFakultasChart = this.name;
                                            return false;
                                        }
                                        if (levelChart == 2) {
                                            selectedFakultasChart = this.name;
                                            reloadChart(null, this.id);
                                        } else {
                                            selectedCategoryChart = this.name;
                                            reloadChart(this.id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                series: chartSeries,
            });
        }

        async function ajaxLevel(level = 1, category = null, fakultas = null) {
            let token = "{{ csrf_token() }}";
            const result = await $.ajax({
                type: "POST",
                dataType: "json",
                data: {
                    "_token": token,
                    "selectedYear": $('#thn_penelitian').val(),
                    "levelCategory": category,
                    "levelFakultas": fakultas
                },
                url: "{{ route('litabmas.penelitian.chart') }}",
                async: true,
            }).done(function(data) {
                if (!data.isSuccess) {
                    alert('Terjadi Kesalahan Silahkan Reload Halaman Kembali!');
                    return false;
                }

                if (data.data.checkIfTotalPenelitianIsEmpty == 0) {
                    $('#chartBody').hide();
                    $('#chartEmptyState').show();
                } else {
                    $('#chartBody').show();
                    $('#chartEmptyState').hide();
                }
            }).fail(function(data) {
                if (data.status > 200) {
                    $('#overlayChart').hide();
                    alert('Terjadi Kesalahan Silahkan Reload Halaman Kembali!');
                    location.reload();
                }
            });

            return result;
        }
    </script>
@endpush
