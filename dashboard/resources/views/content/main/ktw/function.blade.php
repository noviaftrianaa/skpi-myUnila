@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/apex-charts/apex-charts.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/loading/overlay.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/select2/select2.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/jquery-sticky/jquery-sticky.js') }}"></script>
    <script src="{{ asset('js/datatables.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/moment/moment.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('assets/js/forms-selects.js') }}"></script>
    <script src="{{ asset('assets/js/form-layouts.js') }}"></script>
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
                url: "{{ route('main-ktw-data') }}",
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

        function datatables() {
            return $('#table-data').DataTable({
                "bDestroy": true,
                processing: true,
                serverSide: true,
                pageLength: 50,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
                    "info": "Menampilkan _START_ sampai _END_ dari _TOTAL_ total data",
                    "infoEmpty": "Tidak ada yang ditampilkan",
                    "infoFiltered": "(Terfilter dari  _MAX_ total entitas)",
                    "infoPostFix": "",
                    "thousands": ",",
                    "lengthMenu": "Menampilkan _MENU_ entitas",
                    "loadingRecords": "Loading...",
                    "processing": "Sedang dalam proses...",
                    "search": "Pencarian:",
                    "zeroRecords": "Tidak ada data yang cocok",
                    "paginate": {
                        "first": "Pertama",
                        "last": "Terakhir",
                        "next": "Selanjutnya",
                        "previous": "Sebelumnya"
                    },
                    "aria": {
                        "sortAscending": ": activate to sort column ascending",
                        "sortDescending": ": activate to sort column descending"
                    }
                },
                ajax: {
                    url: "{{ route('main-ktw-data') }}",
                    data: {
                        tahun: $('#tahun').val(),
                        id_sms: $('#sms').val(),
                        table: true,
                    }
                },
                order: [
                    [9, 'DESC'],
                    [2, 'ASC'],
                    [1, 'ASC'],
                ],
                "columns": [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        title: 'No.',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_pd',
                        title: 'Mahasiswa',
                    },
                    {
                        data: 'prodi',
                        title: 'Prodi',
                        render: function(data, type, row) {
                            return `${data} (${row.jenjang})`;
                        }
                    },
                    {
                        data: 'sks_lulus',
                        title: 'SKS Lulus',
                        width: '5px',
                        className: 'text-center',
                    },
                    {
                        data: 'sks_total',
                        title: 'SKS Diambil',
                        width: '5px',
                        className: 'text-center',
                    },
                    {
                        data: 'ipk',
                        title: 'IPK',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'tgl_masuk',
                        title: 'Tgl Masuk',
                        className: 'text-center',
                    },
                    {
                        data: 'tgl_keluar',
                        title: 'Tgl Lulus',
                        className: 'text-center'
                    },
                    {
                        data: 'thn_kuliah',
                        title: 'Lama Studi (Tahun)',
                        className: 'text-center',
                        render: function(data, type, row) {
                            return dateAgo(row.tgl_masuk, row.tgl_keluar);
                        }
                    },
                    {
                        data: 'status',
                        title: 'KTW',
                        width: '5px',
                        className: 'text-center',
                        render: function(data, type, row) {
                            return data == 1 ? `<span class="badge bg-primary">Ya</span>` :
                                `<span class="badge bg-danger">Tidak</span>`;
                        }
                    },
                ],
            });
        }

        $(document).ready(function() {
            $( 'select' ).wrap('<div class="position-relative"></div>').select2( {
                width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
            } );

            let tahun = <?php echo json_encode($tahun); ?>;
            let auth = "{{ auth()->check() }}";
            ajaxChart();

            let table = datatables();

            $('#tahun').on('change', function() {
                $('#loading').show();
                $('#studiChart').html(null);
                $('#ipkChart').html(null);
                ajaxChart();

                $('#table-data').DataTable().clear().destroy();
                table = datatables();
            });

            $('#sms').on('change', function() {
                $('#loading').show();
                $('#studiChart').html(null);
                $('#ipkChart').html(null);
                ajaxChart();

                $('#table-data').DataTable().clear().destroy();
                table = datatables();
            });
        });
    </script>
@endsection
