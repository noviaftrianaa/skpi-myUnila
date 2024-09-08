@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/apex-charts/apex-charts.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/loading/overlay.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/select2/select2.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <style>

    #chart-total-penerimaan,
    #chart-jenis-pendaftaran,
    #chart-kategori-usia
    #chart-jenis-kelamin
    #chart-fakultas-prodi
    #chart-top-prodi
    #chart-nilai-utbk
    #chart-nilai-wawancara
    {
        height: 400px;
    }
    .card-shadow {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Bayangan lembut */
        transition: box-shadow 0.3s ease-in-out;
    }
    .card-shadow:hover {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3); /* Bayangan lebih dalam saat hover */
    }
    .custom-title {
        font-family: 'Helvetica, Arial, sans-serif';
        font-size: 18px;
        font-weight: 900;
        color: #373d3f;
        text-align: center;
        margin-bottom: 20px;
    }

    </style>
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/jquery-sticky/jquery-sticky.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/moment/moment.js') }}"></script>
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
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
    @include('content.pages.pmb.dashboard.chart.sebaran-wilayah')

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
                        renderSebaranWilayah(data);
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
