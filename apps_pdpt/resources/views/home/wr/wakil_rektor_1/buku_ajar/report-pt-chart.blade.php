@push('js')
    <script type="text/javascript">
        $(document).ready(function() {
            reloadChart();
        });

        var levelChart = 1;
        var selectedCategoryChart = '';
        var selectedFakultasChart = '';
        var selectedProdiChart = '';

        $("#chartBreadcrumb").on("click", "a", function(event) {
            nextLevel = this.getAttribute("data-nextlevel");
            previuslevel = this.getAttribute("data-previuslevel");
            levelCategory = this.getAttribute("data-category");

            if (nextLevel == 1) {
                reloadChart();
                $("#chartBreadcrumb").html('');
                setBreadcrumbsChart();
            } else if (previuslevel == 1 && levelCategory !== null) {
                reloadChart(levelCategory);
                $("#chartBreadcrumb").html('');
                setBreadcrumbsChart(levelCategory);
            }
        });

        function setBreadcrumbsChart(levelCategory) {
            var chartBreadcrumb =
                '<li class="breadcrumb-item"><a data-nextlevel="1">UNIVERSITAS LAMPUNG</a></li>';

            if ((levelChart == 2)) {
                chartBreadcrumb +=
                    '<li class="breadcrumb-item active"><a data-nextlevel="3" data-previuslevel="1" data-category="' +
                    levelCategory + '">' + levelCategory + '</a></li>';
            }

            if (levelChart == 3) {
                chartBreadcrumb +=
                    '<li class="breadcrumb-item active"><a data-nextlevel="4" data-previuslevel="2">FAKULTAS ' +
                    selectedFakultasChart + '</a></li>';
            }

            if (levelChart == 4) {
                chartBreadcrumb +=
                    '<li class="breadcrumb-item active"><a data-nextlevel="" data-previuslevel="3">PRODI ' +
                    selectedProdiChart + '</a></li>';
            }

            $("#chartBreadcrumb").html(chartBreadcrumb);
            $("#chartBreadcrumb").css('cursor', 'pointer');
        }

        function reloadChart(levelCategory = null, levelFakultas = null, levelProdi = null) {
            $('#overlayChart').show();

            if (levelCategory == null) {
                levelChart = 1;
                ajaxLevel().then((response) => generateChart(response.data.chartCategory, response.data.chartSeries));
                setBreadcrumbsChart();
            }
        }

        function generateChart(chartCategory, chartSeries) {
            Chart(chartCategory, chartSeries);
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

        function Chart(chartCategory, chartSeries) {
            $('#overlayChart').hide();
            Highcharts.chart('bodyChart', {
                chart: {
                    type: 'column'
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: `<b>BukuAjar</b>`,
                    align: 'center'
                },
                subtitle: {
                    text: 'Pada Tingkat Universitas Lampung'
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
                                        selectedFakultasChart = this.name;
                                        if (levelChart == 4) {
                                            return false;
                                        }
                                        if (levelChart == 3) {
                                            reloadChart(null, null, this.id);
                                        }
                                        if (levelChart == 2) {
                                            reloadChart(null, this.id);
                                        } else {
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

        async function ajaxLevel(level = 1) {
            let token = "{{ csrf_token() }}";
            const result = await $.ajax({
                type: "POST",
                dataType: "json",
                data: {
                    "_token": token,
                    "selectedYear": $('#thn_publikasi').val()
                },
                url: "{{ route('buku_ajar.chart') }}",
                async: true,
            }).done(function(data) {
                if (!data.isSuccess) {
                    alert('Terjadi Kesalahan Silahkan Reload Halaman Kembali!');
                    return false;
                }

                if (data.data.checkIfTotalBukuAjarIsEmpty == 0) {
                    $('#chartBody').hide();
                    $('#chartEmptyState').show();
                } else {
                    $('#chartBody').show();
                    $('#chartEmptyState').hide();
                }
            }).fail(function(data) {
                if (!data.status > 200) {
                    alert('Terjadi Kesalahan Silahkan Reload Halaman Kembali!');
                    return false;
                }
            });

            return result;
        }
    </script>
@endpush
