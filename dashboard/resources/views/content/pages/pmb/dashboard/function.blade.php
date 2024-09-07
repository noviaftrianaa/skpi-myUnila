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
    <script src="{{ asset('assets/js/forms-selects.js') }}"></script>

    @include('content.pages.pmb.dashboard.chart.status-lulus')
    @include('content.pages.pmb.dashboard.chart.kategori-usia')

    <script type="text/javascript">
        'use strict';

        $(document).ready(function () {
            function fetchDataByYear(year) {
                $('#loading').show();

                $.ajax({
                    url: '{{ route("pages-pmb-data") }}',
                    type: 'GET',
                    data: { tahun: year },
                    success: function (data) {
                        $('#loading').hide();
                        renderStatusChart(data);
                        renderAgeChart(data);
                    },
                    error: function (xhr, status, error) {
                        console.error('Error fetching data:', error);
                        $('#loading').hide();
                    }
                });
            }

            const initialYear = $('#periodeTahun').val();
            fetchDataByYear(initialYear);

            $('#periodeTahun').change(function () {
                const selectedYear = $(this).val();
                fetchDataByYear(selectedYear);
            });
        });
    </script>
@endsection
