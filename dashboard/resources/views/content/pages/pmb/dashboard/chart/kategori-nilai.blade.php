<script type="text/javascript">
    function renderNilaiChart(data) {
        // Fungsi untuk menggabungkan data berdasarkan kategori
        const combineCategoryData = (data) => {
            const combinedData = {};

            data.forEach(item => {
                // Ubah nilai peserta ke angka jika masih dalam bentuk string
                const totalPeserta = parseInt(item.total_peserta, 10);

                if (!combinedData[item.kategori_nilai]) {
                    combinedData[item.kategori_nilai] = 0;
                }

                // Pastikan menambahkan hanya jika totalPeserta adalah angka valid
                if (!isNaN(totalPeserta)) {
                    combinedData[item.kategori_nilai] += totalPeserta;
                }
            });

            const categories = Object.keys(combinedData);
            const totals = Object.values(combinedData);

            console.log('Categories:', categories);
            console.log('Totals:', totals);

            return { categories, totals };
        };

        // Mengambil data per kategori
        const utbkData = combineCategoryData(data.kategori_nilai.utbk);
        const wawancaraData = combineCategoryData(data.kategori_nilai.wawancara);

        // Konfigurasi chart UTBK
        const randomColorsUTBK = generateRandomColors(utbkData.categories.length);
        const optionsNilaiUTBK = {
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
                            filename: 'nilai_utbk',
                            columnDelimiter: ',',
                            headerCategory: 'Kategori',
                            headerValue: 'Total',
                        },
                        svg: {
                            filename: 'nilai_utbk'
                        },
                        png: {
                            filename: 'nilai_utbk'
                        }
                    }
                },
            },
            title: {
                text: 'Perbandingan Nilai Peserta UTBK',
                align: "center"
            },
            xaxis: {
                categories: utbkData.categories
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    dataLabels: { position: 'top' }
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#000']
                },
                offsetY: -20,
            },
            colors: randomColorsUTBK,
            series: [
                {
                    name: 'Total Peserta UTBK',
                    data: utbkData.totals
                }
            ],
            tooltip: {
                    shared: false,
                    intersect: true,
                    custom: function({ series, seriesIndex, dataPointIndex, w }) {
                        const year = w.config.xaxis.categories[dataPointIndex];
                        const totalPeserta = Number(w.config.series[0].data[dataPointIndex]);

                        // Tambahkan data rata-rata nilai
                        const rataRataNilai = data.rata_rata_nilai;

                        return '<div style="padding: 10px; border-radius: 5px;">' +
                            '<div style="font-weight: bold; padding-bottom: 5px;">' + year + '</div>' +
                            '<div style="padding-bottom: 5px;">Total Peserta: ' + totalPeserta.toLocaleString() + '</div>' +
                            '<div style="padding-top: 10px; border-top: 1px solid #ccc;">' +
                            '<div>Max Nilai UTBK: ' + rataRataNilai.max_nilai_utbk + '</div>' +
                            '<div>Avg Nilai UTBK: ' + rataRataNilai.avg_nilai_utbk + '</div>' +
                            '<div>Min Nilai UTBK: ' + rataRataNilai.min_nilai_utbk + '</div>' +
                            '</div>' +
                            '</div>';
                    }
                },
        };

        if (window.chartNilaiUTBK) {
            window.chartNilaiUTBK.updateOptions(optionsNilaiUTBK);
        } else {
            window.chartNilaiUTBK = new ApexCharts(document.querySelector("#chart-nilai-utbk"), optionsNilaiUTBK);
            window.chartNilaiUTBK.render();
        }

        // Konfigurasi chart Wawancara (hampir sama dengan UTBK)
        const randomColorsWawancara = generateRandomColors(wawancaraData.categories.length);
        const optionsNilaiWawancara = {
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
                            filename: 'nilai_wawancara',
                            columnDelimiter: ',',
                            headerCategory: 'Kategori',
                            headerValue: 'Total',
                        },
                        svg: {
                            filename: 'nilai_wawancara'
                        },
                        png: {
                            filename: 'nilai_wawancara'
                        }
                    }
                },
            },
            title: {
                text: 'Perbandingan Nilai Peserta Wawancara',
                align: "center"
            },
            xaxis: {
                categories: wawancaraData.categories
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    dataLabels: { position: 'top' }
                }
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#000']
                },
                offsetY: -20,
            },
            colors: randomColorsWawancara,
            series: [
                {
                    name: 'Total Peserta Wawancara',
                    data: wawancaraData.totals
                }
            ],
            tooltip: {
                    shared: false,
                    intersect: true,
                    custom: function({ series, seriesIndex, dataPointIndex, w }) {
                        const year = w.config.xaxis.categories[dataPointIndex];
                        const totalPeserta = Number(w.config.series[0].data[dataPointIndex]);

                        // Tambahkan data rata-rata nilai
                        const rataRataNilai = data.rata_rata_nilai;

                        return '<div style="padding: 10px; border-radius: 5px;">' +
                            '<div style="font-weight: bold; padding-bottom: 5px;">' + year + '</div>' +
                            '<div style="padding-bottom: 5px;">Total Peserta: ' + totalPeserta.toLocaleString() + '</div>' +
                            '<div style="padding-top: 10px; border-top: 1px solid #ccc;">' +
                            '<div>Max Nilai Wawancara: ' + rataRataNilai.max_nilai_wawancara + '</div>' +
                            '<div>Avg Nilai Wawancara: ' + rataRataNilai.avg_nilai_wawancara + '</div>' +
                            '<div>Min Nilai Wawancara: ' + rataRataNilai.min_nilai_wawancara + '</div>' +
                            '</div>' +
                            '</div>';
                    }
                },
        };

        if (window.chartNilaiWawancara) {
            window.chartNilaiWawancara.updateOptions(optionsNilaiWawancara);
        } else {
            window.chartNilaiWawancara = new ApexCharts(document.querySelector("#chart-nilai-wawancara"), optionsNilaiWawancara);
            window.chartNilaiWawancara.render();
        }
    }
</script>
