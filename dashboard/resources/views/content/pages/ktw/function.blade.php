@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/apex-charts/apex-charts.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/loading/overlay.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/select2/select2.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/jquery-sticky/jquery-sticky.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/moment/moment.js') }}"></script>
@endsection

@section('page-script')
    <script type="text/javascript">
        'use strict';

        function setOptions(category, tepatWaktu, tidakTepatWaktu, title) {
            var options = {
                chart: {
                    height: '400',
                    type: "line",
                    stacked: false
                },
                dataLabels: {
                    enabled: false
                },
                title: {
                    text: title,
                    align: "center"
                },
                colors: ['#0d6efd', '#dd4b39'],
                series: [

                    {
                        name: 'Tepat Waktu',
                        type: 'column',
                        data: tepatWaktu
                    },
                    {
                        name: "Tidak Tepat Waktu",
                        type: 'column',
                        data: tidakTepatWaktu
                    }
                ],
                plotOptions: {
                    bar: {
                        columnWidth: "50%"
                    }
                },
                xaxis: {
                    categories: category
                },
                tooltip: {
                    shared: false,
                    intersect: true,
                    x: {
                        show: false
                    }
                },
                legend: {
                    horizontalAlign: "center",
                    offsetX: 40
                }
            };
            return options;
        }

        function ajaxChart() {
            $.ajax({
                url: "{{ route('pages-ktw-data') }}",
                type: "GET",
                data: {
                    tahun: $('#tahun').val(),
                    id_sms: $('#sms').val()
                },
                success: function(res) {

                    var options = setOptions(res['smt'], res['studi']['ktw_tepat'], res['studi'][
                        'ktw_tidak_tepat'
                    ], 'Berdasarkan Masa Studi Ideal')
                    var chart = new ApexCharts(document.querySelector("#studiChart"), options);
                    chart.render();

                    var options = setOptions(res['smt'], res['ipk']['ktw_tepat'], res['ipk'][
                        'ktw_tidak_tepat'
                    ], 'Berdasarkan Masa Studi Ideal dan IPK >= 3.00')
                    var chart = new ApexCharts(document.querySelector("#ipkChart"), options);
                    chart.render();

                    $('#loading').hide();

                }
            });
        }

        function dateAgo(start, end) {
            var startDate = new Date(start);
            var diffDate = new Date(new Date(end) - startDate);
            return ((diffDate.toISOString().slice(0, 4) - 1970) + " Tahun " +
                diffDate.getMonth() + " Bulan " + (diffDate.getDate() - 1) + " Hari");
        }

        $(document).ready(function() {

            $('select').select2();

            ajaxChart();

            $('#tahun').on('change', function() {
                $('#loading').show();
                $('#studiChart').html(null);
                $('#ipkChart').html(null);
                ajaxChart();
            });

            $('#sms').on('change', function() {
                $('#loading').show();
                $('#studiChart').html(null);
                $('#ipkChart').html(null);
                ajaxChart();
            });
        });
    </script>
@endsection
