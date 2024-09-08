@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/apex-charts/apex-charts.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/loading/overlay.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/select2/select2.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
    <style>

    #chart-total-penerimaan,
    #chart-jenis-pendaftaran,
    #chart-kategori-usia {
        height: 400px;
    }

    </style>
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

    @include('content.pages.pmb.dashboard.chart.random-color')
    @include('content.pages.pmb.dashboard.chart.total-penerimaan')
    @include('content.pages.pmb.dashboard.chart.jenis-pendaftaran')
    @include('content.pages.pmb.dashboard.chart.kategori-usia')
    @include('content.pages.pmb.dashboard.chart.jenis-kelamin')
    @include('content.pages.pmb.dashboard.chart.fakultas-prodi')
    @include('content.pages.pmb.dashboard.chart.top-prodi')
    @include('content.pages.pmb.dashboard.chart.kategori-nilai')

    <script type="text/javascript">
        'use strict';

        $(document).ready(function () {
            function fetchData(year) {
                $('#loading').show();

                $.ajax({
                    url: '{{ route("pages-pmb-data") }}',
                    type: 'GET',
                    data: { tahun: year },
                    success: function (data) {
                        $('#loading').hide();
                        renderStatusChart(data);
                        renderJenisPendaftaranChart(data);
                        renderKategoriUsiaChart(data);
                        renderJenisKelaminChart(data);
                        renderFakultasChart(data);
                        renderTopProdiChart(data);
                        renderNilaiChart(data);
                    },
                    error: function (xhr, status, error) {
                        console.error('Error fetching data:', error);
                        $('#loading').hide();
                    }
                });
            }

            const initialYear = $('#periodeTahun').val();
            fetchData(initialYear);

            $('#periodeTahun').change(function () {
                const selectedYear = $(this).val();
                fetchData(selectedYear);
            });
        });
    </script>
@endsection
