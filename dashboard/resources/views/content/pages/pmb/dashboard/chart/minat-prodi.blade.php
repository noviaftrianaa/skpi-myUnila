<script type="text/javascript">
    function renderMinatProdiChart(data) {

        const saintekCategories = data.minat_prodi.saintek.categories;
        const saintekTotals = data.minat_prodi.saintek.total;

        const soshumCategories = data.minat_prodi.soshum.categories;
        const soshumTotals = data.minat_prodi.soshum.total;

        const randomColorsSaintek = generateRandomColors(saintekCategories.length);
        const randomColorsSoshum = generateRandomColors(soshumCategories.length);

        const optionsMinatSaintek = {
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
                            filename: 'minat_prodi_saintek',
                            columnDelimiter: ',',
                            headerCategory: 'Prodi',
                            headerValue: 'Total',
                        },
                        svg: {
                            filename: 'minat_prodi_saintek'
                        },
                        png: {
                            filename: 'minat_prodi_saintek'
                        }
                    }
                },
            },
            title: {
                text: '10 Prodi SAINTEK dengan Pendaftar Terbanyak',
                align: "center"
            },
            xaxis: {
                categories: saintekCategories
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: { position: 'top' }
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#000']
                },
                offsetX: 30,
            },
            colors: randomColorsSaintek,
            series: [
                {
                    name: 'Jumlah Peminat',
                    data: saintekTotals
                }
            ]
        };

        if (window.chartMinatSaintek) {
            window.chartMinatSaintek.updateOptions(optionsMinatSaintek);
        } else {
            window.chartMinatSaintek = new ApexCharts(document.querySelector("#chart-minat-saintek"), optionsMinatSaintek);
            window.chartMinatSaintek.render();
        }

        const optionsMinatSoshum = {
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
                            filename: 'minat_prodi_soshum',
                            columnDelimiter: ',',
                            headerCategory: 'Prodi',
                            headerValue: 'Total',
                        },
                        svg: {
                            filename: 'minat_prodi_soshum'
                        },
                        png: {
                            filename: 'minat_prodi_soshum'
                        }
                    }
                },
            },
            title: {
                text: '10 Prodi SOSHUM dengan Pendaftar Terbanyak',
                align: "center"
            },
            xaxis: {
                categories: soshumCategories
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    dataLabels: { position: 'top' }
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#000']
                },
                offsetX: 30,
            },
            colors: randomColorsSoshum,
            series: [
                {
                    name: 'Jumlah Peminat',
                    data: soshumTotals
                }
            ]
        };

        if (window.chartMinatSoshum) {
            window.chartMinatSoshum.updateOptions(optionsMinatSoshum);
        } else {
            window.chartMinatSoshum = new ApexCharts(document.querySelector("#chart-minat-soshum"), optionsMinatSoshum);
            window.chartMinatSoshum.render();
        }
    }

</script>
